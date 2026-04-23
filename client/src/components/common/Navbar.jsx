import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiMenu, FiX, FiLogOut, FiUser } from 'react-icons/fi';
import { GiWheat } from 'react-icons/gi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'manager': return '/manager';
      case 'farmer': return '/farmer';
      default: return '/login';
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsOpen(false)}>
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <GiWheat className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-primary-700">Agri</span>
              <span className="text-gray-800">Link</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <a href="/#about" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">About</a>
            <a href="/#schemes" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Schemes</a>
            <a href="/#map" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Find Centers</a>
            <a href="/#how-it-works" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">How It Works</a>

            {user ? (
              <div className="flex items-center gap-3">
                <Link to={getDashboardLink()} className="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
                  <FiUser size={14} />
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50" title="Logout">
                  <FiLogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
            {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-fade-in">
          <div className="px-4 py-4 space-y-2">
            <a href="/#about" onClick={() => setIsOpen(false)} className="block px-4 py-2 rounded-lg text-gray-600 hover:bg-primary-50 hover:text-primary-700 transition-colors">About</a>
            <a href="/#schemes" onClick={() => setIsOpen(false)} className="block px-4 py-2 rounded-lg text-gray-600 hover:bg-primary-50 hover:text-primary-700 transition-colors">Schemes</a>
            <a href="/#map" onClick={() => setIsOpen(false)} className="block px-4 py-2 rounded-lg text-gray-600 hover:bg-primary-50 hover:text-primary-700 transition-colors">Find Centers</a>
            <a href="/#how-it-works" onClick={() => setIsOpen(false)} className="block px-4 py-2 rounded-lg text-gray-600 hover:bg-primary-50 hover:text-primary-700 transition-colors">How It Works</a>
            <hr className="my-2" />
            {user ? (
              <>
                <Link to={getDashboardLink()} onClick={() => setIsOpen(false)} className="block px-4 py-2 rounded-lg text-primary-700 font-semibold hover:bg-primary-50">Dashboard</Link>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 rounded-lg text-red-500 hover:bg-red-50">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50">Login</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="block px-4 py-2 rounded-lg bg-primary-600 text-white text-center font-semibold">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
