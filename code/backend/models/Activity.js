import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    title: { type: String, required: true },
    requestedRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true }, 
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dayOfWeek: { type: String, required: true }, 
    startTime: { type: String, required: true }, 
    endTime: { type: String, required: true },   
    affectedBatches: [{ type: String, required: true }], 
    status: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Rejected'], 
        default: 'Pending' 
    },
    adminRemarks: { type: String, default: "" } 
});

export default mongoose.model('Activity', activitySchema);