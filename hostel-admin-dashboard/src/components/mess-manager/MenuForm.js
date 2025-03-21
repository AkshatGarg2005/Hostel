import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';

const MenuForm = ({ type, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      await onSubmit(menu);
      setSuccessMessage('Menu saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving menu:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const weekdays = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const mealTypes = [
    { key: 'breakfast', label: 'Breakfast', icon: '☕' },
    { key: 'lunch', label: 'Lunch', icon: '🍚' },
    { key: 'snacks', label: 'Snacks', icon: '🍪' },
    { key: 'dinner', label: 'Dinner', icon: '🍽️' }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading menu data...</p>
      </div>
    );
  }

  return (
    <Form onSubmit={handleSubmit}>
      {successMessage && (
        <Alert variant="success" className="d-flex align-items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="me-2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          {successMessage}
        </Alert>
      )}
      
      {type === 'daily' ? (
        <Card className="shadow-sm border-0 mb-4">
          <Card.Body>
            <h5 className="card-title mb-4">Daily Menu</h5>
            <Form.Group className="mb-4">
              <Form.Label className="fw-medium">Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={menu.date}
                onChange={handleDailyInputChange}
                className="shadow-sm"
                required
              />
            </Form.Group>
            
            {mealTypes.map(meal => (
              <Form.Group key={meal.key} className="mb-4">
                <Form.Label className="fw-medium d-flex align-items-center">
                  <span className="me-2">{meal.icon}</span>
                  {meal.label}
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows="3"
                  name={meal.key}
                  value={menu[meal.key]}
                  onChange={handleDailyInputChange}
                  className="shadow-sm"
                  placeholder={`Enter ${meal.label.toLowerCase()} menu items...`}
                  required
                />
                <Form.Text className="text-muted">
                  Enter each item separated by a comma or new line
                </Form.Text>
              </Form.Group>
            ))}
          </Card.Body>
        </Card>
      ) : (
        <div className="mb-4">
          {weekdays.map((day, index) => (
            <Card 
              key={day.key} 
              className="shadow-sm border-0 mb-4"
            >
              <Card.Header className="bg-light py-3 border-0">
                <h5 className="mb-0 fw-semibold">{day.label}</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  {mealTypes.map(meal => (
                    <Col md={6} key={`${day.key}-${meal.key}`} className="mb-3">
                      <Form.Group>
                        <Form.Label className="fw-medium d-flex align-items-center">
                          <span className="me-2">{meal.icon}</span>
                          {meal.label}
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows="2"
                          value={menu[day.key][meal.key]}
                          onChange={(e) => handleWeeklyInputChange(day.key, meal.key, e.target.value)}
                          className="shadow-sm"
                          placeholder={`Enter ${meal.label.toLowerCase()} items...`}
                          required
                        />
                      </Form.Group>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
      
      <div className="d-flex justify-content-end">
        <Button
          type="submit"
          variant="primary"
          className="d-flex align-items-center"
          disabled={saveLoading}
        >
          {saveLoading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Saving...
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="me-2"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              Save Menu
            </>
          )}
        </Button>
      </div>
    </Form>
  );
};

export default MenuForm;