import React from 'react';
import { TrendingUp, Users, Wrench, Package, DollarSign, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import Card from '../components/UI/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { dashboardStats, settings } = useApp();

  // Sample data - in a real app, this would come from your data source
  const stats = [
    {
      title: 'إجمالي العملاء',
      value: dashboardStats?.totalCustomers || '0',
      icon: Users,
      bgColor: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      title: 'طلبات الخدمة',
      value: dashboardStats?.totalOrders || '0',
      icon: Wrench,
      bgColor: 'bg-gradient-to-r from-green-500 to-green-600'
    },
    {
      title: 'الإيرادات الشهرية',
      value: `${dashboardStats?.monthlyRevenue || '0'} ريال`,
      icon: DollarSign,
      bgColor: 'bg-gradient-to-r from-orange-500 to-orange-600'
    },
    {
      title: 'عناصر المخزون',
      value: dashboardStats?.inventoryItems || '0',
      icon: Package,
      bgColor: 'bg-gradient-to-r from-purple-500 to-purple-600'
    }
  ];

  const monthlyRevenue = [
    { month: 'يناير', revenue: 12000 },
    { month: 'فبراير', revenue: 15000 },
    { month: 'مارس', revenue: 18000 },
    { month: 'أبريل', revenue: 22000 },
    { month: 'مايو', revenue: 25000 },
    { month: 'يونيو', revenue: 28000 }
  ];

  const recentOrders = [
    {
      id: '1',
      customerName: 'أحمد محمد',
      service: 'تغيير زيت المحرك',
      status: 'مكتمل'
    },
    {
      id: '2',
      customerName: 'سارة أحمد',
      service: 'فحص الفرامل',
      status: 'قيد التنفيذ'
    },
    {
      id: '3',
      customerName: 'محمد علي',
      service: 'تبديل الإطارات',
      status: 'جديد'
    }
  ];

  const lowStockItems = [
    {
      id: '1',
      name: 'زيت المحرك 5W-30',
      quantity: 5,
      minQuantity: 10
    },
    {
      id: '2',
      name: 'فلتر الهواء',
      quantity: 3,
      minQuantity: 8
    }
  ];

  const employeePerformance = [
    {
      name: 'أحمد الميكانيكي',
      completedOrders: 25,
      rating: 4.8
    },
    {
      name: 'محمد الفني',
      completedOrders: 20,
      rating: 4.6
    },
    {
      name: 'علي المساعد',
      completedOrders: 15,
      rating: 4.4
    }
  ];

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="text-center lg:text-right">
        <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
          لوحة التحكم
        </h1>
        <p className="text-gray-600 text-sm lg:text-base">إدارة شاملة لورشة السيارات</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-300 border-r-4 border-orange-500 bg-gradient-to-br from-white to-gray-50">
            <div className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-full shadow-lg transform hover:scale-110 transition-transform duration-200`}>
                  <stat.icon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-orange-50">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">الإيرادات الشهرية</h2>
            </div>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="revenue" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F97316" />
                    <stop offset="100%" stopColor="#EA580C" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-blue-50">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <Wrench className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">طلبات الخدمة الحديثة</h2>
            </div>
          </div>
          <div className="p-6">
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50 hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{order.customerName}</p>
                        <p className="text-sm text-gray-600 mt-2 flex items-center">
                          <Wrench className="h-3 w-3 mr-1" />
                          {order.service}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                        order.status === 'مكتمل' ? 'bg-green-100 text-green-800' :
                        order.status === 'قيد التنفيذ' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">لا توجد طلبات حديثة</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-red-50">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-pink-50">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">حالة المخزون</h2>
            </div>
          </div>
          <div className="p-6">
            {lowStockItems.length > 0 ? (
              <div className="space-y-3">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-gradient-to-r from-red-50 to-orange-50 hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-1">الحد الأدنى: {item.minQuantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600 text-base bg-white px-3 py-1 rounded-full shadow-sm">{item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-green-300 mx-auto mb-2" />
                <p className="text-green-600 font-medium">جميع العناصر متوفرة بكميات كافية</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-green-50">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">أداء الموظفين</h2>
            </div>
          </div>
          <div className="p-6">
            {employeePerformance.length > 0 ? (
              <div className="space-y-3">
                {employeePerformance.map((employee, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-lg hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-sm">{employee.name.charAt(0)}</span>
                      </div>
                      <div className="mr-3">
                        <p className="font-medium text-gray-900">{employee.name}</p>
                        <p className="text-xs text-gray-500">{employee.completedOrders} طلب مكتمل</p>
                      </div>
                    </div>
                    <span className="font-bold text-green-600 text-base bg-green-50 px-3 py-1 rounded-full shadow-sm">
                      {employee.rating}/5
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">لا توجد بيانات متاحة</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;