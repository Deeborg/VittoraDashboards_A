import React, { JSX, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { SidebarItem } from '../../types'; // Adjust this path if needed
import './Sidebar.scss';

// Import professional icons from react-icons
import { 
  MdDashboard,
  MdTrendingUp,
  MdAssessment,
  MdPeople,
  MdShoppingCart,
  MdListAlt,
  MdBusiness,
  MdLocationOn,
  MdSettings
} from 'react-icons/md';

// Professional icon component
const Icon = ({ name }: { name: string }) => {
  const icons: Record<string, JSX.Element> = {
    dashboard: <MdDashboard size={20} />,
    sales: <MdTrendingUp size={20} />,
    performance: <MdAssessment size={20} />,
    customers: <MdPeople size={20} />,
    products: <MdShoppingCart size={20} />,
    orders: <MdListAlt size={20} />,
    entities: <MdBusiness size={20} />,
    regions: <MdLocationOn size={20} />,
    settings: <MdSettings size={20} />
  };
  
  return <span className="nav-icon-wrapper">{icons[name] || <MdDashboard size={20} />}</span>;
};

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  // Paths updated to correctly route inside Vittora
  const sidebarItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/analytics/sales', badge: 0 },
    { id: 'sales', label: 'Sales Analytics', icon: 'sales', path: '/analytics/sales/sales-analytics', badge: 0 },
    { id: 'performance', label: 'Performance', icon: 'performance', path: '/analytics/sales/performance', badge: 0 },
    { id: 'customers', label: 'Customers', icon: 'customers', path: '/analytics/sales/customers', badge: 0 },
    { id: 'products', label: 'Products', icon: 'products', path: '/analytics/sales/products', badge: 0 },
    { id: 'orders', label: 'Orders', icon: 'orders', path: '/analytics/sales/orders', badge: 0 },
    { id: 'entities', label: 'Entities', icon: 'entities', path: '/analytics/sales/entities', badge: 0 },
    { id: 'regions', label: 'Regions', icon: 'regions', path: '/analytics/sales/regions', badge: 0 },
    { id: 'settings', label: 'Settings', icon: 'settings', path: '/analytics/sales/settings', badge: 0 },
  ];

  return (
    <aside className={`sales-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">V</span>
          {!collapsed && <h2>Vittora</h2>}
        </div>
        <button 
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <nav className="sidebar-nav">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => 
              `nav-item ${isActive ? 'active' : ''}`
            }
            end={item.path === '/analytics/sales'}
          >
            <span className="nav-icon"><Icon name={item.icon} /></span>
            {!collapsed && (
              <>
                <span className="nav-label">{item.label}</span>
                {(item.badge ?? 0) > 0 && (
                  <span className="nav-badge">{item.badge ?? 0}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* {!collapsed && (
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">SS</div>
            <div className="user-info">
              <h4>Sneah Sony</h4>
              <p>Administrator</p>
            </div>
          </div>
          <button className="logout-btn">
            <span>→</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      )} */}
    </aside>
  );
};

export default Sidebar;