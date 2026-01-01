const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Remuneration = require('../models/Remuneration');
const VariableRemuneration = require('../models/VariableRemuneration');
const { protect, isManagement } = require('../middleware/auth');

// Indian National Holidays 2025 (Gazetted)
const NATIONAL_HOLIDAYS = {
    2025: [
        { date: '2025-01-26', name: 'Republic Day' },
        { date: '2025-03-14', name: 'Holi' },
        { date: '2025-03-31', name: 'Eid al-Fitr' },
        { date: '2025-04-14', name: 'Ambedkar Jayanti' },
        { date: '2025-04-18', name: 'Good Friday' },
        { date: '2025-05-12', name: 'Buddha Purnima' },
        { date: '2025-06-07', name: 'Eid al-Adha' },
        { date: '2025-07-06', name: 'Muharram' },
        { date: '2025-08-15', name: 'Independence Day' },
        { date: '2025-08-16', name: 'Janmashtami' },
        { date: '2025-09-05', name: 'Milad-un-Nabi' },
        { date: '2025-10-02', name: 'Gandhi Jayanti' },
        { date: '2025-10-20', name: 'Diwali' },
        { date: '2025-11-05', name: 'Guru Nanak Jayanti' },
        { date: '2025-12-25', name: 'Christmas' }
    ]
};

// Helper: Get number of days in a month
const getDaysInMonth = (year, month) => {
    return new Date(Date.UTC(year, month, 0)).getUTCDate();
};

// Helper: Count weekends (Sat + Sun) in a month from a start date
const countWeekends = (year, month, startDay = 1) => {
    const daysInMonth = getDaysInMonth(year, month);
    let count = 0;
    for (let day = startDay; day <= daysInMonth; day++) {
        const date = new Date(Date.UTC(year, month - 1, day));
        const dayOfWeek = date.getUTCDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) count++;
    }
    return count;
};

// Helper: Count national holidays in a month from a start date
const countHolidays = (year, month, startDay = 1) => {
    const holidays = NATIONAL_HOLIDAYS[year] || [];
    let count = 0;
    holidays.forEach(h => {
        const hDate = new Date(h.date);
        if (hDate.getUTCFullYear() === year &&
            (hDate.getUTCMonth() + 1) === month &&
            hDate.getUTCDate() >= startDay) {
            // Check if holiday falls on a weekend (don't double count)
            const dayOfWeek = hDate.getUTCDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                count++;
            }
        }
    });
    return count;
};

