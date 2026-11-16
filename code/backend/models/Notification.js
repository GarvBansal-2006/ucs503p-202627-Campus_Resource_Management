import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    activity: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', default: null },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
});

notificationSchema.index({ user: 1, activity: 1 });

export default mongoose.model('Notification', notificationSchema);
