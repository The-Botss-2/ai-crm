import mongoose, { Schema, Document } from 'mongoose';

interface FieldResponse {
    label: string;        // from the original form field
    value: string | string[]; // user input
}

export interface FormResponseDocument extends Document {
    email: string;
    username: string;
    form: mongoose.Types.ObjectId; // reference to the original Form
    responses: FieldResponse[];
    submittedAt: Date;
}

const FieldResponseSchema = new Schema<FieldResponse>(
    {
        label: { type: String, required: true },
        value: { type: Schema.Types.Mixed, required: true }, // supports string, array (checkboxes)
    },
    { _id: false }
);

const FormResponseSchema = new Schema<FormResponseDocument>(
    {
        form: { type: Schema.Types.ObjectId, ref: 'CustomForm', required: true },
        responses: { type: [FieldResponseSchema], required: true },
        submittedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export const FormResponse =
    mongoose.models.FormResponse ||
    mongoose.model<FormResponseDocument>('FormResponse', FormResponseSchema);
