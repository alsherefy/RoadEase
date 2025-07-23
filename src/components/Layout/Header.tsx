import React from 'react';
import { LogOut, Globe } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t, dir } = useLanguage();

  return (
    <header className={`fixed top-0 ${dir === 'rtl' ? 'right-64' : 'left-64'} right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-40`}>
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {t('dashboard')}
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Globe className="h-4 w-4" />
            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className={`text-sm ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              <p className="font-medium text-gray-800">{user?.name}</p>
              <p className="text-gray-500 text-xs">
                {user?.role === 'manager' ? 'مدير' : user?.role === 'employee' ? 'موظف' : 'فني'}
              </p>
            </div>
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
            title={t('logout')}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;