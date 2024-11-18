import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import NotificationPopup from "../components/utils/NotificationsPopup";
import RejectionReasonModal from "../components/borrower/RejectionReasonModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { Check, X, RotateCcw, Bell } from 'lucide-react'; // Import Lucide icons
import { createClient } from '@supabase/supabase-js'
import { toast } from 'react-hot-toast'
import supabase from '../config/supabaseClient';  // Import the configured client

const BorrowingRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/borrowing-requests`);
      console.log('Raw response:', response);
      console.log('Fetched requests:', response.data);
      
      if (!Array.isArray(response.data)) {
        console.error('Response is not an array:', response.data);
        setRequests([]);
        return;
      }
      
      // Map through the requests to get cover letter URLs
      const requestsWithCoverLetters = await Promise.all(
        response.data.map(async (request) => {
          if (request.cover_letter_path) {
            const { data: coverLetterUrl } = supabase
              .storage
              .from('cover-letters')
              .getPublicUrl(request.cover_letter_path);
            return { ...request, coverLetterUrl: coverLetterUrl.publicUrl };
          }
          return request;
        })
      );
      
      setRequests(requestsWithCoverLetters);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      console.log('Before update - Request ID:', id, 'New Status:', status); // Debug log

      // Update the URL to match your route
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/borrowing-requests/${id}/status`,
        { status: status }
      );

      console.log('API Response:', response.data); // Debug log

      if (status === "Approved") {
        const request = requests.find(req => req.id === id);
        if (request) {
          await handleSendEmail(request.email, request.name, "Approved");
        }
      }

      // Refresh the requests list
      const updatedResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/borrowing-requests`
      );
      setRequests(updatedResponse.data);

      toast.success(`Request ${status.toLowerCase()} successfully`);

    } catch (err) {
      console.error("Error updating request status:", err);
      toast.error("Failed to update request status");
    }
  };

  const handleReturnAsset = async (id) => {
    try {
      console.log('Returning asset with ID:', id);

      // Update borrowing request status
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/borrowing-requests/${id}/return`
      );

      console.log('Return response:', response.data);

      if (response.data) {
        // Immediately update the local state
        setRequests((prevRequests) => {
          const updatedRequests = prevRequests.map((request) => {
            if (request.id === id) {
              return {
                ...request,
                ...response.data.request,
                status: "Returned",
                date_returned: new Date().toISOString()
              };
            }
            return request;
          });
          return updatedRequests;
        });

        // Show both toast and notification
        toast.success("Asset returned successfully!");
        setNotification({
          type: "success",
          message: "Asset returned successfully!",
          duration: 3000 // Optional: auto-close after 3 seconds
        });

        // Update asset quantities
        const request = requests.find(req => req.id === id);
        if (request && request.selected_assets) {
          const assets = typeof request.selected_assets === 'string' 
            ? JSON.parse(request.selected_assets) 
            : request.selected_assets;

          console.log('Updating assets:', assets); // Debug log

          // Update each asset's quantity
          for (const asset of assets) {
            try {
              await axios.put(
                `${process.env.REACT_APP_API_URL}/api/assets/${asset.asset_id}/return`, 
                { quantity: parseInt(asset.quantity) }
              );
            } catch (error) {
              console.error(`Error updating asset ${asset.asset_id}:`, error);
              toast.error(`Failed to update quantity for ${asset.assetName}`);
            }
          }
        }
      }

    } catch (err) {
      console.error("Error returning asset:", err);
      toast.error("Failed to return asset. Please try again.");
      setNotification({
        type: "error",
        message: "Failed to return asset. Please try again.",
        duration: 3000
      });
    }
  };

  const handleSendEmail = async (email, name, status, rejectionReason = "") => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/borrowing-requests/send-email`,
        { email, name, status, rejectionReason }
      );
      setNotification({
        type: "success",
        message: `Email sent successfully for status: ${status}`,
      });
    } catch (err) {
      console.error("Error sending email:", err);
      setNotification({
        type: "error",
        message: "Failed to send email. Please try again.",
      });
    }
  };

  const handleNotifyUser = async (contactNo, name, expectedReturnDate) => {
    try {
      console.log('Sending notification:', { contactNo, name, expectedReturnDate }); // Debug log
      
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/borrowing-requests/notify`,
        {
          contactNo,
          name,
          expectedReturnDate,
        }
      );
      
      toast.success("Notification sent successfully");
    } catch (err) {
      console.error("Error sending notification:", err);
      toast.error("Failed to send notification");
    }
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const handleReject = async (request) => {
    setSelectedRequest(request);
    setIsRejectionModalOpen(true);
  };

  const handleRejectSubmit = async (reason) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/borrowing-requests/${selectedRequest.id}/status`,
        { status: "Rejected" }
      );

      await handleSendEmail(
        selectedRequest.email,
        selectedRequest.name,
        "Rejected",
        reason
      );

      setIsRejectionModalOpen(false);
      setSelectedRequest(null);

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/borrowing-requests`
      );
      setRequests(response.data);

      setNotification({
        type: "success",
        message: "Request rejected successfully",
      });
    } catch (error) {
      console.error("Error rejecting request:", error);
      setNotification({
        type: "error",
        message: "Failed to reject request",
      });
    }
  };

  const handleViewCoverLetter = async (requestId) => {
    try {
      const { data: request } = await supabase
        .from('borrowing_requests')
        .select('cover_letter_path')
        .eq('id', requestId)
        .single();

      if (request?.cover_letter_path) {
        const { data, error } = await supabase
          .storage
          .from('samplebucket')
          .download(request.cover_letter_path);

        if (error) {
          throw error;
        }

        // Create a URL for the downloaded file
        const url = URL.createObjectURL(data);
        
        // Open PDF in new tab
        window.open(url, '_blank');
      } else {
        toast.error('No cover letter available');
      }
    } catch (error) {
      console.error('Error fetching cover letter:', error);
      toast.error('Failed to fetch cover letter');
    }
  };

  const getCoverLetterUrl = async (requestId) => {
    try {
      const { data, error } = await supabase
        .from('borrowing_requests')
        .select('cover_letter_path')
        .eq('id', requestId)
        .single();

      if (error) throw error;

      if (data?.cover_letter_path) {
        const { data: coverLetterUrl } = supabase
          .storage
          .from('cover-letters')
          .getPublicUrl(data.cover_letter_path);
        
        return coverLetterUrl;
      }
      return null;
    } catch (error) {
      console.error('Error getting cover letter URL:', error);
      return null;
    }
  };

  const renderTable = (title, requests, showActions) => {
    return (
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-black text-[#FEC00F]">
              <tr>
                <th className="py-2 px-3 border-b text-center whitespace-nowrap">Name</th>
                <th className="py-2 px-3 border-b text-center whitespace-nowrap">Email</th>
                <th className="py-2 px-3 border-b text-center whitespace-nowrap">Contact No.</th>
                <th className="py-2 px-3 border-b text-center whitespace-nowrap">Department</th>
                <th className="py-2 px-3 border-b text-center whitespace-nowrap">Purpose</th>
                <th className="py-2 px-3 border-b text-center whitespace-nowrap">Borrowed Asset</th>
                <th className="py-2 px-3 border-b text-center whitespace-nowrap">Quantity</th>
                <th className="py-2 px-3 border-b text-center whitespace-nowrap">Date Requested</th>
                <th className="py-2 px-3 border-b text-center whitespace-nowrap">Date to be Collected</th>
                <th className="py-2 px-3 border-b text-center whitespace-nowrap">Cover Letter</th>
                <th className="py-2 px-3 border-b text-center whitespace-nowrap">Expected Return Date</th>
                <th className="py-2 px-3 border-b text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => {
                // Parse the selected_assets if it's a string
                const selectedAssets = typeof request.selected_assets === 'string' 
                  ? JSON.parse(request.selected_assets) 
                  : request.selected_assets;

                return (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b text-center whitespace-nowrap">{request.name}</td>
                    <td className="px-4 py-2 border-b text-center whitespace-nowrap">{request.email}</td>
                    <td className="px-4 py-2 border-b text-center whitespace-nowrap">{request.contact_no}</td>
                    <td className="px-4 py-2 border-b text-center whitespace-nowrap">{request.department}</td>
                    <td className="px-4 py-2 border-b text-center whitespace-nowrap">{request.purpose}</td>
                    <td className="px-4 py-2 border-b text-center">
                      {selectedAssets && selectedAssets.length > 0 
                        ? selectedAssets.map((asset, index) => (
                          <div key={index} className="whitespace-nowrap">
                            {asset.assetName}
                            {index < selectedAssets.length - 1 && <hr className="my-1 border-gray-200" />}
                          </div>
                        ))
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-2 border-b text-center">
                      {selectedAssets && selectedAssets.length > 0 
                        ? selectedAssets.map((asset, index) => (
                          <div key={index} className="whitespace-nowrap">
                            {asset.quantity}
                            {index < selectedAssets.length - 1 && <hr className="my-1 border-gray-200" />}
                          </div>
                        ))
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-2">{request.date_requested ? moment(request.date_requested).format("MM/DD/YYYY") : 'N/A'}</td>
                    <td className="px-4 py-2">{request.date_to_be_collected ? moment(request.date_to_be_collected).format("MM/DD/YYYY") : 'N/A'}</td>
                    <td className="px-4 py-2">
                      {request.cover_letter_url ? (
                        <a
                          href={request.cover_letter_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 underline"
                        >
                          View PDF
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-4 py-2">{request.date_to_be_collected ? moment(request.expected_return_date).format("MM/DD/YYYY") : 'N/A'}</td>
                    <td className="py-2 px-3 border-b text-center">
                      <div className="flex gap-1 justify-center">
                        {request.status === "Pending" ? (
                          <>
                            <button
                              onClick={() => {
                                handleStatusUpdate(request.id, "Approved");
                                handleSendEmail(request.email, request.name, "Approved");
                              }}
                              title="Approve"
                              className="bg-green-500 text-white p-1.5 rounded hover:bg-green-600 transition duration-300"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => handleReject(request)}
                              title="Reject"
                              className="bg-red-500 text-white p-1.5 rounded hover:bg-red-600 transition duration-300"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          request.status === "Approved" && (
                            <button
                              onClick={() => handleReturnAsset(request.id)}
                              title="Return"
                              className="bg-blue-500 text-white p-1.5 rounded hover:bg-blue-600 transition duration-300"
                            >
                              <RotateCcw size={14} />
                            </button>
                          )
                        )}
                        <button
                          onClick={() =>
                            handleNotifyUser(
                              request.contact_no,
                              request.name,
                              moment(request.expectedReturnDate).format("MMMM Do YYYY")
                            )
                          }
                          title="Notify"
                          className="bg-yellow-500 text-white p-1.5 rounded hover:bg-yellow-600 transition duration-300"
                        >
                          <Bell size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error)
    return <div className="text-center py-4 text-red-500">{error}</div>;

  // Filter requests by status
  const pendingRequests = Array.isArray(requests) 
    ? requests.filter(request => request.status === "Pending")
    : [];
    
  const approvedRequests = Array.isArray(requests)
    ? requests.filter(request => request.status === "Approved")
    : [];
    
  const returnedRequests = Array.isArray(requests)
    ? requests.filter(request => request.status === "Returned")
    : [];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-[#FEC00F] py-6 flex items-center justify-between px-6">
        <h1 className="text-5xl font-extrabold text-black">
          Borrowing Requests
        </h1>
        <FontAwesomeIcon
          icon={faUsers}
          className="text-black text-5xl transform"
        />
      </div>
      <div className="px-6">
        {/* Pending Requests */}
        {renderTable("Pending Requests", pendingRequests, true)}
        
        {/* Approved Requests */}
        {renderTable("Approved Requests", approvedRequests, true)}
        
        {/* Returned Requests */}
        {renderTable("Returned Requests", returnedRequests, false)}

        <NotificationPopup
          notification={notification}
          onClose={handleCloseNotification}
        />
        <RejectionReasonModal
          isOpen={isRejectionModalOpen}
          onClose={() => {
            setIsRejectionModalOpen(false);
            setSelectedRequest(null);
          }}
          onSubmit={handleRejectSubmit}
        />
      </div>
    </div>
  );
};

export default BorrowingRequest;
