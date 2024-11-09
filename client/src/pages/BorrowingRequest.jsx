import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import NotificationPopup from '../components/utils/NotificationsPopup';
import RejectionReasonModal from '../components/borrower/RejectionReasonModal';

const BorrowingRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/borrowing-requests`
        );
        setRequests(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch borrowing requests");
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      if (status === "Rejected") {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/borrowing-requests/${id}`
        );
      } else {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/borrowing-requests/${id}/status`,
          { status: "Approved" }
        );
      }
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/borrowing-requests`
      );
      setRequests(response.data);
    } catch (err) {
      console.error("Error updating request status:", err);
    }
  };

  const handleReturnAsset = async (id) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/borrowing-requests/${id}/return`
      );
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/borrow-logs/return`,
        {
          requestId: id,
          dateReturned: new Date(),
        }
      );
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === id ? { ...request, status: "Returned" } : request
        )
      );
      setNotification({ type: 'success', message: 'Asset returned successfully!' });
    } catch (err) {
      console.error("Error returning asset:", err);
      setNotification({ type: 'error', message: 'Failed to return asset. Please try again.' });
    }
  };

  const handleSendEmail = async (email, name, status, rejectionReason = '') => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/borrowing-requests/send-email`,
        { email, name, status, rejectionReason }
      );
      setNotification({ 
        type: 'success', 
        message: `Email sent successfully for status: ${status}` 
      });
    } catch (err) {
      console.error("Error sending email:", err);
      setNotification({ 
        type: 'error', 
        message: "Failed to send email. Please try again." 
      });
    }
  };

  const handleNotifyUser = async (contactNo, name, expectedReturnDate) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/borrowing-requests/notify-sms`,
        {
          contactNo,
          name,
          expectedReturnDate,
        }
      );
      alert("SMS notification sent successfully.");
    } catch (err) {
      console.error("Error sending SMS notification:", err);
      alert("Failed to send SMS notification.");
    }
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setIsRejectionModalOpen(true);
  };

  const handleRejectSubmit = async (reason) => {
    try {
      await handleStatusUpdate(selectedRequest.id, "Rejected");
      await handleSendEmail(
        selectedRequest.email,
        selectedRequest.name,
        "Rejected",
        reason
      );
      setIsRejectionModalOpen(false);
      setSelectedRequest(null);
      setNotification({ 
        type: 'success', 
        message: 'Request rejected successfully' 
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
      setNotification({ 
        type: 'error', 
        message: 'Failed to reject request' 
      });
    }
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error)
    return <div className="text-center py-4 text-red-500">{error}</div>;

  // Filter requests by status
  const pendingRequests = requests.filter((req) => req.status === "Pending");
  const acceptedRequests = requests.filter(
    (req) => req.status === "Approved"
  );

  const renderTable = (title, data, showActions) => (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4 text-center">{title}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border-collapse shadow-lg rounded-lg">
          <thead className="bg-black text-[#FEC00F]">
            <tr>
              <th className="py-3 px-4 border-b text-center">Name</th>
              <th className="py-3 px-4 border-b text-center">Email</th>
              <th className="py-3 px-4 border-b text-center">Contact No.</th>
              <th className="py-3 px-4 border-b text-center">Department</th>
              <th className="py-3 px-4 border-b text-center">Purpose</th>
              <th className="py-3 px-4 border-b text-center">Borrowed Asset</th>
              <th className="py-3 px-4 border-b text-center">Quantity</th>
              <th className="py-3 px-4 border-b text-center">Cover Letter</th>
              <th className="py-3 px-4 border-b text-center">
                Expected Return Date
              </th>
              <th className="py-3 px-4 border-b text-center">Actions</th>
              <th className="py-3 px-4 border-b text-center">Notify</th>
            </tr>
          </thead>
          <tbody>
            {data.map((request, index) => (
              <tr
                key={request.id}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-[#E8E8E8]"
                } hover:bg-gray-50 transition duration-150`}
              >
                <td className="py-2 px-4 border-b text-center">
                  {request.name}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {request.email}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {request.contact_no}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {request.department}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {request.purpose}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {request.borrowed_asset_names}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {request.borrowed_asset_quantities}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {request.cover_letter_url ? (
                    <a
                      href={`${process.env.REACT_APP_API_URL}${request.cover_letter_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Cover Letter
                    </a>
                  ) : (
                    "No cover letter"
                  )}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {moment(request.expectedReturnDate).format("MMMM Do YYYY")}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {request.status === "Pending" ? (
                    <>
                      <button
                        onClick={() => {
                          handleStatusUpdate(request.id, "Approved");
                          handleSendEmail(
                            request.email,
                            request.name,
                            "Approved"
                          );
                        }}
                        className="bg-green-500 text-white px-3 py-1 rounded mr-2 text-xs hover:bg-green-600 transition duration-300"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(request)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition duration-300"
                      >
                        Reject
                      </button>
                    </>
                  ) : request.status === "Approved" && (
                    <button
                      onClick={() => handleReturnAsset(request.id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition duration-300"
                    >
                      Returned
                    </button>
                  )}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <button
                    onClick={() =>
                      handleNotifyUser(
                        request.contact_no,
                        request.name,
                        moment(request.expectedReturnDate).format(
                          "MMMM Do YYYY"
                        )
                      )
                    }
                    className="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600 transition duration-300"
                  >
                    Notify
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="container w-full mx-auto px-6">
      <h1 className="flex items-center font-sans font-bold break-normal text-black px-2 py-4 text-xl md:text-2xl">
        Borrowing Request Page
      </h1>
      {renderTable("Pending Requests", pendingRequests, true)}
      {renderTable("Accepted Requests", acceptedRequests, true)}
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
  );
};

export default BorrowingRequest;
