import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineViewGrid,
    HiOutlineExclamationCircle,
    HiOutlineShieldCheck,
    HiOutlineCube,
    HiOutlineCurrencyDollar,
    HiOutlineCog,
    HiOutlineMenuAlt2, // Hamburger menu icon for collapse
    HiOutlineChevronLeft
} from 'react-icons/hi';

export type PageId = 'overview' | 'exceptions' | 'compliance' | 'inventory' | 'financial' | 'settings';

interface SidebarProps {
    activePage: PageId;
    onNavigate: (page: PageId) => void;
}

const navItems = [
    { id: 'overview', label: 'Overview', icon: HiOutlineViewGrid },
    { id: 'exceptions', label: 'Exception Details', icon: HiOutlineExclamationCircle },
    { id: 'compliance', label: 'Compliance Monitoring', icon: HiOutlineShieldCheck },
    { id: 'inventory', label: 'Inventory Risk', icon: HiOutlineCube },
    { id: 'financial', label: 'Financial Risk', icon: HiOutlineCurrencyDollar },
    { id: 'settings', label: 'Settings', icon: HiOutlineCog },
];

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <motion.aside
            animate={{ width: collapsed ? 64 : 260 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="ed-sidebar"
        >
            {/* Header: Logo + Collapse Button */}
            <div className="ed-logo-area">
                <div className="ed-logo-wrapper">
                    <div className="ed-logo-box">ER</div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="ed-logo-text"
                            >
                                ExceptiBoard
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
                
                {/* Collapse Button is now here at the top */}
                <button 
                    onClick={() => setCollapsed(!collapsed)} 
                    className="ed-collapse-btn-top"
                    title={collapsed ? "Expand" : "Collapse"}
                >
                    {collapsed ? <HiOutlineMenuAlt2 size={20} /> : <HiOutlineChevronLeft size={20} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="ed-nav-container">
                {navItems.map((item) => {
                    const isActive = activePage === item.id;
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id} // Fixed type error
                            onClick={() => onNavigate(item.id as PageId)}
                            className={`ed-nav-btn ${isActive ? 'active' : ''}`}
                            title={collapsed ? item.label : ''} // Tooltip when collapsed
                        >
                            <Icon size={20} style={{minWidth: '20px'}} />
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        style={{overflow: 'hidden'}}
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                    );
                })}
            </nav>
        </motion.aside>
    );
}