import mongoose, { Schema, Document } from 'mongoose';

// define properties
export type TaskPriority = 'low' | 'medium' | 'high';

export interface ITask extends Document {
    title: string;
    description?: string; 
    status: 'pending' | 'inProgress' | 'completed';
    user: mongoose.Types.ObjectId; 
    dueDate?: Date;
    priority: TaskPriority;
    createdAt: Date;
    updatedAt: Date;
}

const TaskSchema: Schema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        status: {
            type: String,
            enum: ['pending', 'inProgress', 'completed'],
            default: 'pending',
        },
        user: { 
            type: Schema.Types.ObjectId,
            ref: 'User', 
            required: true,
        },
        dueDate : {
            type: Date,
            required : false
        },
        priority : {
            type: String,
            enum: ['low', 'medium', 'high'], // Allowed values
            default: 'medium', 
            required: true
        },
    },
    { timestamps: true }
);

export default mongoose.model<ITask>('Task', TaskSchema);