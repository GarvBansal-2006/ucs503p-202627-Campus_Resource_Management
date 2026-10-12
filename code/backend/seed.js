import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Room from './models/Room.js';
import Activity from './models/Activity.js';
import fs from 'fs';

dotenv.config();

const scheduleData = [
    { dayOfWeek: "Monday", startTime: "08:00", endTime: "08:50", batch: "3c51", subject: "UML501P", room: "L313" },
    { dayOfWeek: "Monday", startTime: "08:50", endTime: "09:40", batch: "3c51", subject: "UML501P", room: "L313" },
    { dayOfWeek: "Monday", startTime: "09:40", endTime: "10:30", batch: "3c51", subject: "UCS553L", room: "LT303" },
    { dayOfWeek: "Monday", startTime: "10:30", endTime: "11:20", batch: "3c51", subject: "UCS421L", room: "LT303" },
    { dayOfWeek: "Monday", startTime: "13:50", endTime: "14:40", batch: "3c51", subject: "UCS503P", room: "L501" },
    { dayOfWeek: "Monday", startTime: "14:40", endTime: "15:30", batch: "3c51", subject: "UCS503P", room: "L501" },
    { dayOfWeek: "Tuesday", startTime: "09:40", endTime: "10:30", batch: "3c51", subject: "UCS615L", room: "LT302" },
    { dayOfWeek: "Tuesday", startTime: "10:30", endTime: "11:20", batch: "3c51", subject: "UCS510L", room: "LT302" },
    { dayOfWeek: "Tuesday", startTime: "11:20", endTime: "12:10", batch: "3c51", subject: "UML501L", room: "LT302" },
    { dayOfWeek: "Tuesday", startTime: "12:10", endTime: "13:00", batch: "3c51", subject: "UCS553L", room: "LT302" },
    { dayOfWeek: "Tuesday", startTime: "13:50", endTime: "14:40", batch: "3c51", subject: "UCS615P", room: "L408" },
    { dayOfWeek: "Tuesday", startTime: "14:40", endTime: "15:30", batch: "3c51", subject: "UCS615P", room: "L408" },
    { dayOfWeek: "Tuesday", startTime: "15:30", endTime: "16:20", batch: "3c51", subject: "UCS421L", room: "LT401" },
    { dayOfWeek: "Tuesday", startTime: "16:20", endTime: "17:10", batch: "3c51", subject: "UCS503L", room: "LT401" },
    { dayOfWeek: "Wednesday", startTime: "09:40", endTime: "10:30", batch: "3c51", subject: "UCS553P", room: "L402" },
    { dayOfWeek: "Wednesday", startTime: "10:30", endTime: "11:20", batch: "3c51", subject: "UCS553P", room: "L402" },
    { dayOfWeek: "Wednesday", startTime: "13:00", endTime: "13:50", batch: "3c51", subject: "UML501L", room: "LT403" },
    { dayOfWeek: "Wednesday", startTime: "13:50", endTime: "14:40", batch: "3c51", subject: "UCS503L", room: "LT403" },
    { dayOfWeek: "Wednesday", startTime: "14:40", endTime: "15:30", batch: "3c51", subject: "UCS510L", room: "LT403" },
    { dayOfWeek: "Thursday", startTime: "10:30", endTime: "11:20", batch: "3c51", subject: "UCS510L", room: "LT302" },
    { dayOfWeek: "Thursday", startTime: "11:20", endTime: "12:10", batch: "3c52", subject: "CONVERSATIONAL_AI", room: "LT101" },
    { dayOfWeek: "Thursday", startTime: "12:10", endTime: "13:00", batch: "3c52", subject: "CONVERSATIONAL_AI", room: "LT101" },
    { dayOfWeek: "Thursday", startTime: "13:50", endTime: "14:40", batch: "3c51", subject: "UCS503L", room: "LP104" },
    { dayOfWeek: "Thursday", startTime: "14:40", endTime: "15:30", batch: "3c51", subject: "UCS615L", room: "LP104" },
    { dayOfWeek: "Friday", startTime: "11:20", endTime: "12:10", batch: "3c51", subject: "UCS421L", room: "LT402" },
    { dayOfWeek: "Friday", startTime: "12:10", endTime: "13:00", batch: "3c51", subject: "UML501L", room: "LT402" },
    { dayOfWeek: "Friday", startTime: "13:50", endTime: "14:40", batch: "3c52", subject: "CONVERSATIONAL_AI", room: "LP108" },
    { dayOfWeek: "Friday", startTime: "14:40", endTime: "15:30", batch: "3c52", subject: "CONVERSATIONAL_AI", room: "LP108" },
    { dayOfWeek: "Friday", startTime: "15:30", endTime: "16:20", batch: "3c51", subject: "UCS615L", room: "LT401" },
    { dayOfWeek: "Friday", startTime: "16:20", endTime: "17:10", batch: "3c51", subject: "UCS553L", room: "LT401" },
    
        

    { dayOfWeek: "Monday", startTime: "08:00", endTime: "08:50", batch: "3c52", subject: "UML501P", room: "L301" },
    { dayOfWeek: "Monday", startTime: "08:50", endTime: "09:40", batch: "3c52", subject: "UML501P", room: "L301" },
    { dayOfWeek: "Monday", startTime: "09:40", endTime: "10:30", batch: "3c52", subject: "UCS553L", room: "LT303" },
    { dayOfWeek: "Monday", startTime: "10:30", endTime: "11:20", batch: "3c52", subject: "UCS421L", room: "LT303" },
    { dayOfWeek: "Tuesday", startTime: "09:40", endTime: "10:30", batch: "3c52", subject: "UCS615L", room: "LT302" },
    { dayOfWeek: "Tuesday", startTime: "10:30", endTime: "11:20", batch: "3c52", subject: "UCS510L", room: "LT302" },
    { dayOfWeek: "Tuesday", startTime: "11:20", endTime: "12:10", batch: "3c52", subject: "UML501L", room: "LT302" },
    { dayOfWeek: "Tuesday", startTime: "12:10", endTime: "13:00", batch: "3c52", subject: "UCS553L", room: "LT302" },
    { dayOfWeek: "Tuesday", startTime: "13:50", endTime: "14:40", batch: "3c52", subject: "UCS503P", room: "L501" },
    { dayOfWeek: "Tuesday", startTime: "14:40", endTime: "15:30", batch: "3c52", subject: "UCS503P", room: "L501" },
    { dayOfWeek: "Tuesday", startTime: "15:30", endTime: "16:20", batch: "3c52", subject: "UCS421L", room: "LT401" },
    { dayOfWeek: "Tuesday", startTime: "16:20", endTime: "17:10", batch: "3c52", subject: "UCS503L", room: "LT401" },
    { dayOfWeek: "Wednesday", startTime: "09:40", endTime: "10:30", batch: "3c52", subject: "UCS615P", room: "L408" },
    { dayOfWeek: "Wednesday", startTime: "10:30", endTime: "11:20", batch: "3c52", subject: "UCS615P", room: "L408" },
    { dayOfWeek: "Wednesday", startTime: "13:00", endTime: "13:50", batch: "3c52", subject: "UML501L", room: "LT403" },
    { dayOfWeek: "Wednesday", startTime: "13:50", endTime: "14:40", batch: "3c52", subject: "UCS503L", room: "LT403" },
    { dayOfWeek: "Wednesday", startTime: "14:40", endTime: "15:30", batch: "3c52", subject: "UCS510L", room: "LT403" },
    { dayOfWeek: "Thursday", startTime: "10:30", endTime: "11:20", batch: "3c52", subject: "UCS510L", room: "LT302" },
    { dayOfWeek: "Thursday", startTime: "11:20", endTime: "12:10", batch: "3c52", subject: "CONVERSATIONAL_AI", room: "LT101" },
    { dayOfWeek: "Thursday", startTime: "12:10", endTime: "13:00", batch: "3c52", subject: "CONVERSATIONAL_AI", room: "LT101" },
    { dayOfWeek: "Thursday", startTime: "13:50", endTime: "14:40", batch: "3c52", subject: "UCS503L", room: "LP104" },
    { dayOfWeek: "Thursday", startTime: "14:40", endTime: "15:30", batch: "3c52", subject: "UCS615L", room: "LP104" },
    { dayOfWeek: "Friday", startTime: "08:00", endTime: "08:50", batch: "3c52", subject: "UCS553P", room: "L402" },
    { dayOfWeek: "Friday", startTime: "08:50", endTime: "09:40", batch: "3c52", subject: "UCS553P", room: "L402" },
    { dayOfWeek: "Friday", startTime: "11:20", endTime: "12:10", batch: "3c52", subject: "UCS421L", room: "LT402" },
    { dayOfWeek: "Friday", startTime: "12:10", endTime: "13:00", batch: "3c52", subject: "UML501L", room: "LT402" },
    { dayOfWeek: "Friday", startTime: "13:50", endTime: "14:40", batch: "3c52", subject: "CONVERSATIONAL_AI", room: "LP108" },
    { dayOfWeek: "Friday", startTime: "14:40", endTime: "15:30", batch: "3c52", subject: "CONVERSATIONAL_AI", room: "LP108" },
    { dayOfWeek: "Friday", startTime: "15:30", endTime: "16:20", batch: "3c52", subject: "UCS615L", room: "LT401" },
    { dayOfWeek: "Friday", startTime: "16:20", endTime: "17:10", batch: "3c52", subject: "UCS553L", room: "LT401" },
    
    
    
    { dayOfWeek: "Monday", startTime: "08:00", endTime: "08:50", batch: "3c53", subject: "UCS615P", room: "L408" },
    { dayOfWeek: "Monday", startTime: "08:50", endTime: "09:40", batch: "3c53", subject: "UCS615P", room: "L408" },
    { dayOfWeek: "Monday", startTime: "09:40", endTime: "10:30", batch: "3c53", subject: "UCS553L", room: "LT303" },
    { dayOfWeek: "Monday", startTime: "10:30", endTime: "11:20", batch: "3c53", subject: "UCS421L", room: "LT303" },
    { dayOfWeek: "Tuesday", startTime: "09:40", endTime: "10:30", batch: "3c53", subject: "UCS615L", room: "LT302" },
    { dayOfWeek: "Tuesday", startTime: "10:30", endTime: "11:20", batch: "3c53", subject: "UCS510L", room: "LT302" },
    { dayOfWeek: "Tuesday", startTime: "11:20", endTime: "12:10", batch: "3c53", subject: "UML501L", room: "LT302" },
    { dayOfWeek: "Tuesday", startTime: "12:10", endTime: "13:00", batch: "3c53", subject: "UCS553L", room: "LT302" },
    { dayOfWeek: "Tuesday", startTime: "15:30", endTime: "16:20", batch: "3c53", subject: "UCS421L", room: "LT401" },
    { dayOfWeek: "Tuesday", startTime: "16:20", endTime: "17:10", batch: "3c53", subject: "UCS503L", room: "LT401" },
    { dayOfWeek: "Wednesday", startTime: "09:40", endTime: "10:30", batch: "3c53", subject: "UML501P", room: "L308" },
    { dayOfWeek: "Wednesday", startTime: "10:30", endTime: "11:20", batch: "3c53", subject: "UML501P", room: "L308" },
    { dayOfWeek: "Wednesday", startTime: "13:00", endTime: "13:50", batch: "3c53", subject: "UML501L", room: "LT403" },
    { dayOfWeek: "Wednesday", startTime: "13:50", endTime: "14:40", batch: "3c53", subject: "UCS503L", room: "LT403" },
    { dayOfWeek: "Wednesday", startTime: "14:40", endTime: "15:30", batch: "3c53", subject: "UCS510L", room: "LT403" },
    { dayOfWeek: "Thursday", startTime: "10:30", endTime: "11:20", batch: "3c53", subject: "UCS510L", room: "LT302" },
    { dayOfWeek: "Thursday", startTime: "11:20", endTime: "12:10", batch: "3c53", subject: "CONVERSATIONAL_AI", room: "LT101" },
    { dayOfWeek: "Thursday", startTime: "12:10", endTime: "13:00", batch: "3c53", subject: "CONVERSATIONAL_AI", room: "LT101" },
    { dayOfWeek: "Thursday", startTime: "13:50", endTime: "14:40", batch: "3c53", subject: "UCS503L", room: "LP104" },
    { dayOfWeek: "Thursday", startTime: "14:40", endTime: "15:30", batch: "3c53", subject: "UCS615L", room: "LP104" },
    { dayOfWeek: "Friday", startTime: "08:00", endTime: "08:50", batch: "3c53", subject: "UCS503P", room: "L501" },
    { dayOfWeek: "Friday", startTime: "08:50", endTime: "09:40", batch: "3c53", subject: "UCS503P", room: "L501" },
    { dayOfWeek: "Friday", startTime: "09:40", endTime: "10:30", batch: "3c53", subject: "UCS553P", room: "L102" },
    { dayOfWeek: "Friday", startTime: "10:30", endTime: "11:20", batch: "3c53", subject: "UCS553P", room: "L102" },
    { dayOfWeek: "Friday", startTime: "11:20", endTime: "12:10", batch: "3c53", subject: "UCS421L", room: "LT402" },
    { dayOfWeek: "Friday", startTime: "12:10", endTime: "13:00", batch: "3c53", subject: "UML501L", room: "LT402" },
    { dayOfWeek: "Friday", startTime: "13:50", endTime: "14:40", batch: "3c53", subject: "CONVERSATIONAL_AI", room: "LP108" },
    { dayOfWeek: "Friday", startTime: "14:40", endTime: "15:30", batch: "3c53", subject: "CONVERSATIONAL_AI", room: "LP108" },
    { dayOfWeek: "Friday", startTime: "15:30", endTime: "16:20", batch: "3c53", subject: "UCS615L", room: "LT401" },
    { dayOfWeek: "Friday", startTime: "16:20", endTime: "17:10", batch: "3c53", subject: "UCS553L", room: "LT401" },
    
    
    
    { dayOfWeek: "Monday", startTime: "08:00", endTime: "08:50", batch: "3c54", subject: "UCS615P", room: "L409" },
    { dayOfWeek: "Monday", startTime: "08:50", endTime: "09:40", batch: "3c54", subject: "UCS615P", room: "L409" },
    { dayOfWeek: "Monday", startTime: "09:40", endTime: "10:30", batch: "3c54", subject: "UCS553L", room: "LT303" },
    { dayOfWeek: "Monday", startTime: "10:30", endTime: "11:20", batch: "3c54", subject: "UCS421L", room: "LT303" },
    { dayOfWeek: "Monday", startTime: "11:20", endTime: "12:10", batch: "3c54", subject: "ELECTIVE", room: "TBD" },
    { dayOfWeek: "Monday", startTime: "12:10", endTime: "13:00", batch: "3c54", subject: "ELECTIVE", room: "TBD" },
    { dayOfWeek: "Monday", startTime: "15:30", endTime: "16:20", batch: "3c54", subject: "ELECTIVE", room: "TBD" },
    { dayOfWeek: "Monday", startTime: "16:20", endTime: "17:10", batch: "3c54", subject: "ELECTIVE", room: "TBD" },
    { dayOfWeek: "Tuesday", startTime: "08:00", endTime: "08:50", batch: "3c54", subject: "UCS503P", room: "L105" },
    { dayOfWeek: "Tuesday", startTime: "08:50", endTime: "09:40", batch: "3c54", subject: "UCS503P", room: "L105" },
    { dayOfWeek: "Tuesday", startTime: "09:40", endTime: "10:30", batch: "3c54", subject: "UCS615L", room: "LT302" },
    { dayOfWeek: "Tuesday", startTime: "10:30", endTime: "11:20", batch: "3c54", subject: "UCS510L", room: "LT302" },
    { dayOfWeek: "Tuesday", startTime: "11:20", endTime: "12:10", batch: "3c54", subject: "UML501L", room: "LT302" },
    { dayOfWeek: "Tuesday", startTime: "12:10", endTime: "13:00", batch: "3c54", subject: "UCS553L", room: "LT302" },
    { dayOfWeek: "Tuesday", startTime: "15:30", endTime: "16:20", batch: "3c54", subject: "UCS421L", room: "LT401" },
    { dayOfWeek: "Tuesday", startTime: "16:20", endTime: "17:10", batch: "3c54", subject: "UCS503L", room: "LT401" },
    { dayOfWeek: "Wednesday", startTime: "13:00", endTime: "13:50", batch: "3c54", subject: "UML501L", room: "LT403" },
    { dayOfWeek: "Wednesday", startTime: "13:50", endTime: "14:40", batch: "3c54", subject: "UCS503L", room: "LT403" },
    { dayOfWeek: "Wednesday", startTime: "14:40", endTime: "15:30", batch: "3c54", subject: "UCS510L", room: "LT403" },
    { dayOfWeek: "Wednesday", startTime: "15:30", endTime: "16:20", batch: "3c54", subject: "UML501P", room: "L307" },
    { dayOfWeek: "Wednesday", startTime: "16:20", endTime: "17:10", batch: "3c54", subject: "UML501P", room: "L307" },
    { dayOfWeek: "Thursday", startTime: "10:30", endTime: "11:20", batch: "3c54", subject: "UCS510L", room: "LT302" },
    { dayOfWeek: "Thursday", startTime: "11:20", endTime: "12:10", batch: "3c54", subject: "CONVERSATIONAL_AI", room: "LT101" },
    { dayOfWeek: "Thursday", startTime: "12:10", endTime: "13:00", batch: "3c54", subject: "CONVERSATIONAL_AI", room: "LT101" },
    { dayOfWeek: "Thursday", startTime: "13:50", endTime: "14:40", batch: "3c54", subject: "UCS503L", room: "LP104" },
    { dayOfWeek: "Thursday", startTime: "14:40", endTime: "15:30", batch: "3c54", subject: "UCS615L", room: "LP104" },
    { dayOfWeek: "Friday", startTime: "08:00", endTime: "08:50", batch: "3c54", subject: "UCS553P", room: "L102" },
    { dayOfWeek: "Friday", startTime: "08:50", endTime: "09:40", batch: "3c54", subject: "UCS553P", room: "L102" },
    { dayOfWeek: "Friday", startTime: "11:20", endTime: "12:10", batch: "3c54", subject: "UCS421L", room: "LT402" },
    { dayOfWeek: "Friday", startTime: "12:10", endTime: "13:00", batch: "3c54", subject: "UML501L", room: "LT402" },
    { dayOfWeek: "Friday", startTime: "13:50", endTime: "14:40", batch: "3c54", subject: "CONVERSATIONAL_AI", room: "LP108" },
    { dayOfWeek: "Friday", startTime: "14:40", endTime: "15:30", batch: "3c54", subject: "CONVERSATIONAL_AI", room: "LP108" },
    { dayOfWeek: "Friday", startTime: "15:30", endTime: "16:20", batch: "3c54", subject: "UCS615L", room: "LT401" },
    { dayOfWeek: "Friday", startTime: "16:20", endTime: "17:10", batch: "3c54", subject: "UCS553L", room: "LT401" },
    
    
    
    { dayOfWeek: "Monday", startTime: "08:00", endTime: "08:50", batch: "3c55", subject: "UML501P", room: "L308" },
    { dayOfWeek: "Monday", startTime: "08:50", endTime: "09:40", batch: "3c55", subject: "UML501P", room: "L308" },
    { dayOfWeek: "Monday", startTime: "09:40", endTime: "10:30", batch: "3c55", subject: "UCS553L", room: "LT303" },
    { dayOfWeek: "Monday", startTime: "10:30", endTime: "11:20", batch: "3c55", subject: "UCS421L", room: "LT303" },
    { dayOfWeek: "Tuesday", startTime: "08:00", endTime: "08:50", batch: "3c55", subject: "UCS503P", room: "L104" },
    { dayOfWeek: "Tuesday", startTime: "08:50", endTime: "09:40", batch: "3c55", subject: "UCS503P", room: "L104" },
    { dayOfWeek: "Tuesday", startTime: "09:40", endTime: "10:30", batch: "3c55", subject: "UCS615L", room: "LT302" },
    { dayOfWeek: "Tuesday", startTime: "10:30", endTime: "11:20", batch: "3c55", subject: "UCS510L", room: "LT302" },
    { dayOfWeek: "Tuesday", startTime: "11:20", endTime: "12:10", batch: "3c55", subject: "UML501L", room: "LT302" },
    { dayOfWeek: "Tuesday", startTime: "12:10", endTime: "13:00", batch: "3c55", subject: "UCS553L", room: "LT302" },
    { dayOfWeek: "Tuesday", startTime: "15:30", endTime: "16:20", batch: "3c55", subject: "UCS421L", room: "LT401" },
    { dayOfWeek: "Tuesday", startTime: "16:20", endTime: "17:10", batch: "3c55", subject: "UCS503L", room: "LT401" },
    { dayOfWeek: "Wednesday", startTime: "09:40", endTime: "10:30", batch: "3c55", subject: "UCS615P", room: "L409" },
    { dayOfWeek: "Wednesday", startTime: "10:30", endTime: "11:20", batch: "3c55", subject: "UCS615P", room: "L409" },
    { dayOfWeek: "Wednesday", startTime: "13:00", endTime: "13:50", batch: "3c55", subject: "UML501L", room: "LT403" },
    { dayOfWeek: "Wednesday", startTime: "13:50", endTime: "14:40", batch: "3c55", subject: "UCS503L", room: "LT403" },
    { dayOfWeek: "Wednesday", startTime: "14:40", endTime: "15:30", batch: "3c55", subject: "UCS510L", room: "LT403" },
    { dayOfWeek: "Thursday", startTime: "10:30", endTime: "11:20", batch: "3c55", subject: "UCS510L", room: "LT302" },
    { dayOfWeek: "Thursday", startTime: "11:20", endTime: "12:10", batch: "3c55", subject: "CONVERSATIONAL_AI", room: "LT101" },
    { dayOfWeek: "Thursday", startTime: "12:10", endTime: "13:00", batch: "3c55", subject: "CONVERSATIONAL_AI", room: "LT101" },
    { dayOfWeek: "Thursday", startTime: "13:50", endTime: "14:40", batch: "3c55", subject: "UCS503L", room: "LP104" },
    { dayOfWeek: "Thursday", startTime: "14:40", endTime: "15:30", batch: "3c55", subject: "UCS615L", room: "LP104" },
    { dayOfWeek: "Thursday", startTime: "15:30", endTime: "16:20", batch: "3c55", subject: "UCS553P", room: "L102" },
    { dayOfWeek: "Thursday", startTime: "16:20", endTime: "17:10", batch: "3c55", subject: "UCS553P", room: "L102" },
    { dayOfWeek: "Friday", startTime: "11:20", endTime: "12:10", batch: "3c55", subject: "UCS421L", room: "LT402" },
    { dayOfWeek: "Friday", startTime: "12:10", endTime: "13:00", batch: "3c55", subject: "UML501L", room: "LT402" },
    { dayOfWeek: "Friday", startTime: "13:50", endTime: "14:40", batch: "3c55", subject: "CONVERSATIONAL_AI", room: "LP108" },
    { dayOfWeek: "Friday", startTime: "14:40", endTime: "15:30", batch: "3c55", subject: "CONVERSATIONAL_AI", room: "LP108" },
    { dayOfWeek: "Friday", startTime: "15:30", endTime: "16:20", batch: "3c55", subject: "UCS615L", room: "LT401" },
    { dayOfWeek: "Friday", startTime: "16:20", endTime: "17:10", batch: "3c55", subject: "UCS553L", room: "LT401" }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        // Clear existing DB
        await User.deleteMany({});
        await Room.deleteMany({});
        await Activity.deleteMany({});
        console.log("Cleared existing database.");

        const hashedPassword = await bcrypt.hash('password', 10);

        // 1. Create Admin
        await User.create({
            name: "Admin User",
            email: "admin@test.edu",
            password: hashedPassword,
            role: "Admin"
        });

        // 2. Create Students (5 batches, 5 per batch)
        const batches = ['3c51', '3c52', '3c53', '3c54', '3c55'];
        let studentCounter = 1;
        for (const batch of batches) {
            for (let i = 0; i < 5; i++) {
                await User.create({
                    name: `Student ${studentCounter}`,
                    email: `student${studentCounter}@test.edu`,
                    password: hashedPassword,
                    role: "Student",
                    batch: batch
                });
                studentCounter++;
            }
        }
        console.log("Created 25 students across 5 batches.");

        // 3. Extract unique subjects and create Faculty for each
        const uniqueSubjects = [...new Set(scheduleData.map(s => s.subject))];
        const facultyMap = {}; // subject -> faculty ObjectId
        let facultyCounter = 1;
        for (const subj of uniqueSubjects) {
            const fac = await User.create({
                name: `Faculty ${subj}`,
                email: `faculty${facultyCounter}@test.edu`,
                password: hashedPassword,
                role: "Faculty"
            });
            facultyMap[subj] = fac._id;
            facultyCounter++;
        }
        console.log(`Created ${uniqueSubjects.length} faculty members based on subjects.`);

        // 4. Extract unique rooms and create them
        const uniqueRooms = [...new Set(scheduleData.map(s => s.room))];
        const roomMap = {}; // roomName -> room ObjectId
        for (const roomName of uniqueRooms) {
            let capacity = 60;
            if (roomName.startsWith('LT')) capacity = 150;
            if (roomName.startsWith('L') && !roomName.startsWith('LT')) capacity = 40;

            const rm = await Room.create({
                roomNumber: roomName,
                type: capacity > 100 ? 'Lecture Hall' : 'Lab',
                capacity: capacity,
                coordinates: {
                    x: Math.floor(Math.random() * 100),
                    y: Math.floor(Math.random() * 100)
                }
            });
            roomMap[roomName] = rm._id;
        }
        console.log(`Created ${uniqueRooms.length} rooms.`);

        // 5. Create Approved Activities from timetable
        const activityPromises = scheduleData.map(entry => {
            return Activity.create({
                title: entry.subject,
                requestedRoom: roomMap[entry.room],
                faculty: facultyMap[entry.subject],
                dayOfWeek: entry.dayOfWeek,
                startTime: entry.startTime,
                endTime: entry.endTime,
                affectedBatches: [entry.batch],
                status: 'Approved'
            });
        });
        await Promise.all(activityPromises);
        console.log(`Successfully seeded ${activityPromises.length} approved scheduled activities!`);

        process.exit(0);
    } catch (error) {
        console.error("Seeding Error:", error);
        process.exit(1);
    }
}

seed();
