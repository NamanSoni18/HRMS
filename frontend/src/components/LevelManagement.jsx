import { useState, useEffect } from 'react';
import { Shield, Users, ChevronDown, ChevronRight, Save, RefreshCw, AlertTriangle, Check } from 'lucide-react';
import { adminAPI } from '../services/api';

const LevelManagement = ({ levels, components, features, onUpdate }) => {
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [expandedLevel, setExpandedLevel] = useState(null);
    const [affectedRoles, setAffectedRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchAffectedRoles = async (level) => {
        try {
            const response = await adminAPI.getAffectedRoles(level);
            if (response.success) {
                setAffectedRoles(response.affectedRoles || []);
            }
        } catch (error) {
            console.error('Error fetching affected roles:', error);
        }
    };

    const handleLevelSelect = async (level) => {
        setSelectedLevel(level);
        setExpandedLevel(level.level === expandedLevel ? null : level.level);
        if (level.level !== expandedLevel) {
            await fetchAffectedRoles(level.level);
        }
    };

    const handleComponentToggle = async (levelNum, componentId, currentAccess) => {
        setLoading(true);
        try {
            const response = await adminAPI.updateLevelComponent(levelNum, componentId, !currentAccess);
            if (response.success) {
                showNotification(`Component permission updated. Cascaded to ${response.affectedRoles || 0} role(s).`, 'success');
                onUpdate();
            } else {
                showNotification(response.message || 'Failed to update permission', 'error');
            }
        } catch (error) {
            showNotification('Error updating component permission', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFeatureToggle = async (levelNum, featureId, currentAccess) => {
        setLoading(true);
        try {
            const response = await adminAPI.updateLevelFeature(levelNum, featureId, !currentAccess);
            if (response.success) {
                showNotification(`Feature permission updated. Cascaded to ${response.affectedRoles || 0} role(s).`, 'success');
                onUpdate();
            } else {
                showNotification(response.message || 'Failed to update permission', 'error');
            }
        } catch (error) {
            showNotification('Error updating feature permission', 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleCascade = async (levelNum) => {
        setLoading(true);
        try {
            const response = await adminAPI.toggleLevelCascade(levelNum);
            if (response.success) {
                showNotification(`Cascade ${response.cascadeEnabled ? 'enabled' : 'disabled'}`, 'success');
                onUpdate();
            } else {
                showNotification('Failed to toggle cascade', 'error');
            }
        } catch (error) {
            showNotification('Error toggling cascade', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getLevelColor = (level) => {
        const colors = {
            0: '#dc2626', // Super Admin - Red
            1: '#ea580c', // Senior Management - Orange
            2: '#ca8a04', // Middle Management - Yellow
            3: '#16a34a', // Department - Green
            4: '#2563eb'  // Staff - Blue
        };
        return colors[level] || '#6b7280';
    };

    const getLevelBadgeColor = (level) => {
        const colors = {
            0: 'bg-red-100 text-red-800 border-red-300',
            1: 'bg-orange-100 text-orange-800 border-orange-300',
            2: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            3: 'bg-green-100 text-green-800 border-green-300',
            4: 'bg-blue-100 text-blue-800 border-blue-300'
        };
        return colors[level] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    return (
        <div className="level-management">
            {notification && (
                <div className={`notification notification-${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <div className="level-management-header">
                <div className="header-info">
                    <Shield size={24} />
                    <div>
                        <h2>Level-Based Access Control</h2>
                        <p>Manage permissions by hierarchy level. Changes cascade to all roles at that level.</p>
                    </div>
                </div>
            </div>

            {levels.length === 0 ? (
                <div className="empty-state">
                    <Shield size={48} />
                    <p>No access levels defined</p>
                    <small>Run the seed script to initialize levels</small>
                </div>
            ) : (
                <div className="levels-container">
                    {levels.map((level) => {
                        const isExpanded = expandedLevel === level.level;
                        const isSelected = selectedLevel?.level === level.level;

                        return (
                            <div 
                                key={level.level} 
                                className={`level-card ${isSelected ? 'selected' : ''}`}
                                style={{ borderLeftColor: getLevelColor(level.level), borderLeftWidth: '4px' }}
                            >
                                <div 
                                    className="level-header"
                                    onClick={() => handleLevelSelect(level)}
                                >
                                    <div className="level-info">
                                        <div className="level-title-row">
                                            <span className={`level-badge ${getLevelBadgeColor(level.level)}`}>
                                                Level {level.level}
                                            </span>
                                            <h3>{level.levelName}</h3>
                                            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                        </div>
                                        <p className="level-description">{level.description}</p>
                                        <div className="level-meta">
                                            <span className="meta-item">
                                                <Users size={14} />
                                                {level.roleCount || 0} role(s)
                                            </span>
                                            <span className={`meta-item ${level.cascadeToRoles ? 'text-success' : 'text-warning'}`}>
                                                {level.cascadeToRoles ? '✓ Cascade Enabled' : '⚠ Cascade Disabled'}
                                            </span>
                                            {level.isSystemLevel && (
                                                <span className="meta-item text-muted">
                                                    <Shield size={14} /> System Level
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="level-details">
                                        {/* Affected Roles */}
                                        {affectedRoles.length > 0 && (
                                            <div className="affected-roles-section">
                                                <h4>Roles at this level ({affectedRoles.length})</h4>
                                                <div className="roles-list">
                                                    {affectedRoles.map(role => (
                                                        <span key={role.roleId} className="role-badge">
                                                            {role.displayName}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Cascade Toggle */}
                                        <div className="cascade-control">
                                            <button
                                                onClick={() => toggleCascade(level.level)}
                                                className="btn btn-secondary btn-sm"
                                                disabled={loading}
                                            >
                                                <RefreshCw size={14} />
                                                {level.cascadeToRoles ? 'Disable' : 'Enable'} Cascade
                                            </button>
                                            <small className="help-text">
                                                When enabled, permission changes automatically update all roles at this level
                                            </small>
                                        </div>

                                        {/* Component Access */}
                                        <div className="permissions-section">
                                            <h4>Component Access</h4>
                                            <div className="permissions-grid">
                                                {components.map(comp => {
                                                    const permission = level.componentAccess?.find(c => c.componentId === comp.id);
                                                    const hasAccess = permission?.hasAccess || false;

                                                    return (
                                                        <div key={comp.id} className="permission-item">
                                                            <label>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={hasAccess}
                                                                    onChange={() => handleComponentToggle(level.level, comp.id, hasAccess)}
                                                                    disabled={loading}
                                                                />
                                                                <span>{comp.name}</span>
                                                            </label>
                                                            {hasAccess && <Check size={16} className="check-icon" />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Feature Access */}
                                        {features.length > 0 && (
                                            <div className="permissions-section">
                                                <h4>Feature Access</h4>
                                                <div className="permissions-grid">
                                                    {features.map(feat => {
                                                        const permission = level.featureAccess?.find(f => f.featureId === feat.id);
                                                        const hasAccess = permission?.hasAccess || false;

                                                        return (
                                                            <div key={feat.id} className="permission-item">
                                                                <label>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={hasAccess}
                                                                        onChange={() => handleFeatureToggle(level.level, feat.id, hasAccess)}
                                                                        disabled={loading}
                                                                    />
                                                                    <span>{feat.name}</span>
                                                                </label>
                                                                {hasAccess && <Check size={16} className="check-icon" />}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Warning about cascade */}
                                        {level.cascadeToRoles && affectedRoles.length > 0 && (
                                            <div className="warning-box">
                                                <AlertTriangle size={16} />
                                                <span>
                                                    Permission changes will automatically update {affectedRoles.length} role(s) at this level
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <style jsx>{`
                .level-management {
                    padding: 20px;
                }

                .level-management-header {
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #e5e7eb;
                }

                .header-info {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .header-info h2 {
                    margin: 0 0 5px 0;
                    font-size: 24px;
                    color: #111827;
                }

                .header-info p {
                    margin: 0;
                    color: #6b7280;
                    font-size: 14px;
                }

                .levels-container {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                .level-card {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    overflow: hidden;
                    transition: all 0.2s;
                }

                .level-card.selected {
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                .level-header {
                    padding: 20px;
                    cursor: pointer;
                    user-select: none;
                    transition: background-color 0.2s;
                }

                .level-header:hover {
                    background-color: #f9fafb;
                }

                .level-title-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 8px;
                }

                .level-badge {
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                    border: 1px solid;
                }

                .level-title-row h3 {
                    margin: 0;
                    font-size: 18px;
                    flex: 1;
                }

                .level-description {
                    margin: 8px 0;
                    color: #6b7280;
                    font-size: 14px;
                }

                .level-meta {
                    display: flex;
                    gap: 20px;
                    margin-top: 12px;
                }

                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    color: #6b7280;
                }

                .text-success { color: #16a34a; }
                .text-warning { color: #ca8a04; }
                .text-muted { color: #9ca3af; }

                .level-details {
                    padding: 20px;
                    background-color: #f9fafb;
                    border-top: 1px solid #e5e7eb;
                }

                .affected-roles-section {
                    margin-bottom: 20px;
                    padding: 15px;
                    background: white;
                    border-radius: 6px;
                }

                .affected-roles-section h4 {
                    margin: 0 0 12px 0;
                    font-size: 14px;
                    color: #374151;
                }

                .roles-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .role-badge {
                    padding: 6px 12px;
                    background: #f3f4f6;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 13px;
                    color: #374151;
                }

                .cascade-control {
                    margin-bottom: 20px;
                    padding: 15px;
                    background: white;
                    border-radius: 6px;
                }

                .cascade-control button {
                    margin-bottom: 8px;
                }

                .help-text {
                    display: block;
                    color: #6b7280;
                    font-size: 12px;
                }

                .permissions-section {
                    margin-bottom: 20px;
                    padding: 15px;
                    background: white;
                    border-radius: 6px;
                }

                .permissions-section h4 {
                    margin: 0 0 15px 0;
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                }

                .permissions-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 12px;
                }

                .permission-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px;
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                }

                .permission-item label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    flex: 1;
                }

                .permission-item input[type="checkbox"] {
                    cursor: pointer;
                }

                .check-icon {
                    color: #16a34a;
                }

                .warning-box {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px;
                    background: #fef3c7;
                    border: 1px solid #fcd34d;
                    border-radius: 6px;
                    color: #92400e;
                    font-size: 13px;
                }

                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: #9ca3af;
                }

                .empty-state svg {
                    margin-bottom: 15px;
                }

                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    z-index: 1000;
                    animation: slideIn 0.3s ease;
                }

                .notification-success { background: #d1fae5; color: #065f46; border: 1px solid #10b981; }
                .notification-error { background: #fee2e2; color: #991b1b; border: 1px solid #ef4444; }
                .notification-info { background: #dbeafe; color: #1e40af; border: 1px solid #3b82f6; }

                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default LevelManagement;
