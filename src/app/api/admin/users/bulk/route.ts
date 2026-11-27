import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { hasPermission, getSessionUser } from '@/lib/rbac';
import { recordActivity } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { ids, action } = await req.json();
    if (!(await hasPermission(req, 'users', action === 'delete' ? 'delete' : 'update'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    await connectToDatabase();

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 });
    }

    if (action === 'delete') {
      // Don't allow deleting self in bulk
      const filteredIds = ids.filter(id => id !== (session as any).userId);
      
      const result = await User.deleteMany({ _id: { $in: filteredIds } });

      await recordActivity({
        user: (session as any).userId,
        userName: (session as any).username,
        action: 'BULK_DELETE_USERS',
        entity: 'User',
        details: { count: result.deletedCount, ids: filteredIds },
        ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
      });

      return NextResponse.json({ success: true, count: result.deletedCount });
    }

    if (action === 'activate' || action === 'deactivate') {
        const status = action === 'activate' ? 'active' : 'inactive';
        const targetIds = action === 'deactivate' ? ids.filter(id => id !== (session as any).userId) : ids;
        const update: any = action === 'deactivate' ? { status, $inc: { tokenVersion: 1 } } : { status };
        const result = await User.updateMany({ _id: { $in: targetIds } }, update);

        await recordActivity({
            user: (session as any).userId,
            userName: (session as any).username,
            action: `BULK_${action.toUpperCase()}_USERS`,
            entity: 'User',
            details: { count: result.modifiedCount, ids: targetIds },
            ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
        });

        return NextResponse.json({ success: true, count: result.modifiedCount });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
