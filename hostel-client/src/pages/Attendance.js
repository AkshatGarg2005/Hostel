import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Tabs, Tab, Spinner } from 'react-bootstrap';

const Attendance = () => {
  const { currentUser, userDetails } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('mark');
  const [filter, setFilter] = useState('all'); // 'all', 'present', 'absent'
  const [attendanceStats, setAttendanceStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    percentage: 0
  });
  
  // Check if self-marking is allowed for today
  const [canMarkToday, setCanMarkToday] = useState(true);

  // Fetch attendance records
  const fetchAttendanceRecords = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Query to get user's attendance records
      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('userId', '==', currentUser.uid),
        orderBy('date', 'desc'),
        limit(30) // Last 30 days
      );
      
      const querySnapshot = await getDocs(attendanceQuery);
      const records = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setAttendanceRecords(records);
      
      // Check if the user has already marked attendance for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const hasTodayRecord = records.some(record => {
        const recordDate = record.date.toDate();
        return recordDate >= today && recordDate < tomorrow;
      });
      
      setCanMarkToday(!hasTodayRecord);
      
      // Calculate attendance stats
      const totalRecords = records.length;
      const presentRecords = records.filter(record => record.status === 'present').length;
      const absentRecords = records.filter(record => record.status === 'absent').length;
      const attendancePercentage = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0;
      
      setAttendanceStats({
        total: totalRecords,
        present: presentRecords,
        absent: absentRecords,
        percentage: attendancePercentage.toFixed(2)
      });
      
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      setError('Failed to load attendance records: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceRecords();
  }, [currentUser]);

  // Mark attendance
  const handleMarkAttendance = async () => {
    if (!currentUser || !userDetails) {
      setError('You must be logged in to mark attendance');
      return;
    }
    
    try {
      setMarkingAttendance(true);
      setError('');
      
      // Check if the user has already marked attendance for today
      if (!canMarkToday) {
        setError('You have already marked your attendance for today');
        return;
      }
      
      // Create attendance record
      const attendanceData = {
        userId: currentUser.uid,
        studentName: userDetails.name,
        regNumber: userDetails.regNumber,
        roomNumber: userDetails.roomNumber,
        date: new Date(),
        status: 'present', // Student self-marking is always "present"
        selfMarked: true,
        notes: 'Self-marked by student',
        createdAt: serverTimestamp()
      };
      
      // Add to Firestore
      await addDoc(collection(db, 'attendance'), attendanceData);
      
      // Show success message
      setSuccess('Your attendance has been marked successfully!');
      
      // Refresh attendance records
      fetchAttendanceRecords();
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (error) {
      console.error('Error marking attendance:', error);
      setError('Failed to mark attendance: ' + error.message);
    } finally {
      setMarkingAttendance(false);
    }
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Filter attendance records
  const filteredRecords = attendanceRecords.filter(record => {
    if (filter === 'all') return true;
    return record.status === filter;
  });

  // Get attendance status color
  const getStatusColor = (percentage) => {
    if (percentage >= 75) return 'success';
    if (percentage >= 60) return 'warning';
    return 'danger';
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      
      <Container className="py-4">
        <div className="d-flex align-items-center mb-4">
          <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
            <i className="bi bi-calendar-check text-primary fs-4"></i>
          </div>
          <h1 className="mb-0">Attendance</h1>
        </div>
        
        <Row className="mb-4">
          <Col md={6} lg={3} className="mb-3 mb-lg-0">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="d-flex align-items-center">
                <div className="rounded-circle bg-primary bg-opacity-25 p-3 me-3">
                  <i className="bi bi-calendar text-primary fs-4"></i>
                </div>
                <div>
                  <h2 className="fw-bold mb-0">{attendanceStats.total}</h2>
                  <p className="text-muted mb-0">Total Days</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6} lg={3} className="mb-3 mb-lg-0">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="d-flex align-items-center">
                <div className="rounded-circle bg-success bg-opacity-25 p-3 me-3">
                  <i className="bi bi-check-circle text-success fs-4"></i>
                </div>
                <div>
                  <h2 className="fw-bold mb-0">{attendanceStats.present}</h2>
                  <p className="text-muted mb-0">Present Days</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6} lg={3} className="mb-3 mb-lg-0">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="d-flex align-items-center">
                <div className="rounded-circle bg-danger bg-opacity-25 p-3 me-3">
                  <i className="bi bi-x-circle text-danger fs-4"></i>
                </div>
                <div>
                  <h2 className="fw-bold mb-0">{attendanceStats.absent}</h2>
                  <p className="text-muted mb-0">Absent Days</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6} lg={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="d-flex align-items-center">
                <div className={`rounded-circle bg-${getStatusColor(attendanceStats.percentage)} bg-opacity-25 p-3 me-3`}>
                  <i className={`bi bi-percent text-${getStatusColor(attendanceStats.percentage)} fs-4`}></i>
                </div>
                <div>
                  <h2 className="fw-bold mb-0">{attendanceStats.percentage}%</h2>
                  <p className="text-muted mb-0">Attendance Rate</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Card className="border-0 shadow-sm mb-4">
          <Card.Header className="bg-white p-0">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-0"
            >
              <Tab eventKey="mark" title="Mark Attendance" />
              <Tab eventKey="history" title="Attendance History" />
            </Tabs>
          </Card.Header>
          
          <Card.Body className="p-4">
            {activeTab === 'mark' && (
              <>
                {error && (
                  <Alert variant="danger" className="d-flex align-items-center mb-4">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>{error}</div>
                  </Alert>
                )}
                
                {success && (
                  <Alert variant="success" className="d-flex align-items-center mb-4">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    <div>{success}</div>
                  </Alert>
                )}
                
                <Card className="bg-light border-0">
                  <Card.Body className="p-4 text-center">
                    <h4 className="mb-3">Mark Your Attendance</h4>
                    <p className="mb-4">
                      Click the button below to mark your attendance for today.
                      <br />
                      <small className="text-muted">Current Date: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</small>
                    </p>
                    
                    <Button
                      variant="primary"
                      size="lg"
                      className="px-5 py-3"
                      onClick={handleMarkAttendance}
                      disabled={markingAttendance || !canMarkToday}
                    >
                      {markingAttendance ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          {canMarkToday ? 'Mark Present' : 'Already Marked'}
                        </>
                      )}
                    </Button>
                    
                    {!canMarkToday && !error && (
                      <Alert variant="info" className="mt-4 mb-0 d-inline-block">
                        <i className="bi bi-info-circle me-2"></i>
                        You have already marked your attendance for today.
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
                
                <div className="alert alert-warning mt-4">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <strong>Important:</strong> Marking false attendance is a violation of hostel rules and may result in disciplinary action.
                </div>
              </>
            )}
            
            {activeTab === 'history' && (
              <>
                <div className="d-flex justify-content-between mb-3">
                  <div className="d-flex">
                    <Button
                      variant={filter === 'all' ? 'primary' : 'outline-primary'}
                      size="sm"
                      className="me-2"
                      onClick={() => setFilter('all')}
                    >
                      All
                    </Button>
                    <Button
                      variant={filter === 'present' ? 'success' : 'outline-success'}
                      size="sm"
                      className="me-2"
                      onClick={() => setFilter('present')}
                    >
                      Present
                    </Button>
                    <Button
                      variant={filter === 'absent' ? 'danger' : 'outline-danger'}
                      size="sm"
                      onClick={() => setFilter('absent')}
                    >
                      Absent
                    </Button>
                  </div>
                </div>
                
                {loading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Loading attendance records...</p>
                  </div>
                ) : filteredRecords.length === 0 ? (
                  <div className="text-center py-5 bg-light rounded">
                    <i className="bi bi-calendar-x display-4 text-muted"></i>
                    <h4 className="mt-3 text-muted">No Attendance Records</h4>
                    <p className="text-muted">
                      {filter === 'all' 
                        ? "You don't have any attendance records yet." 
                        : `You don't have any ${filter} records.`}
                    </p>
                  </div>
                ) : (
                  <div className="list-group">
                    {filteredRecords.map(record => (
                      <div key={record.id} className="list-group-item list-group-item-action border-0 shadow-sm mb-3">
                        <div className="d-flex w-100 justify-content-between align-items-center">
                          <div>
                            <h5 className="mb-1">{formatDate(record.date)}</h5>
                            <p className="mb-1 text-muted">
                              <small>
                                {record.selfMarked 
                                  ? 'Self-marked' 
                                  : `Marked by: ${record.verifierName || 'Security'}`}
                              </small>
                            </p>
                          </div>
                          <Badge 
                            bg={record.status === 'present' ? 'success' : 'danger'}
                            className="py-2 px-3"
                          >
                            {record.status === 'present' ? 'Present' : 'Absent'}
                          </Badge>
                        </div>
                        {record.notes && (
                          <small className="text-muted d-block mt-2">
                            <strong>Notes:</strong> {record.notes}
                          </small>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Attendance;