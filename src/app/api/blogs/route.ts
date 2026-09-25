import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Post from '@/models/Post';
import {
  PUBLIC_POST_QUERY,
  promoteDueScheduledPosts,
  readMinutes,
  stripHtml,
  truncate
} from '@/lib/blog-public';

// The ONE public blog API (src/app/api/blog re-exports this handler).
export const revalidate = 60; // Cache for 1 minute, updated via revalidatePath in admin panel

/**
 * Lean list of publicly visible posts for BlogSection / BlogSelector / ContentContext.
 * - Excludes trashed posts (this route used to return them, so trashed posts appeared in the
 *   home-page blog section and the "select featured blogs" picker with links that 404).
 * - No longer ships every article's full HTML (~1 MB for 70 posts, downloaded by every visitor on
 *   every template page): `content` is reduced to a computed `excerpt` + `readTime`.
 */
export async function GET() {
  try {
    await connectToDatabase();
    await promoteDueScheduledPosts();

    const posts = await Post.find(PUBLIC_POST_QUERY)
      .select('title slug excerpt featuredImage seo.metaDescription seo.featuredImageAlt categories publishedAt createdAt content')
      .populate('categories', 'name slug')
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();

    const lean = posts.map((p: any) => {
      const { content, ...rest } = p;
      return {
        ...rest,
        excerpt: p.excerpt || p.seo?.metaDescription || truncate(stripHtml(content), 160),
        readTime: `${readMinutes(content)} min read`,
      };
    });

    return NextResponse.json(lean);
  } catch (error: any) {
    console.error('Public Blogs API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
