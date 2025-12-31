/**
 * Central Roles Configuration
 * This file is the single source of truth for all roles in the system
 * Update roles here and they will be reflected throughout the application
 * 
 * LEVEL-BASED ACCESS CONTROL:
 * - Roles now inherit permissions from their hierarchy level
 * - Changes to levels cascade to all roles at that level
 * - Roles can have specific overrides
 */

// ============= ROLE DEFINITIONS =============
const SYSTEM_ROLES = [
    'ADMIN',
    'CEO',
    'INCUBATION_MANAGER',
    'ACCOUNTANT',
    'OFFICER_IN_CHARGE',
    'FACULTY_IN_CHARGE',
    'EMPLOYEE'
];

/**
 * Get all valid roles (system roles + custom roles from database)
 * @returns {Promise<string[]>} Array of valid role IDs
 */
const getAllValidRoles = async () => {
    try {
        // Import here to avoid circular dependency
        const RolePermission = require('../models/RolePermission');
        const dbRoles = await RolePermission.find({ isActive: true }).select('roleId');
        const customRoles = dbRoles.map(r => r.roleId);
        
        // Combine system roles with custom roles from database
        return [...new Set([...SYSTEM_ROLES, ...customRoles])];
    } catch (error) {
        // If database is not available or error occurs, return system roles
        console.warn('Could not fetch custom roles from database, using system roles only');
        return SYSTEM_ROLES;
    }
};

/**
 * Get role hierarchy levels from database
 * @returns {Promise<Object>} Object mapping role IDs to hierarchy levels
 */
const getRoleHierarchy = async () => {
    try {
        const RolePermission = require('../models/RolePermission');
        const roles = await RolePermission.find({ isActive: true }).select('roleId hierarchyLevel');
        
        const hierarchy = {};
        roles.forEach(role => {
            hierarchy[role.roleId] = role.hierarchyLevel;
        });
        
        return hierarchy;
    } catch (error) {
        console.warn('Could not fetch role hierarchy from database');
        // Fallback to default hierarchy
        return {
            ADMIN: 0,
            OFFICER_IN_CHARGE: 1,
            FACULTY_IN_CHARGE: 1,
            CEO: 2,
            INCUBATION_MANAGER: 3,
            ACCOUNTANT: 3,
            EMPLOYEE: 4
        };
    }
};

/**
 * Validate if a role is valid
 * @param {string} role - The role to validate
 * @returns {Promise<boolean>}
 */
const isValidRole = async (role) => {
    const validRoles = await getAllValidRoles();
    return validRoles.includes(role);
};

/**
 * Sync validator function for Mongoose schema
 * Note: This only validates against SYSTEM_ROLES for schema validation
 * Use isValidRole() for runtime validation that includes database roles
 */
const roleEnumValidator = {
    validator: function(value) {
        return SYSTEM_ROLES.includes(value);
    },
    message: props => `${props.value} is not a valid system role. Valid roles are: ${SYSTEM_ROLES.join(', ')}`
};

module.exports = {
    SYSTEM_ROLES,
    getAllValidRoles,
    getRoleHierarchy,
    isValidRole,
    roleEnumValidator
};
