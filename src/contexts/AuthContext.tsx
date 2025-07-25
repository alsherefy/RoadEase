import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserPermissions, SessionData } from '../types';
import { 
  hashPassword, 
  verifyPassword, 
  generateSessionToken, 
  validatePasswordStrength,
  sanitizeInput,
  isSessionExpired,
  logSecurityEvent,
  checkRateLimit,
  clearRateLimit,
  generateEmployeeId
} from '../utils/security';

interface AuthContextType {
  user: User | null;
  setupInitialAdmin: (adminData: { name: string; email: string; username: string; password: string }) => Promise<boolean>;
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
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

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

  // Check for existing users on mount
  useEffect(() => {
    const users = localStorage.getItem('roadease_users');
    
    if (users) {
      const existingUsers = JSON.parse(users);
      let updated = false;
      
      existingUsers.forEach((user: any) => {
        if (user.email === 'admin' || user.employeeId === 'ADMIN') {
          if (user.role !== 'admin') {
            user.role = 'admin';
            updated = true;
          }
          // Always ensure admin has full permissions
          const adminPermissions = getDefaultPermissions('admin');
          if (!user.permissions || JSON.stringify(user.permissions) !== JSON.stringify(adminPermissions)) {
            user.permissions = adminPermissions;
            updated = true;
          }
        }
      });
      
      if (updated) {
        localStorage.setItem('roadease_users', JSON.stringify(existingUsers));
      }
    }

    // Check if user is already logged in
    const savedUser = localStorage.getItem('roadease_current_user');
    const savedSession = localStorage.getItem('roadease_session');
    
    if (savedUser && savedSession) {
      const currentUser = JSON.parse(savedUser);
      const session = JSON.parse(savedSession);
      
      // Check if session is expired
      if (isSessionExpired(session.loginTime, 8)) {
        logSecurityEvent({
          type: 'logout',
          userId: currentUser.id,
          username: currentUser.email,
          details: 'Session expired'
        });
        logout();
        setIsLoading(false);
        return;
      }
      
      // Always re-verify user data from storage to ensure it's up to date
      if (currentUser.email === 'admin' || currentUser.employeeId === 'ADMIN') {
        const allUsers = JSON.parse(localStorage.getItem('roadease_users') || '[]');
        const adminUser = allUsers.find((u: any) => u.email === 'admin' || u.employeeId === 'ADMIN');
        
        if (adminUser) {
          const { password: _, ...adminWithoutPassword } = adminUser;
          setUser(adminWithoutPassword);
          setSessionData(session);
          localStorage.setItem('roadease_current_user', JSON.stringify(adminWithoutPassword));
        } else {
          setUser(currentUser);
          setSessionData(session);
        }
      } else {
        // Re-verify employee data as well
        const allUsers = JSON.parse(localStorage.getItem('roadease_users') || '[]');
        const foundUser = allUsers.find((u: any) => u.id === currentUser.id);
        
        if (foundUser) {
          const { password: _, ...userWithoutPassword } = foundUser;
          setUser(userWithoutPassword);
          setSessionData(session);
          localStorage.setItem('roadease_current_user', JSON.stringify(userWithoutPassword));
        } else {
          setUser(currentUser);
          setSessionData(session);
        }
      }
    }
    setIsLoading(false);
  }, []);

