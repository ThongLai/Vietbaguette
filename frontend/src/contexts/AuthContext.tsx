import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

export type UserRole = 'ADMIN' | 'EMPLOYEE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  availableTime?: {
    unavailableDays: string[];
    unavailableTimeRanges: {
      day: string;
      start: string;
      end: string;
    }[];
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from token on mount
  useEffect(() => {
    const loadUserFromToken = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('viet_baguette_token');
        
        if (!token) {
          setIsLoading(false);
          return;
        }
        
        // Fetch user profile with the token
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to get user profile');
        }
        
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
        // Clear invalid token
        localStorage.removeItem('viet_baguette_token');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserFromToken();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Make a real API call to login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const data = await response.json();
      
      // Store the JWT token
      localStorage.setItem('viet_baguette_token', data.token);
      
      // Set the user data
      setUser(data.user);
      
      toast.success(`Welcome back, ${data.user.name}!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear auth token
    localStorage.removeItem('viet_baguette_token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
