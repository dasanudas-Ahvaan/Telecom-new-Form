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
      if (err) {
        setErr("");
      }
      setIsLoading(!true);
      const { token, data } = response;
      saveToken(token);
      saveUser(data);
    } catch (error) {
      setFormData(initialFormData);
      setErr(error.message);
      setIsLoading(!true);
      console.error("Login failed:", error.message);
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  }, [token]);

  return (
    <div className="flex items-center justify-center h-screen capitalize bg-black">
      <form
        onSubmit={handleLogin}
        className="flex items-center justify-center flex-col gap-4 text-gray-500"
      >
        {/* <div className="flex">
          <label htmlFor="role">Select Role: </label>
          <select
            name="role"
            className="outline-none"
            onChange={handleChange}
            value={formData.role}
            required
          >
            <option value={""}>--Select</option>
            {options.map((opt, id) => {
              return (
                <option key={id} value={opt}>
                  {opt}
                </option>
              );
            })}
          </select>
        </div> */}
        <div className="flex flex-col">
          <label htmlFor="email">email: </label>
          <input
            value={formData.email}
            className="border rounded-md p-1 bg-gray-400"
            placeholder="Email"
            type="text"
            name="email"
            required
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="password">password: </label>
          <input
            value={formData.password}
            className="border rounded-md p-1 bg-gray-400"
            placeholder="Password"
            type="password"
            name="password"
            required
            onChange={handleChange}
          />
        </div>
        <button className="border rounded-md p-1">
          {isLoading ? <Loader /> : "Login"}
        </button>
        <div className="h-5">
          {err && (
            <small
              className={`transition-all duration-300 ${
                err ? "opacity-100" : "opacity-0"
              } text-red-500 font-medium`}
            >
              {err}
            </small>
          )}
        </div>
      </form>
    </div>
  );
};

export default Login;
