# Role & Permission Management Guide

## 📋 Overview

Your HRMS now has a **centralized role-based access control (RBAC) system** that makes it easy to manage roles and permissions in one place.

## 🗂️ File Structure

```
frontend/src/constants/
├── roles.js          → All role definitions and utilities
├── permissions.js    → Component and feature access control
frontend/src/components/
└── ProtectedComponent.jsx  → Reusable permission wrapper
```

---

## ➕ Adding a New Role

### Step 1: Update `roles.js`

1. Add the role constant:
```javascript
export const ROLES = {
    // ... existing roles ...
    HR_MANAGER: 'HR_MANAGER',  // ← Add your new role
};
```

2. Add display name:
```javascript
export const ROLE_DISPLAY_NAMES = {
    // ... existing ...
    [ROLES.HR_MANAGER]: 'HR Manager',  // ← Add display name
};
```

3. Set hierarchy level (0=highest, 3=lowest):
```javascript
export const ROLE_HIERARCHY = {
    // ... existing ...
    [ROLES.HR_MANAGER]: 2,  // ← Same level as other managers
};
```

4. Add to role list:
```javascript
export const ROLE_LIST = [
    // ... existing ...
    ROLES.HR_MANAGER,  // ← Add to list
];
```

5. **Optional**: Add to role groups:
```javascript
export const ROLE_GROUPS = {
    // ... existing ...
    MIDDLE_MANAGEMENT: [..., ROLES.HR_MANAGER],  // ← Add to group
};
```

### Step 2: Update Backend Model

Edit `backend/models/User.js`:
```javascript
role: {
    type: String,
    enum: [
        'ADMIN', 'CEO', 'INCUBATION_MANAGER', 
        'ACCOUNTANT', 'OFFICER_IN_CHARGE', 
        'FACULTY_IN_CHARGE', 'EMPLOYEE',
        'HR_MANAGER'  // ← Add here
    ],
    default: 'EMPLOYEE'
}
```

### Step 3: Configure Permissions

Edit `permissions.js` to grant access to components:
```javascript
export const COMPONENT_PERMISSIONS = {
    'employees': {
        allowedRoles: [..., ROLES.HR_MANAGER],  // ← Grant access
        description: 'View and manage employee records'
    },
};
```

---

## 🔐 Configuring Component Access

### Method 1: Add to Permissions File (Recommended)

Edit `frontend/src/constants/permissions.js`:

```javascript
export const COMPONENT_PERMISSIONS = {
    'my-new-feature': {
        allowedRoles: [ROLES.ADMIN, ROLES.CEO],  // ← Who can access
        description: 'Description of the feature',
        customCheck: (user) => {  // ← Optional: custom logic
            return user.someProperty === true;
        }
    }
};
```

### Method 2: Use ProtectedComponent Wrapper

In your component:
```jsx
import ProtectedComponent from './ProtectedComponent';

function MyComponent() {
    return (
        <ProtectedComponent component="my-new-feature">
            <div>Protected Content</div>
        </ProtectedComponent>
    );
}
```

---

## 📍 Navigation Management

To add a new item to the sidebar, edit `permissions.js`:

```javascript
export const NAVIGATION_ITEMS = [
    // ... existing items ...
    {
        id: 'my-feature',
        label: 'My Feature',
        icon: 'Star',  // ← Must match imported icon in Dashboard
        view: 'my-feature',  // ← Matches activeView state
        allowedRoles: [ROLES.ADMIN, ROLES.CEO]
    }
];
```

Then in `Dashboard.jsx`, add the icon import if needed:
```javascript
import { Star } from 'lucide-react';  // ← If not already imported
```

---

## 🎯 Feature-Level Permissions

For granular control within a component:

### 1. Define in `permissions.js`:
```javascript
export const FEATURE_PERMISSIONS = {
    'employee.delete': {
        allowedRoles: [ROLES.ADMIN],
        description: 'Delete employee accounts'
    }
};
```

### 2. Use in component:
```jsx
import { canAccessFeature } from '../constants/permissions';
import { useAuth } from '../context/AuthContext';

function EmployeeManagement() {
    const { user } = useAuth();
    
    return (
        <div>
            {canAccessFeature('employee.delete', user) && (
                <button onClick={handleDelete}>Delete</button>
            )}
        </div>
    );
}
```

---

## 🛠️ Utility Functions

### Check Component Access
```javascript
import { canAccessComponent } from '../constants/permissions';

if (canAccessComponent('employees', user)) {
    // User can access employees component
}
```

### Check Feature Access
```javascript
import { canAccessFeature } from '../constants/permissions';

if (canAccessFeature('employee.create', user)) {
    // User can create employees
}
```

### Get All Permissions for a Role
```javascript
import { getRolePermissions } from '../constants/permissions';

const permissions = getRolePermissions(ROLES.ADMIN);
console.log(permissions.components);  // ['dashboard', 'employees', ...]
console.log(permissions.features);    // ['employee.create', ...]
```

### Check Multiple Permissions
```javascript
import { hasAllPermissions, hasAnyPermission } from '../constants/permissions';

// User must have ALL permissions
if (hasAllPermissions(['employees', 'salary'], user)) {
    // ...
}

// User must have AT LEAST ONE permission
if (hasAnyPermission(['employees', 'salary'], user)) {
    // ...
}
```

---

## 📊 Role Groups

Pre-defined role groups for easier management:

