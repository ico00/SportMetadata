import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLocalhost: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if running on localhost
  const checkLocalhost = () => {
    const isLocal = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname.startsWith('192.168.') ||
                    window.location.hostname.startsWith('10.') ||
                    window.location.hostname.startsWith('172.');
    setIsLocalhost(isLocal);
    return isLocal;
  };

  // Check authentication status on mount
  useEffect(() => {
    const initAuth = async () => {
      const isLocal = checkLocalhost();
      
      // On localhost, automatically authenticate
      if (isLocal) {
        console.log('🔓 Localhost detected: Auto-authenticating');
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      // On production, check if token exists
      const token = localStorage.getItem('adminToken');
      if (token) {
        try {
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          if (data.valid) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('adminToken');
          }
        } catch (error) {
          console.error('Error verifying token:', error);
          localStorage.removeItem('adminToken');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      
      if (data.success && data.token) {
        localStorage.setItem('adminToken', data.token);
        setIsAuthenticated(true);
        console.log('✅ Login successful');
        return true;
      } else {
        console.error('❌ Login failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    console.log('👋 Logged out');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLocalhost, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
