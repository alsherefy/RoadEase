import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  LayoutDashboard,
  Users,
  Wrench,
  Package,
  FileText,
  DollarSign,
  BarChart3,
  UserCheck,
  Wallet,
  TrendingUp,
  Settings,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { language, translations } = useLanguage();
  const location = useLocation();

  const menuItems = [
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: translations.dashboard,
      permission: 'dashboard'
    },
    {
      path: '/customers',
      icon: Users,
      label: translations.customers,
      permission: 'customers'
    },
    {
      path: '/service-orders',
      icon: Wrench,
      label: translations.serviceOrders,
      permission: 'serviceOrders'
    },
    {
      path: '/inventory',
      icon: Package,
      label: translations.inventory,
      permission: 'inventory'
    },
    {
      path: '/invoices',
      icon: FileText,
      label: translations.invoices,
      permission: 'invoices'
    },
    {
      path: '/expenses',
      icon: DollarSign,
      label: translations.expenses,
      permission: 'expenses'
    },
    {
      path: '/reports',
      icon: BarChart3,
      label: translations.reports,
      permission: 'reports'
    },
    {
      path: '/employees',
      icon: UserCheck,
      label: translations.employees,
      permission: 'employees'
    },
    {
      path: '/payroll',
      icon: Wallet,
      label: translations.payroll,
      permission: 'payroll'
    },
    {
      path: '/forecast',
      icon: TrendingUp,
      label: translations.forecast,
      permission: 'forecast'
    },
    {
      path: '/settings',
      icon: Settings,
      label: translations.settings,
      permission: 'settings'
    }
  ];

  const hasPermission = (permission: string) => {
    if (user?.role === 'admin') return true;
    return user?.permissions?.[permission] || false;
  };

  const filteredMenuItems = menuItems.filter(item => hasPermission(item.permission));

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 ${language === 'ar' ? 'right-0' : 'left-0'} h-full w-64 bg-white shadow-lg z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : language === 'ar' ? 'translate-x-full' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">ROAD EASE</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-2">
          <ul className="space-y-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={`
                      flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-orange-100 text-orange-700 border-r-2 border-orange-600' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }
                      ${language === 'ar' ? 'flex-row-reverse text-right' : ''}
                    `}
                  >
                    <Icon className={`w-5 h-5 ${language === 'ar' ? 'ml-3' : 'mr-3'}`} />
                    {item.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role === 'admin' ? translations.admin : translations.employee}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;