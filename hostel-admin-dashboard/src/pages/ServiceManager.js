import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, InputGroup } from 'react-bootstrap';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import Navbar from '../components/common/Navbar';
import ServiceRequestCard from '../components/service-manager/ServiceRequestCard';

const ServiceManager = () => {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'accepted'
  const [serviceType, setServiceType] = useState('all'); // 'all', 'electrician', 'plumber', etc.
  const [searchTerm, setSearchTerm] = useState('');

  const fetchServiceRequests = async () => {
    setLoading(true);
    try {
      let serviceRequestQuery;

      // Create a query based on filters
      if (filter === 'all' && serviceType === 'all') {
        serviceRequestQuery = query(
          collection(db, 'serviceRequests'),
          orderBy('createdAt', 'desc')
        );
      } else if (filter !== 'all' && serviceType === 'all') {
        serviceRequestQuery = query(
          collection(db, 'serviceRequests'),
          where('status', '==', filter),
          orderBy('createdAt', 'desc')
        );
      } else if (filter === 'all' && serviceType !== 'all') {
        serviceRequestQuery = query(
          collection(db, 'serviceRequests'),
          where('serviceType', '==', serviceType),
          orderBy('createdAt', 'desc')
        );
      } else {
        serviceRequestQuery = query(
          collection(db, 'serviceRequests'),
          where('status', '==', filter),
          where('serviceType', '==', serviceType),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(serviceRequestQuery);
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setServiceRequests(requests);
    } catch (error) {
      console.error('Error fetching service requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceRequests();
  }, [filter, serviceType]);

  const handleAccept = async (id) => {
    try {
      const requestRef = doc(db, 'serviceRequests', id);
      await updateDoc(requestRef, {
        status: 'accepted',
        acceptedAt: new Date()
      });
      
      // Update the local state
      setServiceRequests(prevRequests => 
        prevRequests.map(request => 
          request.id === id 
            ? { ...request, status: 'accepted', acceptedAt: new Date() } 
            : request
        )
      );
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        await deleteDoc(doc(db, 'serviceRequests', id));
        // Remove from local state
        setServiceRequests(prevRequests => 
          prevRequests.filter(request => request.id !== id)
        );
      } catch (error) {
        console.error('Error deleting request:', error);
      }
    }
  };

  // Filter by search term
  const filteredRequests = serviceRequests.filter(request => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (request.regNumber && request.regNumber.toLowerCase().includes(searchLower)) ||
      (request.roomNumber && request.roomNumber.toString().includes(searchLower)) ||
      (request.problem && request.problem.toLowerCase().includes(searchLower)) ||
      (request.contactNumber && request.contactNumber.includes(searchTerm)) ||
      (request.tokenNumber && request.tokenNumber.toString().includes(searchTerm))
    );
  });

  // Count by status
  const pendingCount = serviceRequests.filter(req => req.status === 'pending').length;
  const acceptedCount = serviceRequests.filter(req => req.status === 'accepted').length;

  // Service type options
  const serviceTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'electrician', label: 'Electrician' },
    { value: 'plumber', label: 'Plumber' },
    { value: 'carpenter', label: 'Carpenter' },
    { value: 'laundry', label: 'Laundry' },
    { value: 'cab', label: 'Cab' }
  ];

  return (
    <div className="page-container fade-in">
      <Navbar />
      
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="fs-4 fw-bold mb-0">Service Manager</h1>
        </div>
        
        <Row className="mb-4">
          <Col lg={4} md={6} sm={12} className="mb-3 mb-lg-0">
            <Card className="shadow-sm border-0 h-100">
              <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                <div className="dashboard-card-icon bg-primary bg-opacity-10 mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                </div>
                <h3 className="fs-2 fw-bold mb-0">{serviceRequests.length}</h3>
                <p className="text-muted">Total Requests</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4} md={6} sm={12} className="mb-3 mb-lg-0">
            <Card className="shadow-sm border-0 h-100">
              <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                <div className="dashboard-card-icon bg-warning bg-opacity-10 mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-warning"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <h3 className="fs-2 fw-bold mb-0">{pendingCount}</h3>
                <p className="text-muted">Pending Requests</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4} md={12} sm={12}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                <div className="dashboard-card-icon bg-success bg-opacity-10 mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-success"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <h3 className="fs-2 fw-bold mb-0">{acceptedCount}</h3>
                <p className="text-muted">Accepted Requests</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Card className="shadow-sm border-0 mb-4">
          <Card.Body className="p-3 p-md-4">
            <h5 className="card-title fw-semibold mb-3">Filters</h5>
            <Row className="g-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-medium">Status</Form.Label>
                  <Form.Select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="shadow-sm"
                  >
                    <option value="all">All Requests</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-medium">Service Type</Form.Label>
                  <Form.Select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="shadow-sm"
                  >
                    {serviceTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-medium">Search</Form.Label>
                  <InputGroup className="shadow-sm">
                    <Form.Control
                      placeholder="Search by room, registration, etc."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <Button 
                        variant="outline-secondary" 
                        onClick={() => setSearchTerm('')}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </Button>
                    )}
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="fs-5 fw-semibold mb-0">Service Requests</h2>
          <Badge bg={pendingCount > 0 ? "warning" : "success"} className="badge-pill py-2 px-3">
            {pendingCount} Pending
          </Badge>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Loading service requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </div>
            <h3 className="fs-5 mt-3">No service requests found</h3>
            <p className="empty-state-text">
              {filter !== 'all' || serviceType !== 'all' || searchTerm
                ? 'Try changing your filters to see more results.'
                : 'There are no service requests in the system.'}
            </p>
            {(filter !== 'all' || serviceType !== 'all' || searchTerm) && (
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => {
                  setFilter('all');
                  setServiceType('all');
                  setSearchTerm('');
                }}
                className="mt-2"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-3 text-muted small">
              Showing {filteredRequests.length} of {serviceRequests.length} requests
            </div>
            {filteredRequests.map(request => (
              <ServiceRequestCard
                key={request.id}
                request={request}
                onAccept={handleAccept}
                onDelete={handleDelete}
              />
            ))}
          </>
        )}
      </Container>
    </div>
  );
};

export default ServiceManager;