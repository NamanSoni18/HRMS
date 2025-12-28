/**
 * =============================================================================
 * PERMISSIONS & ACCESS CONTROL SYSTEM
 * =============================================================================
 * This file centralizes all component and feature access permissions.
 * Roles are now fetched dynamically from the database via AuthContext.
 * 
 * TO CONFIGURE ACCESS FOR A NEW FEATURE:
 * 1. Add a new entry to COMPONENT_PERMISSIONS or FEATURE_PERMISSIONS
 * 2. Specify allowed roles array (use role strings like 'ADMIN', 'CEO')
 * 3. Optionally add custom validation function for complex rules
 * 
 * TO ADD A NEW COMPONENT:
 * 1. Add entry to COMPONENT_PERMISSIONS with allowed roles
 * 2. Update NAVIGATION_ITEMS if it should appear in sidebar
 * 3. Roles are validated against database at runtime
 * =============================================================================
 */

// Helper constants for common role groups (for convenience)
// Note: These are just helpers. Actual roles come from database via AuthContext
export const ROLE_GROUPS_HELPER = {
    ALL: ['ADMIN', 'CEO', 'INCUBATION_MANAGER', 'ACCOUNTANT', 'OFFICER_IN_CHARGE', 'FACULTY_IN_CHARGE', 'EMPLOYEE'],
    MANAGERS: ['ADMIN', 'CEO', 'INCUBATION_MANAGER', 'ACCOUNTANT', 'OFFICER_IN_CHARGE', 'FACULTY_IN_CHARGE'],
    TOP_MANAGEMENT: ['ADMIN', 'CEO'],
    MIDDLE_MANAGEMENT: ['INCUBATION_MANAGER', 'ACCOUNTANT', 'OFFICER_IN_CHARGE', 'FACULTY_IN_CHARGE'],
    FINANCE: ['ACCOUNTANT'],
    FACULTY: ['FACULTY_IN_CHARGE'],
    STAFF: ['EMPLOYEE']
};

export const COMPONENT_PERMISSIONS = {
    dashboard: {
        allowedRoles: ROLE_GROUPS_HELPER.ALL,
        description: 'Main dashboard view'
    },
    employees: {
        allowedRoles: ROLE_GROUPS_HELPER.MANAGERS,
        description: 'View and manage employee records'
    },
    attendance: {
        allowedRoles: ROLE_GROUPS_HELPER.MANAGERS,
        description: 'View and manage attendance records'
    },
    leave: {
        allowedRoles: ROLE_GROUPS_HELPER.MANAGERS,
        description: 'Approve/reject leave requests'
    },
    salary: {
        allowedRoles: ['ACCOUNTANT', 'EMPLOYEE'],
        description: 'View salary information'
    },
    'peer-rating': {
        allowedRoles: [
            'ADMIN',
            'CEO',
            'INCUBATION_MANAGER',
            'ACCOUNTANT',
            'OFFICER_IN_CHARGE'
        ],
        description: 'Rate peer performance',
        customCheck: (user) => user?.role !== 'FACULTY_IN_CHARGE'
    },
    'variable-remuneration': {
        allowedRoles: ['FACULTY_IN_CHARGE'],
        description: 'Manage variable remuneration for faculty'
    },
    remuneration: {
        allowedRoles: ROLE_GROUPS_HELPER.MANAGERS,
        description: 'View remuneration details'
    },
    calendar: {
        allowedRoles: ROLE_GROUPS_HELPER.MANAGERS,
        description: 'View and manage calendar'
    },
    efiling: {
        allowedRoles: ROLE_GROUPS_HELPER.MANAGERS,
        description: 'Electronic file management'
    },
    settings: {
        allowedRoles: ROLE_GROUPS_HELPER.MANAGERS,
        description: 'System settings and configuration'
    },
    profile: {
        allowedRoles: ROLE_GROUPS_HELPER.ALL,
        description: 'Edit user profile'
    },
    admin: {
        allowedRoles: ['ADMIN'],
        description: 'Admin configuration panel for role and permission management'
    }
};

// ============= FEATURE-LEVEL PERMISSIONS =============
/**
 * Granular permissions for specific features within components
 */
export const FEATURE_PERMISSIONS = {
    'employee.create': {
        allowedRoles: ['ADMIN', 'CEO'],
        description: 'Create new employee accounts'
    },
    'employee.edit': {
        allowedRoles: ROLE_GROUPS_HELPER.MANAGERS,
        description: 'Edit employee information'
    },
    'employee.delete': {
        allowedRoles: ['ADMIN', 'CEO'],
        description: 'Delete employee accounts'
    },
    'employee.viewAll': {
        allowedRoles: ROLE_GROUPS_HELPER.MANAGERS,
        description: 'View all employees'
    },
    'salary.viewAll': {
        allowedRoles: ['ACCOUNTANT'],
        description: 'View all employee salaries'
    },
    'salary.viewOwn': {
        allowedRoles: ['EMPLOYEE'],
        description: 'View own salary only'
    },
    'salary.edit': {
        allowedRoles: ['ACCOUNTANT'],
        description: 'Edit salary information'
    },
    'leave.approve': {
        allowedRoles: ROLE_GROUPS_HELPER.MANAGERS,
        description: 'Approve leave requests'
    },
    'leave.apply': {
        allowedRoles: ROLE_GROUPS_HELPER.ALL,
        description: 'Apply for leave'
    },
    'attendance.mark': {
        allowedRoles: ROLE_GROUPS_HELPER.MANAGERS,
        description: 'Mark attendance for employees'
    },
    'attendance.viewReports': {
        allowedRoles: ROLE_GROUPS_HELPER.MANAGERS,
        description: 'View attendance reports'
    },
    'remuneration.view': {
        allowedRoles: ROLE_GROUPS_HELPER.MANAGERS,
        description: 'View remuneration information'
    },
    'remuneration.variable': {
        allowedRoles: ['FACULTY_IN_CHARGE'],
        description: 'Manage variable remuneration'
    }
};

