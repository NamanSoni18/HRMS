const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const seedUsers = async () => {
    try {
        await connectDB();

        // Generate salt for password hashing
        const salt = await bcrypt.genSalt(10);

        // Hash passwords manually since findOneAndUpdate bypasses pre-save hook
        const medhaPassword = await bcrypt.hash('medha', salt);
        const sunilPassword = await bcrypt.hash('sunil', salt);
        const ashokPassword = await bcrypt.hash('ashok', salt);
        const anujPassword = await bcrypt.hash('anuj', salt);

        // Seed CEO
        await User.findOneAndUpdate(
            { username: 'medha' },
            {
                employeeId: 'NITR-CEO-001',
                username: 'medha',
                email: 'ceo@nitrrfie.com',
                password: medhaPassword,
                role: 'CEO',
                profile: {
                    firstName: 'Medha',
                    lastName: 'Singh',
                    phone: '9876543210',
                    address: {
                        street: 'NIT Raipur Campus',
                        city: 'Raipur',
                        state: 'Chhattisgarh',
                        pincode: '492010'
                    },
                    dateOfBirth: new Date('1980-01-01'),
                    gender: 'Female'
                },
                employment: {
                    designation: 'Chief Executive Officer',
                    department: 'Executive',
                    joiningDate: new Date('2020-01-01'),
                    employmentType: 'Full-time',
                    salary: {
                        basic: 150000,
                        hra: 50000,
                        allowances: 50000,
                        deductions: 0
                    }
                },
                leaveBalance: {
                    casualLeave: 12,
                    onDutyLeave: 15,
                    leaveWithoutPay: 0
                },
                isActive: true
            },
            { upsert: true, new: true }
        );
        console.log('CEO user seeded successfully');

        // Seed Incubation Manager
        await User.findOneAndUpdate(
            { username: 'sunil' },
            {
                employeeId: 'NITR-MGR-001',
                username: 'sunil',
                email: 'manager@nitrrfie.com',
                password: sunilPassword,
                role: 'INCUBATION_MANAGER',
                profile: {
                    firstName: 'Sunil',
                    lastName: 'Dewangan',
                    phone: '9876543211',
                    address: {
                        street: 'NIT Raipur Campus',
                        city: 'Raipur',
                        state: 'Chhattisgarh',
                        pincode: '492010'
                    },
                    dateOfBirth: new Date('1985-06-15'),
                    gender: 'Male'
                },
                employment: {
                    designation: 'Incubation Manager',
                    department: 'Operations',
                    joiningDate: new Date('2021-03-01'),
                    employmentType: 'Full-time',
                    salary: {
                        basic: 80000,
                        hra: 30000,
                        allowances: 20000,
                        deductions: 0
                    }
                },
                leaveBalance: {
                    casualLeave: 12,
                    onDutyLeave: 15,
                    leaveWithoutPay: 0
                },
                isActive: true
            },
            { upsert: true, new: true }
        );
        console.log('Incubation Manager user seeded successfully');

        // Seed Accountant
        await User.findOneAndUpdate(
            { username: 'ashok' },
            {
                employeeId: 'NITR-ACC-001',
                username: 'ashok',
                email: 'accountant@nitrrfie.com',
                password: ashokPassword,
                role: 'ACCOUNTANT',
                profile: {
                    firstName: 'Ashok',
                    lastName: 'Kumar Sahu',
                    phone: '9876543212',
                    address: {
                        street: 'NIT Raipur Campus',
                        city: 'Raipur',
                        state: 'Chhattisgarh',
                        pincode: '492010'
                    },
                    dateOfBirth: new Date('1988-03-20'),
                    gender: 'Male'
                },
                employment: {
                    designation: 'Accountant',
                    department: 'Finance',
                    joiningDate: new Date('2022-01-15'),
                    employmentType: 'Full-time',
                    salary: {
                        basic: 60000,
                        hra: 25000,
                        allowances: 15000,
                        deductions: 0
                    }
                },
                leaveBalance: {
                    casualLeave: 12,
                    onDutyLeave: 15,
                    leaveWithoutPay: 0
                },
                isActive: true
            },
            { upsert: true, new: true }
        );
        console.log('Accountant user seeded successfully');

        // Seed Faculty In Charge
        await User.findOneAndUpdate(
            { username: 'anuj' },
            {
                employeeId: 'NITR-FIC-001',
                username: 'anuj',
                email: 'facultyincharge@nitrrfie.com',
                password: anujPassword,
                role: 'FACULTY_IN_CHARGE',
                profile: {
                    firstName: 'Anuj',
                    lastName: 'Shukla',
                    phone: '9136271032',
                    address: {
                        street: 'NIT Raipur Campus',
                        city: 'Raipur',
                        state: 'Chhattisgarh',
                        pincode: '492010'
                    },
                    dateOfBirth: new Date('1988-03-20'),
                    gender: 'Male'
                },
                employment: {
                    designation: 'FACULTY_IN_CHARGE',
                    department: 'NITRRFIE',
                    joiningDate: new Date('2022-01-15'),
                    employmentType: 'Full-time',
                    salary: {
                        basic: 60000,
                        hra: 25000,
                        allowances: 15000,
                        deductions: 0
                    }
                },
                leaveBalance: {
                    casualLeave: 12,
                    onDutyLeave: 15,
                    leaveWithoutPay: 0
                },
                isActive: true
            },
            { upsert: true, new: true }
        );
        console.log('Faculty In Charge user seeded successfully');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding users:', error.message);
        process.exit(1);
    }
};

seedUsers();
