// require("dotenv").config();

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = require("twilio")(accountSid, authToken);

// const sendSMS = async (contact_no, name, expectedReturnDate) => {
//   let msgOptions = {
//     to: "+639157424059",
//     body: `Hello ${name}, this is a reminder that your expected return date is on ${expectedReturnDate}. Please ensure timely return.`,
//   };
//   try {
//     const message = await client.messages.create(msgOptions);
//     console.log("SMS sent successfully");
//   } catch (error) {
//     console.error("Error sending SMS:", error.message);
//     throw new Error("Failed to send SMS");
//   }
// };

// module.exports = {
//   sendSMS,
// };
