import React, { useState } from 'react';
import { Card, Badge, Button, Collapse, Form } from 'react-bootstrap';

const AttendanceCard = ({ attendance, onUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(attendance.notes || '');

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  const handleSaveNotes = () => {
    onUpdate(attendance.id, { notes });
    setExpanded(false);
  };

  return (
    <Card className="custom-card mb-3 border-0">
      <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <div>
            <h5 className="mb-0 fw-semibold">
              {attendance.studentName}
            </h5>
            <p className="text-muted mb-0 small">
              Room {attendance.roomNumber} • {attendance.regNumber}
            </p>
          </div>
        </div>
        <div className="d-flex align-items-center">
          <Badge 
            className={`me-2 ${attendance.status === 'present' ? 'badge-approved' : 'badge-rejected'}`}
          >
            {attendance.status === 'present' ? 'Present' : 'Absent'}
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
                <h6 className="text-muted fw-semibold small">DATE</h6>
                <p>{formatDate(attendance.date)}</p>
              </div>
              
              <div className="col-md-6 mb-3">
                <h6 className="text-muted fw-semibold small">VERIFIED BY</h6>
                <p>{attendance.verifierName}</p>
              </div>
              
              <div className="col-12 mb-3">
                <h6 className="text-muted fw-semibold small">NOTES</h6>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="Add notes about this attendance record"
                />
              </div>
            </div>
          </Card.Body>
          
          <Card.Footer className="bg-white border-top d-flex justify-content-end py-3">
            <Button
              variant="secondary"
              size="sm"
              className="me-2"
              onClick={() => setExpanded(false)}
            >
              Cancel
            </Button>
            
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveNotes}
            >
              Save Notes
            </Button>
          </Card.Footer>
        </div>
      </Collapse>
    </Card>
  );
};

export default AttendanceCard;