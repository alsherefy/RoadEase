import React from 'react';
import { Users, Car, Wrench, DollarSign, TrendingUp, TrendingDown, AlertTriangle, Package, FileText, Calendar, Clock, Star, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardContent, CardTitle } from '../components/UI/Card';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { 
    customers, 
    serviceOrders, 
    inventory, 
    invoices, 
    expenses,
    settings,
    dashboardStats 
  } = useApp();

  // Calculate today's revenue
  const today = new Date().toISOString().split('T')[0];
  const todayRevenue = invoices
    .filter(invoice => invoice.createdAt.startsWith(today) && invoice.paymentStatus === 'paid')
    .reduce((sum, invoice) => sum + invoice.totalAmount, 0);

  // Calculate monthly data for chart
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthStr = date.toISOString().slice(0, 7);
    
    const revenue = invoices
      .filter(inv => inv.createdAt.startsWith(monthStr) && inv.paymentStatus === 'paid')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    
    const expense = expenses
      .filter(exp => exp.date.startsWith(monthStr))
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    return {
      month: date.toLocaleDateString('ar-SA', { month: 'short' }),
      revenue,
      expenses: expense,
      profit: revenue - expense
    };
  });

  // Top customers
  const topCustomers = customers
    .map(customer => {
      const revenue = invoices
        .filter(inv => inv.customerId === customer.id && inv.paymentStatus === 'paid')
        .reduce((sum, inv) => sum + inv.totalAmount, 0);
      return { ...customer, revenue };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Low stock items
  const lowStockItems = inventory.filter(item => item.quantity <= item.minQuantity);

  // Recent orders
  const recentOrders = serviceOrders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Service status distribution
  const serviceStatusData = [
    { name: 'مفتوح', value: serviceOrders.filter(o => o.status === 'open').length, color: '#F59E0B' },
    { name: 'تحت التنفيذ', value: serviceOrders.filter(o => o.status === 'in_progress').length, color: '#3B82F6' },
    { name: 'مكتمل', value: serviceOrders.filter(o => o.status === 'completed').length, color: '#10B981' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'مفتوح';
      case 'in_progress': return 'تحت التنفيذ';
      case 'completed': return 'مكتمل';
      default: return status;
    }
  };

  const currentTime = new Date().toLocaleTimeString('ar-SA', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  const currentDate = new Date().toLocaleDateString('ar-SA', { 
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div>
      {/* Welcome Header - First Element */}
      <div className="flex items-center justify-between bg-gradient-to-r from-orange-600 to-red-500 text-white px-6 py-4 shadow-lg rounded-lg mb-6">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <Car className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">مرحباً، {user?.name}</h1>
            <p className="text-orange-100 text-xs">نظام إدارة ورشة السيارات</p>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-4 space-x-reverse text-orange-100 text-xs">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Calendar className="h-4 w-4" />
            <span>{currentDate}</span>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Clock className="h-4 w-4" />
            <span>{currentTime}</span>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-blue-100 font-medium">إجمالي العملاء</p>
                <p className="text-3xl font-bold">{customers.length}</p>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Car className="h-4 w-4 text-blue-200" />
                  <p className="text-blue-200 text-xs">
                    {customers.reduce((sum, c) => sum + c.cars.length, 0)} سيارة مسجلة
                  </p>
                </div>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-green-500 to-green-600 border-0 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-green-100 font-medium">طلبات الصيانة</p>
                <p className="text-3xl font-bold">{serviceOrders.length}</p>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <AlertTriangle className="h-4 w-4 text-green-200" />
                  <p className="text-green-200 text-xs">
                    {serviceOrders.filter(o => o.status === 'open').length} طلب مفتوح
                  </p>
                </div>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <Wrench className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-purple-100 font-medium">إيرادات اليوم</p>
                <p className="text-3xl font-bold">
                  {todayRevenue.toLocaleString()}
                </p>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <FileText className="h-4 w-4 text-purple-200" />
                  <p className="text-purple-200 text-xs">
                    {invoices.filter(i => i.createdAt.startsWith(today)).length} فاتورة اليوم
                  </p>
                </div>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-orange-500 to-orange-600 border-0 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-orange-100 font-medium">المخزون</p>
                <p className="text-3xl font-bold">{inventory.length}</p>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <AlertTriangle className="h-4 w-4 text-orange-200" />
                  <p className="text-orange-200 text-xs">
                    {lowStockItems.length} صنف منخفض المخزون
                  </p>
                </div>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100 pb-3">
            <CardTitle className="flex items-center text-gray-800 text-base">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-2">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              الإيرادات الشهرية
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip 
                  formatter={(value) => [`${value} ريال`]}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  name="الإيرادات"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service Status Pie Chart */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-purple-50 border-b border-gray-100 pb-3">
            <CardTitle className="flex items-center text-gray-800 text-base">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-2">
                <Wrench className="h-4 w-4 text-white" />
              </div>
              حالة طلبات الصيانة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={serviceStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {serviceStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} طلب`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 space-y-1">
              {serviceStatusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-xs text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Expenses Chart */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-red-50 border-b border-gray-100 pb-3">
            <CardTitle className="flex items-center text-gray-800 text-base">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center mr-2">
                <TrendingDown className="h-4 w-4 text-white" />
              </div>
              المصروفات الشهرية
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip 
                  formatter={(value) => [`${value} ريال`]}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                  name="المصروفات"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100 pb-3">
            <CardTitle className="flex items-center text-gray-800 text-base">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-2">
                <Star className="h-4 w-4 text-white" />
              </div>
              أفضل العملاء
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {topCustomers.map((customer, index) => (
                <div key={customer.id} className="group flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="relative">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-bold text-sm group-hover:scale-105 transition-transform duration-300">
                        {index + 1}
                      </div>
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <Award className="h-2 w-2 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300 text-sm">{customer.name}</p>
                      <p className="text-xs text-gray-500">{customer.cars.length} سيارة</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 text-sm">
                      {customer.revenue.toLocaleString()} {settings.currency}
                    </p>
                  </div>
                </div>
              ))}
              {topCustomers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-medium">لا توجد بيانات عملاء متاحة</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-green-50 border-b border-gray-100 pb-3">
            <CardTitle className="flex items-center text-gray-800 text-base">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-2">
                <FileText className="h-4 w-4 text-white" />
              </div>
              الطلبات الأخيرة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {recentOrders.map((order) => {
                const customer = customers.find(c => c.id === order.customerId);
                return (
                  <div key={order.id} className="group flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-green-50 rounded-lg hover:from-green-50 hover:to-emerald-50 transition-all duration-300 hover:shadow-md">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 mb-1 group-hover:text-green-600 transition-colors duration-300 text-sm">{order.description}</p>
                      <p className="text-xs text-gray-600 mb-1">{customer?.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border transition-all duration-300 group-hover:scale-105 ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                );
              })}
              {recentOrders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-medium">لا توجد طلبات صيانة</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-red-100 to-orange-100 border-b border-red-200">
            <CardTitle className="flex items-center text-red-800">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center mr-3">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              تنبيه: مخزون منخفض ({lowStockItems.length} عنصر)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockItems.slice(0, 6).map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-red-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.partNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600 text-lg">{item.quantity}</p>
                    <p className="text-xs text-gray-500">الحد الأدنى: {item.minQuantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;