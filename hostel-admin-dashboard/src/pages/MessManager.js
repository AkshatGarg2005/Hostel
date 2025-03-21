import React, { useState, useEffect } from 'react';
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

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const complaintsQuery = query(
        collection(db, 'messComplaints'),
        orderBy('createdAt', 'desc')
      );
      
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
  }, [activeTab]);

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
      
      alert('Menu updated successfully!');
    } catch (error) {
      console.error('Error updating menu:', error);
      alert('Failed to update menu. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Mess Manager
        </h1>
        
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('complaints')}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'complaints'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Complaints
              </button>
              <button
                onClick={() => setActiveTab('menu')}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'menu'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Menu Management
              </button>
            </nav>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-10">
            <div className="spinner"></div>
            <p className="mt-3 text-gray-600">Loading...</p>
          </div>
        ) : activeTab === 'complaints' ? (
          <>
            {complaints.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-6 text-center">
                <p className="text-gray-500">No complaints found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
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
          <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-4">
              <div className="flex items-center justify-start space-x-4 mb-6">
                <span className="text-sm font-medium text-gray-700">Menu Type:</span>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="menuType"
                      value="daily"
                      checked={menuType === 'daily'}
                      onChange={() => setMenuType('daily')}
                    />
                    <span className="ml-2">Daily Menu</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="menuType"
                      value="weekly"
                      checked={menuType === 'weekly'}
                      onChange={() => setMenuType('weekly')}
                    />
                    <span className="ml-2">Weekly Menu</span>
                  </label>
                </div>
              </div>
              
              <MenuForm 
                type={menuType} 
                onSubmit={handleMenuSubmit} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessManager;