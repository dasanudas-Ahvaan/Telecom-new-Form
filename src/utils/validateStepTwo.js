export const validateStepTwo = (data) => {
  const errors = {};
  
  // Name: Min 3 chars, Letters & Spaces only
  if (!data.fullName.trim()) errors.fullName = "Full Name is required";
  else if (data.fullName.length < 3) errors.fullName = "Name must be at least 3 characters";
  else if (!/^[a-zA-Z\s]+$/.test(data.fullName)) errors.fullName = "Name can only contain letters and spaces";

  // Phone: 10 Digits
  if (!data.phone) errors.phone = "Phone number is required";
  else if (!/^\d{10}$/.test(data.phone)) errors.phone = "Phone must be 10 digits";

  // Gender
  if (!data.gender) errors.gender = "Please select a gender";

  // DOB
  if (!data.dateOfBirth) errors.dateOfBirth = "Date of Birth is required";

  // Aadhar: 12 Digits
  if (!data.aadhar) errors.aadhar = "Aadhar number is required";
  else if (!/^\d{12}$/.test(data.aadhar)) errors.aadhar = "Aadhar must be 12 digits";

  // Education & Profession
  if (!data.education.trim()) errors.education = "Education is required";
  if (!data.profession.trim()) errors.profession = "Profession is required";

  // Address
  if (!data.addressLine1.trim()) errors.addressLine1 = "Address Line 1 is required";
  if (!data.pincode) errors.pincode = "Pincode is required";
  else if (!/^\d{6}$/.test(data.pincode)) errors.pincode = "Pincode must be 6 digits";
  
  if (!data.city.trim()) errors.city = "City is required";
  if (!data.state.trim()) errors.state = "State is required";
  if (!data.country.trim()) errors.country = "Country is required";

  return errors;
};