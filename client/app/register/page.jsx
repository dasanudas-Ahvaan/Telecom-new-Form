// client/app/register/page.jsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// --- Import components ---
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import Image from 'next/image'; // Import Image

// --- Re-usable Dynamic Field Component ---
const DynamicField = ({ field, control, register, error }) => {
    const { name, label, type, required, options } = field;
    if (name === 'email' || name === 'mobile') return null; // Filter out

    const isReadOnly = false; // All dynamic fields are editable
    const baseInputClasses = `mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400`;
    const readOnlyClasses = isReadOnly ? 'bg-gray-100 cursor-not-allowed' : '';
    const commonBaseProps = { id: name, className: `${baseInputClasses} ${readOnlyClasses}`, readOnly: isReadOnly };

    const renderField = () => {
        switch (type) {
            case 'Text':
                return <input type="text" {...commonBaseProps} {...register(name, { required: required && `${label} is required` })} />;
            case 'Email':
                return <input type="email" {...commonBaseProps} {...register(name, { required: required && `${label} is required` })} />;
            case 'Number':
                return <input type="number" {...commonBaseProps} {...register(name, { required: required && `${label} is required` })} />;
            case 'Date':
                return <input type="date" {...commonBaseProps} {...register(name, { required: required && `${label} is required` })} />;
            case 'Phone': return null; // Should be filtered, but double-check
            case 'Country':
                const countryOptions = useMemo(() => countryList().getData(), []);
                return (
                    <Controller name={name} control={control} rules={{ required: required && `${label} is required` }}
                        render={({ field: controllerField }) => (
                            <Select
                                {...controllerField}
                                options={countryOptions}
                                className="mt-1 text-gray-900"
                                classNamePrefix="react-select"
                                isDisabled={isReadOnly}
                                placeholder={`Select ${label}...`}
                                styles={{
                                    placeholder: (base) => ({ ...base, color: '#9ca3af' }),
                                    input: (base) => ({ ...base, color: '#111827' }),
                                    singleValue: (base) => ({ ...base, color: '#111827' }),
                                    control: (base) => ({ ...base, borderColor: '#d1d5db', boxShadow: 'none', '&:hover': { borderColor: '#9ca3af' } }),
                                }}
                            />
                        )}
                    />
                );
            case 'Radio':
                return (
                    <div className="mt-2 space-y-1 text-gray-900">
                        {(options || []).map((opt) => (
                            <label key={opt} className="flex items-center gap-2">
                                <input type="radio" value={opt} {...register(name, { required: required && `${label} is required` })}
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300" disabled={isReadOnly} /> {opt}
                            </label>
                        ))}
                    </div>
                );
            case 'Checkbox':
                 return (
                    <div className="mt-2 space-y-1 text-gray-900">
                        {(options || []).map((opt) => (
                            <label key={opt} className="flex items-center gap-2">
                                <input type="checkbox" value={opt} {...register(name)}
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" disabled={isReadOnly} /> {opt}
                            </label>
                        ))}
                    </div>
                );
            default:
                 return <input type="text" {...commonBaseProps} {...register(name, { required: required && `${label} is required` })} />;
        }
    };
     if (!renderField()) return null;
    return (
        <div className={`sm:col-span-1 ${type === 'Checkbox' || type === 'Radio' ? 'sm:col-span-2' : ''}`}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label} {required && '*'}</label>
            {renderField()}
            {error && error.message && typeof error.message === 'string' && (
               <p className="mt-1 text-sm text-red-600">{error.message}</p>
            )}
        </div>
    );
};
// --- End Dynamic Field ---


