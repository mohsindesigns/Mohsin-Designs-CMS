import mongoose from 'mongoose';

const PageSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  template: { 
    type: String, 
    required: true, 
    enum: [
      'home', 
      'about', 
      'team', 
      'careers', 
      'reviews', 
      'faq', 
      'contact', 
      'gallery', 
      'services', 
      'service-detail',
      'service-area'
    ] 
  },
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
  seo: {
    metaTitle: { type: String },
    metaDescription: { type: String },
    focusKeyword: { type: String },
    canonicalUrl: { type: String },
    metaRobotsIndex: { type: String, enum: ['index', 'noindex'], default: 'index' },
    metaRobotsFollow: { type: String, enum: ['follow', 'nofollow'], default: 'follow' },
    ogTitle: { type: String },
    ogDescription: { type: String },
    ogImage: { type: String },
    twitterCard: { type: String, enum: ['summary', 'summary_large_image'], default: 'summary_large_image' },
    twitterTitle: { type: String },
    twitterDescription: { type: String },
    twitterImage: { type: String },
    schemaData: { type: String }, // JSON string for structured data
    breadcrumbTitle: { type: String },
    featuredImage: { type: String },
    featuredImageAlt: { type: String },
  },
  // This could store page-specific overrides if needed later
  content: { type: mongoose.Schema.Types.Mixed, default: {} },
  isTrashed: { type: Boolean, default: false },
  trashedAt: { type: Date, default: null },
}, { timestamps: true });

// Clear cache in development to prevent HMR mongoose enum mismatch
if (process.env.NODE_ENV === 'development') {
  delete (mongoose.models as any).Page;
}

export default mongoose.models.Page || mongoose.model('Page', PageSchema);
