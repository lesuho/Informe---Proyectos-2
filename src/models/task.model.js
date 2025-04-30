import mongoose from 'mongoose'
const { Schema } = mongoose;

const taskSchema = new Schema({
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
    deadline: {
        type: Date,
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    suggestedPriority: {
        type: String,
        enum: ['low', 'medium', 'high']
    },
    suggestionExplanation: {
        type: String
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date,
        default: null
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

// Middleware para manejar la migración de date a deadline
taskSchema.pre('save', function(next) {
    if (this.date && !this.deadline) {
        this.deadline = this.date;
        this.date = undefined;
    }
    next();
});

// Middleware para formatear la fecha antes de guardar
taskSchema.pre('save', function(next) {
    if (this.deadline && typeof this.deadline === 'string') {
        this.deadline = new Date(this.deadline);
    }
    next();
});

export default mongoose.model('Task', taskSchema);