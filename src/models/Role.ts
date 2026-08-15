import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., 'Admin', 'Editor', 'SEO Manager'
  permissions: {
    pages: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: true },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      publish: { type: Boolean, default: false },
    },
    media: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: true },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
    seo: {
      read: { type: Boolean, default: true },
      update: { type: Boolean, default: false },
    },
    blog: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: true },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      publish: { type: Boolean, default: false },
    },
    submissions: {
      read: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
    settings: {
      read: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
    },
    users: {
      read: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
    logs: {
      read: { type: Boolean, default: false },
    }
  },
  isCustom: { type: Boolean, default: true }, // To distinguish system roles from user-defined ones
}, { timestamps: true });

export default mongoose.models.Role || mongoose.model('Role', RoleSchema);
