const mongoose = require('mongoose');

/**
 * RolePermission Model
 * Stores dynamic role configurations and component access permissions
 */
const RolePermissionSchema = new mongoose.Schema({
    // Role identifier (should match ROLES constant)
    roleId: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        index: true  // Combined unique + index declaration
    },
    
    // Display name for the role
    displayName: {
        type: String,
        required: true
    },
    
    // Hierarchy level (0=highest, 3=lowest)
    hierarchyLevel: {
        type: Number,
        required: true,
        min: 0,
        max: 10,
        default: 3
    },
    
    // Description of the role
    description: {
        type: String,
        default: ''
    },
    
    // Component access permissions
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
        // Indicates if this permission is role-specific (overrides level default)
        roleSpecific: {
            type: Boolean,
            default: false
        },
        // Indicates if inherited from access level
        inheritedFromLevel: {
            type: Boolean,
            default: false
        }
    }],
    
    // Feature-level permissions
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
        // Indicates if this permission is role-specific (overrides level default)
        roleSpecific: {
            type: Boolean,
            default: false
        },
        // Indicates if inherited from access level
        inheritedFromLevel: {
            type: Boolean,
            default: false
        }
    }],
    
    // Whether this role is active
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Whether this is a system role (cannot be deleted)
    isSystemRole: {
        type: Boolean,
        default: false
    }
}, { 
    timestamps: true 
});

// Index for faster queries (roleId already has unique index)
RolePermissionSchema.index({ isActive: 1 });
RolePermissionSchema.index({ hierarchyLevel: 1, isActive: 1 });

/**
 * Pre-save hook to sync with access level if needed
 */
RolePermissionSchema.pre('save', async function(next) {
    // Skip if this save is triggered by level update
    if (this.updatedByLevel) {
        this.updatedByLevel = undefined;
        return next();
    }
    
    // If hierarchy level changed, apply new level permissions
    if (this.isModified('hierarchyLevel')) {
        try {
            const AccessLevel = mongoose.model('AccessLevel');
            const levelConfig = await AccessLevel.findOne({ 
                level: this.hierarchyLevel,
                isActive: true 
            });
            
            if (levelConfig) {
                // Apply level permissions while preserving role-specific ones
                await AccessLevel.applyToRole(this.hierarchyLevel, this.roleId);
            }
        } catch (error) {
            console.error(`Error syncing role ${this.roleId} with level:`, error);
        }
    }
    
    next();
});

/**
 * Method to get effective permissions (combines inherited + role-specific)
 */
RolePermissionSchema.methods.getEffectivePermissions = function() {
    return {
        componentAccess: this.componentAccess.filter(c => c.hasAccess),
        featureAccess: this.featureAccess.filter(f => f.hasAccess)
    };
};

/**
 * Method to override a specific permission (makes it role-specific)
 */
RolePermissionSchema.methods.overridePermission = function(type, id, hasAccess) {
    const accessArray = type === 'component' ? this.componentAccess : this.featureAccess;
    const idField = type === 'component' ? 'componentId' : 'featureId';
    
    const permission = accessArray.find(p => p[idField] === id);
    if (permission) {
        permission.hasAccess = hasAccess;
        permission.roleSpecific = true;
        permission.inheritedFromLevel = false;
    }
    
    return this;
};

/**
 * Static method to get all roles at a specific level
 */
RolePermissionSchema.statics.getRolesByLevel = async function(level) {
    return await this.find({ 
        hierarchyLevel: level,
        isActive: true 
    }).select('roleId displayName hierarchyLevel');
};

module.exports = mongoose.model('RolePermission', RolePermissionSchema);
