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
            const candidateRooms = await Room.find({ capacity: { $gte: requestedCapacity } });
            const recommendations = [];

            for (let room of candidateRooms) {
                if (room._id.equals(targetRoom._id)) continue;
                
                const roomConflict = await Activity.findOne({
                    requestedRoom: room._id,
                    dayOfWeek: dayOfWeek,
                    status: 'Approved',
                    $and: [
                        { startTime: { $lt: endTime } },
                        { endTime: { $gt: startTime } }
                    ]
                });

                if (!roomConflict && room.coordinates && targetRoom.coordinates) {
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
                conflictActivity: conflict,
                recommendations: topRecommendations 
            });
        }

        return res.json({ available: true, room: targetRoom });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Failed to check availability." });
    }
});

router.post('/request', async (req, res) => {
    try {
        const { title, roomNumber, facultyId, date, startTime, endTime, batches } = req.body;
        
        const dateObj = new Date(date);
        const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

        const targetRoom = await Room.findOne({ roomNumber: roomNumber });
        if (!targetRoom) {
            return res.status(404).json({ error: `Room ${roomNumber} not found.` });
        }

        const newActivity = new Activity({
            title: title || 'Faculty Booking',
            requestedRoom: targetRoom._id,
            faculty: facultyId,
            dayOfWeek: dayOfWeek,
            startTime: startTime,
            endTime: endTime,
            affectedBatches: batches ? batches.split(',').map(b => b.trim()) : [],
            status: 'Pending'
        });

        await newActivity.save();
        res.json({ success: true, message: 'Request submitted for admin approval.' });

    } catch (error) {
        console.error("Booking Error:", error);
        res.status(500).json({ error: "Failed to submit request." });
    }
});

router.get('/my-requests/:facultyId', async (req, res) => {
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