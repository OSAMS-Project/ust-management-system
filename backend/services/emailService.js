const nodemailer = require('nodemailer');
require('dotenv').config();

// Function to create a transporter object for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'osams.projects@gmail.com',
      pass: 'rrxi ggbv hope slhy',
    },
  });
};
// Function to send approval email
const sendApprovalEmail = async (email, name) => {  
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Asset Management Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Borrowing Request Has Been Approved',
    text: `Dear ${name},\n\nYour borrowing request has been approved. Please check your account for more details.\n\nBest regards,\nAsset Management Team`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Approval email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Error sending approval email:', error.message);
    throw new Error('Failed to send approval email');
  }
};

// Function to send rejection email
const sendRejectionEmail = async (email, name) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Asset Management Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Borrowing Request Has Been Rejected',
    text: `Dear ${name},\n\nWe regret to inform you that your borrowing request has been rejected. Please contact our support team for further details.\n\nBest regards,\nAsset Management Team`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Rejection email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Error sending rejection email:', error.message);
    throw new Error('Failed to send rejection email');
  }
};

module.exports = {
  sendApprovalEmail,
  sendRejectionEmail,
};