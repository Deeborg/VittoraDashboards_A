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
    return (
        <aside className="ed-sidebar">
            <div className="ed-logo-area">
                <div className="ed-logo-box">ER</div>
            </div>

            <nav className="ed-nav-container">
                {navItems.map((item) => {
                    const isActive = activePage === item.id;
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id as PageId)}
                            className={`ed-nav-btn ${isActive ? 'active' : ''}`}
                            title={item.label} 
                        >
                            <Icon size={22} />
                            {/* Labels are hidden by CSS */}
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
}
