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
    <div className="min-vh-100 bg-light">
      <Navbar />
      
      <Container className="py-4">
        <div className="d-flex align-items-center mb-4">
          <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
            <i className="bi bi-box-arrow-right text-primary fs-4"></i>
          </div>
          <h1 className="mb-0">Request Leave/Outing</h1>
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
                  <h5 className="card-title mb-3">
                    <i className="bi bi-calendar-date me-2"></i>
                    Leave Dates
                  </h5>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">
                          <i className="bi bi-box-arrow-right me-2"></i>
                          Checkout Date
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="checkoutDate"
                          value={formData.checkoutDate}
                          onChange={handleChange}
                          required
                          className="shadow-sm"
                        />
                        <Form.Text className="text-muted">
                          Select the date you plan to leave
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          Return Date
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="returnDate"
                          value={formData.returnDate}
                          onChange={handleChange}
                          required
                          className="shadow-sm"
                        />
                        <Form.Text className="text-muted">
                          Select your expected return date
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
              
              <Card className="border-0 shadow-sm bg-light mb-4">
                <Card.Body className="p-3">
                  <h5 className="card-title mb-3">
                    <i className="bi bi-info-circle me-2"></i>
                    Leave Details
                  </h5>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      <i className="bi bi-chat-left-text me-2"></i>
                      Reason for Leave
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      name="reason"
                      rows="3"
                      value={formData.reason}
                      onChange={handleChange}
                      placeholder="Please provide a detailed reason for your leave"
                      required
                      className="shadow-sm"
                    />
                    <Form.Text className="text-muted">
                      Be specific about the purpose of your leave
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      <i className="bi bi-geo-alt me-2"></i>
                      Destination Address
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      name="destinationAddress"
                      rows="2"
                      value={formData.destinationAddress}
                      onChange={handleChange}
                      placeholder="Full address of your destination"
                      required
                      className="shadow-sm"
                    />
                    <Form.Text className="text-muted">
                      Provide the complete address where you'll be staying
                    </Form.Text>
                  </Form.Group>
                </Card.Body>
              </Card>
              
              <Card className="border-0 shadow-sm bg-light mb-4">
                <Card.Body className="p-3">
                  <h5 className="card-title mb-3">
                    <i className="bi bi-telephone me-2"></i>
                    Contact Information
                  </h5>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">
                          <i className="bi bi-phone me-2"></i>
                          Your Phone Number
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          required
                          className="shadow-sm"
                        />
                        <Form.Text className="text-muted">
                          Your active contact number
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">
                          <i className="bi bi-telephone-forward me-2"></i>
                          Emergency Contact Number
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleChange}
                          placeholder="Parent/Guardian phone number"
                          required
                          className="shadow-sm"
                        />
                        <Form.Text className="text-muted">
                          Parent/Guardian contact number
                        </Form.Text>
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

export default LeaveRequest;