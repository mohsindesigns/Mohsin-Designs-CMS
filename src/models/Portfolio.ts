import mongoose, { Schema } from 'mongoose';

// Individual Portfolio case-study items. Mirrors src/models/Post.ts's conventions (own slug,
// status + soft-delete, shared seo block shape) but is a fully separate collection - there is no
// relation to Post. `services` stores the linked service id STRINGS from the SiteContent
// singleton's `data.services.services` catalog (there is no separate Services collection), never
// Mongoose ObjectId refs.

const MetricSchema = new Schema(
  {
    value: { type: String, default: '' },
    label: { type: String, default: '' },
  },
  { _id: false }
);

const GalleryImageSchema = new Schema(
  {
    image: { type: String, default: '' },
    label: { type: String, default: '' },
  },
  { _id: false }
);

const ApproachStepSchema = new Schema(
  {
    number: { type: String, default: '' },
    title: { type: String, default: '' },
    body: { type: String, default: '' },
  },
  { _id: false }
);

const SeoSchema = new Schema(
  {
    metaTitle: String,
    metaDescription: String,
    focusKeyword: String,
    canonicalUrl: String,
    metaRobotsIndex: { type: String, default: 'index' },
    metaRobotsFollow: { type: String, default: 'follow' },
    ogTitle: String,
    ogDescription: String,
    ogImage: String,
    twitterCard: { type: String, default: 'summary_large_image' },
    twitterTitle: String,
    twitterDescription: String,
    twitterImage: String,
    featuredImage: String,
    featuredImageAlt: String,
    breadcrumbTitle: String,
    schemaData: String,
  },
  { _id: false }
);

const PortfolioSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },

    client: { type: String, default: '' },
    industry: { type: String, default: '' },
    summary: { type: String, default: '' },

    // Service catalog ids (SiteContent.data.services.services[].id), NOT ObjectIds.
    services: { type: [String], default: [] },

    thumbnail: { type: String, default: '' },
    thumbnailLabel: { type: String, default: '' },
    metrics: { type: [MetricSchema], default: [] },

    // Only one item should be featured at a time - enforced best-effort in the admin API (unsetting
    // every other item's flag when one is marked featured) rather than a hard DB constraint, so an
    // in-progress edit never gets rejected.
    featured: { type: Boolean, default: false },

    location: { type: String, default: '' },
    timeline: { type: String, default: '' },
    liveUrl: { type: String, default: '' },

    tags: { type: [String], default: [] },
    nextProjectSlug: { type: String, default: '' },

    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishedAt: { type: Date, default: Date.now },

    sections: {
      heroImage: {
        enabled: { type: Boolean, default: true },
        image: { type: String, default: '' },
        alt: { type: String, default: '' },
      },
      challenge: {
        enabled: { type: Boolean, default: true },
        heading: { type: String, default: '' },
        body: { type: String, default: '' },
        bulletPoints: { type: [String], default: [] },
      },
      approach: {
        enabled: { type: Boolean, default: true },
        heading: { type: String, default: '' },
        steps: { type: [ApproachStepSchema], default: [] },
      },
      beforeAfter: {
        enabled: { type: Boolean, default: true },
        heading: { type: String, default: '' },
        beforeImage: { type: String, default: '' },
        beforeLabel: { type: String, default: '' },
        afterImage: { type: String, default: '' },
        afterLabel: { type: String, default: '' },
      },
      gallery: {
        enabled: { type: Boolean, default: true },
        heading: { type: String, default: '' },
        images: { type: [GalleryImageSchema], default: [] },
      },
      results: {
        enabled: { type: Boolean, default: true },
        heading: { type: String, default: '' },
        stats: { type: [MetricSchema], default: [] },
        proofImage: { type: String, default: '' },
      },
      testimonial: {
        enabled: { type: Boolean, default: true },
        quote: { type: String, default: '' },
        authorName: { type: String, default: '' },
        authorRole: { type: String, default: '' },
        authorAvatar: { type: String, default: '' },
      },
    },

    seo: { type: SeoSchema, default: () => ({}) },

    isTrashed: { type: Boolean, default: false },
    trashedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

PortfolioSchema.index({ status: 1, isTrashed: 1, slug: 1 });
PortfolioSchema.index({ status: 1, publishedAt: -1 });

// Clear cache in development to prevent HMR mongoose schema mismatch (same pattern as Page.ts).
if (process.env.NODE_ENV === 'development') {
  delete (mongoose.models as any).Portfolio;
}

export default mongoose.models.Portfolio || mongoose.model('Portfolio', PortfolioSchema);
