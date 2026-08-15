import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Page from '@/models/Page';
import User from '@/models/User';
import ActivityLog from '@/models/ActivityLog';
import Submission from '@/models/Submission';
import { hasPermission } from '@/lib/rbac';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  if (!(await hasPermission(req, 'pages', 'read'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await connectToDatabase();

    // Run all counts in parallel
    const [
      pageCount,
      userCount,
      submissionCount,
      recentLogs,
      recentSubmissions,
    ] = await Promise.all([
      Page.countDocuments({}),
      User.countDocuments({}),
      Submission.countDocuments({}),
      ActivityLog.find({})
        .sort({ timestamp: -1 })
        .limit(8)
        .select('userName action entity entityId timestamp status'),
      Submission.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email type createdAt'),
    ]);

    // Count new submissions in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newSubmissions = await Submission.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    return NextResponse.json({
      stats: {
        pages: pageCount,
        users: userCount,
        submissions: submissionCount,
        newSubmissions,
      },
      recentLogs,
      recentSubmissions,
    });
  } catch (err) {
    console.error('Dashboard API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
