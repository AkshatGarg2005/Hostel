import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import Navbar from '../components/common/Navbar';
import { Container, Card, Nav, Spinner, Alert, Row, Col } from 'react-bootstrap';

const MessMenu = () => {
  const [menu, setMenu] = useState(null);
  const [menuType, setMenuType] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const renderDailyMenu = () => {
    if (!menu) return <Alert variant="info">No daily menu available. Please check back later.</Alert>;
    
    return (
      <Card>
        <Card.Header>
          <h5 className="mb-0">Daily Menu for {menu.date || formatDate(menu.createdAt)}</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header className="bg-light">Breakfast</Card.Header>
                <Card.Body>
                  <div className="menu-content">{menu.breakfast || "Not specified"}</div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header className="bg-light">Lunch</Card.Header>
                <Card.Body>
                  <div className="menu-content">{menu.lunch || "Not specified"}</div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header className="bg-light">Snacks</Card.Header>
                <Card.Body>
                  <div className="menu-content">{menu.snacks || "Not specified"}</div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header className="bg-light">Dinner</Card.Header>
                <Card.Body>
                  <div className="menu-content">{menu.dinner || "Not specified"}</div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  const renderWeeklyMenu = () => {
    if (!menu) return <Alert variant="info">No weekly menu available. Please check back later.</Alert>;
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    return (
      <Card>
        <Card.Header>
          <h5 className="mb-0">Weekly Menu (Last Updated: {formatDate(menu.createdAt)})</h5>
        </Card.Header>
        <Card.Body>
          {days.map((day) => (
            <Card key={day} className="mb-4">
              <Card.Header className="bg-light text-capitalize">
                <h5 className="mb-0">{day}</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6} className="mb-3">
                    <h6>Breakfast</h6>
                    <div className="menu-content">
                      {menu[day]?.breakfast || "Not specified"}
                    </div>
                  </Col>
                  
                  <Col md={6} className="mb-3">
                    <h6>Lunch</h6>
                    <div className="menu-content">
                      {menu[day]?.lunch || "Not specified"}
                    </div>
                  </Col>
                  
                  <Col md={6} className="mb-3">
                    <h6>Snacks</h6>
                    <div className="menu-content">
                      {menu[day]?.snacks || "Not specified"}
                    </div>
                  </Col>
                  
                  <Col md={6} className="mb-3">
                    <h6>Dinner</h6>
                    <div className="menu-content">
                      {menu[day]?.dinner || "Not specified"}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </Card.Body>
      </Card>
    );
  };

  return (
    <>
      <Navbar />
      
      <Container className="py-4">
        <h1 className="mb-4">Mess Menu</h1>
        
        <Card className="mb-4">
          <Card.Header>
            <Nav variant="tabs" className="card-header-tabs">
              <Nav.Item>
                <Nav.Link 
                  active={menuType === 'daily'} 
                  onClick={() => setMenuType('daily')}
                >
                  Daily Menu
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  active={menuType === 'weekly'}
                  onClick={() => setMenuType('weekly')}
                >
                  Weekly Menu
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
        </Card>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading menu...</p>
          </div>
        ) : (
          menuType === 'daily' ? renderDailyMenu() : renderWeeklyMenu()
        )}
        
        <style jsx>{`
          .menu-content {
            white-space: pre-line;
          }
        `}</style>
      </Container>
    </>
  );
};

export default MessMenu;