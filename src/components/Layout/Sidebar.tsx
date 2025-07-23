import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
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
  Menu, 
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const Sidebar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { language, t } = useLanguage();

  const menuItems = [
    { 
      path: '/dashboard', 
      icon: Home, 
      label: t('dashboard'),
      permission: 'dashboard'
    },
    { 
      path: '/customers', 
      icon: Users, 
      label: t('customers'),
      permission: 'customers'
    },
    { 
      path: '/service-orders', 
      icon: Wrench, 
      label: t('serviceOrders'),
      permission: 'service_orders'
    },
    { 
      path: '/inventory', 
      icon: Package, 
      label: t('inventory'),
      permission: 'inventory'
    },
    { 
      path: '/invoices', 
      icon: FileText, 
      label: t('invoices'),
      permission: 'invoices'
    },
    { 
      path: '/expenses', 
      icon: DollarSign, 
      label: t('expenses'),
      permission: 'expenses'
    },
    { 
      path: '/reports', 
      icon: BarChart3, 
      label: t('reports'),
      permission: 'reports'
    },
    { 
      path: '/employees', 
      icon: UserCheck, 
      label: t('employees'),
      permission: 'employees',
      adminOnly: true
    },
    { 
      path: '/payroll', 
      icon: Wallet, 
      label: t('payroll'),
      permission: 'payroll'
    },
    { 
      path: '/forecast', 
      icon: TrendingUp, 
      label: t('forecast'),
      permission: 'forecast'
    },
    { 
      path: '/settings', 
      icon: Settings, 
      label: t('settings'),
      permission: 'settings'
    }
  ];

  const hasPermission = (permission: string) => {
    if (!user?.permissions) return false;
    return user.permissions.includes(permission);
  };

  const filteredMenuItems = menuItems.filter(item => {
    // Hide employees section for non-admin users
    if (item.adminOnly && user?.role !== 'admin') {
      return false;
    }
    return hasPermission(item.permission);
  });

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-orange-600 text-white rounded-lg shadow-lg hover:bg-orange-700 transition-colors"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-gray-900 to-gray-800 
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        shadow-2xl border-r border-gray-700
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-orange-600 to-orange-500 shadow-lg">
            <div className="flex items-center space-x-2">
              <Wrench className="h-8 w-8 text-white" />
              <span className="text-xl font-bold text-white">ROAD EASE</span>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-700 bg-gray-800/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">{user?.name}</p>
                <p className="text-gray-400 text-xs">
                  {user?.role === 'admin' ? t('admin') : t('employee')}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={`
                    group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg transform scale-105' 
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white hover:transform hover:scale-105'
                    }
                  `}
                >
                  <Icon className={`
                    mr-3 h-5 w-5 transition-colors duration-200
                    ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}
                  `} />
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-700 bg-gray-800/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-red-600/20 hover:text-red-400 transition-all duration-200 group"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-400 transition-colors duration-200" />
              <span>{t('logout')}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;