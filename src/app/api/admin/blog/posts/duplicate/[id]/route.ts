import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Post from '@/models/Post';
import { hasPermission, getSessionUser } from '@/lib/rbac';
import { recordActivity } from '@/lib/logger';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser(req);
  if (!(await hasPermission(req, 'blog', 'create'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await params;
    await connectToDatabase();
    
    const sourcePost = await Post.findById(id);
    if (!sourcePost) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    // Create a copy without the _id and with a 'Copy' suffix
    const postObj = sourcePost.toObject();
    delete postObj._id;
    delete postObj.createdAt;
    delete postObj.updatedAt;
    
    postObj.title = `${postObj.title} (Copy)`;
    postObj.slug = `${postObj.slug}-copy-${Date.now()}`;
    postObj.status = 'draft';
    postObj.author = (session as any).userId;

    const duplicatedPost = await Post.create(postObj);

    await recordActivity({
      user: (session as any).userId,
      userName: (session as any).username,
      action: 'DUPLICATE_POST',
      entity: 'Post',
      entityId: duplicatedPost._id.toString(),
      details: { sourceId: id, newTitle: duplicatedPost.title },
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || 'unknown'
    });

    return NextResponse.json(duplicatedPost);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
