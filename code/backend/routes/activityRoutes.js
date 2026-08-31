import express from 'express';
import Activity from '../models/Activity.js';

const router = express.Router();

router.get('/pending', async (req, res) => {
    try {
        const pendingRequests = await Activity.find({ status: 'Pending' });
        res.json(pendingRequests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/approve/:id', async (req, res) => {
    try {
        const pendingActivity = await Activity.findById(req.params.id);
        if (!pendingActivity) {
            return res.status(404).json({ message: "Activity not found" });
        }

        const collision = await Activity.findOne({
            status: 'Approved',
            dayOfWeek: pendingActivity.dayOfWeek,
            $and: [
                { startTime: { $lt: pendingActivity.endTime } },
                { endTime: { $gt: pendingActivity.startTime } }
            ],
            $or: [
                { requestedRoom: pendingActivity.requestedRoom },
                { affectedBatches: { $in: pendingActivity.affectedBatches } }
            ]
        });

        if (collision) {
            return res.status(409).json({ 
                message: "Collision Detected!", 
                conflict: collision 
            });
        }

        pendingActivity.status = 'Approved';
        await pendingActivity.save();

        res.json({ message: "Activity successfully scheduled!", activity: pendingActivity });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;