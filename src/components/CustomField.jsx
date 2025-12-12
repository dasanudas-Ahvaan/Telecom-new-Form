import { useState, useEffect } from "react";
import axios from "axios";
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
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Manage Custom Fields</h2>

      <div className="bg-black p-4 rounded shadow mb-6">
        <label>Label</label>
        <input
          className="border p-2 w-full mb-2"
          placeholder="Label"
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          required
        />

        <label>Data Type</label>
        <select
          className="border p-2 w-full mb-2 bg-black"
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="email">Email</option>
          <option value="date">Date</option>
          <option value="select">Select (Dropdown)</option>
          <option value="checkbox">Checkbox</option>
        </select>

        {form.type === "select" && (
          <input
            className="border p-2 w-full mb-2"
            placeholder="Options (comma separated)"
            onChange={(e) => setForm({ ...form, options: e.target.value })}
          />
        )}

        <label className="flex items-center mb-2">
          <input
            type="checkbox"
            onChange={(e) => setForm({ ...form, required: e.target.checked })}
          />
          <span className="ml-2">Required</span>
        </label>

        <button
          onClick={createField}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Field
        </button>
      </div>

      <h3 className="font-bold mb-2">Existing Fields:</h3>
      {fields.map((f) => (
        <div
          key={f._id}
          className="p-3 bg-gray-600 rounded mb-2 flex justify-between"
        >
          <p>
            {f.label} - Data Type:-({f.type})
          </p>
          <button onClick={() => deleteField(f._id)} className="text-red-600">
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
