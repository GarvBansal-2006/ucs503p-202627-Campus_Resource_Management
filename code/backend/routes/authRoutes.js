import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { authenticate, authorizeSelfOrAdmin, getJwtSecret } from '../middleware/auth.js';
import { syncActivityNotificationsForUser } from '../utils/activityNotifications.js';

const router = express.Router();

const detectRole = (email) => {
    if (email.includes('student')) return 'Student';
    if (email.includes('faculty')) return 'Faculty';
    return null;
};

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

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user._id.toString(), role: user.role },
            getJwtSecret(),
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
                email: user.email,
                batch: user.batch
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/notifications/:userId', authenticate, authorizeSelfOrAdmin('userId'), async (req, res) => {
    try {
        try {
            await syncActivityNotificationsForUser(req.params.userId);
        } catch (syncError) {
            console.error('Activity notification sync failed:', syncError);
        }

        const notifs = await Notification.find({ user: req.params.userId }).sort({ date: -1 });
        res.json(notifs);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/notifications/:id/read', authenticate, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (String(notification.user) !== String(req.user.id)) {
            return res.status(403).json({ message: 'You can only update your own notifications' });
        }

        notification.read = true;
        await notification.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
