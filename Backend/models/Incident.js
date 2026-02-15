const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Open', 'Resolved', 'In Progress'],
        default: 'Open'
    },
    category: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: false
    },
    image: {
        type: String, // Base64 for simplicity as requested/used in profile
        required: false
    }
});

module.exports = mongoose.model('Incident', incidentSchema);