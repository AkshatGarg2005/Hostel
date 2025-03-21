import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';

const Dashboard = () => {
  const { currentUser, userDetails } = useAuth();
  const [stats, setStats] = useState({
    pendingServices: 0,
    pendingLeaves: 0
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
        
        setStats({
          pendingServices: serviceSnapshots.size,
          pendingLeaves: leaveSnapshots.size
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  const StatCard = ({ title, count, icon, color, linkTo }) => {
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

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const renderDailyMenu = () => {
    if (!latestMenu || latestMenu.type !== 'daily') return null;
    
    return (
      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Menu ({formatDate(latestMenu.createdAt)})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700">Breakfast</h4>
            <p className="text-gray-600">{latestMenu.breakfast}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700">Lunch</h4>
            <p className="text-gray-600">{latestMenu.lunch}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700">Snacks</h4>
            <p className="text-gray-600">{latestMenu.snacks}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700">Dinner</h4>
            <p className="text-gray-600">{latestMenu.dinner}</p>
          </div>
        </div>
        <div className="mt-4 text-right">
          <Link to="/mess-menu" className="text-blue-600 hover:text-blue-800">
            View full menu →
          </Link>
        </div>
      </div>
    );
  };

  const renderWeeklyMenuPreview = () => {
    if (!latestMenu || latestMenu.type !== 'weekly') return null;
    
    // Get current day of the week
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    
    return (
      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Menu (from Weekly Schedule)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700">Breakfast</h4>
            <p className="text-gray-600">{latestMenu[today]?.breakfast || 'Not available'}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700">Lunch</h4>
            <p className="text-gray-600">{latestMenu[today]?.lunch || 'Not available'}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700">Snacks</h4>
            <p className="text-gray-600">{latestMenu[today]?.snacks || 'Not available'}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700">Dinner</h4>
            <p className="text-gray-600">{latestMenu[today]?.dinner || 'Not available'}</p>
          </div>
        </div>
        <div className="mt-4 text-right">
          <Link to="/mess-menu" className="text-blue-600 hover:text-blue-800">
            View full menu →
          </Link>
        </div>
      </div>
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Pending Service Requests"
                count={stats.pendingServices}
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                  </svg>
                }
                color="bg-blue-500"
                linkTo="/my-services"
              />
              
              <StatCard
                title="Pending Leave Requests"
                count={stats.pendingLeaves}
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                  </svg>
                }
                color="bg-green-500"
                linkTo="/my-leaves"
              />
              
              <div className="md:col-span-2 bg-white rounded-lg border border-gray-200 shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link
                    to="/service-request"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
                  >
                    Request Service
                  </Link>
                  <Link
                    to="/mess-complaint"
                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-center"
                  >
                    Mess Complaint
                  </Link>
                  <Link
                    to="/leave-request"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-center"
                  >
                    Request Leave
                  </Link>
                  <Link
                    to="/mess-menu"
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-center"
                  >
                    View Menu
                  </Link>
                </div>
              </div>
            </div>
            
            {latestMenu ? (
              latestMenu.type === 'daily' ? renderDailyMenu() : renderWeeklyMenuPreview()
            ) : (
              <div className="bg-white shadow rounded-lg p-6 mt-6 text-center">
                <p className="text-gray-600">No mess menu available</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;