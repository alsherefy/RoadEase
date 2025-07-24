import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, Calendar, TrendingUp, TrendingDown, DollarSign, Users, Car, Package } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import { Card, CardHeader, CardContent, CardTitle } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Select from '../components/UI/Select';

const Reports: React.FC = () => {
  const { t } = useLanguage();
  const { 
    customers, 
    serviceOrders, 
    invoices, 
    expenses, 
    inventory,
    settings 
  } = useApp();
  
  const [reportType, setReportType] = useState('financial');
  const [dateRange, setDateRange] = useState('month');

  // Calculate date range
  const getDateRange = () => {
    const today = new Date();
    let startDate = new Date();
    
    switch (dateRange) {
      case 'week':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(today.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
    }
    
    return { startDate, endDate: today };
  };

  const { startDate, endDate } = getDateRange();

  // Financial calculations
  const filteredInvoices = invoices.filter(invoice => {
    const invoiceDate = new Date(invoice.createdAt);
    return invoiceDate >= startDate && invoiceDate <= endDate && invoice.paymentStatus === 'paid';
  });

  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= startDate && expenseDate <= endDate;
  });

  const totalRevenue = filteredInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  // Monthly revenue data
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (11 - i));
    
    const monthRevenue = invoices
      .filter(invoice => {
        const invoiceDate = new Date(invoice.createdAt);
        return invoiceDate.getMonth() === month.getMonth() && 
               invoiceDate.getFullYear() === month.getFullYear() &&
               invoice.paymentStatus === 'paid';
      })
      .reduce((sum, invoice) => sum + invoice.totalAmount, 0);

    const monthExpenses = expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === month.getMonth() && 
               expenseDate.getFullYear() === month.getFullYear();
      })
      .reduce((sum, expense) => sum + expense.amount, 0);

    return {
      month: month.toLocaleDateString('ar-SA', { month: 'short', year: 'numeric' }),
      revenue: monthRevenue,
      expenses: monthExpenses,
      profit: monthRevenue - monthExpenses
    };
  });

  // Top customers
  const customerRevenue = customers.map(customer => {
    const revenue = invoices
      .filter(invoice => invoice.customerId === customer.id && invoice.paymentStatus === 'paid')
      .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    
    return { name: customer.name, revenue };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  // Service categories
  const serviceCategories = serviceOrders.reduce((acc, order) => {
    const category = order.description.includes('زيت') ? 'تغيير زيت' :
                    order.description.includes('فرامل') ? 'فرامل' :
                    order.description.includes('إطار') ? 'إطارات' :
                    order.description.includes('بطارية') ? 'بطاريات' : 'أخرى';
    
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const serviceCategoryData = Object.entries(serviceCategories).map(([name, value]) => ({
    name,
    value
  }));

  // Expense categories
  const expenseCategoryData = filteredExpenses.reduce((acc, expense) => {
    const existing = acc.find(item => item.name === expense.category);
    if (existing) {
      existing.value += expense.amount;
    } else {
      acc.push({ name: expense.category, value: expense.amount });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Inventory analysis
  const lowStockItems = inventory.filter(item => item.quantity <= item.minQuantity);
  const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * item.cost), 0);

  const COLORS = ['#F97316', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'];

  const handleExportReport = () => {
    const reportData = {
      period: `${startDate.toLocaleDateString('ar-SA')} - ${endDate.toLocaleDateString('ar-SA')}`,
      financial: {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0
      },
      customers: customerRevenue,
      services: serviceCategoryData,
      expenses: expenseCategoryData,
      inventory: {
        totalValue: totalInventoryValue,
        lowStockItems: lowStockItems.length,
        totalItems: inventory.length
      }
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `road-ease-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('reports')}</h1>
        <div className="flex space-x-4">
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="week">آخر أسبوع</option>
            <option value="month">آخر شهر</option>
            <option value="quarter">آخر 3 أشهر</option>
            <option value="year">آخر سنة</option>
          </Select>
          <Select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="financial">التقارير المالية</option>
            <option value="customers">تقارير العملاء</option>
            <option value="services">تقارير الخدمات</option>
            <option value="inventory">تقارير المخزون</option>
          </Select>
          <Button icon={Download} onClick={handleExportReport}>
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalRevenue.toLocaleString()} {settings.currency}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي المصروفات</p>
                <p className="text-2xl font-bold text-red-600">
                  {totalExpenses.toLocaleString()} {settings.currency}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">صافي الربح</p>
                <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {netProfit.toLocaleString()} {settings.currency}
                </p>
              </div>
              <div className={`${netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'} p-3 rounded-full`}>
                <DollarSign className={`h-6 w-6 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">هامش الربح</p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {reportType === 'financial' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>الإيرادات والمصروفات الشهرية</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} ريال`]} />
                  <Bar dataKey="revenue" fill="#10B981" name="الإيرادات" />
                  <Bar dataKey="expenses" fill="#EF4444" name="المصروفات" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Profit Trend */}
          <Card>
            <CardHeader>
              <CardTitle>اتجاه الأرباح</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} ريال`, 'الربح']} />
                  <Line type="monotone" dataKey="profit" stroke="#F97316" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === 'customers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Customers */}
          <Card>
            <CardHeader>
              <CardTitle>أفضل العملاء</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={customerRevenue.slice(0, 8)} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value) => [`${value} ريال`, 'الإيرادات']} />
                  <Bar dataKey="revenue" fill="#F97316" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Customer Stats */}
          <Card>
            <CardHeader>
              <CardTitle>إحصائيات العملاء</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="h-8 w-8 text-blue-600" />
                    <span className="font-medium">إجمالي العملاء</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{customers.length}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Car className="h-8 w-8 text-green-600" />
                    <span className="font-medium">إجمالي السيارات</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {customers.reduce((sum, customer) => sum + customer.cars.length, 0)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-8 w-8 text-orange-600" />
                    <span className="font-medium">متوسط الإنفاق</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-600">
                    {customers.length > 0 ? 
                      Math.round(totalRevenue / customers.length).toLocaleString() : 0
                    } {settings.currency}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === 'services' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service Categories */}
          <Card>
            <CardHeader>
              <CardTitle>أنواع الخدمات</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={serviceCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {serviceCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Service Orders Status */}
          <Card>
            <CardHeader>
              <CardTitle>حالة طلبات الصيانة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['open', 'in_progress', 'completed'].map(status => {
                  const count = serviceOrders.filter(order => order.status === status).length;
                  const percentage = serviceOrders.length > 0 ? (count / serviceOrders.length) * 100 : 0;
                  const statusText = status === 'open' ? 'مفتوح' : 
                                   status === 'in_progress' ? 'تحت التنفيذ' : 'مكتمل';
                  const color = status === 'open' ? 'bg-yellow-500' : 
                               status === 'in_progress' ? 'bg-blue-500' : 'bg-green-500';
                  
                  return (
                    <div key={status} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{statusText}</span>
                        <span>{count} طلب</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${color} h-2 rounded-full`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inventory Value */}
          <Card>
            <CardHeader>
              <CardTitle>قيمة المخزون</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Package className="h-8 w-8 text-blue-600" />
                    <span className="font-medium">إجمالي القيمة</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {totalInventoryValue.toLocaleString()} {settings.currency}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Package className="h-8 w-8 text-green-600" />
                    <span className="font-medium">عدد الأصناف</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{inventory.length}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Package className="h-8 w-8 text-red-600" />
                    <span className="font-medium">مخزون منخفض</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">{lowStockItems.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Items */}
          <Card>
            <CardHeader>
              <CardTitle>الأصناف منخفضة المخزون</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {lowStockItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.partNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{item.quantity}</p>
                      <p className="text-xs text-gray-500">الحد الأدنى: {item.minQuantity}</p>
                    </div>
                  </div>
                ))}
                {lowStockItems.length === 0 && (
                  <p className="text-center text-green-600 py-8">
                    جميع الأصناف متوفرة بكميات كافية
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Expense Categories (for financial report) */}
      {reportType === 'financial' && expenseCategoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>توزيع المصروفات حسب الفئة</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} ريال`]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reports;