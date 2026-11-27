import type { Metadata } from "next";
import { Lora, Poppins, Dancing_Script } from "next/font/google";
import"./globals.css";
import { Providers } from "@/components/Providers";
import SiteLayout from "@/components/SiteLayout";
import connectToDatabase from "@/lib/mongodb";
import SiteContent from "@/models/Content";
import { BASE_URL } from "@/lib/constants";
import InteractiveBackground from "@/components/InteractiveBackground";
import { resolveRobotsMetadata } from "@/lib/seo";
import { getCachedSiteContent, getCachedSiteScripts } from "@/lib/content";

interface ParsedScriptTag {
  tag: "script" | "style" | "noscript" | "meta" | "link";
  props: Record<string, string | boolean>;
  inner?: string;
}

const ATTR_NAME_MAP: Record<string, string> = {
  crossorigin: "crossOrigin",
  class: "className",
  "http-equiv": "httpEquiv",
  charset: "charSet",
  referrerpolicy: "referrerPolicy",
  nomodule: "noModule",
  fetchpriority: "fetchPriority",
};
const BOOLEAN_ATTRS = new Set(["async", "defer", "nomodule"]);

function parseAttributes(attrs: string): Record<string, string | boolean> {
  const props: Record<string, string | boolean> = {};
  const re = /([^\s=\/>]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(attrs)) !== null) {
    const name = m[1].toLowerCase();
    // React rejects string event handlers and string style values.
    if (name.startsWith("on") || name === "style") continue;
    const key = ATTR_NAME_MAP[name] || name;
    if (BOOLEAN_ATTRS.has(name)) {
      props[key] = true;
    } else if (m[2] !== undefined) {
      props[key] = m[2].replace(/^["']|["']$/g, "");
    } else {
      props[key] = "";
    }
  }
  return props;
}

// An admin-pasted <head> snippet (GA/GTM/Meta Pixel/etc.) is almost always TWO sibling <script>
// tags: one with only a `src` (loads the real tracking library) and one with only inline config
// code. The previous approach stripped every <script>/</script> marker from the whole blob with a
// single regex, then re-wrapped whatever text was left in ONE new <script> - which silently threw
// away the `src` attribute (there's no inner text on a src-only tag for the strip to preserve),
// so the actual tracking library was never loaded. gtag()/dataLayer.push() still "worked" as a
// local no-op stub, so nothing ever errored - it just never sent a single real hit to Google.
// Parsing each <script> tag individually and rendering each as its own element (keeping src/async/
// defer, or the inline body) fixes this for any snippet shape, not just this one.
function parseScriptTags(raw: string): ParsedScriptTag[] {
  const tags: ParsedScriptTag[] = [];
  const re = /<(script|style|noscript)\b([^>]*)>([\s\S]*?)<\/\1\s*>|<(meta|link)\b([^>]*?)\/?>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(raw)) !== null) {
    if (match[1]) {
      const inner = (match[3] || "").trim();
      tags.push({
        tag: match[1].toLowerCase() as ParsedScriptTag["tag"],
        props: parseAttributes(match[2] || ""),
        inner: inner || undefined,
      });
    } else {
      tags.push({
        tag: match[4].toLowerCase() as ParsedScriptTag["tag"],
        props: parseAttributes(match[5] || ""),
      });
    }
  }
  // Bare JS with no markup at all - preserve it as a single inline script.
  if (tags.length === 0 && raw.trim() && !/^\s*</.test(raw)) {
    tags.push({ tag: "script", props: {}, inner: raw.trim() });
  }
  return tags;
}


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

