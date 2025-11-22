import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Registration from '../models/Registration.js';
import FormSchema from '../models/FormSchema.js';

// Controller for POST /api/admin/login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, {
      expiresIn: '8h',
    });

    res.json({ success: true, token: token, role: admin.role });
  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
// ... (keep all existing code) ...

// --- NEW: Controller for GET /api/admin/inactive-users ---
export const getInactiveList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchQuery = req.query.search || '';
    const skip = (page - 1) * limit;

    // Query for INACTIVE users
    const query = { isInactive: true };

    if (searchQuery) {
      query.$or = [
        { fullName: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } },
        { mobile: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    const registrations = await Registration.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const totalDocuments = await Registration.countDocuments(query);

    res.json({ 
      success: true, 
      registrations,
      pagination: {
        total: totalDocuments,
        page,
        limit,
        totalPages: Math.ceil(totalDocuments / limit)
      }
    });
  } catch (error) {
    console.error('Get Inactive List Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// --- NEW: Controller for GET /api/admin/export/inactive ---
export const exportInactive = async (req, res) => {
  try {
    const registrations = await Registration.find({ isInactive: true }).lean();
    if (registrations.length === 0) {
      return res.status(404).json({ success: false, message: 'No inactive data to export' });
    }
    const csv = generateCsv(registrations);
    res.header('Content-Type', 'text/csv');
    res.attachment('inactive_registrations.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export Inactive Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// --- NEW: Controller to RESTORE a user (make them active again) ---
// --- NEW: Bulk Restore ---
export const bulkRestoreRegistrations = async (req, res) => {
  try {
    const { registrationIds } = req.body;
    if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No items selected.' });
    }

    const result = await Registration.updateMany(
      { registrationId: { $in: registrationIds } },
      { $set: { isInactive: false } } // Set back to Active
    );

    res.json({ success: true, message: `Restored ${result.modifiedCount} users.` });
  } catch (error) {
    console.error('Bulk Restore Error:', error);
    res.status(500).json({ success: false, message: 'Server Error.' });
  }
};

// --- NEW: Bulk Permanent Delete ---
export const bulkDeletePermanently = async (req, res) => {
  try {
    const { registrationIds } = req.body;
    if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No items selected.' });
    }

    const result = await Registration.deleteMany(
      { registrationId: { $in: registrationIds } }
    );

    res.json({ success: true, message: `Permanently deleted ${result.deletedCount} users.` });
  } catch (error) {
    console.error('Bulk Delete Error:', error);
    res.status(500).json({ success: false, message: 'Server Error.' });
  }
};
// --- RENAMED & MODIFIED ---
// Controller for GET /api/admin/to-call (was getRegistrations)
export const getToCallList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const searchQuery = req.query.search || '';
    const skip = (page - 1) * limit;

    const query = {
      isInactive: { $ne: true },
      isCalled: { $ne: true }
    };

     if (searchQuery) {
      const regex = new RegExp(searchQuery, 'i'); // Case-insensitive regex
      query.$or = [
        { fullName: regex },
        { email: regex },
        { mobile: regex }
      ];
    }

    const registrations = await Registration.find(query)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    const totalDocuments = await Registration.countDocuments(query);
    res.json({
      success: true,
      registrations,
      pagination: {
        total: totalDocuments,
        page,
        limit,
        totalPages: Math.ceil(totalDocuments / limit)
      }
    });
  } catch (error) {
    console.error('Get ToCall List Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// --- NEW ---
// Controller for GET /api/admin/verified-users
export const getVerifiedList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const searchQuery = req.query.search || '';
    const skip = (page - 1) * limit;

    // include only called and not inactive
    const query = {
      isCalled: true,
      isInactive: { $ne: true }
    };

   if (searchQuery) {
      const regex = new RegExp(searchQuery, 'i');
      query.$or = [
        { fullName: regex },
        { email: regex },
        { mobile: regex }
      ];
    }

    // Now fetch the FULL registration object, including formData (no .select(), no .lean())
     const registrations = await Registration.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const totalDocuments = await Registration.countDocuments(query);

    res.json({
      success: true,
      registrations,
      pagination: {
        total: totalDocuments,
        page,
        limit,
        totalPages: Math.ceil(totalDocuments / limit)
      }
    });
  } catch (error) {
    console.error('Get Verified List Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
// --- NEW: Export Selected Users (Generic for both lists) ---
export const exportSelected = async (req, res) => {
  try {
    const { registrationIds } = req.body;

    if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No users selected for export.' });
    }

    // Find users matching the IDs
    const registrations = await Registration.find({ 
        registrationId: { $in: registrationIds } 
    }).lean();

    if (registrations.length === 0) {
      return res.status(404).json({ success: false, message: 'No data found for selected users.' });
    }

    const csv = generateCsv(registrations);
    
    res.header('Content-Type', 'text/csv');
    res.attachment('selected_users.csv');
    res.send(csv);

  } catch (error) {
    console.error('Export Selected Error:', error);
    res.status(500).json({ success: false, message: 'Server Error exporting data.' });
  }
};
// --- NEW ---
// Controller for PUT /api/admin/mark-called
export const markAsCalled = async (req, res) => {
  try {
    const { registrationIds } = req.body;
    if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Array of registrationIds is required.' });
    }

    const updateResult = await Registration.updateMany(
      { registrationId: { $in: registrationIds } },
      { $set: { isCalled: true } }
    );

    const matched = updateResult.matchedCount ?? updateResult.matched ?? updateResult.n ?? 0;
    const modified = updateResult.modifiedCount ?? updateResult.nModified ?? 0;

    if (matched === 0) {
      return res.status(404).json({ success: false, message: 'No users found with the given IDs.' });
    }

    if (modified === 0 && matched > 0) {
      return res.status(200).json({ success: true, message: 'Users were found but already marked as called.' });
    }

    res.json({ success: true, message: `${modified} users marked as called.` });
  } catch (error) {
    console.error('Mark as Called Error:', error);
    res.status(500).json({ success: false, message: 'Server Error updating users.' });
  }
};

// Controller for PUT /api/admin/form/update
export const updateFormSchema = async (req, res) => {
  try {
    const { fields } = req.body;
    const updatedSchema = await FormSchema.findOneAndUpdate(
      { schemaIdentifier: 'main' },
      { fields: fields },
      { new: true, upsert: true }
    );
    res.json({ success: true, message: 'Form updated', fields: updatedSchema.fields });
  } catch (error) {
    console.error('Update Form Schema Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Controller for GET /api/admin/form
export const getFormSchemaForUser = async (req, res) => {
  try {
    const schema = await FormSchema.findOne({ schemaIdentifier: 'main' }).lean();
    if (!schema || !schema.fields || schema.fields.length === 0) {
      return res.json({ success: true, fields: [] });
    }
    res.json({ success: true, fields: schema.fields });
  } catch (error) {
    console.error('Get Form Schema Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// --- Helper function for generating CSVs ---
const generateCsv = (registrations) => {
  const allLabels = new Set(['Registration ID', 'Full Name', 'Email', 'Mobile', 'Registration Date']);
  registrations.forEach(reg => {
    if (reg.formData) {
      reg.formData.forEach(field => {
        if (field && field.label) allLabels.add(field.label);
      });
    }
  });

  const header = Array.from(allLabels);
  let csv = '\uFEFF' + header.join(',') + '\n'; // Add UTF-8 BOM

  registrations.forEach(reg => {
    const row = new Map();
    row.set('Registration ID', reg.registrationId);
    row.set('Full Name', reg.fullName || '');
    row.set('Email', reg.email || '');
    row.set('Mobile', reg.mobile ? `="${reg.mobile}"` : '');
    row.set('Registration Date', reg.createdAt ? new Date(reg.createdAt).toISOString() : '');

    if (reg.formData) {
      reg.formData.forEach(field => {
        const value = Array.isArray(field.value)
          ? field.value.join(' | ')
          : (field.value && field.value.label) ? field.value.label : field.value;
        row.set(field.label, value || '');
      });
    }

    const csvRow = header.map(label => {
      const val = row.get(label) || '';
      return `"${String(val).replace(/"/g, '""')}"`;
    });

    csv += csvRow.join(',') + '\n';
  });

  return csv;
};

// --- NEW ---
// Controller for GET /api/admin/export/to-call
export const exportToCall = async (req, res) => {
  try {
    const registrations = await Registration.find({ isCalled: { $ne: true }, isInactive: { $ne: true } }).lean();
    if (!registrations || registrations.length === 0) {
      return res.status(404).json({ success: false, message: 'No "To Call" data to export' });
    }
    const csv = generateCsv(registrations);
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment('to_call_registrations.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export ToCall Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// --- NEW ---
// Controller for GET /api/admin/export/verified
export const exportVerified = async (req, res) => {
  try {
    const registrations = await Registration.find({ isCalled: true, isInactive: { $ne: true } }).lean();
    if (!registrations || registrations.length === 0) {
      return res.status(404).json({ success: false, message: 'No "Verified" data to export' });
    }
    const csv = generateCsv(registrations);
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment('verified_registrations.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export Verified Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Controller for GET /api/admin/data/search
export const searchData = async (req, res) => {
  try {
    const { fieldName, searchTerm } = req.query;
    if (!fieldName) {
      return res.status(400).json({ success: false, message: 'Field Name is required' });
    }

    let query = {};
    if (searchTerm) {
      query = { formData: { $elemMatch: { name: fieldName, value: new RegExp(searchTerm, 'i') } } };
    } else {
      query = { 'formData.name': fieldName };
    }

    const registrations = await Registration.find(query).lean();
    const data = registrations.map(reg => {
      const field = (reg.formData || []).find(f => f.name === fieldName);
      if (!field) return null;
      return {
        registrationId: reg.registrationId,
        label: field.label,
        value: field.value
      };
    }).filter(Boolean);

    res.json({ success: true, data });
  } catch (error) {
    console.error('Search Data Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Controller for GET /api/admin/form/fields
export const getFormFields = async (req, res) => {
  try {
    const schema = await FormSchema.findOne({ schemaIdentifier: 'main' }).lean();
    if (!schema || !schema.fields || schema.fields.length === 0) {
      return res.json({ success: true, fields: [] });
    }
    const fieldList = schema.fields.map(f => ({ name: f.name, label: f.label }));
    res.json({ success: true, fields: fieldList });
  } catch (error) {
    console.error('Get Form Fields Error:', error);
    res.status(500).json({ success: false, message: 'Server Error fetching form fields' });
  }
};

// Controller for GET /api/admin/data/by-field/:fieldName
export const getDataByField = async (req, res) => {
  try {
    const fieldName = req.params.fieldName;
    const staticFields = ['email', 'mobile', 'fullName'];

    if (!fieldName) {
      return res.status(400).json({ success: false, message: 'Field Name parameter is required' });
    }

    let registrations;
    const isStaticField = staticFields.includes(fieldName);

    if (isStaticField) {
      registrations = await Registration.find({ [fieldName]: { $exists: true, $ne: null, $ne: "" } }).lean();
    } else {
      registrations = await Registration.find({ 'formData.name': fieldName }).lean();
    }

    if (!registrations || registrations.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const data = registrations.map(reg => {
      let fieldValue;
      let fieldLabel = fieldName;

      if (isStaticField) {
        fieldValue = reg[fieldName];
        fieldLabel = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
      } else {
        const field = (reg.formData || []).find(f => f.name === fieldName);
        if (field) {
          fieldValue = field.value;
          fieldLabel = field.label || fieldName;
        }
      }

      if (fieldValue !== undefined && fieldValue !== null) {
        return {
          registrationId: reg.registrationId,
          email: reg.email,
          mobile: reg.mobile,
          label: fieldLabel,
          value: fieldValue
        };
      }
      return null;
    }).filter(Boolean);

    res.json({ success: true, data });
  } catch (error) {
    console.error('Get Data By Field Error:', error);
    res.status(500).json({ success: false, message: 'Server Error fetching data by field' });
  }
};

// --- NEW FUNCTION TO ADD ---
// Controller for PUT /api/admin/mark-inactive
export const markAsInactive = async (req, res) => {
  try {
    const { registrationIds } = req.body;
    if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Array of registrationIds is required.' });
    }

    const updateResult = await Registration.updateMany(
      { registrationId: { $in: registrationIds } },
      { $set: { isInactive: true } }
    );

    const matched = updateResult.matchedCount ?? updateResult.matched ?? updateResult.n ?? 0;
    const modified = updateResult.modifiedCount ?? updateResult.nModified ?? 0;

    if (matched === 0) {
      return res.status(404).json({ success: false, message: 'No users found with the given IDs.' });
    }

    if (modified === 0 && matched > 0) {
      return res.status(200).json({ success: true, message: 'Users were found but already marked as inactive.' });
    }

    res.json({ success: true, message: `${modified} users marked as inactive.` });
  } catch (error) {
    console.error('Mark as Inactive Error:', error);
    res.status(500).json({ success: false, message: 'Server Error updating users.' });
  }
};

// Controller for POST /api/admin/messaging/whatsapp-bulk (mock)
export const sendBulkWhatsapp = async (req, res) => {
  try {
    const { numbers, message } = req.body;
    if (!numbers || !message || !Array.isArray(numbers) || numbers.length === 0) {
      return res.status(400).json({ success: false, message: 'Numbers (array) and message are required' });
    }
    console.log('--- WHATSAPP BULK MESSAGE REQUEST ---');
    console.log(`Attempting to send "${message}" to ${numbers.length} numbers.`);
    // Mock response - integrate real WhatsApp Business API here when available
    res.json({
      success: true,
      message: `Request received for ${numbers.length} numbers. (This is a mock response)`
    });
  } catch (error) {
    console.error('Send Bulk WhatsApp Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Controller for POST /api/admin/create-admin
export const createAdminUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Admin with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const adminData = { email, password: hashedPassword };
    if (role) adminData.role = role;

    const newAdmin = await Admin.create(adminData);

    res.status(201).json({ success: true, message: 'New admin user created successfully', admin: { _id: newAdmin._id, email: newAdmin.email, role: newAdmin.role } });
  } catch (error) {
    console.error('Create Admin Error:', error);
    res.status(500).json({ success: false, message: 'Server Error creating admin' });
  }
};

// Controller for DELETE /api/admin/registrations/:id (hard delete)
export const deleteRegistration = async (req, res) => {
  try {
    const registrationId = req.params.id;
    if (!registrationId) {
      return res.status(400).json({ success: false, message: 'Registration ID is required.' });
    }

    const registration = await Registration.findOneAndDelete({ registrationId: registrationId });
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }

    res.json({ success: true, message: 'Registration deleted successfully.' });
  } catch (error) {
    console.error('Delete Registration Error:', error);
    res.status(500).json({ success: false, message: 'Server Error deleting registration.' });
  }
};

// NOTE: getSingleRegistration and updateRegistration were removed as requested.

// Controller for PUT /api/admin/registrations/:id/deactivate (mark inactive)
// NOTE: This is similar to setRegistrationStatus in the provided file. Keeping both names for compatibility.
export const setRegistrationStatus = async (req, res) => {
  try {
    const registrationId = req.params.id;
    if (!registrationId) {
      return res.status(400).json({ success: false, message: 'Registration ID is required.' });
    }

    const registration = await Registration.findOneAndUpdate(
      { registrationId: registrationId },
      { $set: { isInactive: true } },
      { new: true }
    );
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }
    res.json({ success: true, message: 'Registration marked as inactive.' });
  } catch (error) {
    console.error('Set Inactive Error:', error);
    res.status(500).json({ success: false, message: 'Server Error updating status.' });
  }
};

// --- MODIFIED (Req 3 & 4) ---
// Controller for PUT /api/admin/registrations/bulk-update
export const bulkUpdateRegistrations = async (req, res) => {
  try {
    const { updates } = req.body; // Expect { updates: [ { registrationId, fullName, email, mobile, formData }, ... ] }

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No update data provided.' });
    }

    // Create an array of update promises to run in parallel
    const updatePromises = updates.map(user => {
      // Now accepts formData
      const { registrationId, fullName, email, mobile, formData } = user;

      // Validate required fields for each update
      if (!registrationId || !fullName || !email || !mobile) {
        // Skip this update or throw an error
        console.warn(`Skipping update for ${registrationId || 'UNKNOWN'}: missing data.`);
        return null; // Will be filtered out later
      }

      return Registration.findOneAndUpdate(
        { registrationId: registrationId, isInactive: { $ne: true } },
        { $set: { fullName, email, mobile, ...(formData !== undefined ? { formData } : {}) } }, // saves formData if provided
        { new: true, runValidators: true }
      );
    });

    // Run all updates
    const results = await Promise.all(updatePromises);

    // Count how many were successfully updated (non-null results)
    const successfulUpdates = results.filter(r => r !== null).length;

    res.json({
      success: true,
      message: `Successfully updated ${successfulUpdates} users.`
    });
  } catch (error) {
    console.error('Bulk Update Error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ success: false, message: 'Server Error during bulk update.' });
  }
};

// --- Controller to List Admins (Unchanged) ---
export const listAdminUsers = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password').lean();
    res.json({ success: true, admins });
  } catch (error) {
    console.error('List Admins Error:', error);
    res.status(500).json({ success: false, message: 'Server Error fetching admins' });
  }
};

// --- Controller to Delete Admin (Unchanged) ---
export const deleteAdminUser = async (req, res) => {
  try {
    const adminIdToDelete = req.params.id;
    const currentAdminId = req.admin?._id?.toString();

    if (!adminIdToDelete) {
      return res.status(400).json({ success: false, message: 'Admin ID is required.' });
    }

    // Prevent self delete
    if (currentAdminId && adminIdToDelete === currentAdminId) {
      return res.status(400).json({ success: false, message: 'Admin cannot delete their own account.' });
    }

    const admin = await Admin.findByIdAndDelete(adminIdToDelete);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin user not found.' });
    }

    res.json({ success: true, message: 'Admin user deleted successfully.' });
  } catch (error) {
    console.error('Delete Admin Error:', error);
    if (!req.admin) {
      console.error('Auth middleware may be missing; req.admin is undefined.');
    }
    res.status(500).json({ success: false, message: 'Server Error deleting admin.' });
  }
};
