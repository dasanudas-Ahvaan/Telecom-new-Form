import { useState } from "react";
import Input from "../components/Input";
import {
    UserIcon,
    HomeIcon,
    FileIcon,
    CheckCircleIcon,
} from "../components/icons";
import {
    submitYuSanskar
} from "../api/YuSanskar";
import Modal from "../components/Modal";

const initialData = {
    email: "",
    fullName: "",
    fatherName: "",
    varna: "",
    motherVarna: "",
    gotra: "",
    motherGotra: "",
    age: "",
    address: "",
    nativePlace: "",
    isUpaneet: "",
    fatherUpanayanDone: "",
    fatherUpanayanAge: "",
    fatherSandhya: "",
    generationDetails: "",
    fatherUpanayanAge: "",
    underAcharyaRamshankar: "",
    acharyaDetails: "",
    mobileNumber: "",
    additionalInfo: "",
    aadhaarPhoto: "test",
    aadhaarNumber: "",
    aadhaarLinkedMobile: "",
};

const YuSanskar = () => {
    const [formData, setFormData] = useState(initialData);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: "default",
        title: "",
        message: "",
    });

    const showModal = (type, title, message) => {
        setModalConfig({ isOpen: true, type, title, message });
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (files) {
            //   setFormData((prev) => ({
            //     ...prev,
            //     [name]: "test"//files[0],
            //   }));
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            const data = new FormData();

            Object.keys(formData).forEach((key) => {
                data.append(key, formData[key]);
            });

            console.log("Submitting", formData);

            const response = await submitYuSanskar(formData);

            if (response.success) {
                showModal(
                    "success",
                    "Registration Successful!",
                    "Your member registration has been completed successfully. We will contact you soon.",
                );

                setFormData(initialData);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const selectClass =
        "w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500";

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
            <div className="max-w-7xl mx-auto">

                <form
                    onSubmit={handleSubmit}
                    className="space-y-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-xl"
                >

                    {/* PERSONAL DETAILS */}
                    <section>
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-700 pb-4">
                            <div className="p-2 bg-orange-600 rounded-xl">
                                <UserIcon />
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold text-white">
                                    Personal Details
                                </h2>
                                <p className="text-gray-400 text-sm">
                                    Basic information
                                </p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">

                            <Input
                                label="Full Name"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                label="Father Name"
                                name="fatherName"
                                value={formData.fatherName}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                label="Email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                label="Mobile Number"
                                name="mobileNumber"
                                value={formData.mobileNumber}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                label="Age"
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                required
                            />

                        </div>
                    </section>

                    {/* FAMILY DETAILS */}
                    <section>
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-700 pb-4">
                            <div className="p-2 bg-blue-600 rounded-xl">
                                <UserIcon />
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold text-white">
                                    Family Details
                                </h2>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">

                            <div>
                                <label className="block text-gray-400 mb-2">
                                    Varna
                                </label>

                                <select
                                    name="varna"
                                    value={formData.varna}
                                    onChange={handleChange}
                                    className={selectClass}
                                >
                                    <option value="">Select</option>
                                    <option value="ब्राह्मण">ब्राह्मण</option>
                                    <option value="क्षत्रिय">क्षत्रिय</option>
                                    <option value="वैश्य">वैश्य</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-400 mb-2">
                                    Mother's Varna
                                </label>

                                <select
                                    name="motherVarna"
                                    value={formData.motherVarna}
                                    onChange={handleChange}
                                    className={selectClass}
                                >
                                    <option value="">Select</option>
                                    <option value="ब्राह्मण">ब्राह्मण</option>
                                    <option value="क्षत्रिय">क्षत्रिय</option>
                                    <option value="वैश्य">वैश्य</option>
                                </select>
                            </div>

                            <Input
                                label="Gotra"
                                name="gotra"
                                value={formData.gotra}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                label="Mother Gotra"
                                name="motherGotra"
                                value={formData.motherGotra}
                                onChange={handleChange}
                                required
                            />

                        </div>
                    </section>

                    {/* UPANAYAN DETAILS */}
                    <section>
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-700 pb-4">
                            <div className="p-2 bg-purple-600 rounded-xl">
                                <FileIcon />
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold text-white">
                                    Upanayan Details
                                </h2>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">

                            <select
                                name="isUpaneet"
                                value={formData.isUpaneet}
                                onChange={handleChange}
                                className={selectClass}
                            >
                                <option value="">उपनित हैं?</option>
                                <option value="हाँ">हाँ</option>
                                <option value="नहीं">नहीं</option>
                            </select>

                            <select
                                name="fatherUpanayanDone"
                                value={formData.fatherUpanayanDone}
                                onChange={handleChange}
                                className={selectClass}
                            >
                                <option value="">Father Upanayan Done?</option>
                                <option value="हाँ">हाँ</option>
                                <option value="नहीं">नहीं</option>
                            </select>

                            {formData.fatherUpanayanAge && <select
                                name="fatherUpanayanAge"
                                value={formData.fatherUpanayanAge}
                                onChange={handleChange}
                                className={selectClass}
                            >
                                <option value="">Father Upanayan Age?</option>
                                <option value="अप्रासंगिक">अप्रासंगिक</option>
                                <option value="5-12 वर्ष की आयु के मध्य">5-12 वर्ष की आयु के मध्य</option>
                                <option value="12-16 वर्ष की आयु के मध्य">12-16 वर्ष की आयु के मध्य</option>
                                <option value="16-22 वर्ष की आयु के मध्य">16-22 वर्ष की आयु के मध्य</option>
                                <option value="22-24 वर्ष की आयु के मध्य">22-24 वर्ष की आयु के मध्य</option>
                                <option value="24 वर्ष के उपरान्त">24 वर्ष के उपरान्त</option>
                            </select>}

                            <select
                                name="fatherSandhya"
                                value={formData.fatherSandhya}
                                onChange={handleChange}
                                className={selectClass}
                            >
                                <option value="">Father Sandhya</option>
                                <option value="हाँ">हाँ</option>
                                <option value="नहीं">नहीं</option>
                                <option value="अप्रासंगिक">अप्रासंगिक</option>
                            </select>

                            <select
                                name="underAcharyaRamshankar"
                                value={formData.underAcharyaRamshankar}
                                onChange={handleChange}
                                className={selectClass}
                            >
                                <option value="">Under AcharyaRamshankar</option>
                                <option value="हाँ">हाँ</option>
                                <option value="नहीं">नहीं</option>
                                <option value="अप्रासंगिक">अप्रासंगिक</option>
                            </select>

                            <Input
                                label="Generation Details"
                                name="generationDetails"
                                value={formData.generationDetails}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                label="Acharya Details"
                                name="acharyaDetails"
                                value={formData.acharyaDetails}
                                onChange={handleChange}
                            />

                        </div>
                    </section>

                    {/* ADDRESS */}
                    <section>
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-700 pb-4">
                            <div className="p-2 bg-green-600 rounded-xl">
                                <HomeIcon />
                            </div>

                            <h2 className="text-xl font-semibold text-white">
                                Address Details
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">

                            <Input
                                label="Address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                label="Native Place"
                                name="nativePlace"
                                value={formData.nativePlace}
                                onChange={handleChange}
                            />

                        </div>
                    </section>

                    {/* AADHAAR DETAILS */}
                    <section>
                        <div className="grid md:grid-cols-2 gap-5">

                            <Input
                                label="Aadhaar Number"
                                name="aadhaarNumber"
                                value={formData.aadhaarNumber}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                label="Aadhaar Linked Mobile"
                                name="aadhaarLinkedMobile"
                                value={formData.aadhaarLinkedMobile}
                                onChange={handleChange}
                                required
                            />

                            <div className="md:col-span-2">
                                <label className="block text-gray-400 mb-2">
                                    Aadhaar Photo
                                </label>

                                <input
                                    type="file"
                                    name="aadhaarPhoto"
                                    accept="image/*"
                                    onChange={handleChange}
                                    className="w-full text-white border border-gray-700 rounded-xl p-3 bg-gray-900/50"
                                />
                            </div>
                        </div>
                    </section>

                    {/* ADDITIONAL INFO */}
                    <section>
                        <textarea
                            name="additionalInfo"
                            value={formData.additionalInfo}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Additional Information"
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-white"
                        />
                    </section>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-orange-600 to-red-600 py-4 rounded-xl text-white font-semibold"
                    >
                        {loading ? "Submitting..." : "Submit Application"}
                    </button>

                </form>
                <Modal
                    isOpen={modalConfig.isOpen}
                    onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
                    title={modalConfig.title}
                    message={modalConfig.message}
                    type={modalConfig.type}
                    size="md"
                    closeOnOverlay={modalConfig.type === "success"}
                />
            </div>
        </div>
    );
};

export default YuSanskar;