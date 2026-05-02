import {
  HiOutlineViewGrid,
  HiOutlineExclamationCircle,
  HiOutlineShieldCheck,
  HiOutlineCube,
  HiOutlineCurrencyDollar,
  HiOutlineCog,
  HiOutlineChevronLeft,
} from 'react-icons/hi';

import { useNavigate } from 'react-router-dom';

export type PageId =
  | 'overview'
  | 'exceptions'
  | 'compliance'
  | 'inventory'
  | 'financial'
  | 'settings';

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}

const navItems = [
  {
    id: 'overview',
    label: 'Overview',
    icon: HiOutlineViewGrid,
  },
  {
    id: 'exceptions',
    label: 'Exception Details',
    icon: HiOutlineExclamationCircle,
  },
  {
    id: 'compliance',
    label: 'Compliance Monitoring',
    icon: HiOutlineShieldCheck,
  },
  {
    id: 'inventory',
    label: 'Inventory Risk',
    icon: HiOutlineCube,
  },
  {
    id: 'financial',
    label: 'Financial Risk',
    icon: HiOutlineCurrencyDollar,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: HiOutlineCog,
  },
];

export default function Sidebar({
  activePage,
  onNavigate,
}: SidebarProps) {
  const navigate = useNavigate();

  return (
    <aside className="ed-sidebar">

      {/* =========================
           BACK BUTTON
      ========================= */}
      <div className="exception-back-header">
        <button
          className="exception-back-btn"
          onClick={() =>
            navigate('/modules', {
              state: { scrollToModule: 'finance' },
            })
          }
          title="Back to Finance Planning & Analysis"
        >
          <HiOutlineChevronLeft size={22} />
        </button>
      </div>

      {/* =========================
           LOGO AREA
      ========================= */}
      <div className="ed-logo-area">
        <div className="ed-logo-box">ER</div>
      </div>

      {/* =========================
           NAVIGATION
      ========================= */}
      <nav className="ed-nav-container">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() =>
                onNavigate(item.id as PageId)
              }
              className={`ed-nav-btn ${
                isActive ? 'active' : ''
              }`}
              title={item.label}
            >
              <Icon size={22} />

              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}