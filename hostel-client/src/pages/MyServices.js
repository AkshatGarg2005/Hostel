import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';
import ServiceRequestCard from '../components/service/ServiceRequestCard';
import { Container, Card, Form, Alert, Spinner } from 'react-bootstrap';

const MyServices = () => {
  const { currentUser } = useAuth();
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'accepted'

  useEffect(() => {
    const fetchServiceRequests = async () => {
      if (!currentUser) {
        setError('No user is logged in');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('Fetching service requests for user:', currentUser.uid);
        
        let serviceRequestQuery;
        
        if (filter === 'all') {
          serviceRequestQuery = query(
            collection(db, 'serviceRequests'),
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
          );
        } else {
          serviceRequestQuery = query(
            collection(db, 'serviceRequests'),
            where('userId', '==', currentUser.uid),
            where('status', '==', filter),
            orderBy('createdAt', 'desc')
          );
        }
        
        console.log('Executing query...');
        const querySnapshot = await getDocs(serviceRequestQuery);
        console.log(`Query returned ${querySnapshot.size} documents`);
        
        const requests = querySnapshot.docs.map(doc => {
          console.log('Document ID:', doc.id);
          return {
            id: doc.id,
            ...doc.data()
          };
        });
        
        setServiceRequests(requests);
        setError('');
      } catch (error) {
        console.error('Error fetching service requests:', error);
        setError('Failed to load service requests: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceRequests();
  }, [currentUser, filter]);

  return (
    <>
      <Navbar />
      
      <Container className="py-4">
        <h1 className="mb-4">My Service Requests</h1>
        
        <Card className="mb-4">
          <Card.Body>
            <Form.Group>
              <Form.Label>Filter by Status</Form.Label>
              <Form.Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
              </Form.Select>
            </Form.Group>
          </Card.Body>
        </Card>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3">Loading your service requests...</p>
          </div>
        ) : serviceRequests.length === 0 ? (
          <Card>
            <Card.Body className="text-center">
              <p className="mb-0">You have no service requests yet</p>
              {currentUser && <small className="text-muted">User ID: {currentUser.uid}</small>}
            </Card.Body>
          </Card>
        ) : (
          <div className="d-flex flex-column gap-4">
            {serviceRequests.map(request => (
              <ServiceRequestCard
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

export default MyServices;