import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';
import { Container, Row, Col, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';

const ServiceRequest = () => {
  const { currentUser, userDetails } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    serviceType: 'electrician',
    problem: '',
    roomNumber: userDetails?.roomNumber || '',
    contactNumber: userDetails?.contactNumber || ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.serviceType || !formData.problem || 
        !formData.roomNumber || !formData.contactNumber) {
      return setError('Please fill in all fields');
    }
    
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      
      if (!currentUser || !userDetails) {
        throw new Error('You must be logged in to submit a service request');
      }
      
      console.log('Submitting service request for user:', currentUser.uid);
      
      // Get current timestamp
      const now = new Date();
      
      // Generate a token number (using timestamp and random string)
      const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
      const tokenNumber = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${randomStr}`;
      
      // Create the request data object
      const requestData = {
        userId: currentUser.uid,
        studentName: userDetails.name,
        regNumber: userDetails.regNumber,
        roomNumber: formData.roomNumber,
        contactNumber: formData.contactNumber,
        serviceType: formData.serviceType,
        problem: formData.problem,
        status: 'pending',
        tokenNumber,
        createdAt: now
      };
      
      console.log('Request data:', requestData);
      
      // Add service request to Firestore
      const docRef = await addDoc(collection(db, 'serviceRequests'), requestData);
      
      console.log('Service request added with ID:', docRef.id);
      
      setSuccess('Service request submitted successfully! Your token number is: ' + tokenNumber);
      
      // Reset form
      setFormData({
        ...formData,
        serviceType: 'electrician',
        problem: ''
      });
      
      // Redirect after a delay
      setTimeout(() => {
        navigate('/my-services');
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting service request:', error);
      setError('Failed to submit service request: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const serviceTypes = [
    { 
      id: 'electrician', 
      name: 'Electrician', 
      icon: 'bi-lightning-charge',
      color: 'warning',
      description: 'For electrical issues like lights, fans, switches, etc.'
    },
    { 
      id: 'plumber', 
      name: 'Plumber', 
      icon: 'bi-droplet',
      color: 'info',
      description: 'For water supply issues, leaking taps, drainage problems, etc.'
    },
    { 
      id: 'carpenter', 
      name: 'Carpenter', 
      icon: 'bi-hammer',
      color: 'secondary',
      description: 'For furniture repairs, door/window issues, etc.'
    },
    { 
      id: 'laundry', 
      name: 'Laundry', 
      icon: 'bi-basket3',
      color: 'primary',
      description: 'For laundry pickup, delivery or related services'
    },
    { 
      id: 'cab', 
      name: 'Cab', 
      icon: 'bi-car-front',
      color: 'success',
      description: 'For transportation requests to/from campus'
    },
  ];

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      
      <Container className="py-4">
        <div className="d-flex align-items-center mb-4">
          <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
            <i className="bi bi-tools text-primary fs-4"></i>
          </div>
          <h1 className="mb-0">Request a Service</h1>
        </div>
        
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">
            {error && (
              <Alert variant="danger" className="d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <div>{error}</div>
              </Alert>
            )}
            
            {success && (
              <Alert variant="success" className="d-flex align-items-center">
                <i className="bi bi-check-circle-fill me-2"></i>
                <div>{success}</div>
              </Alert>
            )}
            
            <Form onSubmit={handleSubmit}>
              <Card className="border-0 shadow-sm bg-light mb-4">
                <Card.Body className="p-3">
                  <h5 className="mb-3">
                    <i className="bi bi-person-gear me-2"></i>
                    Service Type
                  </h5>
                  
                  <Row className="g-3">
                    {serviceTypes.map((service) => (
                      <Col md={6} lg={4} key={service.id}>
                        <Card 
                          className={`border-0 h-100 ${formData.serviceType === service.id ? `bg-${service.color} bg-opacity-10` : 'bg-white'}`}
                          style={{cursor: 'pointer'}}
                          onClick={() => setFormData({...formData, serviceType: service.id})}
                        >
                          <Card.Body className="p-3">
                            <div className="form-check">
                              <Form.Check 
                                type="radio"
                                id={`service-${service.id}`}
                                name="serviceType"
                                checked={formData.serviceType === service.id}
                                onChange={() => setFormData({...formData, serviceType: service.id})}
                                label=""
                                className="position-absolute"
                              />
                              <div className="ms-4">
                                <div className={`text-${service.color} d-flex align-items-center mb-2`}>
                                  <i className={`bi ${service.icon} me-2 fs-5`}></i>
                                  <h6 className="mb-0">{service.name}</h6>
                                </div>
                                <p className="text-muted small mb-0">
                                  {service.description}
                                </p>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
              
              <Card className="border-0 shadow-sm bg-light mb-4">
                <Card.Body className="p-3">
                  <h5 className="mb-3">
                    <i className="bi bi-info-circle me-2"></i>
                    Request Details
                  </h5>
                  
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">
                      <i className="bi bi-chat-left-text me-2"></i>
                      Problem Description
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      name="problem"
                      rows="4"
                      value={formData.problem}
                      onChange={handleChange}
                      placeholder="Please describe your problem in detail"
                      required
                      className="shadow-sm"
                    />
                    <Form.Text className="text-muted">
                      Provide as much detail as possible to help us address your issue quickly
                    </Form.Text>
                  </Form.Group>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">
                          <i className="bi bi-door-closed me-2"></i>
                          Room Number
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="roomNumber"
                          value={formData.roomNumber}
                          onChange={handleChange}
                          required
                          className="shadow-sm"
                          placeholder="Your room number"
                        />
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">
                          <i className="bi bi-telephone me-2"></i>
                          Contact Number
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="contactNumber"
                          value={formData.contactNumber}
                          onChange={handleChange}
                          required
                          className="shadow-sm"
                          placeholder="Your contact number"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
              
              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="shadow-sm"
                >
                  {loading ? (
                    <div className="d-flex align-items-center justify-content-center">
                      <Spinner animation="border" size="sm" className="me-2" />
                      <span>Processing request...</span>
                    </div>
                  ) : (
                    <div className="d-flex align-items-center justify-content-center">
                      <i className="bi bi-send me-2"></i>
                      <span>Submit Request</span>
                    </div>
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default ServiceRequest;