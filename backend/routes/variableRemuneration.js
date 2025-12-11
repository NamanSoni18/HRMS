const express = require('express');
const router = express.Router();
const VariableRemuneration = require('../models/VariableRemuneration');
const { protect } = require('../middleware/auth');

// Save or Update Remuneration
router.post('/', protect, async (req, res) => {
    try {
        const { remunerationData, month, year } = req.body;

        const promises = remunerationData.map(async (data) => {
            return VariableRemuneration.findOneAndUpdate(
                {
                    employee: data.employeeId,
                    month: month,
                    year: year
                },
                {
                    punctuality: parseFloat(data.punctuality) || 0,
                    sincerity: parseFloat(data.sincerity) || 0,
                    responsiveness: parseFloat(data.responsiveness) || 0,
                    assignedTask: parseFloat(data.assignedTask) || 0,
                    peerRating: parseFloat(data.peerRating) || 0,
                    totalScore: parseFloat(data.totalScore) || 0,
                    percentage: parseFloat(data.percentage) || 0,
                    amount: parseFloat(data.amount) || 0
                },
                { upsert: true, new: true }
            );
        });

        await Promise.all(promises);

        res.json({ success: true, message: 'Variable remuneration saved successfully' });
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get Remuneration for a Month
router.get('/', protect, async (req, res) => {
    try {
        const { month, year } = req.query;

        const records = await VariableRemuneration.find({
            month: month,
            year: parseInt(year)
        });

        const remunerationMap = {};
        records.forEach(record => {
            remunerationMap[record.employee] = record;
        });

        res.json({ success: true, remunerationMap });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
