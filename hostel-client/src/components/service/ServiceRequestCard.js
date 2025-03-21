import React from 'react';
import { Card, Badge, Row, Col } from 'react-bootstrap';

const ServiceRequestCard = ({ request }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Get badge variant based on service type
  const getBadgeVariant = (type) => {
    switch (type.toLowerCase()) {
      case 'electrician':
        return 'warning';
      case 'plumber':
        return 'info';
      case 'carpenter':
        return 'secondary';
      case 'laundry':
        return 'purple'; // Custom color, would need CSS
      case 'cab':
        return 'success';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0">Token #{request.tokenNumber}</h5>
          <div className="mt-1">
            <Badge bg={getBadgeVariant(request.serviceType)} className="me-2">
              {request.serviceType}
            </Badge>
            <Badge bg={request.status === 'pending' ? 'warning' : 'success'}>
              {request.status}
            </Badge>
          </div>
        </div>
        <small className="text-muted">
          Requested: {formatDate(request.createdAt)}
        </small>
      </Card.Header>
      
      <Card.Body>
        <Row>
          <Col md={6} className="mb-3">
            <h6>Room Number</h6>
            <p>{request.roomNumber}</p>
          </Col>
          
          <Col md={6} className="mb-3">
            <h6>Contact Number</h6>
            <p>{request.contactNumber}</p>
          </Col>
          
          <Col xs={12} className="mb-3">
            <h6>Problem Description</h6>
            <p>{request.problem}</p>
          </Col>
          
          {request.status === 'accepted' && request.acceptedAt && (
            <Col xs={12}>
              <h6>Accepted At</h6>
              <p>{formatDate(request.acceptedAt)}</p>
            </Col>
          )}
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ServiceRequestCard;