import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function seedPreciseWyoming() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'mdseo2025';

  if (!uri) {
    console.error('MONGODB_URI is not set');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const pagesCol = db.collection('pages');

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
        ogImage: '/uploads/wp-media/hero-image-1.webp',
        twitterCard: 'summary_large_image',
        twitterTitle: 'Wyoming Digital Marketing Agency | Growth & Results',
        twitterDescription: 'Mohsin Designs is the Wyoming digital marketing agency built for local growth. SEO, web design, branding and ads that bring in real customers. Get a free quote.',
        twitterImage: '/uploads/wp-media/hero-image-1.webp',
        breadcrumbTitle: 'Wyoming'
      },
      content: {
        // 1. Hero
        hero: {
          enabled: true,
          badge: 'Trusted by 3,000+ US Businesses',
          titleLine1: 'The Wyoming Digital Marketing Agency',
          titleHighlight: 'Built to Grow Local Brands',
          titleLine2: 'Built to Grow Local Brands',
          titleConnector: ' ',
          description: '<p>Wyoming’s population is less than most major metropolitan areas. Because of this, we value each individual customer more than almost any other place. Mohsin Designs is a Wyoming digital marketing agency that offers services to help ranchers, shops, clinics, and other busy service crews in Cheyenne, Casper, Laramie, and the areas in between. We help you get found by potential customers searching your business. Depending on your goals, we offer services in SEO, branding, and digital advertising to help you maximize potential customers and increase your business’s daily operations.</p>',
          image: '/uploads/wp-media/hero-image-1.webp',
          bgImage: '/uploads/wp-media/hero-image-1.webp',
          buttons: [
            { text: 'Get A Free Quote', href: '#contact', primary: true },
            { text: 'Our Services', href: '#services', primary: false }
          ]
        },

        // 2. No About Owner on Wyoming live page
        about: {
          enabled: false
        },
        aboutOwner: {
          enabled: false
        },

        // 3. Services: The 11 exact Wyoming services
        services: {
          enabled: true,
          sectionTag: 'OUR SERVICES',
          titleIntro: 'The Services That Turn Wyoming Searches Into ',
          titleHighlight: 'Real Sales',
          description: 'A strong online presence now decides who wins the local job in Wyoming. As your Wyoming digital marketing agency, we pull search, design, content, and paid ads into one clear plan that fits your market and budget. Here is how each service earns its keep:',
          list: [
            {
              title: 'Search Engine Optimization',
              category: 'Visibility',
              tag: 'Visibility',
              desc: 'Ranking high means nothing if the wrong people see you. We study the exact phrases your buyers type, fix the technical faults slowing your site down, and build lasting authority. Our search engine optimization work targets proximity and real intent, so a person hunting a roofer in Gillette or a dentist in Sheridan finds you first.',
              slug: 'search-engine-optimization'
            },
            {
              title: 'Content Marketing',
              category: 'Authority',
              tag: 'Authority',
              desc: 'You build trust with potential customers by showing you care before they consider buying. We create blogs, landing pages, and service copy for Wyoming brands that offer seasonal and fair pricing. Your ranking higher on search engines is only the start. Our content marketing services keep readers on the page longer and guide them through the process towards working with you.',
              slug: 'content-marketing'
            },
            {
              title: 'Google Ads (PPC)',
              category: 'Paid Search',
              tag: 'Paid Search',
              desc: "Search ads place you in front of buyers at the precise moment of decision. We handle everything from bids and copy to keyword placement and tracking to ensure every cent works. Instead of wasting your budget, we apply Google's Ads management and tight geo-targeting so you only pay for clicks from the Wyoming towns you plan to serve every single day.",
              slug: 'google-ads'
            },
            {
              title: 'Meta Ads',
              category: 'Social Ads',
              tag: 'Social Ads',
              desc: 'Facebook and Instagram are where plenty of Wyoming spends its quiet downtime. We run Meta ads with thumb-stopping visuals and words that actually land, from first awareness all the way to retargeting warm leads. Our Meta Ads management lowers your cost per lead and keeps buyers circling right back around to you time and time again.',
              slug: 'meta-ads'
            },
            {
              title: 'Social Media Management',
              category: 'Engagement',
              tag: 'Engagement',
              desc: 'Your customers scroll for hours, and staying consistent is what keeps you on their minds. We plan, design, and post content that sparks real conversations instead of empty likes. Our social media management builds a loyal local following over time and slowly turns quiet followers into loyal regulars who happily buy from you again and again.',
              slug: 'social-media-management'
            },
            {
              title: 'GMB Optimization',
              category: 'Local Maps',
              tag: 'Local Maps',
              desc: 'Most local buyers size you up before clicking, straight from your map listing. We sharpen your details, add strong photos, manage reviews, and post updates that show you are active. Our GMB optimization pushes you into the local map pack, driving more calls, more visits, and more directions requests from ready buyers right down the road.',
              slug: 'gmb-optimization'
            },
            {
              title: 'Logo Design',
              category: 'Branding',
              tag: 'Branding',
              desc: 'A clear logo quietly works for you every single day, on trucks, signs, and glowing screens. We craft marks that feel true to your brand and read well at any size. Our logo design gives you an identity locals recognize on a crowded Main Street or during a fast highway drive-by past your busy little shop.',
              slug: 'logo-design'
            },
            {
              title: 'Graphic Design',
              category: 'Creative Media',
              tag: 'Creative Media',
              desc: 'Good design earns a second look, and that second look often earns the actual sale. We handle your social posts, banners, flyers, and full visual kit with your story kept front and center. Our graphic design keeps every single piece sharp, consistent, and clearly yours across every place people meet your brand, online or in person.',
              slug: 'graphic-design'
            },
            {
              title: 'Website Development',
              category: 'Engineering',
              tag: 'Engineering',
              desc: "Your site should be your hardest working salesperson, open and selling all night long. We build fast, mobile-ready, search-friendly sites that turn plain visitors into real leads. Our website development suits a simple brochure site or a full online store, and it loads well even on Wyoming's slower rural connections out in the wide open country.",
              slug: 'web-development'
            },
            {
              title: 'UI/UX Design',
              category: 'Experience',
              tag: 'Experience',
              desc: 'A pretty site that confuses people still loses you money every day. We map clean layouts that guide visitors straight toward booking or buying, with no dead ends in the way. Our UI/UX design builds trust fast, cuts your bounce rate, and lifts the conversion rate where it truly counts the most for your bottom line.',
              slug: 'ui-ux-design'
            },
            {
              title: 'App Development',
              category: 'Mobile Apps',
              tag: 'Mobile Apps',
              desc: 'For any repeat-service brand, an app turns one-time buyers into loyal regulars who stay close. We build clean, dependable apps that make booking, ordering, or checking in feel effortless. Our app development gives your Wyoming customers a simple, friendly reason to keep your business just one quick tap away whenever they happen to need you most.',
              slug: 'app-development'
            }
          ]
        },

        // 4. Portfolio: Brands That Bet on Us and Won Big
        portfolio: {
          enabled: true,
          sectionTag: 'CASE STUDIES',
          titleIntro: 'Brands That Bet on Us and ',
          titleHighlight: 'Won Big',
          description: 'Watching a business turn the corner never gets old, and we have seen it happen again and again. As a growth-focused Wyoming digital marketing agency, we take on messy, stuck problems, apply what truly works, and let the results speak for themselves:',
          projects: [
            {
              brand: 'Burish Builders',
              title: 'Burish Builders',
              subtitle: 'Construction & Contracting',
              desc: 'Burish Builders did solid work, but their brand looked dated next to newer crews, and they barely showed up when locals searched for contractors. Good jobs kept slipping away to competitors with a louder online presence.',
              challenge: 'Burish Builders did solid work, but their brand looked dated next to newer crews, and they barely showed up when locals searched for contractors. Good jobs kept slipping away to competitors with a louder online presence.',
              approach: 'We refreshed their brand, rebuilt the site around the services that actually bring in work, and reworked their SEO to focus on the towns they serve. Clear project galleries finally showed off the quality of their builds.',
              whatWeDid: 'We refreshed their brand, rebuilt the site around the services that actually bring in work, and reworked their SEO to focus on the towns they serve. Clear project galleries finally showed off the quality of their builds.',
              image: '/uploads/wp-media/burish-builder-mockup.png',
              stats: [
                { label: 'Website Traffic', value: '+300%', iconName: 'TrendingUp' },
                { label: 'Qualified Leads', value: '+38%', iconName: 'Users' },
                { label: 'Timeline', value: '4 Months', iconName: 'Award' }
              ]
            },
            {
              brand: 'Blue Sky Pediatrics',
              title: 'Blue Sky Pediatrics',
              subtitle: 'Healthcare & Medical Clinic',
              desc: 'Parents choosing a pediatrician want to feel safe before they even call. Blue Sky Pediatrics had a cold, clunky site that was hard to use and nearly invisible in search, so families kept picking better-known names.',
              challenge: 'Parents choosing a pediatrician want to feel safe before they even call. Blue Sky Pediatrics had a cold, clunky site that was hard to use and nearly invisible in search, so families kept picking better-known names.',
              approach: 'We built a warm, welcoming brand, tuned their SEO for local parent searches, and designed a simple site that felt reassuring from the very first click. Booking and contact steps became far easier to follow.',
              whatWeDid: 'We built a warm, welcoming brand, tuned their SEO for local parent searches, and designed a simple site that felt reassuring from the very first click. Booking and contact steps became far easier to follow.',
              image: '/uploads/wp-media/blue-sky-mockup.webp',
              stats: [
                { label: 'Online Visibility', value: "+180%", iconName: 'TrendingUp' },
                { label: 'Parent Inquiries', value: "+40%", iconName: 'Users' },
                { label: 'Timeline', value: '5 Months', iconName: 'Award' }
              ]
            },
            {
              brand: 'Palco Claims',
              title: 'Palco Claims',
              subtitle: 'Property Insurance Claims',
              desc: 'Palco Claims handles property insurance claims, but they struggled to explain their value online and looked less credible than they truly were. Prospects could not tell what set them apart, so trust stayed low.',
              challenge: 'Palco Claims handles property insurance claims, but they struggled to explain their value online and looked less credible than they truly were. Prospects could not tell what set them apart, so trust stayed low.',
              approach: 'We modernized their logo, tightened their SEO, and built a clear, detailed site that laid out their whole process in plain language and gently invited inquiries at every step of the page.',
              whatWeDid: 'We modernized their logo, tightened their SEO, and built a clear, detailed site that laid out their whole process in plain language and gently invited inquiries at every step of the page.',
              image: '/uploads/wp-media/Palco-mockup.webp',
              stats: [
                { label: 'Search Climb', value: "+210%", iconName: 'TrendingUp' },
                { label: 'Qualified Inquiries', value: 'Record Flow', iconName: 'Users' },
                { label: 'Timeline', value: '6 Months', iconName: 'Award' }
              ]
            },
            {
              brand: '410 Muscle Therapy',
              title: '410 Muscle Therapy',
              subtitle: 'Recovery & Physical Wellness',
              desc: '410 Muscle Therapy got lost in a crowded recovery market and struggled to explain exactly what they offered. Plenty of potential clients scrolled right past without ever understanding how they could help.',
              challenge: '410 Muscle Therapy got lost in a crowded recovery market and struggled to explain exactly what they offered. Plenty of potential clients scrolled right past without ever understanding how they could help.',
              approach: 'We rolled out a sharper brand, lifted their SEO around recovery and therapy searches, and built a site aimed squarely at people who were actively looking for real relief.',
              whatWeDid: 'We rolled out a sharper brand, lifted their SEO around recovery and therapy searches, and built a site aimed squarely at people who were actively looking for real relief.',
              image: '/uploads/wp-media/410-mockup.webp',
              stats: [
                { label: 'Client Sign-ups', value: "+250%", iconName: 'TrendingUp' },
                { label: 'Brand Awareness', value: 'Top Tier', iconName: 'Users' },
                { label: 'Timeline', value: '6 Months', iconName: 'Award' }
              ]
            }
          ]
        },

        // 5. Trusted Brands
        trustedBrands: {
          enabled: true,
          sectionTag: 'TRUSTED PARTNERS',
          title: 'Trusted By Leading Brands',
          subtitle: 'Here are some of the brands that rely on our creative and digital expertise.',
          brands: [
            { name: 'American Stone Sealer', logo: '/uploads/wp-media/American-Stone-Sealer.jpg' },
            { name: 'Redtail Roofing', logo: '/uploads/wp-media/Redtail-Roofing.jpg' },
            { name: 'Raise Up Youth', logo: '/uploads/wp-media/Raise-Up-Youth.jpg' },
            { name: 'Precision Gutters', logo: '/uploads/wp-media/Precision-Gutters.jpg' },
            { name: 'Dessert Performance Part', logo: '/uploads/wp-media/Dessert-Performance-Part.jpg' },
            { name: 'Corporate Hiring Solutions', logo: '/uploads/wp-media/Corporate-Hiring-Solutions.jpg' },
            { name: 'Cooper Land Management', logo: '/uploads/wp-media/Cooper-Land-Management.jpg' },
            { name: 'Burks Wood milling', logo: '/uploads/wp-media/Burks-Wood-milling.jpg' },
            { name: 'Adams Pipe And Plumbing', logo: '/uploads/wp-media/Adams-Pipe-And-Plumbing.jpg' },
            { name: 'All Stars Exteriors', logo: '/uploads/wp-media/All-Stars-Exteriors.jpg' }
          ]
        },

        // 6. Testimonials (Google Reviews from Trustindex)
        testimonials: {
          enabled: true,
          sectionTag: 'CLIENT PRAISE & REVIEWS',
          titleIntro: 'Trusted by Local Owners, ',
          titleHighlight: 'Proven by Real Reviews',
          description: 'Verified Google reviews from businesses and partners who trust Mohsin Designs for their digital growth.',
          scorecardRating: '5.0/5',
          scorecardRatingLabel: 'OVERALL',
          scorecardTitle: 'TOP RATED ENGINEERING & MARKETING',
          scorecardSub: 'VERIFIED 5-STAR REVIEWS ON GOOGLE',
          reviews: [
            {
              id: 'wy-rev-1',
              name: 'Cayne Seymour',
              role: 'Business Owner',
              company: 'Google Verified Review',
              quote: 'Great work and detail!',
              rating: 5,
              column: 1,
              avatarBg: 'bg-[#0306AC]'
            },
            {
              id: 'wy-rev-2',
              name: 'Kayla Lynn',
              role: 'Client',
              company: 'Google Verified Review',
              quote: 'We used Mohsin Designs for our website and 10000% recommend Muhammad. He was so patient with us and really brought our vision to life. He was super helpful and we will definitely use him in the future!',
              rating: 5,
              column: 1,
              avatarBg: 'bg-emerald-600'
            }
          ]
        },

        // 7. Why Choose Us: Exact Wyoming reasons & statistics
        whyChooseUs: {
          enabled: true,
          sectionTag: 'Methodology',
          titleIntro: 'Why Wyoming Owners Stop Shopping Around ',
          titleHighlight: 'Once They Find Us',
          subtext: 'Owners across the state pick the right Wyoming digital marketing agency the same way they pick a trusted ranch hand, on proven results, plain honesty, and work that clearly holds up over time. Here is what keeps our clients coming back season after season, and why that first choice usually grows into a partnership that lasts for years.',
          stats: [
            {
              value: '95%',
              label: 'Client Retention Rate',
              sublabel: 'Over ninety percent return for more projects because the results are real and easy to track',
              percentage: 0.99
            },
            {
              value: '0',
              label: 'Outsourcing',
              sublabel: 'Every project runs in-house from first sketch to final launch with zero middlemen',
              percentage: 0.95
            },
            {
              value: '3K+',
              label: 'Clients Served',
              sublabel: 'Over 3,000 clients across 50+ industries worldwide since 2019',
              percentage: 0.9
            }
          ],
          reasons: [
            {
              num: '01',
              title: '95%+ Client Retention Rate',
              desc: 'Most of our clients come back, and that is the part we are proudest of. Over ninety percent return for more projects because the results are real and easy to track. Whether it is SEO, a fresh site, or branding, the work holds up and the referrals keep rolling steadily in.',
              description: 'Most of our clients come back, and that is the part we are proudest of. Over ninety percent return for more projects because the results are real and easy to track. Whether it is SEO, a fresh site, or branding, the work holds up and the referrals keep rolling steadily in.',
              iconName: 'Award',
              icon: 'Award'
            },
            {
              num: '02',
              title: 'Zero Outsourcing',
              desc: 'Every project runs in-house from the first sketch to the final launch, which keeps quality tight and steady. There are no middlemen, no messy handoffs, and no surprise delays along the way. You get direct, personal work built around your goals, with nothing watered down and nothing passed to a stranger.',
              description: 'Every project runs in-house from the first sketch to the final launch, which keeps quality tight and steady. There are no middlemen, no messy handoffs, and no surprise delays along the way. You get direct, personal work built around your goals, with nothing watered down and nothing passed to a stranger.',
              iconName: 'Shield',
              icon: 'Shield'
            },
            {
              num: '03',
              title: '7+ Years and 3,000+ Clients',
              desc: 'Since 2019 we have served more than three thousand clients around the world, including plenty of United States businesses across fifty-plus industries. That kind of range, built over seven-plus years, gives us a sharp read on what actually works inside a spread-out, competitive market like the one you face in Wyoming.',
              description: 'Since 2019 we have served more than three thousand clients around the world, including plenty of United States businesses across fifty-plus industries. That kind of range, built over seven-plus years, gives us a sharp read on what actually works inside a spread-out, competitive market like the one you face in Wyoming.',
              iconName: 'Sparkles',
              icon: 'Sparkles'
            },
            {
              num: '04',
              title: 'Client Revenue',
              desc: 'We have delivered over five million dollars in revenue for clients through smart strategy and strong visual identities that people remember. We would honestly rather show proof than make big promises, so our case studies quietly back up every claim. The wins are real, they repeat, and they hold up nicely.',
              description: 'We have delivered over five million dollars in revenue for clients through smart strategy and strong visual identities that people remember. We would honestly rather show proof than make big promises, so our case studies quietly back up every claim. The wins are real, they repeat, and they hold up nicely.',
              iconName: 'TrendingUp',
              icon: 'TrendingUp'
            },
            {
              num: '05',
              title: 'Brand Strategy',
              desc: 'No two Wyoming brands are ever quite the same, so we never paste an old plan onto a fresh business. From scrappy new startups to enterprise-level work, we stay locked on long-term, sustainable growth you can feel. Together we build a solid base your brand can keep growing on for years.',
              description: 'No two Wyoming brands are ever quite the same, so we never paste an old plan onto a fresh business. From scrappy new startups to enterprise-level work, we stay locked on long-term, sustainable growth you can feel. Together we build a solid base your brand can keep growing on for years.',
              iconName: 'Rocket',
              icon: 'Rocket'
            }
          ]
        },

        // 8. Service Area
        serviceArea: {
          enabled: true,
          titleIntro: 'From Cheyenne to Jackson, We Get ',
          titleHighlight: 'You Found Everywhere',
          description: 'From Cheyenne storefronts to Jackson tourist hotspots and the quiet towns along I-80, we help your business get found by the nearby customers who are ready to call, visit, and buy right now.',
          ctaText: "Let's Work Together",
          ctaHref: '/contact-us',
          hubs: [
            {
              id: 'wy-gillette',
              name: 'Gillette, USA',
              focus: 'Commerce & Industrial Hub',
              timezone: 'MST',
              link: 'https://mohsindesigns.com/usa/wyoming/gillette/'
            },
            {
              id: 'wy-casper',
              name: 'Casper, USA',
              focus: 'Central Commercial Hub',
              timezone: 'MST',
              link: 'https://mohsindesigns.com/usa/wyoming/casper/'
            },
            {
              id: 'wy-sheridan',
              name: 'Sheridan, USA',
              focus: 'Northern Business Center',
              timezone: 'MST',
              link: 'https://mohsindesigns.com/usa/wyoming/sheridan/'
            },
            {
              id: 'wy-jackson',
              name: 'Jackson, USA',
              focus: 'Tourism & Resort Hub',
              timezone: 'MST',
              link: 'https://mohsindesigns.com/usa/wyoming/jackson/'
            },
            {
              id: 'wy-powell',
              name: 'Powell, USA',
              focus: 'Agricultural Valley Hub',
              timezone: 'MST',
              link: 'https://mohsindesigns.com/usa/wyoming/powell/'
            },
            {
              id: 'wy-cheyenne',
              name: 'Cheyenne, USA',
              focus: 'Capital Enterprise Hub',
              timezone: 'MST',
              link: 'https://mohsindesigns.com/usa/wyoming/cheyenne/'
            }
          ]
        },

        // 9. All 10 FAQs
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
        ],

        // 10. Contact Section
        contact: {
          enabled: true,
          title: 'Let’s Build Something You’re Proud Of!',
          description: 'No corporate jargon. No cookie-cutter templates. Just quality design and marketing, done with care, for people who care about their business.'
        }
      },
      updatedAt: new Date()
    };

    // Update /usa/wyoming
    delete wyomingPage._id;
    await pagesCol.updateOne(
      { slug: 'usa/wyoming' },
      { $set: wyomingPage },
      { upsert: true }
    );
    console.log('✅ Updated /usa/wyoming with 100% authentic Wyoming data!');

    // Update alias /wyoming
    const wyomingAlias = { ...wyomingPage, slug: 'wyoming' };
    delete wyomingAlias._id;
    await pagesCol.updateOne(
      { slug: 'wyoming' },
      { $set: wyomingAlias },
      { upsert: true }
    );
    console.log('✅ Updated alias /wyoming with 100% authentic Wyoming data!');

    console.log('🎉 Precise Wyoming database seed complete!');
  } catch (err) {
    console.error('Error seeding precise Wyoming:', err);
  } finally {
    await client.close();
  }
}

seedPreciseWyoming();
