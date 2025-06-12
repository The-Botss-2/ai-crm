import mongoose, { Schema, Document } from 'mongoose';

interface Field {
    label: string;
    type: 'text' | 'textarea' | 'number' | 'date' | 'checkbox' | 'radio' | 'select' | 'email' | 'tel'; // Expand as needed
    placeholder?: string;
    isRequired: boolean;
    options?: string[]; // For select, radio, checkbox
}

export interface CustomFormDocument extends Document {
    title: string;
    description?: string;
    fields: Field[];
    category?: string; // e.g., 'lead', 'meeting', etc.
    createdBy: mongoose.Types.ObjectId;
    teamId: mongoose.Types.ObjectId;
    isTemplate?: boolean;
    createdAt: Date;
    updatedAt: Date;
    code_snippet: string;
}

const FieldSchema = new Schema<Field>(
    {
        label: { type: String, required: true },
        type: {
            type: String,
            enum: ['text', 'textarea', 'number', 'date', 'checkbox', 'radio', 'select', 'email', 'tel'],
            default: 'text',
        },
        placeholder: { type: String, default: 'Placeholder' },
        isRequired: { type: Boolean, default: false },
        options: [String], // Optional for multiple-choice types
    },
    { _id: false }
);

const CustomFormSchema = new Schema<CustomFormDocument>(
    {
        title: { type: String, required: true },
        description: { type: String },
        fields: { type: [FieldSchema], required: true },
        category: { type: String, enum: ['lead', 'meeting', 'task', 'event', 'custom'], default: 'custom' },
        createdBy: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
        teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
        code_snippet: {type: String},
        isTemplate: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const CustomForm = mongoose.models.CustomForm || mongoose.model<CustomFormDocument>('CustomForm', CustomFormSchema);
