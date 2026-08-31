import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true, enum: ['Admin', 'Faculty', 'Student'] },
    batch: { type: String, default: null } 
});

export default mongoose.model('User', userSchema);