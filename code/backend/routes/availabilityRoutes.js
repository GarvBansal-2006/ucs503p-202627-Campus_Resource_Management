import express from 'express';
import Room from '../models/Room.js';
import Activity from '../models/Activity.js';

const router = express.Router();

router.post('/check', async (req, res) => {
    try {
        const { roomNumber, date, startTime, endTime, capacity } = req.body;

        const dateObj = new Date(date);
        const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

        const targetRoom = await Room.findOne({ roomNumber: roomNumber });
        if (!targetRoom) {
            return res.status(404).json({ error: `Room ${roomNumber} does not exist in the database.` });
        }

        const requestedCapacity = parseInt(capacity);
        if (targetRoom.capacity < requestedCapacity) {
            return res.json({ 
                available: false, 
                capacityError: true, 
                maxCapacity: targetRoom.capacity,
                requestedCapacity: requestedCapacity 
            });
        }

        const conflict = await Activity.findOne({
            requestedRoom: targetRoom._id,
            dayOfWeek: dayOfWeek,
            status: 'Approved',
            $and: [
                { startTime: { $lt: endTime } },
                { endTime: { $gt: startTime } }
            ]
        });

        if (conflict) {
            return res.json({ available: false, conflictActivity: conflict });
        }

        return res.json({ available: true, room: targetRoom });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Failed to check availability." });
    }
});

export default router;