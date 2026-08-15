import mongoose, { Schema } from 'mongoose';

const CategorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  count: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
