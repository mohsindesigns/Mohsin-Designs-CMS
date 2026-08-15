import connectToDatabase from '@/lib/mongodb';
import Post from '@/models/Post';
import Category from '@/models/Category';
import { Calendar, User, ArrowRight, BookOpen, Search } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';
import { BASE_URL } from '@/lib/constants';

export const revalidate = 60; // Cache for 1 minute

import SiteContent from '@/models/Content';

export async function generateMetadata(): Promise<Metadata> {
  await connectToDatabase();
  const content = await SiteContent.findOne({ key: 'complete_data' }).lean() as any;
  const blogData = content?.data?.blogPage;
  const seo = blogData?.seo || {};
  const pageUrl = `${BASE_URL}/blog`;

  return {
    title: {
      absolute: seo.metaTitle
    },
    description: seo.metaDescription || blogData?.hero?.description,
    alternates: {
      canonical: seo.canonicalUrl || pageUrl,
    },
    openGraph: {
      title: seo.ogTitle || seo.metaTitle || blogData?.hero?.title,
      description: seo.ogDescription || seo.metaDescription || blogData?.hero?.description,
      url: pageUrl,
      type: 'website',
      images: seo.featuredImage ? [{ url: seo.featuredImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.twitterTitle || seo.ogTitle || seo.metaTitle,
      description: seo.twitterDescription || seo.ogDescription || seo.metaDescription,
      images: [seo.featuredImage || seo.twitterImage || seo.ogImage].filter(Boolean) as string[],
    },
    robots: {
      index: seo.metaRobotsIndex !== 'noindex',
      follow: seo.metaRobotsFollow !== 'nofollow',
      ...(seo.metaRobotsIndex !== 'noindex' && {
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      })
    }
  };
}

export default async function BlogIndexPage() {
  await connectToDatabase();
  
  const [posts, categories] = await Promise.all([
    Post.find({ status: 'published' })
      .populate('categories author')
      .sort({ publishedAt: -1 }),
    Category.find({}).lean()
  ]);

  return (
    <div className="min-h-screen bg-white">
      {/* Simple Clean Hero */}
      <section className="relative h-[400px] flex items-center justify-center bg-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop" 
            alt="Blog Header"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="flex items-center justify-center gap-2 text-white/60 text-xs font-bold uppercase tracking-[0.3em] mb-4">
            <Link href="/" className="text-white/60 hover:text-white transition-colors">Home</Link>
            <span className="opacity-30">/</span>
            <span className="text-white">Blog</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">Our Insights</h1>
          <p className="text-slate-400 mt-4 text-lg max-w-2xl mx-auto">Latest news, guides and updates from Eagle Revolution.</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-20">
        {/* Simple Search/Filter */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
          <div className="flex flex-wrap gap-2">
            <button className="px-6 py-2 rounded-full bg-blue-600 text-white text-xs font-bold uppercase tracking-wider">All</button>
            {categories.slice(0, 5).map((cat: any) => (
              <button key={cat._id} className="px-6 py-2 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider hover:bg-slate-200 transition-all">{cat.name}</button>
            ))}
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search posts..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-full py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-600 transition-all"
            />
          </div>
        </div>

        {/* Square Cards Grid (3 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link key={post._id} href={`/blog/${post.slug}`} className="group block bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-blue-900/5 transition-all">
              <div className="aspect-square relative overflow-hidden">
                {post.featuredImage ? (
                  <img 
                    src={post.featuredImage} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-slate-300" />
                  </div>
                )}
                {post.categories?.[0] && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-md text-blue-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
                      {post.categories[0].name}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-8">
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-3">
                  <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-4 leading-tight">
                  {post.title}
                </h2>
                <p className="text-slate-500 text-sm line-clamp-2 mb-6 leading-relaxed">
                  {post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                </p>
                <span className="inline-flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-widest">
                  Read More <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
             <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
             <h3 className="text-2xl font-bold text-slate-900">No posts yet</h3>
             <p className="text-slate-500 mt-2">Check back later for new updates.</p>
          </div>
        )}
      </div>
    </div>
  );
}

