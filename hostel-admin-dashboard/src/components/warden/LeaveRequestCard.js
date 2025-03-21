import React, { useState } from 'react';
import { Card, Badge, Button, Form, Row, Col, Collapse } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';

const LeaveRequestCard = ({ request, onApprove, onReject }) => {
  const [expanded, setExpanded] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [validTillDate, setValidTillDate] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const handleApproveClick = () => {
    if (!validTillDate) {
      alert('Please select a valid till date');
      return;
    }
    
    onApprove(request.id, validTillDate);
  };

  const handleRejectClick = () => {
    onReject(request.id, rejectionReason);
    setShowRejectForm(false);
  };

  // Generate QR data
  const generateQRData = () => {
    const qrData = {
      id: request.id,
      studentName: request.studentName,
      regNumber: request.regNumber,
      roomNumber: request.roomNumber,
      checkoutDate: formatDate(request.checkoutDate),
      validTill: formatDate(request.validTill),
      reason: request.reason,
      approvedBy: request.approvedBy,
      approvedAt: formatDate(request.approvedAt)
    };
    
    return JSON.stringify(qrData);
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
      default:
        return 'bg-secondary bg-opacity-10 text-secondary';
    }
  };

  // Calculate the number of days between dates
  const getDaysDifference = (startDate, endDate) => {
    if (!startDate || !endDate) return null;
    
    const start = startDate.toDate ? startDate.toDate() : new Date(startDate);
    const end = endDate.toDate ? endDate.toDate() : new Date(endDate);
    
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const leaveDuration = getDaysDifference(request.checkoutDate, request.returnDate);

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
                <h6 className="text-muted fw-semibold small">CHECKOUT DATE</h6>
                <p>{formatDate(request.checkoutDate)}</p>
              </div>
              
              <div className="col-md-6 col-lg-3 mb-3">
                <h6 className="text-muted fw-semibold small">RETURN DATE</h6>
                <p>{formatDate(request.returnDate)}</p>
              </div>
              
              <div className="col-md-6 col-lg-3 mb-3">
                <h6 className="text-muted fw-semibold small">DURATION</h6>
                <p>{leaveDuration} day{leaveDuration !== 1 ? 's' : ''}</p>
              </div>
              
              <div className="col-md-6 col-lg-3 mb-3">
                <h6 className="text-muted fw-semibold small">REQUESTED ON</h6>
                <p>{formatDate(request.createdAt)}</p>
              </div>
              
              <div className="col-12 mb-3">
                <h6 className="text-muted fw-semibold small">REASON FOR LEAVE</h6>
                <Card className="bg-light border-0">
                  <Card.Body className="py-3">
                    {request.reason}
                  </Card.Body>
                </Card>
              </div>
              
              {request.status === 'approved' && (
                <div className="col-12">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <h6 className="text-muted fw-semibold small">APPROVED BY</h6>
                      <p>{request.approvedBy}</p>
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <h6 className="text-muted fw-semibold small">VALID TILL</h6>
                      <p>{formatDate(request.validTill)}</p>
                    </div>
                    
                    <div className="col-12 mb-3">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => setShowQR(!showQR)}
                        className="d-flex align-items-center"
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
                          className="me-2"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <path d="M8 7h.01M7 12h.01M7 17h.01M12 7h.01M12 12h.01M12 17h.01M17 7h.01M17 12h.01M17 17h.01"></path>
                        </svg>
                        {showQR ? 'Hide QR Code' : 'Show QR Code'}
                      </Button>
                      
                      <Collapse in={showQR}>
                        <div>
                          <div className="mt-3 d-flex justify-content-center">
                            <div className="p-4 bg-white rounded border shadow-sm text-center">
                              <QRCodeSVG value={generateQRData()} size={200} />
                              <p className="mt-3 mb-0 text-center text-muted small">
                                <span className="d-block fw-semibold mb-1">Leave Permission QR Code</span>
                                Valid till: {formatDate(request.validTill)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Collapse>
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
                <Row className="align-items-center">
                  <Col xs={12} md={6} className="mb-3 mb-md-0">
                    <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center">
                      <Form.Label className="me-sm-3 mb-2 mb-sm-0 fw-medium">Valid Till:</Form.Label>
                      <Form.Control
                        type="date"
                        size="sm"
                        value={validTillDate}
                        onChange={(e) => setValidTillDate(e.target.value)}
                        className="flex-grow-1"
                        required
                      />
                    </div>
                  </Col>
                  
                  <Col xs={12} md={6} className="d-flex justify-content-end">
                    <Button
                      variant="success"
                      size="sm"
                      className="me-2"
                      onClick={handleApproveClick}
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
                  </Col>
                </Row>
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

export default LeaveRequestCard;