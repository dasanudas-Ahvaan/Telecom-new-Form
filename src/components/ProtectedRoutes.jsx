import { Navigate } from "react-router-dom";
import { useAuth } from "../authContext/AuthContext";
const ProtectedRoute = ({ children, redirectTo }) => {
  const { token, user } = useAuth();

  const isAuthenticated = Boolean(token);
  const isPermitted = user?.role === "admin" || user?.role === "super_user";
  if (!isAuthenticated) {
    return <Navigate to={"/"} replace />;
  } else if (!isPermitted) {
    return <Navigate to={"/noAccess"} />;
  }
  return children;
};

export default ProtectedRoute;
