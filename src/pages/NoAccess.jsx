import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, HomeIcon, LockIcon, ShieldIcon } from "../components/icons";

export default function NoAccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        {/* Main Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-3xl p-8 md:p-12 shadow-2xl text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-linear-to-br from-orange-500/20 to-red-600/20 rounded-full mb-6 ring-1 ring-orange-500/30">
            <div className="text-orange-500">
              <LockIcon />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Access Denied
          </h1>

          {/* Subtitle */}
          <p className="text-gray-400 text-lg mb-2">
            You don't have permission to view this page
          </p>

          {/* Description */}
          <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
            This area is restricted to authorized personnel only. If you believe
            you should have access, please contact your administrator.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-white bg-gray-700 hover:bg-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <ArrowLeftIcon />
              <span>Go Back</span>
            </button>

            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-white bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 shadow-lg shadow-orange-900/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 active:scale-[0.98]"
            >
              <HomeIcon />
              <span>Go Home</span>
            </button>
          </div>

          {/* Error Code */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-gray-600 text-xs font-mono">
              ERROR 403 • FORBIDDEN • {new Date().getFullYear()}
            </p>
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="mt-6 bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 text-center">
          <h3 className="text-white font-medium mb-2">Need Access?</h3>
          <p className="text-gray-500 text-sm mb-4">
            Contact your system administrator to request access to this resource.
          </p>
        
        </div>
      </div>
    </div>
  );
}