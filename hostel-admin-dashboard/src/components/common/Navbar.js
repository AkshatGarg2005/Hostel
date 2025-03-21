import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

const AdminNavbar = () => {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard">Hostel Admin</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {currentUser && (
              <>
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>

                {(userRole === 'admin' || userRole === 'service_manager') && (
                  <Nav.Link as={Link} to="/service-manager">Service Manager</Nav.Link>
                )}

                {(userRole === 'admin' || userRole === 'mess_manager') && (
                  <Nav.Link as={Link} to="/mess-manager">Mess Manager</Nav.Link>
                )}

                {(userRole === 'admin' || userRole === 'warden') && (
                  <Nav.Link as={Link} to="/warden">Warden</Nav.Link>
                )}
              </>
            )}
          </Nav>
          
          {currentUser && (
            <Button variant="danger" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;