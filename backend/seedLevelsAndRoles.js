const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

// Import models
const AccessLevel = require('./models/AccessLevel');
const RolePermission = require('./models/RolePermission');
const connectDB = require('./config/db');

/**
 * Seed Script for Level-Based Access Control
 * 
 * This script initializes the access level system with default configurations
 * and can optionally import role data from backup files.
 * 
 * Usage:
 *   node seedLevelsAndRoles.js                    # Seed with defaults
 *   node seedLevelsAndRoles.js --import-backup    # Import from backup files
 *   node seedLevelsAndRoles.js --reset            # Reset and reseed
 */

const BACKUP_PATH = path.join(__dirname, '..', 'Database Backup');

// Parse command line arguments
const args = process.argv.slice(2);
const shouldImportBackup = args.includes('--import-backup');
const shouldReset = args.includes('--reset');

/**
 * Default Access Level Configurations
 * Based on organizational hierarchy
 */
const defaultAccessLevels = [
    {
        level: 0,
        levelName: 'Super Admin',
        description: 'Highest level with complete system access including admin panel',
        isSystemLevel: true,
        cascadeToRoles: true,
        componentAccess: [
            { componentId: 'dashboard', componentName: 'Dashboard', hasAccess: true },
            { componentId: 'employees', componentName: 'Employee Management', hasAccess: true },
            { componentId: 'attendance', componentName: 'Attendance', hasAccess: true },
            { componentId: 'leave', componentName: 'Leave Management', hasAccess: true },
            { componentId: 'salary', componentName: 'Salary', hasAccess: false },
            { componentId: 'peer-rating', componentName: 'Peer Rating', hasAccess: true },
            { componentId: 'variable-remuneration', componentName: 'Variable Remuneration', hasAccess: false },
            { componentId: 'remuneration', componentName: 'Remuneration', hasAccess: true },
            { componentId: 'calendar', componentName: 'Calendar', hasAccess: true },
            { componentId: 'efiling', componentName: 'E-Filing', hasAccess: true },
            { componentId: 'settings', componentName: 'Settings', hasAccess: true },
            { componentId: 'profile', componentName: 'Profile', hasAccess: true },
            { componentId: 'admin', componentName: 'Admin Panel', hasAccess: true }
        ],
        featureAccess: [
            { featureId: 'employee.create', featureName: 'Create Employee', hasAccess: true },
            { featureId: 'employee.edit', featureName: 'Edit Employee', hasAccess: true },
            { featureId: 'employee.delete', featureName: 'Delete Employee', hasAccess: true },
            { featureId: 'employee.viewAll', featureName: 'View All Employees', hasAccess: true },
            { featureId: 'leave.approve', featureName: 'Approve Leave', hasAccess: true },
            { featureId: 'leave.apply', featureName: 'Apply Leave', hasAccess: true },
            { featureId: 'attendance.mark', featureName: 'Mark Attendance', hasAccess: true },
            { featureId: 'attendance.viewReports', featureName: 'View Attendance Reports', hasAccess: true },
            { featureId: 'remuneration.view', featureName: 'View Remuneration', hasAccess: true },
            { featureId: 'roles.manage', featureName: 'Manage Roles & Permissions', hasAccess: true },
            { featureId: 'levels.manage', featureName: 'Manage Access Levels', hasAccess: true }
        ]
    },
    {
        level: 1,
        levelName: 'Senior Management',
        description: 'Senior management with high-level access to operations',
        isSystemLevel: true,
        cascadeToRoles: true,
        componentAccess: [
            { componentId: 'dashboard', componentName: 'Dashboard', hasAccess: true },
            { componentId: 'employees', componentName: 'Employee Management', hasAccess: true },
            { componentId: 'attendance', componentName: 'Attendance', hasAccess: true },
            { componentId: 'leave', componentName: 'Leave Management', hasAccess: true },
            { componentId: 'salary', componentName: 'Salary', hasAccess: false },
            { componentId: 'peer-rating', componentName: 'Peer Rating', hasAccess: true },
            { componentId: 'variable-remuneration', componentName: 'Variable Remuneration', hasAccess: false },
            { componentId: 'remuneration', componentName: 'Remuneration', hasAccess: true },
            { componentId: 'calendar', componentName: 'Calendar', hasAccess: true },
            { componentId: 'efiling', componentName: 'E-Filing', hasAccess: true },
            { componentId: 'settings', componentName: 'Settings', hasAccess: true },
            { componentId: 'profile', componentName: 'Profile', hasAccess: true },
            { componentId: 'admin', componentName: 'Admin Panel', hasAccess: false }
        ],
        featureAccess: [
            { featureId: 'employee.edit', featureName: 'Edit Employee', hasAccess: true },
            { featureId: 'employee.viewAll', featureName: 'View All Employees', hasAccess: true },
            { featureId: 'leave.approve', featureName: 'Approve Leave', hasAccess: true },
            { featureId: 'leave.apply', featureName: 'Apply Leave', hasAccess: true },
            { featureId: 'attendance.mark', featureName: 'Mark Attendance', hasAccess: true },
            { featureId: 'attendance.viewReports', featureName: 'View Attendance Reports', hasAccess: true },
            { featureId: 'remuneration.view', featureName: 'View Remuneration', hasAccess: true }
        ]
    },
    {
        level: 2,
        levelName: 'Middle Management',
        description: 'Middle management with operational access',
        isSystemLevel: true,
        cascadeToRoles: true,
        componentAccess: [
            { componentId: 'dashboard', componentName: 'Dashboard', hasAccess: true },
            { componentId: 'employees', componentName: 'Employee Management', hasAccess: true },
            { componentId: 'attendance', componentName: 'Attendance', hasAccess: true },
            { componentId: 'leave', componentName: 'Leave Management', hasAccess: true },
            { componentId: 'salary', componentName: 'Salary', hasAccess: false },
            { componentId: 'peer-rating', componentName: 'Peer Rating', hasAccess: true },
            { componentId: 'variable-remuneration', componentName: 'Variable Remuneration', hasAccess: false },
            { componentId: 'remuneration', componentName: 'Remuneration', hasAccess: true },
            { componentId: 'calendar', componentName: 'Calendar', hasAccess: true },
            { componentId: 'efiling', componentName: 'E-Filing', hasAccess: true },
            { componentId: 'settings', componentName: 'Settings', hasAccess: true },
            { componentId: 'profile', componentName: 'Profile', hasAccess: true },
            { componentId: 'admin', componentName: 'Admin Panel', hasAccess: false }
        ],
        featureAccess: [
            { featureId: 'employee.create', featureName: 'Create Employee', hasAccess: true },
            { featureId: 'employee.edit', featureName: 'Edit Employee', hasAccess: true },
            { featureId: 'employee.delete', featureName: 'Delete Employee', hasAccess: true },
            { featureId: 'employee.viewAll', featureName: 'View All Employees', hasAccess: true },
            { featureId: 'leave.approve', featureName: 'Approve Leave', hasAccess: true },
            { featureId: 'leave.apply', featureName: 'Apply Leave', hasAccess: true },
            { featureId: 'attendance.mark', featureName: 'Mark Attendance', hasAccess: true },
            { featureId: 'attendance.viewReports', featureName: 'View Attendance Reports', hasAccess: true },
            { featureId: 'remuneration.view', featureName: 'View Remuneration', hasAccess: true }
        ]
    },
    {
        level: 3,
        levelName: 'Department Management',
        description: 'Department-level management with limited administrative access',
        isSystemLevel: true,
        cascadeToRoles: true,
        componentAccess: [
            { componentId: 'dashboard', componentName: 'Dashboard', hasAccess: true },
            { componentId: 'employees', componentName: 'Employee Management', hasAccess: true },
            { componentId: 'attendance', componentName: 'Attendance', hasAccess: true },
            { componentId: 'leave', componentName: 'Leave Management', hasAccess: true },
            { componentId: 'salary', componentName: 'Salary', hasAccess: false },
            { componentId: 'peer-rating', componentName: 'Peer Rating', hasAccess: false },
            { componentId: 'variable-remuneration', componentName: 'Variable Remuneration', hasAccess: false },
            { componentId: 'remuneration', componentName: 'Remuneration', hasAccess: false },
            { componentId: 'calendar', componentName: 'Calendar', hasAccess: true },
            { componentId: 'efiling', componentName: 'E-Filing', hasAccess: true },
            { componentId: 'settings', componentName: 'Settings', hasAccess: true },
            { componentId: 'profile', componentName: 'Profile', hasAccess: true },
            { componentId: 'admin', componentName: 'Admin Panel', hasAccess: false }
        ],
        featureAccess: [
            { featureId: 'employee.viewAll', featureName: 'View All Employees', hasAccess: true },
            { featureId: 'leave.apply', featureName: 'Apply Leave', hasAccess: true },
            { featureId: 'attendance.mark', featureName: 'Mark Attendance', hasAccess: true },
            { featureId: 'attendance.viewReports', featureName: 'View Attendance Reports', hasAccess: true }
        ]
    },
    {
        level: 4,
        levelName: 'Staff',
        description: 'General staff with basic access to personal features',
        isSystemLevel: true,
        cascadeToRoles: true,
        componentAccess: [
            { componentId: 'dashboard', componentName: 'Dashboard', hasAccess: true },
            { componentId: 'employees', componentName: 'Employee Management', hasAccess: false },
            { componentId: 'attendance', componentName: 'Attendance', hasAccess: true },
            { componentId: 'leave', componentName: 'Leave Management', hasAccess: true },
            { componentId: 'salary', componentName: 'Salary', hasAccess: false },
            { componentId: 'peer-rating', componentName: 'Peer Rating', hasAccess: false },
            { componentId: 'variable-remuneration', componentName: 'Variable Remuneration', hasAccess: false },
            { componentId: 'remuneration', componentName: 'Remuneration', hasAccess: false },
            { componentId: 'calendar', componentName: 'Calendar', hasAccess: true },
            { componentId: 'efiling', componentName: 'E-Filing', hasAccess: true },
            { componentId: 'settings', componentName: 'Settings', hasAccess: false },
            { componentId: 'profile', componentName: 'Profile', hasAccess: true },
            { componentId: 'admin', componentName: 'Admin Panel', hasAccess: false }
        ],
        featureAccess: [
            { featureId: 'leave.apply', featureName: 'Apply Leave', hasAccess: true },
            { featureId: 'attendance.mark', featureName: 'Mark Attendance', hasAccess: true }
        ]
    }
];

