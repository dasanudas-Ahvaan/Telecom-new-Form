import express from 'express';
import {
    adminLogin,
    getRegistrations,
    updateFormSchema,
    getFormSchemaForUser, // Controller for GET /api/admin/form
    exportReport,
    searchData,
    getFormFields,
    getDataByField,
    sendBulkWhatsapp,
    createAdminUser,
    listAdminUsers,
    deleteAdminUser,
    getSingleRegistration, // Controller for GET /api/admin/registrations/:id
    updateRegistration,    // Controller for PUT /api/admin/registrations/:id
    deleteRegistration     // Controller for DELETE /api/admin/registrations/:id
} from '../controllers/adminController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Authentication ---
router.post('/login', adminLogin);

// --- Admin User Management ---
router.get('/users', authMiddleware, listAdminUsers);        // List Admins
router.post('/create-admin', authMiddleware, createAdminUser); // Create Admin (Requires Login)
router.delete('/users/:id', authMiddleware, deleteAdminUser);  // Delete Admin

// --- Registration Data Management ---
router.get('/registrations', authMiddleware, getRegistrations);        // List All Registrations
router.get('/registrations/:id', authMiddleware, getSingleRegistration); // View Single Registration
router.put('/registrations/:id', authMiddleware, updateRegistration);    // Update Single Registration
router.delete('/registrations/:id', authMiddleware, deleteRegistration);  // Delete Single Registration
router.get('/report/export', authMiddleware, exportReport);            // Export All Registrations

// --- Form Schema Management ---
router.put('/form/update', authMiddleware, updateFormSchema);     // Update Schema
router.get('/form/fields', authMiddleware, getFormFields);      // Get Field List (for Data Explorer)
router.get('/form', authMiddleware, getFormSchemaForUser);        // Get Full Schema (for Form Editor)

// --- Data Exploration ---
router.get('/data/search', authMiddleware, searchData);              // Simple Search (if still needed)
router.get('/data/by-field/:fieldName', authMiddleware, getDataByField); // Get Data By Field

// --- Messaging ---
router.post('/messaging/whatsapp-bulk', authMiddleware, sendBulkWhatsapp); // Mock WhatsApp Bulk Send

// ---Dev-Only Route for *First* Admin Creation ---
// Keep this only if you need a way to create the very first admin without login
// during initial setup/development. Remove for production if using seeding/manual DB insert.
/*
if (process.env.NODE_ENV !== 'production') {
  // Use a different path to avoid conflict if needed, or remove completely
  router.post('/create-first-admin-dev', createAdminUser);
}
*/

export default router;