import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext/AuthContext";

const routes = [
  { name: "Home", link: "/" },
  { name: "Dashboard", link: "/dashboard" },
  { name: "Contact", link: "/contact" },
  { name: "Register", link: "/register" },
  { name: "Login", link: "/admin" },
  { name: "Logout", link: "/logout" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, token } = useAuth();

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <h1 className="text-xl font-bold text-amber-400">MyBrand</h1>

          {/* Desktop Links */}
          <ul className="hidden md:flex gap-8 text-gray-700 font-medium">
            {routes
              .filter((f) => (token ? f.name !== "Login" : f.name !== "Logout"))
              .map((route, index) => (
                <li
                  key={index}
                  onClick={() => {
                    if (route.name === "Logout") {
                      logout();
                      navigate("/admin");
                      return;
                    }
                    navigate(route.link);
                    setOpen(false);
                  }}
                  className="hover:text-blue-600 cursor-pointer"
                >
                  {route.name}
                </li>
              ))}
          </ul>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden flex flex-col gap-1"
          >
            <span className="w-6 h-0.5 bg-gray-300"></span>
            <span className="w-6 h-0.5 bg-gray-300"></span>
            <span className="w-6 h-0.5 bg-gray-300"></span>
          </button>
        </div>
      </nav>

      {/* Sidebar for Mobile */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button onClick={() => setOpen(false)} className="text-2xl">
            &times;
          </button>
        </div>

        <ul className="p-4 flex flex-col gap-4 text-gray-700 font-medium">
          {routes
            .filter((f) => (token ? f.name !== "Login" : f.name !== "Logout"))
            .map((route, index) => (
              <li
                key={index}
                onClick={() => {
                  if (route.name === "Logout") {
                    logout();
                    navigate("/admin");
                    return;
                  }
                  navigate(route.link);
                  setOpen(false);
                }}
                className="hover:text-blue-600 cursor-pointer"
              >
                {route.name}
              </li>
            ))}
        </ul>
      </div>
    </>
  );
}
