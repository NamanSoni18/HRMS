const express = require('express');
const router = express.Router();
const AccessLevel = require('../models/AccessLevel');
const RolePermission = require('../models/RolePermission');
const { protect, authorize } = require('../middleware/auth');

/**
 * Access Level Management Routes
 * These routes manage the level-based access control system
 * Changes to levels automatically cascade to all roles at that level
 */

// ==================== GET ROUTES ====================

/**
 * GET /api/levels
 * Get all access levels
 * Required: Admin role
 */
router.get('/', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const levels = await AccessLevel.find({ isActive: true })
            .sort({ level: 1 })
            .lean();
        
        // Add role count for each level
        for (const level of levels) {
            const roleCount = await RolePermission.countDocuments({
                hierarchyLevel: level.level,
                isActive: true
            });
            level.roleCount = roleCount;
        }
        
        res.json({
            success: true,
            levels
        });
    } catch (error) {
        console.error('Error fetching access levels:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch access levels',
            error: error.message
        });
    }
});

/**
 * GET /api/levels/:level
 * Get a specific access level by level number
 * Required: Admin role
 */
router.get('/:level', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const level = await AccessLevel.findOne({
            level: parseInt(req.params.level),
            isActive: true
        }).lean();
        
        if (!level) {
            return res.status(404).json({
                success: false,
                message: 'Access level not found'
            });
        }
        
        // Get roles at this level
        const roles = await RolePermission.find({
            hierarchyLevel: level.level,
            isActive: true
        }).select('roleId displayName').lean();
        
        level.roles = roles;
        
        res.json({
            success: true,
            level
        });
    } catch (error) {
        console.error('Error fetching access level:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch access level',
            error: error.message
        });
    }
});

/**
 * GET /api/levels/:level/roles
 * Get all roles at a specific level
 * Required: Admin role
 */
router.get('/:level/roles', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const levelNum = parseInt(req.params.level);
        const roles = await RolePermission.getRolesByLevel(levelNum);
        
        res.json({
            success: true,
            level: levelNum,
            roles
        });
    } catch (error) {
        console.error('Error fetching roles by level:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch roles',
            error: error.message
        });
    }
});

/**
 * GET /api/levels/:level/affected-roles
 * Get roles that would be affected by changes to this level
 * Required: Admin role
 */
router.get('/:level/affected-roles', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const levelNum = parseInt(req.params.level);
        const accessLevel = await AccessLevel.findOne({ level: levelNum, isActive: true });
        
        if (!accessLevel) {
            return res.status(404).json({
                success: false,
                message: 'Access level not found'
            });
        }
        
        const affectedRoles = await AccessLevel.getAffectedRoles(levelNum);
        
        res.json({
            success: true,
            level: levelNum,
            affectedRoles,
            count: affectedRoles.length
        });
    } catch (error) {
        console.error('Error fetching affected roles:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch affected roles',
            error: error.message
        });
    }
});

// ==================== POST ROUTES ====================

/**
 * POST /api/levels
 * Create a new access level
 * Required: Admin role
 */
router.post('/', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const {
            level,
            levelName,
            description,
            componentAccess,
            featureAccess,
            cascadeToRoles,
            isSystemLevel
        } = req.body;
        
        // Validate level number
        if (level < 0 || level > 10) {
            return res.status(400).json({
                success: false,
                message: 'Level must be between 0 and 10'
            });
        }
        
        // Check if level already exists
        const existing = await AccessLevel.findOne({ level });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: `Access level ${level} already exists`
            });
        }
        
        // Create new access level
        const newLevel = new AccessLevel({
            level,
            levelName,
            description,
            componentAccess: componentAccess || [],
            featureAccess: featureAccess || [],
            cascadeToRoles: cascadeToRoles !== false,
            isSystemLevel: isSystemLevel || false,
            isActive: true
        });
        
        await newLevel.save();
        
        res.status(201).json({
            success: true,
            message: 'Access level created successfully',
            level: newLevel
        });
    } catch (error) {
        console.error('Error creating access level:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create access level',
            error: error.message
        });
    }
});

// ==================== PUT ROUTES ====================

/**
 * PUT /api/levels/:level
 * Update an access level (cascades to roles)
 * Required: Admin role
 */
router.put('/:level', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const levelNum = parseInt(req.params.level);
        const updates = req.body;
        
        // Find the access level
        const accessLevel = await AccessLevel.findOne({ level: levelNum, isActive: true });
        if (!accessLevel) {
            return res.status(404).json({
                success: false,
                message: 'Access level not found'
            });
        }
        
        // Prevent changing level number if it's a system level
        if (accessLevel.isSystemLevel && updates.level !== undefined && updates.level !== levelNum) {
            return res.status(403).json({
                success: false,
                message: 'Cannot change level number for system levels'
            });
        }
        
        // Get affected roles before update
        const affectedRoles = await AccessLevel.getAffectedRoles(levelNum);
        
        // Update fields
        if (updates.levelName) accessLevel.levelName = updates.levelName;
        if (updates.description !== undefined) accessLevel.description = updates.description;
        if (updates.componentAccess) accessLevel.componentAccess = updates.componentAccess;
        if (updates.featureAccess) accessLevel.featureAccess = updates.featureAccess;
        if (updates.cascadeToRoles !== undefined) accessLevel.cascadeToRoles = updates.cascadeToRoles;
        
        // Save (this will trigger cascade to roles)
        await accessLevel.save();
        
        res.json({
            success: true,
            message: 'Access level updated successfully',
            level: accessLevel,
            cascaded: accessLevel.cascadeToRoles,
            affectedRoles: affectedRoles.length
        });
    } catch (error) {
        console.error('Error updating access level:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update access level',
            error: error.message
        });
    }
});

