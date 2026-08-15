import mongoose from 'mongoose';

const RedirectSchema = new mongoose.Schema({
  sourceUrl: { type: String, required: true },
  targetUrl: { type: String, required: true },
  statusCode: { type: Number, required: true, enum: [301, 302, 307, 308], default: 301 },
  queryParamMode: { type: String, required: true, enum: ['exact', 'ignore', 'pass'], default: 'exact' },
  ignoreCase: { type: Boolean, default: false },
  ignoreSlash: { type: Boolean, default: false },
  isRegex: { type: Boolean, default: false },
  status: { type: String, required: true, enum: ['active', 'disabled'], default: 'active' },
  notes: { type: String, default: '' },
  hits: { type: Number, default: 0 },
  lastAccessed: { type: Date, default: null }
}, { timestamps: true });

// Clear cache in development to prevent HMR mongoose model reuse mismatch
if (process.env.NODE_ENV === 'development') {
  delete (mongoose.models as any).Redirect;
}

export default mongoose.models.Redirect || mongoose.model('Redirect', RedirectSchema);
