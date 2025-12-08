export const ROLES = {
    ADMIN: 'ADMIN',
    CEO: 'CEO',
    INCUBATION_MANAGER: 'INCUBATION_MANAGER',
    ACCOUNTANT: 'ACCOUNTANT',
    OFFICER_IN_CHARGE: 'OFFICER_IN_CHARGE',
    FACULTY_IN_CHARGE: 'FACULTY_IN_CHARGE',
    EMPLOYEE: 'EMPLOYEE'
};

export const ROLE_DISPLAY_NAMES = {
    [ROLES.ADMIN]: 'Admin',
    [ROLES.CEO]: 'CEO',
    [ROLES.INCUBATION_MANAGER]: 'Incubation Manager',
    [ROLES.ACCOUNTANT]: 'Accountant',
    [ROLES.OFFICER_IN_CHARGE]: 'Officer In-Charge',
    [ROLES.FACULTY_IN_CHARGE]: 'Faculty In-Charge',
    [ROLES.EMPLOYEE]: 'Employee'
};

export const ROLE_HIERARCHY = {
    [ROLES.ADMIN]: 0,
    [ROLES.CEO]: 1,
    [ROLES.INCUBATION_MANAGER]: 2,
    [ROLES.ACCOUNTANT]: 2,
    [ROLES.OFFICER_IN_CHARGE]: 2,
    [ROLES.FACULTY_IN_CHARGE]: 2,
    [ROLES.EMPLOYEE]: 3
};

export const ROLE_LIST = [
    ROLES.CEO,
    ROLES.INCUBATION_MANAGER,
    ROLES.ACCOUNTANT,
    ROLES.OFFICER_IN_CHARGE,
    ROLES.FACULTY_IN_CHARGE,
    ROLES.EMPLOYEE
];

export const ALL_ROLES = [ROLES.ADMIN, ...ROLE_LIST];

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
