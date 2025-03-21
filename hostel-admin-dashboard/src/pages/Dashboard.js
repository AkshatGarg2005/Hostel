import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';

const Dashboard = () => {
  const { userRole } = useAuth();
  const [stats, setStats] = useState({
    serviceRequests: 0,
    messComplaints: 0,
    leaveRequests: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        
        setStats({
          serviceRequests: serviceSnapshots.size,
          messComplaints: messSnapshots.size,
          leaveRequests: leaveSnapshots.size
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, count, icon, color, linkTo, allowed }) => {
    if (!allowed) return null;
    
    return (
      <Link
        to={linkTo}
        className={`block p-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100`}
      >
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${color} text-white mr-4`}>
            {icon}
          </div>
          <div>
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
              {count}
            </h5>
            <p className="font-normal text-gray-700">
              {title}
            </p>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Dashboard
        </h1>
        
        {loading ? (
          <div className="text-center py-10">
            <div className="spinner"></div>
            <p className="mt-3 text-gray-600">Loading dashboard data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Pending Service Requests"
              count={stats.serviceRequests}
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                </svg>
              }
              color="bg-blue-500"
              linkTo="/service-manager"
              allowed={userRole === 'admin' || userRole === 'service_manager'}
            />
            
            <StatCard
              title="Pending Mess Complaints"
              count={stats.messComplaints}
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                </svg>
              }
              color="bg-yellow-500"
              linkTo="/mess-manager"
              allowed={userRole === 'admin' || userRole === 'mess_manager'}
            />
            
            <StatCard
              title="Pending Leave Requests"
              count={stats.leaveRequests}
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                </svg>
              }
              color="bg-green-500"
              linkTo="/warden"
              allowed={userRole === 'admin' || userRole === 'warden'}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;