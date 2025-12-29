const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Remuneration = require('./models/Remuneration');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

/**
 * Remuneration Seeding Script
 * This script seeds remuneration data for employees
 * Run with: node seedRemuneration.js
 */

const remunerationData = [
    {
        employeeId: 'NITR-CEO-001',
        month: 'December',
        year: 2025,
        grossRemuneration: 80000,
        fixedRemuneration: 64000.0,
        variableRemuneration: 16000.0,
        totalRemuneration: 80000.0,
        tds: 0.0,
        otherDeduction: 0.0,
        panBankDetails: 'PAN: BHRPS4064A\nBANK: IDBI Bank,\nCivil Lines, Raipur\nA/C: 0495104000146716\nIFSC: IBKL0000495'
    },
    {
        employeeId: 'FIE/EM001',
        month: 'December',
        year: 2025,
        grossRemuneration: 54000,
        fixedRemuneration: 43200.0,
        variableRemuneration: 10800.0,
        totalRemuneration: 54000.0,
        tds: 0.0,
        otherDeduction: 0.0,
        panBankDetails: 'PAN: BJZPD0141A\nBANK: State Bank of India,\nCamp Area Bhilai,\nNear Power House, Bhilai\nA/C: 38072524817\nIFSC: SBIN0009154'
    },
    {
        employeeId: 'FIE/ES001',
        month: 'December',
        year: 2025,
        grossRemuneration: 32400,
        fixedRemuneration: 25920.0,
        variableRemuneration: 6480.0,
        totalRemuneration: 32400.0,
        tds: 0.0,
        otherDeduction: 0.0,
        panBankDetails: 'PAN: BCPPA5763A\nBANK: State Bank of India,\nTelibandha GE Road, Near\nRailway Crossing\nA/C: 30174860333\nIFSC: SBIN0005194'
    },
    {
        employeeId: 'FIE/ES002',
        month: 'December',
        year: 2025,
        grossRemuneration: 10000,
        fixedRemuneration: 8000.0,
        variableRemuneration: 2000.0,
        totalRemuneration: 10000.0,
        tds: 0.0,
        otherDeduction: 0.0,
        panBankDetails: 'PAN: CUTPV9394L\nBANK: State Bank of India,\nNesta, Tilda\nA/C: 39634349811\nIFSC: SBIN0001470'
    },
    {
        employeeId: 'FIE/ES003',
        month: 'December',
        year: 2025,
        grossRemuneration: 25000,
        fixedRemuneration: 20000.0,
        variableRemuneration: 5000.0,
        totalRemuneration: 25000.0,
        tds: 0.0,
        otherDeduction: 0.0,
        panBankDetails: 'PAN: BSVPK8707R\nBANK: Union Bank of India,\nBorsi, Durg\nA/C: 747902010017132\nIFSC: UBIN0576708'
    },
    {
        employeeId: 'NITR-ADMIN-001',
        month: 'December',
        year: 2025,
        grossRemuneration: 5000,
        fixedRemuneration: 4000.0,
        variableRemuneration: 1000.0,
        totalRemuneration: 5000.0,
        tds: 0.0,
        otherDeduction: 0.0,
        panBankDetails: 'PAN: BHRPS4064A\nBANK: IDBI Bank,\nCivil Lines, Raipur\nA/C: 0495104000146716\nIFSC: IBKL0000495'
    }
];

const seedRemuneration = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        // Clear existing remuneration data (optional)
        const deleteResult = await Remuneration.deleteMany({});
        console.log(`Cleared ${deleteResult.deletedCount} existing remuneration records`);

        // Process each remuneration entry
        for (const remData of remunerationData) {
            // Find user by employeeId at the top level
            const user = await User.findOne({ employeeId: remData.employeeId });
            
            if (!user) {
                console.log(`⚠️  User with employeeId ${remData.employeeId} not found, skipping...`);
                continue;
            }

            // Create remuneration record
            const remuneration = new Remuneration({
                employee: user._id,
                employeeId: remData.employeeId,
                month: remData.month,
                year: remData.year,
                grossRemuneration: remData.grossRemuneration,
                daysWorked: 0,
                casualLeave: 0,
                weeklyOff: 0,
                holidays: 0,
                lwpDays: 0,
                totalDays: 0,
                payableDays: 0,
                fixedRemuneration: remData.fixedRemuneration,
                variableRemuneration: remData.variableRemuneration,
                totalRemuneration: remData.totalRemuneration,
                tds: remData.tds,
                otherDeduction: remData.otherDeduction,
                netPayable: remData.totalRemuneration - remData.tds - remData.otherDeduction,
                panBankDetails: remData.panBankDetails
            });

            await remuneration.save();
            console.log(`✓ Seeded remuneration for ${user.username} (${remData.employeeId})`);
        }

        console.log('\n✅ Remuneration seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding remuneration:', error);
        process.exit(1);
    }
};

// Run the seeding function
seedRemuneration();
