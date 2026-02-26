import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineBell, HiOutlineColorSwatch, HiOutlineGlobe } from 'react-icons/hi';

// Reusable Toggle Switch Component
const ToggleSwitch = () => {
    const [isOn, setIsOn] = useState(false);
    return (
        <label className="ed-toggle-container">
            <input 
                type="checkbox" 
                className="ed-toggle-input" 
                checked={isOn} 
                onChange={() => setIsOn(!isOn)} 
            />
            <div className="ed-toggle-track">
                <div className="ed-toggle-thumb"></div>
            </div>
        </label>
    );
};

export default function Settings() {
    const sections = [
        {
            icon: HiOutlineBell,
            title: 'Alert Notifications',
            description: 'Configure alert thresholds and notification preferences',
            items: ['Email notifications for critical alerts', 'Slack integration for team alerts', 'Daily digest reports'],
        },
        {
            icon: HiOutlineColorSwatch,
            title: 'Display Preferences',
            description: 'Customize dashboard appearance and layout',
            items: ['Default date range on load', 'KPI card display order', 'Chart animation preferences'],
        },
        {
            icon: HiOutlineGlobe,
            title: 'Data Configuration',
            description: 'Manage data sources and refresh intervals',
            items: ['Data refresh interval', 'Exception category mapping', 'Department hierarchy'],
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ maxWidth: '800px' }} // Restrict width for readability
        >
            <h1 className="ed-page-title">Settings</h1>
            <p className="ed-page-subtitle">Configure dashboard preferences and alert thresholds</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {sections.map((section, i) => {
                    const Icon = section.icon;
                    return (
                        <div key={section.title} className="ed-card">
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                {/* Icon Box */}
                                <div style={{
                                    padding: '10px', 
                                    background: '#eff6ff', 
                                    color: '#2563eb', 
                                    borderRadius: '8px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Icon size={20} />
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                                        {section.title}
                                    </h3>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
                                        {section.description}
                                    </p>

                                    {/* List of Toggles */}
                                    <div>
                                        {section.items.map((item) => (
                                            <div key={item} className="ed-settings-item">
                                                <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 500 }}>
                                                    {item}
                                                </span>
                                                <ToggleSwitch />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}