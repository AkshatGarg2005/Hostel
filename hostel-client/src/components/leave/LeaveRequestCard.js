import React, { useState } from 'react';
import { Card, Badge, Row, Col, Button, Alert } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';

const LeaveRequestCard = ({ request }) => {
  const [showQR, setShowQR] = useState(false);
  const [qrError, setQrError] = useState('');

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error, timestamp);
      return 'Invalid date';
    }
  };

  // Generate QR data for approved requests
  const generateQRData = () => {
    try {
      const qrData = {
        id: request.id,
        studentName: request.studentName || 'N/A',
        regNumber: request.regNumber || 'N/A',
        roomNumber: request.roomNumber || 'N/A',
        checkoutDate: formatDate(request.checkoutDate),
        validTill: formatDate(request.validTill || request.returnDate),
        reason: request.reason || 'N/A',
        approvedBy: request.approvedBy || 'N/A',
        approvedAt: request.approvedAt ? formatDate(request.approvedAt) : 'N/A'
      };
      
      return JSON.stringify(qrData);
    } catch (error) {
      console.error('Error generating QR data:', error);
      setQrError('Error generating QR code: ' + error.message);
      return JSON.stringify({ error: 'Failed to generate data' });
    }
  };

  const getStatusBadge = () => {
    switch(request.status) {
      case 'pending':
        return (
          <Badge bg="warning" className="text-dark d-flex align-items-center">
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
      default:
        return <Badge bg="secondary">{request.status}</Badge>;
    }
  };

  return (
    <Card className="shadow-sm border-0 mb-4 overflow-hidden">
      <Card.Header className="bg-white d-flex justify-content-between align-items-center border-bottom">
        <div className="d-flex align-items-center">
          <i className="bi bi-calendar2-check fs-4 me-2 text-primary"></i>
          <div>
            <h5 className="mb-0">Leave Request</h5>
            <div className="mt-1">
              {getStatusBadge()}
            </div>
          </div>
        </div>
        <div className="text-end">
          <small className="text-muted d-block">
            Requested on:
          </small>
          <span className="fw-medium">{formatDate(request.createdAt)}</span>
        </div>
      </Card.Header>
      
      <Card.Body>
        <Row className="g-3">
          <Col md={6} lg={3}>
            <Card className="h-100 border-0 bg-light">
              <Card.Body className="p-3">
                <h6 className="text-primary mb-1">
                  <i className="bi bi-box-arrow-right me-1"></i> Checkout Date
                </h6>
                <p className="mb-0 fw-medium">{formatDate(request.checkoutDate)}</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6} lg={3}>
            <Card className="h-100 border-0 bg-light">
              <Card.Body className="p-3">
                <h6 className="text-primary mb-1">
                  <i className="bi bi-box-arrow-in-left me-1"></i> Return Date
                </h6>
                <p className="mb-0 fw-medium">{formatDate(request.returnDate)}</p>
              </Card.Body>
            </Card>
          </Col>
          
          {request.status === 'approved' && request.validTill && (
            <Col md={6} lg={3}>
              <Card className="h-100 border-0 bg-light">
                <Card.Body className="p-3">
                  <h6 className="text-success mb-1">
                    <i className="bi bi-clock-history me-1"></i> Valid Till
                  </h6>
                  <p className="mb-0 fw-medium">{formatDate(request.validTill)}</p>
                </Card.Body>
              </Card>
            </Col>
          )}
          
          <Col md={6} lg={3}>
            <Card className="h-100 border-0 bg-light">
              <Card.Body className="p-3">
                <h6 className="text-primary mb-1">
                  <i className="bi bi-telephone me-1"></i> Phone Number
                </h6>
                <p className="mb-0 fw-medium">{request.phoneNumber || 'N/A'}</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Row className="mt-3">
          <Col md={6}>
            <Card className="h-100 border-0 bg-light mb-3">
              <Card.Body className="p-3">
                <h6 className="text-primary mb-1">
                  <i className="bi bi-chat-left-text me-1"></i> Reason
                </h6>
                <p className="mb-0">{request.reason}</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6}>
            <Card className="h-100 border-0 bg-light mb-3">
              <Card.Body className="p-3">
                <h6 className="text-primary mb-1">
                  <i className="bi bi-geo-alt me-1"></i> Destination Address
                </h6>
                <p className="mb-0">{request.destinationAddress}</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {request.status === 'approved' && (
          <Row className="mt-1">
            <Col md={6}>
              <Card className="h-100 border-0 bg-success bg-opacity-10 mb-3">
                <Card.Body className="p-3">
                  <h6 className="text-success mb-1">
                    <i className="bi bi-person-check me-1"></i> Approved By
                  </h6>
                  <p className="mb-0">{request.approvedBy}</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card className="h-100 border-0 bg-success bg-opacity-10 mb-3">
                <Card.Body className="p-3">
                  <h6 className="text-success mb-1">
                    <i className="bi bi-calendar-check me-1"></i> Approved At
                  </h6>
                  <p className="mb-0">{formatDate(request.approvedAt)}</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
        
        {request.status === 'rejected' && (
          <Row className="mt-1">
            <Col md={6}>
              <Card className="h-100 border-0 bg-danger bg-opacity-10 mb-3">
                <Card.Body className="p-3">
                  <h6 className="text-danger mb-1">
                    <i className="bi bi-person-x me-1"></i> Rejected By
                  </h6>
                  <p className="mb-0">{request.rejectedBy}</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card className="h-100 border-0 bg-danger bg-opacity-10 mb-3">
                <Card.Body className="p-3">
                  <h6 className="text-danger mb-1">
                    <i className="bi bi-calendar-x me-1"></i> Rejected At
                  </h6>
                  <p className="mb-0">{formatDate(request.rejectedAt)}</p>
                </Card.Body>
              </Card>
            </Col>
            
            {request.rejectionReason && (
              <Col xs={12}>
                <Card className="h-100 border-0 bg-danger bg-opacity-10">
                  <Card.Body className="p-3">
                    <h6 className="text-danger mb-1">
                      <i className="bi bi-exclamation-circle me-1"></i> Rejection Reason
                    </h6>
                    <p className="mb-0">{request.rejectionReason}</p>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        )}
        
        {request.status === 'approved' && (
          <div className="mt-4">
            <Button
              variant="primary"
              onClick={() => setShowQR(!showQR)}
              className="d-flex align-items-center mx-auto"
            >
              <i className={`bi ${showQR ? 'bi-eye-slash' : 'bi-qr-code'} me-2`}></i>
              {showQR ? 'Hide QR Code' : 'Show QR Code for Gate Pass'}
            </Button>
            
            {qrError && <Alert variant="danger" className="mt-3">{qrError}</Alert>}
            
            {showQR && !qrError && (
              <div className="mt-4 d-flex flex-column align-items-center">
                <Card className="border-0 shadow-sm p-3">
                  <Card.Body className="p-0 text-center">
                    <QRCodeSVG 
                      value={generateQRData()} 
                      size={200} 
                      level="H"
                      includeMargin
                      style={{ width: '100%', height: 'auto', maxWidth: '200px' }}
                    />
                    <p className="mt-2 text-center text-muted small mb-0">
                      <i className="bi bi-info-circle me-1"></i>
                      Show this QR code at the hostel gate for verification
                    </p>
                  </Card.Body>
                </Card>
                <div className="text-center mt-3 bg-light rounded p-2">
                  <h6 className="mb-1">Gate Pass Details</h6>
                  <p className="small mb-1">Student: {request.studentName} ({request.regNumber})</p>
                  <p className="small mb-1">Room: {request.roomNumber}</p>
                  <p className="small mb-0">Valid: {formatDate(request.checkoutDate)} to {formatDate(request.validTill || request.returnDate)}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default LeaveRequestCard;