import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Navbar, 
  Nav, 
  Container, 
  NavDropdown, 
  Button, 
  Offcanvas,
  Badge
} from 'react-bootstrap';

const AppNavbar = () => {
  const { currentUser, userDetails, logout } = useAuth();
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

  const isActive = (path) => {
    return location.pathname === path;
  };

  const closeNavbar = () => setExpanded(false);

  return (
    <Navbar 
      bg="white" 
      expand="lg" 
      fixed="top" 
      className="shadow-sm" 
      expanded={expanded}
      onToggle={(expanded) => setExpanded(expanded)}
    >
      <Container>
        <Navbar.Brand as={Link} to="/dashboard" className="fw-bold text-primary">
          <i className="bi bi-building me-2"></i>
          Hostel Portal
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="navbar-nav" />
        
        <Navbar.Offcanvas
          id="navbar-nav"
          aria-labelledby="navbar-nav-label"
          placement="end"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id="navbar-nav-label">
              Hostel Portal
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="me-auto">
              {currentUser && (
                <>
                  <Nav.Link 
                    as={Link} 
                    to="/dashboard" 
                    active={isActive('/dashboard')}
                    onClick={closeNavbar}
                    className="d-flex align-items-center"
                  >
                    <i className="bi bi-house-door me-1"></i> Dashboard
                  </Nav.Link>
                  
                  <NavDropdown 
                    title={
                      <span>
                        <i className="bi bi-tools me-1"></i> Services
                      </span>
                    } 
                    id="services-dropdown"
                    active={isActive('/service-request') || isActive('/my-services')}
                  >
                    <NavDropdown.Item 
                      as={Link} 
                      to="/service-request"
                      onClick={closeNavbar}
                      active={isActive('/service-request')}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Request Service
                    </NavDropdown.Item>
                    
                    <NavDropdown.Item 
                      as={Link} 
                      to="/my-services"
                      onClick={closeNavbar}
                      active={isActive('/my-services')}
                    >
                      <i className="bi bi-list-check me-2"></i>
                      My Requests
                    </NavDropdown.Item>
                  </NavDropdown>
                  
                  <NavDropdown 
                    title={
                      <span>
                        <i className="bi bi-cup-hot me-1"></i> Mess
                      </span>
                    } 
                    id="mess-dropdown"
                    active={isActive('/mess-menu') || isActive('/mess-complaint')}
                  >
                    <NavDropdown.Item 
                      as={Link} 
                      to="/mess-menu"
                      onClick={closeNavbar}
                      active={isActive('/mess-menu')}
                    >
                      <i className="bi bi-calendar3 me-2"></i>
                      View Menu
                    </NavDropdown.Item>
                    
                    <NavDropdown.Item 
                      as={Link} 
                      to="/mess-complaint"
                      onClick={closeNavbar}
                      active={isActive('/mess-complaint')}
                    >
                      <i className="bi bi-chat-square-text me-2"></i>
                      Submit Complaint
                    </NavDropdown.Item>
                  </NavDropdown>
                  
                  <NavDropdown 
                    title={
                      <span>
                        <i className="bi bi-calendar2-check me-1"></i> Leave/Outing
                      </span>
                    } 
                    id="leave-dropdown"
                    active={isActive('/leave-request') || isActive('/my-leaves')}
                  >
                    <NavDropdown.Item 
                      as={Link} 
                      to="/leave-request"
                      onClick={closeNavbar}
                      active={isActive('/leave-request')}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Request Leave
                    </NavDropdown.Item>
                    
                    <NavDropdown.Item 
                      as={Link} 
                      to="/my-leaves"
                      onClick={closeNavbar}
                      active={isActive('/my-leaves')}
                    >
                      <i className="bi bi-clipboard-check me-2"></i>
                      My Leave Requests
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              )}
            </Nav>
            
            {currentUser && userDetails && (
              <div className="d-flex align-items-center">
                <div className="d-none d-lg-flex align-items-center me-3">
                  <div className="me-2 bg-light rounded-circle p-1">
                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white" style={{width: '36px', height: '36px'}}>
                      {userDetails.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="d-flex flex-column">
                    <span className="fw-medium">{userDetails.name}</span>
                    <small className="text-muted d-flex align-items-center">
                      <i className="bi bi-door-closed me-1"></i> Room: {userDetails.roomNumber}
                    </small>
                  </div>
                </div>
                
                <div className="d-block d-lg-none mb-3 border-bottom pb-3">
                  <div className="d-flex align-items-center mb-2">
                    <div className="me-2 bg-light rounded-circle p-1">
                      <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white" style={{width: '36px', height: '36px'}}>
                        {userDetails.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <span className="fw-medium">{userDetails.name}</span>
                      <small className="text-muted d-block">Room: {userDetails.roomNumber}</small>
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  onClick={handleLogout}
                  className="d-flex align-items-center"
                >
                  <i className="bi bi-box-arrow-left me-1"></i> Logout
                </Button>
              </div>
            )}
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;