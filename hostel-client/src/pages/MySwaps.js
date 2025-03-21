import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';
import SwapRequestCard from '../components/swap/SwapRequestCard';
import { Container, Row, Col, Card, Button, Alert, Tabs, Tab, Badge, Spinner } from 'react-bootstrap';

const MySwaps = () => {
  const { currentUser, userDetails } = useAuth();
  const [myRequests, setMyRequests] = useState([]);
  const [availableSwaps, setAvailableSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('my-requests');
  const [hasApprovedRequest, setHasApprovedRequest] = useState(false);

  // Fetch data - combined fetch function to minimize database calls
  const fetchData = async () => {
    if (!currentUser) {
      setError('You must be logged in to view your swap requests');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // 1. Fetch user's own requests
      const userRequestsQuery = query(
        collection(db, 'roomSwapRequests'),
        where('userId', '==', currentUser.uid)
      );
      
      const userSnapshot = await getDocs(userRequestsQuery);
      const userRequests = userSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setMyRequests(userRequests);
      
      // 2. Check if user has any approved requests
      const hasApproved = userRequests.some(request => request.status === 'approved');
      setHasApprovedRequest(hasApproved);
      
      // 3. If user has approved requests, fetch other approved requests
      if (hasApproved) {
        const otherRequestsQuery = query(
          collection(db, 'roomSwapRequests'),
          where('status', '==', 'approved'),
          where('userId', '!=', currentUser.uid)
        );
        
        const otherSnapshot = await getDocs(otherRequestsQuery);
        const otherRequests = otherSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setAvailableSwaps(otherRequests);
      }
      
      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [currentUser]);

  // Function to cancel a swap request
  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this room swap request?')) {
      return;
    }
    
    try {
      const requestRef = doc(db, 'roomSwapRequests', requestId);
      await updateDoc(requestRef, {
        status: 'cancelled',
        cancelledAt: new Date()
      });
      
      // Refresh data after cancellation
      fetchData();
      
    } catch (err) {
      console.error('Error cancelling swap request:', err);
      alert('Failed to cancel swap request: ' + err.message);
    }
  };

  // Get request status counts
  const getStatusCount = (status) => {
    return myRequests.filter(req => req.status === status).length;
  };

  const pendingCount = getStatusCount('pending');
  const approvedCount = getStatusCount('approved');
  const rejectedCount = getStatusCount('rejected');

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      
      <Container className="py-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center">
            <div className="bg-info bg-opacity-10 p-2 rounded-circle me-3">
              <i className="bi bi-arrow-left-right text-info fs-4"></i>
            </div>
            <h1 className="mb-0">Room Swap Requests</h1>
          </div>
          
          <Link to="/room-swap-request" className="btn btn-info text-white d-flex align-items-center">
            <i className="bi bi-plus-circle me-2"></i>
            New Request
          </Link>
        </div>
        
        {error && (
          <Alert variant="danger" className="d-flex align-items-center mb-4">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <div>{error}</div>
          </Alert>
        )}
        
        {hasApprovedRequest && (
          <Alert variant="success" className="d-flex align-items-center mb-4">
            <i className="bi bi-check-circle-fill me-2"></i>
            <div>
              Your room swap request has been approved! You can now view and contact other students who want to swap rooms.
              <Button 
                variant="success" 
                size="sm" 
                className="ms-3"
                onClick={() => setActiveTab('available-swaps')}
              >
                View Available Swaps
              </Button>
            </div>
          </Alert>
        )}
        
        <Card className="shadow-sm border-0 mb-4">
          <Card.Header className="bg-white p-0">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-0"
            >
              <Tab 
                eventKey="my-requests" 
                title={
                  <div className="d-flex align-items-center py-2">
                    <i className="bi bi-card-list me-2"></i>
                    My Requests
                    {myRequests.length > 0 && (
                      <Badge bg="info" className="ms-2">{myRequests.length}</Badge>
                    )}
                  </div>
                }
              />
              <Tab 
                eventKey="available-swaps" 
                title={
                  <div className="d-flex align-items-center py-2">
                    <i className="bi bi-people me-2"></i>
                    Available Swaps
                    {availableSwaps.length > 0 && (
                      <Badge bg="success" className="ms-2">{availableSwaps.length}</Badge>
                    )}
                  </div>
                }
                disabled={!hasApprovedRequest}
              />
            </Tabs>
          </Card.Header>
        </Card>
        
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="info" />
            <p className="mt-3 text-muted">Loading data...</p>
          </div>
        ) : activeTab === 'my-requests' ? (
          <>
            <Row className="mb-4">
              <Col md={4} className="mb-3 mb-md-0">
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="d-flex align-items-center">
                    <div className="rounded-circle bg-warning bg-opacity-25 p-3 me-3">
                      <i className="bi bi-clock text-warning fs-4"></i>
                    </div>
                    <div>
                      <h2 className="fw-bold mb-0">{pendingCount}</h2>
                      <p className="text-muted mb-0">Pending</p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={4} className="mb-3 mb-md-0">
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="d-flex align-items-center">
                    <div className="rounded-circle bg-success bg-opacity-25 p-3 me-3">
                      <i className="bi bi-check-circle text-success fs-4"></i>
                    </div>
                    <div>
                      <h2 className="fw-bold mb-0">{approvedCount}</h2>
                      <p className="text-muted mb-0">Approved</p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={4} className="mb-3 mb-md-0">
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="d-flex align-items-center">
                    <div className="rounded-circle bg-danger bg-opacity-25 p-3 me-3">
                      <i className="bi bi-x-circle text-danger fs-4"></i>
                    </div>
                    <div>
                      <h2 className="fw-bold mb-0">{rejectedCount}</h2>
                      <p className="text-muted mb-0">Rejected</p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            {myRequests.length === 0 ? (
              <Card className="border-0 shadow-sm text-center">
                <Card.Body className="py-5">
                  <div className="mb-4">
                    <i className="bi bi-arrow-left-right text-muted display-1"></i>
                  </div>
                  <h3 className="text-muted">No Room Swap Requests</h3>
                  <p className="text-muted mb-4">
                    You haven't made any room swap requests yet.
                  </p>
                  <Link to="/room-swap-request" className="btn btn-info text-white">
                    <i className="bi bi-plus-circle me-2"></i>
                    Request Room Swap
                  </Link>
                </Card.Body>
              </Card>
            ) : (
              <div className="d-flex flex-column gap-4">
                {myRequests.map(request => (
                  <SwapRequestCard
                    key={request.id}
                    request={request}
                    isOwnRequest={true}
                    onCancel={handleCancelRequest}
                  />
                ))}
              </div>
            )}
            
            {approvedCount > 0 && (
              <div className="mt-4 p-3 bg-success bg-opacity-10 rounded text-center">
                <i className="bi bi-check-circle-fill me-2 text-success"></i>
                <span>You have {approvedCount} approved request{approvedCount !== 1 ? 's' : ''}. </span>
                <Button 
                  variant="success" 
                  size="sm" 
                  className="ms-2"
                  onClick={() => setActiveTab('available-swaps')}
                >
                  View Available Swap Partners
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            {!hasApprovedRequest ? (
              <Card className="border-0 shadow-sm text-center">
                <Card.Body className="py-5">
                  <div className="mb-4">
                    <i className="bi bi-lock text-muted display-1"></i>
                  </div>
                  <h3 className="text-muted">Available Swaps Locked</h3>
                  <p className="text-muted mb-4">
                    You need to have at least one approved swap request to view available swaps.
                  </p>
                  {myRequests.length > 0 ? (
                    <p className="text-info">
                      <i className="bi bi-info-circle me-2"></i>
                      Your swap request is still pending approval from the warden.
                    </p>
                  ) : (
                    <Link to="/room-swap-request" className="btn btn-info text-white">
                      <i className="bi bi-plus-circle me-2"></i>
                      Request Room Swap
                    </Link>
                  )}
                </Card.Body>
              </Card>
            ) : availableSwaps.length === 0 ? (
              <Card className="border-0 shadow-sm text-center">
                <Card.Body className="py-5">
                  <div className="mb-4">
                    <i className="bi bi-search text-muted display-1"></i>
                  </div>
                  <h3 className="text-muted">No Available Swaps</h3>
                  <p className="text-muted mb-4">
                    There are currently no other students with approved room swap requests.
                  </p>
                  <p className="text-info">
                    <i className="bi bi-info-circle me-2"></i>
                    Check back later as more students may get their swap requests approved.
                  </p>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={fetchData}
                    className="mt-2"
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Refresh
                  </Button>
                </Card.Body>
              </Card>
            ) : (
              <div className="d-flex flex-column gap-4">
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  The following students are also looking to swap rooms. You can contact them directly to discuss potential room swaps.
                </div>
                
                {availableSwaps.map(swap => (
                  <SwapRequestCard
                    key={swap.id}
                    request={swap}
                    isOwnRequest={false}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
};

export default MySwaps;