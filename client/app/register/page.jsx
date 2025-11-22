// client/app/register/page.jsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Image from 'next/image';

// Components
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { DynamicField } from '@/app/components/DynamicField';

export default function SinglePageRegister() {
    const router = useRouter();

    const { 
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        getValues,
        formState: { errors }
    } = useForm({
        mode: 'onBlur',
        defaultValues: {
            fullName: '',
            gender: '',
            dateOfBirth: '',
            email: '',
            mobile: '',
            emailOtp: '',
            mobileOtp: ''
        }
    });

    // OTP States
    const [emailOtpSent, setEmailOtpSent] = useState(false);
    const [phoneOtpSent, setPhoneOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);

    // Dynamic fields
    const [dynamicFields, setDynamicFields] = useState([]);

    // Token
    const [registrationToken, setRegistrationToken] = useState(null);

    // OTP Loading
    const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
    const [isSendingPhoneOtp, setIsSendingPhoneOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

    // Schema / Draft / Submit states
    const [isFetchingSchema, setIsFetchingSchema] = useState(false);
    const [isSubmittingForm, setIsSubmittingForm] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);

    const [error, setError] = useState('');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // Timer states (15s)
    const [emailTimer, setEmailTimer] = useState(0);
    const [phoneTimer, setPhoneTimer] = useState(0);

    const emailValue = watch("email");
    const mobileValue = watch("mobile");

    // --------------------
    // TIMER HANDLERS
    // --------------------

    // Email timer
    useEffect(() => {
        let interval;
        if (emailTimer > 0) {
            interval = setInterval(() => {
                setEmailTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [emailTimer]);

    // Phone timer
    useEffect(() => {
        let interval;
        if (phoneTimer > 0) {
            interval = setInterval(() => {
                setPhoneTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [phoneTimer]);

    // ------------------------------------------------------
    // FETCH SCHEMA + RESTORE DRAFT (IMPROVED VERSION)
    // ------------------------------------------------------
    const fetchDynamicFields = useCallback(async (token) => {
        if (!token) return;

        setError('');
        setIsFetchingSchema(true);

        try {
            // 1. Fetch schema
            const res = await axios.get(`${apiUrl}/api/form`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.data.success) {
                setError("Could not fetch form configuration.");
                setIsFetchingSchema(false);
                return;
            }

            const fields = res.data.fields.filter(
                f => f.name !== 'email' && f.name !== 'mobile'
            );
            setDynamicFields(fields);

            // 2. Try restoring draft
            try {
                const draftRes = await axios.get(`${apiUrl}/api/register/draft`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (draftRes.data.success && draftRes.data.draft) {
                    const draft = draftRes.data.draft;

                    const draftValues = {
                        fullName: draft.fullName || '',
                        gender: draft.gender || '',
                        dateOfBirth: draft.dateOfBirth 
                            ? new Date(draft.dateOfBirth).toISOString().split('T')[0] 
                            : '',
                        email: draft.email || '',
                        mobile: draft.mobile || ''
                    };

                    if (Array.isArray(draft.formData)) {
                        draft.formData.forEach(f => {
                            const fieldDef = fields.find(df => df.name === f.name);

                            if (fieldDef?.type === "Country") {
                                draftValues[f.name] = f.value
                                    ? { value: f.value, label: f.value }
                                    : null;
                            } else {
                                draftValues[f.name] = f.value || '';
                            }
                        });
                    }

                    const current = getValues();

                    const mergedValues = {
                        ...current,
                        ...draftValues,
                        fullName: draft.fullName ?? current.fullName ?? "",
                        gender: draft.gender ?? current.gender ?? "",
                        dateOfBirth: draft.dateOfBirth
                            ? new Date(draft.dateOfBirth).toISOString().split("T")[0]
                            : (current.dateOfBirth ?? ""),
                        email: draft.email ?? current.email ?? "",
                        mobile: draft.mobile ?? current.mobile ?? ""
                    };

                    reset(mergedValues);
                    alert("Welcome back! Your draft has been restored.");
                }

            } catch (draftErr) {
                if (draftErr?.response?.status !== 404) {
                    console.warn("Draft restore error:", draftErr);
                }
            }

        } catch (err) {
            console.error("Fetch schema error:", err);
            setError("Error loading fields.");

            if (err.response?.status === 401) {
                sessionStorage.removeItem('registration-token');
                sessionStorage.removeItem('registration-static-data');
                setRegistrationToken(null);
                setOtpVerified(false);
            }

        } finally {
            setIsFetchingSchema(false);
        }
    }, [apiUrl, reset, getValues]);

    // -------------------------------------------
    // RESTORE SESSION ON PAGE REFRESH
    // -------------------------------------------
    useEffect(() => {
        const token = sessionStorage.getItem('registration-token');
        const savedStatic = sessionStorage.getItem('registration-static-data');

        if (token) {
            try {
                const decoded = jwtDecode(token);

                if (decoded.exp * 1000 > Date.now()) {
                    setOtpVerified(true);
                    setEmailOtpSent(true);
                    setPhoneOtpSent(true);
                    setRegistrationToken(token);

                    if (savedStatic) {
                        reset(JSON.parse(savedStatic));
                    } else {
                        setValue("email", decoded.email);
                        setValue("mobile", decoded.mobile);
                    }

                    fetchDynamicFields(token);
                } else {
                    sessionStorage.removeItem('registration-token');
                }

            } catch (e) {
                console.error("Token decode error:", e);
                sessionStorage.removeItem('registration-token');
            }
        }
    }, [fetchDynamicFields, reset, setValue]);

    // -------------------------------------------
    // SEND OTP (EMAIL + PHONE) WITH TIMER LOGIC
    // -------------------------------------------
    const handleSendOtp = async (type) => {
        setError('');

        const endpoint = type === "email" ? "send-email" : "send-phone";
        const setLoading = type === "email" ? setIsSendingEmailOtp : setIsSendingPhoneOtp;
        const setSent = type === "email" ? setEmailOtpSent : setPhoneOtpSent;
        const setTimer = type === "email" ? setEmailTimer : setPhoneTimer;

        if (!emailValue || !mobileValue) {
            setError("Please enter Email and Mobile first.");
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post(`${apiUrl}/api/otp/${endpoint}`, {
                email: emailValue,
                mobile: mobileValue
            });

            if (res.data.success) {
                setSent(true);
                setTimer(15);   // 15 second timer
                alert(`${type === "email" ? "Email" : "Phone"} OTP sent!`);
            } else {
                setError(res.data.message || "Failed to send OTP.");
            }

        } catch (err) {
            const msg = err.response?.data?.message || "OTP sending failed";

            if (err.response?.status === 409 ||
                msg.toLowerCase().includes("already sent")) {

                setSent(true);
                setTimer(15); // timer still starts
                setError(msg);
            } else {
                setError(msg);
            }

        } finally {
            setLoading(false);
        }
    };

    // -------------------------------------------
    // VERIFY BOTH OTPs
    // -------------------------------------------
    const handleVerifyOtp = async () => {
        setError('');
        setIsVerifyingOtp(true);

        const emailOtpValue = watch("emailOtp");
        const mobileOtpValue = watch("mobileOtp");

        if (!emailOtpValue || !mobileOtpValue) {
            setError("Please enter both OTPs.");
            setIsVerifyingOtp(false);
            return;
        }

        try {
            const res = await axios.post(`${apiUrl}/api/otp/verify`, {
                email: emailValue,
                mobile: mobileValue,
                emailOtp: emailOtpValue,
                mobileOtp: mobileOtpValue
            });

            if (res.data.success) {
                setOtpVerified(true);
                setRegistrationToken(res.data.token);

                sessionStorage.setItem("registration-token", res.data.token);

                const staticData = {
                    fullName: getValues("fullName"),
                    gender: getValues("gender"),
                    dateOfBirth: getValues("dateOfBirth"),
                    email: emailValue,
                    mobile: mobileValue
                };

                sessionStorage.setItem("registration-static-data", JSON.stringify(staticData));

                alert("OTP Verified! Loading additional fields...");
                fetchDynamicFields(res.data.token);

            } else {
                setError(res.data.message || "Verification failed.");
            }

        } catch (err) {
            setError(err.response?.data?.message || "Verification error.");
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    // -------------------------------------------
    // SAVE DRAFT
    // -------------------------------------------
    const handleSaveDraft = async () => {
        const token = registrationToken || sessionStorage.getItem('registration-token');
        if (!token) return;

        setIsSavingDraft(true);

        const vals = getValues();

        const formDataArray = dynamicFields.map(f => ({
            name: f.name,
            label: f.label,
            value: f.type === "Country" ? vals[f.name]?.value || null : vals[f.name] || null
        }));

        const payload = {
            formData: formDataArray,
            fullName: vals.fullName,
            gender: vals.gender,
            dateOfBirth: vals.dateOfBirth,
            email: vals.email,
            mobile: vals.mobile
        };

        try {
            const res = await axios.post(`${apiUrl}/api/register/draft`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                alert("Draft saved successfully!");
            }

        } catch (err) {
            alert("Failed to save draft.");
        } finally {
            setIsSavingDraft(false);
        }
    };

    // -------------------------------------------
    // FINAL SUBMISSION
    // -------------------------------------------
    const onSubmitForm = async (data) => {
        setIsSubmittingForm(true);
        setError('');

        const token = registrationToken || sessionStorage.getItem('registration-token');
        if (!token) {
            setError("Session invalid. Please verify OTP again.");
            setIsSubmittingForm(false);
            return;
        }

        const formDataArray = dynamicFields.map(field => ({
            name: field.name,
            label: field.label,
            value: field.type === "Country"
                ? data[field.name]?.value || null
                : data[field.name] || null
        }));

        const submissionData = {
            fullName: data.fullName,
            gender: data.gender,
            dateOfBirth: data.dateOfBirth,
            formData: formDataArray
        };

        try {
            const res = await axios.post(`${apiUrl}/api/register`, submissionData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                sessionStorage.removeItem("registration-token");
                sessionStorage.removeItem("registration-static-data");

                alert("Registration Successful!");
                router.push("/");
            } else {
                setError(res.data.message || "Submission failed.");
            }

        } catch (err) {
            setError(err.response?.data?.message || "Submission error.");
        } finally {
            setIsSubmittingForm(false);
        }
    };

    // Warn user before leaving
    useEffect(() => {
        const handler = (e) => {
            if (otpVerified || emailOtpSent || phoneOtpSent) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [otpVerified, emailOtpSent, phoneOtpSent]);

    const showVerifyButton = emailOtpSent && phoneOtpSent && !otpVerified;
    const showDynamicFormSection = otpVerified && !isFetchingSchema;
    const showSubmit = otpVerified && !isFetchingSchema;

    const isLoading = isSendingEmailOtp || isSendingPhoneOtp || isVerifyingOtp || isFetchingSchema || isSubmittingForm;

    // ------------------------------------------------------
    // RENDER
    // ------------------------------------------------------
    return (
        <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-lg mt-8 text-gray-900">

            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8">

                <div className="flex flex-col items-center">
                    <Image src="/logos/ahvaan_logo.jpg" width={100} height={100} className="rounded-full" alt="Logo"/>
                    <h2 className="text-2xl font-bold text-blue-800 mt-3">Registration Form</h2>
                </div>

                {/* BASIC INFO */}
                <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-6 border p-4 rounded-md"
                    disabled={otpVerified || isLoading}>

                    <legend className="text-lg font-medium text-gray-900 px-2">Basic Information</legend>

                    <div>
                        <label className="block text-sm font-medium">Full Name *</label>
                        <input
                            type="text"
                            {...register("fullName", { required: "Full Name is required" })}
                            className="mt-1 block w-full px-3 py-2 border rounded-md"
                        />
                        {errors.fullName && (
                            <p className="text-sm text-red-600">{errors.fullName.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Gender</label>
                        <select {...register("gender")} className="mt-1 block w-full px-3 py-2 border rounded-md">
                            <option value="">Select...</option>
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Date of Birth</label>
                        <input
                            type="date"
                            {...register("dateOfBirth")}
                            className="mt-1 block w-full px-3 py-2 border rounded-md"
                        />
                    </div>
                </fieldset>

                {/* CONTACT VERIFICATION */}
                {!otpVerified && (
                    <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-6 border p-4 rounded-md"
                        disabled={isLoading}>

                        <legend className="text-lg font-medium px-2">Contact Verification</legend>

                        {/* EMAIL OTP */}
                        <div>
                            <label className="block text-sm font-medium">Email Address *</label>

                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    {...register("email", { required: true })}
                                    disabled={emailOtpSent}
                                    className={`block w-full px-3 py-2 border rounded-md ${emailOtpSent ? 'bg-gray-100' : ''}`}
                                />

                                <button
                                    type="button"
                                    onClick={() => handleSendOtp("email")}
                                    disabled={isLoading || emailTimer > 0}
                                    className={`px-3 py-2 rounded-md text-white w-36
                                        ${emailTimer > 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                                >
                                    {isSendingEmailOtp
                                        ? "..."
                                        : emailTimer > 0
                                            ? `Resend in ${emailTimer}s`
                                            : (emailOtpSent ? "Resend OTP" : "Send OTP")}
                                </button>
                            </div>

                            {emailOtpSent && (
                                <input
                                    type="text"
                                    {...register("emailOtp", { required: true })}
                                    maxLength={6}
                                    placeholder="Email OTP"
                                    className="mt-2 block w-full px-3 py-2 border rounded-md"
                                />
                            )}
                        </div>

                        {/* PHONE OTP */}
                        <div>
                            <label className="block text-sm font-medium">Mobile Number *</label>

                            <div className="flex gap-2 items-start">
                                <div className="flex-grow">
                                    <Controller
                                        name="mobile"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field: { onChange, value } }) => (
                                            <PhoneInput
                                                country={"in"}
                                                value={value}
                                                onChange={onChange}
                                                disabled={phoneOtpSent}
                                                inputClass={`block w-full px-3 py-2 border rounded-md ${phoneOtpSent ? 'bg-gray-100' : ''}`}
                                            />
                                        )}
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleSendOtp("phone")}
                                    disabled={isLoading || phoneTimer > 0}
                                    className={`px-3 py-[9px] rounded-md text-white w-36
                                        ${phoneTimer > 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                                >
                                    {isSendingPhoneOtp
                                        ? "..."
                                        : phoneTimer > 0
                                            ? `Resend in ${phoneTimer}s`
                                            : (phoneOtpSent ? "Resend OTP" : "Send OTP")}
                                </button>
                            </div>

                            {phoneOtpSent && (
                                <input
                                    type="text"
                                    {...register("mobileOtp", { required: true })}
                                    maxLength={6}
                                    placeholder="Mobile OTP"
                                    className="mt-2 block w-full px-3 py-2 border rounded-md"
                                />
                            )}
                        </div>

                        {/* VERIFY BOTH OTPs */}
                        {showVerifyButton && (
                            <div className="sm:col-span-2 mt-4">
                                <button
                                    type="button"
                                    onClick={handleVerifyOtp}
                                    disabled={isVerifyingOtp || isLoading}
                                    className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                                >
                                    {isVerifyingOtp ? "Verifying..." : "Verify Both OTPs"}
                                </button>
                            </div>
                        )}
                    </fieldset>
                )}

                {/* DYNAMIC FIELDS */}
                {showDynamicFormSection && (
                    <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-6 border p-4 rounded-md">
                        <legend className="text-lg font-medium px-2">Additional Details</legend>

                        {isFetchingSchema && (
                            <p className="sm:col-span-2 text-center">Loading...</p>
                        )}

                        {!isFetchingSchema &&
                            dynamicFields.map(field => (
                                <DynamicField
                                    key={field.name}
                                    field={field}
                                    fieldName={field.name}
                                    control={control}
                                    register={register}
                                    error={errors[field.name]}
                                    setValue={setValue}
                                />
                            ))
                        }

                        {!isFetchingSchema && dynamicFields.length === 0 && (
                            <p className="sm:col-span-2 text-center text-gray-500">
                                No additional details required.
                            </p>
                        )}
                    </fieldset>
                )}

                {error && <p className="text-center text-sm text-red-600">{error}</p>}

                {/* SUBMIT + SAVE DRAFT */}
                {showSubmit && (
                    <div className="flex justify-center gap-4 pt-4 border-t">
                        <button
                            type="button"
                            onClick={handleSaveDraft}
                            disabled={isSavingDraft || isSubmittingForm}
                            className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400"
                        >
                            {isSavingDraft ? "Saving Draft..." : "Save as Draft"}
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmittingForm}
                            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {isSubmittingForm ? "Submitting..." : "Submit Registration"}
                        </button>
                    </div>
                )}

            </form>
        </div>
    );
}
