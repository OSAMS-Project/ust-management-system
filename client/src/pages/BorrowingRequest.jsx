import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import NotificationPopup from "../components/utils/NotificationsPopup";
import RejectionReasonModal from "../components/borrower/RejectionReasonModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { Check, X, RotateCcw, Bell } from 'lucide-react'; // Import Lucide icons

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
      setNotification({
        type: "success",
        message: "Asset returned successfully!",
      });
    } catch (err) {
      console.error("Error returning asset:", err);
      setNotification({
        type: "error",
        message: "Failed to return asset. Please try again.",
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

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error)
    return <div className="text-center py-4 text-red-500">{error}</div>;

  // Filter requests by status
  const pendingRequests = requests.filter((req) => req.status === "Pending");
  const acceptedRequests = requests.filter((req) => req.status === "Approved");

  const renderTable = (title, data, showActions) => (
    <div className="mb-8 overflow-x-auto">
      <h2 className="text-xl font-bold mb-4 text-center">{title}</h2>
      <div className="min-w-max">
        <table className="w-full bg-white border-collapse shadow-lg rounded-lg">
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
            {data.map((request, index) => (
              <tr
                key={request.id}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-[#E8E8E8]"
                } hover:bg-gray-50 transition duration-150`}
              >
                <td className="py-2 px-3 border-b text-center whitespace-nowrap">{request.name}</td>
                <td className="py-2 px-3 border-b text-center whitespace-nowrap">{request.email}</td>
                <td className="py-2 px-3 border-b text-center whitespace-nowrap">{request.contact_no}</td>
                <td className="py-2 px-3 border-b text-center whitespace-nowrap">{request.department}</td>
                <td className="py-2 px-3 border-b text-center whitespace-nowrap">{request.purpose}</td>
                <td className="py-2 px-3 border-b text-center whitespace-nowrap">{request.borrowed_asset_names}</td>
                <td className="py-2 px-3 border-b text-center whitespace-nowrap">{request.borrowed_asset_quantities}</td>
                <td className="py-2 px-3 border-b text-center whitespace-nowrap">
                  {moment(request.date_requested).format("MM/DD/YYYY")}
                </td>
                <td className="py-2 px-3 border-b text-center whitespace-nowrap">
                  {moment(request.date_to_be_collected).format("MM/DD/YYYY")}
                </td>
                <td className="py-2 px-3 border-b text-center whitespace-nowrap">
                  {request.cover_letter_url ? (
                    <a
                      href={`${process.env.REACT_APP_API_URL}${request.cover_letter_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </a>
                  ) : (
                    "None"
                  )}
                </td>
                <td className="py-2 px-3 border-b text-center whitespace-nowrap">
                  {moment(request.expectedReturnDate).format("MM/DD/YYYY")}
                </td>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

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
    </div>
  );
};

export default BorrowingRequest;
