import { useContext, useEffect, useState } from "react";
import Loader from "../components/Loader";
import { useAuth } from "../authContext/AuthContext";
import { useNavigate } from "react-router-dom";
import { login } from "../api/Auth";

const Login = () => {
  const initialFormData = {
    email: "",
    password: "",
  };
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [err, setErr] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { saveToken, token, saveUser } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await login(formData);
      setFormData(initialFormData);
      if (err) setErr("");
      setIsLoading(false);
      const { token, data } = response;
      saveToken(token);
      saveUser(data);
    } catch (error) {
      setFormData(initialFormData);
      setErr(error.message);
      setIsLoading(false);
      console.error("Login failed:", error.message);
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  }, [token]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-transparent px-4">
      {/* Main Container: 
          - Increased max-w-lg (approx 512px) for a wider look.
          - Added w-full to ensure it uses the max width allowed.
      */}
      <form
        onSubmit={handleLogin}
        className="w-full max-w-lg flex flex-col gap-6 text-gray-700 bg-white/85 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl border border-white/30"
      >
        <div className="flex flex-col items-center mb-2">
           <img 
             src="/logos/ahvaan_logo.jpg" 
             alt="Logo" 
             className="h-20 w-auto object-contain transition-transform hover:scale-105 duration-300" 
           />
           <h2 className="text-3xl font-extrabold text-blue-900 mt-4 tracking-tight">Admin Login</h2>
           <p className="text-gray-500 text-sm mt-1">Please enter your credentials to access the portal</p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col w-full">
            <label htmlFor="email" className="font-semibold mb-1 text-sm ml-1 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <input
                value={formData.email}
                className="w-full border border-gray-300 rounded-xl p-3 pl-4 bg-white/60 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="admin@telecom.com"
                type="email"
                name="email"
                required
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex flex-col w-full">
            <label htmlFor="password" className="font-semibold mb-1 text-sm ml-1 uppercase tracking-wider">Password</label>
            <input
              value={formData.password}
              className="w-full border border-gray-300 rounded-xl p-3 pl-4 bg-white/60 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              type="password"
              name="password"
              required
              onChange={handleChange}
            />
          </div>
        </div>

        <button className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-200 transition-all text-lg mt-2">
          {isLoading ? <Loader /> : "Secure Login"}
        </button>

        <div className="h-6 flex justify-center">
          {err && (
            <small className="text-red-500 font-bold bg-red-50 px-3 py-1 rounded-full animate-pulse">
              ⚠️ {err}
            </small>
          )}
        </div>
      </form>
    </div>
  );
};
export default Login;