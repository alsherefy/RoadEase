import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Wrench, 
  Package, 
  FileText, 
  DollarSign, 
  BarChart3, 
  UserCog, 
  Settings,
  Car,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { t, dir } = useLanguage();
  const { user } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: t('dashboard'), permission: null },
    { path: '/customers', icon: Users, label: t('customers'), permission: 'customers' },
    { path: '/service-orders', icon: Wrench, label: t('serviceOrders'), permission: 'serviceOrders' },
    { path: '/inventory', icon: Package, label: t('inventory'), permission: 'inventory' },
    { path: '/invoices', icon: FileText, label: t('invoices'), permission: 'invoices' },
    { path: '/expenses', icon: DollarSign, label: t('expenses'), permission: 'expenses' },
    { path: '/reports', icon: BarChart3, label: t('reports'), permission: 'reports' },
    { path: '/payroll', icon: Wallet, label: 'الرواتب', permission: 'payroll' },
    { path: '/forecast', icon: TrendingUp, label: 'التوقعات المالية', permission: 'financialReports' },
    { path: '/employees', icon: UserCog, label: t('employees'), permission: 'employees' },
    { path: '/settings', icon: Settings, label: t('settings'), permission: 'settings' },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.permission) return true; // Dashboard is always accessible
    return user?.permissions?.[item.permission as keyof typeof user.permissions] || false;
  });

  return (
    <div className={`fixed top-0 ${dir === 'rtl' ? 'right-0' : 'left-0'} h-full w-64 bg-gray-900 text-white shadow-lg z-50`}>
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <Car className="h-8 w-8 text-orange-500" />
          <h1 className="text-xl font-bold text-orange-500">ROAD EASE</h1>
        </div>
      </div>
      
      <nav className="mt-6">
        <div className="space-y-1 px-3">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
                    isActive
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <Icon className={`h-5 w-5 ${dir === 'rtl' ? 'ml-3' : 'mr-3'}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;