import connectToDatabase from './mongodb';
import ActivityLog from '@/models/ActivityLog';

interface LogOptions {
  user?: string;
  userName?: string;
  action: string;
  entity?: string;
  entityId?: string;
  details?: {
    before?: any;
    after?: any;
    message?: string;
    [key: string]: any;
  };
  ip?: string;
  status?: 'success' | 'failure';
}

export async function recordActivity(options: LogOptions) {
  try {
    await connectToDatabase();
    await ActivityLog.create(options);
  } catch (err) {
    console.error("Critical: Failed to record activity log:", err);
  }
}
