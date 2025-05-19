import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { loginUser as loginUserAPI, isAuthenticated, logoutUser as logoutUserAPI, getCurrentUser } from '../utils/authUtils';

interface AuthContextType {
  isLoggedIn: boolean;
  user: { username: string; role: string } | null;
  login: (username: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  refreshSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);

  // Synkronisera autentiseringstillstånd vid start och vid ändringar i localStorage
  const refreshSession = () => {
    const loggedIn = isAuthenticated();
    setIsLoggedIn(loggedIn);
    
    if (loggedIn) {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      
      // Säkerställ att autentiseringsinformation är synkroniserad mellan localStorage och sessionStorage
      const authToken = localStorage.getItem('jwt_token') || 
                       localStorage.getItem('auth_token') || 
                       localStorage.getItem('token');
      
      if (authToken) {
        sessionStorage.setItem('current_token', authToken);
      }
      
      const localUserInfo = localStorage.getItem('currentUser');
      if (localUserInfo) {
        sessionStorage.setItem('currentUser', localUserInfo);
      }
      
      const sessionUserInfo = sessionStorage.getItem('currentUser');
      if (sessionUserInfo && !localUserInfo) {
        localStorage.setItem('currentUser', sessionUserInfo);
      }
    } else {
      setUser(null);
    }
  };

  // Lyssna på ändringar i localStorage och sessionStorage för att synkronisera autentiseringstillstånd
  useEffect(() => {
    refreshSession();

    // Lyssna på ändringar i localStorage och sessionStorage
    const handleStorageChange = () => {
      refreshSession();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Inloggningsfunktion
  const login = (username: string, password: string) => {
    const result = loginUserAPI(username, password);
    if (result.success) {
      refreshSession();
    }
    return result;
  };

  // Utloggningsfunktion
  const logout = () => {
    logoutUserAPI();
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        login,
        logout,
        refreshSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Användardefinierad hook för att använda AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth måste användas inom en AuthProvider');
  }
  return context;
};