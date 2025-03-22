import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';

const AdminNavbar = () => {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // Helper function to check if a link is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <Navbar 
      bg="white" 
      variant="light" 
      expand="lg" 
      expanded={expanded}
      onToggle={setExpanded}
      className="py-2 shadow-sm sticky-top"
    >
      <Container>
        <Navbar.Brand as={Link} to="/dashboard" className="d-flex align-items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="me-2 text-primary"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span className="fw-bold">Hostel Admin</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {currentUser && (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/dashboard" 
                  className={`mx-2 ${isActive('/dashboard') ? 'fw-semibold text-primary' : ''}`}
                  onClick={() => setExpanded(false)}
                >
                  Dashboard
                </Nav.Link>

                {(userRole === 'admin' || userRole === 'service_manager') && (
                  <Nav.Link 
                    as={Link} 
                    to="/service-manager" 
                    className={`mx-2 ${isActive('/service-manager') ? 'fw-semibold text-primary' : ''}`}
                    onClick={() => setExpanded(false)}
                  >
                    Service Manager
                  </Nav.Link>
                )}

                {(userRole === 'admin' || userRole === 'mess_manager') && (
                  <Nav.Link 
                    as={Link} 
                    to="/mess-manager" 
                    className={`mx-2 ${isActive('/mess-manager') ? 'fw-semibold text-primary' : ''}`}
                    onClick={() => setExpanded(false)}
                  >
                    Mess Manager
                  </Nav.Link>
                )}

                {(userRole === 'admin' || userRole === 'warden') && (
                  <Nav.Link 
                    as={Link} 
                    to="/warden" 
                    className={`mx-2 ${isActive('/warden') ? 'fw-semibold text-primary' : ''}`}
                    onClick={() => setExpanded(false)}
                  >
                    Warden
                  </Nav.Link>
                )}
                
                {(userRole === 'admin' || userRole === 'security_manager') && (
                  <Nav.Link 
                    as={Link} 
                    to="/security-manager" 
                    className={`mx-2 ${isActive('/security-manager') ? 'fw-semibold text-primary' : ''}`}
                    onClick={() => setExpanded(false)}
                  >
                    Security Manager
                  </Nav.Link>
                )}
              </>
            )}
          </Nav>
          
          {currentUser && (
            <div className="d-flex align-items-center">
              <Dropdown>
                <Dropdown.Toggle 
                  variant="light" 
                  id="dropdown-user" 
                  className="rounded-circle border-0 bg-light p-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </Dropdown.Toggle>

                <Dropdown.Menu align="end">
                  <Dropdown.Item disabled>
                    <small className="text-muted">Signed in as</small>
                    <p className="mb-0 fw-semibold">{currentUser.email}</p>
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item as={Link} to="/dashboard" onClick={() => setExpanded(false)}>
                    Dashboard
                  </Dropdown.Item>
                  <Dropdown.Item onClick={handleLogout}>
                    Sign out
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;