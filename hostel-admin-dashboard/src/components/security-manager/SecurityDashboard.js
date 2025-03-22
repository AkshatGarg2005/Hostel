import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Badge, Button } from 'react-bootstrap';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Link } from 'react-router-dom';

const SecurityDashboard = () => {
  const [attendanceStats, setAttendanceStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    attendanceRate: 0,
    trend: 0
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [lowAttendanceStudents, setLowAttendanceStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get all students first to establish the total count
        const studentsQuery = query(collection(db, 'students'));
        const studentsSnapshot = await getDocs(studentsQuery);
        const allStudents = studentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        const totalStudents = allStudents.length;
        
        // Get today's date bounds
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Get today's attendance
        const todayAttendanceQuery = query(
          collection(db, 'attendance'),
          where('date', '>=', today),
          where('date', '<', tomorrow)
        );
        const todayAttendanceSnapshot = await getDocs(todayAttendanceQuery);
        const todayAttendance = todayAttendanceSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Count students present today
        const presentToday = todayAttendance.filter(record => record.status === 'present').length;
        
        // Calculate absentToday as the total students minus present students
        const absentToday = totalStudents - presentToday;
        
        // Calculate attendance rate using total students as denominator
        const attendanceRate = totalStudents > 0 
          ? (presentToday / totalStudents) * 100 
          : 0;
        
        // Get yesterday's date bounds
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Get yesterday's attendance
        const yesterdayAttendanceQuery = query(
          collection(db, 'attendance'),
          where('date', '>=', yesterday),
          where('date', '<', today)
        );
        const yesterdayAttendanceSnapshot = await getDocs(yesterdayAttendanceQuery);
        const yesterdayAttendance = yesterdayAttendanceSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Count students present yesterday
        const presentYesterday = yesterdayAttendance.filter(record => record.status === 'present').length;
        
        // Calculate yesterday's attendance rate
        const yesterdayAttendanceRate = totalStudents > 0 
          ? (presentYesterday / totalStudents) * 100 
          : 0;
        
        // Calculate trend (difference between today and yesterday attendance rates)
        const trend = attendanceRate - yesterdayAttendanceRate;
        
        // Update attendance stats
        setAttendanceStats({
          totalStudents,
          presentToday,
          absentToday,
          attendanceRate: attendanceRate.toFixed(2),
          trend: trend.toFixed(2)
        });
        
        // Get recent attendance records
        const recentAttendanceQuery = query(
          collection(db, 'attendance'),
          orderBy('date', 'desc'),
          limit(5)
        );
        const recentAttendanceSnapshot = await getDocs(recentAttendanceQuery);
        const recentAttendanceRecords = recentAttendanceSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setRecentAttendance(recentAttendanceRecords);
        
        // Calculate student attendance rates for the past month
        const pastMonth = new Date();
        pastMonth.setMonth(pastMonth.getMonth() - 1);
        
        const pastMonthAttendanceQuery = query(
          collection(db, 'attendance'),
          where('date', '>=', pastMonth)
        );
        const pastMonthAttendanceSnapshot = await getDocs(pastMonthAttendanceQuery);
        const pastMonthAttendance = pastMonthAttendanceSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Find all unique days in the attendance data
        const uniqueDays = new Set();
        pastMonthAttendance.forEach(record => {
          if (record.date) {
            const dateStr = record.date.toDate().toDateString();
            uniqueDays.add(dateStr);
          }
        });
        const totalDaysAttendanceTaken = uniqueDays.size;
        
        // Initialize attendance data for all students
        const studentAttendance = {};
        allStudents.forEach(student => {
          studentAttendance[student.id] = {
            userId: student.id,
            studentName: student.name,
            regNumber: student.regNumber,
            roomNumber: student.roomNumber,
            totalDays: totalDaysAttendanceTaken,
            presentDays: 0,
            percentage: 0
          };
        });
        
        // Count present days for each student
        pastMonthAttendance.forEach(record => {
          if (record.userId && record.status === 'present' && studentAttendance[record.userId]) {
            studentAttendance[record.userId].presentDays++;
          }
        });
        
        // Calculate percentage for each student
        Object.values(studentAttendance).forEach(student => {
          student.percentage = student.totalDays > 0 
            ? (student.presentDays / student.totalDays) * 100 
            : 0;
        });
        
        // Find students with low attendance
        const lowAttendanceThreshold = 75; // Below 75% is considered low
        const lowAttendanceList = Object.values(studentAttendance)
          .filter(student => student.percentage < lowAttendanceThreshold && student.totalDays >= 5)
          .sort((a, b) => a.percentage - b.percentage); // Sort ascending by percentage
        
        setLowAttendanceStudents(lowAttendanceList.slice(0, 5)); // Get top 5 lowest
        
      } catch (error) {
        console.error('Error fetching security dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get attendance percentage class
  const getAttendanceClass = (percentage) => {
    if (percentage >= 75) return 'attendance-percentage-high';
    if (percentage >= 60) return 'attendance-percentage-medium';
    return 'attendance-percentage-low';
  };

  return (
    <div>
      {/* Stats Cards */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3 mb-lg-0">
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                <i className="bi bi-people text-primary fs-4"></i>
              </div>
              <div>
                <h2 className="fw-bold mb-0">{attendanceStats.totalStudents}</h2>
                <p className="text-muted mb-0">Total Students</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3 mb-lg-0">
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                <i className="bi bi-check-circle text-success fs-4"></i>
              </div>
              <div>
                <h2 className="fw-bold mb-0">{attendanceStats.presentToday}</h2>
                <p className="text-muted mb-0">Present Today</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3 mb-lg-0">
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-danger bg-opacity-10 p-3 me-3">
                <i className="bi bi-x-circle text-danger fs-4"></i>
              </div>
              <div>
                <h2 className="fw-bold mb-0">{attendanceStats.absentToday}</h2>
                <p className="text-muted mb-0">Absent Today</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                <i className="bi bi-percent text-info fs-4"></i>
              </div>
              <div>
                <h2 className="fw-bold mb-0">
                  {attendanceStats.attendanceRate}%
                  {attendanceStats.trend > 0 && (
                    <span className="text-success fs-6 ms-2">
                      <i className="bi bi-arrow-up"></i> {Math.abs(attendanceStats.trend)}%
                    </span>
                  )}
                  {attendanceStats.trend < 0 && (
                    <span className="text-danger fs-6 ms-2">
                      <i className="bi bi-arrow-down"></i> {Math.abs(attendanceStats.trend)}%
                    </span>
                  )}
                </h2>
                <p className="text-muted mb-0">Attendance Rate</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Quick Action */}
      <div className="d-flex justify-content-end mb-4">
        <Button as={Link} to="/security-manager" variant="primary">
          <i className="bi bi-clipboard-check me-2"></i>
          Take Attendance
        </Button>
      </div>
      
      {/* Recent Attendance */}
      <Row className="mb-4">
        <Col lg={7} className="mb-4 mb-lg-0">
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white py-3 border-bottom">
              <h5 className="mb-0 fw-semibold">Recent Attendance Records</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Student</th>
                    <th>Room</th>
                    <th>Status</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4">
                        <div className="spinner"></div>
                      </td>
                    </tr>
                  ) : recentAttendance.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4">
                        <i className="bi bi-inbox fs-1 text-muted"></i>
                        <p className="text-muted mb-0 mt-2">No attendance records found</p>
                      </td>
                    </tr>
                  ) : (
                    recentAttendance.map(record => (
                      <tr key={record.id}>
                        <td>
                          <div className="fw-semibold">{record.studentName}</div>
                          <small className="text-muted">{record.regNumber}</small>
                        </td>
                        <td>{record.roomNumber}</td>
                        <td>
                          <Badge bg={record.status === 'present' ? 'success' : 'danger'}>
                            {record.status === 'present' ? 'Present' : 'Absent'}
                          </Badge>
                        </td>
                        <td>
                          <div>{formatDate(record.date)}</div>
                          <small className="text-muted">
                            {record.selfMarked ? 'Self-marked' : 'By Admin'}
                          </small>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={5}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white py-3 border-bottom">
              <h5 className="mb-0 fw-semibold">Students with Low Attendance</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Student</th>
                    <th>Room</th>
                    <th>Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="3" className="text-center py-4">
                        <div className="spinner"></div>
                      </td>
                    </tr>
                  ) : lowAttendanceStudents.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center py-4">
                        <i className="bi bi-emoji-smile fs-1 text-muted"></i>
                        <p className="text-muted mb-0 mt-2">No students with low attendance</p>
                      </td>
                    </tr>
                  ) : (
                    lowAttendanceStudents.map(student => (
                      <tr key={student.userId}>
                        <td>
                          <div className="fw-semibold">{student.studentName}</div>
                          <small className="text-muted">{student.regNumber}</small>
                        </td>
                        <td>{student.roomNumber}</td>
                        <td>
                          <div className={`attendance-percentage ${getAttendanceClass(student.percentage)}`}>
                            {student.percentage.toFixed(1)}%
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SecurityDashboard;