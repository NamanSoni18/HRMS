const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, isAdminOrCEO } = require('../middleware/auth');

router.get('/', protect, isAdminOrCEO, async (req, res) => {
    try {
        const { role, isActive, search } = req.query;
        
        let query = {};
        
        if (role) query.role = role;
        if (isActive !== undefined) query.isActive = isActive === 'true';
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { 'profile.firstName': { $regex: search, $options: 'i' } },
                { 'profile.lastName': { $regex: search, $options: 'i' } }
            ];
        }
        
        const users = await User.find(query)
            .select('-password')
            .populate('employment.reportingTo', 'username profile.firstName profile.lastName')
            .sort({ createdAt: -1 });
        
        res.json({ success: true, count: users.length, users });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('employment.reportingTo', 'username profile.firstName profile.lastName');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.post('/', protect, isAdminOrCEO, async (req, res) => {
    try {
        const { employeeId, username, email, password, role, profile, employment } = req.body;
        
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }, { employeeId }] 
        });
        
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email, username or employee ID' });
        }
        
        const user = await User.create({
            employeeId,
            username,
            email,
            password,
            role,
            profile,
            employment
        });
        
        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            user: {
                id: user._id,
                employeeId: user.employeeId,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.put('/:id', protect, isAdminOrCEO, async (req, res) => {
    try {
        const { profile, employment, role, isActive, leaveBalance } = req.body;
        
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (profile) user.profile = { ...user.profile, ...profile };
        if (employment) user.employment = { ...user.employment, ...employment };
        if (role) user.role = role;
        if (isActive !== undefined) user.isActive = isActive;
        if (leaveBalance) user.leaveBalance = { ...user.leaveBalance, ...leaveBalance };
        
        await user.save();
        
        res.json({ 
            success: true, 
            message: 'Employee updated successfully',
            user 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.delete('/:id', protect, isAdminOrCEO, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        user.isActive = false;
        await user.save();
        
        res.json({ success: true, message: 'Employee deactivated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/stats/overview', protect, isAdminOrCEO, async (req, res) => {
    try {
        const totalEmployees = await User.countDocuments({ isActive: true });
        const roleWise = await User.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);
        
        res.json({
            success: true,
            stats: {
                totalEmployees,
                roleWise
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all employees for peer rating (accessible by all authenticated users)
router.get('/peer-rating/employees', protect, async (req, res) => {
    try {
        const users = await User.find({ isActive: true })
            .select('_id username profile employment role')
            .sort({ createdAt: 1 });
        
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
