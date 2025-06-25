import mongoose, { Schema, Types, model } from 'mongoose';

const OrganizationSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  address: { type: String },
  contactPhone: { type: String, required: true },
  Number_of_Employees: { type: String, required: true },
  country: { type: String },
  // Link to the User (or Profile) model
  userId: { type: Types.ObjectId, ref: 'Profile', required: true },

  // Reference to the Profile model (if needed for creator)
  createdBy: { type: Types.ObjectId, ref: 'Profile', required: true },
  // Optional fields for extra organization details
  website: { type: String, default: '' },
  socialMediaLinks: {
    type: Map,
    of: String,
    default: {},
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update `updatedAt` field before saving
OrganizationSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Organization || model('Organization', OrganizationSchema);