```javascript
ROLE_GROUPS.TOP_MANAGEMENT      // ADMIN, CEO
ROLE_GROUPS.MIDDLE_MANAGEMENT   // Incubation Manager, Accountant, etc.
ROLE_GROUPS.STAFF               // EMPLOYEE
ROLE_GROUPS.MANAGERS            // All management roles
ROLE_GROUPS.FINANCE             // ACCOUNTANT
ROLE_GROUPS.FACULTY             // FACULTY_IN_CHARGE
ROLE_GROUPS.ALL                 // Everyone
```

Use in permissions:
```javascript
export const COMPONENT_PERMISSIONS = {
    'dashboard': {
        allowedRoles: ROLE_GROUPS.ALL,  // ← Everyone can access
    }
};
```

---

## ✅ Example: Adding a New HR Manager Role

### 1. Update `roles.js`:
```javascript
export const ROLES = {
    // ... existing ...
    HR_MANAGER: 'HR_MANAGER',
};

export const ROLE_DISPLAY_NAMES = {
    // ... existing ...
    [ROLES.HR_MANAGER]: 'HR Manager',
};

export const ROLE_HIERARCHY = {
    // ... existing ...
    [ROLES.HR_MANAGER]: 2,  // Middle management
};

export const ROLE_LIST = [
    // ... existing ...
    ROLES.HR_MANAGER,
];

export const ROLE_GROUPS = {
    // ... existing ...
    MIDDLE_MANAGEMENT: [
        ROLES.INCUBATION_MANAGER, 
        ROLES.ACCOUNTANT, 
        ROLES.OFFICER_IN_CHARGE, 
        ROLES.FACULTY_IN_CHARGE,
        ROLES.HR_MANAGER  // ← Add here
    ],
};
```

### 2. Update `backend/models/User.js`:
```javascript
enum: [
    'ADMIN', 'CEO', 'INCUBATION_MANAGER', 
    'ACCOUNTANT', 'OFFICER_IN_CHARGE', 
    'FACULTY_IN_CHARGE', 'EMPLOYEE',
    'HR_MANAGER'  // ← Add here
]
```

### 3. Update `permissions.js`:
```javascript
// HR Manager gets same access as other managers
export const COMPONENT_PERMISSIONS = {
    employees: {
        allowedRoles: ROLE_GROUPS.MANAGERS,  // ← Already includes HR_MANAGER
    },
    // OR specify explicitly:
    attendance: {
        allowedRoles: [...ROLE_GROUPS.MANAGERS, ROLES.HR_MANAGER],
    }
};
```

### 4. Done! ✨
The new role is now fully integrated:
- Shows in dropdowns (EmployeeManagement)
- Has appropriate sidebar access
- All permissions work automatically

---

## 🚨 Common Pitfalls

1. **Don't forget backend**: Always update `User.js` enum
2. **Hierarchy matters**: Lower number = higher authority
3. **ADMIN in groups**: ADMIN is automatically added to ALL_ROLES
4. **Icon names**: Must match imported icons in Dashboard.jsx
5. **Custom checks**: Use for complex rules that can't be role-based

---

## 🔍 Debugging Permissions

Check user's accessible items:
```javascript
import { getAccessibleNavItems } from '../constants/permissions';

console.log('User can access:', getAccessibleNavItems(user));
```

Check specific permission:
```javascript
import { canAccessComponent } from '../constants/permissions';

console.log('Can access employees?', canAccessComponent('employees', user));
```

---

## 📝 Quick Reference

| Task | File | Section |
|------|------|---------|
| Add new role | `roles.js` | ROLES, ROLE_DISPLAY_NAMES, ROLE_HIERARCHY, ROLE_LIST |
| Configure component access | `permissions.js` | COMPONENT_PERMISSIONS |
| Add sidebar item | `permissions.js` | NAVIGATION_ITEMS |
| Feature-level permission | `permissions.js` | FEATURE_PERMISSIONS |
| Protect component | Component file | Import & use `<ProtectedComponent>` |
| Update backend | `backend/models/User.js` | role.enum array |

---

## 💡 Best Practices

1. ✅ **Use ROLE_GROUPS** instead of listing individual roles
2. ✅ **Keep permissions.js** as single source of truth
3. ✅ **Use ProtectedComponent** for conditional rendering
4. ✅ **Document** custom permission logic with comments
5. ✅ **Test** new roles thoroughly before deploying
6. ❌ **Don't** hardcode role checks in components
7. ❌ **Don't** forget to update both frontend and backend

---

## 🎓 Advanced Usage

### Custom Permission Logic
```javascript
export const COMPONENT_PERMISSIONS = {
    'special-feature': {
        allowedRoles: ROLE_GROUPS.MANAGERS,
        customCheck: (user) => {
            // Complex business logic
            return user.department === 'IT' && user.experience > 5;
        }
    }
};
```

### Conditional Sidebar Items
```javascript
export const NAVIGATION_ITEMS = [
    {
        id: 'advanced-reports',
        label: 'Advanced Reports',
        icon: 'BarChart',
        view: 'advanced-reports',
        allowedRoles: [ROLES.ADMIN],
        customCheck: (user) => user.hasAdvancedAccess === true
    }
];
```

---

## 📞 Need Help?

- Check existing role configurations in `roles.js`
- Look at examples in `permissions.js`
- Review `ProtectedComponent.jsx` for usage patterns
- Test thoroughly after making changes!

---

**Last Updated**: December 2025
**Version**: 1.0
