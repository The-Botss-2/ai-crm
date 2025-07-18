import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;
const memberSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  role: {
    type: String,
    enum: ['admin', 'manager', 'agent', 'bot'],
    required: true,
  },
  access: {
    dashboard: { type: [String], enum: ['none', 'read', 'write', 'update', 'delete'], default: [] },
    leads: { type: [String], enum: ['none', 'read', 'write', 'update', 'delete'], default: [] },
    meetings: { type: [String], enum: ['none', 'read', 'write', 'update', 'delete'], default: [] },
    tasks: { type: [String], enum: ['none', 'read', 'write', 'update', 'delete'], default: [] },
    categories: { type: [String], enum: ['none', 'read', 'write', 'update', 'delete'], default: [] },
    products: { type: [String], enum: ['none', 'read', 'write', 'update', 'delete'], default: [] },
    forms: { type: [String], enum: ['none', 'read', 'write', 'update', 'delete'], default: [] },
    campaigns: { type: [String], enum: ['none', 'read', 'write', 'update', 'delete'], default: [] },
    teams: { type: [String], enum: ['none', 'read', 'write', 'update', 'delete'], default: [] },
    analytics: { type: [String], enum: ['none', 'read', 'write', 'update', 'delete'], default: [] },
    knowledge_base: { type: [String], enum: ['none', 'read', 'write', 'update', 'delete'], default: [] },
    widget_snippet: { type: [String], enum: ['none', 'read', 'write', 'update', 'delete'], default: [] },
  },
});


const teamSchema = new Schema({
  name: { type: String, required: true },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
  },
  teamAccess: {
    dashboard: { type: [String], enum: ['none', 'Visible'], default: [] },
    leads: { type: [String], enum: ['none', 'Visible'], default: [] },
    meetings: { type: [String], enum: ['none', 'Visible'], default: [] },
    tasks: { type: [String], enum: ['none', 'Visible'], default: [] },
    categories: { type: [String], enum: ['none', 'Visible'], default: [] },
    products: { type: [String], enum: ['none', 'Visible'], default: [] },
    forms: { type: [String], enum: ['none', 'Visible'], default: [] },
    campaigns: { type: [String], enum: ['none', 'Visible'], default: [] },
    teams: { type: [String], enum: ['none', 'Visible'], default: [] },
    analytics: { type: [String], enum: ['none', 'Visible'], default: [] },
    knowledge_base: { type: [String], enum: ['none', 'Visible'], default: [] },
    widget_snippet: { type: [String], enum: ['none', 'Visible'], default: [] },
  },
  logo: { type: String, default: "https://cdn-icons-png.flaticon.com/512/10872/10872139.png" },
  agent: { type: String },
  members: [memberSchema],
}, { timestamps: true });

export default models.Team || model('Team', teamSchema);
