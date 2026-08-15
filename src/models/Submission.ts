import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubmission extends Document {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  type: string;
  source: string;
  attachmentUrl?: string;
  extraData?: Record<string, any>;
  createdAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String },
    message: { type: String, required: false, default: "" },
    type: { type: String, default: "Contact Form" },
    source: { type: String, default: "Website" },
    attachmentUrl: { type: String },
    extraData: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Delete the model if it exists to ensure schema updates are applied in development
if (mongoose.models.Submission) {
  delete mongoose.models.Submission;
}

const Submission: Model<ISubmission> = mongoose.model<ISubmission>("Submission", SubmissionSchema);

export default Submission;
