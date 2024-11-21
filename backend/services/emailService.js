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
    text: `Dear ${name},\n\nYour borrowing request has been approved. Please check your account for more details.\n\nBest regards,\nAsset Management Team`,
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
    text: `Dear ${name},\n\nWe regret to inform you that your borrowing request has been rejected.\n\nReason for rejection: ${rejectionReason}\n\nIf you have any questions about this decision, please contact the OSA office.\n\nBest regards,\nAsset Management Team`,
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

module.exports = {
  sendApprovalEmail,
  sendRejectionEmail,
  sendVerificationEmail,
};