export default function SinglePageRegister() {
    const router = useRouter();
    const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
        mode: 'onBlur',
        defaultValues: {
            firstName: '', lastName: '', gender: '', dateOfBirth: '',
            email: '', mobile: '', emailOtp: '', mobileOtp: ''
        }
    });

    // State for flow control
    const [emailOtpSent, setEmailOtpSent] = useState(false);
    const [phoneOtpSent, setPhoneOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false); // Key state
    const [dynamicFields, setDynamicFields] = useState([]);
    const [registrationToken, setRegistrationToken] = useState(null);

    // State for loading indicators
    const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
    const [isSendingPhoneOtp, setIsSendingPhoneOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [isFetchingSchema, setIsFetchingSchema] = useState(false);
    const [isSubmittingForm, setIsSubmittingForm] = useState(false);

    const [error, setError] = useState(''); // General error message

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const emailValue = watch("email");
    const mobileValue = watch("mobile");

    // --- OTP Sending Function ---
    const handleSendOtp = async (type) => {
        setError('');
        const endpoint = type === 'email' ? 'send-email' : 'send-phone';
        const setLoading = type === 'email' ? setIsSendingEmailOtp : setIsSendingPhoneOtp;
        const setSent = type === 'email' ? setEmailOtpSent : setPhoneOtpSent;
        const value = type === 'email' ? emailValue : mobileValue;

        if (!emailValue || !mobileValue) {
            setError('Please enter both Email and Mobile Number first.');
            return;
        }

        setLoading(true);
        try {
            // Backend controller now includes duplicate check
            const res = await axios.post(`${apiUrl}/api/otp/${endpoint}`, { email: emailValue, mobile: mobileValue });
            if (res.data.success) {
                setSent(true);
                alert(`${type === 'email' ? 'Email' : 'Phone'} OTP sent! (Check console in dev mode)`);
            } else {
                setError(res.data.message || `Failed to send ${type} OTP.`);
            }
        } catch (err) {
            console.error(`Send ${type} OTP err:`, err);
            if (err.response?.status === 409) { // Duplicate user
                setError(err.response.data.message);
            } else {
                setError(err.response?.data?.message || `Error sending ${type} OTP.`);
            }
        } finally {
            setLoading(false);
        }
    };

    // --- Verify OTP Function ---
    const handleVerifyOtp = async () => {
        setError('');
        setIsVerifyingOtp(true);
        const emailOtpValue = watch("emailOtp");
        const mobileOtpValue = watch("mobileOtp");

        if (!emailOtpValue || !mobileOtpValue) {
            setError('Please enter both OTPs.');
            setIsVerifyingOtp(false);
            return;
        }

        try {
            const res = await axios.post(`${apiUrl}/api/otp/verify`, {
                email: emailValue, mobile: mobileValue,
                emailOtp: emailOtpValue, mobileOtp: mobileOtpValue
            });
            if (res.data.success) {
                setOtpVerified(true); // <-- This is the key: verification is successful
                setRegistrationToken(res.data.token); // Store the token
                sessionStorage.setItem('registration-token', res.data.token); // Also save to session storage
                alert('OTPs Verified! Loading additional fields...');
                fetchDynamicFields(res.data.token); // Fetch dynamic fields
            } else {
                setError(res.data.message || 'OTP Verification Failed.');
            }
        } catch (err) {
            console.error("Verify OTP err:", err);
            setError(err.response?.data?.message || 'Error verifying OTPs.');
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    // --- Fetch Dynamic Fields (runs after OTP verify) ---
    const fetchDynamicFields = async (token) => {
        if (!token) return;
        setError('');
        setIsFetchingSchema(true);
        try {
            const res = await axios.get(`${apiUrl}/api/form`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.data.success) {
                const fields = res.data.fields.filter(f => f.name !== 'email' && f.name !== 'mobile');
                setDynamicFields(fields);
                if (fields.length === 0) {
                    console.log("No additional dynamic fields configured by admin.");
                }
            } else {
                setError("Could not fetch form configuration.");
            }
        } catch (err) {
            console.error("Fetch schema err:", err);
            setError("Error loading dynamic form fields.");
            if (err.response?.status === 401) {
                sessionStorage.removeItem('registration-token');
                setRegistrationToken(null);
                setOtpVerified(false);
                setError("Session expired. Please re-verify OTPs.");
            }
        } finally {
            setIsFetchingSchema(false);
        }
    };

    // --- Final Form Submission ---
    const onSubmitForm = async (data) => {
        // This function is only called by the final submit button
        setIsSubmittingForm(true);
        setError('');
        const token = registrationToken || sessionStorage.getItem('registration-token');
        if (!token) {
             setError("Session invalid. Please verify OTP again.");
             setIsSubmittingForm(false);
             setOtpVerified(false);
             return;
        }

        // Combine static and dynamic data
        const fieldsToSubmit = dynamicFields;
        const formDataArray = fieldsToSubmit.map(field => ({
            name: field.name, label: field.label,
            value: (field.type === 'Country' && data[field.name]?.value) ? data[field.name].value : (data[field.name] || null)
        }));

        const submissionData = {
            formData: formDataArray,
            firstName: data.firstName, // From static field
            lastName: data.lastName,   // From static field
            gender: data.gender,     // From static field
            dateOfBirth: data.dateOfBirth // From static field
        };

        try {
            const res = await axios.post(`${apiUrl}/api/register`, submissionData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.data.success) {
                sessionStorage.removeItem('registration-token');
                setRegistrationToken(null);
                alert('Registration Successful! Thank you.');
                router.push('/');
            } else { setError(res.data.message || 'Form submission failed.'); }
        } catch (err) {
            console.error("Submit error:", err);
            setError(err.response?.data?.message || 'An error occurred during submission.');
        } finally { setIsSubmittingForm(false); }
    };

    // --- Conditional Rendering Logic ---
    const showVerifyButton = emailOtpSent && phoneOtpSent && !otpVerified;
    const showDynamicFormSection = otpVerified && !isFetchingSchema;
    const showSubmitButton = otpVerified && !isFetchingSchema;
    const isLoading = isSendingEmailOtp || isSendingPhoneOtp || isVerifyingOtp || isFetchingSchema || isSubmittingForm;

    return (
        <div className="max-w-4xl mx-auto bg-white bg-opacity-95 p-6 sm:p-8 rounded-lg shadow-lg mt-8 text-gray-900">
            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8">
                <div className="flex flex-col items-center">
                    <Image
                        src="/logos/ahvaan_logo.jpg"
                        alt="Ahvaan Logo"
                        width={100}
                        height={100}
                        className="mx-auto mb-4 rounded-full"
                    />
                    <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">
                        Registration Form
                    </h2>
                </div>

                 {/* --- Section 1: Static Info --- */}
                <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-6 border p-4 rounded-md" disabled={otpVerified || isLoading}>
                    <legend className="text-lg font-medium text-gray-900 px-2">Basic Information</legend>
                    {/* First Name */}
                    <div>
                         <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name *</label>
                         <input type="text" id="firstName" {...register("firstName", { required: "First Name is required" })}
                             className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${otpVerified ? 'bg-gray-100' : ''}`} />
                         {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>}
                     </div>
                     {/* Last Name */}
                     <div>
                         <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name *</label>
                         <input type="text" id="lastName" {...register("lastName", { required: "Last Name is required" })}
                             className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${otpVerified ? 'bg-gray-100' : ''}`} />
                         {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>}
                     </div>
                     {/* Gender */}
                     <div>
                         <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                         <select id="gender" {...register("gender")}
                             className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${otpVerified ? 'bg-gray-100' : ''}`}>
                             <option value="">Select...</option> <option value="Male">Male</option> <option value="Female">Female</option> <option value="Other">Other</option>
                         </select>
                         {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>}
                     </div>
                      {/* Date of Birth */}
                     <div>
                         <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                         <input type="date" id="dateOfBirth" {...register("dateOfBirth")}
                             className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${otpVerified ? 'bg-gray-100' : ''}`} />
                         {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>}
                     </div>
                </fieldset>

                 {/* --- Section 2: Email/Phone Verification --- */}
                {!otpVerified && (
                    <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-6 border p-4 rounded-md" disabled={isLoading}>
                        <legend className="text-lg font-medium text-gray-900 px-2">Contact Verification</legend>
                        {/* Email */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address *</label>
                            <div className="flex gap-2">
                                <input type="email" id="email" {...register("email", { required: "Email required" })}
                                    disabled={emailOtpSent || isLoading}
                                    className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${emailOtpSent ? 'bg-gray-100' : ''}`}
                                    placeholder="you@example.com"/>
                                <button type="button" onClick={() => handleSendOtp('email')} disabled={isLoading || emailOtpSent}
                                    className="px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 whitespace-nowrap">
                                    {isSendingEmailOtp ? '...' : (emailOtpSent ? 'Sent ✓' : 'Send OTP')}
                                </button>
                            </div>
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                            {emailOtpSent && (
                                <div>
                                    <label htmlFor="emailOtp" className="block text-sm font-medium text-gray-700 mt-2">Email OTP *</label>
                                    <input type="text" id="emailOtp" {...register("emailOtp", { required: "Email OTP required" })} maxLength={6}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="6-digit code"/>
                                    {errors.emailOtp && <p className="mt-1 text-sm text-red-600">{errors.emailOtp.message}</p>}
                                </div>
                            )}
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile Number *</label>
                            <div className="flex gap-2 items-start">
                                <Controller name="mobile" control={control} rules={{ required: "Mobile required" }}
                                    render={({ field: { onChange, value } }) => (
                                        <div className="flex-grow">
                                             <PhoneInput country={'in'} value={value} onChange={onChange}
                                                disabled={phoneOtpSent || isLoading}
                                                inputProps={{ id: "mobile", required: true }}
                                                inputClass={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${phoneOtpSent ? 'bg-gray-100' : ''}`}
                                            />
                                        </div>
                                    )}
                                />
                                <button type="button" onClick={() => handleSendOtp('phone')} disabled={isLoading || phoneOtpSent}
                                    className="px-3 py-[9px] border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 whitespace-nowrap self-end mb-[1px]">
                                    {isSendingPhoneOtp ? '...' : (phoneOtpSent ? 'Sent ✓' : 'Send OTP')}
                                </button>
                            </div>
                            {errors.mobile && <p className="mt-1 text-sm text-red-600">{errors.mobile.message}</p>}
                            {phoneOtpSent && (
                                <div>
                                    <label htmlFor="mobileOtp" className="block text-sm font-medium text-gray-700 mt-2">Mobile OTP *</label>
                                    <input type="text" id="mobileOtp" {...register("mobileOtp", { required: "Mobile OTP required" })} maxLength={6}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="6-digit code"/>
                                    {errors.mobileOtp && <p className="mt-1 text-sm text-red-600">{errors.mobileOtp.message}</p>}
                                </div>
                            )}
                        </div>

                        {/* Verify Button */}
                        {showVerifyButton && (
                            <div className="sm:col-span-2 mt-4">
                                <button type="button" onClick={handleVerifyOtp} disabled={isVerifyingOtp || isLoading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400">
                                    {isVerifyingOtp ? 'Verifying...' : 'Verify Both OTPs'}
                                </button>
                            </div>
                        )}
                    </fieldset>
                )}

                {/* --- Section 3: Dynamic Fields --- */}
                {showDynamicFormSection && (
                    <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-6 border p-4 rounded-md">
                        <legend className="text-lg font-medium text-gray-900 px-2">Additional Details</legend>
                        {isFetchingSchema && <p className="sm:col-span-2 text-center text-gray-600">Loading form fields...</p>}
                        
                        {!isFetchingSchema && dynamicFields.length > 0 && dynamicFields.map(field => (
                            <DynamicField
                                key={field.name}
                                field={field}
                                control={control}
                                register={register}
                                error={errors[field.name]}
                            />
                        ))}
                         
                         {!isFetchingSchema && dynamicFields.length === 0 && !error && (
                            <p className="sm:col-span-2 text-center text-gray-500">No additional details required by admin.</p>
                         )}
                    </fieldset>
                )}

                {/* --- Error Display Area --- */}
                {error && (
                    <p className="text-sm text-red-600 text-center">{error}</p>
                )}

                {/* --- Final Submit Button --- */}
                {showSubmitButton && (
                    <div className="text-center pt-4 border-t">
                        <button type="submit" disabled={isSubmittingForm || isFetchingSchema}
                            className="w-1/2 flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 mx-auto">
                            {isSubmittingForm ? 'Submitting...' : 'Submit Registration'}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}

