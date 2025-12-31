import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { authAPI, adminAPI } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [systemRoles, setSystemRoles] = useState([]);
  const [roleHierarchy, setRoleHierarchy] = useState({});
  const [rolesLoading, setRolesLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState({ componentAccess: [], featureAccess: [] });

  // Fetch system roles from database
  useEffect(() => {
    const fetchSystemRoles = async () => {
      try {
        const response = await adminAPI.getAllValidRoles();
        if (response.success) {
          setSystemRoles(response.roles || []);
          
          // Build role hierarchy from roles data
          const hierarchy = {};
          if (response.roleDetails) {
            response.roleDetails.forEach(role => {
              hierarchy[role.roleId] = role.hierarchyLevel;
            });
          }
          setRoleHierarchy(hierarchy);
        }
      } catch (error) {
        console.error('Failed to fetch system roles:', error);
        // Fallback to minimal roles
        setSystemRoles(['ADMIN', 'CEO', 'EMPLOYEE']);
        setRoleHierarchy({ ADMIN: 0, CEO: 1, EMPLOYEE: 3 });
      } finally {
        setRolesLoading(false);
      }
    };

    fetchSystemRoles();
  }, []);

  // Fetch user permissions when user role changes
  useEffect(() => {
    const fetchUserPermissions = async () => {
      if (user?.role) {
        try {
          const response = await adminAPI.getUserPermissions(user.role);
          if (response.success) {
            setUserPermissions({
              componentAccess: response.componentAccess || [],
              featureAccess: response.featureAccess || []
            });
          } else {
            console.error('Failed to fetch user permissions:', response.message);
            setUserPermissions({ componentAccess: [], featureAccess: [] });
          }
        } catch (error) {
          console.error('Error fetching user permissions:', error);
          setUserPermissions({ componentAccess: [], featureAccess: [] });
        }
      } else {
        setUserPermissions({ componentAccess: [], featureAccess: [] });
      }
    };
    
    fetchUserPermissions();
  }, [user?.role]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      authAPI
        .getProfile()
        .then((data) => {
          if (data.success) {
            setUser({
              id: data.user.id || data.user._id,
              username: data.user.username,
              email: data.user.email,
              role: data.user.role,
              profile: data.user.profile,
              employment: data.user.employment,
              leaveBalance: data.user.leaveBalance,
              isAdmin: data.user.role === "ADMIN",
            });
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (usernameOrUserObject, password) => {
    // If it's an object, it's being used to update user (from ProfileEdit)
    if (typeof usernameOrUserObject === 'object') {
      setUser(usernameOrUserObject);
      return Promise.resolve({ success: true });
    }
    
    // Otherwise it's a normal login
    return authAPI.login(usernameOrUserObject, password)
      .then((data) => {
        if (data.success) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", data.user.role);
          setUser({
            id: data.user.id || data.user._id,
            username: data.user.username,
            email: data.user.email,
            role: data.user.role,
            profile: data.user.profile,
            employment: data.user.employment,
            leaveBalance: data.user.leaveBalance,
            isAdmin: data.user.role === "ADMIN",
          });
          return { success: true };
        }
        return { success: false, message: data.message || "Login failed" };
      })
      .catch((error) => {
        return { success: false, message: "Network error. Please try again." };
      });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
  };

  // Dynamic permission checking
  const hasPermission = (userRole, requiredLevel) => {
    const userLevel = roleHierarchy[userRole];
    return userLevel !== undefined && userLevel <= requiredLevel;
  };

  const canManageRole = (userRole, targetRole) => {
    const userLevel = roleHierarchy[userRole];
    const targetLevel = roleHierarchy[targetRole];
    return userLevel !== undefined && targetLevel !== undefined && userLevel < targetLevel;
  };

  const getSubordinateRoles = (userRole) => {
    const userLevel = roleHierarchy[userRole];
    if (userLevel === undefined) return [];
    
    return systemRoles.filter(role => {
      const roleLevel = roleHierarchy[role];
      return roleLevel !== undefined && roleLevel > userLevel;
    });
  };

  const getRoleDisplayName = (roleId) => {
    // Convert ROLE_ID to display format (e.g., "INCUBATION_MANAGER" -> "Incubation Manager")
    if (!roleId) return '';
    return roleId
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getRoleHierarchyLevel = (roleId) => {
    return roleHierarchy[roleId] ?? 99;
  };

  // Level-Based Access Control helpers
  const hasLevelAccess = (requiredLevel) => {
    if (!user) return false;
    const userLevel = getRoleHierarchyLevel(user.role);
    return userLevel <= requiredLevel;
  };

  const getRolesAtLevel = (level) => {
    return systemRoles.filter(role => roleHierarchy[role] === level);
  };

  const getLevelName = (level) => {
    const levelNames = {
      0: 'Super Admin',
      1: 'Senior Management',
      2: 'Middle Management',
      3: 'Department Management',
      4: 'Staff'
    };
    return levelNames[level] || `Level ${level}`;
  };

  const canAccessComponent = (componentId) => {
    if (!user || !userPermissions.componentAccess) return false;
    return userPermissions.componentAccess.includes(componentId);
  };

  const canAccessFeature = (featureId) => {
    if (!user || !userPermissions.featureAccess) return false;
    return userPermissions.featureAccess.includes(featureId);
  };

  const value = useMemo(
    () => ({
      user,
      loading: loading || rolesLoading,
      isAuthenticated: !!user,
      isAdmin: user?.isAdmin || false,
      role: user?.role || null,
      // Dynamic role data
      systemRoles,
      roleHierarchy,
      rolesLoading,
      userPermissions,
      // Helper functions
      login,
      logout,
      hasPermission: (level) => user && hasPermission(user.role, level),
      canManage: (targetRole) => user && canManageRole(user.role, targetRole),
      getSubordinates: () => (user ? getSubordinateRoles(user.role) : []),
      getRoleDisplayName,
      getRoleHierarchyLevel,
      // Level-based access control
      hasLevelAccess,
      getRolesAtLevel,
      getLevelName,
      canAccessComponent,
      canAccessFeature,
      // Backward compatibility
      ROLES: systemRoles.reduce((acc, role) => ({ ...acc, [role]: role }), {}),
      ROLE_HIERARCHY: roleHierarchy,
    }),
    [user, loading, systemRoles, roleHierarchy, rolesLoading, userPermissions]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
