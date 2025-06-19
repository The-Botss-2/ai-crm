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
    enum: ['admin', 'manager', 'agent', 'readonly', 'bot'],
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
  logo: { type: String, default: "https://cdn-icons-png.flaticon.com/512/10872/10872139.png" },
  agent: { type: String },
  members: [memberSchema],
}, { timestamps: true });

export default models.Team || model('Team', teamSchema);
