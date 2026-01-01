const mongoose = require('mongoose');

const RemunerationSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    employeeId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        default: ''
    },
    designation: {
        type: String,
        default: ''
    },
    month: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    grossRemuneration: {
        type: Number,
        default: 0
    },
    daysWorked: {
        type: Number,
        default: 0
    },
    casualLeave: {
        type: Number,
        default: 0
    },
    weeklyOff: {
        type: Number,
        default: 0
    },
    holidays: {
        type: Number,
        default: 0
    },
    lwpDays: {
        type: Number,
        default: 0
    },
    totalDays: {
        type: Number,
        default: 0
    },
    payableDays: {
        type: Number,
        default: 0
    },
    fixedRemuneration: {
        type: Number,
        default: 0
    },
    variableRemuneration: {
        type: Number,
        default: 0
    },
    totalRemuneration: {
        type: Number,
        default: 0
    },
    tds: {
        type: Number,
        default: 0
    },
    otherDeduction: {
        type: Number,
        default: 0
    },
    netPayable: {
        type: Number,
        default: 0
    },
    panBankDetails: {
        type: String,
        default: ''
    }
}, { timestamps: true });

// Compound index for employee, month, and year
RemunerationSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Remuneration', RemunerationSchema);
