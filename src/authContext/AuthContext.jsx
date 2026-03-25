import { createContext, useState, useContext, useEffect } from "react";
import api from "../api/axiosConfig";
import Loader from "../components/Loader";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // On App Load: Check if we are already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/auth/me"); // A route that validates the cookie
        setUser(response.data.data);
      } catch (err) {
        setUser(null);
      } finally {
        setIsInitialized(true);
      }
    };
    checkAuth();
  }, []);

  const login = (userData) => setUser(userData);
  const logout = async () => {
    try {
      // 1. Tell the server to clear cookies
      await api.post("/auth/logout");
    } catch (error) {
      console.error(
        "Logout failed on server, but clearing local state anyway",
        error,
      );
    } finally {
      // 2. Clear local React state
      setUser(null);
      // 3. Optional: Redirect to login
      window.location.href = "/admin";
    }
  };

  if (!isInitialized) return <Loader />;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
