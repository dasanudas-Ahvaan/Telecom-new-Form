// server/models/Otp.js
import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  mobileOtp: { type: String }, 
  emailOtp: { type: String },  
  emailOtpSent: { type: Boolean, default: false }, // Track if sent
  mobileOtpSent: { type: Boolean, default: false }, // Track if sent
  expiresAt: { type: Date, default: () => Date.now() + 10 * 60 * 1000, index: { expires: '10m' } }
});
otpSchema.index({ email: 1, mobile: 1 }, { unique: true }); // Make email/mobile combo unique

const Otp = mongoose.model('Otp', otpSchema);
export default Otp;