// ============= NAVIGATION/SIDEBAR ITEMS =============
/**
 * Configuration for sidebar navigation items
 * Automatically filtered based on user permissions
 */
export const NAVIGATION_ITEMS = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'LayoutDashboard',
        view: 'dashboard',
        allowedRoles: ROLE_GROUPS_HELPER.ALL
    },
    {
        id: 'employees',
        label: 'Employees',
        icon: 'Users',
        view: 'employees',
        allowedRoles: ROLE_GROUPS_HELPER.MANAGERS
    },
    {
        id: 'attendance',
        label: 'Attendance',
        icon: 'CalendarCheck',
        view: 'attendance',
        allowedRoles: ROLE_GROUPS_HELPER.MANAGERS
    },
    {
        id: 'leave',
        label: 'Leave',
        icon: 'Clock',
        view: 'leave',
        allowedRoles: ROLE_GROUPS_HELPER.MANAGERS
    },
    {
        id: 'salary',
        label: 'Salary',
        icon: 'DollarSign',
        view: 'salary',
        allowedRoles: ['ACCOUNTANT', 'EMPLOYEE']
    },
    {
        id: 'peer-rating',
        label: 'Peer Rating',
        icon: 'Star',
        view: 'peer-rating',
        allowedRoles: [
            'ADMIN',
            'CEO',
            'INCUBATION_MANAGER',
            'ACCOUNTANT',
            'OFFICER_IN_CHARGE'
        ],
        customCheck: (user) => user?.role !== 'FACULTY_IN_CHARGE'
    },
    {
        id: 'variable-remuneration',
        label: 'Variable Remuneration',
        icon: 'Star',
        view: 'variable-remuneration',
        allowedRoles: ['FACULTY_IN_CHARGE']
    },
    {
        id: 'remuneration',
        label: 'Remuneration',
        icon: 'FileText',
        view: 'remuneration',
        allowedRoles: ROLE_GROUPS_HELPER.MANAGERS
    },
    {
        id: 'calendar',
        label: 'Calendar',
        icon: 'FileText',
        view: 'calendar',
        allowedRoles: ROLE_GROUPS_HELPER.MANAGERS
    },
    {
        id: 'efiling',
        label: 'E-Filing',
        icon: 'FolderOpen',
        view: 'efiling',
        allowedRoles: ROLE_GROUPS_HELPER.MANAGERS
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: 'SettingsIcon',
        view: 'settings',
        allowedRoles: ROLE_GROUPS_HELPER.MANAGERS
    },
    {
        id: 'admin',
        label: 'Admin Panel',
        icon: 'Shield',
        view: 'admin',
        allowedRoles: ['ADMIN']
    }
];

export const canAccessComponent = (componentId, user) => {
    if (!user || !user.role) return false;
    
    const permission = COMPONENT_PERMISSIONS[componentId];
    if (!permission) return false;
    
    // Check role-based access
    const hasRoleAccess = permission.allowedRoles.includes(user.role);
    
    // If there's a custom check, apply it
    if (permission.customCheck) {
        return hasRoleAccess && permission.customCheck(user);
    }
    
    return hasRoleAccess;
};

export const canAccessFeature = (featureId, user) => {
    if (!user || !user.role) return false;
    
    const permission = FEATURE_PERMISSIONS[featureId];
    if (!permission) return false;
    
    return permission.allowedRoles.includes(user.role);
};

export const getAccessibleNavItems = (user, canAccessComponentFn) => {
    if (!user || !user.role) return [];
    
    // If canAccessComponentFn is provided, use database permissions
    if (canAccessComponentFn) {
        return NAVIGATION_ITEMS.filter(item => {
            return canAccessComponentFn(item.view);
        });
    }
    
    // Fallback to hardcoded permissions (for backward compatibility)
    return NAVIGATION_ITEMS.filter(item => {
        const hasRoleAccess = item.allowedRoles.includes(user.role);
        if (item.customCheck) {
            return hasRoleAccess && item.customCheck(user);
        }
        return hasRoleAccess;
    });
};

export const getRolePermissions = (role) => {
    const components = Object.keys(COMPONENT_PERMISSIONS).filter(
        key => COMPONENT_PERMISSIONS[key].allowedRoles.includes(role)
    );
    
    const features = Object.keys(FEATURE_PERMISSIONS).filter(
        key => FEATURE_PERMISSIONS[key].allowedRoles.includes(role)
    );
    
    return { components, features };
};

export const hasAllPermissions = (permissionIds, user) => {
    return permissionIds.every(id => 
        canAccessComponent(id, user) || canAccessFeature(id, user)
    );
};

export const hasAnyPermission = (permissionIds, user) => {
    return permissionIds.some(id => 
        canAccessComponent(id, user) || canAccessFeature(id, user)
    );
};
