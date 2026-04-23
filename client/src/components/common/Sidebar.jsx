import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GiWheat } from 'react-icons/gi';
import {
  FiHome, FiMapPin, FiPackage, FiDollarSign, FiUsers, FiBarChart2,
  FiPlusCircle, FiList, FiUser, FiSettings, FiShoppingBag
} from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const farmerLinks = [
    { to: '/farmer', icon: FiHome, label: 'Overview' },
    { to: '/farmer/transactions', icon: FiPackage, label: 'Transactions' },
    { to: '/farmer/credit', icon: FiDollarSign, label: 'Credit' },
    { to: '/farmer/profile', icon: FiUser, label: 'Profile' },
  ];

  const managerLinks = [
    { to: '/manager', icon: FiHome, label: 'Overview' },
    { to: '/manager/add-produce', icon: FiPlusCircle, label: 'Add Produce' },
    { to: '/manager/records', icon: FiList, label: 'Records' },
    { to: '/manager/orders', icon: FiShoppingBag, label: 'Orders' },
  ];

  const buyerLinks = [
    { to: '/buyer', icon: FiHome, label: 'Overview' },
    { to: '/buyer/stock', icon: FiPackage, label: 'Browse Stock' },
    { to: '/buyer/orders', icon: FiShoppingBag, label: 'My Orders' },
    { to: '/buyer/profile', icon: FiUser, label: 'Business Profile' },
  ];

  const adminLinks = [
    { to: '/admin', icon: FiHome, label: 'Overview' },
    { to: '/admin/centers', icon: FiMapPin, label: 'Centers' },
    { to: '/admin/produce', icon: FiPackage, label: 'Produce' },
    { to: '/admin/credits', icon: FiDollarSign, label: 'Credits' },
    { to: '/admin/users', icon: FiUsers, label: 'Users' },
    { to: '/admin/analytics', icon: FiBarChart2, label: 'Analytics' },
  ];

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'manager' ? managerLinks : user?.role === 'buyer' ? buyerLinks : farmerLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-16 left-0 bottom-0 z-40 w-64 bg-white border-r border-gray-100 shadow-sm
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="flex flex-col h-full p-4">
          {/* Role badge */}
          <div className="mb-6 p-3 bg-gradient-to-br from-primary-50 to-emerald-50 rounded-xl border border-primary-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <GiWheat className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{user?.name}</p>
                <p className="text-xs text-primary-600 capitalize font-medium">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex-1 space-y-1">
            {links.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/farmer' || to === '/manager' || to === '/admin' || to === '/buyer'}
                className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}
                onClick={onClose}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Version */}
          <div className="pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">AgriLink v1.0</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
