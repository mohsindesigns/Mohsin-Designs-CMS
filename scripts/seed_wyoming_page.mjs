import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function seedWyoming() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'mdseo2025';

  if (!uri) {
    console.error('MONGODB_URI is not set in .env.local');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const pagesCol = db.collection('pages');

    // Get Texas as a reference/baseline for state content structure
    const texasPage = await pagesCol.findOne({ slug: 'texas' }) || {};
    const baseContent = texasPage.content || {};

    const wyomingPage = {
      slug: 'usa/wyoming',
      title: 'Wyoming Digital Marketing Agency',
      template: 'state',
      status: 'published',
      seo: {
        metaTitle: 'Wyoming Digital Marketing Agency | Growth & Results',
        metaDescription: 'Mohsin Designs is the Wyoming digital marketing agency built for local growth. SEO, web design, branding and ads that bring in real customers. Get a free quote.',
        focusKeyword: 'Wyoming digital marketing agency',
        canonicalUrl: 'https://mohsindesigns.com/usa/wyoming/',
        metaRobotsIndex: 'index',
        metaRobotsFollow: 'follow',
        ogTitle: 'Wyoming Digital Marketing Agency | Growth & Results',
        ogDescription: 'Mohsin Designs is the Wyoming digital marketing agency built for local growth. SEO, web design, branding and ads that bring in real customers. Get a free quote.',
        ogImage: 'https://mohsindesigns.com/wp-content/uploads/2026/05/hero-image-1.webp',
        twitterCard: 'summary_large_image',
        twitterTitle: 'Wyoming Digital Marketing Agency | Growth & Results',
        twitterDescription: 'Mohsin Designs is the Wyoming digital marketing agency built for local growth. SEO, web design, branding and ads that bring in real customers. Get a free quote.',
        twitterImage: 'https://mohsindesigns.com/wp-content/uploads/2026/05/hero-image-1.webp',
        breadcrumbTitle: 'Wyoming'
      },
      content: {
        ...baseContent,
        hero: {
          ...(baseContent.hero || {}),
          enabled: true,
          badge: 'Trusted by 3,000+ US Businesses',
          titleLine1: 'The Wyoming Digital Marketing Agency',
          titleHighlight: 'Built to Grow Local Brands',
          titleLine2: 'Built to Grow Local Brands',
          titleConnector: '',
          headlines: [{ text: 'Built to Grow Local Brands', highlight: true }],
          description: '<p>Wyoming’s population is less than most major metropolitan areas. Because of this, we value each individual customer more than almost any other place. Mohsin Designs is a Wyoming digital marketing agency that offers services to help ranchers, shops, clinics, and other busy service crews in Cheyenne, Casper, Laramie, and the areas in between. We help you get found by potential customers searching your business. Depending on your goals, we offer services in SEO, branding, and digital advertising to help you maximize potential customers and increase your business’s daily operations.</p>',
          primaryCtaText: 'Get Free Estimate',
          primaryCtaLink: '#quote'
        },
        whyChooseUs: {
          ...(baseContent.whyChooseUs || {}),
          enabled: true,
          sectionTag: 'Methodology',
          titleIntro: 'Why Wyoming Owners Stop Shopping Around ',
          titleHighlight: 'Once They Find Us',
          subtext: 'Owners across the state pick the right Wyoming digital marketing agency the same way they pick a trusted ranch hand, on proven results, plain honesty, and work that clearly holds up over time. Here is what keeps our clients coming back season after season, and why that first choice usually grows into a partnership that lasts for years.',
          stats: [
            {
              value: '95%',
              label: 'Client Retention Rate',
              sublabel: 'Over 90% of clients return for more projects',
              percentage: 0.99
            },
            {
              value: '0',
              label: 'Outsourcing',
              sublabel: 'Every project runs 100% in-house with zero middlemen',
              percentage: 0.95
            },
            {
              value: '3K+',
              label: 'Clients Served',
              sublabel: '7+ years across 50+ industries worldwide',
              percentage: 0.9
            }
          ],
          reasons: [
            {
              num: '01',
              title: 'Battle-Tested Experience',
              desc: 'Since 2019, Mohsin Designs has worked with over 3,000 international clients using our 7+ years of design and marketing experience in 50+ industries. With our extensive background, we avoid guesswork for Wyoming brands, choosing the most effective strategies that give the fastest solutions and most confidence.',
              description: 'Since 2019, Mohsin Designs has worked with over 3,000 international clients using our 7+ years of design and marketing experience in 50+ industries. With our extensive background, we avoid guesswork for Wyoming brands, choosing the most effective strategies that give the fastest solutions and most confidence.',
              iconName: 'Award',
              icon: 'Award'
            },
            {
              num: '02',
              title: 'Proven Revenue Impact',
              desc: 'Through our revenue-centric digital strategies, brand design, and marketing execution, we have generated over $5 million for our clients. Rather than focusing on artificial vanity metrics, we align design, SEO, web, and marketing work to real results on your bottom line.',
              description: 'Through our revenue-centric digital strategies, brand design, and marketing execution, we have generated over $5 million for our clients. Rather than focusing on artificial vanity metrics, we align design, SEO, web, and marketing work to real results on your bottom line.',
              iconName: 'TrendingUp',
              icon: 'TrendingUp'
            },
            {
              num: '03',
              title: 'Loyalty You Can Measure',
              desc: 'A 95%+ client retention rate, with more than 90% of clients returning for more, says more than any sales pitch. Wyoming businesses stay because the work feels personal, the results stay visible, and every project earns trust through steady communication and strong execution.',
              description: 'A 95%+ client retention rate, with more than 90% of clients returning for more, says more than any sales pitch. Wyoming businesses stay because the work feels personal, the results stay visible, and every project earns trust through steady communication and strong execution.',
              iconName: 'Sparkles',
              icon: 'Sparkles'
            },
            {
              num: '04',
              title: 'Zero Outsourcing',
              desc: 'Every project runs 100% in-house, so your brand never gets passed to unknown freelancers or hidden outside teams. The principal architect guides strategy, design, and execution directly, keeping quality tight and decisions clear.',
              description: 'Every project runs 100% in-house, so your brand never gets passed to unknown freelancers or hidden outside teams. The principal architect guides strategy, design, and execution directly, keeping quality tight and decisions clear.',
              iconName: 'ShieldCheck',
              icon: 'ShieldCheck'
            },
            {
              num: '05',
              title: 'Clear, Honest Communication',
              desc: "You'll never chase us for an update. We stay easy to reach through messages, WhatsApp, or email, and we explain progress in clear language. That open communication helps Wyoming owners feel informed, involved, and confident at every stage.",
              description: "You'll never chase us for an update. We stay easy to reach through messages, WhatsApp, or email, and we explain progress in clear language. That open communication helps Wyoming owners feel informed, involved, and confident at every stage.",
              iconName: 'CheckCircle2',
              icon: 'CheckCircle2'
            }
          ]
        },
        serviceArea: {
          ...(baseContent.serviceArea || {}),
          enabled: true,
          titleIntro: 'From Cheyenne to Jackson, We Get ',
          titleHighlight: 'You Found Everywhere',
          description: 'From Cheyenne storefronts to Jackson tourist hotspots and the quiet towns along I-80, we help your business get found by the nearby customers who are ready to call, visit, and buy right now.',
          ctaText: "Let's Work Together",
          ctaHref: '/contact-us',
          hubs: [
            {
              id: 'hub-wy-gillette',
              name: 'Gillette, USA',
              focus: 'Commerce & Energy Hub',
              timezone: 'MST',
              link: 'https://mohsindesigns.com/usa/wyoming/gillette/'
            },
            {
              id: 'hub-wy-casper',
              name: 'Casper, USA',
              focus: 'Central Commercial Hub',
              timezone: 'MST',
              link: 'https://mohsindesigns.com/usa/wyoming/casper/'
            },
            {
              id: 'hub-wy-sheridan',
              name: 'Sheridan, USA',
              focus: 'Northern Business Center',
              timezone: 'MST',
              link: 'https://mohsindesigns.com/usa/wyoming/sheridan/'
            },
            {
              id: 'hub-wy-jackson',
              name: 'Jackson, USA',
              focus: 'Tourism & Hospitality Hub',
              timezone: 'MST',
              link: 'https://mohsindesigns.com/usa/wyoming/jackson/'
            },
            {
              id: 'hub-wy-powell',
              name: 'Powell, USA',
              focus: 'Agriculture & Valley Hub',
              timezone: 'MST',
              link: 'https://mohsindesigns.com/usa/wyoming/powell/'
            },
            {
              id: 'hub-wy-cheyenne',
              name: 'Cheyenne, USA',
              focus: 'Capital Enterprise Hub',
              timezone: 'MST',
              link: 'https://mohsindesigns.com/usa/wyoming/cheyenne/'
            }
          ]
        },
        faqs: [
          {
            question: 'How does a Wyoming digital marketing agency actually bring me more customers?',
            answer: 'We put your business in front of the right people at the exact moment they are ready to buy. We blend local SEO, paid ads, and helpful content so nearby clients can easily find you, trust what they see, and reach out directly.',
            category: 'GENERAL'
          },
          {
            question: 'My town is small. Is digital marketing even worth it out here?',
            answer: 'Yes, and honestly it matters more in a small market. With fewer people around, every missed customer stings. Being the first name that shows up when someone needs help guarantees you capture the calls instead of your competitor down the road.',
            category: 'GENERAL'
          },
          {
            question: 'Can you help me catch tourist traffic near Yellowstone and Grand Teton?',
            answer: 'The traffic generated here is especially valuable. There are millions of tourists that come through Wyoming every year. Most plan their stops using their phones on the go. We set up campaigns and optimize Google maps so out-of-state visitors see your place first when searching for meals, gear, lodging, or repairs.',
            category: 'LOCAL GROWTH'
          },
          {
            question: 'When should I start so I am ready for the busy season?',
            answer: 'The sooner the better, but ideally a few months prior to the Spring or Summer rush. SEO and content creation take time to be effective, so if you start early, your website will be ready to capture peak-season traffic before visitors even arrive.',
            category: 'STRATEGY'
          },
          {
            question: 'How long until I actually see results from SEO?',
            answer: 'Most clients notice movement within three to six months, with bigger gains after that. SEO is steady, not instant, because search engines need time to crawl your site, register changes, and build trust in your content. Once momentum kicks in, the leads continue rolling in.',
            category: 'SEO'
          },
          {
            question: 'How does a Google Business Profile help me get found?',
            answer: 'It is often the first thing both locals and travelers see, and it drives real action. A polished profile brings you: more phone calls, direction requests on maps, click-throughs to your website, and verified customer reviews that give buyers instant peace of mind.',
            category: 'GMB'
          },
          {
            question: 'What does all of this cost for a small Wyoming business?',
            answer: 'It depends on your goals, and we build plans that fit real local budgets. You do not need a big-city marketing spend to compete here. We start with what will bring you the quickest return, then expand as revenue grows.',
            category: 'PRICING'
          },
          {
            question: 'Will my website still work on slow rural connections?',
            answer: 'Yes, and we design for that on purpose. Plenty of Wyoming runs on slower or spotty internet, so we build lightweight, fast-loading sites that open cleanly whether your visitor is on high-speed fiber in town or pulling one bar of cell service out in the country.',
            category: 'DEVELOPMENT'
          },
          {
            question: 'Do you handle everything yourself or send it off somewhere?',
            answer: 'Everything is done in-house. You will always communicate directly with the team executing the work who understands your brand and vision, without dealing with third-party outsourcing or confusing handoffs.',
            category: 'SERVICES'
          },
          {
            question: 'Why pick a local Wyoming agency over a big national one?',
            answer: 'Local knowledge is everything. We understand wide-reaching regions, local pride, and seasonal tourism because we focus on real regional outcomes rather than treating you like a generic support ticket in a call center.',
            category: 'GENERAL'
          }
        ]
      },
      updatedAt: new Date()
    };

    // Upsert /usa/wyoming
    const res1 = await pagesCol.updateOne(
      { slug: wyomingPage.slug },
      { $set: wyomingPage },
      { upsert: true }
    );
    console.log(`✅ Upserted /${wyomingPage.slug}:`, res1.upsertedId ? 'Created new' : 'Updated existing');

    // Also upsert alias slug 'wyoming' pointing to same state template so both /wyoming and /usa/wyoming work seamlessly
    const wyomingAlias = {
      ...wyomingPage,
      slug: 'wyoming'
    };
    await pagesCol.updateOne(
      { slug: 'wyoming' },
      { $set: wyomingAlias },
      { upsert: true }
    );
    console.log(`✅ Upserted alias /wyoming`);

    console.log(`🎉 Wyoming State Page seeded successfully!`);
  } catch (err) {
    console.error('Error seeding Wyoming:', err);
  } finally {
    await client.close();
  }
}

seedWyoming();
