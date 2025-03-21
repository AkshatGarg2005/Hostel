import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import Navbar from '../components/common/Navbar';
import ServiceRequestCard from '../components/service-manager/ServiceRequestCard';

const ServiceManager = () => {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'accepted'
  const [serviceType, setServiceType] = useState('all'); // 'all', 'electrician', 'plumber', etc.

  const fetchServiceRequests = async () => {
    setLoading(true);
    try {
      let serviceRequestQuery;

      // Create a query based on filters
      if (filter === 'all' && serviceType === 'all') {
        serviceRequestQuery = query(
          collection(db, 'serviceRequests'),
          orderBy('createdAt', 'desc')
        );
      } else if (filter !== 'all' && serviceType === 'all') {
        serviceRequestQuery = query(
          collection(db, 'serviceRequests'),
          where('status', '==', filter),
          orderBy('createdAt', 'desc')
        );
      } else if (filter === 'all' && serviceType !== 'all') {
        serviceRequestQuery = query(
          collection(db, 'serviceRequests'),
          where('serviceType', '==', serviceType),
          orderBy('createdAt', 'desc')
        );
      } else {
        serviceRequestQuery = query(
          collection(db, 'serviceRequests'),
          where('status', '==', filter),
          where('serviceType', '==', serviceType),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(serviceRequestQuery);
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setServiceRequests(requests);
    } catch (error) {
      console.error('Error fetching service requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceRequests();
  }, [filter, serviceType]);

  const handleAccept = async (id) => {
    try {
      const requestRef = doc(db, 'serviceRequests', id);
      await updateDoc(requestRef, {
        status: 'accepted',
        acceptedAt: new Date()
      });
      
      // Update the local state
      setServiceRequests(prevRequests => 
        prevRequests.map(request => 
          request.id === id 
            ? { ...request, status: 'accepted', acceptedAt: new Date() } 
            : request
        )
      );
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        await deleteDoc(doc(db, 'serviceRequests', id));
        // Remove from local state
        setServiceRequests(prevRequests => 
          prevRequests.filter(request => request.id !== id)
        );
      } catch (error) {
        console.error('Error deleting request:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Service Manager
        </h1>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status Filter
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
              </select>
            </div>
            
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Type
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="all">All Types</option>
                <option value="electrician">Electrician</option>
                <option value="plumber">Plumber</option>
                <option value="carpenter">Carpenter</option>
                <option value="laundry">Laundry</option>
                <option value="cab">Cab</option>
              </select>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-10">
            <div className="spinner"></div>
            <p className="mt-3 text-gray-600">Loading service requests...</p>
          </div>
        ) : serviceRequests.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">No service requests found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {serviceRequests.map(request => (
              <ServiceRequestCard
                key={request.id}
                request={request}
                onAccept={handleAccept}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceManager;