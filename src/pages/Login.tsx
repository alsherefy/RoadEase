import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Car, Eye, EyeOff, Mail, Key, Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { validatePasswordStrength } from '../utils/security';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Modal from '../components/UI/Modal';

const Login: React.FC = () => {
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetUsername, setResetUsername] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetPhone, setResetPhone] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'reset'>('request');
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; errors: string[] }>({ score: 0, errors: [] });
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [resetContactType, setResetContactType] = useState<'email' | 'phone'>('email');
  
  const { user, login, requestPasswordReset, resetPassword, isLoading } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  // Check if initial setup is needed
  const existingUsers = JSON.parse(localStorage.getItem('roadease_users') || '[]');
  if (existingUsers.length === 0) {
    return <Navigate to="/setup" replace />;
  }

  if (user && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!emailOrId.trim() || !password.trim()) {
      setError('جميع الحقول مطلوبة');
      return;
    }
    
    const success = await login(emailOrId, password);
    
    if (!success) {
      setError('بيانات الدخول غير صحيحة');
    }
  };

  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword);
    if (newPassword.length > 0) {
      const strength = validatePasswordStrength(newPassword);
      setPasswordStrength({ score: strength.score, errors: strength.errors });
    } else {
      setPasswordStrength({ score: 0, errors: [] });
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

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (resetStep === 'request') {
      const contactInfo = resetContactType === 'email' ? resetEmail : resetPhone;
      const success = await requestPasswordReset(resetUsername, contactInfo, resetContactType);
      if (success) {
        setResetStep('reset');
      } else {
        alert('لم يتم العثور على مستخدم بهذه البيانات');
      }
    } else {
      const success = await resetPassword(resetToken, newPassword);
      if (success) {
        alert('تم تغيير كلمة المرور بنجاح');
        setIsResetModalOpen(false);
        setResetStep('request');
        setResetUsername('');
        setResetEmail('');
        setResetPhone('');
        setResetToken('');
        setNewPassword('');
      } else {
        alert('رمز التحقق غير صحيح أو منتهي الصلاحية');
      }
    }
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
            
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                {language === 'ar' ? 'English' : 'العربية'}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                اسم المستخدم
              </label>
              <Input
                id="username"
                type="text"
                value={emailOrId}
                onChange={(e) => setEmailOrId(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('password')}
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onFocus={() => setShowPasswordRequirements(true)}
                  onBlur={() => setShowPasswordRequirements(false)}
                  placeholder="أدخل كلمة المرور"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Password strength indicator for new passwords */}
              {password.length > 0 && showPasswordRequirements && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">قوة كلمة المرور:</span>
                    <span className={`text-xs font-bold ${
                      passwordStrength.score < 40 ? 'text-red-600' :
                      passwordStrength.score < 70 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {getPasswordStrengthText(passwordStrength.score)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`}
                      style={{ width: `${passwordStrength.score}%` }}
                    />
                  </div>
                  {passwordStrength.errors.length > 0 && (
                    <div className="mt-2">
                      {passwordStrength.errors.map((error, index) => (
                        <div key={index} className="flex items-center text-xs text-red-600 mt-1">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {error}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
              {isLoading ? t('loading') : t('login')}
            </Button>
          </form>

          {/* Password Reset Link */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsResetModalOpen(true)}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              نسيت كلمة المرور؟
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center mb-2">
              <Shield className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-900">أمان محسن</span>
            </div>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• تشفير كلمات المرور</li>
              <li>• جلسات آمنة مع انتهاء صلاحية</li>
              <li>• حماية من محاولات الدخول المتكررة</li>
              <li>• سجل أمني لجميع العمليات</li>
            </ul>
          </div>

        </div>
      </div>

      {/* Password Reset Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => {
          setIsResetModalOpen(false);
          setResetStep('request');
          setResetUsername('');
          setResetEmail('');
          setResetPhone('');
          setResetToken('');
          setNewPassword('');
        }}
        title="إعادة تعيين كلمة المرور"
      >
        {resetStep === 'request' ? (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المستخدم
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  value={resetUsername}
                  onChange={(e) => setResetUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع جهة الاتصال
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="email"
                    checked={resetContactType === 'email'}
                    onChange={(e) => setResetContactType(e.target.value as 'email' | 'phone')}
                    className="mr-2"
                  />
                  البريد الإلكتروني
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="phone"
                    checked={resetContactType === 'phone'}
                    onChange={(e) => setResetContactType(e.target.value as 'email' | 'phone')}
                    className="mr-2"
                  />
                  رقم الجوال
                </label>
              </div>
            </div>
            
            {resetContactType === 'email' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني المسجل
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="employee@example.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الجوال المسجل
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="tel"
                  value={resetPhone}
                  onChange={(e) => setResetPhone(e.target.value)}
                  placeholder="05xxxxxxxx"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            )}
            
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-800">
                سيتم إرسال رابط إعادة تعيين كلمة المرور إلى {resetContactType === 'email' ? 'البريد الإلكتروني' : 'رقم الجوال'} المسجل
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsResetModalOpen(false)}
              >
                إلغاء
              </Button>
              <Button type="submit">
                إرسال رابط الإعادة
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رمز التحقق
              </label>
              <Input
                type="text"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="أدخل رمز التحقق المرسل إليك"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور الجديدة
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="أدخل كلمة المرور الجديدة"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setResetStep('request')}
              >
                رجوع
              </Button>
              <Button type="submit">
                تغيير كلمة المرور
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Login;