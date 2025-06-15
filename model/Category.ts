import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: 'not added yet',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Category || mongoose.model('Category', categorySchema);
