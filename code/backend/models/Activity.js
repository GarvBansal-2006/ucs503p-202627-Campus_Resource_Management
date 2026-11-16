import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    title: { type: String, required: true },
    requestedRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true }, 
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: null },
    dayOfWeek: { type: String, required: true }, 
    isRecurring: { type: Boolean, default: false },
    startTime: { type: String, required: true }, 
    endTime: { type: String, required: true },   
    requiredCapacity: { type: Number, default: null },
    affectedBatches: {
        type: [String],
        required: true,
        validate: {
            validator: batches => Array.isArray(batches) && batches.length > 0,
            message: 'At least one affected batch is required.'
        }
    },
    status: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'], 
        default: 'Pending' 
    },
    adminRemarks: { type: String, default: "" } 
});

activitySchema.index({ requestedRoom: 1, date: 1, status: 1 });
activitySchema.index({ affectedBatches: 1, date: 1, status: 1 });
activitySchema.index({ faculty: 1, date: 1, status: 1 });

export default mongoose.model('Activity', activitySchema);
