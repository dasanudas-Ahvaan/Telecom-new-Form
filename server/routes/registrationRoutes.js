// server/routes/registrationRoutes.js
import express from 'express';
import {
    sendEmailOtpController,
    sendPhoneOtpController,
    verifyOtp,
    registerUser,
    saveDraft,
    getDraft,
    userExit
} from '../controllers/registrationController.js';

import verifyRegistrationToken from '../middleware/verifyRegistrationToken.js';
import { getFormSchemaForUser } from '../controllers/adminController.js';

const router = express.Router();

/* --------------------------------------------------------------------------
 *                       OTP ROUTES
 * -------------------------------------------------------------------------- */

// Send OTP to Email
router.post('/otp/send-email', sendEmailOtpController);

// Send OTP to Phone
router.post('/otp/send-phone', sendPhoneOtpController);

// Verify BOTH OTPs → Generates token for drafts/final submission
router.post('/otp/verify', verifyOtp);

/* --------------------------------------------------------------------------
 *                       USER EXIT (CLEAR EMAIL/PHONE)
 * -------------------------------------------------------------------------- */
router.post('/user-exit', userExit);

/* --------------------------------------------------------------------------
 *                       FORM SCHEMA (AFTER OTP VERIFY)
 * -------------------------------------------------------------------------- */
router.get('/form', verifyRegistrationToken, getFormSchemaForUser);

/* --------------------------------------------------------------------------
 *                       DRAFT ROUTES
 * -------------------------------------------------------------------------- */

// Save Draft (Token required)
router.post('/register/draft', verifyRegistrationToken, saveDraft);

// Load Draft (Token required)
router.get('/register/draft', verifyRegistrationToken, getDraft);

/* --------------------------------------------------------------------------
 *                       FINAL REGISTRATION
 * -------------------------------------------------------------------------- */
router.post('/register', verifyRegistrationToken, registerUser);

export default router;
