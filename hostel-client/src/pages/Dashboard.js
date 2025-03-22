import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';
import { Container, Row, Col, Card, Badge, Alert } from 'react-bootstrap';

const Dashboard = () => {
  const { currentUser, userDetails } = useAuth();
  const [stats, setStats] = useState({
    pendingServices: 0,
    pendingLeaves: 0,
    attendance: {
      total: 0,
      present: 0,
      absent: 0,
      percentage: 0,
      markedToday: false
    }
  });
  const [latestMenu, setLatestMenu] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Get pending service requests
        const serviceRequestsQuery = query(
          collection(db, 'serviceRequests'),
          where('userId', '==', currentUser.uid),
          where('status', '==', 'pending')
        );
        const serviceSnapshots = await getDocs(serviceRequestsQuery);
        
        // Get pending leave requests
        const leaveRequestsQuery = query(
          collection(db, 'leaveRequests'),
          where('userId', '==', currentUser.uid),
          where('status', '==', 'pending')
        );
        const leaveSnapshots = await getDocs(leaveRequestsQuery);
        
        // Get latest mess menu
        const menuQuery = query(
          collection(db, 'messMenu'),
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        const menuSnapshot = await getDocs(menuQuery);
        
        if (!menuSnapshot.empty) {
          setLatestMenu({
            id: menuSnapshot.docs[0].id,
            ...menuSnapshot.docs[0].data()
          });
        }
        
        // Get attendance data (last 30 days)
        const attendanceQuery = query(
          collection(db, 'attendance'),
          where('userId', '==', currentUser.uid),
          orderBy('date', 'desc'),
          limit(30)
        );
        const attendanceSnapshot = await getDocs(attendanceQuery);
        const attendanceRecords = attendanceSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Calculate attendance stats
        const totalRecords = attendanceRecords.length;
        const presentRecords = attendanceRecords.filter(record => record.status === 'present').length;
        const absentRecords = attendanceRecords.filter(record => record.status === 'absent').length;
        const attendancePercentage = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0;
        
        // Check if attendance is marked for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const markedToday = attendanceRecords.some(record => {
          if (!record.date) return false;
          const recordDate = record.date.toDate();
          return recordDate >= today && recordDate < tomorrow;
        });
        
        setStats({
          pendingServices: serviceSnapshots.size,
          pendingLeaves: leaveSnapshots.size,
          attendance: {
            total: totalRecords,
            present: presentRecords,
            absent: absentRecords,
            percentage: attendancePercentage.toFixed(2),
            markedToday
          }
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const renderDailyMenu = () => {
    if (!latestMenu || latestMenu.type !== 'daily') return null;
    
    return (
      <Card className="shadow-sm border-0 mb-4 h-100">
        <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Today's Menu ({formatDate(latestMenu.createdAt)})</h5>
          <Link to="/mess-menu" className="text-primary text-decoration-none">
            View Full Menu
          </Link>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6} className="mb-3">
              <Card className="border-0 bg-light h-100">
                <Card.Body>
                  <h6 className="text-primary mb-2">
                    <i className="bi bi-sunrise me-2"></i>Breakfast
                  </h6>
                  <p className="mb-0">{latestMenu.breakfast}</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} className="mb-3">
              <Card className="border-0 bg-light h-100">
                <Card.Body>
                  <h6 className="text-warning mb-2">
                    <i className="bi bi-sun me-2"></i>Lunch
                  </h6>
                  <p className="mb-0">{latestMenu.lunch}</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} className="mb-3">
              <Card className="border-0 bg-light h-100">
                <Card.Body>
                  <h6 className="text-info mb-2">
                    <i className="bi bi-cup-hot me-2"></i>Snacks
                  </h6>
                  <p className="mb-0">{latestMenu.snacks}</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} className="mb-3">
              <Card className="border-0 bg-light h-100">
                <Card.Body>
                  <h6 className="text-dark mb-2">
                    <i className="bi bi-moon me-2"></i>Dinner
                  </h6>
                  <p className="mb-0">{latestMenu.dinner}</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  const renderWeeklyMenuPreview = () => {
    if (!latestMenu || latestMenu.type !== 'weekly') return null;
    
    // Get current day of the week
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    
    return (
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Today's Menu (from Weekly Schedule)</h5>
          <Link to="/mess-menu" className="text-primary text-decoration-none">
            View Full Menu
          </Link>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6} className="mb-3">
              <Card className="border-0 bg-light h-100">
                <Card.Body>
                  <h6 className="text-primary mb-2">
                    <i className="bi bi-sunrise me-2"></i>Breakfast
                  </h6>
                  <p className="mb-0">{latestMenu[today]?.breakfast || 'Not available'}</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} className="mb-3">
              <Card className="border-0 bg-light h-100">
                <Card.Body>
                  <h6 className="text-warning mb-2">
                    <i className="bi bi-sun me-2"></i>Lunch
                  </h6>
                  <p className="mb-0">{latestMenu[today]?.lunch || 'Not available'}</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} className="mb-3">
              <Card className="border-0 bg-light h-100">
                <Card.Body>
                  <h6 className="text-info mb-2">
                    <i className="bi bi-cup-hot me-2"></i>Snacks
                  </h6>
                  <p className="mb-0">{latestMenu[today]?.snacks || 'Not available'}</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} className="mb-3">
              <Card className="border-0 bg-light h-100">
                <Card.Body>
                  <h6 className="text-dark mb-2">
                    <i className="bi bi-moon me-2"></i>Dinner
                  </h6>
                  <p className="mb-0">{latestMenu[today]?.dinner || 'Not available'}</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  // Get attendance status color
  const getAttendanceStatusColor = (percentage) => {
    if (percentage >= 75) return 'success';
    if (percentage >= 60) return 'warning';
    return 'danger';
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="fw-bold">Welcome, {userDetails?.name}</h1>
          <h6 className="text-muted mb-0">Room: {userDetails?.roomNumber}</h6>
        </div>
        
        {!stats.attendance.markedToday && (
          <Alert variant="info" className="d-flex align-items-center mb-4">
            <i className="bi bi-info-circle-fill me-2 fs-5"></i>
            <div className="flex-grow-1">
              You haven't marked your attendance today.
            </div>
            <Link to="/attendance" className="btn btn-primary btn-sm ms-auto">
              Mark Attendance
            </Link>
          </Alert>
        )}
        
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-grow text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading your dashboard...</p>
          </div>
        ) : (
          <>
            <Row className="mb-4">
              {/* Pending Services Card */}
              <Col md={6} lg={3} className="mb-4">
                <Card className="shadow-sm border-0 h-100 dashboard-stat-card">
                  <Card.Body className="d-flex align-items-center">
                    <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                      <i className="bi bi-tools text-primary fs-4"></i>
                    </div>
                    <div>
                      <h2 className="fw-bold mb-0">{stats.pendingServices}</h2>
                      <p className="text-muted mb-0">Pending Services</p>
                    </div>
                  </Card.Body>
                  <Card.Footer className="bg-white border-top-0">
                    <Link to="/my-services" className="text-decoration-none d-block text-center text-primary">
                      View Requests <i className="bi bi-arrow-right"></i>
                    </Link>
                  </Card.Footer>
                </Card>
              </Col>
              
              {/* Pending Leaves Card */}
              <Col md={6} lg={3} className="mb-4">
                <Card className="shadow-sm border-0 h-100 dashboard-stat-card">
                  <Card.Body className="d-flex align-items-center">
                    <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                      <i className="bi bi-calendar2-check text-success fs-4"></i>
                    </div>
                    <div>
                      <h2 className="fw-bold mb-0">{stats.pendingLeaves}</h2>
                      <p className="text-muted mb-0">Pending Leaves</p>
                    </div>
                  </Card.Body>
                  <Card.Footer className="bg-white border-top-0">
                    <Link to="/my-leaves" className="text-decoration-none d-block text-center text-success">
                      View Requests <i className="bi bi-arrow-right"></i>
                    </Link>
                  </Card.Footer>
                </Card>
              </Col>
              
              {/* Attendance Card */}
              <Col md={6} lg={3} className="mb-4">
                <Card className="shadow-sm border-0 h-100 dashboard-stat-card">
                  <Card.Body className="d-flex align-items-center">
                    <div className={`rounded-circle bg-${getAttendanceStatusColor(stats.attendance.percentage)} bg-opacity-10 p-3 me-3`}>
                      <i className={`bi bi-person-check text-${getAttendanceStatusColor(stats.attendance.percentage)} fs-4`}></i>
                    </div>
                    <div>
                      <h2 className="fw-bold mb-0">{stats.attendance.percentage}%</h2>
                      <p className="text-muted mb-0">Attendance Rate</p>
                    </div>
                  </Card.Body>
                  <Card.Footer className="bg-white border-top-0">
                    <Link to="/attendance" className="text-decoration-none d-block text-center text-primary">
                      View Attendance <i className="bi bi-arrow-right"></i>
                    </Link>
                  </Card.Footer>
                </Card>
              </Col>
              
              {/* Quick Actions Card */}
              <Col md={6} lg={3} className="mb-4">
                <Card className="shadow-sm border-0 h-100">
                  <Card.Header className="bg-white border-bottom">
                    <h5 className="mb-0">Quick Actions</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row className="g-3">
                      <Col xs={6}>
                        <Link to="/service-request" className="text-decoration-none">
                          <Card className="text-center h-100 border-0 bg-primary bg-opacity-10 quick-action-card">
                            <Card.Body className="p-3">
                              <i className="bi bi-tools text-primary fs-3 mb-2"></i>
                              <p className="mb-0 text-primary fw-medium small">Request Service</p>
                            </Card.Body>
                          </Card>
                        </Link>
                      </Col>
                      
                      <Col xs={6}>
                        <Link to="/mess-complaint" className="text-decoration-none">
                          <Card className="text-center h-100 border-0 bg-warning bg-opacity-10 quick-action-card">
                            <Card.Body className="p-3">
                              <i className="bi bi-chat-square-text text-warning fs-3 mb-2"></i>
                              <p className="mb-0 text-warning fw-medium small">Mess Complaint</p>
                            </Card.Body>
                          </Card>
                        </Link>
                      </Col>
                      
                      <Col xs={6}>
                        <Link to="/leave-request" className="text-decoration-none">
                          <Card className="text-center h-100 border-0 bg-success bg-opacity-10 quick-action-card">
                            <Card.Body className="p-3">
                              <i className="bi bi-box-arrow-right text-success fs-3 mb-2"></i>
                              <p className="mb-0 text-success fw-medium small">Request Leave</p>
                            </Card.Body>
                          </Card>
                        </Link>
                      </Col>
                      
                      <Col xs={6}>
                        <Link to="/attendance" className="text-decoration-none">
                          <Card className="text-center h-100 border-0 bg-info bg-opacity-10 quick-action-card">
                            <Card.Body className="p-3">
                              <i className="bi bi-person-check text-info fs-3 mb-2"></i>
                              <p className="mb-0 text-info fw-medium small">Mark Attendance</p>
                            </Card.Body>
                          </Card>
                        </Link>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            {/* Attendance Summary */}
            <Card className="shadow-sm border-0 mb-4">
              <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Attendance Summary</h5>
                <Link to="/attendance" className="text-primary text-decoration-none">
                  View Details
                </Link>
              </Card.Header>
              <Card.Body className="p-3">
                <Row>
                  <Col md={3} className="mb-3 mb-md-0">
                    <div className="text-center">
                      <div className={`rounded-circle mx-auto d-flex align-items-center justify-content-center bg-${getAttendanceStatusColor(stats.attendance.percentage)} bg-opacity-10 text-${getAttendanceStatusColor(stats.attendance.percentage)}`} style={{width: '80px', height: '80px'}}>
                        <h3 className="mb-0">{stats.attendance.percentage}%</h3>
                      </div>
                      <p className="mt-2 mb-0 fw-medium">Overall Rate</p>
                    </div>
                  </Col>
                  
                  <Col md={3} className="mb-3 mb-md-0">
                    <div className="text-center">
                      <div className="rounded-circle mx-auto d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary" style={{width: '80px', height: '80px'}}>
                        <h3 className="mb-0">{stats.attendance.total}</h3>
                      </div>
                      <p className="mt-2 mb-0 fw-medium">Total Days</p>
                    </div>
                  </Col>
                  
                  <Col md={3} className="mb-3 mb-md-0">
                    <div className="text-center">
                      <div className="rounded-circle mx-auto d-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success" style={{width: '80px', height: '80px'}}>
                        <h3 className="mb-0">{stats.attendance.present}</h3>
                      </div>
                      <p className="mt-2 mb-0 fw-medium">Present Days</p>
                    </div>
                  </Col>
                  
                  <Col md={3}>
                    <div className="text-center">
                      <div className="rounded-circle mx-auto d-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger" style={{width: '80px', height: '80px'}}>
                        <h3 className="mb-0">{stats.attendance.absent}</h3>
                      </div>
                      <p className="mt-2 mb-0 fw-medium">Absent Days</p>
                    </div>
                  </Col>
                </Row>
                
                <div className="text-center mt-3">
                  <Badge 
                    bg={stats.attendance.markedToday ? 'success' : 'warning'} 
                    className="py-2 px-3"
                  >
                    {stats.attendance.markedToday ? 'Attendance marked for today' : 'Attendance not marked for today'}
                  </Badge>
                  
                  {!stats.attendance.markedToday && (
                    <div className="mt-2">
                      <Link to="/attendance" className="btn btn-primary btn-sm">
                        Mark Attendance Now
                      </Link>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
            
            {latestMenu ? (
              latestMenu.type === 'daily' ? renderDailyMenu() : renderWeeklyMenuPreview()
            ) : (
              <Card className="shadow-sm border-0 text-center">
                <Card.Body className="py-5">
                  <i className="bi bi-calendar-x text-muted fs-1 mb-3"></i>
                  <p className="text-muted">No mess menu available at the moment</p>
                </Card.Body>
              </Card>
            )}
          </>
        )}
      </Container>
    </div>
  );
};

export default Dashboard;