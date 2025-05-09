import mongoose from 'mongoose';

const { Schema } = mongoose;

const CredentailsSchema = new Schema(
    {
        email: { type: String, unique: true },
        password: String,
    },
    { timestamps: true }
);

export default mongoose.models.Credentails || mongoose.model('Credentails', CredentailsSchema);
