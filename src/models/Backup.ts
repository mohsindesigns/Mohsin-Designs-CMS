import mongoose from 'mongoose';

export interface IBackup extends mongoose.Document {
  type: 'complete_db' | 'page' | 'services';
  label: string;
  section?: string;
  entityId?: string;
  user: string;
  data: any;
  metadata?: {
    servicesCount?: number;
    pagesCount?: number;
    blogsCount?: number;
    description?: string;
  };
  createdAt: Date;
}

const BackupSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['complete_db', 'page', 'services'],
    default: 'complete_db',
    required: true,
    index: true
  },
  label: { type: String, required: true },
  section: { type: String, index: true },
  entityId: { type: String, index: true },
  user: { type: String, default: 'admin' },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Index to quickly fetch latest backups
BackupSchema.index({ createdAt: -1 });
BackupSchema.index({ type: 1, createdAt: -1 });

export default mongoose.models.Backup || mongoose.model<IBackup>('Backup', BackupSchema);
