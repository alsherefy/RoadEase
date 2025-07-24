import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  LayoutDashboard,
  Users,
  Wrench,
  Package,
  FileText,
  Receipt,
  BarChart3,
  UserCheck,
  DollarSign,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navigationItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم', key: 'dashboard' },
    { path: '/customers', icon: Users, label: 'العملاء', key: 'customers' },
    { path: '/service-orders', icon: Wrench, label: 'أوامر الخدمة', key: 'serviceOrders' },
    { path: '/inventory', icon: Package, label: 'المخزون', key: 'inventory' },
    { path: '/invoices', icon: FileText, label: 'الفواتير', key: 'invoices' },
    { path: '/expenses', icon: Receipt, label: 'المصروفات', key: 'expenses', permission: 'expenses' },
    { path: '/reports', icon: BarChart3, label: 'التقارير', key: 'reports', permission: 'reports' },
    { path: '/employees', icon: UserCheck, label: 'الموظفين', key: 'employees', permission: 'employees' },
    { path: '/payroll', icon: DollarSign, label: 'الرواتب', key: 'payroll', permission: 'payroll' },
    { path: '/forecast', icon: TrendingUp, label: 'التوقعات', key: 'forecast', permission: 'financialReports' },
    { path: '/settings', icon: Settings, label: 'الإعدادات', key: 'settings', permission: 'settings' },
  ];

  const filteredItems = navigationItems.filter(item => 
    {
      // إذا لم تكن هناك صلاحية مطلوبة، فالعنصر متاح للجميع
      if (!item.permission) {
        return true;
      }
      
      // إذا كان المستخدم مدير، فله الوصول لكل شيء
      if (user?.role === 'admin') {
        return true;
      }
      
      // إذا كان موظف، فحص الصلاحيات
      return user?.permissions?.[item.permission as keyof typeof user.permissions] === true;
    }
  );

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">ROAD EASE</h1>
              <p className="text-xs text-gray-300 hidden lg:block">إدارة الورشة</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4 space-x-reverse">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.key}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 ml-2" />
                  <span className="hidden xl:inline">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
          
          {/* User Info & Actions */}
          <div className="hidden lg:flex items-center space-x-4 space-x-reverse">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="hidden xl:block">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-gray-300">
                  {user?.role === 'admin' ? 'مدير' : 'موظف'}
                </p>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-all duration-200"
            >
              <LogOut className="w-4 h-4 ml-2" />
              <span className="hidden xl:inline">خروج</span>
            </button>
          </div>
          
          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="text-gray-300 hover:text-white p-2"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.key}
                    to={item.path}
                    onClick={() => {
                      setShowMobileMenu(false);
                      onClose();
                    }}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 ml-2" />
                    {item.label}
                  </NavLink>
                );
              })}
              
              {/* Mobile User Actions */}
              <div className="border-t border-gray-700 pt-3 mt-3">
                <div className="flex items-center px-3 py-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center ml-3">
                    <span className="text-xs font-bold text-white">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user?.name}</p>
                    <p className="text-xs text-gray-300">
                      {user?.role === 'admin' ? 'مدير' : 'موظف'}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={logout}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-all duration-200"
                >
                  <LogOut className="w-4 h-4 ml-2" />
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Sidebar;