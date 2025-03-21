import React from 'react';

const ComplaintCard = ({ complaint, onResolve, onDelete }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-6 flex justify-between items-center">
        <div className="flex items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Complaint from {complaint.studentName}
          </h3>
          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
            complaint.status === 'pending' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
          }`}>
            {complaint.status}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          Submitted: {formatDate(complaint.createdAt)}
        </div>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Registration Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{complaint.regNumber}</dd>
          </div>
          
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Room Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{complaint.roomNumber}</dd>
          </div>
          
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Category</dt>
            <dd className="mt-1 text-sm text-gray-900">{complaint.category}</dd>
          </div>
          
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 text-sm text-gray-900 capitalize">{complaint.status}</dd>
          </div>
          
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Complaint Description</dt>
            <dd className="mt-1 text-sm text-gray-900">{complaint.description}</dd>
          </div>
          
          {complaint.status === 'resolved' && complaint.resolvedAt && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Resolved At</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(complaint.resolvedAt)}</dd>
            </div>
          )}
        </dl>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
        <div className="flex justify-end space-x-3">
          {complaint.status === 'pending' && (
            <button
              onClick={() => onResolve(complaint.id)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Mark as Resolved
            </button>
          )}
          
          <button
            onClick={() => onDelete(complaint.id)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintCard;