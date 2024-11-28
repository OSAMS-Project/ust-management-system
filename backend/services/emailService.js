const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();

// Function to create a transporter object for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "osams.projects@gmail.com",
      pass: "rrxi ggbv hope slhy",
    },
  });
};
// Function to send approval email
const sendApprovalEmail = async (email, name) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Asset Management Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Borrowing Request Has Been Approved",
    text: `Dear ${name},\n\nYour borrowing request has been approved, kindly claim the asset requested at the OSA Office. \n\nBest regards,\nUST-OSAMS`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Approval email sent successfully:", info.messageId);
  } catch (error) {
    console.error("Error sending approval email:", error.message);
    throw new Error("Failed to send approval email");
  }
};

// Function to send rejection email
const sendRejectionEmail = async (email, name, rejectionReason) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Asset Management Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Borrowing Request Has Been Rejected",
    text: `Dear ${name},\n\nWe regret to inform you that your borrowing request has been rejected.\n\nReason for rejection: ${rejectionReason}\n\nIf you have any questions about this decision, please contact the OSA office.\n\nBest regards,\nUST-OSAMS`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Rejection email sent successfully:", info.messageId);
  } catch (error) {
    console.error("Error sending rejection email:", error.message);
    throw new Error("Failed to send rejection email");
  }
};
const sendVerificationEmail = async (email) => {
  try {
    const transporter = createTransporter();
    const verificationCode = crypto.randomInt(100000, 999999);

    const mailOptions = {
      from: `"Asset Management Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Verification Code",
      text: `Your verification code is: ${verificationCode}. Please enter this code to complete your request.`,
    };

    console.log(`Sending email to: ${email} with code: ${verificationCode}`);
    const info = await transporter.sendMail(mailOptions);

    console.log("Verification email sent successfully:", info.messageId);
    return verificationCode;
  } catch (error) {
    console.error("Error sending verification email:", error.message);
    throw new Error("Failed to send verification email");
  }
};

const sendReminderEmail = async (email, name, expectedReturnDate) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Asset Management Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Asset Return Date",
    text: `Hello ${name}, this is a reminder that your expected return date is on ${expectedReturnDate}. Please ensure timely return.`,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Rejection email sent successfully:", info.messageId);
  } catch (error) {
    console.error("Error sending rejection email:", error.message);
    throw new Error("Failed to send rejection email");
  }
};

const sendPendingAlert = async (email, pendingCount) => {
  if (!email || !pendingCount) {
    throw new Error("Email and pending count are required.");
  }

  const transporter = createTransporter(); // Reuse the createTransporter function

  const mailOptions = {
    from: `"Asset Management Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Pending Borrowing Requests Alert",
    text: `Dear Admin,\n\nThere are currently ${pendingCount} pending borrowing requests in the system. Please log in to the system to review and process them.\n\nBest regards,\nAsset Management Team`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Pending alert email sent successfully:", info.messageId);
    return { message: "Pending alert email sent successfully." };
  } catch (error) {
    console.error("Error sending pending alert email:", error.message);
    throw new Error("Failed to send pending alert email.");
  }
};

module.exports = {
  sendApprovalEmail,
  sendRejectionEmail,
  sendVerificationEmail,
  sendReminderEmail,
  sendPendingAlert,
};
