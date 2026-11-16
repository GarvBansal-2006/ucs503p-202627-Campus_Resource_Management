import mongoose from 'mongoose';
import Activity from '../models/Activity.js';
import Room from '../models/Room.js';
import User from '../models/User.js';
import { getActivityDateQuery, getDayOfWeek, parseDateOnly } from './activityDate.js';

const TIME_PATTERN = /^(\d{2}):(\d{2})$/;

export class ActivityValidationError extends Error {
    constructor(message, details = {}) {
        super(message);
        this.name = 'ActivityValidationError';
        this.statusCode = 400;
        this.details = details;
    }
}

export function normalizeBatches(value) {
    const values = Array.isArray(value)
        ? value
        : typeof value === 'string'
            ? value.split(',')
            : [];

    return [...new Set(values
        .map(batch => String(batch).trim())
        .filter(Boolean))];
}

export function validateTimeRange(startTime, endTime) {
    const startMatch = String(startTime || '').match(TIME_PATTERN);
    const endMatch = String(endTime || '').match(TIME_PATTERN);

    if (!startMatch || !endMatch) {
        throw new ActivityValidationError('Start and end times must use HH:MM format.');
    }

    const startMinutes = Number(startMatch[1]) * 60 + Number(startMatch[2]);
    const endMinutes = Number(endMatch[1]) * 60 + Number(endMatch[2]);

    if (
        Number(startMatch[1]) > 23 ||
        Number(endMatch[1]) > 23 ||
        Number(startMatch[2]) > 59 ||
        Number(endMatch[2]) > 59 ||
        startMinutes >= endMinutes
    ) {
        throw new ActivityValidationError('End time must be later than start time.');
    }
}

async function getBatchSummary(batches) {
    const students = await User.find({
        role: 'Student',
        batch: { $in: batches }
    }).select('batch').lean();

    const counts = Object.fromEntries(batches.map(batch => [batch, 0]));
    for (const student of students) {
        if (Object.prototype.hasOwnProperty.call(counts, student.batch)) {
            counts[student.batch] += 1;
        }
    }

    const missingBatches = batches.filter(batch => counts[batch] === 0);
    return {
        counts,
        missingBatches,
        totalStudents: students.length
    };
}

export async function validateActivityData({
    roomId,
    facultyId,
    date,
    startTime,
    endTime,
    batches,
    capacity
}) {
    const normalizedBatches = normalizeBatches(batches);

    if (normalizedBatches.length === 0) {
        throw new ActivityValidationError('Select at least one affected batch.');
    }

    let bookingDate;
    try {
        bookingDate = parseDateOnly(date);
    } catch (error) {
        throw new ActivityValidationError('A valid activity date is required.');
    }

    validateTimeRange(startTime, endTime);

    if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
        throw new ActivityValidationError('A valid room is required.');
    }

    const room = await Room.findById(roomId);
    if (!room) {
        throw new ActivityValidationError('The selected room does not exist.');
    }

    if (!facultyId || !mongoose.Types.ObjectId.isValid(facultyId)) {
        throw new ActivityValidationError('A valid faculty member is required.');
    }

    const faculty = await User.findOne({ _id: facultyId, role: 'Faculty' }).select('_id email name');
    if (!faculty) {
        throw new ActivityValidationError('The selected faculty member does not exist.');
    }

    const batchSummary = await getBatchSummary(normalizedBatches);
    if (batchSummary.missingBatches.length > 0) {
        throw new ActivityValidationError(
            `No students were found for batch(es): ${batchSummary.missingBatches.join(', ')}.`,
            { missingBatches: batchSummary.missingBatches }
        );
    }

    let requestedCapacity = 0;
    if (capacity !== undefined && capacity !== null && capacity !== '') {
        requestedCapacity = Number(capacity);
        if (!Number.isInteger(requestedCapacity) || requestedCapacity <= 0) {
            throw new ActivityValidationError('Required capacity must be a positive whole number.');
        }
    }

    const requiredCapacity = Math.max(batchSummary.totalStudents, requestedCapacity);
    if (room.capacity < requiredCapacity) {
        throw new ActivityValidationError(
            `Room ${room.roomNumber} can hold ${room.capacity} students, but this activity requires ${requiredCapacity}.`,
            {
                capacityError: true,
                maxCapacity: room.capacity,
                requestedCapacity: requiredCapacity,
                batchStudentCount: batchSummary.totalStudents
            }
        );
    }

    return {
        room,
        faculty,
        date: bookingDate,
        dayOfWeek: getDayOfWeek(bookingDate),
        startTime,
        endTime,
        batches: normalizedBatches,
        batchCounts: batchSummary.counts,
        batchStudentCount: batchSummary.totalStudents,
        requestedCapacity,
        requiredCapacity
    };
}

export async function getActivityConflicts({
    roomId,
    facultyId,
    date,
    dayOfWeek,
    startTime,
    endTime,
    batches,
    excludeIds = []
}) {
    const activityDateQuery = getActivityDateQuery({ date, dayOfWeek });
    const baseQuery = {
        ...activityDateQuery,
        status: 'Approved',
        $and: [
            { startTime: { $lt: endTime } },
            { endTime: { $gt: startTime } }
        ]
    };

    if (excludeIds.length > 0) {
        baseQuery._id = { $nin: excludeIds };
    }

    const [roomConflicts, batchConflicts, facultyConflicts] = await Promise.all([
        Activity.find({ ...baseQuery, requestedRoom: roomId })
            .populate('faculty', 'email name')
            .populate('requestedRoom'),
        Activity.find({ ...baseQuery, affectedBatches: { $in: batches } })
            .populate('faculty', 'email name')
            .populate('requestedRoom'),
        facultyId
            ? Activity.find({ ...baseQuery, faculty: facultyId })
                .populate('faculty', 'email name')
                .populate('requestedRoom')
            : Promise.resolve([])
    ]);

    const conflictMap = new Map();
    for (const conflict of [...roomConflicts, ...batchConflicts, ...facultyConflicts]) {
        conflictMap.set(String(conflict._id), conflict);
    }

    return {
        conflicts: [...conflictMap.values()],
        roomConflicts,
        batchConflicts,
        facultyConflicts
    };
}
