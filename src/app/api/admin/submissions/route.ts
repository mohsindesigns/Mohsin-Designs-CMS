import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Submission from '@/models/Submission';
import { hasPermission, getSessionUser } from '@/lib/rbac';
import { recordActivity } from '@/lib/logger';

export async function GET(req: NextRequest) {
  if (!(await hasPermission(req, 'submissions', 'read'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await connectDB();
    // lean(): plain objects are all the admin table needs, and it keeps fields that older
    // documents carry but the schema no longer declares (e.g. attachmentUrls).
    const submissions = await Submission.find({}).sort({ createdAt: -1 }).lean();

    const session = await getSessionUser(req);
    await recordActivity({
      user: (session as any).userId,
      userName: (session as any).username,
      action: 'VIEW_SUBMISSIONS',
      entity: 'Submission',
      details: { count: submissions.length },
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
    });

    return NextResponse.json(submissions);
  } catch (error: any) {
    console.error('Fetch Submissions Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await hasPermission(req, 'submissions', 'delete'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));
    const { id, ids } = body;

    const session = await getSessionUser(req);

    // Reject malformed ids up front - a bad one would otherwise surface as a Mongoose CastError / 500.
    const validIds: string[] = Array.isArray(ids)
      ? ids.filter((v: unknown): v is string => typeof v === 'string' && mongoose.isValidObjectId(v))
      : [];
    if ((Array.isArray(ids) && ids.length > 0 && validIds.length === 0) || (id && !mongoose.isValidObjectId(id))) {
      return NextResponse.json({ error: 'Invalid submission id' }, { status: 400 });
    }

    if (validIds.length > 0) {
      const result = await Submission.deleteMany({ _id: { $in: validIds } });
      await recordActivity({
        user: (session as any).userId,
        userName: (session as any).username,
        action: 'DELETE_SUBMISSIONS_BULK',
        entity: 'Submission',
        details: { count: result.deletedCount, ids: validIds },
        ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
      });
      return NextResponse.json({ success: true, count: result.deletedCount });
    }

    if (id) {
      await Submission.findByIdAndDelete(id);
      await recordActivity({
        user: (session as any).userId,
        userName: (session as any).username,
        action: 'DELETE_SUBMISSION',
        entity: 'Submission',
        details: { id },
        ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Missing id or ids' }, { status: 400 });
  } catch (error: any) {
    console.error('Delete Submissions Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
