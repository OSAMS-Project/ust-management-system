const nodemailer = require('nodemailer');
require('dotenv').config();  // Import dotenv to load environment variables

// Create the transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  // Verify connection configuration
  transporter.verify((error, success) => {
    if (error) {
      console.error('Email transporter error:', error);
    } else {
      console.log('Server is ready to take our messages');
    }
  });
  const sendEmail = async (to, subject, message) => {
    const html = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #4CAF50;">Welcome to Our Service!</h2>
        <p>Hi there!</p>
        <p>${message}</p>
        <p>Best regards,<br>Your Company</p>
      </div>
    `;
  
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: message,
      html
    };
  
    try {
      return await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error in sendEmail service:', error);
      throw error;
    }
  };
  

module.exports = { sendEmail };