// @route   GET /api/remuneration/attendance-summary
// @desc    Get attendance summary for all employees for a month
// @access  Management only
router.get('/attendance-summary', protect, isManagement, async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ success: false, message: 'Month and year are required' });
        }

        const monthNum = parseInt(month);
        const yearNum = parseInt(year);

        // Get all employees (exclude FACULTY_IN_CHARGE, OFFICER_IN_CHARGE, and ADMIN)
        const users = await User.find({
            role: { $nin: ['FACULTY_IN_CHARGE', 'OFFICER_IN_CHARGE', 'ADMIN'] },
            isActive: true
        }).select('username profile employment role');

        const startDate = new Date(Date.UTC(yearNum, monthNum - 1, 1));
        const endDate = new Date(Date.UTC(yearNum, monthNum, 0, 23, 59, 59, 999));
        const daysInMonth = new Date(Date.UTC(yearNum, monthNum, 0)).getUTCDate();

        // Fetch attendance for all employees for the month
        const allAttendance = await Attendance.find({
            date: { $gte: startDate, $lte: endDate }
        });

        console.log(`Total attendance records found: ${allAttendance.length}`);
        console.log(`Date range: ${startDate} to ${endDate}`);

        // Build summary for each employee
        const employeeSummaries = users.map(user => {
            // Get employee's joining date
            const joiningDate = user.employment?.joiningDate
                ? new Date(user.employment.joiningDate)
                : null;

            // Calculate start day for this employee (1 if joined before this month)
            let effectiveStartDay = 1;
            if (joiningDate && joiningDate.getUTCFullYear() === yearNum &&
                (joiningDate.getUTCMonth() + 1) === monthNum) {
                effectiveStartDay = joiningDate.getUTCDate();
            } else if (joiningDate && joiningDate > endDate) {
                // Joined after this month - no data
                return {
                    employeeId: user._id,
                    name: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || user.username,
                    designation: user.employment?.designation || user.role,
                    dateOfJoining: user.employment?.joiningDate,
                    daysWorked: 0,
                    daysAbsent: 0,
                    casualLeave: 0,
                    weeklyOffs: 0,
                    holidays: 0,
                    lwpDays: 0,
                    totalDays: 0,
                    payableDays: 0
                };
            }

            // Filter attendance for this user
            const userAttendance = allAttendance.filter(
                a => a.user.toString() === user._id.toString()
            );

            // Debug logging for Himanshu
            if (user.username === 'himanshu' || user.profile?.firstName === 'Himanshu') {
                console.log(`Himanshu user ID: ${user._id}`);
                console.log(`Himanshu attendance count: ${userAttendance.length}`);
                console.log(`Himanshu attendance:`, userAttendance.map(a => ({ date: a.date, status: a.status })));
            }

            // Count days present (present or late)
            const daysWorked = userAttendance.filter(
                a => a.status === 'present' || a.status === 'late'
            ).length;

            // Count days on leave (full leave + 0.5 for half day)
            const fullLeaveCount = userAttendance.filter(
                a => a.status === 'on-leave'
            ).length;

            const halfDayCount = userAttendance.filter(
                a => a.status === 'half-day'
            ).length;

            const casualLeave = fullLeaveCount + (halfDayCount * 0.5);

            // Count days absent
            const daysAbsent = userAttendance.filter(
                a => a.status === 'absent'
            ).length;

            // Calculate weekends and holidays from effective start day
            const weeklyOffs = countWeekends(yearNum, monthNum, effectiveStartDay);
            const holidays = countHolidays(yearNum, monthNum, effectiveStartDay);

            // Total working days for this employee
            const totalDaysForEmployee = daysInMonth - effectiveStartDay + 1;

            // LWP = days absent (from attendance records with 'absent' status)
            const lwpDays = daysAbsent;

            // Payable days = Total days - LWP
            const payableDays = totalDaysForEmployee - lwpDays;

            return {
                employeeId: user._id,
                name: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || user.username,
                designation: user.employment?.designation || user.role,
                dateOfJoining: user.employment?.joiningDate,
                grossRemuneration: user.employment?.grossRemuneration || 0,
                daysWorked,
                daysAbsent,
                casualLeave,
                weeklyOffs,
                holidays,
                lwpDays,
                totalDays: totalDaysForEmployee,
                payableDays
            };
        });

        res.json({
            success: true,
            month: monthNum,
            year: yearNum,
            daysInMonth,
            employees: employeeSummaries
        });

    } catch (error) {
        console.error('Attendance summary error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   POST /api/remuneration/generate
// @desc    Generate or update remuneration records for all employees for a month
// @access  Management only
router.post('/generate', protect, isManagement, async (req, res) => {
    try {
        const { month, year } = req.body;

        if (!month || !year) {
            return res.status(400).json({ success: false, message: 'Month and year are required' });
        }

        const monthNum = parseInt(month);
        const yearNum = parseInt(year);

        // Get all employees (exclude FACULTY_IN_CHARGE, OFFICER_IN_CHARGE, and ADMIN)
        const users = await User.find({
            role: { $nin: ['FACULTY_IN_CHARGE', 'OFFICER_IN_CHARGE', 'ADMIN'] },
            isActive: true
        }).select('employeeId username profile employment role documents bankDetails');

        const startDate = new Date(Date.UTC(yearNum, monthNum - 1, 1));
        const endDate = new Date(Date.UTC(yearNum, monthNum, 0, 23, 59, 59, 999));
        const daysInMonth = new Date(Date.UTC(yearNum, monthNum, 0)).getUTCDate();

        // Fetch attendance for all employees for the month
        const allAttendance = await Attendance.find({
            date: { $gte: startDate, $lte: endDate }
        });

        // Fetch variable remuneration data
        const variableRemunerationRecords = await VariableRemuneration.find({
            month: getMonthName(monthNum),
            year: yearNum
        });

        const variableRemunerationMap = {};
        variableRemunerationRecords.forEach(record => {
            variableRemunerationMap[record.employee.toString()] = record.amount || 0;
        });

        const monthName = getMonthName(monthNum);
        const generatedRecords = [];

        // Generate remuneration for each employee
        for (const user of users) {
            const joiningDate = user.employment?.joiningDate
                ? new Date(user.employment.joiningDate)
                : null;

            // Calculate start day for this employee
            let effectiveStartDay = 1;
            if (joiningDate && joiningDate.getUTCFullYear() === yearNum &&
                (joiningDate.getUTCMonth() + 1) === monthNum) {
                effectiveStartDay = joiningDate.getUTCDate();
            } else if (joiningDate && joiningDate > endDate) {
                // Joined after this month - skip
                continue;
            }

            // Filter attendance for this user
            const userAttendance = allAttendance.filter(
                a => a.user.toString() === user._id.toString()
            );

            // Count days present (present or late)
            const daysWorked = userAttendance.filter(
                a => a.status === 'present' || a.status === 'late'
            ).length;

            // Count days on leave
            const fullLeaveCount = userAttendance.filter(
                a => a.status === 'on-leave'
            ).length;

            const halfDayCount = userAttendance.filter(
                a => a.status === 'half-day'
            ).length;

            const casualLeave = fullLeaveCount + (halfDayCount * 0.5);

            // Count days absent
            const daysAbsent = userAttendance.filter(
                a => a.status === 'absent'
            ).length;

            // Calculate weekends and holidays
            const weeklyOffs = countWeekends(yearNum, monthNum, effectiveStartDay);
            const holidays = countHolidays(yearNum, monthNum, effectiveStartDay);

            // Total working days for this employee
            const totalDaysForEmployee = daysInMonth - effectiveStartDay + 1;

            // LWP = days absent
            const lwpDays = daysAbsent;

            // Payable days = Total days - LWP
            const payableDays = totalDaysForEmployee - lwpDays;

            // Calculate remuneration
            const baseSalary = user.employment?.baseSalary || 0;
            const grossRemuneration = baseSalary;
            const fixedRemuneration = baseSalary * 0.8; // 80% fixed
            const variableRemunerationAmount = variableRemunerationMap[user._id.toString()] || (baseSalary * 0.2); // 20% variable
            const totalRemuneration = fixedRemuneration + variableRemunerationAmount;
            
            // Calculate net payable based on payable days
            const perDayAmount = totalRemuneration / totalDaysForEmployee;
            const netPayable = perDayAmount * payableDays;

            // Format PAN and Bank details
            const panBankDetails = formatPANBankDetails(user);
            
            // Format name
            const name = `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || user.username;
            const designation = user.employment?.designation || user.role;

            // Create or update remuneration record
            const remunerationData = {
                employee: user._id,
                employeeId: user.employeeId,
                name: name,
                designation: designation,
                month: monthName,
                year: yearNum,
                grossRemuneration,
                daysWorked,
                casualLeave,
                weeklyOff: weeklyOffs,
                holidays,
                lwpDays,
                totalDays: totalDaysForEmployee,
                payableDays,
                fixedRemuneration,
                variableRemuneration: variableRemunerationAmount,
                totalRemuneration,
                tds: 0,
                otherDeduction: 0,
                netPayable: Math.round(netPayable),
                panBankDetails
            };

            const remuneration = await Remuneration.findOneAndUpdate(
                { employee: user._id, month: monthName, year: yearNum },
                remunerationData,
                { upsert: true, new: true }
            );

            generatedRecords.push(remuneration);
        }

        res.json({
            success: true,
            message: `Remuneration generated for ${generatedRecords.length} employees`,
            count: generatedRecords.length
        });

    } catch (error) {
        console.error('Remuneration generation error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   GET /api/remuneration/records
// @desc    Get all remuneration records for a month
// @access  Management only
router.get('/records', protect, isManagement, async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ success: false, message: 'Month and year are required' });
        }

        const records = await Remuneration.find({
            month: month,
            year: parseInt(year)
        }).populate('employee', 'username profile employeeId employment');

        // Format records with proper employee names
        const formattedRecords = records.map(record => {
            const recordObj = record.toObject();
            
            // If name is not stored, get it from populated employee
            if (!recordObj.name && recordObj.employee) {
                recordObj.name = `${recordObj.employee.profile?.firstName || ''} ${recordObj.employee.profile?.lastName || ''}`.trim() || recordObj.employee.username;
            }
            
            // If designation is not stored, get it from populated employee
            if (!recordObj.designation && recordObj.employee) {
                recordObj.designation = recordObj.employee.employment?.designation || recordObj.employee.role;
            }
            
            return recordObj;
        });

        res.json({ success: true, records: formattedRecords });
    } catch (error) {
        console.error('Fetch remuneration records error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// Helper function to get month name
function getMonthName(monthNum) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNum - 1];
}

// Helper function to format PAN and Bank details
function formatPANBankDetails(user) {
    const pan = user.documents?.pan?.number || 'N/A';
    const bankName = user.bankDetails?.bankName || 'N/A';
    const branch = user.bankDetails?.branch || '';
    const accountNumber = user.bankDetails?.accountNumber || 'N/A';
    const ifscCode = user.bankDetails?.ifscCode || 'N/A';
    
    return `PAN: ${pan}\nBANK: ${bankName},\n${branch}\nA/C: ${accountNumber}\nIFSC: ${ifscCode}`;
}

module.exports = router;
