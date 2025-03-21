import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Button, Badge, Form } from 'react-bootstrap';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, orderBy, where, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import Navbar from '../components/common/Navbar';
import ComplaintCard from '../components/mess-manager/ComplaintCard';
import MenuForm from '../components/mess-manager/MenuForm';

const MessManager = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('complaints'); // 'complaints' or 'menu'
  const [menuType, setMenuType] = useState('weekly'); // 'daily' or 'weekly'
  const [complaintsFilter, setComplaintsFilter] = useState('all'); // 'all', 'pending', 'resolved'

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      let complaintsQuery;
      
      if (complaintsFilter === 'all') {
        complaintsQuery = query(
          collection(db, 'messComplaints'),
          orderBy('createdAt', 'desc')
        );
      } else {
        complaintsQuery = query(
          collection(db, 'messComplaints'),
          where('status', '==', complaintsFilter),
          orderBy('createdAt', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(complaintsQuery);
      const complaintsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setComplaints(complaintsData);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'complaints') {
      fetchComplaints();
    } else {
      setLoading(false);
    }
  }, [activeTab, complaintsFilter]);

  const handleResolve = async (id) => {
    try {
      const complaintRef = doc(db, 'messComplaints', id);
      await updateDoc(complaintRef, {
        status: 'resolved',
        resolvedAt: new Date()
      });
      
      // Update the local state
      setComplaints(prevComplaints => 
        prevComplaints.map(complaint => 
          complaint.id === id 
            ? { ...complaint, status: 'resolved', resolvedAt: new Date() } 
            : complaint
        )
      );
    } catch (error) {
      console.error('Error resolving complaint:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      try {
        await deleteDoc(doc(db, 'messComplaints', id));
        // Remove from local state
        setComplaints(prevComplaints => 
          prevComplaints.filter(complaint => complaint.id !== id)
        );
      } catch (error) {
        console.error('Error deleting complaint:', error);
      }
    }
  };

  const handleMenuSubmit = async (menuData) => {
    try {
      // Create or update menu in Firestore
      const menuRef = collection(db, 'messMenu');
      
      // Add a new menu entry
      await addDoc(menuRef, {
        ...menuData,
        type: menuType,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return true;
    } catch (error) {
      console.error('Error updating menu:', error);
      throw error;
    }
  };

  // Count pending complaints
  const pendingCount = complaints.filter(complaint => complaint.status === 'pending').length;

  return (
    <div className="page-container fade-in">
      <Navbar />
      
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="fs-4 fw-bold mb-0">Mess Management</h1>
        </div>
        
        <Card className="shadow-sm border-0 mb-4">
          <Card.Header className="bg-white border-bottom">
            <Nav variant="tabs" className="border-0">
              <Nav.Item>
                <Nav.Link 
                  active={activeTab === 'complaints'}
                  onClick={() => setActiveTab('complaints')}
                  className={`px-3 py-2 ${activeTab === 'complaints' ? 'fw-semibold' : ''}`}
                >
                  Complaints
                  {pendingCount > 0 && (
                    <Badge bg="danger" className="ms-2 rounded-pill">{pendingCount}</Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  active={activeTab === 'menu'} 
                  onClick={() => setActiveTab('menu')}
                  className={`px-3 py-2 ${activeTab === 'menu' ? 'fw-semibold' : ''}`}
                >
                  Menu Management
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
        </Card>
        
        {activeTab === 'complaints' ? (
          <>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4">
              <h2 className="fs-5 fw-semibold mb-3 mb-sm-0">Mess Complaints</h2>
              <Form.Select 
                size="sm" 
                style={{ width: 'auto' }}
                value={complaintsFilter}
                onChange={(e) => setComplaintsFilter(e.target.value)}
              >
                <option value="all">All Complaints</option>
                <option value="pending">Pending Only</option>
                <option value="resolved">Resolved Only</option>
              </Form.Select>
            </div>
            
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p className="loading-text">Loading complaints...</p>
              </div>
            ) : complaints.length === 0 ? (
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
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                  </svg>
                </div>
                <h3 className="fs-5 mt-3">No complaints found</h3>
                <p className="empty-state-text">
                  {complaintsFilter === 'all' 
                    ? 'There are no mess complaints in the system.' 
                    : `No ${complaintsFilter} complaints found.`}
                </p>
              </div>
            ) : (
              <div>
                {complaints.map(complaint => (
                  <ComplaintCard
                    key={complaint.id}
                    complaint={complaint}
                    onResolve={handleResolve}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4">
              <h2 className="fs-5 fw-semibold mb-3 mb-sm-0">Menu Management</h2>
              <div className="d-flex align-items-center">
                <div className="btn-group" role="group">
                  <Button 
                    variant={menuType === 'daily' ? 'primary' : 'outline-primary'} 
                    onClick={() => setMenuType('daily')}
                    size="sm"
                    className="px-3"
                  >
                    Daily
                  </Button>
                  <Button 
                    variant={menuType === 'weekly' ? 'primary' : 'outline-primary'} 
                    onClick={() => setMenuType('weekly')}
                    size="sm"
                    className="px-3"
                  >
                    Weekly
                  </Button>
                </div>
              </div>
            </div>
            
            <Card className="shadow-sm border-0">
              <Card.Body className="p-4">
                <MenuForm 
                  type={menuType} 
                  onSubmit={handleMenuSubmit} 
                />
              </Card.Body>
            </Card>
          </>
        )}
      </Container>
    </div>
  );
};

export default MessManager;