import { useContext, useEffect, useState } from "react";
import Loader from "../components/Loader";
import { useAuth } from "../authContext/AuthContext";
import { useNavigate } from "react-router-dom";
import { login } from "../api/Auth";

// Simple SVG Icons to avoid extra dependencies
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);

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
    // Clear error when user starts typing
    if (err) setErr("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErr(""); // Clear previous errors

    try {
      const response = await login(formData);
      setFormData(initialFormData);
      
      const { token, data } = response;
      saveToken(token);
      saveUser(data);
      // Navigation is handled by useEffect watching token
    } catch (error) {
      setErr(error.message || "Login failed. Please try again.");
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md p-8 m-4">
        <form
          onSubmit={handleLogin}
          className="backdrop-blur-lg bg-gray-800/40 border border-gray-700 rounded-2xl shadow-2xl p-8 flex flex-col gap-6 relative z-10"
        >
          {/* Header */}
          <div className="text-center mb-2">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Welcome Back
            </h2>
            <p className="text-gray-400 text-sm mt-2">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-300 ml-1">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MailIcon />
              </div>
              <input
                id="email"
                value={formData.email}
                className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                placeholder="name@example.com"
                type="email"
                name="email"
                required
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-300 ml-1">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockIcon />
              </div>
              <input
                id="password"
                value={formData.password}
                className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                placeholder="••••••••"
                type="password"
                name="password"
                required
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Forgot Password Link */}
          {/* <div className="flex justify-end">
            <a href="#" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              Forgot Password?
            </a>
          </div> */}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 
              ${isLoading 
                ? "bg-gray-700 cursor-not-allowed" 
                : "bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 hover:shadow-red-500/25 active:scale-[0.98]"
              }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader />
                <span>Signing in...</span>
              </div>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Error Message */}
          <div className={`min-h-6 flex items-center justify-center transition-all duration-300 ${err ? "opacity-100" : "opacity-0"}`}>
            {err && (
              <p className="text-red-400 text-sm font-medium bg-red-900/20 px-3 py-1 rounded-md border border-red-900/50">
                {err}
              </p>
            )}
          </div>

          {/* Footer */}
          {/* <div className="text-center mt-2">
            <p className="text-gray-400 text-sm">
              Don't have an account?{" "}
              <a href="#" className="text-white font-medium hover:underline">
                Sign up
              </a>
            </p>
          </div> */}
        </form>
      </div>
      
      {/* Custom Animation Styles for the blobs */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default Login;