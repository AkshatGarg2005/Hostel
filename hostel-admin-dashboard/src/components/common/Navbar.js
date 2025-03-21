import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl">Hostel Admin</span>
            </Link>
          </div>
          
          {currentUser && (
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                Dashboard
              </Link>

              {(userRole === 'admin' || userRole === 'service_manager') && (
                <Link to="/service-manager" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Service Manager
                </Link>
              )}

              {(userRole === 'admin' || userRole === 'mess_manager') && (
                <Link to="/mess-manager" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Mess Manager
                </Link>
              )}

              {(userRole === 'admin' || userRole === 'warden') && (
                <Link to="/warden" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Warden
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && currentUser && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>

            {(userRole === 'admin' || userRole === 'service_manager') && (
              <Link
                to="/service-manager"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Service Manager
              </Link>
            )}

            {(userRole === 'admin' || userRole === 'mess_manager') && (
              <Link
                to="/mess-manager"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Mess Manager
              </Link>
            )}

            {(userRole === 'admin' || userRole === 'warden') && (
              <Link
                to="/warden"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Warden
              </Link>
            )}

            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium bg-red-600 hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;