import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';

const MessComplaint = () => {
  const { currentUser, userDetails } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    category: 'food_quality',
    description: '',
    roomNumber: userDetails?.roomNumber || ''
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
    
    if (!formData.category || !formData.description || !formData.roomNumber) {
      return setError('Please fill in all fields');
    }
    
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      
      // Add complaint to Firestore
      await addDoc(collection(db, 'messComplaints'), {
        userId: currentUser.uid,
        studentName: userDetails.name,
        regNumber: userDetails.regNumber,
        roomNumber: formData.roomNumber,
        category: formData.category,
        description: formData.description,
        status: 'pending',
        createdAt: new Date()
      });
      
      setSuccess('Your complaint has been submitted successfully!');
      
      // Reset form
      setFormData({
        ...formData,
        category: 'food_quality',
        description: ''
      });
      
      // Redirect after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
    } catch (error) {
      setError('Failed to submit complaint: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'food_quality':
        return 'bi-egg-fried';
      case 'food_quantity':
        return 'bi-cup-hot';
      case 'menu_variety':
        return 'bi-calendar3';
      case 'cleanliness':
        return 'bi-droplet';
      case 'service':
        return 'bi-person';
      case 'other':
        return 'bi-three-dots';
      default:
        return 'bi-question-circle';
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      
      <Container className="py-4">
        <div className="d-flex align-items-center mb-4">
          <div className="bg-warning bg-opacity-10 p-2 rounded-circle me-3">
            <i className="bi bi-chat-square-text text-warning fs-4"></i>
          </div>
          <h1 className="mb-0">Submit Mess Complaint</h1>
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
              <Row className="mb-4">
                <Col lg={6} className="mb-4 mb-lg-0">
                  <Card className="h-100 border-0 shadow-sm bg-light">
                    <Card.Body className="p-3">
                      <h5 className="mb-3">
                        <i className="bi bi-tag me-2"></i>
                        Complaint Category
                      </h5>
                      
                      <Form.Group>
                        <div className="row g-3">
                          {['food_quality', 'food_quantity', 'menu_variety', 'cleanliness', 'service', 'other'].map((category) => (
                            <div className="col-md-6" key={category}>
                              <Card 
                                className={`border-0 ${formData.category === category ? 'bg-primary bg-opacity-10' : 'bg-white'} h-100 cursor-pointer`}
                                onClick={() => setFormData({...formData, category})}
                                style={{cursor: 'pointer'}}
                              >
                                <Card.Body className="p-3 d-flex align-items-center">
                                  <div className="form-check d-flex">
                                    <Form.Check 
                                      type="radio"
                                      id={`category-${category}`}
                                      name="category"
                                      checked={formData.category === category}
                                      onChange={() => setFormData({...formData, category})}
                                      className="me-2"
                                    />
                                    <label 
                                      htmlFor={`category-${category}`} 
                                      className="form-check-label d-flex align-items-center"
                                    >
                                      <i className={`bi ${getCategoryIcon(category)} me-2`}></i>
                                      <span className="text-capitalize">
                                        {category.replace('_', ' ')}
                                      </span>
                                    </label>
                                  </div>
                                </Card.Body>
                              </Card>
                            </div>
                          ))}
                        </div>
                      </Form.Group>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col lg={6}>
                  <Card className="h-100 border-0 shadow-sm bg-light">
                    <Card.Body className="p-3">
                      <h5 className="mb-3">
                        <i className="bi bi-info-circle me-2"></i>
                        Complaint Details
                      </h5>
                      
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Room Number</Form.Label>
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
                      
                      <Form.Group>
                        <Form.Label className="fw-bold">Complaint Description</Form.Label>
                        <Form.Control
                          as="textarea"
                          name="description"
                          rows="5"
                          value={formData.description}
                          onChange={handleChange}
                          required
                          className="shadow-sm"
                          placeholder="Please describe your complaint in detail"
                        />
                        <Form.Text className="text-muted">
                          Be specific about the issue for faster resolution
                        </Form.Text>
                      </Form.Group>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              
              <div className="d-grid gap-2">
                <Button 
                  variant="warning" 
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="shadow-sm text-dark"
                >
                  {loading ? (
                    <div className="d-flex align-items-center justify-content-center">
                      <Spinner animation="border" size="sm" className="me-2" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="d-flex align-items-center justify-content-center">
                      <i className="bi bi-send me-2"></i>
                      <span>Submit Complaint</span>
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

export default MessComplaint;