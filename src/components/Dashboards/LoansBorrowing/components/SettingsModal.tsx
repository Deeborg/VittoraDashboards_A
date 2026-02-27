import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) => {
  const {
    darkMode,
    setDarkMode,
    realtimeUpdates,
    setRealtimeUpdates,
    showAnimations,
    setShowAnimations,
    currencyFormat,
    setCurrencyFormat,
    dateFormat,
    setDateFormat,
    refreshInterval,
    setRefreshInterval,
    emailAlerts,
    setEmailAlerts,
    riskAlerts,
    setRiskAlerts,
    paymentReminders,
    setPaymentReminders,
  } = useDashboard();

  const [localCurrencyFormat, setLocalCurrencyFormat] = useState(currencyFormat);
  const [localDateFormat, setLocalDateFormat] = useState(dateFormat);
  const [localRefreshInterval, setLocalRefreshInterval] = useState(refreshInterval);

  const handleSave = () => {
    setCurrencyFormat(localCurrencyFormat);
    setDateFormat(localDateFormat);
    setRefreshInterval(localRefreshInterval);
    onSave();
  };

  const handleReset = () => {
    setDarkMode(false);
    setRealtimeUpdates(true);
    setShowAnimations(true);
    setLocalCurrencyFormat('USD ($)');
    setLocalDateFormat('MM/DD/YYYY');
    setLocalRefreshInterval('5 minutes');
    setEmailAlerts(true);
    setRiskAlerts(true);
    setPaymentReminders(true);
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal active" onClick={onClose}>
      <div className="settings-content" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Dashboard Settings</h2>
          <button className="btn-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="settings-group">
          <h3>Display Settings</h3>
          <div className="setting-item">
            <label>Dark Mode</label>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <label>Real-time Updates</label>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={realtimeUpdates}
                onChange={(e) => setRealtimeUpdates(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <label>Show Animations</label>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={showAnimations}
                onChange={(e) => setShowAnimations(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-group">
          <h3>Data Preferences</h3>
          <div className="setting-item">
            <label>Currency Format</label>
            <select
              value={localCurrencyFormat}
              onChange={(e) => setLocalCurrencyFormat(e.target.value)}
              className="settings-select"
            >
              <option>USD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
              <option>Local Currency</option>
            </select>
          </div>
          <div className="setting-item">
            <label>Date Format</label>
            <select
              value={localDateFormat}
              onChange={(e) => setLocalDateFormat(e.target.value)}
              className="settings-select"
            >
              <option>MM/DD/YYYY</option>
              <option>DD/MM/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>
          <div className="setting-item">
            <label>Refresh Interval</label>
            <select
              value={localRefreshInterval}
              onChange={(e) => setLocalRefreshInterval(e.target.value)}
              className="settings-select"
            >
              <option>5 minutes</option>
              <option>15 minutes</option>
              <option>30 minutes</option>
              <option>1 hour</option>
            </select>
          </div>
        </div>

        <div className="settings-group">
          <h3>Notification Settings</h3>
          <div className="setting-item">
            <label>Email Alerts</label>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <label>Risk Alerts</label>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={riskAlerts}
                onChange={(e) => setRiskAlerts(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <label>Payment Reminders</label>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={paymentReminders}
                onChange={(e) => setPaymentReminders(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-actions">
          <button className="btn-export" onClick={handleSave}>
            <i className="fas fa-save"></i> Save Settings
          </button>
          <button className="btn-print" onClick={handleReset}>
            <i className="fas fa-undo"></i> Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
