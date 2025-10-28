import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  registrationId: { type: String, unique: true, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  formData: { type: Array, required: true },
  otpVerifiedPhone: { type: Boolean, default: true },
  otpVerifiedEmail: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Registration = mongoose.model('Registration', registrationSchema);
export default Registration;