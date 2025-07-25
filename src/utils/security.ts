// Security utilities for ROAD EASE system
import { User } from '../types';

// Simple hash function for password hashing (production should use bcrypt)
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'roadease_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Verify password against hash
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === hash;
};

// Generate secure session token
export const generateSessionToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Password strength validation
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
  score: number;
} => {
  const errors: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    errors.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
  } else {
    score += 20;
  }

  // Uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('يجب أن تحتوي على حرف كبير واحد على الأقل');
  } else {
    score += 20;
  }

  // Lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('يجب أن تحتوي على حرف صغير واحد على الأقل');
  } else {
    score += 20;
  }

  // Number
  if (!/\d/.test(password)) {
    errors.push('يجب أن تحتوي على رقم واحد على الأقل');
  } else {
    score += 20;
  }

  // Special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('يجب أن تحتوي على رمز خاص واحد على الأقل (!@#$%^&*)');
  } else {
    score += 20;
  }

  return {
    isValid: errors.length === 0,
    errors,
    score
  };
};

// Sanitize user input
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Generate secure employee ID
export const generateEmployeeId = (existingIds: string[]): string => {
  let attempts = 0;
  let id: string;
  
  do {
    const randomNum = Math.floor(Math.random() * 9999) + 1;
    id = `EMP-${randomNum.toString().padStart(4, '0')}`;
    attempts++;
  } while (existingIds.includes(id) && attempts < 100);
  
  return id;
};

// Check if session is expired
export const isSessionExpired = (loginTime: string, maxAgeHours: number = 8): boolean => {
  const loginDate = new Date(loginTime);
  const now = new Date();
  const diffInHours = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);
  return diffInHours > maxAgeHours;
};

// Log security events
export interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'data_access' | 'permission_denied';
  userId?: string;
  username?: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
}

export const logSecurityEvent = (event: Omit<SecurityEvent, 'id' | 'timestamp'>): void => {
  const securityEvent: SecurityEvent = {
    ...event,
    id: generateSessionToken().substring(0, 16),
    timestamp: new Date(),
    ipAddress: 'unknown', // In a real app, get from request
    userAgent: navigator.userAgent
  };

  const existingLogs = JSON.parse(localStorage.getItem('roadease_security_logs') || '[]');
  existingLogs.push(securityEvent);
  
  // Keep only last 1000 events
  if (existingLogs.length > 1000) {
    existingLogs.splice(0, existingLogs.length - 1000);
  }
  
  localStorage.setItem('roadease_security_logs', JSON.stringify(existingLogs));
};

// Get security logs
export const getSecurityLogs = (): SecurityEvent[] => {
  return JSON.parse(localStorage.getItem('roadease_security_logs') || '[]');
};

// Rate limiting for login attempts
export const checkRateLimit = (identifier: string, maxAttempts: number = 5, windowMinutes: number = 15): {
  allowed: boolean;
  remainingAttempts: number;
  resetTime?: Date;
} => {
  const key = `rate_limit_${identifier}`;
  const stored = localStorage.getItem(key);
  const now = new Date();
  
  if (!stored) {
    localStorage.setItem(key, JSON.stringify({
      attempts: 1,
      firstAttempt: now.toISOString()
    }));
    return { allowed: true, remainingAttempts: maxAttempts - 1 };
  }
  
  const data = JSON.parse(stored);
  const firstAttempt = new Date(data.firstAttempt);
  const timeDiff = (now.getTime() - firstAttempt.getTime()) / (1000 * 60);
  
  // Reset if window has passed
  if (timeDiff > windowMinutes) {
    localStorage.setItem(key, JSON.stringify({
      attempts: 1,
      firstAttempt: now.toISOString()
    }));
    return { allowed: true, remainingAttempts: maxAttempts - 1 };
  }
  
  // Check if exceeded
  if (data.attempts >= maxAttempts) {
    const resetTime = new Date(firstAttempt.getTime() + (windowMinutes * 60 * 1000));
    return { allowed: false, remainingAttempts: 0, resetTime };
  }
  
  // Increment attempts
  data.attempts++;
  localStorage.setItem(key, JSON.stringify(data));
  
  return { allowed: true, remainingAttempts: maxAttempts - data.attempts };
};

// Clear rate limit for successful login
export const clearRateLimit = (identifier: string): void => {
  localStorage.removeItem(`rate_limit_${identifier}`);
};

// Encrypt sensitive data
export const encryptData = async (data: string, key: string): Promise<string> => {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key.padEnd(32, '0').substring(0, 32));
  const dataArray = encoder.encode(data);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    dataArray
  );
  
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined));
};

// Decrypt sensitive data
export const decryptData = async (encryptedData: string, key: string): Promise<string> => {
  try {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const keyData = encoder.encode(key.padEnd(32, '0').substring(0, 32));
    
    const combined = new Uint8Array(atob(encryptedData).split('').map(char => char.charCodeAt(0)));
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encrypted
    );
    
    return decoder.decode(decrypted);
  } catch (error) {
    throw new Error('فشل في فك التشفير');
  }
};