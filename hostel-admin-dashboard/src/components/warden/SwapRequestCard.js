import React, { useState } from 'react';
import { Card, Badge, Button, Form, Row, Col, Collapse } from 'react-bootstrap';

const SwapRequestCard = ({ request, onApprove, onReject }) => {
  const [expanded, setExpanded] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const handleRejectClick = () => {
    onReject(request.id, rejectionReason);
    setShowRejectForm(false);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'badge-pending';
      case 'approved':
        return 'badge-approved';
      case 'rejected':
        return 'badge-rejected';
      case 'cancelled':
        return 'bg-secondary bg-opacity-10 text-secondary';
      case 'completed':
        return 'badge-completed';
      default:
        return 'bg-secondary bg-opacity-10 text-secondary';
    }
  };

  return (
    <Card className="custom-card mb-3 border-0">
      <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <div>
            <h5 className="mb-0 fw-semibold">
              {request.studentName}
            </h5>
            <p className="text-muted mb-0 small">
              Room {request.roomNumber} • {request.regNumber}
            </p>
          </div>
        </div>
        <div className="d-flex align-items-center">
          <Badge 
            className={`me-2 ${getStatusBadgeClass(request.status)}`}
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
              <div className="col-md-6 col-lg-3 mb-3">
                <h6 className="text-muted fw-semibold small">CONTACT NUMBER</h6>
                <p>{request.contactNumber}</p>
              </div>
              
              <div className="col-md-6 col-lg-3 mb-3">
                <h6 className="text-muted fw-semibold small">REQUESTED ON</h6>
                <p>{formatDate(request.createdAt)}</p>
              </div>
              
              <div className="col-md-6 col-lg-3 mb-3">
                <h6 className="text-muted fw-semibold small">PREFERRED FLOOR</h6>
                <p>{request.preferredFloor || 'Not specified'}</p>
              </div>
              
              <div className="col-md-6 col-lg-3 mb-3">
                <h6 className="text-muted fw-semibold small">PREFERRED ROOM TYPE</h6>
                <p>{request.preferredRoomType || 'Not specified'}</p>
              </div>
              
              <div className="col-12 mb-3">
                <h6 className="text-muted fw-semibold small">REASON FOR SWAP</h6>
                <Card className="bg-light border-0">
                  <Card.Body className="py-3">
                    {request.reason}
                  </Card.Body>
                </Card>
              </div>
              
              {request.additionalInfo && (
                <div className="col-12 mb-3">
                  <h6 className="text-muted fw-semibold small">ADDITIONAL INFORMATION</h6>
                  <Card className="bg-light border-0">
                    <Card.Body className="py-3">
                      {request.additionalInfo}
                    </Card.Body>
                  </Card>
                </div>
              )}
              
              {request.status === 'approved' && (
                <div className="col-12">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <h6 className="text-muted fw-semibold small">APPROVED BY</h6>
                      <p>{request.approvedBy}</p>
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <h6 className="text-muted fw-semibold small">APPROVED ON</h6>
                      <p>{formatDate(request.approvedAt)}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {request.status === 'rejected' && (
                <div className="col-12">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <h6 className="text-muted fw-semibold small">REJECTED BY</h6>
                      <p>{request.rejectedBy}</p>
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <h6 className="text-muted fw-semibold small">REJECTED ON</h6>
                      <p>{formatDate(request.rejectedAt)}</p>
                    </div>
                    
                    <div className="col-12 mb-3">
                      <h6 className="text-muted fw-semibold small">REJECTION REASON</h6>
                      <Card className="bg-light border-0">
                        <Card.Body className="py-3">
                          {request.rejectionReason || 'No reason provided'}
                        </Card.Body>
                      </Card>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card.Body>
          
          {request.status === 'pending' && (
            <Card.Footer className="bg-white border-top py-3">
              {!showRejectForm ? (
                <div className="d-flex justify-content-end">
                  <Button
                    variant="success"
                    size="sm"
                    className="me-2"
                    onClick={() => onApprove(request.id)}
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
                    Approve
                  </Button>
                  
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => setShowRejectForm(true)}
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
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Reject
                  </Button>
                </div>
              ) : (
                <div>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Rejection Reason:</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Provide a reason for rejection (optional)"
                    />
                  </Form.Group>
                  
                  <div className="d-flex justify-content-end">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="me-2"
                      onClick={() => setShowRejectForm(false)}
                    >
                      Cancel
                    </Button>
                    
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleRejectClick}
                    >
                      Confirm Rejection
                    </Button>
                  </div>
                </div>
              )}
            </Card.Footer>
          )}
        </div>
      </Collapse>
    </Card>
  );
};

export default SwapRequestCard;