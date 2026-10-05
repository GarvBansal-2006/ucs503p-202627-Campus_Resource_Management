import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Room from './models/Room.js';
import User from './models/User.js';
import Activity from './models/Activity.js';

dotenv.config();

const seedDatabase = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected! Clearing old data...");

        await Room.deleteMany({});
        await User.deleteMany({});
        await Activity.deleteMany({});

        console.log("Injecting Rooms...");
       
        const roomsToInsert = [
            // Lecture Halls (Capacity 150)
            { roomNumber: 'LT302', capacity: 150, type: 'Lecture Hall', coordinates: {x: 100, y: 150} },
            { roomNumber: 'LT303', capacity: 150, type: 'Lecture Hall', coordinates: {x: 100, y: 160} },
            { roomNumber: 'LT401', capacity: 150, type: 'Lecture Hall', coordinates: {x: 100, y: 170} },
            { roomNumber: 'LT402', capacity: 150, type: 'Lecture Hall', coordinates: {x: 100, y: 180} },
            { roomNumber: 'LT403', capacity: 150, type: 'Lecture Hall', coordinates: {x: 100, y: 190} },
            { roomNumber: 'LT101', capacity: 250, type: 'Lecture Hall', coordinates: {x: 100, y: 200} },
            { roomNumber: 'LP104', capacity: 150, type: 'Lecture Hall', coordinates: {x: 300, y: 150} }, 
            
            // Labs / Practicals (Capacity 35)
            { roomNumber: 'IS2(L409)', capacity: 35, type: 'Lab', coordinates: {x: 500, y: 100} },
            { roomNumber: 'SE2(L105)', capacity: 35, type: 'Lab', coordinates: {x: 550, y: 120} },
            { roomNumber: 'AI(L307)', capacity: 35, type: 'Lab', coordinates: {x: 600, y: 140} },
            { roomNumber: 'NS1(L102)', capacity: 35, type: 'Lab', coordinates: {x: 700, y: 160} },
            { roomNumber: 'LP108', capacity: 100, type: 'Lab', coordinates: {x: 300, y: 180} }
        ];

        const insertedRooms = await Room.insertMany(roomsToInsert);
        
        const roomMap = {};
        insertedRooms.forEach(room => {
            roomMap[room.roomNumber] = room._id;
        });

        console.log("Injecting Dummy Users for Auth Testing...");
        
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.default.hash('password123', 10);

        const dummyStudent = await User.create({
            name: 'Test Student',
            email: 'dummy_student@test.edu',
            password: hashedPassword,
            role: 'Student',
            batch: '3C54'
        });

        const mockFaculty = await User.create({ 
            name: 'Test Faculty', 
            email: 'dummy_faculty@test.edu', 
            password: hashedPassword,
            role: 'Faculty' 
        });

        const dummyAdmin = await User.create({
            name: 'Test Admin',
            email: 'admin@test.edu',
            password: hashedPassword,
            role: 'Admin'
        });

        console.log("Injecting 3C54 Weekly Timetable...");
       
        const activitiesToInsert = [
            // MONDAY
            { title: 'PRACTICAL: Image Processing', room: 'IS2(L409)', day: 'Monday', start: '08:00', end: '09:40' },
            { title: 'LECTURE: Enterprise Web Application', room: 'LT303', day: 'Monday', start: '09:40', end: '10:30' },
            { title: 'LECTURE: Ethics And Risk Mitigation In AI', room: 'LT303', day: 'Monday', start: '10:30', end: '11:20' },
            
            // TUESDAY
            { title: 'PRACTICAL: Software Engineering', room: 'SE2(L105)', day: 'Tuesday', start: '08:00', end: '09:40' },
            { title: 'LECTURE: Image Processing', room: 'LT302', day: 'Tuesday', start: '09:40', end: '10:30' },
            { title: 'LECTURE: Computer Architecture', room: 'LT302', day: 'Tuesday', start: '10:30', end: '11:20' },
            { title: 'LECTURE: Machine Learning', room: 'LT302', day: 'Tuesday', start: '11:20', end: '12:10' },
            { title: 'LECTURE: Enterprise Web Application', room: 'LT302', day: 'Tuesday', start: '12:10', end: '13:00' },
            { title: 'LECTURE: Ethics And Risk Mitigation In AI', room: 'LT401', day: 'Tuesday', start: '15:30', end: '16:20' },
            { title: 'LECTURE: Software Engineering', room: 'LT302', day: 'Tuesday', start: '16:20', end: '17:10' },

            // WEDNESDAY
            { title: 'LECTURE: Machine Learning', room: 'LT403', day: 'Wednesday', start: '13:00', end: '13:50' },
            { title: 'LECTURE: Software Engineering', room: 'LT403', day: 'Wednesday', start: '13:50', end: '14:40' },
            { title: 'LECTURE: Computer Architecture', room: 'LT403', day: 'Wednesday', start: '14:40', end: '15:30' },
            { title: 'PRACTICAL: Machine Learning', room: 'AI(L307)', day: 'Wednesday', start: '15:30', end: '17:10' },

            // THURSDAY
            { title: 'LECTURE: Computer Architecture', room: 'LT302', day: 'Thursday', start: '10:30', end: '11:20' },
            { title: 'LECTURE: Conversational AI', room: 'LT101', day: 'Thursday', start: '11:20', end: '13:00' },
            { title: 'LECTURE: Software Engineering', room: 'LP104', day: 'Thursday', start: '13:50', end: '14:40' },
            { title: 'LECTURE: Image Processing', room: 'LP104', day: 'Thursday', start: '14:40', end: '15:30' },

            // FRIDAY
            { title: 'PRACTICAL: Enterprise Web Application', room: 'NS1(L102)', day: 'Friday', start: '08:00', end: '09:40' },
            { title: 'LECTURE: Ethics And Risk Mitigation In AI', room: 'LT402', day: 'Friday', start: '11:20', end: '12:10' },
            { title: 'LECTURE: Machine Learning', room: 'LT402', day: 'Friday', start: '12:10', end: '13:00' },
            { title: 'PRACTICAL: Conversational AI', room: 'LP108', day: 'Friday', start: '13:50', end: '15:30' },
            { title: 'LECTURE: Image Processing', room: 'LT401', day: 'Friday', start: '15:30', end: '16:20' },
            { title: 'LECTURE: Enterprise Web Application', room: 'LT402', day: 'Friday', start: '16:20', end: '17:10' }
        ];

        const mappedActivities = activitiesToInsert.map(act => ({
            title: act.title,
            requestedRoom: roomMap[act.room], 
            faculty: mockFaculty._id,
            dayOfWeek: act.day,
            startTime: act.start,
            endTime: act.end,
            affectedBatches: ['3C54'],
            status: 'Approved' 
        }));

        await Activity.insertMany(mappedActivities);

        console.log(`Successfully seeded ${insertedRooms.length} rooms and ${mappedActivities.length} scheduled activities! 🌱`);
        process.exit();

    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seedDatabase();