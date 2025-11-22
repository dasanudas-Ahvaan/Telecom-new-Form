// server/controllers/registrationController.js
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Otp from '../models/Otp.js';
import Registration from '../models/Registration.js';
import { generateOtp } from '../utils/otpUtils.js';
import { sendSMS, sendEmail } from '../utils/messagingUtils.js';

// --- CHANGED: Use a Map for Timers instead of a Set for Blocking ---
// Key: Email/Mobile, Value: Timestamp of last request
const otpCooldowns = new Map();

// Helper to check cooldown (15 seconds)
const checkCooldown = (key) => {
  const lastRequest = otpCooldowns.get(key);
  if (lastRequest && Date.now() - lastRequest < 15000) { // 15000 ms = 15 seconds
    const remaining = Math.ceil((15000 - (Date.now() - lastRequest)) / 1000);
    return remaining;
  }
  return 0; // No cooldown, allowed to proceed
};

/* ============================================================================
 * SEND EMAIL OTP
 * ============================================================================ */
export const sendEmailOtpController = async (req, res) => {
  try {
    const { email, mobile } = req.body;
    if (!email || !mobile)
      return res.status(400).json({ success: false, message: 'Email and mobile required' });

    // 1. Check for existing user
    // Allow existing users ONLY if they are Drafts or Inactive
    const existingUser = await Registration.findOne({
      $or: [{ email }, { mobile }]
    });

    if (existingUser && !existingUser.isDraft && !existingUser.isInactive) {
      return res.status(409).json({
        success: false,
        message: 'This Email or Mobile Number is already registered.'
      });
    }

    // 2. Rate Limiting (Cooldown Check)
    const cooldown = checkCooldown(email);
    if (cooldown > 0) {
      return res.status(429).json({ // 429 = Too Many Requests
        success: false,
        message: `Please wait ${cooldown} seconds before resending email OTP.`
      });
    }

    // 3. Update Cooldown Timer
    otpCooldowns.set(email, Date.now());

    // 4. Generate & Save OTP (Upsert handles "Resend" automatically)
    const emailOtp = generateOtp();
    await Otp.findOneAndUpdate(
      { email, mobile },
      { $set: { emailOtp, emailOtpSent: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 5. Send Email
    if (process.env.NODE_ENV === 'production') {
      await sendEmail(email, emailOtp);
    } else {
      console.log(`DEV EMAIL OTP (${email}): ${emailOtp}`);
    }

    res.json({ success: true, message: 'Email OTP sent successfully.' });

  } catch (error) {
    console.error('Send Email OTP Error:', error);
    res.status(500).json({ success: false, message: 'Server Error sending email OTP' });
  }
};


/* ============================================================================
 * SEND PHONE OTP
 * ============================================================================ */
export const sendPhoneOtpController = async (req, res) => {
  try {
    const { email, mobile } = req.body;
    if (!email || !mobile)
      return res.status(400).json({ success: false, message: 'Email and mobile required' });

    const existingUser = await Registration.findOne({
      $or: [{ email }, { mobile }]
    });

    // Allow draft/inactive users
    if (existingUser && !existingUser.isDraft && !existingUser.isInactive) {
      return res.status(409).json({
        success: false,
        message: 'This Email or Mobile Number is already registered.'
      });
    }

    // 1. Rate Limiting (Cooldown Check)
    const cooldown = checkCooldown(mobile);
    if (cooldown > 0) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${cooldown} seconds before resending SMS.`
      });
    }

    // 2. Update Cooldown Timer
    otpCooldowns.set(mobile, Date.now());

    const mobileOtp = generateOtp();
    await Otp.findOneAndUpdate(
      { email, mobile },
      { $set: { mobileOtp, mobileOtpSent: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (process.env.NODE_ENV === 'production') {
      await sendSMS(mobile, mobileOtp);
    } else {
      console.log(`DEV MOBILE OTP (${mobile}): ${mobileOtp}`);
    }

    res.json({ success: true, message: 'Phone OTP sent successfully.' });

  } catch (error) {
    console.error('Send Phone OTP Error:', error);
    res.status(500).json({ success: false, message: 'Server Error sending SMS' });
  }
};


/* ============================================================================
 * VERIFY OTP
 * ============================================================================ */
export const verifyOtp = async (req, res) => {
  try {
    const { email, mobile, mobileOtp, emailOtp } = req.body;

    // Find the OTP record
    const otpRecord = await Otp.findOne({ email, mobile });

    if (!otpRecord) {
      // Logic change: If record is missing, it expired.
      return res.status(400).json({ success: false, message: 'OTP expired. Please resend.' });
    }

    if (!otpRecord.emailOtpSent || !otpRecord.mobileOtpSent) {
       return res.status(400).json({ success: false, message: 'Please send both OTPs first.' });
    }

    if (otpRecord.mobileOtp !== mobileOtp)
      return res.status(400).json({ success: false, message: 'Invalid Mobile OTP' });

    if (otpRecord.emailOtp !== emailOtp)
      return res.status(400).json({ success: false, message: 'Invalid Email OTP' });

    // Success! Delete the used OTP record
    await Otp.deleteOne({ _id: otpRecord._id });

    // Clear the cooldowns so they can start fresh next time if needed
    otpCooldowns.delete(email);
    otpCooldowns.delete(mobile);

    const token = jwt.sign({ email, mobile }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.json({ success: true, message: 'Verified', token });

  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ success: false, message: 'Server Error verifying OTP' });
  }
};


/* ============================================================================
 * SAVE DRAFT
 * ============================================================================ */
export const saveDraft = async (req, res) => {
  try {
    const { formData, fullName, gender, dateOfBirth } = req.body;

    await Registration.findOneAndUpdate(
      { email: req.email, mobile: req.mobile },
      {
        $set: {
          fullName,
          gender,
          dateOfBirth,
          formData,
          isDraft: true,
          otpVerifiedPhone: true,
          otpVerifiedEmail: true,
        },
        $setOnInsert: {
          registrationId: `AHV-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
          createdAt: new Date()
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, message: 'Draft saved successfully.' });

  } catch (error) {
    console.error('Save Draft Error:', error);
    res.status(500).json({ success: false, message: 'Server Error saving draft' });
  }
};


/* ============================================================================
 * GET DRAFT
 * ============================================================================ */
export const getDraft = async (req, res) => {
  try {
    const registration = await Registration.findOne({ email: req.email, mobile: req.mobile });

    if (registration && registration.isDraft) {
      res.json({ success: true, draft: registration });
    } else {
      res.json({ success: true, draft: null });
    }

  } catch (error) {
    console.error('Get Draft Error:', error);
    res.status(500).json({ success: false, message: 'Server Error fetching draft' });
  }
};


/* ============================================================================
 * FINAL REGISTRATION (SUBMIT)
 * ============================================================================ */
export const registerUser = async (req, res) => {
  try {
    const { formData, fullName, gender, dateOfBirth } = req.body;

    const newRegistration = await Registration.findOneAndUpdate(
      { email: req.email, mobile: req.mobile },
      {
        $set: {
          fullName,
          gender,
          dateOfBirth,
          formData,
          isDraft: false, // Mark as Final
          otpVerifiedPhone: true,
          otpVerifiedEmail: true
        },
        $setOnInsert: {
          registrationId: `AHV-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
          createdAt: new Date()
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, message: 'Registration successful!', data: newRegistration });

  } catch (error) {
    console.error('Register User Error:', error);
    res.status(500).json({ success: false, message: 'Server Error submitting form' });
  }
};


/* ============================================================================
 * USER EXIT
 * ============================================================================ */
export const userExit = async (req, res) => {
  try {
    const { email, mobile } = req.body;
    // We don't block anymore, but we can clear the timer if user explicitly exits
    // so they can restart immediately if they want.
    if (email) otpCooldowns.delete(email);
    if (mobile) otpCooldowns.delete(mobile);

    res.json({ success: true, message: 'Session cleared.' });
  } catch (error) {
    console.error("Exit Error:", error);
    res.status(500).json({ success: false, message: 'Server Error clearing session' });
  }
};