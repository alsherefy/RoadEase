import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserPermissions } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithEmployeeId: (employeeId: string, password: string) => Promise<boolean>;
  logout: () => void;
  requestPasswordReset: (employeeId: string, email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
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

  const getDefaultPermissions = (role: 'admin' | 'employee'): UserPermissions => {
    if (role === 'admin') {
      return {
        customers: true,
        serviceOrders: true,
        inventory: true,
        invoices: true,
        expenses: true,
        reports: true,
        employees: true,
        settings: true,
        financialReports: true,
        profitAnalysis: true,
        payroll: true,
        workshopRent: true,
      };
    } else {
      return {
        customers: true,
        serviceOrders: true,
        inventory: true,
        invoices: true,
        expenses: false,
        reports: false,
        employees: false,
        settings: false,
        financialReports: false,
        profitAnalysis: false,
        payroll: false,
        workshopRent: false,
      };
    }
  };

  // Initialize default users if not exist
  useEffect(() => {
    const users = localStorage.getItem('roadease_users');
    if (!users) {
      const defaultUsers = [
        {
          id: '1',
          employeeId: 'ADM-001',
          name: 'مدير النظام',
          email: 'admin@roadease.com',
          password: 'admin123',
          role: 'admin' as const,
          permissions: getDefaultPermissions('admin'),
          createdAt: new Date(),
        },
        {
          id: '2',
          employeeId: 'EMP-001',
          name: 'موظف الاستقبال',
          email: 'employee@roadease.com',
          password: 'emp123',
          role: 'employee' as const,
          permissions: getDefaultPermissions('employee'),
          createdAt: new Date(),
        },
        {
          id: '3',
          employeeId: 'TECH-001',
          name: 'فني الصيانة',
          email: 'tech@roadease.com',
          password: 'tech123',
          role: 'employee' as const,
          permissions: {
            customers: false,
            serviceOrders: true,
            inventory: false,
            invoices: false,
            expenses: false,
            reports: false,
            employees: false,
            settings: false,
            financialReports: false,
            profitAnalysis: false,
            payroll: false,
            workshopRent: false,
          },
          createdAt: new Date(),
        }
      ];
      // Always reset admin user to ensure correct permissions
      localStorage.setItem('roadease_users', JSON.stringify(defaultUsers));
      console.log('Default users created:', defaultUsers);
    } else {
      // Ensure admin user has correct role and permissions
      const existingUsers = JSON.parse(users);
      let updated = false;
      
      existingUsers.forEach((user: any) => {
        if (user.email === 'admin@roadease.com' || user.employeeId === 'ADM-001') {
          if (user.role !== 'admin') {
            user.role = 'admin';
            updated = true;
          }
          if (!user.permissions || typeof user.permissions !== 'object') {
            user.permissions = getDefaultPermissions('admin');
            updated = true;
          }
        }
      });
      
      if (updated) {
        localStorage.setItem('roadease_users', JSON.stringify(existingUsers));
        console.log('Admin user permissions updated');
      }
    }

    // Check if user is already logged in
    const savedUser = localStorage.getItem('roadease_current_user');
    if (savedUser) {
      const currentUser = JSON.parse(savedUser);
      
      // Re-verify admin user from storage
      if (currentUser.email === 'admin@roadease.com' || currentUser.employeeId === 'ADM-001') {
        const allUsers = JSON.parse(localStorage.getItem('roadease_users') || '[]');
        const adminUser = allUsers.find((u: any) => u.email === 'admin@roadease.com' || u.employeeId === 'ADM-001');
        
        if (adminUser) {
          const { password: _, ...adminWithoutPassword } = adminUser;
          setUser(adminWithoutPassword);
          localStorage.setItem('roadease_current_user', JSON.stringify(adminWithoutPassword));
        } else {
          setUser(currentUser);
        }
      } else {
        setUser(currentUser);
      }
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

  const loginWithEmployeeId = async (employeeId: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = JSON.parse(localStorage.getItem('roadease_users') || '[]');
    const foundUser = users.find((u: any) => u.employeeId === employeeId && u.password === password);
    
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

  const requestPasswordReset = async (employeeId: string, email: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('roadease_users') || '[]');
    const foundUser = users.find((u: any) => u.employeeId === employeeId && u.email === email);
    
    if (foundUser) {
      // In a real app, this would send an email
      const resetToken = Math.random().toString(36).substr(2, 15);
      const resetRequests = JSON.parse(localStorage.getItem('roadease_reset_requests') || '[]');
      
      resetRequests.push({
        employeeId,
        email,
        token: resetToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        used: false
      });
      
      localStorage.setItem('roadease_reset_requests', JSON.stringify(resetRequests));
      
      // Simulate email sent
      alert(`تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email}\nرمز التحقق: ${resetToken}`);
      return true;
    }
    
    return false;
  };

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    const resetRequests = JSON.parse(localStorage.getItem('roadease_reset_requests') || '[]');
    const request = resetRequests.find((r: any) => r.token === token && !r.used && new Date(r.expiresAt) > new Date());
    
    if (request) {
      const users = JSON.parse(localStorage.getItem('roadease_users') || '[]');
      const userIndex = users.findIndex((u: any) => u.employeeId === request.employeeId);
      
      if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('roadease_users', JSON.stringify(users));
        
        // Mark token as used
        request.used = true;
        localStorage.setItem('roadease_reset_requests', JSON.stringify(resetRequests));
        
        return true;
      }
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('roadease_current_user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      loginWithEmployeeId, 
      logout, 
      requestPasswordReset, 
      resetPassword, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};