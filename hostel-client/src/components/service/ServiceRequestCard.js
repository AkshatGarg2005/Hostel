import React from 'react';
import { Card, Badge, Row, Col } from 'react-bootstrap';

const ServiceRequestCard = ({ request }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Get badge variant and icon based on service type
  const getServiceTypeInfo = (type) => {
    switch (type.toLowerCase()) {
      case 'electrician':
        return {
          variant: 'warning',
          icon: 'bi-lightning-charge-fill',
          label: 'Electrician'
        };
      case 'plumber':
        return {
          variant: 'info',
          icon: 'bi-droplet-fill',
          label: 'Plumber'
        };
      case 'carpenter':
        return {
          variant: 'secondary',
          icon: 'bi-hammer',
          label: 'Carpenter'
        };
      case 'laundry':
        return {
          variant: 'primary',
          icon: 'bi-basket3-fill',
          label: 'Laundry'
        };
      case 'cab':
        return {
          variant: 'success',
          icon: 'bi-car-front-fill',
          label: 'Cab'
        };
      default:
        return {
          variant: 'secondary',
          icon: 'bi-tools',
          label: type
        };
    }
  };

  const serviceTypeInfo = getServiceTypeInfo(request.serviceType);

  const getStatusBadge = () => {
    if (request.status === 'pending') {
      return (
        <Badge bg="warning" text="dark" className="d-flex align-items-center">
          <i className="bi bi-clock me-1"></i> Pending
        </Badge>
      );
    } else if (request.status === 'accepted') {
      return (
        <Badge bg="success" className="d-flex align-items-center">
          <i className="bi bi-check-circle me-1"></i> Accepted
        </Badge>
      );
    } else {
      return <Badge bg="secondary">{request.status}</Badge>;
    }
  };

  return (
    <Card className="shadow-sm border-0 mb-4 service-request-card">
      <Card.Header className="bg-white d-flex justify-content-between align-items-center border-bottom">
        <div className="d-flex align-items-center">
          <div className={`me-3 rounded-circle bg-${serviceTypeInfo.variant} bg-opacity-10 p-2`}>
            <i className={`bi ${serviceTypeInfo.icon} text-${serviceTypeInfo.variant} fs-4`}></i>
          </div>
          <div>
            <h5 className="mb-0 d-flex align-items-center">
              Token #{request.tokenNumber}
            </h5>
            <div className="mt-1 d-flex">
              <Badge 
                bg={serviceTypeInfo.variant} 
                className="me-2 d-flex align-items-center"
              >
                <i className={`bi ${serviceTypeInfo.icon} me-1`}></i> {serviceTypeInfo.label}
              </Badge>
              {getStatusBadge()}
            </div>
          </div>
        </div>
        <div className="text-end">
          <small className="text-muted d-block">Requested on:</small>
          <span className="fw-medium">{formatDate(request.createdAt)}</span>
        </div>
      </Card.Header>
      
      <Card.Body>
        <Row className="g-3">
          <Col md={6}>
            <Card className="h-100 border-0 bg-light">
              <Card.Body className="p-3">
                <h6 className="text-primary mb-1">
                  <i className="bi bi-door-closed me-1"></i> Room Number
                </h6>
                <p className="mb-0 fw-medium">{request.roomNumber}</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6}>
            <Card className="h-100 border-0 bg-light">
              <Card.Body className="p-3">
                <h6 className="text-primary mb-1">
                  <i className="bi bi-telephone me-1"></i> Contact Number
                </h6>
                <p className="mb-0 fw-medium">{request.contactNumber}</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xs={12}>
            <Card className="h-100 border-0 bg-light">
              <Card.Body className="p-3">
                <h6 className="text-primary mb-1">
                  <i className="bi bi-chat-left-text me-1"></i> Problem Description
                </h6>
                <p className="mb-0">{request.problem}</p>
              </Card.Body>
            </Card>
          </Col>
          
          {request.status === 'accepted' && request.acceptedAt && (
            <Col xs={12}>
              <Card className="h-100 border-0 bg-success bg-opacity-10">
                <Card.Body className="p-3">
                  <h6 className="text-success mb-1">
                    <i className="bi bi-calendar-check me-1"></i> Accepted At
                  </h6>
                  <p className="mb-0">{formatDate(request.acceptedAt)}</p>
                  {request.assignedTo && (
                    <div className="mt-2">
                      <small className="text-muted">Assigned to:</small>
                      <span className="fw-medium d-block">{request.assignedTo}</span>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ServiceRequestCard;