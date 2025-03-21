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
      
      console.log('QR Data:', qrData);
      return JSON.stringify(qrData);
    } catch (error) {
      console.error('Error generating QR data:', error);
      setQrError('Error generating QR code: ' + error.message);
      return JSON.stringify({ error: 'Failed to generate data' });
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0">Leave Request</h5>
          <Badge 
            bg={
              request.status === 'pending' ? 'warning' : 
              request.status === 'approved' ? 'success' : 
              'danger'
            }
          >
            {request.status}
          </Badge>
        </div>
        <small className="text-muted">
          Requested: {formatDate(request.createdAt)}
        </small>
      </Card.Header>
      
      <Card.Body>
        <Row>
          <Col md={6} className="mb-3">
            <h6>Checkout Date</h6>
            <p>{formatDate(request.checkoutDate)}</p>
          </Col>
          
          <Col md={6} className="mb-3">
            <h6>Return Date</h6>
            <p>{formatDate(request.returnDate)}</p>
          </Col>
          
          {request.status === 'approved' && request.validTill && (
            <Col md={6} className="mb-3">
              <h6>Valid Till</h6>
              <p>{formatDate(request.validTill)}</p>
            </Col>
          )}
          
          <Col md={6} className="mb-3">
            <h6>Phone Number</h6>
            <p>{request.phoneNumber || 'N/A'}</p>
          </Col>
          
          <Col xs={12} className="mb-3">
            <h6>Reason</h6>
            <p>{request.reason}</p>
          </Col>
          
          <Col xs={12} className="mb-3">
            <h6>Destination Address</h6>
            <p>{request.destinationAddress}</p>
          </Col>
          
          {request.status === 'approved' && (
            <>
              <Col md={6} className="mb-3">
                <h6>Approved By</h6>
                <p>{request.approvedBy}</p>
              </Col>
              
              <Col md={6} className="mb-3">
                <h6>Approved At</h6>
                <p>{formatDate(request.approvedAt)}</p>
              </Col>
            </>
          )}
          
          {request.status === 'rejected' && (
            <>
              <Col md={6} className="mb-3">
                <h6>Rejected By</h6>
                <p>{request.rejectedBy}</p>
              </Col>
              
              <Col md={6} className="mb-3">
                <h6>Rejected At</h6>
                <p>{formatDate(request.rejectedAt)}</p>
              </Col>
              
              {request.rejectionReason && (
                <Col xs={12}>
                  <h6>Rejection Reason</h6>
                  <p>{request.rejectionReason}</p>
                </Col>
              )}
            </>
          )}
        </Row>
        
        {request.status === 'approved' && (
          <div className="mt-3">
            <Button
              variant="primary"
              onClick={() => setShowQR(!showQR)}
            >
              {showQR ? 'Hide' : 'Show'} QR Code
            </Button>
            
            {qrError && <Alert variant="danger" className="mt-3">{qrError}</Alert>}
            
            {showQR && !qrError && (
              <div className="mt-4 d-flex flex-column align-items-center">
                <Card className="p-4 border">
                  <QRCodeSVG 
                    value={generateQRData()} 
                    size={200} 
                    level="H"
                    includeMargin
                    style={{ width: '100%', height: 'auto', maxWidth: '200px' }}
                  />
                </Card>
                <p className="mt-2 text-center text-muted">
                  Show this QR code at the hostel gate for verification
                </p>
              </div>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default LeaveRequestCard;