import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';

const MenuForm = ({ type, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [menu, setMenu] = useState({
    // For daily menu
    date: new Date().toISOString().split('T')[0],
    breakfast: '',
    lunch: '',
    snacks: '',
    dinner: '',
    
    // For weekly menu (initialized empty)
    monday: { breakfast: '', lunch: '', snacks: '', dinner: '' },
    tuesday: { breakfast: '', lunch: '', snacks: '', dinner: '' },
    wednesday: { breakfast: '', lunch: '', snacks: '', dinner: '' },
    thursday: { breakfast: '', lunch: '', snacks: '', dinner: '' },
    friday: { breakfast: '', lunch: '', snacks: '', dinner: '' },
    saturday: { breakfast: '', lunch: '', snacks: '', dinner: '' },
    sunday: { breakfast: '', lunch: '', snacks: '', dinner: '' },
  });

  // Fetch the most recent menu data for initial display
  useEffect(() => {
    const fetchLatestMenu = async () => {
      try {
        setLoading(true);
        
        const menuQuery = query(
          collection(db, 'messMenu'),
          where('type', '==', type),
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        
        const querySnapshot = await getDocs(menuQuery);
        
        if (!querySnapshot.empty) {
          const latestMenu = querySnapshot.docs[0].data();
          setMenu(prevMenu => ({
            ...prevMenu,
            ...latestMenu
          }));
        }
      } catch (error) {
        console.error('Error fetching menu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestMenu();
  }, [type]);

  const handleDailyInputChange = (e) => {
    const { name, value } = e.target;
    setMenu({
      ...menu,
      [name]: value
    });
  };

  const handleWeeklyInputChange = (day, meal, value) => {
    setMenu({
      ...menu,
      [day]: {
        ...menu[day],
        [meal]: value
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(menu);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner"></div>
        <p className="mt-3 text-gray-600">Loading menu data...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {type === 'daily' ? (
        <div className="space-y-6">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              name="date"
              id="date"
              value={menu.date}
              onChange={handleDailyInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          
          <div>
            <label htmlFor="breakfast" className="block text-sm font-medium text-gray-700">
              Breakfast
            </label>
            <textarea
              name="breakfast"
              id="breakfast"
              rows="3"
              value={menu.breakfast}
              onChange={handleDailyInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter breakfast menu items"
              required
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="lunch" className="block text-sm font-medium text-gray-700">
              Lunch
            </label>
            <textarea
              name="lunch"
              id="lunch"
              rows="3"
              value={menu.lunch}
              onChange={handleDailyInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter lunch menu items"
              required
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="snacks" className="block text-sm font-medium text-gray-700">
              Snacks
            </label>
            <textarea
              name="snacks"
              id="snacks"
              rows="3"
              value={menu.snacks}
              onChange={handleDailyInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter snacks menu items"
              required
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="dinner" className="block text-sm font-medium text-gray-700">
              Dinner
            </label>
            <textarea
              name="dinner"
              id="dinner"
              rows="3"
              value={menu.dinner}
              onChange={handleDailyInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter dinner menu items"
              required
            ></textarea>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
            <div key={day} className="border-t pt-6 first:border-t-0 first:pt-0">
              <h3 className="text-lg font-medium text-gray-900 capitalize mb-4">{day}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor={`${day}-breakfast`} className="block text-sm font-medium text-gray-700">
                    Breakfast
                  </label>
                  <textarea
                    id={`${day}-breakfast`}
                    rows="2"
                    value={menu[day].breakfast}
                    onChange={(e) => handleWeeklyInputChange(day, 'breakfast', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter breakfast menu items"
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor={`${day}-lunch`} className="block text-sm font-medium text-gray-700">
                    Lunch
                  </label>
                  <textarea
                    id={`${day}-lunch`}
                    rows="2"
                    value={menu[day].lunch}
                    onChange={(e) => handleWeeklyInputChange(day, 'lunch', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter lunch menu items"
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor={`${day}-snacks`} className="block text-sm font-medium text-gray-700">
                    Snacks
                  </label>
                  <textarea
                    id={`${day}-snacks`}
                    rows="2"
                    value={menu[day].snacks}
                    onChange={(e) => handleWeeklyInputChange(day, 'snacks', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter snacks menu items"
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor={`${day}-dinner`} className="block text-sm font-medium text-gray-700">
                    Dinner
                  </label>
                  <textarea
                    id={`${day}-dinner`}
                    rows="2"
                    value={menu[day].dinner}
                    onChange={(e) => handleWeeklyInputChange(day, 'dinner', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter dinner menu items"
                    required
                  ></textarea>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save Menu
        </button>
      </div>
    </form>
  );
};

export default MenuForm;