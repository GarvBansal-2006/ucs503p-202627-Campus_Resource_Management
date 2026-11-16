import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Room from '../models/Room.js';
import Activity from '../models/Activity.js';
import { getTodayDateKey, parseDateOnly } from './activityDate.js';

function getId(value) {
    return value?._id || value;
}

export function formatActivityDate(value) {
    return new Intl.DateTimeFormat('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC'
    }).format(parseDateOnly(value));
}

async function getRoomNumber(activity) {
    if (activity.requestedRoom?.roomNumber) {
        return activity.requestedRoom.roomNumber;
    }

    const room = await Room.findById(getId(activity.requestedRoom)).select('roomNumber').lean();
    return room?.roomNumber || 'TBD';
}

function buildActivityMessage(activity, { role, batch, type = 'scheduled', remarks = '', roomNumber }) {
    const activityDate = formatActivityDate(activity.date);
    const scheduleText = `${activityDate}, ${activity.startTime}-${activity.endTime} in ${roomNumber}`;
    const batches = [...new Set((activity.affectedBatches || []).filter(Boolean))];
    const batchText = batches.length > 0 ? batches.join(', ') : 'selected batches';

    if (role === 'Faculty') {
        if (type === 'approved') {
            return `Booking approved: ${activity.title} is scheduled for ${scheduleText}. Batches: ${batchText}.`;
        }
        if (type === 'rejected') {
            return `Booking request rejected: ${activity.title} planned for ${scheduleText}.${remarks ? ` Reason: ${remarks}` : ''}`;
        }
        return `New activity assigned: ${activity.title} is scheduled for ${scheduleText}. Batches: ${batchText}.`;
    }

    return `New announcement: ${activity.title} is scheduled for ${scheduleText}. Your batch (${batch}) is included.`;
}

export async function notifyActivityParticipants(activity, { type = 'scheduled', remarks = '' } = {}) {
    const facultyId = getId(activity.faculty);
    const batches = [...new Set((activity.affectedBatches || []).filter(Boolean))];
    const roomNumber = await getRoomNumber(activity);
    const [faculty, students] = await Promise.all([
        facultyId ? User.findById(facultyId).select('_id').lean() : null,
        batches.length > 0
            ? User.find({ role: 'Student', batch: { $in: batches } }).select('_id batch').lean()
            : []
    ]);

    const notifications = [];

    if (faculty) {
        notifications.push({
            user: faculty._id,
            activity: activity._id,
            message: buildActivityMessage(activity, { role: 'Faculty', type, remarks, roomNumber })
        });
    }

    if (type !== 'rejected') {
        for (const student of students) {
            notifications.push({
                user: student._id,
                activity: activity._id,
                message: buildActivityMessage(activity, { role: 'Student', batch: student.batch, roomNumber })
            });
        }
    }

    if (notifications.length > 0) {
        await Notification.insertMany(notifications);
    }

    return notifications.length;
}

export async function syncActivityNotificationsForUser(userId) {
    const user = await User.findById(userId).select('_id role batch').lean();
    if (!user || !['Student', 'Faculty'].includes(user.role)) {
        return 0;
    }

    const activityFilter = {
        status: 'Approved',
        date: { $gte: parseDateOnly(getTodayDateKey()) },
        ...(user.role === 'Student'
            ? { affectedBatches: user.batch }
            : { faculty: user._id })
    };

    const activities = await Activity.find(activityFilter)
        .populate('requestedRoom', 'roomNumber')
        .sort({ date: 1, startTime: 1 })
        .lean();

    if (activities.length === 0) {
        return 0;
    }

    const activityIds = activities.map(activity => activity._id);
    const existingNotifications = await Notification.find({
        user: user._id,
        activity: { $in: activityIds }
    }).select('activity').lean();
    const notifiedActivityIds = new Set(existingNotifications.map(notification => String(notification.activity)));
    const missingActivities = activities.filter(activity => !notifiedActivityIds.has(String(activity._id)));

    if (missingActivities.length === 0) {
        return 0;
    }

    const notifications = missingActivities.map(activity => ({
        user: user._id,
        activity: activity._id,
        message: buildActivityMessage(activity, {
            role: user.role,
            batch: user.batch,
            roomNumber: activity.requestedRoom?.roomNumber || 'TBD'
        })
    }));

    await Notification.insertMany(notifications);
    return notifications.length;
}
