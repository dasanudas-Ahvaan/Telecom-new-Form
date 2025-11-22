import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // --- MODIFIED (Req 6) ---
  // Changed role to an enum with 'Owner' and 'Admin'
  role: { 
    type: String, 
    enum: ['Admin', 'Owner'], // Define the allowed roles
    default: 'Admin'          // Set the default role
  }
  // --- END MODIFICATION ---
});

// Optional: Add an index on role if you query by it often
adminSchema.index({ role: 1 });

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;