const emailService = require('../services/emailservice');

const sendEmail = async (req, res) => {
    try {
      const { to, subject, message } = req.body;
      
      // Debug log to check if the data is correct
      console.log('Received data:', { to, subject, message });
  
      const info = await emailService.sendEmail(to, subject, message);
      res.status(200).json({ message: 'Email sent successfully', info });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: 'Error sending email' });
    }
  };
  

module.exports = { sendEmail };
