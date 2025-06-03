import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface KnowledgeBaseDocument extends Document {
  user_id: mongoose.Types.ObjectId;
  team_id: mongoose.Types.ObjectId;
  text: string;
  file: { file_name: string; url: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema = new Schema(
  {
    file_name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const KnowledgeBaseSchema: Schema<KnowledgeBaseDocument> = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
    },
    team_id: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    text: {
      type: String,
      default: 'Knowledge Base Needs to be configured', // ✅ default value instead of required
    },
    file: {
      type: [FileSchema],
      default: [], // ✅ optional field with safe default
    },
  },
  {
    timestamps: true,
  }
);

// 🔒 Ensure one entry per (user_id, team_id)
KnowledgeBaseSchema.index({ user_id: 1, team_id: 1 }, { unique: true });

const KnowledgeBase =
  models.KnowledgeBase || model<KnowledgeBaseDocument>('KnowledgeBase', KnowledgeBaseSchema);

export default KnowledgeBase;
