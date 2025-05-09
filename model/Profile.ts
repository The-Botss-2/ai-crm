import mongoose from 'mongoose';

const { Schema } = mongoose;

const ProfileSchema = new Schema(
  {
    name: String,
    email: { type: String, unique: true },
    image: { type: String, default: "https://img.freepik.com/premium-vector/vector-flat-illustration-grayscale-avatar-user-profile-person-icon-gender-neutral-silhouette-profile-picture-suitable-social-media-profiles-icons-screensavers-as-templatex9xa_719432-2210.jpg?semt=ais_hybrid&w=740" },
  },
  { timestamps: true }
);

export default mongoose.models.Profile ||
  mongoose.model('Profile', ProfileSchema);
