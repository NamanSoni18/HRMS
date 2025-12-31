/**
 * =============================================================================
 * ROLE MANAGEMENT SYSTEM - LEVEL-BASED ACCESS CONTROL
 * =============================================================================
 * This file is the central configuration for all roles in the HRMS system.
 * 
 * LEVEL-BASED ACCESS CONTROL:
 * - Roles inherit permissions from their hierarchy level (0-10)
 * - Changes to a level automatically cascade to all roles at that level
 * - Individual roles can override specific permissions (role-specific)
 * - Lower level number = Higher authority (0 = Super Admin, 10 = Lowest)
 * 
 * TO ADD A NEW ROLE:
 * 1. Add the role constant to the ROLES object below
 * 2. Add display name to ROLE_DISPLAY_NAMES
 * 3. Set hierarchy level in ROLE_HIERARCHY (0-10)
 * 4. Add to ROLE_LIST (exclude ADMIN - it's added automatically)
 * 5. Update backend User model enum to include the new role
 * 6. The role will automatically inherit permissions from its level
 * 7. Use Admin Panel to customize role-specific permissions if needed
 * 
 * LEVEL HIERARCHY:
 * - Level 0: Super Admin (Full System Access)
 * - Level 1: Senior Management (High-level Operations)
 * - Level 2: Middle Management (Operational Access)
 * - Level 3: Department Management (Limited Administrative)
 * - Level 4: Staff (Basic Personal Features)
 * - Levels 5-10: Reserved for custom levels
 * =============================================================================
 */

// ============= ROLE DEFINITIONS =============
export const ROLES = {
    ADMIN: 'ADMIN',
    CEO: 'CEO',
    INCUBATION_MANAGER: 'INCUBATION_MANAGER',
    ACCOUNTANT: 'ACCOUNTANT',
    OFFICER_IN_CHARGE: 'OFFICER_IN_CHARGE',
    FACULTY_IN_CHARGE: 'FACULTY_IN_CHARGE',
    EMPLOYEE: 'EMPLOYEE'
    // TO ADD NEW ROLE: Add here, e.g., HR_MANAGER: 'HR_MANAGER',
};

// ============= ROLE DISPLAY NAMES =============
export const ROLE_DISPLAY_NAMES = {
    [ROLES.ADMIN]: 'Admin',
    [ROLES.CEO]: 'CEO',
    [ROLES.INCUBATION_MANAGER]: 'Incubation Manager',
    [ROLES.ACCOUNTANT]: 'Accountant',
    [ROLES.OFFICER_IN_CHARGE]: 'Officer In-Charge',
    [ROLES.FACULTY_IN_CHARGE]: 'Faculty In-Charge',
    [ROLES.EMPLOYEE]: 'Employee'
    // TO ADD NEW ROLE: Add display name, e.g., [ROLES.HR_MANAGER]: 'HR Manager',
};

// ============= ROLE HIERARCHY =============
// LEVEL-BASED ACCESS CONTROL
// Lower number = Higher authority
// Roles inherit permissions from their assigned level
// Level 0 = Super Admin, Level 1 = Senior Management, Level 2 = Middle Management
// Level 3 = Department Management, Level 4 = Staff, Levels 5-10 = Custom
export const ROLE_HIERARCHY = {
    [ROLES.ADMIN]: 0,                    // Super Admin - Full System Access
    [ROLES.OFFICER_IN_CHARGE]: 1,        // Senior Management
    [ROLES.FACULTY_IN_CHARGE]: 1,        // Senior Management
    [ROLES.CEO]: 2,                      // Middle Management
    [ROLES.INCUBATION_MANAGER]: 3,       // Department Management
    [ROLES.ACCOUNTANT]: 3,               // Department Management
    [ROLES.EMPLOYEE]: 4                  // Staff
    // TO ADD NEW ROLE: Set hierarchy level (0-10), e.g., [ROLES.HR_MANAGER]: 2,
};

// ============= ROLE LISTS =============
// List of all roles except ADMIN (used for dropdowns, selections, etc.)
export const ROLE_LIST = [
    ROLES.OFFICER_IN_CHARGE,
    ROLES.FACULTY_IN_CHARGE,
    ROLES.CEO,
    ROLES.INCUBATION_MANAGER,
    ROLES.ACCOUNTANT,
    ROLES.EMPLOYEE
    // TO ADD NEW ROLE: Add to this list, e.g., ROLES.HR_MANAGER,
];

// All roles including ADMIN
export const ALL_ROLES = [ROLES.ADMIN, ...ROLE_LIST];

// ============= ROLE GROUPINGS =============
// Useful for permission checks
export const ROLE_GROUPS = {
    TOP_MANAGEMENT: [ROLES.ADMIN, ROLES.OFFICER_IN_CHARGE, ROLES.FACULTY_IN_CHARGE],
    MIDDLE_MANAGEMENT: [ROLES.CEO, ROLES.INCUBATION_MANAGER, ROLES.ACCOUNTANT],
    STAFF: [ROLES.EMPLOYEE],
    MANAGERS: [ROLES.ADMIN, ROLES.OFFICER_IN_CHARGE, ROLES.FACULTY_IN_CHARGE, ROLES.CEO, ROLES.INCUBATION_MANAGER, ROLES.ACCOUNTANT],
    FINANCE: [ROLES.ACCOUNTANT],
    FACULTY: [ROLES.FACULTY_IN_CHARGE],
    ALL: ALL_ROLES
};

// ============= UTILITY FUNCTIONS =============

export const hasPermission = (userRole, requiredLevel) => {
    return ROLE_HIERARCHY[userRole] <= requiredLevel;
};

export const canManageRole = (managerRole, targetRole) => {
    return ROLE_HIERARCHY[managerRole] < ROLE_HIERARCHY[targetRole];
};

export const getSubordinateRoles = (role) => {
    const level = ROLE_HIERARCHY[role];
    return ALL_ROLES.filter(r => ROLE_HIERARCHY[r] > level);
};

export const getRoleDisplayName = (role) => {
    return ROLE_DISPLAY_NAMES[role] || role;
};


export const getRoleLevel = (role) => {
    return ROLE_HIERARCHY[role] ?? 10; // Default to lowest level
};

export const hasLevelAccess = (userRole, requiredLevel) => {
    return getRoleLevel(userRole) <= requiredLevel;
};

export const getRolesAtLevel = (level) => {
    return ALL_ROLES.filter(role => ROLE_HIERARCHY[role] === level);
};

export const getLevelName = (level) => {
    const levelNames = {
        0: 'Super Admin',
        1: 'Senior Management',
        2: 'Middle Management',
        3: 'Department Management',
        4: 'Staff',
        5: 'Custom Level 5',
        6: 'Custom Level 6',
        7: 'Custom Level 7',
        8: 'Custom Level 8',
        9: 'Custom Level 9',
        10: 'Custom Level 10'
    };
    return levelNames[level] || `Level ${level}`;
};

export const isInRoleGroup = (role, groupName) => {
    return ROLE_GROUPS[groupName]?.includes(role) || false;
};

export const hasEqualOrHigherAuthority = (userRole, targetRole) => {
    return getRoleLevel(userRole) <= getRoleLevel(targetRole);
};

export const getRolesAtOrBelowLevel = (level) => {
    return ALL_ROLES.filter(r => ROLE_HIERARCHY[r] >= level);
};

export const isValidRole = (role) => {
    return ALL_ROLES.includes(role);
};
