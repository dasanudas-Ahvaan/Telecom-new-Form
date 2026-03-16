
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../authContext/AuthContext";

const routes = [
  { name: "Home", link: "/" },
  // { name: "Dashboard", link: "/dashboard" },
  { name: "Contact", link: "/contact" },
  { name: "Register", link: "/register" },
  { name: "Login", link: "/admin" },
  { name: "Logout", link: "/logout" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, token } = useAuth();

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleNavClick = (route) => {
    if (route.name === "Logout") {
      logout();
    } else {
      navigate(route.link);
    }
    setOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
        />
      )}

      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${
          scrolled
            ? "bg-gray-900/90 backdrop-blur-md border-gray-800 shadow-lg py-3"
            : "bg-gray-900/50 border-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <img
              className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-110"
              src="/alw.svg"
              alt="Logo"
            />
            <span className="text-xl font-bold bg-linear-to-r from-orange-400 to-red-500 bg-clip-text text-transparent hidden sm:block">
              Ahvaan
            </span>
          </div>

          {/* Desktop Links */}
          <ul className="hidden md:flex items-center gap-8">
            {routes
              .filter((f) => (token ? f.name !== "Login" : f.name !== "Logout"))
              .map((route) => {
                const isActive = location.pathname === route.link;
                return (
                  <li key={route.name}>
                    <button
                      onClick={() => handleNavClick(route)}
                      className={`text-sm font-medium transition-all duration-200 relative py-1 ${
                        isActive
                          ? "text-orange-500"
                          : "text-gray-300 hover:text-white"
                      }`}
                    >
                      {route.name}
                     
                      <span
                        className={`absolute bottom-0 left-0 h-0.5 bg-linear-to-r from-orange-500 to-red-500 transition-all duration-300 ${
                          isActive ? "w-full" : "w-0 hover:w-full"
                        }`}
                      ></span>
                    </button>
                  </li>
                );
              })}
          </ul>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden flex flex-col gap-1.5 p-2 text-gray-300 hover:text-white transition-colors"
            aria-label="Open Menu"
          >
            <span
              className={`w-6 h-0.5 bg-current transition-all duration-300 ${
                open ? "rotate-45 translate-y-2" : ""
              }`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-current transition-all duration-300 ${
                open ? "opacity-0" : ""
              }`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-current transition-all duration-300 ${
                open ? "-rotate-45 -translate-y-2" : ""
              }`}
            ></span>
          </button>
        </div>
      </nav>

      {/* Sidebar for Mobile */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-gray-900 border-r border-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-2">
            <img className="w-8 h-8" src="/alw.svg" alt="Logo" />
            <h2 className="text-lg font-bold bg-linear-to-r from-orange-600 to-red-500 text-transparent bg-clip-text">Ahvaan</h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <ul className="p-4 flex flex-col gap-2">
          {routes
            .filter((f) => (token ? f.name !== "Login" : f.name !== "Logout"))
            .map((route) => {
              const isActive = location.pathname === route.link;
              return (
                <li key={route.name}>
                  <button
                    onClick={() => handleNavClick(route)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    {route.name}
                  </button>
                </li>
              );
            })}
        </ul>
        
        {/* Mobile Footer Info */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800 bg-gray-900">
          <p className="text-xs text-center text-gray-500">
            &copy; {new Date().getFullYear()} Ahvaan
          </p>
        </div>
      </div>
    </>
  );
}