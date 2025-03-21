import React, { useState } from 'react';
import { Card, Badge, Button, Collapse } from 'react-bootstrap';

const ServiceRequestCard = ({ request, onAccept, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Determine badge color based on service type
  const getServiceTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'electrician':
        return 'badge-electrician';
      case 'plumber':
        return 'badge-plumber';
      case 'carpenter':
        return 'badge-carpenter';
      case 'laundry':
        return 'badge-laundry';
      case 'cab':
        return 'badge-cab';
      default:
        return 'bg-secondary bg-opacity-10 text-secondary';
    }
  };

  // Get service icon based on type
  const getServiceIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'electrician':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
            <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
            <line x1="12" y1="20" x2="12.01" y2="20"></line>
          </svg>
        );
      case 'plumber':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 8v-2a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v2"></path>
            <path d="M2 9h20v12H2z"></path>
            <path d="M12 14v4"></path>
            <path d="M8 14v4"></path>
            <path d="M16 14v4"></path>
          </svg>
        );
      case 'carpenter':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 10h18"></path>
            <path d="M12 10v10"></path>
            <circle cx="12" cy="5" r="2"></circle>
            <path d="M12 7v3"></path>
          </svg>
        );
      case 'laundry':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="12" cy="12" r="4"></circle>
            <path d="M12 8v8"></path>
            <path d="M8 12h8"></path>
          </svg>
        );
      case 'cab':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 17h2v5H3v-5h2"></path>
            <path d="M8 17h8"></path>
            <path d="M9 17v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"></path>
            <path d="M6 7.2A9.2 9.2 0 0 1 12 3a8.8 8.8 0 0 1 6 4.2V16H6V7.2Z"></path>
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="14 2 18 6 7 17 3 17 3 13 14 2"></polygon>
            <line x1="3" y1="22" x2="21" y2="22"></line>
          </svg>
        );
    }
  };

  return (
    <Card className="custom-card mb-3 border-0">
      <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <div>
            <h5 className="mb-0 fw-semibold">
              Token #{request.tokenNumber || request.id.slice(-5)}
            </h5>
            <p className="text-muted mb-0 small">
              Room {request.roomNumber} • {request.regNumber}
            </p>
          </div>
        </div>
        <div className="d-flex align-items-center">
          <Badge className={`me-2 ${getServiceTypeColor(request.serviceType)}`}>
            <span className="d-flex align-items-center">
              {getServiceIcon(request.serviceType)}
              <span className="ms-1">{request.serviceType}</span>
            </span>
          </Badge>
          
          <Badge 
            className={`me-2 ${request.status === 'pending' ? 'badge-pending' : 'badge-approved'}`}
          >
            {request.status}
          </Badge>
          
          <Button 
            variant="link" 
            className="text-muted p-0 ms-2"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          >
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
              style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </Button>
        </div>
      </Card.Header>
      
      <Collapse in={expanded}>
        <div>
          <Card.Body className="pt-0 pb-3">
            <div className="row mt-3">
              <div className="col-md-6 mb-3">
                <h6 className="text-muted fw-semibold small">CONTACT NUMBER</h6>
                <p>{request.contactNumber}</p>
              </div>
              
              <div className="col-md-6 mb-3">
                <h6 className="text-muted fw-semibold small">REQUESTED ON</h6>
                <p>{formatDate(request.createdAt)}</p>
              </div>
              
              <div className="col-md-6 mb-3">
                <h6 className="text-muted fw-semibold small">SERVICE TYPE</h6>
                <div className="d-flex align-items-center">
                  <Badge className={`${getServiceTypeColor(request.serviceType)} me-2`}>
                    {getServiceIcon(request.serviceType)}
                  </Badge>
                  <span>{request.serviceType}</span>
                </div>
              </div>
              
              <div className="col-md-6 mb-3">
                <h6 className="text-muted fw-semibold small">STATUS</h6>
                <p className="text-capitalize">
                  {request.status}
                  {request.status === 'accepted' && request.acceptedAt && (
                    <span className="text-muted ms-2 small">
                      (on {formatDate(request.acceptedAt)})
                    </span>
                  )}
                </p>
              </div>
              
              <div className="col-12">
                <h6 className="text-muted fw-semibold small">PROBLEM DESCRIPTION</h6>
                <Card className="bg-light border-0">
                  <Card.Body className="py-3">
                    {request.problem}
                  </Card.Body>
                </Card>
              </div>
            </div>
          </Card.Body>
          
          <Card.Footer className="bg-white border-top d-flex justify-content-end py-3">
            {request.status === 'pending' && (
              <Button
                variant="success"
                size="sm"
                className="me-2"
                onClick={() => onAccept(request.id)}
              >
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
                  className="me-1"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Accept Request
              </Button>
            )}
            
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => onDelete(request.id)}
            >
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
                className="me-1"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Delete
            </Button>
          </Card.Footer>
        </div>
      </Collapse>
    </Card>
  );
};

export default ServiceRequestCard;