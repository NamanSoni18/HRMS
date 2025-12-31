const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

// Import models
const RolePermission = require('./models/RolePermission');
const AccessLevel = require('./models/AccessLevel');
const connectDB = require('./config/db');

const BACKUP_PATH = path.join(__dirname, '..', 'Database Backup', 'hrms_nitrrfie.rolepermissions.json');

/**
 * Define access levels based on current role structure
 * Levels define what permissions roles at each hierarchy level should have
 */
const accessLevelDefinitions = [
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
 * Main migration function
 */
async function migrateToLevelBasedAccess() {
    try {
        console.log('🚀 Starting Level-Based Access Control Migration...\n');
        
        // Connect to database
        await connectDB();
        console.log('✓ Connected to database\n');
        
        // Step 1: Create access levels
        console.log('📋 Step 1: Creating access levels...');
        await createAccessLevels();
        
        // Step 2: Read existing role permissions from backup
        console.log('\n📋 Step 2: Reading role permissions from backup...');
        const existingRoles = await readBackupData();
        
        // Step 3: Update existing roles with level-based structure
        console.log('\n📋 Step 3: Updating roles with level-based permissions...');
        await updateRolesWithLevels(existingRoles);
        
        // Step 4: Verify migration
        console.log('\n📋 Step 4: Verifying migration...');
        await verifyMigration();
        
        console.log('\n✅ Migration completed successfully!');
        console.log('\n📝 Summary:');
        console.log('   - Created 5 access levels (0-4)');
        console.log('   - Updated all roles with level-based permissions');
        console.log('   - Preserved role-specific permission overrides');
        console.log('   - Enabled automatic cascade of level changes to roles');
        
        console.log('\n💡 Next steps:');
        console.log('   1. Test the system by modifying an access level in the database');
        console.log('   2. Verify that changes cascade to all roles at that level');
        console.log('   3. Use the Admin Panel to manage level permissions');
        console.log('   4. Create new roles that automatically inherit level permissions\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

/**
 * Create access levels in the database
 */
async function createAccessLevels() {
    for (const levelDef of accessLevelDefinitions) {
        try {
            // Check if level already exists
            const existing = await AccessLevel.findOne({ level: levelDef.level });
            
            if (existing) {
                console.log(`   ⚠ Level ${levelDef.level} (${levelDef.levelName}) already exists, updating...`);
                Object.assign(existing, levelDef);
                existing._shouldCascade = false; // Don't cascade during migration
                await existing.save();
            } else {
                console.log(`   ✓ Creating level ${levelDef.level}: ${levelDef.levelName}`);
                const level = new AccessLevel(levelDef);
                level._shouldCascade = false; // Don't cascade during initial creation
                await level.save();
            }
        } catch (error) {
            console.error(`   ❌ Error creating level ${levelDef.level}:`, error.message);
        }
    }
}

/**
 * Read existing role permissions from backup file
 */
async function readBackupData() {
    try {
        if (!fs.existsSync(BACKUP_PATH)) {
            console.log('   ⚠ Backup file not found, will use database data');
            return await RolePermission.find({});
        }
        
        const backupData = JSON.parse(fs.readFileSync(BACKUP_PATH, 'utf8'));
        console.log(`   ✓ Read ${backupData.length} roles from backup`);
        return backupData;
    } catch (error) {
        console.error('   ❌ Error reading backup:', error.message);
        console.log('   ⚠ Falling back to database data');
        return await RolePermission.find({});
    }
}

/**
 * Update existing roles with level-based structure
 */
async function updateRolesWithLevels(rolesData) {
    for (const roleData of rolesData) {
        try {
            const roleId = roleData.roleId;
            const hierarchyLevel = roleData.hierarchyLevel;
            
            console.log(`   Processing role: ${roleId} (Level ${hierarchyLevel})`);
            
            // Get the access level for this role
            const accessLevel = await AccessLevel.findOne({ level: hierarchyLevel });
            if (!accessLevel) {
                console.log(`   ⚠ No access level found for level ${hierarchyLevel}, skipping...`);
                continue;
            }
            
            // Find or create the role
            let role = await RolePermission.findOne({ roleId });
            
            if (!role) {
                console.log(`   ✓ Creating new role: ${roleId}`);
                role = new RolePermission({
                    roleId: roleData.roleId,
                    displayName: roleData.displayName,
                    hierarchyLevel: roleData.hierarchyLevel,
                    description: roleData.description,
                    isActive: roleData.isActive !== false,
                    isSystemRole: roleData.isSystemRole || false
                });
            }
            
            // Merge permissions: level defaults + role-specific overrides
            role.componentAccess = mergePermissionsForMigration(
                accessLevel.componentAccess,
                roleData.componentAccess || [],
                'componentId'
            );
            
            role.featureAccess = mergePermissionsForMigration(
                accessLevel.featureAccess,
                roleData.featureAccess || [],
                'featureId'
            );
            
            role.updatedByLevel = true; // Skip level sync hook
            await role.save();
            
            console.log(`   ✓ Updated role: ${roleId}`);
        } catch (error) {
            console.error(`   ❌ Error updating role ${roleData.roleId}:`, error.message);
        }
    }
}

/**
 * Merge permissions during migration
 * Identifies role-specific overrides vs level defaults
 */
function mergePermissionsForMigration(levelPermissions, rolePermissions, idField) {
    const merged = [];
    const levelPermMap = new Map(levelPermissions.map(p => [p[idField], p]));
    const rolePermMap = new Map(rolePermissions.map(p => [p[idField], p]));
    
    // Process all unique permission IDs
    const allIds = new Set([...levelPermMap.keys(), ...rolePermMap.keys()]);
    
    for (const id of allIds) {
        const levelPerm = levelPermMap.get(id);
        const rolePerm = rolePermMap.get(id);
        
        if (levelPerm && rolePerm) {
            // Both exist - check if role overrides level
            if (levelPerm.hasAccess !== rolePerm.hasAccess) {
                // Role-specific override
                merged.push({
                    ...rolePerm,
                    roleSpecific: true,
                    inheritedFromLevel: false
                });
            } else {
                // Same as level - inherited
                merged.push({
                    ...levelPerm,
                    roleSpecific: false,
                    inheritedFromLevel: true
                });
            }
        } else if (rolePerm) {
            // Only in role - role-specific
            merged.push({
                ...rolePerm,
                roleSpecific: true,
                inheritedFromLevel: false
            });
        } else if (levelPerm) {
            // Only in level - inherited
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
 * Verify migration was successful
 */
async function verifyMigration() {
    const levelCount = await AccessLevel.countDocuments({ isActive: true });
    const roleCount = await RolePermission.countDocuments({ isActive: true });
    
    console.log(`   ✓ Access Levels: ${levelCount}`);
    console.log(`   ✓ Roles: ${roleCount}`);
    
    // Verify level-role mapping
    for (let level = 0; level <= 4; level++) {
        const rolesAtLevel = await RolePermission.countDocuments({ 
            hierarchyLevel: level,
            isActive: true 
        });
        console.log(`   ✓ Level ${level}: ${rolesAtLevel} role(s)`);
    }
    
    // Check for role-specific overrides
    const rolesWithOverrides = await RolePermission.find({
        isActive: true,
        $or: [
            { 'componentAccess.roleSpecific': true },
            { 'featureAccess.roleSpecific': true }
        ]
    });
    
    console.log(`   ✓ Roles with specific overrides: ${rolesWithOverrides.length}`);
}

// Run migration
if (require.main === module) {
    migrateToLevelBasedAccess();
}

module.exports = { migrateToLevelBasedAccess };
