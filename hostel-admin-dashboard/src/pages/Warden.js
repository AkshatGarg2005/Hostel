import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Tabs, Tab } from 'react-bootstrap';
import { collection, getDocs, doc, updateDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import Navbar from '../components/common/Navbar';
import LeaveRequestCard from '../components/warden/LeaveRequestCard';
import { useAuth } from '../contexts/AuthContext';

const Warden = () => {
  const { currentUser } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // 'all', 'pending', 'approved', 'rejected'
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      let leaveRequestQuery;

      if (filter === 'all') {
        leaveRequestQuery = query(
          collection(db, 'leaveRequests'),
          orderBy('createdAt', 'desc')
        );
      } else {
        leaveRequestQuery = query(
          collection(db, 'leaveRequests'),
          where('status', '==', filter),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(leaveRequestQuery);
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setLeaveRequests(requests);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, [filter]);

  useEffect(() => {
    // Set the filter based on active tab
    switch(activeTab) {
      case 'pending':
        setFilter('pending');
        break;
      case 'approved':
        setFilter('approved');
        break;
      case 'rejected':
        setFilter('rejected');
        break;
      case 'all':
        setFilter('all');
        break;
      default:
        setFilter('pending');
    }
  }, [activeTab]);

  const handleApprove = async (id, validTillDate) => {
    try {
      const requestRef = doc(db, 'leaveRequests', id);
      await updateDoc(requestRef, {
        status: 'approved',
        approvedBy: currentUser.displayName || currentUser.email,
        approvedById: currentUser.uid,
        approvedAt: new Date(),
        validTill: validTillDate
      });
      
      // Update the local state
      setLeaveRequests(prevRequests => 
        prevRequests.map(request => 
          request.id === id 
            ? { 
                ...request, 
                status: 'approved',
                approvedBy: currentUser.displayName || currentUser.email,
                approvedById: currentUser.uid,
                approvedAt: new Date(),
                validTill: validTillDate
              } 
            : request
        )
      );
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleReject = async (id, rejectionReason) => {
    try {
      const requestRef = doc(db, 'leaveRequests', id);
      await updateDoc(requestRef, {
        status: 'rejected',
        rejectedBy: currentUser.displayName || currentUser.email,
        rejectedById: currentUser.uid,
        rejectedAt: new Date(),
        rejectionReason: rejectionReason || 'No reason provided'
      });
      
      // Update the local state
      setLeaveRequests(prevRequests => 
        prevRequests.map(request => 
          request.id === id 
            ? { 
                ...request, 
                status: 'rejected',
                rejectedBy: currentUser.displayName || currentUser.email,
                rejectedById: currentUser.uid,
                rejectedAt: new Date(),
                rejectionReason: rejectionReason || 'No reason provided'
              } 
            : request
        )
      );
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  // Filter by search term
  const filteredRequests = leaveRequests.filter(request => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (request.studentName && request.studentName.toLowerCase().includes(searchLower)) ||
      (request.regNumber && request.regNumber.toLowerCase().includes(searchLower)) ||
      (request.roomNumber && request.roomNumber.toString().includes(searchLower)) ||
      (request.reason && request.reason.toLowerCase().includes(searchLower))
    );
  });

  // Get counts for each status
  const pendingCount = leaveRequests.filter(req => req.status === 'pending').length;
  const approvedCount = leaveRequests.filter(req => req.status === 'approved').length;
  const rejectedCount = leaveRequests.filter(req => req.status === 'rejected').length;

  return (
    <div className="page-container fade-in">
      <Navbar />
      
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="fs-4 fw-bold mb-0">Warden Dashboard</h1>
        </div>
        
        <Row className="mb-4">
          <Col md={4} className="mb-3 mb-md-0">
            <Card 
              className={`shadow-sm border-0 h-100 ${activeTab === 'pending' ? 'border-warning border-2' : ''}`}
              onClick={() => setActiveTab('pending')} 
              style={{ cursor: 'pointer' }}
            >
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
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <h3 className="fs-2 fw-bold mb-0">{pendingCount}</h3>
                <p className="text-muted">Pending Requests</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4} className="mb-3 mb-md-0">
            <Card 
              className={`shadow-sm border-0 h-100 ${activeTab === 'approved' ? 'border-success border-2' : ''}`}
              onClick={() => setActiveTab('approved')} 
              style={{ cursor: 'pointer' }}
            >
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
                <h3 className="fs-2 fw-bold mb-0">{approvedCount}</h3>
                <p className="text-muted">Approved Requests</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card 
              className={`shadow-sm border-0 h-100 ${activeTab === 'rejected' ? 'border-danger border-2' : ''}`}
              onClick={() => setActiveTab('rejected')} 
              style={{ cursor: 'pointer' }}
            >
              <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                <div className="dashboard-card-icon bg-danger bg-opacity-10 mb-2">
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
                    className="text-danger"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                </div>
                <h3 className="fs-2 fw-bold mb-0">{rejectedCount}</h3>
                <p className="text-muted">Rejected Requests</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Card className="shadow-sm border-0 mb-4">
          <Card.Header className="bg-white p-3">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="border-0"
              fill
            >
              <Tab 
                eventKey="pending" 
                title={
                  <div className="d-flex align-items-center">
                    <span>Pending</span>
                    {pendingCount > 0 && (
                      <Badge bg="warning" className="ms-2 rounded-pill">{pendingCount}</Badge>
                    )}
                  </div>
                }
              />
              <Tab 
                eventKey="approved" 
                title={
                  <div className="d-flex align-items-center">
                    <span>Approved</span>
                    {approvedCount > 0 && (
                      <Badge bg="success" className="ms-2 rounded-pill">{approvedCount}</Badge>
                    )}
                  </div>
                }
              />
              <Tab 
                eventKey="rejected" 
                title={
                  <div className="d-flex align-items-center">
                    <span>Rejected</span>
                    {rejectedCount > 0 && (
                      <Badge bg="danger" className="ms-2 rounded-pill">{rejectedCount}</Badge>
                    )}
                  </div>
                }
              />
              <Tab eventKey="all" title="All Requests" />
            </Tabs>
          </Card.Header>
          <Card.Body className="p-3">
            <Form.Group className="mb-3">
              <Form.Control
                type="search"
                placeholder="Search by name, registration number, room number, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="shadow-sm"
              />
            </Form.Group>
          </Card.Body>
        </Card>
        
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Loading leave requests...</p>
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
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <h3 className="fs-5 mt-3">No leave requests found</h3>
            <p className="empty-state-text">
              {searchTerm 
                ? 'Try a different search term to see more results.' 
                : `There are no ${filter !== 'all' ? filter : ''} leave requests at the moment.`}
            </p>
            {searchTerm && (
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => setSearchTerm('')}
                className="mt-2"
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="mb-2 text-muted small">
            Showing {filteredRequests.length} {activeTab !== 'all' ? activeTab : ''} leave requests
          </div>
        )}
        
        {!loading && filteredRequests.map(request => (
          <LeaveRequestCard
            key={request.id}
            request={request}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ))}
      </Container>
    </div>
  );
};

export default Warden;