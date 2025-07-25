import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Car, User, Lock, Mail, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { validatePasswordStrength } from '../utils/security';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';

const Setup: React.FC = () => {
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<{ isValid: boolean; errors: string[]; score: number }>({ 
    isValid: true, 
    errors: [], 
    score: 0 
  });
  
  const { user, setupInitialAdmin } = useAuth();

  // If admin already exists, redirect to login
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check if admin already exists
  const existingUsers = JSON.parse(localStorage.getItem('roadease_users') || '[]');
  if (existingUsers.length > 0) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (adminForm.password !== adminForm.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }
    
    if (!passwordValidation.isValid) {
      setError('كلمة المرور لا تلبي متطلبات الأمان');
      return;
    }
    
    if (!adminForm.name || !adminForm.username || !adminForm.password) {
      setError('جميع الحقول مطلوبة');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await setupInitialAdmin({
        name: adminForm.name,
        email: adminForm.email,
        username: adminForm.username,
        password: adminForm.password
      });
      
      if (success) {
        // Redirect will happen automatically when user state updates
      } else {
        setError('حدث خطأ في إنشاء الحساب');
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (password: string) => {
    setAdminForm({ ...adminForm, password });
    
    if (password.length > 0) {
      const validation = validatePasswordStrength(password);
      setPasswordValidation(validation);
    } else {
      setPasswordValidation({ isValid: true, errors: [], score: 0 });
    }
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score < 40) return 'bg-red-500';
    if (score < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (score: number) => {
    if (score < 40) return 'ضعيف';
    if (score < 70) return 'متوسط';
    return 'قوي';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Car className="h-12 w-12 text-orange-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">ROAD EASE</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">إعداد المدير الأساسي</p>
            <p className="text-gray-500 mt-1 text-xs sm:text-sm">قم بإنشاء حساب المدير الأول للنظام</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                الاسم الكامل
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  placeholder="أدخل الاسم الكامل"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني (اختياري)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  placeholder="admin@example.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                اسم المستخدم
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  value={adminForm.username}
                  onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                  placeholder="admin"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={adminForm.password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="أدخل كلمة مرور قوية"
                  className="pl-10"
                  required
                />
              </div>
              
              {/* Password strength indicator */}
              {adminForm.password.length > 0 && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">قوة كلمة المرور:</span>
                    <span className={`text-xs font-bold ${
                      passwordValidation.score < 40 ? 'text-red-600' :
                      passwordValidation.score < 70 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {getPasswordStrengthText(passwordValidation.score)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordValidation.score)}`}
                      style={{ width: `${passwordValidation.score}%` }}
                    />
                  </div>
                  {passwordValidation.errors.length > 0 && (
                    <div className="space-y-1">
                      {passwordValidation.errors.map((error, index) => (
                        <div key={index} className="flex items-center text-xs text-red-600">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {error}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={adminForm.confirmPassword}
                  onChange={(e) => setAdminForm({ ...adminForm, confirmPassword: e.target.value })}
                  placeholder="أعد إدخال كلمة المرور"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'جاري الإنشاء...' : 'إنشاء حساب المدير'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">ملاحظات مهمة:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• ستحصل على جميع الصلاحيات الإدارية</li>
              <li>• يمكنك إضافة موظفين وتحديد صلاحياتهم</li>
              <li>• تأكد من حفظ بيانات الدخول في مكان آمن</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setup;