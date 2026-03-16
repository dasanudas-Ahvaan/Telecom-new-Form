import { Navigate } from "react-router-dom";
import { useAuth } from "../authContext/AuthContext";
export const ProtectedRoute = ({ children, redirectTo }) => {
  const { token, user } = useAuth();

  const isAuthenticated = Boolean(token);
  const isPermitted = user?.role === "admin";
  const isSuperUser = user?.role === "super_user";
  if (!isAuthenticated) {
    return <Navigate to={"/admin"} replace />;
  } else if (!isPermitted && !isSuperUser) {
    return <Navigate to={"/noAccess"} />;
  }
  return children;
};

export const SuperUserRoute = ({ children, redirectTo }) => {
  const { token, user } = useAuth();

  const isAuthenticated = Boolean(token);
  const isSuperUser = user?.role === "super_user";
  if (!isAuthenticated) {
    return <Navigate to={"/admin"} replace />;
  } else if (!isSuperUser) {
    return <Navigate to={"/noAccess"} />;
  }
  return children;
};
