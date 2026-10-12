import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true, unique: true }, 
    capacity: { type: Number, required: true },
    type: { type: String, required: true, enum: ['Lecture Hall', 'Lab', 'Tutorial Room'] },
    coordinates: {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        z: { type: Number, default: 1 }
    }
});

export default mongoose.model('Room', roomSchema);