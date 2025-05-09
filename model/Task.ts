import mongoose, { Schema, model, models } from 'mongoose';

const TaskSchema = new Schema(
    {
        teamId: {
            type: Schema.Types.ObjectId,
            ref: 'Team',
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: String,
        status: {
            type: String,
            enum: ['pending', 'in_progress', 'completed', 'blocked'],
            default: 'pending',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium',
        },
        dueDate: Date,
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'Profile',
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: 'Profile',
        },
        leadId: {
            type: Schema.Types.ObjectId,
            ref: 'Lead',
            default: null,
        },
        meetingId: {
            type: Schema.Types.ObjectId,
            ref: 'Meeting',
            default: null,
        },
        completedAt: Date,
        completedBy: {
            type: Schema.Types.ObjectId,
            ref: 'Profile',
        },
    },
    {
        timestamps: true,
    }
);

const Task = models.Task || model('Task', TaskSchema);
export default Task;
