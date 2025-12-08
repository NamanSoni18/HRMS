import { useState } from 'react';
import { User, Bell, Shield, Building2, Database, Palette, Globe, Lock } from 'lucide-react';
import './Settings.css';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [settings, setSettings] = useState({
        // Profile
        fullName: 'Admin User',
        email: 'admin@nitrrfie.in',
        phone: '+91 98765 43210',
        role: 'HR Manager',

        // Preferences
        theme: 'dark',
        language: 'en',
        timezone: 'Asia/Kolkata',
        notifications: true,
        emailAlerts: true,

        // Company
        companyName: 'NIT Raipur Foundation for Innovation & Entrepreneurship',
        companyEmail: 'contact@nitrrfie.in',
        address: 'NIT Raipur, Chhattisgarh',

        // Security
        twoFactorAuth: false,
        sessionTimeout: '30',
        passwordExpiry: '90'
    });

    const handleChange = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        alert('Settings saved successfully!');
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'preferences', label: 'Preferences', icon: Palette },
        { id: 'company', label: 'Company', icon: Building2 },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell }
    ];

    return (
        <div className="settings-container">
            <div className="settings-header">
                <h2>Settings</h2>
                <p>Manage your application preferences and configurations</p>
            </div>

            <div className="settings-layout">
                {/* Sidebar Tabs */}
                <div className="settings-sidebar">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <Icon size={20} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="settings-content glass-panel">
                    {activeTab === 'profile' && (
                        <div className="settings-section">
                            <h3><User size={20} /> User Profile</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        value={settings.fullName}
                                        onChange={(e) => handleChange('fullName', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        value={settings.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        value={settings.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Role</label>
                                    <input
                                        type="text"
                                        value={settings.role}
                                        disabled
                                        className="disabled"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Change Password</label>
                                <button className="secondary-btn">
                                    <Lock size={16} /> Update Password
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="settings-section">
                            <h3><Palette size={20} /> System Preferences</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Theme</label>
                                    <select
                                        value={settings.theme}
                                        onChange={(e) => handleChange('theme', e.target.value)}
                                    >
                                        <option value="dark">Dark Mode</option>
                                        <option value="light">Light Mode</option>
                                        <option value="auto">Auto (System)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Language</label>
                                    <select
                                        value={settings.language}
                                        onChange={(e) => handleChange('language', e.target.value)}
                                    >
                                        <option value="en">English</option>
                                        <option value="hi">Hindi</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Timezone</label>
                                    <select
                                        value={settings.timezone}
                                        onChange={(e) => handleChange('timezone', e.target.value)}
                                    >
                                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                        <option value="UTC">UTC</option>
                                        <option value="America/New_York">America/New York (EST)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'company' && (
                        <div className="settings-section">
                            <h3><Building2 size={20} /> Company Information</h3>
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Company Name</label>
                                    <input
                                        type="text"
                                        value={settings.companyName}
                                        onChange={(e) => handleChange('companyName', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Company Email</label>
                                    <input
                                        type="email"
                                        value={settings.companyEmail}
                                        onChange={(e) => handleChange('companyEmail', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Address</label>
                                    <input
                                        type="text"
                                        value={settings.address}
                                        onChange={(e) => handleChange('address', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="settings-section">
                            <h3><Shield size={20} /> Security Settings</h3>
                            <div className="form-grid">
                                <div className="form-group toggle-group">
                                    <div className="toggle-label">
                                        <label>Two-Factor Authentication</label>
                                        <span className="toggle-desc">Add an extra layer of security</span>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.twoFactorAuth}
                                            onChange={(e) => handleChange('twoFactorAuth', e.target.checked)}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <div className="form-group">
                                    <label>Session Timeout (minutes)</label>
                                    <input
                                        type="number"
                                        value={settings.sessionTimeout}
                                        onChange={(e) => handleChange('sessionTimeout', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Password Expiry (days)</label>
                                    <input
                                        type="number"
                                        value={settings.passwordExpiry}
                                        onChange={(e) => handleChange('passwordExpiry', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="settings-section">
                            <h3><Bell size={20} /> Notification Preferences</h3>
                            <div className="form-grid">
                                <div className="form-group toggle-group">
                                    <div className="toggle-label">
                                        <label>Push Notifications</label>
                                        <span className="toggle-desc">Receive in-app notifications</span>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.notifications}
                                            onChange={(e) => handleChange('notifications', e.target.checked)}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <div className="form-group toggle-group">
                                    <div className="toggle-label">
                                        <label>Email Alerts</label>
                                        <span className="toggle-desc">Get updates via email</span>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.emailAlerts}
                                            onChange={(e) => handleChange('emailAlerts', e.target.checked)}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="settings-actions">
                        <button className="save-btn" onClick={handleSave}>
                            Save Changes
                        </button>
                        <button className="cancel-btn">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
