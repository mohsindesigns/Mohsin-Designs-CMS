const mongoose = require('mongoose');

const uri = "mongodb://mdseo2025_db_user:UElPBA47l5oQf2oX@ac-rtmxchd-shard-00-00.havgrhc.mongodb.net:27017,ac-rtmxchd-shard-00-01.havgrhc.mongodb.net:27017,ac-rtmxchd-shard-00-02.havgrhc.mongodb.net:27017/mdseo2025?ssl=true&replicaSet=atlas-qtu58a-shard-0&authSource=admin";

async function run() {
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const pageSchema = new mongoose.Schema({}, { strict: false });
  const Page = mongoose.models.Page || mongoose.model('Page', pageSchema, 'pages');

  let blogPage = await Page.findOne({ slug: { $in: ['blog', '/blog'] } });
  if (!blogPage) {
    console.log("Creating Blog Index page in database...");
    blogPage = await Page.create({
      title: "Blog & Insights",
      slug: "blog",
      template: "blog",
      status: "published",
      content: {
        blogPage: {
          hero: {
            badgeText: "EXPLORE OUR EDITORIAL // INSIGHTS & STRATEGY",
            titleLine1: "Modern Engineering &",
            titleHighlight: "Growth Insights",
            description: "Actionable blueprints, architectural deep-dives, and conversion rate science to build compounding market advantage.",
            backgroundImage: "/portfolio_hero_bg.png",
            heroBgImage: "/portfolio_hero_bg.png",
            heroBgAlt: "Blog Header Background",
            ctaPrimary: { label: "Explore Articles", href: "#articles" },
            ctaSecondary: { label: "Schedule Strategy Call", href: "/contact" }
          },
          filterMode: "all",
          selectedBlogIds: [],
          postsPerPage: 6,
          ctaBanner: {
            eyebrow: "READY TO ACCELERATE?",
            titleIntro: "Let's Build Your Next",
            titleHighlight: "Competitive Edge",
            titleLine2: "Together.",
            description: "Schedule a free 30-minute technical audit. We'll diagnose bottlenecks in your existing presence and map out a concrete blueprint for compounding growth.",
            ctaPrimary: { label: "Book Strategy Session", href: "/contact" },
            ctaSecondary: { label: "Watch Showreel", href: "/gallery" },
            portraitSrc: "/founder.png",
            portraitAlt: "Mohsin Designs Lead Architect"
          }
        }
      },
      seo: {
        metaTitle: "Blog & Engineering Insights | Mohsin Designs",
        metaDescription: "Actionable blueprints, architectural deep-dives, and conversion rate science to build compounding market advantage.",
        canonicalUrl: "https://mohsindesigns.com/blog",
        metaRobotsIndex: "index",
        metaRobotsFollow: "follow"
      }
    });
    console.log("Created Blog Index Page:", blogPage._id);
  } else {
    console.log("Blog Page already exists:", blogPage._id, blogPage.title);
    if (blogPage.template !== 'blog') {
      blogPage.template = 'blog';
      await blogPage.save();
      console.log("Updated template to 'blog'");
    }
  }

  const allPages = await Page.find({}).lean();
  console.log("All pages count in MongoDB:", allPages.length);
  allPages.forEach(p => console.log(`- ${p.title} (slug: ${p.slug}, template: ${p.template})`));

  await mongoose.disconnect();
}

run().catch(console.error);
