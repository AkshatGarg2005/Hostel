import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Container, Row, Col, Card } from 'react-bootstrap';
import Navbar from '../components/common/Navbar';

const Dashboard = () => {
  const { userRole, currentUser } = useAuth();
  const [stats, setStats] = useState({
    serviceRequests: 0,
    messComplaints: 0,
    leaveRequests: 0,
    totalStudents: 0,
    attendanceToday: 0,
    attendanceRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [greetingTime, setGreetingTime] = useState('');

  useEffect(() => {
    // Set greeting based on time of day
    const getCurrentGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Good morning';
      if (hour < 18) return 'Good afternoon';
      return 'Good evening';
    };
    
    setGreetingTime(getCurrentGreeting());
    
    const fetchStats = async () => {
      try {
        // Get service requests count
        const serviceRequestsQuery = query(
          collection(db, 'serviceRequests'),
          where('status', '==', 'pending')
        );
        const serviceSnapshots = await getDocs(serviceRequestsQuery);
        
        // Get mess complaints count
        const messComplaintsQuery = query(
          collection(db, 'messComplaints'),
          where('status', '==', 'pending')
        );
        const messSnapshots = await getDocs(messComplaintsQuery);
        
        // Get leave requests count
        const leaveRequestsQuery = query(
          collection(db, 'leaveRequests'),
          where('status', '==', 'pending')
        );
        const leaveSnapshots = await getDocs(leaveRequestsQuery);
        
        // Get total students count
        const studentsQuery = query(
          collection(db, 'students')
        );
        const studentsSnapshots = await getDocs(studentsQuery);
        const totalStudents = studentsSnapshots.size;
        
        // Get today's attendance count
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const attendanceQuery = query(
          collection(db, 'attendance'),
          where('date', '>=', today),
          where('date', '<', tomorrow),
          where('status', '==', 'present')
        );
        const attendanceSnapshots = await getDocs(attendanceQuery);
        const presentToday = attendanceSnapshots.size;
        
        // Calculate absent count correctly
        const absentToday = totalStudents - presentToday;
        
        // Calculate attendance rate correctly - using total students as denominator
        const attendanceRate = totalStudents > 0 
          ? (presentToday / totalStudents) * 100 
          : 0;
        
        setStats({
          serviceRequests: serviceSnapshots.size,
          messComplaints: messSnapshots.size,
          leaveRequests: leaveSnapshots.size,
          totalStudents: totalStudents,
          attendanceToday: presentToday,
          absentToday: absentToday,
          attendanceRate: attendanceRate.toFixed(2)
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const DashboardCard = ({ title, count, icon, color, bgColor, linkTo, allowed }) => {
    if (!allowed) return null;
    
    return (
      <Col xs={12} md={6} lg={4} className="mb-4">
        <Link to={linkTo} className="text-decoration-none">
          <Card className="dashboard-card h-100 border-0">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className={`dashboard-card-icon ${bgColor}`}>
                  {icon}
                </div>
                <span className={`status-badge ${count > 0 ? 'badge-pending' : 'badge-resolved'}`}>
                  {count > 0 ? 'Pending' : 'None pending'}
                </span>
              </div>
              <div>
                <h3 className="dashboard-card-count">{count}</h3>
                <p className="dashboard-card-title">{title}</p>
              </div>
            </Card.Body>
          </Card>
        </Link>
      </Col>
    );
  };

  const AttendanceCard = ({ title, count, total, icon, color, bgColor, linkTo, allowed }) => {
    if (!allowed) return null;
    
    const percentage = parseFloat(stats.attendanceRate) || 0;
    
    return (
      <Col xs={12} md={6} lg={4} className="mb-4">
        <Link to={linkTo} className="text-decoration-none">
          <Card className="dashboard-card h-100 border-0">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className={`dashboard-card-icon ${bgColor}`}>
                  {icon}
                </div>
                <span className={`status-badge ${percentage >= 70 ? 'badge-approved' : percentage >= 50 ? 'badge-pending' : 'badge-rejected'}`}>
                  {percentage}%
                </span>
              </div>
              <div>
                <h3 className="dashboard-card-count">{count} / {total}</h3>
                <p className="dashboard-card-title">{title}</p>
              </div>
            </Card.Body>
          </Card>
        </Link>
      </Col>
    );
  };

  return (
    <div className="page-container fade-in">
      <Navbar />
      
      <Container className="py-4">
        <div className="mb-4">
          <h1 className="fs-4 fw-bold mb-1">
            {greetingTime}, {currentUser?.displayName || 'Administrator'}
          </h1>
          <p className="text-muted">
            Here's what's happening in your hostel today
          </p>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Loading dashboard data...</p>
          </div>
        ) : (
          <Row>
            <DashboardCard
              title="Service Requests"
              count={stats.serviceRequests}
              icon={
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
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                </svg>
              }
              color="text-primary"
              bgColor="bg-primary bg-opacity-10"
              linkTo="/service-manager"
              allowed={userRole === 'admin' || userRole === 'service_manager'}
            />
            
            <DashboardCard
              title="Mess Complaints"
              count={stats.messComplaints}
              icon={
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
                  <path d="M3 7v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7"></path>
                  <line x1="12" y1="12" x2="12" y2="12"></line>
                  <polyline points="8 7 8 3 16 3 16 7"></polyline>
                </svg>
              }
              color="text-warning"
              bgColor="bg-warning bg-opacity-10"
              linkTo="/mess-manager"
              allowed={userRole === 'admin' || userRole === 'mess_manager'}
            />
            
            <DashboardCard
              title="Leave Requests"
              count={stats.leaveRequests}
              icon={
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
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              }
              color="text-success"
              bgColor="bg-success bg-opacity-10"
              linkTo="/warden"
              allowed={userRole === 'admin' || userRole === 'warden'}
            />
            
            <AttendanceCard
              title="Today's Attendance"
              count={stats.attendanceToday}
              total={stats.totalStudents}
              icon={
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
                  className="text-info"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              }
              color="text-info"
              bgColor="bg-info bg-opacity-10"
              linkTo="/security-manager"
              allowed={userRole === 'admin' || userRole === 'security_manager'}
            />
          </Row>
        )}
        
        {/* Quick Access Section */}
        <div className="mt-5">
          <h2 className="fs-5 fw-semibold mb-3">Quick Access</h2>
          <Row>
            {(userRole === 'admin' || userRole === 'service_manager') && (
              <Col xs={12} sm={6} md={4} lg={3} className="mb-3">
                <Link to="/service-manager" className="text-decoration-none">
                  <Card className="custom-card h-100">
                    <Card.Body className="p-3 d-flex align-items-center">
                      <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-primary"
                        >
                          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                        </svg>
                      </div>
                      <span className="fw-medium">Manage Services</span>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>
            )}
            
            {(userRole === 'admin' || userRole === 'mess_manager') && (
              <Col xs={12} sm={6} md={4} lg={3} className="mb-3">
                <Link to="/mess-manager" className="text-decoration-none">
                  <Card className="custom-card h-100">
                    <Card.Body className="p-3 d-flex align-items-center">
                      <div className="bg-warning bg-opacity-10 p-2 rounded-circle me-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-warning"
                        >
                          <path d="M3 7v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7"></path>
                          <line x1="12" y1="12" x2="12" y2="12"></line>
                          <polyline points="8 7 8 3 16 3 16 7"></polyline>
                        </svg>
                      </div>
                      <span className="fw-medium">Mess Management</span>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>
            )}
            
            {(userRole === 'admin' || userRole === 'warden') && (
              <Col xs={12} sm={6} md={4} lg={3} className="mb-3">
                <Link to="/warden" className="text-decoration-none">
                  <Card className="custom-card h-100">
                    <Card.Body className="p-3 d-flex align-items-center">
                      <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-success"
                        >
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                      </div>
                      <span className="fw-medium">Leave Approvals</span>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>
            )}
            
            {(userRole === 'admin' || userRole === 'security_manager') && (
              <Col xs={12} sm={6} md={4} lg={3} className="mb-3">
                <Link to="/security-manager" className="text-decoration-none">
                  <Card className="custom-card h-100">
                    <Card.Body className="p-3 d-flex align-items-center">
                      <div className="bg-info bg-opacity-10 p-2 rounded-circle me-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-info"
                        >
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                      </div>
                      <span className="fw-medium">Attendance</span>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>
            )}
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default Dashboard;