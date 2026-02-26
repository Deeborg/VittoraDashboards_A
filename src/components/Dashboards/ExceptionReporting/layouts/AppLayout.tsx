import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import type { PageId } from './Sidebar';
import FilterBar from './FilterBar';

interface AppLayoutProps {
    activePage: PageId;
    onNavigate: (page: PageId) => void;
    children: ReactNode;
}

export default function AppLayout({ activePage, onNavigate, children }: AppLayoutProps) {
    return (
        <div className="ed-layout">
            {/* Background Effects */}
            <div className="ed-blob-blue" />
            <div className="ed-blob-purple" />

            {/* Left Side: Sidebar (Height handled by CSS) */}
            <Sidebar activePage={activePage} onNavigate={onNavigate} />

            {/* Right Side: Content Wrapper */}
            <div className="ed-content-wrapper">
                
                {/* Top Filter Bar (Fixed) */}
                <FilterBar />

                {/* Main Scrollable Area */}
                <main className="ed-main-scroll">
                    {children}
                </main>
            </div>
        </div>
    );
}