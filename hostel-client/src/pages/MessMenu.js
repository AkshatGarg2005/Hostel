import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import Navbar from '../components/common/Navbar';

const MessMenu = () => {
  const [menu, setMenu] = useState(null);
  const [menuType, setMenuType] = useState('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        
        const menuQuery = query(
          collection(db, 'messMenu'),
          where('type', '==', menuType),
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        
        const querySnapshot = await getDocs(menuQuery);
        
        if (!querySnapshot.empty) {
          setMenu({
            id: querySnapshot.docs[0].id,
            ...querySnapshot.docs[0].data()
          });
        } else {
          setMenu(null);
        }
      } catch (error) {
        console.error('Error fetching menu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [menuType]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const renderDailyMenu = () => {
    if (!menu) return <p className="text-center text-gray-500">No daily menu available</p>;
    
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Menu for {menu.date || formatDate(menu.createdAt)}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-2">Breakfast</h4>
            <p className="text-gray-600 whitespace-pre-line">{menu.breakfast}</p>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-2">Lunch</h4>
            <p className="text-gray-600 whitespace-pre-line">{menu.lunch}</p>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-2">Snacks</h4>
            <p className="text-gray-600 whitespace-pre-line">{menu.snacks}</p>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-2">Dinner</h4>
            <p className="text-gray-600 whitespace-pre-line">{menu.dinner}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderWeeklyMenu = () => {
    if (!menu) return <p className="text-center text-gray-500">No weekly menu available</p>;
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Menu (Last Updated: {formatDate(menu.createdAt)})</h3>
        
        {days.map((day) => (
          <div key={day} className="mb-6 border-b pb-6 last:border-b-0">
            <h4 className="text-lg font-medium text-gray-800 mb-4 capitalize">{day}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h5 className="font-medium text-gray-700 mb-2">Breakfast</h5>
                <p className="text-gray-600 whitespace-pre-line">{menu[day]?.breakfast || 'Not available'}</p>
              </div>
              <div className="border rounded-lg p-4">
                <h5 className="font-medium text-gray-700 mb-2">Lunch</h5>
                <p className="text-gray-600 whitespace-pre-line">{menu[day]?.lunch || 'Not available'}</p>
              </div>
              <div className="border rounded-lg p-4">
                <h5 className="font-medium text-gray-700 mb-2">Snacks</h5>
                <p className="text-gray-600 whitespace-pre-line">{menu[day]?.snacks || 'Not available'}</p>
              </div>
              <div className="border rounded-lg p-4">
                <h5 className="font-medium text-gray-700 mb-2">Dinner</h5>
                <p className="text-gray-600 whitespace-pre-line">{menu[day]?.dinner || 'Not available'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Mess Menu
        </h1>
        
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex" aria-label="Tabs">
              <button
                onClick={() => setMenuType('daily')}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  menuType === 'daily'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Daily Menu
              </button>
              <button
                onClick={() => setMenuType('weekly')}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  menuType === 'weekly'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Weekly Menu
              </button>
            </nav>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-10">
            <div className="spinner"></div>
            <p className="mt-3 text-gray-600">Loading menu...</p>
          </div>
        ) : (
          menuType === 'daily' ? renderDailyMenu() : renderWeeklyMenu()
        )}
      </div>
    </div>
  );
};

export default MessMenu;