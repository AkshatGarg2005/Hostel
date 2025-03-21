import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const LeaveRequestCard = ({ request, onApprove, onReject }) => {
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

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-6 flex justify-between items-center">
        <div className="flex items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Leave Request - {request.studentName}
          </h3>
          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
            request.status === 'pending' ? 'bg-orange-100 text-orange-800' : 
            request.status === 'approved' ? 'bg-green-100 text-green-800' : 
            'bg-red-100 text-red-800'
          }`}>
            {request.status}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          Requested: {formatDate(request.createdAt)}
        </div>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Registration Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{request.regNumber}</dd>
          </div>
          
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Room Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{request.roomNumber}</dd>
          </div>
          
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Checkout Date</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(request.checkoutDate)}</dd>
          </div>
          
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Return Date</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(request.returnDate)}</dd>
          </div>
          
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Reason</dt>
            <dd className="mt-1 text-sm text-gray-900">{request.reason}</dd>
          </div>
          
          {request.status === 'approved' && (
            <>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Approved By</dt>
                <dd className="mt-1 text-sm text-gray-900">{request.approvedBy}</dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Valid Till</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(request.validTill)}</dd>
              </div>
              
              <div className="sm:col-span-2">
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {showQR ? 'Hide QR Code' : 'Show QR Code'}
                </button>
                
                {showQR && (
                  <div className="mt-4 flex justify-center">
                    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-md">
                      <QRCodeSVG value={generateQRData()} size={200} />
                      <p className="mt-2 text-sm text-center text-gray-500">
                        Scan to verify leave permission
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          
          {request.status === 'rejected' && (
            <>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Rejected By</dt>
                <dd className="mt-1 text-sm text-gray-900">{request.rejectedBy}</dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Rejected At</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(request.rejectedAt)}</dd>
              </div>
              
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Rejection Reason</dt>
                <dd className="mt-1 text-sm text-gray-900">{request.rejectionReason || 'No reason provided'}</dd>
              </div>
            </>
          )}
        </dl>
      </div>
      
      {request.status === 'pending' && (
        <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
          {!showRejectForm ? (
            <div className="flex justify-end space-x-3">
              <div className="flex items-center space-x-3">
                <label htmlFor="validTill" className="block text-sm font-medium text-gray-700">
                  Valid Till:
                </label>
                <input
                  type="date"
                  id="validTill"
                  value={validTillDate}
                  onChange={(e) => setValidTillDate(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  required
                />
                <button
                  onClick={handleApproveClick}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Approve
                </button>
              </div>
              
              <button
                onClick={() => setShowRejectForm(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Reject
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700">
                Rejection Reason:
              </label>
              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                rows="3"
                placeholder="Provide a reason for rejection (optional)"
              ></textarea>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleRejectClick}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeaveRequestCard;