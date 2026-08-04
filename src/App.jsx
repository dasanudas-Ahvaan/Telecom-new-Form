import "./App.css";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MemberForm from "./pages/Register";
import Layout from "./components/Layout";
import CustomFields from "./components/CustomField";
import { ProtectedRoute, SuperUserRoute } from "./components/ProtectedRoutes";
import NoAccess from "./pages/NoAccess";
import AdminManagement from "./pages/AdminManagement";
import YuSanskar from "./pages/YuSanskar";

function App() {
  return (
    <div className="">
      <Layout>
        <Routes>
          <Route
            path="/"
            element={<ProtectedRoute children={<Dashboard />} />}
          />
          <Route path="/admin" element={<Login />} />
          <Route path="/register" element={<MemberForm />} />
          <Route path="/yusanskar" element={<YuSanskar />} />
          <Route path="/noAccess" element={<NoAccess />} />
          <Route
            path="/admin_management"
            element={<SuperUserRoute children={<AdminManagement />} />}
          />
          <Route
            path="/dashboard"
            element={<ProtectedRoute children={<Dashboard />} />}
          />
          <Route
            path="/dashboard/field"
            element={<ProtectedRoute children={<CustomFields />} />}
          />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;
