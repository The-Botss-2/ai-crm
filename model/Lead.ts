import mongoose from 'mongoose';

const leadStatusEnum = [
  'new',
  'contacted',
  'qualified',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
];

const leadSchema = new mongoose.Schema(
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
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: leadStatusEnum,
      default: 'new',
    },
    source: {
      type: String,
      default: 'not added yet',
    },
    notes: {
      type: String,
      default: 'not added yet',
    },
    assignedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

export default mongoose.models.Lead || mongoose.model('Lead', leadSchema);
