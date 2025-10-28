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

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: '8h',
    });

    res.json({ success: true, token: token });
  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Controller for GET /api/admin/registrations
export const getRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find()
      .select('registrationId firstName lastName email mobile createdAt')
      .sort({ createdAt: -1 });
    res.json({ success: true, registrations });
  } catch (error) {
    console.error('Get Registrations Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
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


// Controller for GET /api/admin/form (for user registration page AND admin editor)
export const getFormSchemaForUser = async (req, res) => {
  try {
    const schema = await FormSchema.findOne({ schemaIdentifier: 'main' });
    
    // --- THIS IS THE CORRECTED LOGIC ---
    if (!schema || !schema.fields || schema.fields.length === 0) {
      // If no schema or fields are empty, return success with an empty array
      return res.json({ success: true, fields: [] }); 
    }
    // --- END CORRECTION ---

    // If fields exist, return them
    res.json({ success: true, fields: schema.fields });
    
  } catch (error) {
    console.error('Get Form Schema Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Controller for GET /api/report/export
export const exportReport = async (req, res) => {
  try {
    const registrations = await Registration.find().lean();
    if (registrations.length === 0) {
      return res.status(404).json({ success: false, message: 'No data to export' });
    }

    const allLabels = new Set(['Registration ID', 'First Name', 'Last Name', 'Email', 'Mobile', 'Registration Date']);
    registrations.forEach(reg => {
      if (reg.formData) {
        reg.formData.forEach(field => {
          allLabels.add(field.label);
        });
      }
    });

    const header = Array.from(allLabels);
    let csv = header.join(',') + '\n';

    registrations.forEach(reg => {
      const row = new Map();
      row.set('Registration ID', reg.registrationId);
      row.set('First Name', reg.firstName || '');
      row.set('Last Name', reg.lastName || '');
      row.set('Email', reg.email);
      row.set('Mobile', reg.mobile);
      row.set('Registration Date', new Date(reg.createdAt).toISOString());

      if (reg.formData) {
        reg.formData.forEach(field => {
          const value = Array.isArray(field.value) ? field.value.join(' | ') : field.value;
          row.set(field.label, value || '');
        });
      }

      const csvRow = header.map(label => {
        const val = row.get(label) || '';
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csv += csvRow.join(',') + '\n';
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('registrations.csv');
    res.send(csv);

  } catch (error) {
    console.error('Export Report Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Controller for GET /api/admin/data/search (Original simple search)
export const searchData = async (req, res) => {
  try {
    const { fieldName, searchTerm } = req.query;
    if (!fieldName) {
      return res.status(400).json({ success: false, message: 'Field Name is required' });
    }
    let query = {};
    if (searchTerm) {
      query = { 'formData': { $elemMatch: { 'name': fieldName, 'value': new RegExp(searchTerm, 'i') } } };
    } else {
      query = { 'formData.name': fieldName };
    }
    const registrations = await Registration.find(query);
    const data = registrations.map(reg => {
      const field = reg.formData?.find(f => f.name === fieldName);
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

// Controller for GET /api/admin/form/fields (For Data Explorer dropdown)
export const getFormFields = async (req, res) => {
  try {
    const schema = await FormSchema.findOne({ schemaIdentifier: 'main' });
    if (!schema || !schema.fields || schema.fields.length === 0) {
      return res.json({ success: true, fields: [] }); // Send empty array if not configured
    }
    const fieldList = schema.fields.map(f => ({ name: f.name, label: f.label }));
    res.json({ success: true, fields: fieldList });
  } catch (error) {
    console.error('Get Form Fields Error:', error);
    res.status(500).json({ success: false, message: 'Server Error fetching form fields' });
  }
};

// server/controllers/adminController.js

// --- UPDATED: GET DATA BY FIELD NAME ROUTE ---
export const getDataByField = async (req, res) => {
  try {
    const fieldName = req.params.fieldName;
    const staticFields = ['email', 'mobile', 'firstName', 'lastName']; // Define static fields

    if (!fieldName) {
      return res.status(400).json({ success: false, message: 'Field Name parameter is required' });
    }

    let registrations;
    let isStaticField = staticFields.includes(fieldName);

    // --- UPDATED QUERY LOGIC ---
    if (isStaticField) {
      // If it's a static field, query the top-level field
      // We search for documents where the field exists and is not null/empty
      registrations = await Registration.find({ [fieldName]: { $exists: true, $ne: null, $ne: "" } });
    } else {
      // If it's a dynamic field, query within formData
      registrations = await Registration.find({ 'formData.name': fieldName });
    }
    // --- END UPDATED QUERY LOGIC ---

    if (!registrations || registrations.length === 0) {
        return res.json({ success: true, data: [] }); // Return empty if no registrations found
    }

    // --- UPDATED DATA EXTRACTION ---
    const data = registrations.map(reg => {
      let fieldValue;
      let fieldLabel = fieldName; // Default label to field name

      if (isStaticField) {
        // Get value from the top-level field
        fieldValue = reg[fieldName];
        // Capitalize first letter for display label (optional)
        fieldLabel = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
      } else {
        // Get value from the formData array
        const field = reg.formData.find(f => f.name === fieldName);
        if (field) {
            fieldValue = field.value;
            fieldLabel = field.label; // Use the label stored in formData
        }
      }

      // Only include if value is actually found
      if (fieldValue !== undefined && fieldValue !== null) {
          return {
            registrationId: reg.registrationId,
            email: reg.email, // Always include email for context
            mobile: reg.mobile, // Always include mobile for context
            label: fieldLabel,
            value: fieldValue
          };
      }
      return null; // Return null if value wasn't found for this registration
    }).filter(item => item !== null); // Filter out the null entries
    // --- END UPDATED DATA EXTRACTION ---

    res.json({ success: true, data });

  } catch (error) {
    console.error('Get Data By Field Error:', error);
    res.status(500).json({ success: false, message: 'Server Error fetching data by field' });
  }
};

// Controller for POST /api/admin/messaging/whatsapp-bulk (Mock)
export const sendBulkWhatsapp = async (req, res) => {
  try {
    const { numbers, message } = req.body;
    if (!numbers || !message || numbers.length === 0) {
      return res.status(400).json({ success: false, message: 'Numbers and message are required' });
    }
    console.log('--- WHATSAPP BULK MESSAGE REQUEST ---');
    console.log(`Attempting to send "${message}" to ${numbers.length} numbers.`);
    // TODO: Implement WhatsApp Business API Integration
    res.json({
      success: true,
      message: `Request received for ${numbers.length} numbers. (This is a mock response)`
    });
  } catch (error) {
    console.error('Send Bulk WhatsApp Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Controller for POST /api/admin/create-admin (Dev Only)
// server/controllers/adminController.js

export const createAdminUser = async (req, res) => {
  try {
    // No 'secret' needed here, authMiddleware handles authorization
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Admin with this email already exists' });
    }

    // Hash password and create admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await Admin.create({ email, password: hashedPassword });

    res.status(201).json({ success: true, message: 'New admin user created successfully' });
  } catch (error) {
    console.error('Create Admin Error:', error);
    res.status(500).json({ success: false, message: 'Server Error creating admin' });
  }
};

// ... (other controllers) ...

// ---Controller for DELETE /api/admin/registrations/:id ---
export const deleteRegistration = async (req, res) => {
  try {
    const registrationId = req.params.id; // Get ID from URL parameter
    if (!registrationId) {
      return res.status(400).json({ success: false, message: 'Registration ID is required.' });
    }

    const registration = await Registration.findOneAndDelete({ registrationId: registrationId });

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }

    //Delete related OTP records if they weren't auto-deleted
    // await Otp.deleteMany({ email: registration.email, mobile: registration.mobile });

    res.json({ success: true, message: 'Registration deleted successfully.' });

  } catch (error) {
    console.error('Delete Registration Error:', error);
    res.status(500).json({ success: false, message: 'Server Error deleting registration.' });
  }
};

// ... (other controllers) ...

// ---Controller for GET /api/admin/registrations/:id ---
export const getSingleRegistration = async (req, res) => {
  try {
    const registrationId = req.params.id;
    if (!registrationId) {
      return res.status(400).json({ success: false, message: 'Registration ID is required.' });
    }

    // Find by registrationId, not the default _id
    const registration = await Registration.findOne({ registrationId: registrationId });

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }

    res.json({ success: true, registration }); // Send the full registration document

  } catch (error) {
    console.error('Get Single Registration Error:', error);
    res.status(500).json({ success: false, message: 'Server Error fetching registration.' });
  }
};

// ... (other controllers) ...

// ---Controller for PUT /api/admin/registrations/:id ---
export const updateRegistration = async (req, res) => {
  try {
    const registrationId = req.params.id;
    const updateData = req.body; // Contains { firstName, lastName, formData: [...] }

    if (!registrationId) {
      return res.status(400).json({ success: false, message: 'Registration ID is required.' });
    }

    // TODO: I have to Add validation for updateData

    // Find and update by registrationId
    const updatedRegistration = await Registration.findOneAndUpdate(
      { registrationId: registrationId },
      { $set: updateData }, // Update specified fields
      { new: true, runValidators: true } // Return the updated doc and run schema validators
    );

    if (!updatedRegistration) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }

    res.json({ success: true, message: 'Registration updated successfully.', registration: updatedRegistration });

  } catch (error) {
    console.error('Update Registration Error:', error);
    // Handle validation errors specifically if needed
    if (error.name === 'ValidationError') {
         return res.status(400).json({ success: false, message: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ success: false, message: 'Server Error updating registration.' });
  }
};

// --- Controller to List Admins ---
export const listAdminUsers = async (req, res) => {
  try {
    // Fetch all admins, excluding their passwords
    const admins = await Admin.find().select('-password');
    res.json({ success: true, admins });
  } catch (error) {
    console.error('List Admins Error:', error);
    res.status(500).json({ success: false, message: 'Server Error fetching admins' });
  }
};

// ---Controller to Delete Admin ---
export const deleteAdminUser = async (req, res) => {
  try {
    const adminIdToDelete = req.params.id; // Get ID from URL parameter
    const currentAdminId = req.admin._id.toString(); // ID of the admin making the request (from authMiddleware)

    if (!adminIdToDelete) {
      return res.status(400).json({ success: false, message: 'Admin ID is required.' });
    }

    // --- Prevent self-deletion ---
    if (adminIdToDelete === currentAdminId) {
      return res.status(400).json({ success: false, message: 'Admin cannot delete their own account.' });
    }
    // --- End self-deletion check ---

    // Find and delete by the MongoDB _id
    const admin = await Admin.findByIdAndDelete(adminIdToDelete);

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin user not found.' });
    }

    res.json({ success: true, message: 'Admin user deleted successfully.' });

  } catch (error) {
    console.error('Delete Admin Error:', error);
    res.status(500).json({ success: false, message: 'Server Error deleting admin.' });
  }
};