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

  return (
    <>
      <Navbar />
      
      <Container className="py-4">
        <h1 className="mb-4">Request a Service</h1>
        
        <Card>
          <Card.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Service Type</Form.Label>
                <Form.Select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                >
                  <option value="electrician">Electrician</option>
                  <option value="plumber">Plumber</option>
                  <option value="carpenter">Carpenter</option>
                  <option value="laundry">Laundry</option>
                  <option value="cab">Cab</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Problem Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="problem"
                  rows="4"
                  value={formData.problem}
                  onChange={handleChange}
                  placeholder="Please describe your problem in detail"
                />
              </Form.Group>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Room Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="roomNumber"
                      value={formData.roomNumber}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Contact Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading}
                className="w-100"
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Submitting...
                  </>
                ) : 'Submit Request'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default ServiceRequest;