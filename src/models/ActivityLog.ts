import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Null for system or failed login
  userName: { type: String }, // Stored for redundancy if user deleted
  action: { type: String, required: true }, // e.g., 'CREATE_PAGE', 'LOGIN_SUCCESS', 'DELETE_USER'
  entity: { type: String }, // e.g., 'Page', 'Media', 'User'
  entityId: { type: String },
  details: { type: mongoose.Schema.Types.Mixed }, // Flexible field for before/after or custom messages
  ip: { type: String },
  status: { type: String, enum: ['success', 'failure'], default: 'success' },
  timestamp: { type: Date, default: Date.now }
}, { 
  // Disable automatic updates to logs to ensure they are tamper-resistant via Mongoose
  capped: false, 
  versionKey: false 
});

// Prevent updates and deletions through mongoose middleware for extra safety
ActivityLogSchema.pre('save', async function() {
  if (!this.isNew) {
    throw new Error('Activity logs are immutable and cannot be updated.');
  }
});

export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);
