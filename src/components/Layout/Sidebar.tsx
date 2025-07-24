import React from 'react';
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
  LogOut
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();

  const navigationItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم', key: 'dashboard' },
    { path: '/customers', icon: Users, label: 'العملاء', key: 'customers' },
    { path: '/service-orders', icon: Wrench, label: 'أوامر الخدمة', key: 'serviceOrders' },
    { path: '/inventory', icon: Package, label: 'المخزون', key: 'inventory' },
    { path: '/invoices', icon: FileText, label: 'الفواتير', key: 'invoices' },
    { path: '/expenses', icon: Receipt, label: 'المصروفات', key: 'expenses', adminOnly: true },
    { path: '/reports', icon: BarChart3, label: 'التقارير', key: 'reports', adminOnly: true },
    { path: '/employees', icon: UserCheck, label: 'الموظفين', key: 'employees', adminOnly: true },
    { path: '/payroll', icon: DollarSign, label: 'الرواتب', key: 'payroll', permission: 'payroll' },
    { path: '/forecast', icon: TrendingUp, label: 'التوقعات', key: 'forecast', permission: 'financialReports' },
    { path: '/settings', icon: Settings, label: 'الإعدادات', key: 'settings', permission: 'settings' },
  ];

  const filteredItems = navigationItems.filter(item => 
    !item.permission || user?.permissions?.[item.permission as keyof typeof user.permissions]
  );

  return (
    <aside className={`fixed inset-y-0 right-0 z-50 w-56 bg-gradient-to-b from-gray-900 to-gray-800 text-white transform transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    } lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="p-4">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">ROAD EASE</h1>
            <p className="text-xs text-gray-300">إدارة الورشة</p>
          </div>
        </div>
      </div>

      <nav className="mt-6">
        <div className="px-3 space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.key}
                to={item.path}
                onClick={() => onClose()}
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
        </div>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="bg-gray-700 rounded-lg p-3 mb-3">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-7 h-7 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-300">
                {user?.role === 'admin' ? 'مدير' : 'موظف'}
              </p>
            </div>
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
    </aside>
  );
};

export default Sidebar;