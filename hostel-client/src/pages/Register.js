import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';

const Register = () => {
  const { register, currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    regNumber: '',
    roomNumber: '',
    contactNumber: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    if (!formData.name || !formData.email || !formData.regNumber || 
        !formData.roomNumber || !formData.contactNumber) {
      return setError('Please fill in all fields');
    }
    
    try {
      setError('');
      setLoading(true);
      
      const result = await register(
        formData.email,
        formData.password,
        formData.name,
        formData.regNumber,
        formData.roomNumber,
        formData.contactNumber
      );
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Failed to create an account');
      }
    } catch (error) {
      setError('Failed to create an account: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light py-5">
      <Container>
        <Row className="justify-content-center">
          <Col lg={8} xl={7}>
            <div className="text-center mb-4">
              <div className="bg-primary text-white display-4 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: "80px", height: "80px"}}>
                <i className="bi bi-building"></i>
              </div>
              <h1 className="fw-bold text-primary">Create your account</h1>
              <p className="text-muted">Register to access hostel services</p>
            </div>
            
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4 p-lg-5">
                {error && (
                  <Alert variant="danger" className="d-flex align-items-center">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>{error}</div>
                  </Alert>
                )}
                
                <Form onSubmit={handleSubmit}>
                  <Card className="border-0 bg-light mb-4">
                    <Card.Body className="p-3">
                      <h5 className="mb-3">
                        <i className="bi bi-person-circle me-2"></i>
                        Personal Information
                      </h5>
                      
                      <Row className="mb-3">
                        <Col md={12}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Full Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              required
                              placeholder="Enter your full name"
                              className="shadow-sm"
                            />
                          </Form.Group>
                        </Col>
                        
                        <Col md={12}>
                          <Form.Group>
                            <Form.Label className="fw-bold">Email Address</Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              placeholder="Enter your email address"
                              className="shadow-sm"
                            />
                            <Form.Text className="text-muted">
                              We'll use this email for login and communications
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                  
                  <Card className="border-0 bg-light mb-4">
                    <Card.Body className="p-3">
                      <h5 className="mb-3">
                        <i className="bi bi-building me-2"></i>
                        Hostel Information
                      </h5>
                      
                      <Row className="mb-3">
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Registration Number</Form.Label>
                            <Form.Control
                              type="text"
                              name="regNumber"
                              value={formData.regNumber}
                              onChange={handleChange}
                              required
                              placeholder="Enter your registration number"
                              className="shadow-sm"
                            />
                          </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Room Number</Form.Label>
                            <Form.Control
                              type="text"
                              name="roomNumber"
                              value={formData.roomNumber}
                              onChange={handleChange}
                              required
                              placeholder="Enter your room number"
                              className="shadow-sm"
                            />
                          </Form.Group>
                        </Col>
                        
                        <Col md={12}>
                          <Form.Group>
                            <Form.Label className="fw-bold">Contact Number</Form.Label>
                            <Form.Control
                              type="tel"
                              name="contactNumber"
                              value={formData.contactNumber}
                              onChange={handleChange}
                              required
                              placeholder="Enter your contact number"
                              className="shadow-sm"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                  
                  <Card className="border-0 bg-light mb-4">
                    <Card.Body className="p-3">
                      <h5 className="mb-3">
                        <i className="bi bi-shield-lock me-2"></i>
                        Account Security
                      </h5>
                      
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Password</Form.Label>
                            <Form.Control
                              type="password"
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              required
                              placeholder="Create a password"
                              className="shadow-sm"
                            />
                            <Form.Text className="text-muted">
                              Minimum 6 characters
                            </Form.Text>
                          </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-bold">Confirm Password</Form.Label>
                            <Form.Control
                              type="password"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              required
                              placeholder="Confirm your password"
                              className="shadow-sm"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  <div className="d-grid gap-2 mt-4">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      size="lg"
                      className="py-3"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="d-flex align-items-center justify-content-center">
                          <Spinner animation="border" size="sm" className="me-2" />
                          Creating account...
                        </div>
                      ) : (
                        <div className="d-flex align-items-center justify-content-center">
                          <i className="bi bi-person-plus me-2"></i>
                          Register
                        </div>
                      )}
                    </Button>
                  </div>
                </Form>
                
                <div className="text-center mt-4">
                  <p className="mb-0 text-muted">
                    Already have an account? <Link to="/login" className="fw-bold text-primary text-decoration-none">Login here</Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;