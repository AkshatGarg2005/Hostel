import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';
import ServiceRequestCard from '../components/service/ServiceRequestCard';
import { Container, Row, Col, Card, Form, Alert, Spinner, Badge, Button } from 'react-bootstrap';

const MyServices = () => {
  const { currentUser } = useAuth();
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'accepted'

  useEffect(() => {
    const fetchServiceRequests = async () => {
      if (!currentUser) {
        setError('No user is logged in');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('Fetching service requests for user:', currentUser.uid);
        
        let serviceRequestQuery;
        
        if (filter === 'all') {
          serviceRequestQuery = query(
            collection(db, 'serviceRequests'),
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
          );
        } else {
          serviceRequestQuery = query(
            collection(db, 'serviceRequests'),
            where('userId', '==', currentUser.uid),
            where('status', '==', filter),
            orderBy('createdAt', 'desc')
          );
        }
        
        console.log('Executing query...');
        const querySnapshot = await getDocs(serviceRequestQuery);
        console.log(`Query returned ${querySnapshot.size} documents`);
        
        const requests = querySnapshot.docs.map(doc => {
          console.log('Document ID:', doc.id);
          return {
            id: doc.id,
            ...doc.data()
          };
        });
        
        setServiceRequests(requests);
        setError('');
      } catch (error) {
        console.error('Error fetching service requests:', error);
        setError('Failed to load service requests: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceRequests();
  }, [currentUser, filter]);
  
  const getStatusCount = (status) => {
    return serviceRequests.filter(request => 
      status === 'all' ? true : request.status === status
    ).length;
  };
  
  const getServiceTypeCount = (type) => {
    return serviceRequests.filter(request => request.serviceType === type).length;
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      
      <Container className="py-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center">
            <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
              <i className="bi bi-tools text-primary fs-4"></i>
            </div>
            <h1 className="mb-0">My Service Requests</h1>
          </div>
          
          <Link to="/service-request" className="btn btn-primary d-flex align-items-center">
            <i className="bi bi-plus-circle me-2"></i>
            New Request
          </Link>
        </div>
        
        <Row className="mb-4">
          <Col md={4} className="mb-3 mb-md-0">
            <Card 
              className={`border-0 shadow-sm h-100 status-card ${filter === 'all' ? 'bg-primary bg-opacity-10' : ''}`}
              style={{cursor: 'pointer'}}
              onClick={() => setFilter('all')}
            >
              <Card.Body className="d-flex align-items-center">
                <div className="rounded-circle bg-primary bg-opacity-25 p-3 me-3">
                  <i className="bi bi-card-list text-primary fs-4"></i>
                </div>
                <div>
                  <h2 className="fw-bold mb-0">{getStatusCount('all')}</h2>
                  <p className="text-muted mb-0">All Requests</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4} className="mb-3 mb-md-0">
            <Card 
              className={`border-0 shadow-sm h-100 status-card ${filter === 'pending' ? 'bg-warning bg-opacity-10' : ''}`}
              style={{cursor: 'pointer'}}
              onClick={() => setFilter('pending')}
            >
              <Card.Body className="d-flex align-items-center">
                <div className="rounded-circle bg-warning bg-opacity-25 p-3 me-3">
                  <i className="bi bi-clock text-warning fs-4"></i>
                </div>
                <div>
                  <h2 className="fw-bold mb-0">{getStatusCount('pending')}</h2>
                  <p className="text-muted mb-0">Pending</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4} className="mb-3 mb-md-0">
            <Card 
              className={`border-0 shadow-sm h-100 status-card ${filter === 'accepted' ? 'bg-success bg-opacity-10' : ''}`}
              style={{cursor: 'pointer'}}
              onClick={() => setFilter('accepted')}
            >
              <Card.Body className="d-flex align-items-center">
                <div className="rounded-circle bg-success bg-opacity-25 p-3 me-3">
                  <i className="bi bi-check-circle text-success fs-4"></i>
                </div>
                <div>
                  <h2 className="fw-bold mb-0">{getStatusCount('accepted')}</h2>
                  <p className="text-muted mb-0">Accepted</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {error && (
          <Alert variant="danger" className="d-flex align-items-center mb-4">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <div>{error}</div>
          </Alert>
        )}
        
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-grow text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading your service requests...</p>
          </div>
        ) : serviceRequests.length === 0 ? (
          <Card className="border-0 shadow-sm text-center">
            <Card.Body className="py-5">
              <div className="mb-4">
                <i className="bi bi-tools text-muted display-1"></i>
              </div>
              <h3 className="text-muted">No Service Requests Found</h3>
              <p className="text-muted mb-4">
                {filter === 'all' 
                  ? "You haven't made any service requests yet." 
                  : `You don't have any ${filter} service requests.`}
              </p>
              {filter !== 'all' ? (
                <Button 
                  variant="outline-primary" 
                  onClick={() => setFilter('all')}
                  className="me-2"
                >
                  View All Requests
                </Button>
              ) : (
                <Link to="/service-request" className="btn btn-primary">
                  <i className="bi bi-plus-circle me-2"></i>
                  Request Service
                </Link>
              )}
            </Card.Body>
          </Card>
        ) : (
          <div>
            {serviceRequests.length > 0 && filter !== 'all' && (
              <div className="mb-3">
                <Badge bg={filter === 'pending' ? 'warning' : 'success'} className="py-2 px-3 text-dark">
                  Showing {filter} requests ({getStatusCount(filter)})
                </Badge>
                <Button 
                  variant="link" 
                  className="text-decoration-none" 
                  onClick={() => setFilter('all')}
                >
                  View All
                </Button>
              </div>
            )}
            
            {serviceRequests.length > 0 && (
              <Row className="mb-4">
                <Col>
                  <Card className="border-0 shadow-sm">
                    <Card.Body className="p-3">
                      <h5 className="mb-3 text-muted">Service Types</h5>
                      <div className="d-flex flex-wrap gap-2">
                        {['electrician', 'plumber', 'carpenter', 'laundry', 'cab'].map(type => (
                          getServiceTypeCount(type) > 0 && (
                            <Badge 
                              key={type} 
                              bg="light" 
                              text="dark" 
                              className="py-2 px-3 d-flex align-items-center"
                            >
                              <i className={`bi ${type === 'electrician' ? 'bi-lightning-charge' : 
                                               type === 'plumber' ? 'bi-droplet' :
                                               type === 'carpenter' ? 'bi-hammer' :
                                               type === 'laundry' ? 'bi-basket3' : 'bi-car-front'} me-1`}></i>
                              <span className="text-capitalize">{type}</span>
                              <span className="ms-1">({getServiceTypeCount(type)})</span>
                            </Badge>
                          )
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}
            
            <div className="d-flex flex-column gap-4">
              {serviceRequests.map(request => (
                <ServiceRequestCard
                  key={request.id}
                  request={request}
                />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default MyServices;