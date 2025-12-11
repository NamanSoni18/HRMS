const mongoose = require('mongoose');

const VariableRemunerationSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    month: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    punctuality: {
        type: Number,
        default: 0
    },
    sincerity: {
        type: Number,
        default: 0
    },
    responsiveness: {
        type: Number,
        default: 0
    },
    assignedTask: {
        type: Number,
        default: 0
    },
    peerRating: {
        type: Number,
        default: 0
    },
    totalScore: {
        type: Number,
        default: 0
    },
    percentage: {
        type: Number,
        default: 0
    },
    amount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Ensure one record per employee per month/year
VariableRemunerationSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('VariableRemuneration', VariableRemunerationSchema);
