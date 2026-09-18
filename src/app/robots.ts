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

  // AI bots and assistants - explicitly allowed
  const aiBots = [
    'GPTBot',
    'ChatGPT-User',
    'OAI-SearchBot',
    'CCBot',
    'anthropic-ai',
    'ClaudeBot',
    'Claude-Web',
    'PerplexityBot',
    'Perplexity-User',
    'Google-Extended',
    'GoogleOther',
    'Amazonbot',
    'Applebot',
    'Applebot-Extended',
    'Bytespider',
    'FacebookBot',
    'Meta-ExternalAgent',
    'Meta-ExternalFetcher',
    'yandex',
  ];

  return {
    rules: [
      ...aiBots.map((userAgent) => ({ userAgent, allow: '/' })),
      {
        userAgent: '*',
        allow: ['/', '/_next/image'],
        disallow: [
          '/api/',
          '/_next/static/',
          '/admin/',
          '/admin',
          '/xmlrpc.php',
          '/author/',
          '/tag/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
