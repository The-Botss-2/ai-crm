import mongoose, { Schema, Types, model } from 'mongoose';

const MeetingSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  createdBy: { type: Types.ObjectId, ref: 'Profile', required: true },
  teamId: { type: Types.ObjectId, ref: 'Team', required: true },

  platform: {
    type: String,
    enum: ['zoom', 'meet', 'teams'],
    default: 'zoom',
  },

  link: { type: String, required: true },
  meetingType: {
    type: String,
    enum: ['onsite', 'online'],
    required: true,
  },
  followUpStatus: { type: String, default: '' },
  notes: { type: String, default: '' },
  transcript: { type: String, default: '' },
  recordingUrl: { type: String, default: '' },
  aiSummary: { type: String, default: '' },

  attendees: {
    type: [String], // Can be changed to ObjectId if linking to User model
    required: true,
  },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Meeting || model('Meeting', MeetingSchema);
