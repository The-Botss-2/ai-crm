import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const memberSchema = new Schema({
  id: {
    type: Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'agent', 'readonly'],
    required: true,
  }
}, { _id: false });

const teamSchema = new Schema({
  name: { type: String, required: true },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
  },
  members: [memberSchema],
}, { timestamps: true });

export default models.Team || model('Team', teamSchema);
