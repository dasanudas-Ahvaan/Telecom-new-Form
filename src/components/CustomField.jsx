import { useState, useEffect } from "react";
import {
  createCustomField,
  deleteCustomField,
  getCustomFields,
} from "../api/CustomField";
import { useAuth } from "../authContext/AuthContext";

export default function CustomFields() {
  const { token, user } = useAuth();

  const [fields, setFields] = useState([]);
  const [form, setForm] = useState({
    name: "",
    label: "",
    type: "text",
    required: false,
    options: "",
  });

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    const response = await getCustomFields();
    setFields(response?.data || []);
  };

  const createField = async () => {
    const payload = { ...form };
    if (form.type !== "select") payload.options = [];
    else payload.options = form.options.split(",").map((o) => o.trim());

    await createCustomField(payload, user?._id, token);
    fetchFields();
  };

  const deleteField = async (id) => {
    await deleteCustomField(id, user?._id, token);
    fetchFields();
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center bg-transparent">
      
      {/* Container with Glassmorphism: White background, semi-transparent */}
      <div className="max-w-xl w-full bg-white/85 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/30">
        <h2 className="text-3xl font-extrabold text-blue-900 mb-6 text-center border-b pb-4">
          Manage Custom Fields
        </h2>

        {/* Input Section */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col">
            <label className="text-black font-semibold mb-1 ml-1">Label</label>
            <input
              className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none text-black"
              placeholder="Enter Field Label"
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-black font-semibold mb-1 ml-1">Data Type</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none text-black cursor-pointer"
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="email">Email</option>
              <option value="date">Date</option>
              <option value="select">Select (Dropdown)</option>
              <option value="checkbox">Checkbox</option>
            </select>
          </div>

          {form.type === "select" && (
            <div className="flex flex-col">
              <label className="text-black font-semibold mb-1 ml-1">Options</label>
              <input
                className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none text-black"
                placeholder="Option1, Option2, Option3"
                onChange={(e) => setForm({ ...form, options: e.target.value })}
              />
            </div>
          )}

          <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-black/5 transition-all">
            <input
              type="checkbox"
              className="w-5 h-5 accent-blue-600"
              onChange={(e) => setForm({ ...form, required: e.target.checked })}
            />
            <span className="text-black font-medium">Mark as Required</span>
          </label>

          <button
            onClick={createField}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 mt-2"
          >
            Add New Field
          </button>
        </div>

        {/* List Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 ml-1">Existing Fields</h3>
          <div className="space-y-3">
            {fields.map((f) => (
              <div
                key={f._id}
                className="p-4 bg-white/50 border border-gray-200 rounded-xl flex justify-between items-center group hover:bg-white transition-all shadow-sm"
              >
                <div className="flex flex-col">
                  <strong className="text-black text-lg">{f.label}</strong>
                  <span className="text-gray-600 text-xs uppercase font-bold tracking-wider">
                    {f.type} {f.required ? "• Required" : "• Optional"}
                  </span>
                </div>
                <button 
                  onClick={() => deleteField(f._id)} 
                  className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-600 hover:text-white transition-all font-bold text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
            {fields.length === 0 && (
              <p className="text-center text-gray-500 italic py-4">No custom fields created yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}