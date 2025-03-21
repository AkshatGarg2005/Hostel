import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import Navbar from '../components/common/Navbar';
import { Container, Card, Nav, Spinner, Alert, Row, Col, Badge, Button } from 'react-bootstrap';

const MessMenu = () => {
  const [menu, setMenu] = useState(null);
  const [menuType, setMenuType] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedDays, setExpandedDays] = useState({});

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('Fetching menu type:', menuType);
        
        const menuQuery = query(
          collection(db, 'messMenu'),
          where('type', '==', menuType),
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        
        console.log('Executing query...');
        const querySnapshot = await getDocs(menuQuery);
        console.log('Query returned:', querySnapshot.size, 'documents');
        
        if (!querySnapshot.empty) {
          const menuData = {
            id: querySnapshot.docs[0].id,
            ...querySnapshot.docs[0].data()
          };
          console.log('Menu data found:', menuData);
          setMenu(menuData);
        } else {
          console.log('No menu data found');
          setMenu(null);
          
          // Add sample menu data for demonstration (remove in production)
          if (process.env.NODE_ENV === 'development') {
            console.log('Adding sample menu for development');
            if (menuType === 'daily') {
              setMenu({
                id: 'sample',
                type: 'daily',
                date: new Date().toISOString().split('T')[0],
                breakfast: 'Sample breakfast - Bread, Eggs, and Fruits',
                lunch: 'Sample lunch - Rice, Dal, and Vegetables',
                snacks: 'Sample snacks - Biscuits and Tea',
                dinner: 'Sample dinner - Roti, Paneer, and Rice',
                createdAt: new Date()
              });
            } else {
              // Sample weekly menu
              const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
              const sampleWeeklyMenu = {
                id: 'sample',
                type: 'weekly',
                createdAt: new Date()
              };
              
              daysOfWeek.forEach(day => {
                sampleWeeklyMenu[day] = {
                  breakfast: `Sample ${day} breakfast`,
                  lunch: `Sample ${day} lunch`,
                  snacks: `Sample ${day} snacks`,
                  dinner: `Sample ${day} dinner`
                };
              });
              
              setMenu(sampleWeeklyMenu);
            }
          }
        }
        
        // Initialize expanded days - set current day to be expanded by default
        if (menuType === 'weekly') {
          const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
          const initialExpandedState = {};
          initialExpandedState[currentDay] = true;
          setExpandedDays(initialExpandedState);
        }
        
      } catch (error) {
        console.error('Error fetching menu:', error);
        setError('Failed to load mess menu: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [menuType]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Not available';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };
  
  const getMealIcon = (meal) => {
    switch(meal.toLowerCase()) {
      case 'breakfast':
        return 'bi-sunrise';
      case 'lunch':
        return 'bi-sun';
      case 'snacks':
        return 'bi-cup-hot';
      case 'dinner':
        return 'bi-moon';
      default:
        return 'bi-question-circle';
    }
  };
  
  const getMealColor = (meal) => {
    switch(meal.toLowerCase()) {
      case 'breakfast':
        return 'primary';
      case 'lunch':
        return 'warning';
      case 'snacks':
        return 'info';
      case 'dinner':
        return 'dark';
      default:
        return 'secondary';
    }
  };
  
  const toggleDayExpansion = (day) => {
    setExpandedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };
  
  const expandAllDays = () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const allExpanded = {};
    days.forEach(day => {
      allExpanded[day] = true;
    });
    setExpandedDays(allExpanded);
  };
  
  const collapseAllDays = () => {
    setExpandedDays({});
  };

  const renderDailyMenu = () => {
    if (!menu) return (
      <Card className="border-0 shadow-sm text-center">
        <Card.Body className="py-5">
          <i className="bi bi-calendar-x text-muted display-1 mb-3"></i>
          <h3 className="text-muted">No Daily Menu Available</h3>
          <p className="text-muted">The menu for today hasn't been published yet.</p>
        </Card.Body>
      </Card>
    );
    
    const currentDate = new Date();
    const isToday = menu.date === currentDate.toISOString().split('T')[0];
    
    return (
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom p-3">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0 d-flex align-items-center">
              <i className="bi bi-calendar-date me-2"></i>
              Daily Menu
            </h4>
            <Badge bg="primary" className="text-white fw-normal py-2 px-3">
              {isToday ? 'Today' : formatDate(menu.createdAt)}
            </Badge>
          </div>
        </Card.Header>
        <Card.Body className="p-4">
          <Row className="g-4">
            {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((meal) => (
              <Col md={6} key={meal}>
                <Card className={`border-0 shadow-sm h-100 bg-${getMealColor(meal)} bg-opacity-10`}>
                  <Card.Body className="p-3">
                    <h5 className={`text-${getMealColor(meal)} mb-3 d-flex align-items-center`}>
                      <i className={`bi ${getMealIcon(meal)} me-2`}></i>
                      {meal}
                    </h5>
                    <div className="meal-content">
                      {menu[meal.toLowerCase()] || "Not specified"}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
    );
  };

  const renderWeeklyMenu = () => {
    if (!menu) return (
      <Card className="border-0 shadow-sm text-center">
        <Card.Body className="py-5">
          <i className="bi bi-calendar-x text-muted display-1 mb-3"></i>
          <h3 className="text-muted">No Weekly Menu Available</h3>
          <p className="text-muted">The weekly menu hasn't been published yet.</p>
        </Card.Body>
      </Card>
    );
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    return (
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom p-3">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0 d-flex align-items-center">
              <i className="bi bi-calendar-week me-2"></i>
              Weekly Menu
            </h4>
            <div>
              <Button 
                variant="outline-primary" 
                size="sm" 
                className="me-2"
                onClick={expandAllDays}
              >
                <i className="bi bi-arrows-expand me-1"></i> Expand All
              </Button>
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={collapseAllDays}
              >
                <i className="bi bi-arrows-collapse me-1"></i> Collapse All
              </Button>
            </div>
          </div>
          <div className="mt-2 text-muted small">
            <i className="bi bi-info-circle me-1"></i>
            Last Updated: {formatDate(menu.createdAt)}
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="weekly-menu">
            {days.map((day, index) => (
              <div key={day} className="weekly-menu-day border-bottom">
                <div 
                  className={`weekly-menu-header p-3 ${currentDay === day ? 'bg-light' : 'bg-white'}`}
                  onClick={() => toggleDayExpansion(day)}
                  style={{cursor: 'pointer'}}
                >
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <div className="me-3 d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10" style={{width: "32px", height: "32px"}}>
                        <span className="fw-bold">{index + 1}</span>
                      </div>
                      <div className="text-capitalize fw-bold">
                        {day}
                        {currentDay === day && (
                          <Badge bg="success" className="ms-2">Today</Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <i className={`bi ${expandedDays[day] ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                    </div>
                  </div>
                </div>
                
                {expandedDays[day] && (
                  <div className="weekly-menu-content p-3 bg-light">
                    <Row className="g-3">
                      {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((meal) => (
                        <Col md={6} key={`${day}-${meal}`}>
                          <Card className={`border-0 shadow-sm h-100 bg-${getMealColor(meal)} bg-opacity-10`}>
                            <Card.Body className="p-3">
                              <h5 className={`text-${getMealColor(meal)} mb-2 d-flex align-items-center`}>
                                <i className={`bi ${getMealIcon(meal)} me-2`}></i>
                                {meal}
                              </h5>
                              <div className="meal-content">
                                {menu[day]?.[meal.toLowerCase()] || "Not specified"}
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>
    );
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      
      <Container className="py-4">
        <div className="d-flex align-items-center mb-4">
          <div className="bg-info bg-opacity-10 p-2 rounded-circle me-3">
            <i className="bi bi-calendar3 text-info fs-4"></i>
          </div>
          <h1 className="mb-0">Mess Menu</h1>
        </div>
        
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-0">
            <Nav variant="pills" className="p-2">
              <Nav.Item>
                <Nav.Link 
                  active={menuType === 'daily'} 
                  onClick={() => setMenuType('daily')}
                  className="d-flex align-items-center"
                >
                  <i className="bi bi-calendar-date me-2"></i>
                  Daily Menu
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  active={menuType === 'weekly'}
                  onClick={() => setMenuType('weekly')}
                  className="d-flex align-items-center"
                >
                  <i className="bi bi-calendar-week me-2"></i>
                  Weekly Menu
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Body>
        </Card>
        
        {error && (
          <Alert variant="danger" className="d-flex align-items-center mb-4">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <div>{error}</div>
          </Alert>
        )}
        
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-grow text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading menu...</p>
          </div>
        ) : (
          menuType === 'daily' ? renderDailyMenu() : renderWeeklyMenu()
        )}
        
        <style jsx>{`
          .meal-content {
            white-space: pre-line;
          }
          .weekly-menu-day:last-child {
            border-bottom: none !important;
          }
          .weekly-menu-header:hover {
            background-color: rgba(0, 0, 0, 0.03);
          }
        `}</style>
      </Container>
    </div>
  );
};

export default MessMenu;