/**
 * PUT /api/levels/:level/component/:componentId
 * Update a specific component permission for a level
 * Required: Admin role
 */
router.put('/:level/component/:componentId', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const levelNum = parseInt(req.params.level);
        const { componentId } = req.params;
        const { hasAccess } = req.body;
        
        const accessLevel = await AccessLevel.findOne({ level: levelNum, isActive: true });
        if (!accessLevel) {
            return res.status(404).json({
                success: false,
                message: 'Access level not found'
            });
        }
        
        // Find and update the component
        const component = accessLevel.componentAccess.find(c => c.componentId === componentId);
        if (!component) {
            return res.status(404).json({
                success: false,
                message: 'Component not found in this level'
            });
        }
        
        component.hasAccess = hasAccess;
        await accessLevel.save();
        
        res.json({
            success: true,
            message: 'Component permission updated',
            component,
            cascaded: accessLevel.cascadeToRoles
        });
    } catch (error) {
        console.error('Error updating component permission:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update component permission',
            error: error.message
        });
    }
});

/**
 * PUT /api/levels/:level/feature/:featureId
 * Update a specific feature permission for a level
 * Required: Admin role
 */
router.put('/:level/feature/:featureId', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const levelNum = parseInt(req.params.level);
        const { featureId } = req.params;
        const { hasAccess } = req.body;
        
        const accessLevel = await AccessLevel.findOne({ level: levelNum, isActive: true });
        if (!accessLevel) {
            return res.status(404).json({
                success: false,
                message: 'Access level not found'
            });
        }
        
        // Find and update the feature
        const feature = accessLevel.featureAccess.find(f => f.featureId === featureId);
        if (!feature) {
            return res.status(404).json({
                success: false,
                message: 'Feature not found in this level'
            });
        }
        
        feature.hasAccess = hasAccess;
        await accessLevel.save();
        
        res.json({
            success: true,
            message: 'Feature permission updated',
            feature,
            cascaded: accessLevel.cascadeToRoles
        });
    } catch (error) {
        console.error('Error updating feature permission:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update feature permission',
            error: error.message
        });
    }
});

/**
 * PUT /api/levels/:level/apply-to-role/:roleId
 * Manually apply level permissions to a specific role
 * Required: Admin role
 */
router.put('/:level/apply-to-role/:roleId', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const levelNum = parseInt(req.params.level);
        const { roleId } = req.params;
        
        const updatedRole = await AccessLevel.applyToRole(levelNum, roleId);
        
        res.json({
            success: true,
            message: `Applied level ${levelNum} permissions to role ${roleId}`,
            role: updatedRole
        });
    } catch (error) {
        console.error('Error applying level to role:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to apply level permissions',
            error: error.message
        });
    }
});

/**
 * PUT /api/levels/:level/toggle-cascade
 * Toggle cascade setting for a level
 * Required: Admin role
 */
router.put('/:level/toggle-cascade', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const levelNum = parseInt(req.params.level);
        
        const accessLevel = await AccessLevel.findOne({ level: levelNum, isActive: true });
        if (!accessLevel) {
            return res.status(404).json({
                success: false,
                message: 'Access level not found'
            });
        }
        
        accessLevel.cascadeToRoles = !accessLevel.cascadeToRoles;
        await accessLevel.save();
        
        res.json({
            success: true,
            message: `Cascade ${accessLevel.cascadeToRoles ? 'enabled' : 'disabled'} for level ${levelNum}`,
            cascadeEnabled: accessLevel.cascadeToRoles
        });
    } catch (error) {
        console.error('Error toggling cascade:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle cascade',
            error: error.message
        });
    }
});

// ==================== DELETE ROUTES ====================

/**
 * DELETE /api/levels/:level
 * Soft delete an access level (only non-system levels)
 * Required: Admin role
 */
router.delete('/:level', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const levelNum = parseInt(req.params.level);
        
        const accessLevel = await AccessLevel.findOne({ level: levelNum, isActive: true });
        if (!accessLevel) {
            return res.status(404).json({
                success: false,
                message: 'Access level not found'
            });
        }
        
        // Prevent deletion of system levels
        if (accessLevel.isSystemLevel) {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete system access levels'
            });
        }
        
        // Check if any roles use this level
        const rolesAtLevel = await RolePermission.countDocuments({
            hierarchyLevel: levelNum,
            isActive: true
        });
        
        if (rolesAtLevel > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete level: ${rolesAtLevel} role(s) are using this level`,
                rolesCount: rolesAtLevel
            });
        }
        
        // Soft delete
        accessLevel.isActive = false;
        await accessLevel.save();
        
        res.json({
            success: true,
            message: 'Access level deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting access level:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete access level',
            error: error.message
        });
    }
});

module.exports = router;
