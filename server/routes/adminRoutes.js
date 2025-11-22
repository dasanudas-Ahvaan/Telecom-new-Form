// server/routes/adminRoutes.js
import express from 'express';
import {
  adminLogin,
  updateFormSchema,
  getFormSchemaForUser,
  sendBulkWhatsapp,
  createAdminUser,
  listAdminUsers,
  deleteAdminUser,
  // existing controllers
  getToCallList,
  getVerifiedList,
  markAsCalled,
  setRegistrationStatus,
  exportToCall,
  exportVerified,
  // NEW controllers (previously added)
  markAsInactive,
  bulkUpdateRegistrations,
  // NEW controllers you requested to add/import
  getInactiveList,
  exportInactive,
} from '../controllers/adminController.js';

import {
  // ... existing imports ...
  bulkRestoreRegistrations, // <-- Import
  bulkDeletePermanently     // <-- Import
} from '../controllers/adminController.js';
// --- MIDDLEWARE ---
import authMiddleware from '../middleware/authMiddleware.js';
import checkRole from '../middleware/checkRole.js';
import {
    // ... other imports
    exportSelected, // <-- Import this
    // ...
} from '../controllers/adminController.js';
const router = express.Router();

// --- Authentication ---
router.post('/login', adminLogin);

// --- Admin User Management (OWNER ONLY) ---
router.get('/users', authMiddleware, checkRole(['Owner']), listAdminUsers);
router.post('/create-admin', authMiddleware, checkRole(['Owner']), createAdminUser);
router.delete('/users/:id', authMiddleware, checkRole(['Owner']), deleteAdminUser);

// --- Registration Data Management (Admin & Owner) ---
// NOTE: single registration view/update routes were removed
// (previously: router.get('/registrations/:id', ...); router.put('/registrations/:id', ...); )

// Mark single user as inactive (keeps previous behavior)
router.put('/registrations/:id/status', authMiddleware, setRegistrationStatus);

// --- NEW: Bulk registration updates (Req 3 & 4) ---
router.put(
  '/registrations/bulk-update',
  authMiddleware,
  checkRole(['Owner', 'Admin', 'Manager']),
  bulkUpdateRegistrations
);
router.post('/export/selected', authMiddleware, exportSelected);
// --- "To Call" / "Verified" Flow (Req 2) ---
router.get('/to-call', authMiddleware, getToCallList);
router.get('/verified-users', authMiddleware, getVerifiedList);
router.put('/mark-called', authMiddleware, markAsCalled);

// --- NEW: Bulk mark as inactive ---
// Option A: allow any authenticated admin
// router.put('/mark-inactive', authMiddleware, markAsInactive);

// Option B (recommended): restrict to specific roles (Owner/Admin/Manager)
router.put('/mark-inactive', authMiddleware, checkRole(['Owner', 'Admin', 'Manager']), markAsInactive);

// --- CSV Export Routes (Req 2) ---
router.get('/export/to-call', authMiddleware, exportToCall);
router.get('/export/verified', authMiddleware, exportVerified);

// --- Form Schema Management (Admin & Owner) ---
router.put('/form/update', authMiddleware, updateFormSchema);
router.get('/form', authMiddleware, getFormSchemaForUser);

// --- Messaging ---
router.post('/messaging/whatsapp-bulk', authMiddleware, sendBulkWhatsapp);

// --- NEW "Inactive Users" Routes ---
router.get('/inactive-users', authMiddleware, getInactiveList);
router.get('/export/inactive', authMiddleware, exportInactive);
router.put('/inactive-users/bulk-restore', authMiddleware, bulkRestoreRegistrations); // Bulk Restore
router.post('/inactive-users/bulk-delete', authMiddleware, bulkDeletePermanently);    // Bulk Delete (Using POST for safety/body support)

export default router;
