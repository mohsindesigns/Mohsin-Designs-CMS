import type { Metadata } from "next";
import { Lora, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import SiteLayout from "@/components/SiteLayout";
import connectToDatabase from "@/lib/mongodb";
import SiteContent from "@/models/Content";
import { BASE_URL } from "@/lib/constants";
import InteractiveBackground from "@/components/InteractiveBackground";

const lora = Lora({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});


export async function generateMetadata(): Promise<Metadata> {
  let settings: any = {
    siteTitle: "",
    siteTemplate: "%s",
    favicon: "",
    siteDescription: "",
    siteKeywords: []
  };

  try {
    const conn = await connectToDatabase();
    if (conn) {
      const content = await SiteContent.findOne({ key: 'complete_data' });
      if (content?.data?.settings) settings = content.data.settings;
    }
  } catch (e) {
    console.error("Failed to fetch settings for metadata", e);
  }

  return {
    metadataBase: new URL(BASE_URL),
    icons: {
      icon: settings.favicon || `${BASE_URL}/eagle-logo.png`,
      apple: settings.favicon || `${BASE_URL}/eagle-logo.png`,
    },
    facebook: {
      appId: "Eagle-Revolution-61564977483096",
    },
    title: {
      default: settings.siteTitle,
      template: settings.siteTemplate,
    },
    description: settings.siteDescription,
    keywords: settings.siteKeywords || ["Eagle Revolution"],
    authors: [{ name: "Eagle Revolution", url: BASE_URL }],
    creator: "Eagle Revolution",
    publisher: "Eagle Revolution",

    // ── Robots & Canonical ──
    robots: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
    alternates: {
      canonical: BASE_URL,
    },

    // ── Open Graph (Facebook, LinkedIn) ──
    openGraph: {
      type: "website",
      locale: "en_US",
      url: BASE_URL,
      siteName: "Eagle Revolution",
      title: settings.siteTitle,
      description: settings.siteDescription,
      images: [
        {
          url: settings.favicon || `${BASE_URL}/eagle-logo.png`,
          width: 1200,
          height: 630,
          alt: "Eagle Revolution – Veteran Owned Roofing & Home Improvement",
          type: "image/png",
        },
      ],
    },

    // ── Twitter Cards ──
    twitter: {
      card: "summary_large_image",
      title: settings.siteTitle,
      description: settings.siteDescription,
      images: [settings.favicon || `${BASE_URL}/eagle-logo.png`],
      creator: "@EagleRevolution",
      site: "@EagleRevolution",
    },

    other: {
      "format-detection": "telephone=no",
    },
  };
}

import { ContentProvider } from "@/context/ContentContext";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ── Fetch CMS-managed tracking scripts from MongoDB ──
  interface SiteScript { id: string; name: string; location: string; code: string; active: boolean; }
  let siteScripts: SiteScript[] = [];
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const doc = await SiteContent.findOne({ key: 'site_scripts_v2' });
      if (Array.isArray(doc?.data)) siteScripts = doc.data;
    }
  } catch (e) {
    // Non-fatal — site renders fine without CMS scripts
  }
  const activeScripts = siteScripts.filter((s) => s.active);
  const headScripts = activeScripts.filter((s) => s.location === 'head');
  const bodyStartScripts = activeScripts.filter((s) => s.location === 'body_start');
  const bodyEndScripts = activeScripts.filter((s) => s.location === 'body_end');

  // ── Fetch Global Content & Blogs for the Provider ──
  let initialGlobalData = null;
  let initialBlogs = [];
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const [globalContent, blogPosts] = await Promise.all([
        SiteContent.findOne({ key: 'complete_data' }),
        import('@/models/Post').then(m => m.default.find({ status: 'published', isTrashed: { $ne: true } }).sort({ date: -1 }).limit(10).lean())
      ]);

      if (globalContent?.data) initialGlobalData = globalContent.data;
      if (blogPosts) initialBlogs = JSON.parse(JSON.stringify(blogPosts));
    }
  } catch (e) {
    console.error("Failed to fetch initial data for provider", e);
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${lora.variable} ${poppins.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Site-wide schemas removed - handled dynamically by pages/services */}
        {/* Preconnect to external origins for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        {/* ── CMS-managed <head> scripts ── */}
        {headScripts.map((s) => (
          <script
            key={s.id}
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: s.code.replace(/<script[^>]*>|<\/script>/gi, '').trim() }}
          />
        ))}
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-[#080710] text-black dark:text-white font-sans relative transition-colors duration-300">
        {/* ── CMS-managed body_start scripts ── */}
        {bodyStartScripts.map((s) => (
          <div key={s.id} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: s.code }} />
        ))}
        <ContentProvider initialData={initialGlobalData} initialBlogs={initialBlogs}>
          <Providers>
            <div className="relative min-h-screen flex flex-col z-10">
              <InteractiveBackground />
              <SiteLayout>{children}</SiteLayout>
            </div>
          </Providers>
        </ContentProvider>

        {/* ── CMS-managed body_end scripts ── */}
        {bodyEndScripts.map((s) => (
          <div key={s.id} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: s.code }} />
        ))}
      </body>
    </html>
  );
}
