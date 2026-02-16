import mongoose from 'mongoose';

const broadcastSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
    },
    severity: {
        type: String,
        required: true,
        enum: ['High', 'Medium', 'Low'],
    },
    location: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    isAuthority: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

const Broadcast = mongoose.model('Broadcast', broadcastSchema);

export default Broadcast;
