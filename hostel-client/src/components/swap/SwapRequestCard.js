import React, { useState } from 'react';
import { Card, Badge, Button, Collapse, Row, Col } from 'react-bootstrap';

const SwapRequestCard = ({ request, isOwnRequest, onCancel }) => {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getStatusBadge = () => {
    switch(request.status) {
      case 'pending':
        return (
          <Badge bg="warning" text="dark" className="d-flex align-items-center">
            <i className="bi bi-clock me-1"></i> Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge bg="success" className="d-flex align-items-center">
            <i className="bi bi-check-circle me-1"></i> Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge bg="danger" className="d-flex align-items-center">
            <i className="bi bi-x-circle me-1"></i> Rejected
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge bg="secondary" className="d-flex align-items-center">
            <i className="bi bi-slash-circle me-1"></i> Cancelled
          </Badge>
        );
      case 'completed':
        return (
          <Badge bg="info" className="d-flex align-items-center">
            <i className="bi bi-check-all me-1"></i> Completed
          </Badge>
        );
      default:
        return <Badge bg="secondary">{request.status}</Badge>;
    }
  };

  return (
    <Card className="shadow-sm border-0 mb-2">
      <Card.Header className="bg-white d-flex justify-content-between align-items-center border-bottom">
        <div className="d-flex align-items-center">
          <div className={`me-3 rounded-circle bg-info bg-opacity-10 p-2`}>
            <i className="bi bi-arrow-left-right text-info fs-4"></i>
          </div>
          <div>
            <h5 className="mb-0 d-flex align-items-center">
              {isOwnRequest ? 'My Request' : request.studentName}
            </h5>
            <div className="mt-1 d-flex">
              {getStatusBadge()}
              {!isOwnRequest && request.preferredFloor && (
                <Badge bg="light" text="dark" className="ms-2">
                  Preferred: {request.preferredFloor}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="d-flex align-items-center">
          <small className="text-muted me-3 d-none d-md-block">
            {formatDate(request.createdAt)}
          </small>
          <Button 
            variant="light" 
            size="sm"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            className="border"
          >
            {expanded ? 'Hide Details' : 'View Details'}
            <i className={`bi ${expanded ? 'bi-chevron-up' : 'bi-chevron-down'} ms-1`}></i>
          </Button>
        </div>
      </Card.Header>
      
      <Collapse in={expanded}>
        <div>
          <Card.Body className="p-3">
            <Row className="g-3">
              {!isOwnRequest && (
                <Col md={6} className="mb-3">
                  <Card className="h-100 border-0 bg-light">
                    <Card.Body className="p-3">
                      <h6 className="text-info mb-1">
                        <i className="bi bi-person me-1"></i> Student Information
                      </h6>
                      <p className="mb-0">
                        <strong>Name:</strong> {request.studentName}<br />
                        <strong>Contact:</strong> <a href={`tel:${request.contactNumber}`}>{request.contactNumber}</a><br />
                        <strong>Registration:</strong> {request.regNumber}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              )}
              
              <Col md={isOwnRequest ? 12 : 6}>
                <Card className="h-100 border-0 bg-light">
                  <Card.Body className="p-3">
                    <h6 className="text-info mb-1">
                      <i className="bi bi-chat-left-text me-1"></i> Swap Reason
                    </h6>
                    <p className="mb-0">{request.reason}</p>
                  </Card.Body>
                </Card>
              </Col>
              
              {(request.preferredFloor || request.preferredRoomType) && (
                <Col md={6}>
                  <Card className="h-100 border-0 bg-light">
                    <Card.Body className="p-3">
                      <h6 className="text-info mb-1">
                        <i className="bi bi-list-check me-1"></i> Preferences
                      </h6>
                      <p className="mb-0">
                        {request.preferredFloor && (
                          <><strong>Preferred Floor:</strong> {request.preferredFloor}<br /></>
                        )}
                        {request.preferredRoomType && (
                          <><strong>Room Type:</strong> {request.preferredRoomType}</>
                        )}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              )}
              
              {request.additionalInfo && (
                <Col md={6}>
                  <Card className="h-100 border-0 bg-light">
                    <Card.Body className="p-3">
                      <h6 className="text-info mb-1">
                        <i className="bi bi-info-circle me-1"></i> Additional Information
                      </h6>
                      <p className="mb-0">{request.additionalInfo}</p>
                    </Card.Body>
                  </Card>
                </Col>
              )}
              
              {isOwnRequest && (
                <Col md={6}>
                  <Card className="h-100 border-0 bg-light">
                    <Card.Body className="p-3">
                      <h6 className="text-info mb-1">
                        <i className="bi bi-building me-1"></i> Current Room
                      </h6>
                      <p className="mb-0">
                        <strong>Room Number:</strong> {request.roomNumber}<br />
                        <strong>Requested On:</strong> {formatDate(request.createdAt)}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              )}
              
              {request.status === 'approved' && request.approvedAt && (
                <Col md={6}>
                  <Card className="h-100 border-0 bg-success bg-opacity-10">
                    <Card.Body className="p-3">
                      <h6 className="text-success mb-1">
                        <i className="bi bi-calendar-check me-1"></i> Approval Details
                      </h6>
                      <p className="mb-0">
                        <strong>Approved By:</strong> {request.approvedBy || 'Warden'}<br />
                        <strong>Approved On:</strong> {formatDate(request.approvedAt)}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              )}
              
              {request.status === 'rejected' && request.rejectedAt && (
                <Col md={6}>
                  <Card className="h-100 border-0 bg-danger bg-opacity-10">
                    <Card.Body className="p-3">
                      <h6 className="text-danger mb-1">
                        <i className="bi bi-calendar-x me-1"></i> Rejection Details
                      </h6>
                      <p className="mb-0">
                        <strong>Rejected By:</strong> {request.rejectedBy || 'Warden'}<br />
                        <strong>Rejected On:</strong> {formatDate(request.rejectedAt)}<br />
                        {request.rejectionReason && (
                          <><strong>Reason:</strong> {request.rejectionReason}</>
                        )}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              )}
            </Row>
            
            {isOwnRequest && request.status === 'pending' && (
              <div className="mt-3 text-end">
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => onCancel(request.id)}
                >
                  <i className="bi bi-x-circle me-1"></i> Cancel Request
                </Button>
              </div>
            )}
            
            {!isOwnRequest && (
              <div className="mt-3 text-center">
                <Button 
                  variant="info" 
                  className="text-white"
                  href={`tel:${request.contactNumber}`}
                >
                  <i className="bi bi-telephone me-1"></i> Contact {request.studentName.split(' ')[0]}
                </Button>
                <p className="mt-2 text-muted small">
                  <i className="bi bi-info-circle me-1"></i>
                  Discuss your room preferences directly. Room number will not be revealed for privacy until you both agree to swap.
                </p>
              </div>
            )}
          </Card.Body>
        </div>
      </Collapse>
    </Card>
  );
};

export default SwapRequestCard;