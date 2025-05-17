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

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Restaurant Admin',
    email: 'admin@vietbaguette.co.uk',
    role: 'ADMIN',
    avatar: '/placeholder.svg',
  },
  {
    id: '2',
    name: 'Employee Nguyen',
    email: 'employee@vietbaguette.co.uk',
    role: 'EMPLOYEE',
    avatar: '/placeholder.svg',
    availableTime: {
      unavailableDays: ['2025-05-20', '2025-05-21'],
      unavailableTimeRanges: [
        { day: 'monday', start: '18:00', end: '22:00' },
        { day: 'sunday', start: '00:00', end: '23:59' },
      ],
    },
  },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if there's a stored user in localStorage
    const storedUser = localStorage.getItem('viet_baguette_user');
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user', e);
        localStorage.removeItem('viet_baguette_user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user with matching email
      const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }
      
      // In a real app, you would validate the password here
      if (password !== 'password') {
        throw new Error('Invalid email or password');
      }
      
      // Store user in localStorage
      localStorage.setItem('viet_baguette_user', JSON.stringify(foundUser));
      setUser(foundUser);
      
      toast.success(`Welcome back, ${foundUser.name}!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('viet_baguette_user');
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
