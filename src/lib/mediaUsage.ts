import SiteContent from '@/models/Content';
import Page from '@/models/Page';
import Post from '@/models/Post';
import Portfolio from '@/models/Portfolio';
import Media from '@/models/Media';
import path from 'path';

// All site content as one string, loaded once per delete request, to check whether a file is still referenced.
export async function loadMediaHaystack(): Promise<string> {
  const [contents, pages, posts, items] = await Promise.all([
    SiteContent.find({}).select('data').lean(),
    Page.find({}).select('content seo').lean(),
    Post.find({}).select('content featuredImage seo').lean(),
    Portfolio.find({}).lean(),
  ]);
  return JSON.stringify([contents, pages, posts, items]);
}

// Cloudinary URLs vary by version and transformation segment, so match on the public_id (or the
// local filename). A false positive only keeps a file; it never deletes one that is in use.
export async function isMediaInUse(
  m: { _id: any; url?: string; publicId?: string },
  haystack: string,
  excludeIds: any[] = []
): Promise<boolean> {
  const url = m.url || '';
  if (!url) return false;
  if (m.publicId && (await Media.exists({ publicId: m.publicId, _id: { $nin: [m._id, ...excludeIds] } }))) return true;
  const needle = /res\.cloudinary\.com\//.test(url) ? m.publicId || url : path.basename(url);
  return !!needle && haystack.includes(needle);
}
