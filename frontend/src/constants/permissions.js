/**
 * =============================================================================
 * PERMISSIONS & ACCESS CONTROL SYSTEM
 * =============================================================================
 * This file centralizes all component and feature access permissions.
 * 
 * TO CONFIGURE ACCESS FOR A NEW FEATURE:
 * 1. Add a new entry to COMPONENT_PERMISSIONS or FEATURE_PERMISSIONS
 * 2. Specify allowed roles array or use predefined ROLE_GROUPS
 * 3. Optionally add custom validation function for complex rules
 * 
 * TO ADD A NEW COMPONENT:
 * 1. Add entry to COMPONENT_PERMISSIONS with allowed roles
 * 2. Update NAVIGATION_ITEMS if it should appear in sidebar
 * =============================================================================
 */

import { ROLES, ROLE_GROUPS } from './roles';

export const COMPONENT_PERMISSIONS = {
    dashboard: {
        allowedRoles: ROLE_GROUPS.ALL,
        description: 'Main dashboard view'
    },
    employees: {
        allowedRoles: ROLE_GROUPS.MANAGERS,
        description: 'View and manage employee records'
    },
    attendance: {
        allowedRoles: ROLE_GROUPS.MANAGERS,
        description: 'View and manage attendance records'
    },
    leave: {
        allowedRoles: ROLE_GROUPS.MANAGERS,
        description: 'Approve/reject leave requests'
    },
    salary: {
        allowedRoles: [ROLES.ACCOUNTANT, ROLES.EMPLOYEE],
        description: 'View salary information'
    },
    'peer-rating': {
        allowedRoles: [
            ROLES.ADMIN,
            ROLES.CEO,
            ROLES.INCUBATION_MANAGER,
            ROLES.ACCOUNTANT,
            ROLES.OFFICER_IN_CHARGE
        ],
        description: 'Rate peer performance',
        customCheck: (user) => user?.role !== ROLES.FACULTY_IN_CHARGE
    },
    'variable-remuneration': {
        allowedRoles: [ROLES.FACULTY_IN_CHARGE],
        description: 'Manage variable remuneration for faculty'
    },
    remuneration: {
        allowedRoles: ROLE_GROUPS.MANAGERS,
        description: 'View remuneration details'
    },
    calendar: {
        allowedRoles: ROLE_GROUPS.MANAGERS,
        description: 'View and manage calendar'
    },
    efiling: {
        allowedRoles: ROLE_GROUPS.MANAGERS,
        description: 'Electronic file management'
    },
    settings: {
        allowedRoles: ROLE_GROUPS.MANAGERS,
        description: 'System settings and configuration'
    },
    profile: {
        allowedRoles: ROLE_GROUPS.ALL,
        description: 'Edit user profile'
    }
};

// ============= FEATURE-LEVEL PERMISSIONS =============
/**
 * Granular permissions for specific features within components
 */
export const FEATURE_PERMISSIONS = {
    'employee.create': {
        allowedRoles: [ROLES.ADMIN, ROLES.CEO],
        description: 'Create new employee accounts'
    },
    'employee.edit': {
        allowedRoles: ROLE_GROUPS.MANAGERS,
        description: 'Edit employee information'
    },
    'employee.delete': {
        allowedRoles: [ROLES.ADMIN, ROLES.CEO],
        description: 'Delete employee accounts'
    },
    'employee.viewAll': {
        allowedRoles: ROLE_GROUPS.MANAGERS,
        description: 'View all employees'
    },
    'salary.viewAll': {
        allowedRoles: [ROLES.ACCOUNTANT],
        description: 'View all employee salaries'
    },
    'salary.viewOwn': {
        allowedRoles: [ROLES.EMPLOYEE],
        description: 'View own salary only'
    },
    'salary.edit': {
        allowedRoles: [ROLES.ACCOUNTANT],
        description: 'Edit salary information'
    },
    'leave.approve': {
        allowedRoles: ROLE_GROUPS.MANAGERS,
        description: 'Approve leave requests'
    },
    'leave.apply': {
        allowedRoles: ROLE_GROUPS.ALL,
        description: 'Apply for leave'
    },
    'attendance.mark': {
        allowedRoles: ROLE_GROUPS.MANAGERS,
        description: 'Mark attendance for employees'
    },
    'attendance.viewReports': {
        allowedRoles: ROLE_GROUPS.MANAGERS,
        description: 'View attendance reports'
    },
    'remuneration.view': {
        allowedRoles: ROLE_GROUPS.MANAGERS,
        description: 'View remuneration information'
    },
    'remuneration.variable': {
        allowedRoles: [ROLES.FACULTY_IN_CHARGE],
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
        allowedRoles: ROLE_GROUPS.ALL
    },
    {
        id: 'employees',
        label: 'Employees',
        icon: 'Users',
        view: 'employees',
        allowedRoles: ROLE_GROUPS.MANAGERS
    },
    {
        id: 'attendance',
        label: 'Attendance',
        icon: 'CalendarCheck',
        view: 'attendance',
        allowedRoles: ROLE_GROUPS.MANAGERS
    },
    {
        id: 'leave',
        label: 'Leave',
        icon: 'Clock',
        view: 'leave',
        allowedRoles: ROLE_GROUPS.MANAGERS
    },
    {
        id: 'salary',
        label: 'Salary',
        icon: 'DollarSign',
        view: 'salary',
        allowedRoles: [ROLES.ACCOUNTANT, ROLES.EMPLOYEE]
    },
    {
        id: 'peer-rating',
        label: 'Peer Rating',
        icon: 'Star',
        view: 'peer-rating',
        allowedRoles: [
            ROLES.ADMIN,
            ROLES.CEO,
            ROLES.INCUBATION_MANAGER,
            ROLES.ACCOUNTANT,
            ROLES.OFFICER_IN_CHARGE
        ],
        customCheck: (user) => user?.role !== ROLES.FACULTY_IN_CHARGE
    },
    {
        id: 'variable-remuneration',
        label: 'Variable Remuneration',
        icon: 'Star',
        view: 'variable-remuneration',
        allowedRoles: [ROLES.FACULTY_IN_CHARGE]
    },
    {
        id: 'remuneration',
        label: 'Remuneration',
        icon: 'FileText',
        view: 'remuneration',
        allowedRoles: ROLE_GROUPS.MANAGERS
    },
    {
        id: 'calendar',
        label: 'Calendar',
        icon: 'FileText',
        view: 'calendar',
        allowedRoles: ROLE_GROUPS.MANAGERS
    },
    {
        id: 'efiling',
        label: 'E-Filing',
        icon: 'FolderOpen',
        view: 'efiling',
        allowedRoles: ROLE_GROUPS.MANAGERS
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: 'SettingsIcon',
        view: 'settings',
        allowedRoles: ROLE_GROUPS.MANAGERS
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

export const getAccessibleNavItems = (user) => {
    if (!user || !user.role) return [];
    
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
