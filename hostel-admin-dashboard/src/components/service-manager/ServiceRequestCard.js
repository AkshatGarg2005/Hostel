import React from 'react';

const ServiceRequestCard = ({ request, onAccept, onDelete }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Determine badge color based on service type
  const getBadgeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'electrician':
        return 'bg-yellow-100 text-yellow-800';
      case 'plumber':
        return 'bg-blue-100 text-blue-800';
      case 'carpenter':
        return 'bg-brown-100 text-brown-800';
      case 'laundry':
        return 'bg-purple-100 text-purple-800';
      case 'cab':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-6 flex justify-between items-center">
        <div className="flex items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Token #{request.tokenNumber}
          </h3>
          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getBadgeColor(request.serviceType)}`}>
            {request.serviceType}
          </span>
          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
            request.status === 'pending' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
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
            <dt className="text-sm font-medium text-gray-500">Room Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{request.roomNumber}</dd>
          </div>
          
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Registration Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{request.regNumber}</dd>
          </div>
          
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Contact Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{request.contactNumber}</dd>
          </div>
          
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 text-sm text-gray-900 capitalize">{request.status}</dd>
          </div>
          
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Problem Description</dt>
            <dd className="mt-1 text-sm text-gray-900">{request.problem}</dd>
          </div>
          
          {request.status === 'accepted' && request.acceptedAt && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Accepted At</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(request.acceptedAt)}</dd>
            </div>
          )}
        </dl>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
        <div className="flex justify-end space-x-3">
          {request.status === 'pending' && (
            <button
              onClick={() => onAccept(request.id)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Accept
            </button>
          )}
          
          <button
            onClick={() => onDelete(request.id)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceRequestCard;