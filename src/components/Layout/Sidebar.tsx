import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useLanguage } from './contexts/LanguageContext';
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
  LogOut
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { t, isRTL } = useLanguage();

  const navigationItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم', key: 'dashboard' },
    { path: '/customers', icon: Users, label: 'العملاء', key: 'customers' },
    { path: '/service-orders', icon: Wrench, label: 'أوامر الخدمة', key: 'serviceOrders' },
    { path: '/inventory', icon: Package, label: 'المخزون', key: 'inventory' },
    { path: '/invoices', icon: FileText, label: 'الفواتير', key: 'invoices' },
    { path: '/expenses', icon: Receipt, label: 'المصروفات', key: 'expenses', adminOnly: true },
    { path: '/reports', icon: BarChart3, label: 'التقارير', key: 'reports', adminOnly: true },
    { path: '/employees', icon: UserCheck, label: 'الموظفين', key: 'employees', adminOnly: true },
    { path: '/payroll', icon: DollarSign, label: 'الرواتب', key: 'payroll', adminOnly: true },
    { path: '/forecast', icon: TrendingUp, label: 'التوقعات', key: 'forecast', adminOnly: true },
    { path: '/settings', icon: Settings, label: 'الإعدادات', key: 'settings', adminOnly: true },
  ];

  const filteredItems = navigationItems.filter(item => 
    !item.adminOnly || user?.role === 'admin'
  );

  return (
    <div className="h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="p-6">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">ورشة السيارات</h1>
            <p className="text-sm text-gray-300">نظام إدارة متكامل</p>
          </div>
        </div>
      </div>

      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.key}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 ml-3" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-gray-300">
                {user?.role === 'admin' ? 'مدير' : 'موظف'}
              </p>
            </div>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-all duration-200"
        >
          <LogOut className="w-5 h-5 ml-3" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
};

export default Sidebar;