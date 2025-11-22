import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  registrationId: { type: String, unique: true, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  fullName: { type: String }, // Optional for dashboard
  formData: { type: Array, required: true }, // Dynamic fields
  otpVerifiedPhone: { type: Boolean, default: true }, // Status flags
  otpVerifiedEmail: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  
  // Admin Status Fields
  isCalled: { type: Boolean, default: false, index: true }, // For "To Call" list
  isInactive: { type: Boolean, default: false, index: true }, // For "Inactive" list
  
  // --- NEW FIELD (Draft Feature) ---
  isDraft: { type: Boolean, default: false, index: true } // Marked as true when saved as draft
});

// Indexes for faster searching
registrationSchema.index({ email: 1 });
registrationSchema.index({ mobile: 1 });
registrationSchema.index({ isCalled: 1, isInactive: 1, isDraft: 1 }); // Optimized index for filtering

const Registration = mongoose.model('Registration', registrationSchema);
export default Registration;