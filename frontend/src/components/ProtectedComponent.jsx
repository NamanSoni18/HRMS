import { canAccessComponent, canAccessFeature } from '../constants/permissions';
import { useAuth } from '../context/AuthContext';

/**
 * =============================================================================
 * PROTECTED COMPONENT WRAPPER
 * =============================================================================
 * Use this component to wrap any content that should be restricted by role.
 * 
 * USAGE EXAMPLES:
 * 
 * 1. Protect entire component:
 *    <ProtectedComponent component="employees">
 *      <EmployeeManagement />
 *    </ProtectedComponent>
 * 
 * 2. Protect specific feature:
 *    <ProtectedComponent feature="employee.create">
 *      <button>Add Employee</button>
 *    </ProtectedComponent>
 * 
 * 3. Show fallback content:
 *    <ProtectedComponent component="settings" fallback={<div>Access Denied</div>}>
 *      <Settings />
 *    </ProtectedComponent>
 * 
 * 4. Silent fail (hide content):
 *    <ProtectedComponent component="admin-panel" showFallback={false}>
 *      <AdminPanel />
 *    </ProtectedComponent>
 * =============================================================================
 */

const ProtectedComponent = ({ 
    component = null,
    feature = null,
    children, 
    fallback = null,
    showFallback = true
}) => {
    const { user } = useAuth();
    
    // Determine if user has access
    let hasAccess = false;
    
    if (component) {
        hasAccess = canAccessComponent(component, user);
    } else if (feature) {
        hasAccess = canAccessFeature(feature, user);
    } else {
        console.warn('ProtectedComponent: Either component or feature prop is required');
        return null;
    }
    
    // If user has access, render children
    if (hasAccess) {
        return <>{children}</>;
    }
    
    // If no access and showFallback is true, show fallback or default message
    if (showFallback) {
        return fallback || (
            <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#666',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #dee2e6'
            }}>
                <h3 style={{ marginBottom: '0.5rem', color: '#dc3545' }}>Access Denied</h3>
                <p>You don't have permission to access this content.</p>
            </div>
        );
    }
    
    // Silent fail - render nothing
    return null;
};

export default ProtectedComponent;
