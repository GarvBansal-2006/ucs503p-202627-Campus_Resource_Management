import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Helper to detect role from email
const detectRole = (email) => {
    if (email.endsWith('_student@test.edu')) return 'Student';
    if (email.endsWith('_faculty@test.edu')) return 'Faculty';
    if (email.endsWith('_admin@test.edu') || email === 'admin@test.edu') return 'Admin';
    return null; // Invalid domain/pattern
};

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, batch } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const role = detectRole(email);
        if (!role) {
            return res.status(400).json({ message: 'Invalid email pattern for registration' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
            batch: role === 'Student' ? batch : null
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', role });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1d' });

        res.json({ token, user: { id: user._id, name: user.name, role: user.role, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
