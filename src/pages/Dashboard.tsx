import React from 'react';
import { Users, Car, Wrench, DollarSign, TrendingUp, AlertTriangle, Package, FileText } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
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

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">مرحباً، {user?.name}</h1>
            <p className="text-orange-100 text-lg">نظام إدارة ورشة السيارات المتكامل</p>
          </div>
          <div className="hidden md:block">
            <Car className="h-20 w-20 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">إجمالي العملاء</p>
                <p className="text-3xl font-bold text-blue-800">{customers.length}</p>
                <p className="text-xs text-blue-500 mt-1">
                  {customers.reduce((sum, c) => sum + c.cars.length, 0)} سيارة مسجلة
                </p>
              </div>
              <div className="bg-blue-500 p-4 rounded-full shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">طلبات الصيانة</p>
                <p className="text-3xl font-bold text-green-800">{serviceOrders.length}</p>
                <p className="text-xs text-green-500 mt-1">
                  {serviceOrders.filter(o => o.status === 'open').length} طلب مفتوح
                </p>
              </div>
              <div className="bg-green-500 p-4 rounded-full shadow-lg">
                <Wrench className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">إيرادات اليوم</p>
                <p className="text-3xl font-bold text-purple-800">
                  {todayRevenue.toLocaleString()} {settings.currency}
                </p>
                <p className="text-xs text-purple-500 mt-1">
                  {invoices.filter(i => i.createdAt.startsWith(today)).length} فاتورة اليوم
                </p>
              </div>
              <div className="bg-purple-500 p-4 rounded-full shadow-lg">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">المخزون</p>
                <p className="text-3xl font-bold text-orange-800">{inventory.length}</p>
                <p className="text-xs text-orange-500 mt-1">
                  {lowStockItems.length} صنف منخفض المخزون
                </p>
              </div>
              <div className="bg-orange-500 p-4 rounded-full shadow-lg">
                <Package className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <CardTitle className="flex items-center text-gray-800">
              <TrendingUp className="h-6 w-6 mr-3 text-green-500" />
              الإيرادات والمصروفات (آخر 6 أشهر)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  formatter={(value) => [`${value} ريال`]}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                  name="الإيرادات"
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#EF4444" 
                  strokeWidth={3}
                  dot={{ fill: '#EF4444', strokeWidth: 2, r: 6 }}
                  name="المصروفات"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <CardTitle className="flex items-center text-gray-800">
              <Users className="h-6 w-6 mr-3 text-blue-500" />
              أفضل العملاء
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div key={customer.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-blue-50 hover:to-blue-100 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{customer.name}</p>
                      <p className="text-sm text-gray-500">{customer.cars.length} سيارة</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {customer.revenue.toLocaleString()} {settings.currency}
                    </p>
                  </div>
                </div>
              ))}
              {topCustomers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>لا توجد بيانات عملاء متاحة</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <CardTitle className="flex items-center text-gray-800">
              <FileText className="h-6 w-6 mr-3 text-purple-500" />
              الطلبات الأخيرة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentOrders.map((order) => {
                const customer = customers.find(c => c.id === order.customerId);
                return (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-purple-50 hover:to-purple-100 transition-all duration-300">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 mb-1">{order.description}</p>
                      <p className="text-sm text-gray-600">{customer?.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                );
              })}
              {recentOrders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>لا توجد طلبات صيانة</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <CardTitle className="flex items-center text-gray-800">
              <AlertTriangle className="h-6 w-6 mr-3 text-red-500" />
              تنبيهات المخزون
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {lowStockItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200 hover:shadow-md transition-all duration-300">
                  <div className="flex-1">
                    <p className="font-semibold text-red-800 mb-1">{item.name}</p>
                    <p className="text-sm text-red-600">{item.partNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-700">{item.quantity}</p>
                    <p className="text-xs text-red-500">الحد الأدنى: {item.minQuantity}</p>
                  </div>
                </div>
              ))}
              {lowStockItems.length === 0 && (
                <div className="text-center py-8 text-green-600">
                  <Package className="h-12 w-12 mx-auto mb-3 text-green-400" />
                  <p>جميع الأصناف متوفرة بكميات كافية</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;