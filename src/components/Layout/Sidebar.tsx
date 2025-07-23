import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
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
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: Home, key: 'dashboard' },
    { path: '/customers', icon: Users, key: 'customers' },
    { path: '/service-orders', icon: Wrench, key: 'serviceOrders' },
    { path: '/inventory', icon: Package, key: 'inventory' },
    { path: '/invoices', icon: FileText, key: 'invoices' },
    { path: '/expenses', icon: DollarSign, key: 'expenses', adminOnly: true },
    { path: '/reports', icon: BarChart3, key: 'reports', adminOnly: true },
    { path: '/employees', icon: UserCheck, key: 'employees' },
    { path: '/payroll', icon: Wallet, key: 'payroll', adminOnly: true },
    { path: '/forecast', icon: TrendingUp, key: 'forecast', adminOnly: true },
    { path: '/settings', icon: Settings, key: 'settings', adminOnly: true },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (item.adminOnly && user?.role !== 'admin') {
      return false;
    }
    return true;
  });

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
            <div>
              <h2 className="text-lg font-bold text-gray-800">ROAD EASE</h2>
              <p className="text-xs text-gray-500">
                {user?.role === 'admin' ? t('admin') : t('employee')}
              </p>
            </div>
          </div>
          
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center space-x-3 px-3 py-2 rounded-lg mb-1 transition-colors
                  ${isActive 
                    ? 'bg-orange-100 text-orange-700 border-r-2 border-orange-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{t(item.key)}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;