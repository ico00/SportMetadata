import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { FaLock, FaEye, FaTimes } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa6";

interface AdminLoginProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminLogin({ isOpen, onClose }: AdminLoginProps) {
  const { login, isLocalhost, isAuthenticated } = useAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Close modal if authenticated
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isOpen, onClose]);

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  // On localhost, show info message
  if (isLocalhost) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
        <div className="relative bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-md w-full mx-4 shadow-2xl animate-slide-up">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors"
          >
            <FaTimes className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 text-green-400 mb-4">
            <FaLock className="h-5 w-5" />
            <span className="font-semibold">Localhost Mode</span>
          </div>
          <p className="text-sm text-gray-300">
            You are running on localhost. Admin access is automatically enabled.
          </p>
          <button
            onClick={onClose}
            className="mt-4 w-full rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-green-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const success = await login(password);
    
    if (success) {
      setPassword("");
      onClose();
    } else {
      setError("Incorrect password");
    }
    
    setIsLoading(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" 
      onClick={onClose}
    >
      <div 
        className="relative bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-md w-full mx-4 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <FaTimes className="h-5 w-5" />
        </button>
        
        <div className="mb-4 flex items-center gap-2">
          <FaLock className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-100">Admin Login</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-3 text-sm text-red-400">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 pr-10 text-gray-100 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                placeholder="Enter admin password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
              >
                {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
