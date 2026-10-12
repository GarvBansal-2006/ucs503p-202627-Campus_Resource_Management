import express from 'express';
import Room from '../models/Room.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

const router = express.Router();

router.get('/stats', async (req, res) => {
    try {
        const venuesCount = await Room.countDocuments();
        const pendingCount = await Activity.countDocuments({ status: 'Pending' });
        
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const eventsCount = await Activity.countDocuments({ dayOfWeek: today, status: 'Approved' });

        res.json({
            venues: venuesCount,
            conflicts: 0,
            pending: pendingCount,
            events: eventsCount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/requests', async (req, res) => {
    try {
        const pending = await Activity.find({ status: 'Pending' })
            .populate('requestedRoom')
            .populate('faculty', 'email');
        res.json(pending);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/requests/:id/check', async (req, res) => {
    try {
        const request = await Activity.findById(req.params.id);
        if (!request) return res.status(404).json({ error: 'Request not found' });

        const conflicts = await Activity.find({
            requestedRoom: request.requestedRoom,
            dayOfWeek: request.dayOfWeek,
            status: 'Approved',
            $and: [
                { startTime: { $lt: request.endTime } },
                { endTime: { $gt: request.startTime } }
            ]
        }).populate('faculty', 'email name').populate('requestedRoom');

        if (conflicts.length > 0) {
            res.json({ safe: false, conflicts });
        } else {
            res.json({ safe: true });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/requests/:id/resolve-conflict', async (req, res) => {
    try {
        const { action, conflictIds, newRoomId } = req.body;
        const request = await Activity.findById(req.params.id).populate('faculty', 'name');

        if (!request) return res.status(404).json({ error: 'Request not found' });

        let newRoomObj = null;
        if (action === 'shift' && newRoomId) {
            newRoomObj = await Room.findById(newRoomId);
        }

        const notifiedFaculties = new Set();
        for (let cid of conflictIds) {
            const conflictActivity = await Activity.findById(cid).populate('requestedRoom');
            if (!conflictActivity) continue;

            let msg = '';
            if (action === 'cancel') {
                conflictActivity.status = 'Cancelled';
                msg = `Alert: Your ${conflictActivity.title} class on ${conflictActivity.dayOfWeek} (${conflictActivity.startTime}-${conflictActivity.endTime}) at ${conflictActivity.requestedRoom.roomNumber} has been CANCELLED by Admin.`;
            } else if (action === 'shift') {
                conflictActivity.requestedRoom = newRoomId;
                msg = `Alert: Your ${conflictActivity.title} class on ${conflictActivity.dayOfWeek} (${conflictActivity.startTime}-${conflictActivity.endTime}) has been SHIFTED to new room: ${newRoomObj.roomNumber}.`;
            }
            await conflictActivity.save();

            if (conflictActivity.faculty && !notifiedFaculties.has(conflictActivity.faculty.toString())) {
                notifiedFaculties.add(conflictActivity.faculty.toString());
                await Notification.create({ user: conflictActivity.faculty, message: msg });
            }

            for (let batchName of conflictActivity.affectedBatches) {
                const students = await User.find({ role: 'Student', batch: batchName });
                for (let stu of students) {
                    await Notification.create({ user: stu._id, message: msg });
                }
            }
        }

        request.status = 'Approved';
        await request.save();

        res.json({ success: true, message: 'Conflicts resolved and request approved.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/requests/:id', async (req, res) => {
    try {
        const { status, remarks } = req.body;
        const activity = await Activity.findByIdAndUpdate(
            req.params.id, 
            { status: status, adminRemarks: remarks }, 
            { new: true }
        );
        res.json(activity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/metadata', async (req, res) => {
    try {
        const rooms = await Room.find().select('_id roomNumber type capacity');
        const faculty = await User.find({ role: 'Faculty' }).select('_id email');
        res.json({ rooms, faculty });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/schedule', async (req, res) => {
    try {
        const { title, roomId, facultyId, dayOfWeek, startTime, endTime, batches } = req.body;
        
        const newActivity = new Activity({
            title,
            requestedRoom: roomId,
            faculty: facultyId,
            dayOfWeek,
            startTime,
            endTime,
            affectedBatches: batches ? batches.split(',').map(b => b.trim()) : [],
            status: 'Approved'
        });

        await newActivity.save();
        res.json({ success: true, message: 'Activity scheduled successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/schedule/today', async (req, res) => {
    try {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const schedule = await Activity.find({ dayOfWeek: today, status: 'Approved' })
            .populate('requestedRoom', 'roomNumber')
            .populate('faculty', 'email')
            .sort({ startTime: 1 });
        res.json(schedule);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/schedule/day/:day', async (req, res) => {
    try {
        const { day } = req.params;
        const schedule = await Activity.find({ dayOfWeek: day, status: 'Approved' })
            .populate('requestedRoom', 'roomNumber')
            .populate('faculty', 'email')
            .sort({ startTime: 1 });
        res.json(schedule);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/check-booking', async (req, res) => {
    try {
        const { roomId, dayOfWeek, startTime, endTime } = req.body;
        
        const conflicts = await Activity.find({
            requestedRoom: roomId,
            dayOfWeek: dayOfWeek,
            status: 'Approved',
            $and: [
                { startTime: { $lt: endTime } },
                { endTime: { $gt: startTime } }
            ]
        }).populate('faculty', 'email name').populate('requestedRoom');

        if (conflicts.length > 0) {
            res.json({ safe: false, conflicts });
        } else {
            res.json({ safe: true });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/force-schedule', async (req, res) => {
    try {
        const { action, conflictIds, newRoomId, newActivityData } = req.body;
        
        let newRoomObj = null;
        if (action === 'shift' && newRoomId) {
            newRoomObj = await Room.findById(newRoomId);
        }

        const notifiedFaculties = new Set();
        for (let cid of conflictIds) {
            const conflictActivity = await Activity.findById(cid).populate('requestedRoom');
            if (!conflictActivity) continue;

            let msg = '';
            if (action === 'cancel') {
                conflictActivity.status = 'Cancelled';
                msg = `Alert: Your ${conflictActivity.title} class on ${conflictActivity.dayOfWeek} (${conflictActivity.startTime}-${conflictActivity.endTime}) at ${conflictActivity.requestedRoom.roomNumber} has been CANCELLED by Admin.`;
            } else if (action === 'shift') {
                conflictActivity.requestedRoom = newRoomId;
                msg = `Alert: Your ${conflictActivity.title} class on ${conflictActivity.dayOfWeek} (${conflictActivity.startTime}-${conflictActivity.endTime}) has been SHIFTED to new room: ${newRoomObj.roomNumber}.`;
            }
            await conflictActivity.save();

            if (conflictActivity.faculty && !notifiedFaculties.has(conflictActivity.faculty.toString())) {
                notifiedFaculties.add(conflictActivity.faculty.toString());
                await Notification.create({ user: conflictActivity.faculty, message: msg });
            }
            for (let batchName of conflictActivity.affectedBatches) {
                const students = await User.find({ role: 'Student', batch: batchName });
                for (let stu of students) {
                    await Notification.create({ user: stu._id, message: msg });
                }
            }
        }

        const { title, roomId, facultyId, dayOfWeek, startTime, endTime, batches } = newActivityData;
        const newActivity = new Activity({
            title,
            requestedRoom: roomId,
            faculty: facultyId,
            dayOfWeek,
            startTime,
            endTime,
            affectedBatches: batches ? batches.split(',').map(b => b.trim()) : [],
            status: 'Approved'
        });
        await newActivity.save();

        res.json({ success: true, message: 'Conflicts resolved and new activity scheduled.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/students-by-batches', async (req, res) => {
    try {
        const { batches } = req.body;
        if (!batches || batches.length === 0) return res.json([]);
        const students = await User.find({ role: 'Student', batch: { $in: batches } }).select('name email batch').sort({ batch: 1, email: 1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/activity/:id/modify', async (req, res) => {
    try {
        const { action, newRoomId } = req.body;
        const activity = await Activity.findById(req.params.id).populate('requestedRoom');
        if (!activity) return res.status(404).json({ error: 'Activity not found' });

        let msg = '';
        if (action === 'cancel') {
            activity.status = 'Cancelled';
            msg = `Alert: Your ${activity.title} class on ${activity.dayOfWeek} (${activity.startTime}-${activity.endTime}) at ${activity.requestedRoom.roomNumber} has been CANCELLED due to maintenance/admin action.`;
        } else if (action === 'shift') {
            const newRoomObj = await Room.findById(newRoomId);
            activity.requestedRoom = newRoomId;
            msg = `Alert: Your ${activity.title} class on ${activity.dayOfWeek} (${activity.startTime}-${activity.endTime}) has been SHIFTED to new room: ${newRoomObj.roomNumber} due to maintenance/admin action.`;
        }
        await activity.save();

        if (activity.faculty) {
            await Notification.create({ user: activity.faculty, message: msg });
        }
        for (let batchName of activity.affectedBatches) {
            const students = await User.find({ role: 'Student', batch: batchName });
            for (let stu of students) {
                await Notification.create({ user: stu._id, message: msg });
            }
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
