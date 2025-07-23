import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize default users if not exist
  useEffect(() => {
    const users = localStorage.getItem('roadease_users');
    if (!users) {
      const defaultUsers = [
        {
          id: '1',
          name: 'مدير النظام',
          email: 'admin@roadease.com',
          password: 'admin123',
          role: 'manager' as const,
          createdAt: new Date(),
        },
        {
          id: '2',
          name: 'موظف الاستقبال',
          email: 'employee@roadease.com',
          password: 'emp123',
          role: 'employee' as const,
          createdAt: new Date(),
        },
        {
          id: '3',
          name: 'فني الصيانة',
          email: 'tech@roadease.com',
          password: 'tech123',
          role: 'technician' as const,
          createdAt: new Date(),
        }
      ];
      localStorage.setItem('roadease_users', JSON.stringify(defaultUsers));
    }

    // Check if user is already logged in
    const savedUser = localStorage.getItem('roadease_current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = JSON.parse(localStorage.getItem('roadease_users') || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('roadease_current_user', JSON.stringify(userWithoutPassword));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('roadease_current_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};