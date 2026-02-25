import React, { useState } from 'react';
import './Settings.scss';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'integrations', label: 'Integrations', icon: '🔗' },
    { id: 'billing', label: 'Billing', icon: '💰' },
    { id: 'team', label: 'Team', icon: '👥' },
  ];

  return (
    <div className="settings">
      <div className="settings-header">
        <h2>Settings</h2>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-main">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h3>General Settings</h3>
              <div className="settings-form">
                <div className="form-group">
                  <label>Company Name</label>
                  <input type="text" defaultValue="Global Sales Corp" />
                </div>
                <div className="form-group">
                  <label>Timezone</label>
                  <select defaultValue="utc">
                    <option value="utc">UTC</option>
                    <option value="est">EST</option>
                    <option value="pst">PST</option>
                    <option value="cet">CET</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date Format</label>
                  <select defaultValue="mm/dd/yyyy">
                    <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                    <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                    <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Currency</label>
                  <select defaultValue="usd">
                    <option value="usd">USD ($)</option>
                    <option value="eur">EUR (€)</option>
                    <option value="gbp">GBP (£)</option>
                    <option value="jpy">JPY (¥)</option>
                  </select>
                </div>
                <button className="btn btn-primary">Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h3>Notification Settings</h3>
              <div className="notification-settings">
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Email Notifications</h4>
                    <p>Receive email updates about your account activity</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Order Updates</h4>
                    <p>Get notified when orders are placed or updated</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Sales Reports</h4>
                    <p>Receive daily/weekly sales reports</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Customer Alerts</h4>
                    <p>Get alerts for new customers or high-value deals</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h3>Security Settings</h3>
              <div className="security-settings">
                <div className="security-item">
                  <div className="security-info">
                    <h4>Two-Factor Authentication</h4>
                    <p>Add an extra layer of security to your account</p>
                  </div>
                  <button className="btn btn-secondary">Enable</button>
                </div>
                <div className="security-item">
                  <div className="security-info">
                    <h4>Session Timeout</h4>
                    <p>Automatically log out after 30 minutes of inactivity</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="security-item">
                  <div className="security-info">
                    <h4>Password</h4>
                    <p>Last changed 30 days ago</p>
                  </div>
                  <button className="btn btn-secondary">Change Password</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="settings-section">
              <h3>Integrations</h3>
              <div className="integrations-grid">
                {[
                  { name: 'Salesforce', icon: '☁️', connected: true },
                  { name: 'HubSpot', icon: '🎯', connected: true },
                  { name: 'Slack', icon: '💬', connected: false },
                  { name: 'Zapier', icon: '⚡', connected: true },
                  { name: 'Google Analytics', icon: '📊', connected: false },
                  { name: 'Stripe', icon: '💳', connected: true },
                ].map(integration => (
                  <div key={integration.name} className="integration-card">
                    <div className="integration-icon">{integration.icon}</div>
                    <div className="integration-info">
                      <h4>{integration.name}</h4>
                      <span className={`integration-status ${integration.connected ? 'connected' : 'disconnected'}`}>
                        {integration.connected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                    <button className={`btn ${integration.connected ? 'btn-secondary' : 'btn-primary'}`}>
                      {integration.connected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;