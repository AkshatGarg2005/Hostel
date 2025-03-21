import React, { useState } from 'react';
import { Card, Badge, Button, Collapse } from 'react-bootstrap';

const ComplaintCard = ({ complaint, onResolve, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="custom-card mb-3 border-0">
      <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <div>
            <h5 className="mb-0 fw-semibold">
              Complaint #{complaint.id.slice(-5)}
            </h5>
            <p className="text-muted mb-0 small">
              From {complaint.studentName} • Room {complaint.roomNumber}
            </p>
          </div>
        </div>
        <div className="d-flex align-items-center">
          <Badge 
            className={`me-2 ${complaint.status === 'pending' ? 'badge-pending' : 'badge-resolved'}`}
          >
            {complaint.status}
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
              className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
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
                <h6 className="text-muted fw-semibold small">REGISTRATION NUMBER</h6>
                <p>{complaint.regNumber}</p>
              </div>
              
              <div className="col-md-6 mb-3">
                <h6 className="text-muted fw-semibold small">SUBMITTED ON</h6>
                <p>{formatDate(complaint.createdAt)}</p>
              </div>
              
              <div className="col-md-6 mb-3">
                <h6 className="text-muted fw-semibold small">CATEGORY</h6>
                <p>{complaint.category}</p>
              </div>
              
              <div className="col-md-6 mb-3">
                <h6 className="text-muted fw-semibold small">STATUS</h6>
                <p className="text-capitalize">
                  {complaint.status}
                  {complaint.status === 'resolved' && complaint.resolvedAt && (
                    <span className="text-muted ms-2 small">
                      (on {formatDate(complaint.resolvedAt)})
                    </span>
                  )}
                </p>
              </div>
              
              <div className="col-12">
                <h6 className="text-muted fw-semibold small">COMPLAINT DESCRIPTION</h6>
                <Card className="bg-light border-0">
                  <Card.Body className="py-3">
                    {complaint.description}
                  </Card.Body>
                </Card>
              </div>
            </div>
          </Card.Body>
          
          <Card.Footer className="bg-white border-top d-flex justify-content-end py-3">
            {complaint.status === 'pending' && (
              <Button
                variant="success"
                size="sm"
                className="me-2"
                onClick={() => onResolve(complaint.id)}
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
                Mark as Resolved
              </Button>
            )}
            
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => onDelete(complaint.id)}
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

export default ComplaintCard;