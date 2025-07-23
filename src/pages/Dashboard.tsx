import React from 'react';
import { Users, Car, Wrench, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import { Card, CardHeader, CardContent, CardTitle } from '../components/UI/Card';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { dashboardStats } = useApp();

  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const chartData = dashboardStats.monthlyRevenue.map((revenue, index) => ({
    month: monthNames[index],
    revenue: revenue,
  }));

  const statCards = [
    {
      title: t('totalCustomers'),
      value: dashboardStats.totalCustomers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: t('totalCars'),
      value: dashboardStats.totalCars,
      icon: Car,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: t('openOrders'),
      value: dashboardStats.openOrders,
      icon: Wrench,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: t('todayRevenue'),
      value: `${dashboardStats.todayRevenue.toLocaleString()} ريال`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">مرحباً بك في ROAD EASE</h1>
        <p className="text-gray-600 mt-2">إدارة شاملة لورشة السيارات</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-lg lg:text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-full`}>
                    <Icon className={`h-4 w-4 lg:h-6 lg:w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-orange-500" />
              {t('monthlyRevenue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} ريال`, 'الإيرادات']} />
                <Bar dataKey="revenue" fill="#F97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-orange-500" />
              {t('topCustomers')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardStats.topCustomers.slice(0, 5).map((customer, index) => (
                <div key={index} className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 lg:w-8 lg:h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-xs lg:text-sm">
                        {customer.name.charAt(0)}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900 text-sm lg:text-base">{customer.name}</span>
                  </div>
                  <span className="font-bold text-green-600 text-sm lg:text-base">
                    {customer.amount.toLocaleString()} ريال
                  </span>
                </div>
              ))}
              {dashboardStats.topCustomers.length === 0 && (
                <p className="text-gray-500 text-center py-4">لا توجد بيانات متاحة</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              {t('lowStock')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardStats.lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 lg:p-3 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <p className="font-medium text-gray-900 text-sm lg:text-base">{item.name}</p>
                    <p className="text-xs lg:text-sm text-gray-600">{item.partNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600 text-sm lg:text-base">{item.quantity}</p>
                    <p className="text-xs text-gray-500">الحد الأدنى: {item.minQuantity}</p>
                  </div>
                </div>
              ))}
              {dashboardStats.lowStockItems.length === 0 && (
                <p className="text-green-600 text-center py-4">جميع العناصر متوفرة بكميات كافية</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wrench className="h-5 w-5 mr-2 text-orange-500" />
              {t('recentOrders')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardStats.recentOrders.map((order) => (
                <div key={order.id} className="p-2 lg:p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 text-sm lg:text-base">{order.description}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {order.status === 'open' ? 'مفتوح' : 
                       order.status === 'in_progress' ? 'تحت التنفيذ' : 'مكتمل'}
                    </span>
                  </div>
                  <p className="text-xs lg:text-sm text-gray-600 mt-1">
                    الفني: {order.assignedTechnician || 'غير محدد'}
                  </p>
                </div>
              ))}
              {dashboardStats.recentOrders.length === 0 && (
                <p className="text-gray-500 text-center py-4">لا توجد طلبات حديثة</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;