// server/controllers/registrationController.js
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Otp from '../models/Otp.js';
import Registration from '../models/Registration.js';
import { generateOtp } from '../utils/otpUtils.js';
import { sendSMS, sendEmail } from '../utils/messagingUtils.js';

//making a Set() of emails and phone number for quick lookup
const mySet = new Set();


// --- startRegistration function REMOVED ---

// --- Send Email OTP (UPDATED: Includes duplicate check) ---
export const sendEmailOtpController = async (req, res) => {
  try {
    const { email, mobile } = req.body;
    if (!email || !mobile) {
      return res.status(400).json({ success: false, message: 'Email and mobile are required' });
    }

    // --- DUPLICATE CHECK ADDED ---
    const existingUser = await Registration.findOne({
      $or: [{ email: email }, { mobile: mobile }]
    });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'This Email or Mobile Number is already registered.'
      });
    }else if(mySet.has(email)){
      return res.status(409).json({
        success: false,
        message: 'OTP is already shared to this email.'
      });
    }
    else{
      mySet.add(email);
    }
    // --- END DUPLICATE CHECK ---

    const emailOtp = generateOtp();

    // Find existing OTP record or create/update one
    await Otp.findOneAndUpdate(
      { email: email, mobile: mobile },
      { $set: { emailOtp: emailOtp, emailOtpSent: true } }, // Set the email OTP and mark as sent
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Send/Log based on environment
    if (process.env.NODE_ENV === 'production') {
        const emailSent = await sendEmail(email, emailOtp);
        if (!emailSent) {
           console.error(`Failed to send email OTP to ${email} in production.`);
           // Decide if this should be a hard failure or just logged
           // return res.status(500).json({ success: false, message: 'Failed to send email OTP.' });
        }
    } else {
        console.log('--- DEVELOPMENT OTP ---');
        console.log(`Email OTP for ${email}: ${emailOtp}`);
        console.log('-------------------------');
    }

    res.json({ success: true, message: 'Email OTP handled.' });

  } catch (error) {
    console.error('Send Email OTP Error:', error);
    // Handle potential duplicate key error during upsert if needed, although check above should prevent most
    if (error.code === 11000) {
        return res.status(400).json({ success: false, message: 'Error processing OTP request, potentially duplicate attempt.' });
    }
    res.status(500).json({ success: false, message: 'Server Error sending email OTP' });
  }
};

// --- Send Phone OTP (Includes duplicate check) ---
export const sendPhoneOtpController = async (req, res) => {
  try {
    const { email, mobile } = req.body;
    if (!email || !mobile) {
      return res.status(400).json({ success: false, message: 'Email and mobile are required' });
    }

    // --- DUPLICATE CHECK ADDED ---
    const existingUser = await Registration.findOne({
      $or: [{ email: email }, { mobile: mobile }]
    });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'This Email or Mobile Number is already registered.'
      });
    }else if(mySet.has(mobile)){
      return res.status(409).json({
        success: false,
        message: 'OTP is already shared to this Phone number.'
      });
    }
    else{
      console.log("add");
      
      mySet.add(mobile);
      console.log(mySet);
      console.log(mySet.has(mobile));
    }
     // --- END DUPLICATE CHECK ---

    const mobileOtp = generateOtp();

    // Find existing OTP record or create/update one
    await Otp.findOneAndUpdate(
      { email: email, mobile: mobile },
      { $set: { mobileOtp: mobileOtp, mobileOtpSent: true } }, // Set the mobile OTP and mark as sent
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Send/Log based on environment
    if (process.env.NODE_ENV === 'production') {
        const smsSent = await sendSMS(mobile, mobileOtp);
         if (!smsSent) {
           console.error(`Failed to send SMS OTP to ${mobile} in production.`);
           // Decide if this should be a hard failure or just logged
           // return res.status(500).json({ success: false, message: 'Failed to send phone OTP.' });
        }
    } else {
        console.log('--- DEVELOPMENT OTP ---');
        console.log(`Mobile OTP for ${mobile}: ${mobileOtp}`);
        console.log('-------------------------');
    }

    res.json({ success: true, message: 'Phone OTP handled.' });

  } catch (error) {
    console.error('Send Phone OTP Error:', error);
     // Handle potential duplicate key error during upsert if needed
    if (error.code === 11000) {
        return res.status(400).json({ success: false, message: 'Error processing OTP request, potentially duplicate attempt.' });
    }
    res.status(500).json({ success: false, message: 'Server Error sending phone OTP' });
  }
};


// --- Verify OTP ---
export const verifyOtp = async (req, res) => {
  try {
    const { email, mobile, mobileOtp, emailOtp } = req.body;

    const otpRecord = await Otp.findOne({ email: email, mobile: mobile });

    // Check if both have been SENT before verifying values
    if (!otpRecord || !otpRecord.emailOtpSent || !otpRecord.mobileOtpSent) {
       return res.status(400).json({ success: false, message: 'Both email and phone OTPs must be requested first.' });
    }
    // Check if both OTP values actually exist (they should if sent flag is true)
     if (!otpRecord.mobileOtp || !otpRecord.emailOtp) {
       return res.status(400).json({ success: false, message: 'Internal error: OTPs missing despite being marked sent.' });
    }

    if (otpRecord.mobileOtp !== mobileOtp) {
      return res.status(400).json({ success: false, message: 'Invalid Mobile OTP' });
    }

    if (otpRecord.emailOtp !== emailOtp) {
      return res.status(400).json({ success: false, message: 'Invalid Email OTP' });
    }

    await Otp.deleteOne({ _id: otpRecord._id });
    
    mySet.delete(email);
    mySet.delete(mobile);

    const token = jwt.sign({ email: email, mobile: mobile }, process.env.JWT_SECRET, {
      expiresIn: '15m', // Token valid for 15 minutes to complete registration
    });

    res.json({ success: true, message: 'OTP verified successfully', token: token });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ success: false, message: 'Server Error verifying OTP' });
  }
};

// --- registerUser  ---
export const registerUser = async (req, res) => {
 try {
    // email and mobile are added by verifyRegistrationToken middleware
    const { formData, firstName, lastName } = req.body;

    // Create final registration document
    const newRegistration = await Registration.create({
      registrationId: `AHV-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      email: req.email, // Use email from the secure token
      mobile: req.mobile, // Use mobile from the secure token
      firstName: firstName,
      lastName: lastName,
      formData: formData,
      otpVerifiedPhone: true,
      otpVerifiedEmail: true,
    });

    res.json({ success: true, message: 'Registration successful!', data: newRegistration });
  } catch (error) {
    console.error('Register User Error:', error);
    // Handle potential duplicate errors if somehow verification was bypassed (shouldn't happen)
    if (error.code === 11000) {
         return res.status(409).json({ success: false, message: 'Duplicate entry error during final registration.' });
    }
    res.status(500).json({ success: false, message: 'Server Error during registration', details: error.message });
  }
};

export const userExit = async (req, res) => {
  try {
    // console.log("clearup!");
    const { email, mobile} = req.body;
    mySet.delete(email);
    mySet.delete(mobile);
    console.log(mySet);
    console.log("cleanup!");
   
    res.json({ success: true, message: 'Email and Phone number cleared from memory.' });
  } catch (error) {
    
  }
};