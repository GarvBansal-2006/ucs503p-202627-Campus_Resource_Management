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
            // Recommender Engine: Coordinate Based (Option A)
            const candidateRooms = await Room.find({ capacity: { $gte: requestedCapacity } });
            const recommendations = [];

            for (let room of candidateRooms) {
                if (room._id.equals(targetRoom._id)) continue;
                
                // Check if candidate room is free during this time
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
                    const distance = Math.sqrt(dx*dx + dy*dy);
                    recommendations.push({ 
                        roomNumber: room.roomNumber, 
                        capacity: room.capacity, 
                        distance: Math.round(distance) 
                    });
                }
            }

            // Sort by shortest distance
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

export default router;