import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';
import { Container, Row, Col, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';

const RoomSwapRequest = () => {
  const { currentUser, userDetails } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    reason: '',
    preferredFloor: '',
    preferredRoomType: '',
    contactNumber: userDetails?.contactNumber || '',
    additionalInfo: ''
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
    
    if (!formData.reason || !formData.contactNumber) {
      return setError('Please fill in all required fields');
    }
    
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      
      if (!currentUser || !userDetails) {
        throw new Error('You must be logged in to submit a room swap request');
      }
      
      console.log('Submitting room swap request for user:', currentUser.uid);
      
      // Create the room swap request data object
      const roomSwapRequestData = {
        userId: currentUser.uid,
        studentName: userDetails.name,
        regNumber: userDetails.regNumber,
        roomNumber: userDetails.roomNumber,
        contactNumber: formData.contactNumber,
        reason: formData.reason,
        preferredFloor: formData.preferredFloor,
        preferredRoomType: formData.preferredRoomType,
        additionalInfo: formData.additionalInfo,
        status: 'pending',
        createdAt: new Date()
      };
      
      console.log('Room swap request data:', roomSwapRequestData);
      
      // Add room swap request to Firestore
      const docRef = await addDoc(collection(db, 'roomSwapRequests'), roomSwapRequestData);
      
      console.log('Room swap request added with ID:', docRef.id);
      
      setSuccess('Your room swap request has been submitted successfully! Once approved by the warden, you will be able to see other available rooms for swapping.');
      
      // Reset form
      setFormData({
        ...formData,
        reason: '',
        preferredFloor: '',
        preferredRoomType: '',
        additionalInfo: ''
      });
      
      // Redirect after a delay
      setTimeout(() => {
        navigate('/my-swaps');
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting room swap request:', error);
      setError('Failed to submit room swap request: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      
      <Container className="py-4">
        <div className="d-flex align-items-center mb-4">
          <div className="bg-info bg-opacity-10 p-2 rounded-circle me-3">
            <i className="bi bi-arrow-left-right text-info fs-4"></i>
          </div>
          <h1 className="mb-0">Request Room Swap</h1>
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
                    <i className="bi bi-info-circle me-2"></i>
                    Current Room Information
                  </h5>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={userDetails?.name || ''}
                          disabled
                          className="bg-white"
                        />
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Registration Number</Form.Label>
                        <Form.Control
                          type="text"
                          value={userDetails?.regNumber || ''}
                          disabled
                          className="bg-white"
                        />
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Current Room Number</Form.Label>
                        <Form.Control
                          type="text"
                          value={userDetails?.roomNumber || ''}
                          disabled
                          className="bg-white"
                        />
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Contact Number</Form.Label>
                        <Form.Control
                          type="tel"
                          name="contactNumber"
                          value={formData.contactNumber}
                          onChange={handleChange}
                          required
                          className="shadow-sm"
                          placeholder="Enter your contact number"
                        />
                        <Form.Text className="text-muted">
                          This number will be shared with potential room swap partners
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
              
              <Card className="border-0 shadow-sm bg-light mb-4">
                <Card.Body className="p-3">
                  <h5 className="card-title mb-3">
                    <i className="bi bi-arrows-angle-expand me-2"></i>
                    Swap Preferences
                  </h5>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Reason for Swap</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="reason"
                      rows="3"
                      value={formData.reason}
                      onChange={handleChange}
                      placeholder="Please explain why you want to swap your room"
                      required
                      className="shadow-sm"
                    />
                  </Form.Group>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Preferred Floor (Optional)</Form.Label>
                        <Form.Control
                          type="text"
                          name="preferredFloor"
                          value={formData.preferredFloor}
                          onChange={handleChange}
                          className="shadow-sm"
                          placeholder="e.g., Ground, First, Second"
                        />
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Preferred Room Type (Optional)</Form.Label>
                        <Form.Control
                          type="text"
                          name="preferredRoomType"
                          value={formData.preferredRoomType}
                          onChange={handleChange}
                          className="shadow-sm"
                          placeholder="e.g., Corner room, Near stairs, etc."
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Additional Information (Optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="additionalInfo"
                      rows="2"
                      value={formData.additionalInfo}
                      onChange={handleChange}
                      placeholder="Any additional details or preferences for room swap"
                      className="shadow-sm"
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
              
              <div className="d-grid gap-2">
                <Button 
                  variant="info" 
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="shadow-sm text-white"
                >
                  {loading ? (
                    <div className="d-flex align-items-center justify-content-center">
                      <Spinner animation="border" size="sm" className="me-2" />
                      <span>Processing request...</span>
                    </div>
                  ) : (
                    <div className="d-flex align-items-center justify-content-center">
                      <i className="bi bi-send me-2"></i>
                      <span>Submit Swap Request</span>
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

export default RoomSwapRequest;