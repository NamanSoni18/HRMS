const mongoose = require('mongoose');

const fileTransferSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    note: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    // Threading fields
    parentTransferId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FileTransfer',
        default: null
    },
    threadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FileTransfer',
        default: null
    },
    isForwarded: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for faster queries
fileTransferSchema.index({ sender: 1, createdAt: -1 });
fileTransferSchema.index({ recipient: 1, createdAt: -1 });
fileTransferSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('FileTransfer', fileTransferSchema);