// Self-hosted (Next.js downloads and serves this at build time) instead of the old
// `@import url('fonts.googleapis.com/...')` in globals.css - that import depended on every
// visitor's browser being able to reach Google's CDN at runtime, which Brave, several ad/privacy
// blockers, and some corporate networks block by default, silently falling back to a generic
// "cursive" font (usually Comic Sans or a serif italic) with no error. Every accent heading
// phrase (.accent-text in globals.css) uses this.
const dancingScript = Dancing_Script({
  variable: "--font-cursive",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    const data = await getCachedSiteContent();
    if (data?.settings) settings = data.settings;
  } catch (e) {
    console.error("Failed to fetch settings for metadata", e);
  }

  return {
    metadataBase: new URL(BASE_URL),
    icons: {
      icon: settings.favicon || `${BASE_URL}/portfolio_hero_bg.png`,
      apple: settings.favicon || `${BASE_URL}/portfolio_hero_bg.png`,
    },
    facebook: {
      appId: "Mohsin-Designs",
    },
    title: {
      default: settings.siteTitle || "Mohsin Designs",
      template: settings.siteTemplate || "%s | Mohsin Designs",
    },
    description: settings.siteDescription || "Modern Web Architecture, SEO & Digital Marketing Solutions by Mohsin Designs.",
    keywords: settings.siteKeywords || ["Mohsin Designs", "Web Design", "SEO Services", "Digital Marketing"],
    authors: [{ name: "Mohsin Designs", url: BASE_URL }],
    creator: "Mohsin Designs",
    publisher: "Mohsin Designs",

    // ── Robots & Canonical ──
    robots: resolveRobotsMetadata(null, !!settings?.globalNoIndex),
    alternates: {
      canonical: BASE_URL,
    },

    // ── Open Graph (Facebook, LinkedIn) ──
    openGraph: {
      type: "website",
      locale: "en_US",
      url: BASE_URL,
      siteName: "Mohsin Designs",
      title: settings.siteTitle || "Mohsin Designs",
      description: settings.siteDescription || "Modern Web Architecture, SEO & Digital Marketing Solutions by Mohsin Designs.",
      images: [
        {
          url: settings.favicon || `${BASE_URL}/portfolio_hero_bg.png`,
          width: 1200,
          height: 630,
          alt: "Mohsin Designs – Web Design, SEO & Digital Marketing Agency",
          type: "image/png",
        },
      ],
    },

    // ── Twitter Cards ──
    twitter: {
      card: "summary_large_image",
      title: settings.siteTitle || "Mohsin Designs",
      description: settings.siteDescription || "Modern Web Architecture, SEO & Digital Marketing Solutions by Mohsin Designs.",
      images: [settings.favicon || `${BASE_URL}/portfolio_hero_bg.png`],
      creator: "@MohsinDesigns",
      site: "@MohsinDesigns",
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
  // ── Fetch CMS tracking scripts, Global Content & Blog posts in parallel ──
  interface SiteScript { id: string; name: string; location: string; code: string; active: boolean; }
  let siteScripts: SiteScript[] = [];
  let initialGlobalData: any = null;
  let initialBlogs: any[] = [];

  try {
    const [globalData, scriptsData, blogPosts] = await Promise.all([
      getCachedSiteContent(),
      getCachedSiteScripts(),
      import('@/models/Post').then(m =>
        m.default
          .find({ status: 'published', isTrashed: { $ne: true } })
          .select('_id title slug excerpt featuredImage publishedAt date categories')
          .sort({ publishedAt: -1 })
          .limit(10)
          .lean()
      )
    ]);

    if (globalData) initialGlobalData = globalData;
    if (Array.isArray(scriptsData)) siteScripts = scriptsData;
    if (blogPosts) initialBlogs = JSON.parse(JSON.stringify(blogPosts));
  } catch (e) {
    console.error("Failed to fetch initial data for provider", e);
  }

  const activeScripts = siteScripts.filter((s) => s.active);
  const headScripts = activeScripts.filter((s) => s.location === 'head');
  const bodyStartScripts = activeScripts.filter((s) => s.location === 'body_start');
  const bodyEndScripts = activeScripts.filter((s) => s.location === 'body_end');

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${lora.variable} ${poppins.variable} ${dancingScript.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // The admin dashboard has its own fixed palette and must never inherit the
                  // visitor's light/dark preference (AdminLayout also enforces this after mount).
                  if (location.pathname.indexOf('/admin') === 0) {
                    document.documentElement.classList.remove('dark');
                    return;
                  }
                  var stored = localStorage.getItem('theme_preference');
                  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var isDark = false;
                  if (stored === 'dark') {
                    isDark = true;
                  } else if (stored === 'light') {
                    isDark = false;
                  } else {
                    // Strictly honor device preference when no manual preference is saved
                    isDark = !!prefersDark;
                  }
                  if (isDark) {
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
        {headScripts.flatMap((s) =>
          parseScriptTags(s.code).map((tag, i) => {
            const Tag = tag.tag as any;
            return (
              <Tag
                key={`${s.id}-${i}`}
                {...tag.props}
                suppressHydrationWarning
                {...(tag.inner ? { dangerouslySetInnerHTML: { __html: tag.inner } } : {})}
              />
            );
          })
        )}
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
