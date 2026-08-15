import { Metadata } from 'next';

export const revalidate = 60; // Cache for 1 minute, updated via revalidatePath in admin panel

import { notFound } from 'next/navigation';
import connectToDatabase from '@/lib/mongodb';
import Post from '@/models/Post';
import { Calendar, User, Tag as TagIcon, Clock, BookOpen, ArrowLeft, ArrowRight, Share2, Facebook, Twitter, Linkedin, MapPin } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';
import ReadingProgress from '@/components/blog/ReadingProgress';
import ShareButton from '@/components/blog/ShareButton';
import PageInlineFaqs from '@/components/PageInlineFaqs';
import { BASE_URL } from '@/lib/constants';
import { makeLinksDoFollow } from '@/lib/utils';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectToDatabase();
  const post = await Post.findOne({ slug, status: 'published' });

  if (!post) return { title: 'Post Not Found' };

  const url = `${BASE_URL}/blog/${slug}`;

  return {
    title: {
      absolute: post.seo?.metaTitle || post.title
    },
    description: post.seo?.metaDescription,
    openGraph: {
      title: post.seo?.ogTitle || post.title,
      description: post.seo?.ogDescription || post.excerpt,
      url: url,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: (post.updatedAt || post.publishedAt)?.toISOString(),
      images: [
        {
          url: post.seo?.ogImage || post.featuredImage || `${BASE_URL}/eagle-logo.png`,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.seo?.ogTitle || post.title,
      description: post.seo?.ogDescription || post.excerpt,
      images: [post.seo?.ogImage || post.featuredImage || `${BASE_URL}/eagle-logo.png`],
      site: "@EagleRevolution",
      creator: "@EagleRevolution",
    },
    robots: {
      index: post.seo?.metaRobotsIndex !== 'noindex',
      follow: post.seo?.metaRobotsFollow !== 'nofollow',
      ...(post.seo?.metaRobotsIndex !== 'noindex' && {
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      })
    },
    alternates: {
      canonical: post.seo?.canonicalUrl || url,
    }
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  await connectToDatabase();

  const post = await Post.findOne({ slug, status: 'published' })
    .populate('categories tags author')
    .lean();

  if (!post) notFound();

  console.log(`[Blog Debug] Post Title: ${post.title}`);
  console.log(`[Blog Debug] Post Location: "${post.location}"`);
  console.log(`[Blog Debug] Post Categories: ${post.categories?.length || 0}`);
  if (post.categories?.length > 0) console.log(`[Blog Debug] First Category: ${post.categories[0].name}`);
  console.log(`[Blog Debug] FAQ Count: ${post.faq?.length || 0}`);
  if (post.faq?.length > 0) console.log(`[Blog Debug] First FAQ: ${post.faq[0].question}`);

  const url = `${BASE_URL}/blog/${slug}`;
  const wordCount = post.content ? post.content.split(/\s+/).length : 0;
  const publishDate = post.publishedAt?.toISOString();
  const modifiedDate = (post.updatedAt || post.publishedAt)?.toISOString();
  const featuredImage = post.featuredImage || `https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop`;

  // Advanced Schema.org Graph JSON-LD
  const schemaGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${url}/#article`,
        'isPartOf': { '@id': url },
        'author': {
          '@id': `${BASE_URL}/#/schema/person/${post.author?._id || 'admin'}`
        },
        'headline': post.title,
        'datePublished': publishDate,
        'dateModified': modifiedDate,
        'mainEntityOfPage': { '@id': url },
        'wordCount': wordCount,
        'publisher': { '@id': `${BASE_URL}/#organization` },
        'image': { '@id': `${url}/#primaryimage` },
        'thumbnailUrl': featuredImage,
        'keywords': post.tags?.map((t: any) => t.name).join(', '),
        'inLanguage': 'en-US'
      }
    ]
  };

  // Automated Table of Contents Logic
  let tableOfContents: { id: string; text: string; level: number }[] = [];
  let processedContent = post.content;

  const headingRegex = /<(h[123])>(.*?)<\/h[123]>/gi;
  let match;
  const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  while ((match = headingRegex.exec(post.content)) !== null) {
    const tag = match[1].toLowerCase();
    const text = match[2].replace(/<[^>]*>/g, '');
    const id = slugify(text);

    // Demote H1 to H2 to ensure only one H1 on the page
    const finalTag = tag === 'h1' ? 'h2' : tag;
    const level = parseInt(finalTag[1]);

    tableOfContents.push({ id, text, level });

    const originalTag = match[0];
    const newTag = `<${finalTag} id="${id}" class="scroll-mt-32">${match[2]}</${finalTag}>`;
    processedContent = processedContent.replace(originalTag, newTag);
  }

  processedContent = makeLinksDoFollow(processedContent);

  return (
    <article className="min-h-screen bg-white pb-24">
      <Script
        id="blog-post-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
      />
      <ReadingProgress />

      {/* Hero / Breadcrumb Section */}
      <section className="relative h-[400px] flex items-center justify-center bg-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
            alt="Header Background"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="flex items-center justify-center gap-2 text-white/60 text-[10px] font-bold uppercase tracking-[0.4em] mb-8">
            <Link href="/" className="text-white/60 hover:text-white transition-colors">Home</Link>
            <span className="opacity-30">/</span>
            <Link href="/blog" className="text-white/60 hover:text-white transition-colors">Blog</Link>

          </div>
          <h1 className="text-2xl min-[350px]:text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight max-w-5xl mx-auto drop-shadow-2xl px-2">
            {post.title}
          </h1>
          <div className="flex justify-center items-center gap-8 text-slate-300 text-xs mt-10 font-medium">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <span>{Math.ceil(wordCount / 200)} Minute Read</span>
            </div>
            {post.categories && post.categories.length > 0 && (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                  <TagIcon className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <span>{post.categories[0].name}</span>
              </div>
            )}
            {post.location && (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <span>{post.location}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Image - Full Width/Container */}
      <div className="container mx-auto px-4 -mt-24 relative z-20">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-[2rem] overflow-hidden shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)] border border-slate-100 aspect-[21/9] relative group">
            {post.featuredImage ? (
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                <BookOpen className="w-24 h-24 text-slate-100" />
              </div>
            )}
            <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[2rem]" />
          </div>
        </div>
      </div>

      {/* Main Content Layout with Sticky Sidebar */}
      <div className="container mx-auto px-4 mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16">

            {/* Left: Blog Content (8 columns approx) */}
            <div className="lg:w-[65%] min-w-0 px-1 min-[350px]:px-0">

              {/* Author Attribution Card */}
              <div className="flex flex-col min-[400px]:flex-row items-center gap-5 mb-12 p-6 min-[400px]:p-8 bg-slate-50 border border-slate-100 rounded-2xl min-[400px]:rounded-3xl">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl border-2 border-white rotate-3 group-hover:rotate-0 transition-transform">
                    <img
                      src={post.author?.image || `https://ui-avatars.com/api/?name=${post.author?.name || 'Admin'}&background=2563eb&color=fff`}
                      alt={post.author?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                    <CheckIcon className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1 block">Article Strategist</span>
                  <h4 className="text-xl font-bold text-slate-900 leading-tight">{post.author?.name || 'Eagle Revolution'}</h4>
                  <p className="text-slate-500 text-sm mt-0.5">Industry Expert & Lead Contributor</p>
                </div>
              </div>

              {/* Main Content Body */}
              <div
                className="prose prose-slate prose-sm min-[400px]:prose-base md:prose-lg max-w-none 
                prose-headings:text-slate-900 prose-headings:font-bold prose-headings:tracking-tight
                prose-h2:text-2xl min-[400px]:text-3xl md:text-4xl prose-h2:mt-12 md:prose-h2:mt-16 prose-h2:mb-6 md:prose-h2:mb-8 prose-h2:border-l-4 prose-h2:border-blue-600 prose-h2:pl-4 md:prose-h2:pl-6
                prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-6 md:prose-p:mb-8 prose-p:text-base md:prose-p:text-lg
                prose-a:text-primary prose-a:font-bold prose-a:no-underline hover:prose-a:no-underline
                prose-ol:my-4 prose-ul:my-4 prose-li:my-0
                prose-img:rounded-2xl md:prose-img:rounded-3xl prose-img:my-8 md:prose-img:my-16 prose-img:shadow-2xl
                prose-blockquote:border-l-0 prose-blockquote:bg-blue-600 prose-blockquote:text-white prose-blockquote:p-8 md:prose-blockquote:p-12 prose-blockquote:rounded-2xl md:prose-blockquote:rounded-[2rem] prose-blockquote:not-italic prose-blockquote:text-xl md:prose-blockquote:text-3xl prose-blockquote:font-bold prose-blockquote:shadow-xl prose-blockquote:shadow-blue-600/20"
                dangerouslySetInnerHTML={{ __html: processedContent }}
              />

              {/* Tags/Categories Footer */}
              <div className="mt-20 pt-12 border-t border-slate-100 flex flex-wrap gap-3">
                {post.categories?.map((cat: any) => (
                  <span key={cat._id} className="px-5 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider border border-blue-100">
                    {cat.name}
                  </span>
                ))}
                {post.tags?.map((tag: any) => (
                  <span key={tag._id} className="px-5 py-2 rounded-xl bg-slate-50 text-slate-500 text-xs font-medium border border-slate-100">
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Sticky Table of Contents (Sidebar) */}
            <aside className="lg:w-[35%] shrink-0 px-1 min-[350px]:px-0">
              <div className="sticky top-32 space-y-6 md:space-y-8">

                <div className="bg-white border border-slate-100 rounded-2xl md:rounded-[2rem] p-6 md:p-8 shadow-xl shadow-slate-200/50">
                  <div className="flex items-center gap-3 mb-6 md:mb-8 pb-4 md:pb-6 border-b border-slate-100">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-blue-50 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-[10px] md:text-sm font-black uppercase tracking-widest text-slate-900">Navigation</h3>
                      <p className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Quick Select</p>
                    </div>
                  </div>

                  {tableOfContents.length > 0 ? (
                    <nav className="space-y-1">
                      {tableOfContents.map((item, idx) => (
                        <a
                          key={idx}
                          href={`#${item.id}`}
                          className={`flex items-center gap-4 py-3 px-4 rounded-xl transition-all duration-300 group ${item.level === 1
                            ? "text-slate-900 font-bold hover:bg-blue-50 hover:text-blue-600"
                            : "pl-10 text-slate-500 hover:text-blue-600"
                            }`}
                        >
                          <div className={`shrink-0 w-1.5 h-1.5 rounded-full transition-all duration-300 ${item.level === 1 ? "bg-blue-600 scale-100" : "bg-slate-300 scale-75 group-hover:bg-blue-400 group-hover:scale-100"
                            }`} />
                          <span className="text-sm line-clamp-1">{item.text}</span>
                        </a>
                      ))}
                    </nav>
                  ) : (
                    <p className="text-sm text-slate-400 italic py-4">Detailed structure coming soon.</p>
                  )}

                  <div className="mt-10 pt-8 border-t border-slate-100">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Article Impact</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Words</p>
                        <p className="text-xl font-black text-slate-900">{wordCount}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Read</p>
                        <p className="text-xl font-black text-slate-900">{Math.ceil(wordCount / 200)}m</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Engage</p>
                    <ShareButton title={post.title} url={slug} />
                  </div>
                </div>

                {/* Newsletter / CTA Box */}
                <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-blue-600/40 transition-colors duration-700" />
                  <h4 className="text-2xl text-white mb-3 relative z-10">Expert Opinion</h4>
                  <p className="text-slate-400 text-sm mb-8 leading-relaxed relative z-10">Get a professional consultation for your roofing project today.</p>
                  <Link href="/contact-us" className="block w-full bg-blue-600 py-4 rounded-2xl text-center font-bold text-sm hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 relative z-10 group/btn">
                    Get Free Quote <ArrowRight className="inline-block w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>

              </div>
            </aside>

          </div>
        </div>
      </div>
      {/* FAQ Section */}
      {((post.faq && post.faq.length > 0) || (post.faqSchemaMarkup && post.faqSchemaMarkup.trim())) && (
        <div className="mt-12">
          <PageInlineFaqs 
            faqs={post.faq} 
            faqSchemaMarkup={post.faqSchemaMarkup} 
            badge={post.faqBadge}
            title={post.faqTitle}
            subtitle={post.faqDescription}
          />
        </div>
      )}
    </article>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={4}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
