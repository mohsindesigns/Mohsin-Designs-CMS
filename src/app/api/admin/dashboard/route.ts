import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Page from '@/models/Page';
import User from '@/models/User';
import ActivityLog from '@/models/ActivityLog';
import Submission from '@/models/Submission';
import { getSessionUser } from '@/lib/rbac';

// Short in-memory cache to avoid hammering MongoDB on repeated rapid navigation
let cachedDashboard: { data: any; expiresAt: number } | null = null;
const CACHE_TTL_MS = 5000; // 5 seconds

export async function GET(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = Date.now();
  if (cachedDashboard && cachedDashboard.expiresAt > now) {
    return NextResponse.json(cachedDashboard.data);
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

    return NextResponse.json(result);
  } catch (err) {
    console.error('Dashboard API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
