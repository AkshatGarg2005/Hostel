import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';
import LeaveRequestCard from '../components/leave/LeaveRequestCard';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';

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

  return (
    <>
      <Navbar />
      
      <Container className="py-4">
        <h1 className="mb-4">My Leave Requests</h1>
        
        <Card className="mb-4">
          <Card.Body>
            <Row>
              <Col md={filter === 'all' ? 12 : 6}>
                <Form.Group>
                  <Form.Label>Filter by Status</Form.Label>
                  <Form.Select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="mb-3 mb-md-0"
                  >
                    <option value="all">All Requests</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              {process.env.NODE_ENV === 'development' && (
                <Col md={6} className="d-flex align-items-end">
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={addTestLeaveRequest}
                    className="w-100"
                  >
                    Add Test Leave Request (Debug Only)
                  </Button>
                </Col>
              )}
            </Row>
          </Card.Body>
        </Card>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3">Loading your leave requests...</p>
          </div>
        ) : leaveRequests.length === 0 ? (
          <Card>
            <Card.Body>
              <div className="text-center">
                <p className="mb-3">You have no leave requests yet</p>
                <Button 
                  as="a" 
                  href="/leave-request" 
                  variant="primary"
                >
                  Request Leave
                </Button>
              </div>
              
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-3 bg-light rounded">
                  <h6>Debug Information:</h6>
                  <p className="mb-1">User ID: {debugInfo.userId || 'Not available'}</p>
                  <p className="mb-1">Query returned: {debugInfo.requestCount} requests</p>
                </div>
              )}
            </Card.Body>
          </Card>
        ) : (
          <div>
            {leaveRequests.map(request => (
              <LeaveRequestCard
                key={request.id}
                request={request}
              />
            ))}
          </div>
        )}
      </Container>
    </>
  );
};

export default MyLeaves;