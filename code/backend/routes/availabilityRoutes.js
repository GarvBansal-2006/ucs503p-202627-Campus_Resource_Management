import express from 'express';
import Room from '../models/Room.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { authenticate, authorize, authorizeSelfOrAdmin } from '../middleware/auth.js';
import { getActivityDateQuery, getTodayDateKey, parseDateOnly } from '../utils/activityDate.js';
import {
    ActivityValidationError,
    getActivityConflicts,
    validateActivityData
} from '../utils/activityValidation.js';

const router = express.Router();

router.post('/check', authenticate, authorize('Faculty', 'Admin'), async (req, res) => {
    try {
        const { roomNumber, date, startTime, endTime, capacity, batches } = req.body;
        let bookingDate;

        try {
            bookingDate = parseDateOnly(date);
        } catch (error) {
            return res.status(400).json({ error: 'A valid booking date is required.' });
        }

        const targetRoom = await Room.findOne({ roomNumber: roomNumber });
        if (!targetRoom) {
            return res.status(404).json({ error: `Room ${roomNumber} does not exist in the database.` });
        }

        let validatedActivity;
        try {
            validatedActivity = await validateActivityData({
                roomId: targetRoom._id,
                facultyId: req.user.id,
                date: bookingDate,
                startTime,
                endTime,
                batches,
                capacity
            });
        } catch (error) {
            if (error instanceof ActivityValidationError) {
                return res.status(error.statusCode).json({ error: error.message, ...error.details });
            }
            throw error;
        }

        const { conflicts, roomConflicts, batchConflicts, facultyConflicts } = await getActivityConflicts({
            roomId: targetRoom._id,
            facultyId: req.user.id,
            date: validatedActivity.date,
            dayOfWeek: validatedActivity.dayOfWeek,
            startTime,
            endTime,
            batches: validatedActivity.batches
        });

        if (conflicts.length > 0) {
            const candidateRooms = roomConflicts.length > 0 && batchConflicts.length === 0 && facultyConflicts.length === 0
                ? await Room.find({ capacity: { $gte: validatedActivity.requiredCapacity } })
                : [];
            const recommendations = [];

            for (let room of candidateRooms) {
                if (room._id.equals(targetRoom._id)) continue;

                const { roomConflicts: candidateRoomConflicts } = await getActivityConflicts({
                    roomId: room._id,
                    date: validatedActivity.date,
                    dayOfWeek: validatedActivity.dayOfWeek,
                    startTime,
                    endTime,
                    batches: [],
                    facultyId: null
                });

                if (candidateRoomConflicts.length === 0 && room.coordinates && targetRoom.coordinates) {
                    const dx = room.coordinates.x - targetRoom.coordinates.x;
                    const dy = room.coordinates.y - targetRoom.coordinates.y;
                    
                    let distance = Math.sqrt(dx*dx + dy*dy);
                    
                    const z1 = room.coordinates.z || 1;
                    const z2 = targetRoom.coordinates.z || 1;
                    
                    if (z1 !== z2) {
                        const floorDiff = Math.abs(z1 - z2);
                        distance = distance + (floorDiff * 10);
                    }
                    recommendations.push({ 
                        roomNumber: room.roomNumber, 
                        capacity: room.capacity, 
                        distance: Math.round(distance) 
                    });
                }
            }

            recommendations.sort((a, b) => a.distance - b.distance);
            const topRecommendations = recommendations.slice(0, 3);

            return res.json({ 
                available: false, 
                conflictActivity: conflicts[0],
                conflicts,
                conflictType: batchConflicts.length > 0
                    ? 'batch'
                    : facultyConflicts.length > 0
                        ? 'faculty'
                        : roomConflicts.length > 0
                            ? 'room'
                            : 'schedule',
                recommendations: topRecommendations
            });
        }

        return res.json({
            available: true,
            room: targetRoom,
            requiredCapacity: validatedActivity.requiredCapacity,
            batchStudentCount: validatedActivity.batchStudentCount
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Failed to check availability." });
    }
});

router.post('/request', authenticate, authorize('Faculty'), async (req, res) => {
    try {
        const { title, roomNumber, date, startTime, endTime, batches, capacity } = req.body;
        const facultyId = req.user.id;
        let bookingDate;

        try {
            bookingDate = parseDateOnly(date);
        } catch (error) {
            return res.status(400).json({ error: 'A valid booking date is required.' });
        }

        const targetRoom = await Room.findOne({ roomNumber: roomNumber });
        if (!targetRoom) {
            return res.status(404).json({ error: `Room ${roomNumber} not found.` });
        }

        let validatedActivity;
        try {
            validatedActivity = await validateActivityData({
                roomId: targetRoom._id,
                facultyId,
                date: bookingDate,
                startTime,
                endTime,
                batches,
                capacity
            });
        } catch (error) {
            if (error instanceof ActivityValidationError) {
                return res.status(error.statusCode).json({ error: error.message, ...error.details });
            }
            throw error;
        }

        const { conflicts } = await getActivityConflicts({
            roomId: targetRoom._id,
            facultyId,
            date: validatedActivity.date,
            dayOfWeek: validatedActivity.dayOfWeek,
            startTime,
            endTime,
            batches: validatedActivity.batches
        });

        if (conflicts.length > 0) {
            return res.status(409).json({
                error: 'The activity is no longer available for the selected room, faculty, or batch schedule.',
                conflicts
            });
        }

        const newActivity = new Activity({
            title: title || 'Faculty Booking',
            requestedRoom: targetRoom._id,
            faculty: facultyId,
            date: validatedActivity.date,
            dayOfWeek: validatedActivity.dayOfWeek,
            startTime: startTime,
            endTime: endTime,
            affectedBatches: validatedActivity.batches,
            requiredCapacity: validatedActivity.requiredCapacity,
            status: 'Pending'
        });

        await newActivity.save();
        res.json({ success: true, message: 'Request submitted for admin approval.' });

    } catch (error) {
        console.error("Booking Error:", error);
        res.status(500).json({ error: "Failed to submit request." });
    }
});

router.get('/my-schedule', authenticate, authorize('Student'), async (req, res) => {
    try {
        const student = await User.findById(req.user.id).select('batch');
        if (!student?.batch) {
            return res.json([]);
        }

        const date = req.query.date || getTodayDateKey();
        const schedule = await Activity.find({
            ...getActivityDateQuery({ date }),
            affectedBatches: student.batch,
            status: 'Approved'
        })
            .populate('requestedRoom', 'roomNumber type')
            .populate('faculty', 'name email')
            .sort({ startTime: 1 });

        res.json(schedule);
    } catch (error) {
        res.status(400).json({ error: 'Unable to load the student schedule.' });
    }
});

router.get('/my-requests/:facultyId', authenticate, authorize('Faculty', 'Admin'), authorizeSelfOrAdmin('facultyId'), async (req, res) => {
    try {
        const requests = await Activity.find({ faculty: req.params.facultyId })
            .populate('requestedRoom', 'roomNumber')
            .sort({ _id: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch requests." });
    }
});

export default router;
