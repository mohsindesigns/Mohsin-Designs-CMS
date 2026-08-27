import { Metadata } from 'next';
import connectToDatabase from '@/lib/mongodb';
import SiteContent from '@/models/Content';

export interface SeoRobotsConfig {
  metaRobotsIndex?: string; // 'index' | 'noindex'
  metaRobotsFollow?: string; // 'follow' | 'nofollow'
}

/**
 * Checks whether global noindex is enabled in SiteContent settings.
 */
export async function getGlobalNoIndex(): Promise<boolean> {
  try {
    await connectToDatabase();
    const content = await SiteContent.findOne({ key: 'complete_data' }).lean() as any;
    return !!content?.data?.settings?.globalNoIndex;
  } catch (error) {
    console.error('Error fetching globalNoIndex setting:', error);
    return false;
  }
}

/**
 * Resolves the Next.js `robots` metadata object based on global setting and individual page SEO config.
 *
 * - If `isGlobalNoIndex` is true:
 *     returns `{ index: false, follow: false }`
 * - If `isGlobalNoIndex` is false (or undefined):
 *     returns individual page robots directives based on `seo.metaRobotsIndex` and `seo.metaRobotsFollow`.
 */
export function resolveRobotsMetadata(
  seo?: SeoRobotsConfig | null,
  isGlobalNoIndex?: boolean
): Metadata['robots'] {
  if (isGlobalNoIndex) {
    return {
      index: false,
      follow: false,
    };
  }

  const index = seo?.metaRobotsIndex !== 'noindex';
  const follow = seo?.metaRobotsFollow !== 'nofollow';

  return {
    index,
    follow,
    ...(index && {
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }),
  };
}
