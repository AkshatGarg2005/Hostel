import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';

const LeaveRequest = () => {
  const { currentUser, userDetails } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    checkoutDate: '',
    returnDate: '',
    reason: '',
    phoneNumber: userDetails?.contactNumber || '',
    emergencyContact: '',
    destinationAddress: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.checkoutDate || !formData.returnDate || 
        !formData.reason || !formData.phoneNumber || 
        !formData.emergencyContact || !formData.destinationAddress) {
      return setError('Please fill in all fields');
    }
    
    // Check if checkout date is in the future
    const checkoutDate = new Date(formData.checkoutDate);
    const returnDate = new Date(formData.returnDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkoutDate < today) {
      return setError('Checkout date cannot be in the past');
    }
    
    if (returnDate < checkoutDate) {
      return setError('Return date must be after checkout date');
    }
    
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      
      // Add leave request to Firestore
      await addDoc(collection(db, 'leaveRequests'), {
        userId: currentUser.uid,
        studentName: userDetails.name,
        regNumber: userDetails.regNumber,
        roomNumber: userDetails.roomNumber,
        checkoutDate: checkoutDate,
        returnDate: returnDate,
        reason: formData.reason,
        phoneNumber: formData.phoneNumber,
        emergencyContact: formData.emergencyContact,
        destinationAddress: formData.destinationAddress,
        status: 'pending',
        createdAt: new Date()
      });
      
      setSuccess('Your leave request has been submitted successfully!');
      
      // Reset form
      setFormData({
        ...formData,
        checkoutDate: '',
        returnDate: '',
        reason: '',
        destinationAddress: ''
      });
      
      // Redirect after a delay
      setTimeout(() => {
        navigate('/my-leaves');
      }, 3000);
      
    } catch (error) {
      setError('Failed to submit leave request: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Request Leave/Outing
        </h1>
        
        <div className="bg-white shadow rounded-lg p-6">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{success}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="checkoutDate" className="block text-sm font-medium text-gray-700">
                    Checkout Date
                  </label>
                  <input
                    id="checkoutDate"
                    name="checkoutDate"
                    type="date"
                    required
                    value={formData.checkoutDate}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700">
                    Return Date
                  </label>
                  <input
                    id="returnDate"
                    name="returnDate"
                    type="date"
                    required
                    value={formData.returnDate}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                  Reason for Leave
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  rows="3"
                  required
                  value={formData.reason}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Please provide a detailed reason for your leave"
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="destinationAddress" className="block text-sm font-medium text-gray-700">
                  Destination Address
                </label>
                <textarea
                  id="destinationAddress"
                  name="destinationAddress"
                  rows="2"
                  required
                  value={formData.destinationAddress}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Full address of your destination"
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Your Phone Number
                  </label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700">
                    Emergency Contact Number
                  </label>
                  <input
                    id="emergencyContact"
                    name="emergencyContact"
                    type="tel"
                    required
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Parent/Guardian phone number"
                  />
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequest;