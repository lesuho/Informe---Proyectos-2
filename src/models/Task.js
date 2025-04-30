import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    deadline: {
        type: Date,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sharedWith: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['viewer', 'editor'],
            default: 'viewer'
        }
    }]
}, {
    timestamps: true
});

// Middleware para formatear la fecha antes de guardar
taskSchema.pre('save', function(next) {
    if (this.deadline && !(this.deadline instanceof Date)) {
        this.deadline = new Date(this.deadline);
    }
    next();
});

export default mongoose.model('Task', taskSchema); 