import React, { useState, useEffect } from 'react';
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Warden - Leave Requests
        </h1>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full">
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
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-10">
            <div className="spinner"></div>
            <p className="mt-3 text-gray-600">Loading leave requests...</p>
          </div>
        ) : leaveRequests.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">No leave requests found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {leaveRequests.map(request => (
              <LeaveRequestCard
                key={request.id}
                request={request}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Warden;