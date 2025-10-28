import axios from 'axios';
import dotenv from 'dotenv';


dotenv.config();

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
    // This will print the detailed error from Fast2SMS
    console.error('Fast2SMS Error:', error.response.data);
    return false;
  }
};


(async () => {
  
  const myTestNumber = '919871726478';
  
  console.log(`Sending test SMS to ${myTestNumber}...`);
  
  const success = await sendSMS(myTestNumber, '987654');
  
  console.log('--- Test Complete ---');
  console.log('Was API call successful?', success);
})();