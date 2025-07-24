import React from 'react';
import { Users, Car, Wrench, DollarSign, TrendingUp, AlertTriangle, Package, FileText, Calendar, Clock, Star, Award } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Compact Welcome Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-orange-600 to-red-500 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <Car className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">مرحباً، {user?.name}</h1>
            <p className="text-orange-100 text-sm">نظام إدارة ورشة السيارات</p>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-4 space-x-reverse text-orange-100 text-sm">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-blue-100 font-medium">إجمالي العملاء</p>
                <p className="text-4xl font-bold">{customers.length}</p>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Car className="h-4 w-4 text-blue-200" />
                  <p className="text-blue-200 text-sm">
                    {customers.reduce((sum, c) => sum + c.cars.length, 0)} سيارة مسجلة
                  </p>
                </div>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-green-500 to-green-600 border-0 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-green-100 font-medium">طلبات الصيانة</p>
                <p className="text-4xl font-bold">{serviceOrders.length}</p>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <AlertTriangle className="h-4 w-4 text-green-200" />
                  <p className="text-green-200 text-sm">
                    {serviceOrders.filter(o => o.status === 'open').length} طلب مفتوح
                  </p>
                </div>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <Wrench className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-purple-100 font-medium">إيرادات اليوم</p>
                <p className="text-4xl font-bold">
                  {todayRevenue.toLocaleString()}
                </p>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <FileText className="h-4 w-4 text-purple-200" />
                  <p className="text-purple-200 text-sm">
                    {invoices.filter(i => i.createdAt.startsWith(today)).length} فاتورة اليوم
                  </p>
                </div>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-orange-500 to-orange-600 border-0 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-orange-100 font-medium">المخزون</p>
                <p className="text-4xl font-bold">{inventory.length}</p>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <AlertTriangle className="h-4 w-4 text-orange-200" />
                  <p className="text-orange-200 text-sm">
                    {lowStockItems.length} صنف منخفض المخزون
                  </p>
                </div>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <Package className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <Card className="shadow-2xl hover:shadow-3xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100">
              <CardTitle className="flex items-center text-gray-800">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mr-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                الإيرادات والمصروفات (آخر 6 أشهر)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    formatter={(value) => [`${value} ريال`]}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="url(#revenueGradient)" 
                    strokeWidth={4}
                    dot={{ fill: '#10B981', strokeWidth: 3, r: 8 }}
                    name="الإيرادات"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="url(#expenseGradient)" 
                    strokeWidth={4}
                    dot={{ fill: '#EF4444', strokeWidth: 3, r: 8 }}
                    name="المصروفات"
                  />
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#EF4444" />
                      <stop offset="100%" stopColor="#DC2626" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Service Status Pie Chart */}
        <Card className="shadow-2xl hover:shadow-3xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-purple-50 border-b border-gray-100">
            <CardTitle className="flex items-center text-gray-800">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              حالة طلبات الصيانة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
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
            <div className="mt-4 space-y-2">
              {serviceStatusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <Card className="shadow-2xl hover:shadow-3xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100">
            <CardTitle className="flex items-center text-gray-800">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3">
                <Star className="h-6 w-6 text-white" />
              </div>
              أفضل العملاء
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div key={customer.id} className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="relative">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                        {index + 1}
                      </div>
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <Award className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">{customer.name}</p>
                      <p className="text-sm text-gray-500">{customer.cars.length} سيارة</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 text-lg">
                      {customer.revenue.toLocaleString()} {settings.currency}
                    </p>
                  </div>
                </div>
              ))}
              {topCustomers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">لا توجد بيانات عملاء متاحة</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="shadow-2xl hover:shadow-3xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-green-50 border-b border-gray-100">
            <CardTitle className="flex items-center text-gray-800">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              الطلبات الأخيرة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentOrders.map((order) => {
                const customer = customers.find(c => c.id === order.customerId);
                return (
                  <div key={order.id} className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl hover:from-green-50 hover:to-emerald-50 transition-all duration-300 hover:shadow-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 mb-1 group-hover:text-green-600 transition-colors duration-300">{order.description}</p>
                      <p className="text-sm text-gray-600 mb-1">{customer?.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-300 group-hover:scale-105 ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                );
              })}
              {recentOrders.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">لا توجد طلبات صيانة</p>
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