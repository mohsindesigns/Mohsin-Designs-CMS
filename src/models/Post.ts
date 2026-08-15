import mongoose, { Schema } from 'mongoose';
import './User';
import './Category';
import './Tag';

const PostSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true }, // HTML from Tiptap
  excerpt: { type: String },
  featuredImage: { type: String },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
  location: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'scheduled'], 
    default: 'draft' 
  },
  publishedAt: { type: Date, default: Date.now },
  seo: {
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
    featuredImage: String,
    featuredImageAlt: String
  },
  faq: [{
    question: String,
    answer: String
  }],
  faqSchemaMarkup: { type: String, default: '' },
  faqBadge: { type: String, default: '' },
  faqTitle: { type: String, default: '' },
  faqDescription: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isTrashed: { type: Boolean, default: false },
  trashedAt: { type: Date, default: null }
}, { timestamps: true });

if (mongoose.models.Post) {
  delete mongoose.models.Post;
}

export default mongoose.models.Post || mongoose.model('Post', PostSchema);
