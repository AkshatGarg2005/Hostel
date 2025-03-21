import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const LeaveRequestCard = ({ request }) => {
  const [showQR, setShowQR] = useState(false);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Generate QR data for approved requests
  const generateQRData = () => {
    const qrData = {
      id: request.id,
      studentName: request.studentName,
      regNumber: request.regNumber,
      roomNumber: request.roomNumber,
      checkoutDate: formatDate(request.checkoutDate),
      validTill: formatDate(request.validTill || request.returnDate),
      reason: request.reason,
      approvedBy: request.approvedBy || 'N/A',
      approvedAt: request.approvedAt ? formatDate(request.approvedAt) : 'N/A'
    };
    
    return JSON.stringify(qrData);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-6 flex justify-between items-center">
        <div className="flex items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Leave Request
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
            <dt className="text-sm font-medium text-gray-500">Checkout Date</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(request.checkoutDate)}</dd>
          </div>
          
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Return Date</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(request.returnDate)}</dd>
          </div>
          
          {request.status === 'approved' && request.validTill && (
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Valid Till</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(request.validTill)}</dd>
            </div>
          )}
          
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{request.phoneNumber}</dd>
          </div>
          
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Reason</dt>
            <dd className="mt-1 text-sm text-gray-900">{request.reason}</dd>
          </div>
          
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Destination Address</dt>
            <dd className="mt-1 text-sm text-gray-900">{request.destinationAddress}</dd>
          </div>
          
          {request.status === 'approved' && (
            <>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Approved By</dt>
                <dd className="mt-1 text-sm text-gray-900">{request.approvedBy}</dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Approved At</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(request.approvedAt)}</dd>
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
              
              {request.rejectionReason && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Rejection Reason</dt>
                  <dd className="mt-1 text-sm text-gray-900">{request.rejectionReason}</dd>
                </div>
              )}
            </>
          )}
        </dl>
        
        {request.status === 'approved' && (
          <div className="mt-6">
            <button
              onClick={() => setShowQR(!showQR)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {showQR ? 'Hide' : 'Show'} QR Code
            </button>
            
            {showQR && (
              <div className="mt-4 flex flex-col items-center">
                <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-md">
                  <QRCodeSVG 
                    value={generateQRData()} 
                    size={200} 
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="mt-2 text-sm text-center text-gray-500">
                  Show this QR code at the hostel gate for verification
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveRequestCard;