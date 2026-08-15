import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  alt: { type: String, default: "" },
  title: { type: String, default: "" },
  description: { type: String, default: "" },
  width: { type: Number },
  height: { type: Number },
  publicId: { type: String }, // For Cloudinary
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Media || mongoose.model("Media", MediaSchema);
