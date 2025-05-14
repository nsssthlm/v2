import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

// Define types locally instead of importing from types
interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile_pic?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Initial auth state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null,
};

// Create context
interface AuthContextProps {
  authState: AuthState;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialState);

  // Listen for logout events (from token refresh failure)
  useEffect(() => {
    const handleLogout = () => {
      logout();
    };
    
    window.addEventListener('auth:logout', handleLogout);
    
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  // Check if user is already logged in when component mounts
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          setAuthState({
            ...initialState,
            loading: false,
          });
          return;
        }

        // Token exists, attempt to validate by getting user info
        const response = await api.get('/me/');
        
        setAuthState({
          isAuthenticated: true,
          user: response.data as User,
          token,
          loading: false,
          error: null,
        });
      } catch (error) {
        // Token invalid or other error
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setAuthState({
          ...initialState,
          loading: false,
        });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<void> => {
    try {
      setAuthState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      // Get token
      const tokenResponse = await api.post('/login/', { username, password });
      const { access, refresh, user } = tokenResponse.data;
      
      // Store tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      setAuthState({
        isAuthenticated: true,
        user: user as User,
        token: access,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: error.response?.data?.detail || 'Invalid credentials or server error',
      }));
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        // Call backend logout endpoint to blacklist token
        await api.post('/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens and reset state regardless of API call success
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      });
    }
  };

  // Clear any error messages
  const clearError = (): void => {
    setAuthState((prev) => ({
      ...prev,
      error: null,
    }));
  };

  // Context provider
  return (
    <AuthContext.Provider value={{ authState, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
