import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';
import LeaveRequestCard from '../components/leave/LeaveRequestCard';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';

const MyLeaves = () => {
  const { currentUser } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [debugInfo, setDebugInfo] = useState({ userId: '', requestCount: 0 });

  // Function to add a test leave request - for debugging only
  const addTestLeaveRequest = async () => {
    if (!currentUser) {
      setError('You must be logged in to add a test request');
      return;
    }
    
    try {
      const testRequestData = {
        userId: currentUser.uid,
        studentName: 'Test Student',
        regNumber: 'REG12345',
        roomNumber: '101',
        checkoutDate: new Date(Date.now() + 86400000), // tomorrow
        returnDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
        reason: 'Test leave request',
        phoneNumber: '1234567890',
        emergencyContact: '9876543210',
        destinationAddress: 'Test Address',
        status: 'approved',
        createdAt: new Date(),
        approvedBy: 'Test Warden',
        approvedById: 'testwardenid',
        approvedAt: new Date(),
        validTill: new Date(Date.now() + 86400000 * 4) // 4 days from now
      };
      
      await addDoc(collection(db, 'leaveRequests'), testRequestData);
      alert('Test leave request added successfully!');
      fetchLeaveRequests(); // Refresh the list
    } catch (error) {
      console.error('Error adding test leave request:', error);
      setError('Failed to add test request: ' + error.message);
    }
  };

  const fetchLeaveRequests = async () => {
    if (!currentUser) {
      setError('No user is logged in');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching leave requests for user:', currentUser.uid);
      setDebugInfo(prev => ({ ...prev, userId: currentUser.uid }));
      
      let leaveRequestQuery;
      
      if (filter === 'all') {
        leaveRequestQuery = query(
          collection(db, 'leaveRequests'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
      } else {
        leaveRequestQuery = query(
          collection(db, 'leaveRequests'),
          where('userId', '==', currentUser.uid),
          where('status', '==', filter),
          orderBy('createdAt', 'desc')
        );
      }
      
      console.log('Executing query...');
      const querySnapshot = await getDocs(leaveRequestQuery);
      console.log(`Query returned ${querySnapshot.size} documents`);
      setDebugInfo(prev => ({ ...prev, requestCount: querySnapshot.size }));
      
      const requests = querySnapshot.docs.map(doc => {
        console.log('Document ID:', doc.id);
        return {
          id: doc.id,
          ...doc.data()
        };
      });
      
      setLeaveRequests(requests);
      setError('');
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      setError('Failed to load leave requests: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, [currentUser, filter]);

  const getStatusCount = (status) => {
    return leaveRequests.filter(request => 
      status === 'all' ? true : request.status === status
    ).length;
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      
      <Container className="py-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center">
            <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
              <i className="bi bi-calendar2-check text-success fs-4"></i>
            </div>
            <h1 className="mb-0">My Leave Requests</h1>
          </div>
          
          <Link to="/leave-request" className="btn btn-success d-flex align-items-center">
            <i className="bi bi-plus-circle me-2"></i>
            New Request
          </Link>
        </div>
        
        <Row className="mb-4">
          <Col md={6} lg={3} className="mb-3 mb-lg-0">
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
          
          <Col md={6} lg={3} className="mb-3 mb-lg-0">
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
          
          <Col md={6} lg={3} className="mb-3 mb-lg-0">
            <Card 
              className={`border-0 shadow-sm h-100 status-card ${filter === 'approved' ? 'bg-success bg-opacity-10' : ''}`}
              style={{cursor: 'pointer'}}
              onClick={() => setFilter('approved')}
            >
              <Card.Body className="d-flex align-items-center">
                <div className="rounded-circle bg-success bg-opacity-25 p-3 me-3">
                  <i className="bi bi-check-circle text-success fs-4"></i>
                </div>
                <div>
                  <h2 className="fw-bold mb-0">{getStatusCount('approved')}</h2>
                  <p className="text-muted mb-0">Approved</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6} lg={3} className="mb-3 mb-lg-0">
            <Card 
              className={`border-0 shadow-sm h-100 status-card ${filter === 'rejected' ? 'bg-danger bg-opacity-10' : ''}`}
              style={{cursor: 'pointer'}}
              onClick={() => setFilter('rejected')}
            >
              <Card.Body className="d-flex align-items-center">
                <div className="rounded-circle bg-danger bg-opacity-25 p-3 me-3">
                  <i className="bi bi-x-circle text-danger fs-4"></i>
                </div>
                <div>
                  <h2 className="fw-bold mb-0">{getStatusCount('rejected')}</h2>
                  <p className="text-muted mb-0">Rejected</p>
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
            <p className="mt-3 text-muted">Loading your leave requests...</p>
          </div>
        ) : leaveRequests.length === 0 ? (
          <Card className="border-0 shadow-sm text-center">
            <Card.Body className="py-5">
              <div className="mb-4">
                <i className="bi bi-calendar-x text-muted display-1"></i>
              </div>
              <h3 className="text-muted">No Leave Requests Found</h3>
              <p className="text-muted mb-4">
                {filter === 'all' 
                  ? "You haven't made any leave requests yet." 
                  : `You don't have any ${filter} leave requests.`}
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
                <Link to="/leave-request" className="btn btn-primary">
                  <i className="bi bi-plus-circle me-2"></i>
                  Request Leave
                </Link>
              )}
              
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-3 bg-light rounded mx-auto" style={{maxWidth: "500px"}}>
                  <h6 className="text-muted">Debug Information:</h6>
                  <p className="small mb-1">User ID: {debugInfo.userId || 'Not available'}</p>
                  <p className="small mb-1">Query returned: {debugInfo.requestCount} requests</p>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={addTestLeaveRequest}
                    className="mt-2"
                  >
                    Add Test Leave Request
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        ) : (
          <div>
            {filter !== 'all' && (
              <div className="mb-3">
                <Badge bg={filter === 'pending' ? 'warning' : filter === 'approved' ? 'success' : 'danger'} className="py-2 px-3">
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
            
            {leaveRequests.map(request => (
              <LeaveRequestCard
                key={request.id}
                request={request}
              />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
};

export default MyLeaves;