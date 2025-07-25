import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Car, Eye, EyeOff, Mail, Key } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Modal from '../components/UI/Modal';

const Login: React.FC = () => {
  const [loginType, setLoginType] = useState<'email' | 'employeeId'>('email');
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmployeeId, setResetEmployeeId] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'reset'>('request');
  
  const { user, login, loginWithEmployeeId, requestPasswordReset, resetPassword, isLoading } = useAuth();
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
    
    let success = false;
    
    if (loginType === 'email') {
      success = await login(emailOrId, password);
    } else {
      success = await loginWithEmployeeId(emailOrId, password);
    }
    
    if (!success) {
      setError('بيانات الدخول غير صحيحة');
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (resetStep === 'request') {
      const success = await requestPasswordReset(resetEmployeeId, resetEmail);
      if (success) {
        setResetStep('reset');
      } else {
        alert('لم يتم العثور على موظف بهذه البيانات');
      }
    } else {
      const success = await resetPassword(resetToken, newPassword);
      if (success) {
        alert('تم تغيير كلمة المرور بنجاح');
        setIsResetModalOpen(false);
        setResetStep('request');
        setResetEmployeeId('');
        setResetEmail('');
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
            <p className="text-gray-600 mt-2 text-sm sm:text-base">{t('loginSubtitle')}</p>
            
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                {language === 'ar' ? 'English' : 'العربية'}
              </button>
            </div>
          </div>

          {/* Login Type Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 p-1 rounded-lg flex">
              <button
                type="button"
                onClick={() => setLoginType('email')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  loginType === 'email'
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                البريد الإلكتروني
              </button>
              <button
                type="button"
                onClick={() => setLoginType('employeeId')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  loginType === 'employeeId'
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                رقم الموظف
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="emailOrId" className="block text-sm font-medium text-gray-700 mb-2">
                {loginType === 'email' ? 'البريد الإلكتروني' : 'رقم الموظف'}
              </label>
              <Input
                id="emailOrId"
                type={loginType === 'email' ? 'email' : 'text'}
                value={emailOrId}
                onChange={(e) => setEmailOrId(e.target.value)}
                placeholder={loginType === 'email' ? 'أدخل اسم المستخدم' : 'أدخل رقم الموظف'}
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
                  onChange={(e) => setPassword(e.target.value)}
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

        </div>
      </div>

      {/* Password Reset Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => {
          setIsResetModalOpen(false);
          setResetStep('request');
          setResetEmployeeId('');
          setResetEmail('');
          setResetToken('');
          setNewPassword('');
        }}
        title="إعادة تعيين كلمة المرور"
      >
        {resetStep === 'request' ? (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الموظف
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  value={resetEmployeeId}
                  onChange={(e) => setResetEmployeeId(e.target.value)}
                  placeholder="EMP-001"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
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
            
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-800">
                سيتم إرسال رابط إعادة تعيين كلمة المرور إلى البريد الإلكتروني المسجل
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