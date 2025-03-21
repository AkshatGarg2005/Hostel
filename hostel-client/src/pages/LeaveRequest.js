import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';
import { Container, Row, Col, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';

const LeaveRequest = () => {
  const { currentUser, userDetails } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    checkoutDate: '',
    returnDate: '',
    reason: '',
    phoneNumber: userDetails?.contactNumber || '',
    emergencyContact: '',
    destinationAddress: ''
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
    
    if (!formData.checkoutDate || !formData.returnDate || 
        !formData.reason || !formData.phoneNumber || 
        !formData.emergencyContact || !formData.destinationAddress) {
      return setError('Please fill in all fields');
    }
    
    // Check if checkout date is in the future
    const checkoutDate = new Date(formData.checkoutDate);
    const returnDate = new Date(formData.returnDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkoutDate < today) {
      return setError('Checkout date cannot be in the past');
    }
    
    if (returnDate < checkoutDate) {
      return setError('Return date must be after checkout date');
    }
    
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      
      if (!currentUser || !userDetails) {
        throw new Error('You must be logged in to submit a leave request');
      }
      
      console.log('Submitting leave request for user:', currentUser.uid);
      
      // Create the leave request data object
      const leaveRequestData = {
        userId: currentUser.uid,
        studentName: userDetails.name,
        regNumber: userDetails.regNumber,
        roomNumber: userDetails.roomNumber,
        checkoutDate: checkoutDate,
        returnDate: returnDate,
        reason: formData.reason,
        phoneNumber: formData.phoneNumber,
        emergencyContact: formData.emergencyContact,
        destinationAddress: formData.destinationAddress,
        status: 'pending',
        createdAt: new Date()
      };
      
      console.log('Leave request data:', leaveRequestData);
      
      // Add leave request to Firestore
      const docRef = await addDoc(collection(db, 'leaveRequests'), leaveRequestData);
      
      console.log('Leave request added with ID:', docRef.id);
      
      setSuccess('Your leave request has been submitted successfully!');
      
      // Reset form
      setFormData({
        ...formData,
        checkoutDate: '',
        returnDate: '',
        reason: '',
        destinationAddress: ''
      });
      
      // Redirect after a delay
      setTimeout(() => {
        navigate('/my-leaves');
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting leave request:', error);
      setError('Failed to submit leave request: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      
      <Container className="py-4">
        <h1 className="mb-4">Request Leave/Outing</h1>
        
        <Card>
          <Card.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Checkout Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="checkoutDate"
                      value={formData.checkoutDate}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Return Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="returnDate"
                      value={formData.returnDate}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Reason for Leave</Form.Label>
                <Form.Control
                  as="textarea"
                  name="reason"
                  rows="3"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Please provide a detailed reason for your leave"
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Destination Address</Form.Label>
                <Form.Control
                  as="textarea"
                  name="destinationAddress"
                  rows="2"
                  value={formData.destinationAddress}
                  onChange={handleChange}
                  placeholder="Full address of your destination"
                  required
                />
              </Form.Group>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Your Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Emergency Contact Number</Form.Label>
                    <Form.Control
                      type="tel"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      placeholder="Parent/Guardian phone number"
                      required
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

export default LeaveRequest;