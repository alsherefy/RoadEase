import React from 'react';
import { LogOut, Globe, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t, dir } = useLanguage();

  return (
    <header className={`fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-40 ${
      dir === 'rtl' ? 'lg:right-0 lg:left-64' : 'lg:left-64 lg:right-0'
    }`}>
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <h2 className="text-lg font-semibold text-gray-800">
            {t('dashboard')}
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="hidden sm:flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Globe className="h-4 w-4" />
            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className={`text-sm ${dir === 'rtl' ? 'text-right' : 'text-left'} hidden sm:block`}>
              <p className="font-medium text-gray-800">{user?.name}</p>
              <p className="text-gray-500 text-xs">
                {user?.role === 'admin' ? 'مدير' : 'موظف'}
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
            className="flex items-center space-x-2 px-2 sm:px-3 py-2 text-sm text-gray-600 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
            title={t('logout')}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;