/**
 * Main seed function
 */
async function seedLevelsAndRoles() {
    try {
        console.log('🌱 Starting Level-Based Access Control Seed...\n');
        
        // Connect to database
        await connectDB();
        console.log('✓ Connected to database\n');
        
        // Reset if requested
        if (shouldReset) {
            console.log('🔄 Resetting existing data...');
            await AccessLevel.deleteMany({});
            await RolePermission.deleteMany({});
            console.log('✓ Data reset complete\n');
        }
        
        // Seed access levels
        console.log('📋 Step 1: Seeding access levels...');
        await seedAccessLevels();
        
        // Seed roles
        if (shouldImportBackup) {
            console.log('\n📋 Step 2: Importing roles from backup...');
            await importRolesFromBackup();
        } else {
            console.log('\n📋 Step 2: Seeding default roles...');
            await seedDefaultRoles();
        }
        
        // Display summary
        console.log('\n✅ Seeding completed successfully!');
        await displaySummary();
        
        console.log('\n💡 Next steps:');
        console.log('   1. Start the backend server: npm run dev');
        console.log('   2. Login as admin to manage levels and roles');
        console.log('   3. Test level-based permission cascading');
        console.log('   4. Customize role-specific overrides as needed\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

/**
 * Seed access levels
 */
async function seedAccessLevels() {
    for (const levelData of defaultAccessLevels) {
        try {
            const existing = await AccessLevel.findOne({ level: levelData.level });
            
            if (existing && !shouldReset) {
                console.log(`   ⚠ Level ${levelData.level} already exists, skipping...`);
                continue;
            }
            
            const level = new AccessLevel(levelData);
            level._shouldCascade = false; // Don't cascade during initial seed
            await level.save();
            
            console.log(`   ✓ Created level ${levelData.level}: ${levelData.levelName}`);
        } catch (error) {
            console.error(`   ❌ Error creating level ${levelData.level}:`, error.message);
        }
    }
}

/**
 * Import roles from backup files
 */
async function importRolesFromBackup() {
    try {
        const backupFile = path.join(BACKUP_PATH, 'hrms_nitrrfie.rolepermissions.json');
        
        if (!fs.existsSync(backupFile)) {
            console.log('   ⚠ Backup file not found, using default roles');
            await seedDefaultRoles();
            return;
        }
        
        const rolesData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
        console.log(`   ✓ Read ${rolesData.length} roles from backup`);
        
        for (const roleData of rolesData) {
            try {
                const existing = await RolePermission.findOne({ roleId: roleData.roleId });
                
                if (existing && !shouldReset) {
                    console.log(`   ⚠ Role ${roleData.roleId} already exists, skipping...`);
                    continue;
                }
                
                // Get access level for this role's hierarchy
                const accessLevel = await AccessLevel.findOne({ 
                    level: roleData.hierarchyLevel,
                    isActive: true 
                });
                
                const role = new RolePermission({
                    roleId: roleData.roleId,
                    displayName: roleData.displayName,
                    hierarchyLevel: roleData.hierarchyLevel,
                    description: roleData.description,
                    isActive: roleData.isActive !== false,
                    isSystemRole: roleData.isSystemRole || false,
                    componentAccess: mergeWithLevelPermissions(
                        accessLevel ? accessLevel.componentAccess : [],
                        roleData.componentAccess || [],
                        'componentId'
                    ),
                    featureAccess: mergeWithLevelPermissions(
                        accessLevel ? accessLevel.featureAccess : [],
                        roleData.featureAccess || [],
                        'featureId'
                    )
                });
                
                role.updatedByLevel = true;
                await role.save();
                
                console.log(`   ✓ Imported role: ${roleData.roleId}`);
            } catch (error) {
                console.error(`   ❌ Error importing role ${roleData.roleId}:`, error.message);
            }
        }
    } catch (error) {
        console.error('   ❌ Error reading backup file:', error.message);
        console.log('   ⚠ Falling back to default roles');
        await seedDefaultRoles();
    }
}

/**
 * Seed default roles
 */
async function seedDefaultRoles() {
    const defaultRoles = [
        { roleId: 'ADMIN', displayName: 'Admin', hierarchyLevel: 0, isSystemRole: true },
        { roleId: 'OFFICER_IN_CHARGE', displayName: 'Officer in Charge', hierarchyLevel: 1, isSystemRole: true },
        { roleId: 'FACULTY_IN_CHARGE', displayName: 'Faculty in Charge', hierarchyLevel: 1, isSystemRole: true },
        { roleId: 'CEO', displayName: 'CEO', hierarchyLevel: 2, isSystemRole: true },
        { roleId: 'INCUBATION_MANAGER', displayName: 'Incubation Manager', hierarchyLevel: 3, isSystemRole: true },
        { roleId: 'ACCOUNTANT', displayName: 'Accountant', hierarchyLevel: 3, isSystemRole: true },
        { roleId: 'EMPLOYEE', displayName: 'Employee', hierarchyLevel: 4, isSystemRole: true }
    ];
    
    for (const roleData of defaultRoles) {
        try {
            const existing = await RolePermission.findOne({ roleId: roleData.roleId });
            
            if (existing && !shouldReset) {
                console.log(`   ⚠ Role ${roleData.roleId} already exists, skipping...`);
                continue;
            }
            
            // Get access level for this role
            const accessLevel = await AccessLevel.findOne({ 
                level: roleData.hierarchyLevel,
                isActive: true 
            });
            
            if (!accessLevel) {
                console.log(`   ⚠ No access level found for level ${roleData.hierarchyLevel}`);
                continue;
            }
            
            const role = new RolePermission({
                roleId: roleData.roleId,
                displayName: roleData.displayName,
                hierarchyLevel: roleData.hierarchyLevel,
                description: `${roleData.displayName} role`,
                isActive: true,
                isSystemRole: roleData.isSystemRole,
                componentAccess: accessLevel.componentAccess.map(c => ({
                    ...c.toObject(),
                    inheritedFromLevel: true,
                    roleSpecific: false
                })),
                featureAccess: accessLevel.featureAccess.map(f => ({
                    ...f.toObject(),
                    inheritedFromLevel: true,
                    roleSpecific: false
                }))
            });
            
            role.updatedByLevel = true;
            await role.save();
            
            console.log(`   ✓ Created role: ${roleData.roleId}`);
        } catch (error) {
            console.error(`   ❌ Error creating role ${roleData.roleId}:`, error.message);
        }
    }
}

/**
 * Merge level permissions with role permissions
 */
function mergeWithLevelPermissions(levelPermissions, rolePermissions, idField) {
    const merged = [];
    const levelMap = new Map(levelPermissions.map(p => [p[idField], p]));
    const roleMap = new Map(rolePermissions.map(p => [p[idField], p]));
    
    const allIds = new Set([...levelMap.keys(), ...roleMap.keys()]);
    
    for (const id of allIds) {
        const levelPerm = levelMap.get(id);
        const rolePerm = roleMap.get(id);
        
        if (levelPerm && rolePerm) {
            if (levelPerm.hasAccess !== rolePerm.hasAccess) {
                merged.push({
                    ...rolePerm,
                    roleSpecific: true,
                    inheritedFromLevel: false
                });
            } else {
                merged.push({
                    ...levelPerm,
                    roleSpecific: false,
                    inheritedFromLevel: true
                });
            }
        } else if (rolePerm) {
            merged.push({
                ...rolePerm,
                roleSpecific: true,
                inheritedFromLevel: false
            });
        } else if (levelPerm) {
            merged.push({
                ...levelPerm,
                roleSpecific: false,
                inheritedFromLevel: true
            });
        }
    }
    
    return merged;
}

/**
 * Display summary of seeded data
 */
async function displaySummary() {
    const levelCount = await AccessLevel.countDocuments({ isActive: true });
    const roleCount = await RolePermission.countDocuments({ isActive: true });
    
    console.log('\n📊 Summary:');
    console.log(`   - Access Levels: ${levelCount}`);
    console.log(`   - Roles: ${roleCount}`);
    
    console.log('\n   Level Distribution:');
    for (let level = 0; level <= 4; level++) {
        const rolesAtLevel = await RolePermission.countDocuments({ 
            hierarchyLevel: level,
            isActive: true 
        });
        const levelName = defaultAccessLevels.find(l => l.level === level)?.levelName || `Level ${level}`;
        console.log(`   - Level ${level} (${levelName}): ${rolesAtLevel} role(s)`);
    }
}

// Run seed
if (require.main === module) {
    seedLevelsAndRoles();
}

module.exports = { seedLevelsAndRoles };
