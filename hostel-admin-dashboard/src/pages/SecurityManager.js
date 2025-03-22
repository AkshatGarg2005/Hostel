import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Tabs, Tab, Alert, Spinner } from 'react-bootstrap';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, orderBy, where, addDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import Navbar from '../components/common/Navbar';
import AttendanceCard from '../components/security-manager/AttendanceCard';
import SecurityDashboard from '../components/security-manager/SecurityDashboard';
import { useAuth } from '../contexts/AuthContext';

const SecurityManager = () => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'present', 'absent'
  
  // Stats
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    attendanceRate: 0
  });

  // Fetch students - this only needs to be done once
  const fetchStudents = async () => {
    try {
      const studentsQuery = query(
        collection(db, 'students'),
        orderBy('roomNumber')
      );
      
      const querySnapshot = await getDocs(studentsQuery);
      const studentsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isPresent: false,
        notes: ''
      }));
      
      setStudents(studentsList);
      return studentsList;
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students: ' + error.message);
      return [];
    }
  };

  // Fetch attendance for a specific date
  const fetchAttendanceForDate = async (date, studentsList) => {
    try {
      // Use the passed studentsList or the current state
      const currentStudents = studentsList || students;
      const totalStudents = currentStudents.length;
      
      // Convert date string to Date objects for query
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('date', '>=', startDate),
        where('date', '<=', endDate)
      );
      
      const querySnapshot = await getDocs(attendanceQuery);
      const attendanceList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Count students present
      const presentCount = attendanceList.filter(a => a.status === 'present').length;
      
      // Calculate absent as total - present
      const absentCount = totalStudents - presentCount;
      
      // Calculate attendance rate
      const attendanceRate = totalStudents > 0 
        ? (presentCount / totalStudents) * 100 
        : 0;
      
      // Update the stats
      setStats({
        totalStudents,
        presentToday: presentCount,
        absentToday: absentCount,
        attendanceRate: attendanceRate.toFixed(2)
      });
      
      setAttendance(attendanceList);
      
      // Pre-populate student attendance status for the attendance form
      if (activeTab === 'take-attendance') {
        const updatedStudents = currentStudents.map(student => {
          const existingAttendance = attendanceList.find(a => a.userId === student.id);
          return {
            ...student,
            isPresent: existingAttendance ? existingAttendance.status === 'present' : false,
            notes: existingAttendance ? existingAttendance.notes || '' : '',
            attendanceId: existingAttendance ? existingAttendance.id : null
          };
        });
        
        setStudents(updatedStudents);
      }
      
      return { attendanceList, totalStudents, presentCount, absentCount };
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setError('Failed to load attendance data: ' + error.message);
      return null;
    }
  };

  // Initialize data
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        // First, get all students
        const studentsList = await fetchStudents();
        
        // Then, fetch attendance for today
        if (studentsList.length > 0) {
          await fetchAttendanceForDate(dateFilter, studentsList);
        }
      } catch (err) {
        console.error("Error initializing data:", err);
        setError("Failed to initialize data: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    initData();
  }, []); // Only run once on component mount

  // Handle date or tab changes
  useEffect(() => {
    const updateData = async () => {
      if (students.length > 0) {
        setLoading(true);
        try {
          await fetchAttendanceForDate(dateFilter, students);
        } catch (err) {
          console.error("Error updating data:", err);
        } finally {
          setLoading(false);
        }
      }
    };
    
    updateData();
  }, [dateFilter, activeTab]); // Only run when date or tab changes

  // Handle date change
  const handleDateChange = (e) => {
    setDateFilter(e.target.value);
  };

  // Handle student status change
  const handleStatusChange = (studentId, isPresent) => {
    setStudents(prevStudents => 
      prevStudents.map(student => 
        student.id === studentId 
          ? { ...student, isPresent } 
          : student
      )
    );
  };

  // Handle notes change
  const handleNotesChange = (studentId, notes) => {
    setStudents(prevStudents => 
      prevStudents.map(student => 
        student.id === studentId 
          ? { ...student, notes } 
          : student
      )
    );
  };

  // Save attendance data
  const handleSaveAttendance = async () => {
    try {
      setLoading(true);
      
      const attendanceDate = new Date(dateFilter);
      attendanceDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
      
      // Batch operation
      const promises = students.map(async (student) => {
        const attendanceData = {
          userId: student.id,
          studentName: student.name,
          regNumber: student.regNumber,
          roomNumber: student.roomNumber,
          date: attendanceDate,
          status: student.isPresent ? 'present' : 'absent',
          verifiedBy: currentUser.uid,
          verifierName: currentUser.displayName || currentUser.email,
          notes: student.notes || '',
          updatedAt: serverTimestamp()
        };
        
        if (student.attendanceId) {
          // Update existing record
          const attendanceRef = doc(db, 'attendance', student.attendanceId);
          await updateDoc(attendanceRef, attendanceData);
        } else {
          // Create new record
          attendanceData.createdAt = serverTimestamp();
          await addDoc(collection(db, 'attendance'), attendanceData);
        }
      });
      
      await Promise.all(promises);
      
      // Update stats immediately after saving
      const totalStudents = students.length;
      const presentToday = students.filter(student => student.isPresent).length;
      const absentToday = totalStudents - presentToday;
      const attendanceRate = totalStudents > 0 
          ? (presentToday / totalStudents) * 100 
          : 0;
          
      // Update stats state with new values
      setStats({
        totalStudents,
        presentToday,
        absentToday,
        attendanceRate: attendanceRate.toFixed(2)
      });
      
      setSuccessMessage('Attendance saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Refresh attendance data
      await fetchAttendanceForDate(dateFilter, students);
      
    } catch (error) {
      console.error('Error saving attendance:', error);
      setError('Failed to save attendance: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter students by search term
  const filteredStudents = students.filter(student => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (student.name && student.name.toLowerCase().includes(searchLower)) ||
      (student.regNumber && student.regNumber.toLowerCase().includes(searchLower)) ||
      (student.roomNumber && student.roomNumber.toString().includes(searchLower))
    );
  });

  // Filter attendance records
  const filteredAttendance = attendance.filter(record => {
    if (filter === 'all') return true;
    return record.status === filter;
  }).filter(record => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (record.studentName && record.studentName.toLowerCase().includes(searchLower)) ||
      (record.regNumber && record.regNumber.toLowerCase().includes(searchLower)) ||
      (record.roomNumber && record.roomNumber.toString().includes(searchLower))
    );
  });
  
  // Get implicitly absent students (those without records)
  const getMissingStudents = () => {
    if (filter !== 'absent') return [];
    
    // Get IDs of students who have attendance records
    const recordedStudentIds = new Set(attendance.map(record => record.userId));
    
    // Find students without records for today (implicitly absent)
    return students
      .filter(student => !recordedStudentIds.has(student.id))
      .map(student => ({
        id: student.id + '_implicit',
        userId: student.id,
        studentName: student.name,
        regNumber: student.regNumber,
        roomNumber: student.roomNumber,
        status: 'absent',
        notes: 'No attendance record',
        verifierName: 'System'
      }))
      .filter(student => 
        !searchTerm || 
        student.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.regNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.roomNumber?.toString().includes(searchTerm)
      );
  };

  return (
    <div className="page-container fade-in">
      <Navbar />
      
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="fs-4 fw-bold mb-0">Attendance Management</h1>
        </div>
        
        <Row className="mb-4">
          <Col lg={3} md={6} className="mb-3 mb-lg-0">
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
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3 className="fs-2 fw-bold mb-0">{stats.totalStudents}</h3>
                <p className="text-muted">Total Students</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={3} md={6} className="mb-3 mb-lg-0">
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
                <h3 className="fs-2 fw-bold mb-0">{stats.presentToday}</h3>
                <p className="text-muted">Present Today</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={3} md={6} className="mb-3 mb-lg-0">
            <Card className="shadow-sm border-0 h-100">
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
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <path d="M12 8v4"></path>
                    <path d="M12 16h.01"></path>
                  </svg>
                </div>
                <h3 className="fs-2 fw-bold mb-0">{stats.absentToday}</h3>
                <p className="text-muted">Absent Today</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={3} md={6}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                <div className="dashboard-card-icon bg-info bg-opacity-10 mb-2">
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
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                </div>
                <h3 className="fs-2 fw-bold mb-0">{stats.attendanceRate}%</h3>
                <p className="text-muted">Attendance Rate</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Card className="shadow-sm border-0 mb-4">
          <Card.Header className="bg-white p-0">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-0"
            >
              <Tab eventKey="dashboard" title="Dashboard" />
              <Tab eventKey="take-attendance" title="Take Attendance" />
              <Tab eventKey="view-attendance" title="View Attendance" />
            </Tabs>
          </Card.Header>
          
          <Card.Body className="p-3">
            {successMessage && (
              <Alert variant="success" className="mb-3">
                <i className="bi bi-check-circle me-2"></i>
                {successMessage}
              </Alert>
            )}
            
            {error && (
              <Alert variant="danger" className="mb-3">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </Alert>
            )}
            
            {activeTab === 'dashboard' && (
              <SecurityDashboard />
            )}
            
            {activeTab === 'take-attendance' && (
              <>
                <Row className="mb-3 align-items-center">
                  <Col md={6} className="mb-3 mb-md-0">
                    <Form.Group className="d-flex align-items-center">
                      <Form.Label className="me-2 mb-0">Date:</Form.Label>
                      <Form.Control
                        type="date"
                        value={dateFilter}
                        onChange={handleDateChange}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-auto"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Control
                      type="search"
                      placeholder="Search by name, registration number, or room..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Col>
                </Row>
                
                <div className="d-flex justify-content-end mb-3">
                  <Button 
                    variant="success" 
                    onClick={handleSaveAttendance}
                    disabled={loading}
                    className="d-flex align-items-center"
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
                      className="me-2"
                    >
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17 21 17 13 7 13 7 21"></polyline>
                      <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    Save Attendance
                  </Button>
                </div>
                
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Room</th>
                        <th>Name</th>
                        <th>Registration No.</th>
                        <th>Status</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="5" className="text-center py-4">
                            <div className="spinner"></div>
                            <p className="mt-2 text-muted">Loading students...</p>
                          </td>
                        </tr>
                      ) : filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-4">
                            <p className="mb-0 text-muted">No students found</p>
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map(student => (
                          <tr key={student.id}>
                            <td>{student.roomNumber}</td>
                            <td>{student.name}</td>
                            <td>{student.regNumber}</td>
                            <td>
                              <Form.Check
                                type="switch"
                                id={`status-${student.id}`}
                                label={student.isPresent ? "Present" : "Absent"}
                                checked={student.isPresent}
                                onChange={(e) => handleStatusChange(student.id, e.target.checked)}
                                className={`status-switch ${student.isPresent ? 'present' : 'absent'}`}
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="text"
                                placeholder="Add notes (optional)"
                                value={student.notes}
                                onChange={(e) => handleNotesChange(student.id, e.target.value)}
                                className="form-control-sm"
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            
            {activeTab === 'view-attendance' && (
              <>
                <Row className="mb-3 align-items-center">
                  <Col md={4} className="mb-3 mb-md-0">
                    <Form.Group className="d-flex align-items-center">
                      <Form.Label className="me-2 mb-0">Date:</Form.Label>
                      <Form.Control
                        type="date"
                        value={dateFilter}
                        onChange={handleDateChange}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-auto"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={4} className="mb-3 mb-md-0">
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
                  </Col>
                  
                  <Col md={4}>
                    <Form.Control
                      type="search"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Col>
                </Row>
                
                <div className="d-flex justify-content-between mb-3">
                  <Badge bg="primary" className="py-2 px-3">
                    {filter === 'absent' 
                      ? (filteredAttendance.length + getMissingStudents().length) 
                      : filteredAttendance.length} Records
                  </Badge>
                </div>
                
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner"></div>
                    <p className="mt-2 text-muted">Loading attendance records...</p>
                  </div>
                ) : (filter === 'absent' 
                     ? (filteredAttendance.length + getMissingStudents().length === 0) 
                     : filteredAttendance.length === 0) ? (
                  <div className="text-center py-4 bg-light rounded">
                    <i className="bi bi-calendar-x display-4 text-muted"></i>
                    <p className="mt-2 text-muted">No attendance records found for this date</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Room</th>
                          <th>Name</th>
                          <th>Registration No.</th>
                          <th>Status</th>
                          <th>Notes</th>
                          <th>Verified By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filter === 'absent' 
                          ? [...filteredAttendance, ...getMissingStudents()].map(record => (
                            <tr key={record.id}>
                              <td>{record.roomNumber}</td>
                              <td>{record.studentName}</td>
                              <td>{record.regNumber}</td>
                              <td>
                                <Badge bg='danger' className="py-2 px-3">
                                  Absent
                                </Badge>
                              </td>
                              <td>{record.notes || '-'}</td>
                              <td>{record.verifierName}</td>
                            </tr>
                          )) 
                          : filteredAttendance.map(record => (
                            <tr key={record.id}>
                              <td>{record.roomNumber}</td>
                              <td>{record.studentName}</td>
                              <td>{record.regNumber}</td>
                              <td>
                                <Badge bg={record.status === 'present' ? 'success' : 'danger'} className="py-2 px-3">
                                  {record.status === 'present' ? 'Present' : 'Absent'}
                                </Badge>
                              </td>
                              <td>{record.notes || '-'}</td>
                              <td>{record.verifierName}</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
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

export default SecurityManager;