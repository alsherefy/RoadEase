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
  Car
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { t, dir } = useLanguage();
  const { user } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: t('dashboard'), roles: ['manager', 'employee', 'technician'] },
    { path: '/customers', icon: Users, label: t('customers'), roles: ['manager', 'employee'] },
    { path: '/service-orders', icon: Wrench, label: t('serviceOrders'), roles: ['manager', 'employee', 'technician'] },
    { path: '/inventory', icon: Package, label: t('inventory'), roles: ['manager', 'employee'] },
    { path: '/invoices', icon: FileText, label: t('invoices'), roles: ['manager', 'employee'] },
    { path: '/expenses', icon: DollarSign, label: t('expenses'), roles: ['manager'] },
    { path: '/reports', icon: BarChart3, label: t('reports'), roles: ['manager'] },
    { path: '/employees', icon: UserCog, label: t('employees'), roles: ['manager'] },
    { path: '/settings', icon: Settings, label: t('settings'), roles: ['manager'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || 'employee')
  );

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