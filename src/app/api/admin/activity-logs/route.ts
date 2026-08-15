import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ActivityLog from '@/models/ActivityLog';
import { hasPermission } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  if (!(await hasPermission(req, 'logs', 'read'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const user = searchParams.get('user');
  const action = searchParams.get('action');
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '50');
  const page = parseInt(searchParams.get('page') || '1');

  try {
    await connectToDatabase();
    
    let query: any = {};
    if (user) query.userName = { $regex: user, $options: 'i' };
    if (action) query.action = action;
    if (status) query.status = status;

    const logs = await ActivityLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await ActivityLog.countDocuments(query);

    return NextResponse.json({ logs, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