  const setupInitialAdmin = async (adminData: { name: string; email: string; username: string; password: string }): Promise<boolean> => {
    setIsLoading(true);
    
    // Validate password strength
    const passwordValidation = validatePasswordStrength(adminData.password);
    if (!passwordValidation.isValid) {
      alert('كلمة المرور ضعيفة: ' + passwordValidation.errors.join(', '));
      setIsLoading(false);
      return false;
    }
    
    // Check if any users already exist
    const existingUsers = JSON.parse(localStorage.getItem('roadease_users') || '[]');
    if (existingUsers.length > 0) {
      setIsLoading(false);
      return false;
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const hashedPassword = await hashPassword(adminData.password);
      
      const newAdmin: User = {
        id: '1',
        employeeId: 'ADMIN-001',
        name: sanitizeInput(adminData.name),
        email: sanitizeInput(adminData.username), // Use username as email for login
        role: 'admin',
        phone: '',
        permissions: getDefaultPermissions('admin'),
        createdAt: new Date(),
      };
      
      // Create session
      const sessionToken = generateSessionToken();
      const sessionData: SessionData = {
        userId: newAdmin.id,
        token: sessionToken,
        loginTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() // 8 hours
      };
      
      // Save admin with password
      const adminWithPassword = { ...newAdmin, password: hashedPassword };
      localStorage.setItem('roadease_users', JSON.stringify([adminWithPassword]));
      
      // Set current user (without password)
      setUser(newAdmin);
      setSessionData(sessionData);
      localStorage.setItem('roadease_current_user', JSON.stringify(newAdmin));
      localStorage.setItem('roadease_session', JSON.stringify(sessionData));
      
      // Log security event
      logSecurityEvent({
        type: 'login',
        userId: newAdmin.id,
        username: newAdmin.email,
        details: 'Initial admin setup'
      });
      
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Check rate limiting
    const rateLimit = checkRateLimit(username, 5, 15);
    if (!rateLimit.allowed) {
      const resetTime = rateLimit.resetTime?.toLocaleTimeString('ar-SA') || 'قريباً';
      alert(`تم تجاوز عدد محاولات تسجيل الدخول. حاول مرة أخرى في: ${resetTime}`);
      setIsLoading(false);
      return false;
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const sanitizedUsername = sanitizeInput(username);
    const users = JSON.parse(localStorage.getItem('roadease_users') || '[]');
    const foundUser = users.find((u: any) => u.username === sanitizedUsername);
    
    if (foundUser && await verifyPassword(password, foundUser.password)) {
      // Clear rate limit on successful login
      clearRateLimit(username);
      
      // Create session
      const sessionToken = generateSessionToken();
      const sessionData: SessionData = {
        userId: foundUser.id,
        token: sessionToken,
        loginTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() // 8 hours
      };
      
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      setSessionData(sessionData);
      localStorage.setItem('roadease_current_user', JSON.stringify(userWithoutPassword));
      localStorage.setItem('roadease_session', JSON.stringify(sessionData));
      
      // Log security event
      logSecurityEvent({
        type: 'login',
        userId: foundUser.id,
        username: foundUser.username,
        details: 'Successful login'
      });
      
      setIsLoading(false);
      return true;
    } else {
      // Log failed login attempt
      logSecurityEvent({
        type: 'failed_login',
        username: sanitizedUsername,
        details: `Failed login attempt. Remaining attempts: ${rateLimit.remainingAttempts - 1}`
      });
    }
    
    setIsLoading(false);
    return false;
  };

  const requestPasswordReset = async (username: string, contact: string, contactType: 'email' | 'phone'): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('roadease_users') || '[]');
    const foundUser = users.find((u: any) => {
      if (contactType === 'email') {
        return u.username === username && u.email === contact;
      } else {
        return u.username === username && u.phone === contact;
      }
    });
    
    if (foundUser) {
      // In a real app, this would send an email
      const resetToken = Math.random().toString(36).substr(2, 15);
      const resetRequests = JSON.parse(localStorage.getItem('roadease_reset_requests') || '[]');
      
      resetRequests.push({
        username,
        contact,
        contactType,
        token: resetToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        used: false
      });
      
      localStorage.setItem('roadease_reset_requests', JSON.stringify(resetRequests));
      
      // Simulate email sent
      alert(`تم إرسال رمز إعادة تعيين كلمة المرور إلى ${contact}\nرمز التحقق: ${resetToken}`);
      return true;
    }
    
    return false;
  };

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    const resetRequests = JSON.parse(localStorage.getItem('roadease_reset_requests') || '[]');
    const request = resetRequests.find((r: any) => r.token === token && !r.used && new Date(r.expiresAt) > new Date());
    
    if (request) {
      const users = JSON.parse(localStorage.getItem('roadease_users') || '[]');
      const userIndex = users.findIndex((u: any) => u.username === request.username);
      
      if (userIndex !== -1) {
        users[userIndex].password = await hashPassword(newPassword);
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
    // Log security event
    if (user) {
      logSecurityEvent({
        type: 'logout',
        userId: user.id,
        username: user.username || user.email,
        details: 'User logout'
      });
    }
    
    setUser(null);
    setSessionData(null);
    localStorage.removeItem('roadease_current_user');
    localStorage.removeItem('roadease_session');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setupInitialAdmin,
      login,
      logout, 
      requestPasswordReset, 
      resetPassword, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};