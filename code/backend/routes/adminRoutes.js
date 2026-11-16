import express from 'express';
import Room from '../models/Room.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
    getActivityDateQuery,
    getTodayDateKey
} from '../utils/activityDate.js';
import {
    ActivityValidationError,
    getActivityConflicts,
    normalizeBatches,
    validateActivityData
} from '../utils/activityValidation.js';
import { notifyActivityParticipants } from '../utils/activityNotifications.js';

const router = express.Router();
const adminOnly = authorize('Admin');

router.use(authenticate);

router.get('/stats', adminOnly, async (req, res) => {
    try {
        const venuesCount = await Room.countDocuments();
        const pendingCount = await Activity.countDocuments({ status: 'Pending' });
        
        const requestedDate = req.query.date || getTodayDateKey();
        let activityDateQuery;

        try {
            activityDateQuery = getActivityDateQuery({ date: requestedDate });
        } catch (error) {
            return res.status(400).json({ error: 'A valid date is required.' });
        }

        const eventsCount = await Activity.countDocuments({
            ...activityDateQuery,
            status: 'Approved'
        });

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

router.get('/requests', adminOnly, async (req, res) => {
    try {
        const pending = await Activity.find({ status: 'Pending' })
            .populate('requestedRoom')
            .populate('faculty', 'email');
        res.json(pending);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/requests/:id/check', adminOnly, async (req, res) => {
    try {
        const request = await Activity.findById(req.params.id);
        if (!request) return res.status(404).json({ error: 'Request not found' });

        const { conflicts, roomConflicts, batchConflicts, facultyConflicts } = await getActivityConflicts({
            roomId: request.requestedRoom,
            facultyId: request.faculty,
            date: request.date,
            dayOfWeek: request.dayOfWeek,
            startTime: request.startTime,
            endTime: request.endTime,
            batches: normalizeBatches(request.affectedBatches),
            excludeIds: [request._id]
        });

        if (conflicts.length > 0) {
            res.json({
                safe: false,
                conflicts,
                conflictType: batchConflicts.length > 0
                    ? 'batch'
                    : facultyConflicts.length > 0
                        ? 'faculty'
                        : roomConflicts.length > 0
                            ? 'room'
                            : 'schedule'
            });
        } else {
            res.json({ safe: true });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/requests/:id/resolve-conflict', adminOnly, async (req, res) => {
    try {
        const { action, conflictIds, newRoomId } = req.body;
        const request = await Activity.findById(req.params.id).populate('faculty', 'name');

        if (!request) return res.status(404).json({ error: 'Request not found' });

        let validatedRequest;
        try {
            validatedRequest = await validateActivityData({
                roomId: request.requestedRoom,
                facultyId: request.faculty?._id || request.faculty,
                date: request.date,
                startTime: request.startTime,
                endTime: request.endTime,
                batches: request.affectedBatches
            });
        } catch (error) {
            if (error instanceof ActivityValidationError) {
                return res.status(error.statusCode).json({ error: error.message, ...error.details });
            }
            throw error;
        }

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

        request.requiredCapacity = validatedRequest.requiredCapacity;
        request.status = 'Approved';
        await request.save();

        try {
            await notifyActivityParticipants(request, { type: 'approved' });
        } catch (notificationError) {
            console.error('Activity approval notification failed:', notificationError);
        }

        res.json({ success: true, message: 'Conflicts resolved and request approved.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/requests/:id', adminOnly, async (req, res) => {
    try {
        const { status, remarks } = req.body;
        const existingActivity = await Activity.findById(req.params.id);
        if (!existingActivity) return res.status(404).json({ error: 'Activity not found' });
        const previousStatus = existingActivity.status;

        if (status === 'Approved') {
            let validatedActivity;
            try {
                validatedActivity = await validateActivityData({
                    roomId: existingActivity.requestedRoom,
                    facultyId: existingActivity.faculty,
                    date: existingActivity.date,
                    startTime: existingActivity.startTime,
                    endTime: existingActivity.endTime,
                    batches: existingActivity.affectedBatches
                });
            } catch (error) {
                if (error instanceof ActivityValidationError) {
                    return res.status(error.statusCode).json({ error: error.message, ...error.details });
                }
                throw error;
            }

            const { conflicts } = await getActivityConflicts({
                roomId: existingActivity.requestedRoom,
                facultyId: existingActivity.faculty,
                date: existingActivity.date,
                dayOfWeek: existingActivity.dayOfWeek,
                startTime: existingActivity.startTime,
                endTime: existingActivity.endTime,
                batches: existingActivity.affectedBatches,
                excludeIds: [existingActivity._id]
            });

            if (conflicts.length > 0) {
                return res.status(409).json({ error: 'This activity conflicts with an approved activity.', conflicts });
            }

            existingActivity.requiredCapacity = validatedActivity.requiredCapacity;
        }

        existingActivity.status = status;
        existingActivity.adminRemarks = remarks;
        await existingActivity.save();

        if (previousStatus !== status && (status === 'Approved' || status === 'Rejected')) {
            try {
                await notifyActivityParticipants(existingActivity, {
                    type: status === 'Approved' ? 'approved' : 'rejected',
                    remarks
                });
            } catch (notificationError) {
                console.error('Request status notification failed:', notificationError);
            }
        }

        res.json(existingActivity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/metadata', authorize('Admin', 'Faculty'), async (req, res) => {
    try {
        const rooms = await Room.find().select('_id roomNumber type capacity');
        const faculty = await User.find({ role: 'Faculty' }).select('_id email');
        const batches = await User.aggregate([
            { $match: { role: 'Student', batch: { $nin: [null, ''] } } },
            { $group: { _id: '$batch', studentCount: { $sum: 1 } } },
            { $project: { _id: 0, name: '$_id', studentCount: 1 } },
            { $sort: { name: 1 } }
        ]);
        res.json({ rooms, faculty, batches });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/schedule', adminOnly, async (req, res) => {
    try {
        const { title, roomId, facultyId, date, startTime, endTime, batches } = req.body;
        let validatedActivity;

        try {
            validatedActivity = await validateActivityData({
                roomId,
                facultyId,
                date,
                startTime,
                endTime,
                batches
            });
        } catch (error) {
            if (error instanceof ActivityValidationError) {
                return res.status(error.statusCode).json({ error: error.message, ...error.details });
            }
            throw error;
        }

        const { conflicts } = await getActivityConflicts({
            roomId,
            facultyId,
            date: validatedActivity.date,
            dayOfWeek: validatedActivity.dayOfWeek,
            startTime,
            endTime,
            batches: validatedActivity.batches
        });

        if (conflicts.length > 0) {
            return res.status(409).json({ error: 'This activity conflicts with an approved activity.', conflicts });
        }
        
        const newActivity = new Activity({
            title,
            requestedRoom: roomId,
            faculty: facultyId,
            date: validatedActivity.date,
            dayOfWeek: validatedActivity.dayOfWeek,
            startTime,
            endTime,
            affectedBatches: validatedActivity.batches,
            requiredCapacity: validatedActivity.requiredCapacity,
            status: 'Approved'
        });

        await newActivity.save();

        try {
            await notifyActivityParticipants(newActivity);
        } catch (notificationError) {
            console.error('New activity notification failed:', notificationError);
        }

        res.json({ success: true, message: 'Activity scheduled successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/schedule/today', adminOnly, async (req, res) => {
    try {
        const requestedDate = req.query.date || getTodayDateKey();
        let activityDateQuery;

        try {
            activityDateQuery = getActivityDateQuery({ date: requestedDate });
        } catch (error) {
            return res.status(400).json({ error: 'A valid date is required.' });
        }

        const schedule = await Activity.find({
            ...activityDateQuery,
            status: 'Approved'
        })
            .populate('requestedRoom', 'roomNumber')
            .populate('faculty', 'email')
            .sort({ startTime: 1 });
        res.json(schedule);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/schedule/day/:day', adminOnly, async (req, res) => {
    try {
        const { day } = req.params;
        const schedule = await Activity.find({
            $or: [
                { isRecurring: true, dayOfWeek: day },
                { date: { $exists: false }, dayOfWeek: day },
                { date: null, dayOfWeek: day }
            ],
            status: 'Approved'
        })
            .populate('requestedRoom', 'roomNumber')
            .populate('faculty', 'email')
            .sort({ startTime: 1 });
        res.json(schedule);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/schedule/date/:date', adminOnly, async (req, res) => {
    try {
        const activityDateQuery = getActivityDateQuery({ date: req.params.date });
        const schedule = await Activity.find({
            ...activityDateQuery,
            status: 'Approved'
        })
            .populate('requestedRoom', 'roomNumber')
            .populate('faculty', 'email')
            .sort({ startTime: 1 });
        res.json(schedule);
    } catch (error) {
        res.status(400).json({ error: 'A valid date is required.' });
    }
});


router.post('/check-booking', adminOnly, async (req, res) => {
    try {
        const { roomId, facultyId, date, startTime, endTime, batches } = req.body;
        let validatedActivity;

        try {
            validatedActivity = await validateActivityData({
                roomId,
                facultyId,
                date,
                startTime,
                endTime,
                batches
            });
        } catch (error) {
            if (error instanceof ActivityValidationError) {
                return res.status(error.statusCode).json({ error: error.message, ...error.details });
            }
            throw error;
        }

        const { conflicts, roomConflicts, batchConflicts, facultyConflicts } = await getActivityConflicts({
            roomId,
            facultyId,
            date: validatedActivity.date,
            dayOfWeek: validatedActivity.dayOfWeek,
            startTime,
            endTime,
            batches: validatedActivity.batches
        });

        if (conflicts.length > 0) {
            res.json({
                safe: false,
                conflicts,
                conflictType: batchConflicts.length > 0
                    ? 'batch'
                    : facultyConflicts.length > 0
                        ? 'faculty'
                        : roomConflicts.length > 0
                            ? 'room'
                            : 'schedule'
            });
        } else {
            res.json({ safe: true, requiredCapacity: validatedActivity.requiredCapacity });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/force-schedule', adminOnly, async (req, res) => {
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

        const { title, roomId, facultyId, date, startTime, endTime, batches } = newActivityData;
        let validatedActivity;
        try {
            validatedActivity = await validateActivityData({
                roomId,
                facultyId,
                date,
                startTime,
                endTime,
                batches
            });
        } catch (error) {
            if (error instanceof ActivityValidationError) {
                return res.status(error.statusCode).json({ error: error.message, ...error.details });
            }
            throw error;
        }
        const newActivity = new Activity({
            title,
            requestedRoom: roomId,
            faculty: facultyId,
            date: validatedActivity.date,
            dayOfWeek: validatedActivity.dayOfWeek,
            startTime,
            endTime,
            affectedBatches: validatedActivity.batches,
            requiredCapacity: validatedActivity.requiredCapacity,
            status: 'Approved'
        });
        await newActivity.save();

        try {
            await notifyActivityParticipants(newActivity);
        } catch (notificationError) {
            console.error('Forced activity notification failed:', notificationError);
        }

        res.json({ success: true, message: 'Conflicts resolved and new activity scheduled.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/students-by-batches', adminOnly, async (req, res) => {
    try {
        const { batches } = req.body;
        if (!batches || batches.length === 0) return res.json([]);
        const students = await User.find({ role: 'Student', batch: { $in: batches } }).select('name email batch').sort({ batch: 1, email: 1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/activity/:id/modify', adminOnly, async (req, res) => {
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
