const mongoose = require('mongoose');

/**
 * AccessLevel Model
 * Defines permissions for each hierarchy level in the organization
 * Roles inherit permissions from their assigned level
 * When a level's permissions change, all roles at that level are automatically updated
 */
const AccessLevelSchema = new mongoose.Schema({
    // Level identifier (0=highest, 10=lowest)
    level: {
        type: Number,
        required: true,
        unique: true,
        min: 0,
        max: 10,
        index: true
    },
    
    // Display name for the level
    levelName: {
        type: String,
        required: true,
        trim: true
    },
    
    // Description of the level
    description: {
        type: String,
        default: ''
    },
    
    // Component access permissions for this level
    componentAccess: [{
        componentId: {
            type: String,
            required: true
        },
        componentName: {
            type: String,
            required: true
        },
        hasAccess: {
            type: Boolean,
            default: false
        },
        // Optional: Inherit from higher level
        inheritFromLevel: {
            type: Number,
            default: null
        }
    }],
    
    // Feature-level permissions for this level
    featureAccess: [{
        featureId: {
            type: String,
            required: true
        },
        featureName: {
            type: String,
            required: true
        },
        hasAccess: {
            type: Boolean,
            default: false
        },
        // Optional: Inherit from higher level
        inheritFromLevel: {
            type: Number,
            default: null
        }
    }],
    
    // Cascade rules: when this level changes, update related roles
    cascadeToRoles: {
        type: Boolean,
        default: true
    },
    
    // Whether this level is active
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Whether this is a system level (cannot be deleted)
    isSystemLevel: {
        type: Boolean,
        default: false
    }
}, { 
    timestamps: true 
});

// Index for faster queries
AccessLevelSchema.index({ isActive: 1 });
AccessLevelSchema.index({ level: 1, isActive: 1 });

/**
 * Pre-save hook to cascade permissions to roles when level changes
 */
AccessLevelSchema.pre('save', async function(next) {
    if (this.isModified('componentAccess') || this.isModified('featureAccess')) {
        if (this.cascadeToRoles) {
            // Flag for post-save hook
            this._shouldCascade = true;
        }
    }
    next();
});

/**
 * Post-save hook to update all roles at this level
 */
AccessLevelSchema.post('save', async function(doc) {
    if (doc._shouldCascade) {
        try {
            const RolePermission = mongoose.model('RolePermission');
            
            // Find all roles at this hierarchy level
            const rolesToUpdate = await RolePermission.find({ 
                hierarchyLevel: doc.level,
                isActive: true 
            });
            
            // Update each role with the new level permissions
            for (const role of rolesToUpdate) {
                // Merge level permissions with role-specific overrides
                role.componentAccess = mergePermissions(
                    doc.componentAccess,
                    role.componentAccess,
                    'componentId'
                );
                
                role.featureAccess = mergePermissions(
                    doc.featureAccess,
                    role.featureAccess,
                    'featureId'
                );
                
                role.updatedByLevel = true; // Flag to prevent infinite loops
                await role.save();
            }
            
            console.log(`✓ Cascaded permissions from level ${doc.level} to ${rolesToUpdate.length} roles`);
        } catch (error) {
            console.error(`Error cascading permissions from level ${doc.level}:`, error);
        }
    }
});

/**
 * Merge level permissions with role-specific permissions
 * Role-specific permissions take precedence
 */
function mergePermissions(levelPermissions, rolePermissions, idField) {
    const merged = [];
    const rolePermMap = new Map();
    
    // Create map of role-specific permissions
    if (rolePermissions && rolePermissions.length > 0) {
        rolePermissions.forEach(perm => {
            if (perm.roleSpecific) {
                // Keep role-specific permissions as-is
                rolePermMap.set(perm[idField], perm);
            }
        });
    }
    
    // Add level permissions, respecting role-specific overrides
    levelPermissions.forEach(levelPerm => {
        const roleOverride = rolePermMap.get(levelPerm[idField]);
        if (roleOverride) {
            merged.push(roleOverride);
        } else {
            merged.push({
                ...levelPerm.toObject ? levelPerm.toObject() : levelPerm,
                inheritedFromLevel: true
            });
        }
    });
    
    // Add any role-specific permissions not in level
    rolePermissions.forEach(rolePerm => {
        if (rolePerm.roleSpecific && 
            !levelPermissions.find(lp => lp[idField] === rolePerm[idField])) {
            merged.push(rolePerm);
        }
    });
    
    return merged;
}

/**
 * Static method to get all roles affected by a level
 */
AccessLevelSchema.statics.getAffectedRoles = async function(level) {
    const RolePermission = mongoose.model('RolePermission');
    return await RolePermission.find({ 
        hierarchyLevel: level,
        isActive: true 
    }).select('roleId displayName');
};

/**
 * Static method to apply level permissions to a specific role
 */
AccessLevelSchema.statics.applyToRole = async function(level, roleId) {
    const accessLevel = await this.findOne({ level, isActive: true });
    if (!accessLevel) {
        throw new Error(`Access level ${level} not found`);
    }
    
    const RolePermission = mongoose.model('RolePermission');
    const role = await RolePermission.findOne({ roleId, isActive: true });
    if (!role) {
        throw new Error(`Role ${roleId} not found`);
    }
    
    // Apply level permissions to role
    role.componentAccess = mergePermissions(
        accessLevel.componentAccess,
        role.componentAccess,
        'componentId'
    );
    
    role.featureAccess = mergePermissions(
        accessLevel.featureAccess,
        role.featureAccess,
        'featureId'
    );
    
    await role.save();
    return role;
};

module.exports = mongoose.model('AccessLevel', AccessLevelSchema);
