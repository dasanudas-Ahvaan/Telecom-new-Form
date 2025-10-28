import axios from 'axios';
import nodemailer from 'nodemailer';

// Configure Nodemailer transporter (move initialization here)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVICE,
  port: process.env.EMAIL_PORT,
  secure: true, // Use true for port 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendSMS = async (mobile, otp) => {
  try {
    const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
      params: {
        authorization: process.env.FAST2SMS_API_KEY,
        message: `Your Ahvaan Telecom OTP is ${otp}`,
        language: 'english',
        route: 'q',
        numbers: mobile,
      },
    });
    console.log('Fast2SMS Response:', response.data);
    return response.data.return === true;
  } catch (error) {
    console.error('Fast2SMS Error:', error.response?.data || error.message);
    return false;
  }
};

const sendEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"Ahvaan Telecom" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP for Registration',
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
      html: `<b>Your OTP is ${otp}</b>. It is valid for 10 minutes.`,
    });
    console.log(`Email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Nodemailer Error:', error.message);
    return false;
  }
};

export { sendSMS, sendEmail };