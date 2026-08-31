import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true, unique: true }, 
    capacity: { type: Number, required: true },
    type: { type: String, required: true, enum: ['Lecture Hall', 'Lab', 'Tutorial Room'] }
});

export default mongoose.model('Room', roomSchema);