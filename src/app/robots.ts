import { MetadataRoute } from 'next';
import { BASE_URL } from '@/lib/constants';
import { getGlobalNoIndex } from '@/lib/seo';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const isGlobalNoIndex = await getGlobalNoIndex();

  if (isGlobalNoIndex) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
