import mongoose from 'mongoose';

const SiteContentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g., "complete_data"
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true, collection: 'site_contents' }); // Explicitly set collection name

export default mongoose.models.SiteContent || mongoose.model('SiteContent', SiteContentSchema);
