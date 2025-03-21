import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Navbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';

const AppNavbar = () => {
  const { currentUser, userDetails, logout } = useAuth();
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
    <Navbar bg="primary" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard">Hostel Portal</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {currentUser && (
              <>
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                
                <NavDropdown title="Services" id="services-dropdown">
                  <NavDropdown.Item as={Link} to="/service-request">Request Service</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/my-services">My Requests</NavDropdown.Item>
                </NavDropdown>
                
                <NavDropdown title="Mess" id="mess-dropdown">
                  <NavDropdown.Item as={Link} to="/mess-menu">View Menu</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/mess-complaint">Submit Complaint</NavDropdown.Item>
                </NavDropdown>
                
                <NavDropdown title="Leave/Outing" id="leave-dropdown">
                  <NavDropdown.Item as={Link} to="/leave-request">Request Leave</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/my-leaves">My Leave Requests</NavDropdown.Item>
                </NavDropdown>
              </>
            )}
          </Nav>
          
          {currentUser && userDetails && (
            <Navbar.Text className="me-3">
              {userDetails.name} | Room: {userDetails.roomNumber}
            </Navbar.Text>
          )}
          
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

export default AppNavbar;