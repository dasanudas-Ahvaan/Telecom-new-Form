// server/routes/registrationRoutes.js
import express from 'express';
import {
   
    sendEmailOtpController,
    sendPhoneOtpController,
    verifyOtp,
    registerUser,
    userExit
} from '../controllers/registrationController.js';
import verifyRegistrationToken from '../middleware/verifyRegistrationToken.js';
import { getFormSchemaForUser } from '../controllers/adminController.js'; // Still needed for GET /form

const router = express.Router();

// --- Routes for Single Page Flow ---

// Send OTPs separately (Controllers should handle duplicate check)
router.post('/otp/send-email', sendEmailOtpController);
router.post('/otp/send-phone', sendPhoneOtpController);

// Verify both OTPs together (Generates token needed for next steps)
router.post('/otp/verify', verifyOtp);

//exit router for clearup
router.post('/user-exit',userExit)

// Get Form Schema (Requires token from successful OTP verify)
router.get('/form', verifyRegistrationToken, getFormSchemaForUser);

// Final Registration Submission (Requires token from successful OTP verify)
router.post('/register', verifyRegistrationToken, registerUser);

export default router;