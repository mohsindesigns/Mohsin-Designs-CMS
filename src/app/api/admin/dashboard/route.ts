import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Page from '@/models/Page';
import User from '@/models/User';
import ActivityLog from '@/models/ActivityLog';
import Submission from '@/models/Submission';
import { getSessionUser, getPermissions, checkPermission } from '@/lib/rbac';

// Short in-memory cache to avoid hammering MongoDB on repeated rapid navigation
let cachedDashboard: { data: any; expiresAt: number } | null = null;
const CACHE_TTL_MS = 5000; // 5 seconds

export async function GET(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let permissions: Record<string, any> | null;
  try {
    permissions = await getPermissions(req);
  } catch {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
  const canSubs = checkPermission(permissions, 'submissions', 'read');
  const canLogs = checkPermission(permissions, 'logs', 'read');
  const filterForRole = (data: any) => ({
    stats: {
      pages: data.stats.pages,
      users: data.stats.users,
      submissions: canSubs ? data.stats.submissions : 0,
      newSubmissions: canSubs ? data.stats.newSubmissions : 0,
    },
    recentLogs: canLogs ? data.recentLogs : [],
    recentSubmissions: canSubs ? data.recentSubmissions : [],
  });

  const now = Date.now();
  if (cachedDashboard && cachedDashboard.expiresAt > now) {
    return NextResponse.json(filterForRole(cachedDashboard.data));
  }

  try {
    await connectToDatabase();

    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    // Run all 6 queries strictly in parallel
    const [
      pageCount,
      userCount,
      submissionCount,
      newSubmissions,
      recentLogs,
      recentSubmissions,
    ] = await Promise.all([
      Page.countDocuments({ isTrashed: { $ne: true } }),
      User.countDocuments({}),
      Submission.countDocuments({}),
      Submission.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      ActivityLog.find({})
        .sort({ timestamp: -1 })
        .limit(8)
        .select('_id userName action entity entityId timestamp status')
        .lean(),
      Submission.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('_id name email type createdAt')
        .lean(),
    ]);

    const result = {
      stats: {
        pages: pageCount,
        users: userCount,
        submissions: submissionCount,
        newSubmissions,
      },
      recentLogs: recentLogs || [],
      recentSubmissions: recentSubmissions || [],
    };

    cachedDashboard = {
      data: result,
      expiresAt: now + CACHE_TTL_MS,
    };

    return NextResponse.json(filterForRole(result));
  } catch (err) {
    console.error('Dashboard API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
