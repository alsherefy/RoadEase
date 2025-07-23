import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, BarChart3, DollarSign, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { FinancialForecast, ForecastAlert } from '../types';
import { Card, CardHeader, CardContent, CardTitle } from '../components/UI/Card';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';

const Forecast: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { settings } = useApp();
  
  const [forecast, setForecast] = useState<FinancialForecast | null>(null);
  const [growthFactor, setGrowthFactor] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    calculateForecast();
  }, [growthFactor]);

  const calculateForecast = () => {
    setIsLoading(true);
    
    // Get historical data
    const invoices = JSON.parse(localStorage.getItem('roadease_invoices') || '[]');
    const expenses = JSON.parse(localStorage.getItem('roadease_expenses') || '[]');
    const payroll = JSON.parse(localStorage.getItem('roadease_payroll') || '[]');
    
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // Calculate average monthly revenue from Jan 1 to today
    const monthlyRevenue = [];
    const monthlyExpenses = [];
    
    for (let month = 0; month <= currentMonth; month++) {
      const monthStr = `${currentYear}-${(month + 1).toString().padStart(2, '0')}`;
      
      const revenue = invoices
        .filter((inv: any) => inv.createdAt.startsWith(monthStr) && inv.status === 'paid')
        .reduce((sum: number, inv: any) => sum + inv.total, 0);
      
      const expense = expenses
        .filter((exp: any) => exp.date.startsWith(monthStr))
        .reduce((sum: number, exp: any) => sum + exp.amount, 0);
      
      const payrollCost = payroll
        .filter((p: any) => p.month === monthStr)
        .reduce((sum: number, p: any) => sum + p.totalSalary, 0);
      
      monthlyRevenue.push(revenue);
      monthlyExpenses.push(expense + payrollCost);
    }
    
    const avgMonthlyRevenue = monthlyRevenue.reduce((sum, rev) => sum + rev, 0) / monthlyRevenue.length;
    const avgMonthlyExpenses = monthlyExpenses.reduce((sum, exp) => sum + exp, 0) / monthlyExpenses.length;
    
    // Apply growth factor
    const adjustedRevenue = avgMonthlyRevenue * (1 + growthFactor / 100);
    const adjustedExpenses = avgMonthlyExpenses * (1 + growthFactor / 100);
    
    // Calculate remaining months in the year
    const remainingMonths = 12 - currentMonth - 1;
    
    // Project to year-end
    const currentYearRevenue = monthlyRevenue.reduce((sum, rev) => sum + rev, 0);
    const currentYearExpenses = monthlyExpenses.reduce((sum, exp) => sum + exp, 0);
    
    const projectedYearEndRevenue = currentYearRevenue + (adjustedRevenue * remainingMonths);
    const projectedYearEndExpenses = currentYearExpenses + (adjustedExpenses * remainingMonths);
    const projectedNetProfit = projectedYearEndRevenue - projectedYearEndExpenses;
    
    // Generate alerts
    const alerts: ForecastAlert[] = [];
    
    if (projectedNetProfit < 0) {
      alerts.push({
        type: 'danger',
        message: 'التوقعات تشير إلى خسارة في نهاية العام',
        messageEn: 'Forecast indicates a loss by year-end'
      });
    } else if (projectedNetProfit < currentYearRevenue * 0.1) {
      alerts.push({
        type: 'warning',
        message: 'هامش الربح المتوقع منخفض (أقل من 10%)',
        messageEn: 'Expected profit margin is low (less than 10%)'
      });
    }
    
    if (adjustedRevenue < avgMonthlyRevenue) {
      alerts.push({
        type: 'warning',
        message: 'معدل النمو السالب قد يؤثر على الإيرادات',
        messageEn: 'Negative growth rate may impact revenue'
      });
    }
    
    if (remainingMonths <= 2 && projectedNetProfit > 0) {
      alerts.push({
        type: 'info',
        message: 'فرصة جيدة لاستثمار الأرباح المتوقعة',
        messageEn: 'Good opportunity to invest expected profits'
      });
    }
    
    const forecastData: FinancialForecast = {
      currentPeriod: {
        from: `${currentYear}-01-01`,
        to: new Date().toISOString().split('T')[0]
      },
      projectedYearEnd: {
        revenue: projectedYearEndRevenue,
        expenses: projectedYearEndExpenses,
        netProfit: projectedNetProfit
      },
      growthFactor,
      alerts
    };
    
    setForecast(forecastData);
    setIsLoading(false);
  };

  const getMonthlyProjectionData = () => {
    if (!forecast) return [];
    
    const data = [];
    const currentMonth = new Date().getMonth();
    
    // Historical data (actual)
    const invoices = JSON.parse(localStorage.getItem('roadease_invoices') || '[]');
    const expenses = JSON.parse(localStorage.getItem('roadease_expenses') || '[]');
    const payroll = JSON.parse(localStorage.getItem('roadease_payroll') || '[]');
    
    for (let month = 0; month < 12; month++) {
      const monthStr = `${new Date().getFullYear()}-${(month + 1).toString().padStart(2, '0')}`;
      const monthName = new Date(2024, month).toLocaleDateString('ar-SA', { month: 'short' });
      
      if (month <= currentMonth) {
        // Actual data
        const revenue = invoices
          .filter((inv: any) => inv.createdAt.startsWith(monthStr) && inv.status === 'paid')
          .reduce((sum: number, inv: any) => sum + inv.total, 0);
        
        const expense = expenses
          .filter((exp: any) => exp.date.startsWith(monthStr))
          .reduce((sum: number, exp: any) => sum + exp.amount, 0);
        
        const payrollCost = payroll
          .filter((p: any) => p.month === monthStr)
          .reduce((sum: number, p: any) => sum + p.totalSalary, 0);
        
        data.push({
          month: monthName,
          actual: revenue - expense - payrollCost,
          projected: null,
          type: 'actual'
        });
      } else {
        // Projected data
        const avgRevenue = forecast.projectedYearEnd.revenue / 12;
        const avgExpenses = forecast.projectedYearEnd.expenses / 12;
        
        data.push({
          month: monthName,
          actual: null,
          projected: avgRevenue - avgExpenses,
          type: 'projected'
        });
      }
    }
    
    return data;
  };

  // Only admins can access financial forecasting
  if (!user?.permissions?.financialReports) {
    return (
      <div className="text-center py-8">
        <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">غير مصرح</h2>
        <p className="text-gray-600">ليس لديك صلاحية للوصول إلى التوقعات المالية</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const projectionData = getMonthlyProjectionData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">التوقعات المالية</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">معامل النمو:</label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                step="0.1"
                value={growthFactor}
                onChange={(e) => setGrowthFactor(parseFloat(e.target.value) || 0)}
                className="w-20"
              />
              <span className="text-sm text-gray-600">%</span>
            </div>
          </div>
          <Button onClick={calculateForecast}>
            إعادة حساب
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {forecast?.alerts && forecast.alerts.length > 0 && (
        <div className="space-y-3">
          {forecast.alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                alert.type === 'danger' ? 'bg-red-50 border-red-400' :
                alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                'bg-blue-50 border-blue-400'
              }`}
            >
              <div className="flex items-center">
                <AlertTriangle className={`h-5 w-5 mr-3 ${
                  alert.type === 'danger' ? 'text-red-600' :
                  alert.type === 'warning' ? 'text-yellow-600' :
                  'text-blue-600'
                }`} />
                <p className={`text-sm font-medium ${
                  alert.type === 'danger' ? 'text-red-800' :
                  alert.type === 'warning' ? 'text-yellow-800' :
                  'text-blue-800'
                }`}>
                  {alert.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      {forecast && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">الإيرادات المتوقعة</p>
                  <p className="text-2xl font-bold text-green-600">
                    {forecast.projectedYearEnd.revenue.toLocaleString()} {settings.currency}
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
                  <p className="text-sm font-medium text-gray-600">المصروفات المتوقعة</p>
                  <p className="text-2xl font-bold text-red-600">
                    {forecast.projectedYearEnd.expenses.toLocaleString()} {settings.currency}
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
                  <p className="text-sm font-medium text-gray-600">صافي الربح المتوقع</p>
                  <p className={`text-2xl font-bold ${
                    forecast.projectedYearEnd.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'
                  }`}>
                    {forecast.projectedYearEnd.netProfit.toLocaleString()} {settings.currency}
                  </p>
                </div>
                <div className={`${
                  forecast.projectedYearEnd.netProfit >= 0 ? 'bg-blue-100' : 'bg-red-100'
                } p-3 rounded-full`}>
                  <DollarSign className={`h-6 w-6 ${
                    forecast.projectedYearEnd.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Projection Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-orange-500" />
            التوقعات الشهرية لنهاية العام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  `${value?.toLocaleString()} ريال`, 
                  name === 'actual' ? 'فعلي' : 'متوقع'
                ]} 
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#10B981" 
                strokeWidth={3}
                name="actual"
                connectNulls={false}
              />
              <Line 
                type="monotone" 
                dataKey="projected" 
                stroke="#F97316" 
                strokeWidth={3}
                strokeDasharray="5 5"
                name="projected"
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Forecast Details */}
      {forecast && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل التوقعات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">فترة التحليل:</span>
                  <span className="text-sm text-gray-600">
                    {new Date(forecast.currentPeriod.from).toLocaleDateString('ar-SA')} - 
                    {new Date(forecast.currentPeriod.to).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">معامل النمو المطبق:</span>
                  <span className={`font-bold ${
                    forecast.growthFactor >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {forecast.growthFactor > 0 ? '+' : ''}{forecast.growthFactor}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">هامش الربح المتوقع:</span>
                  <span className={`font-bold ${
                    forecast.projectedYearEnd.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {forecast.projectedYearEnd.revenue > 0 ? 
                      ((forecast.projectedYearEnd.netProfit / forecast.projectedYearEnd.revenue) * 100).toFixed(1) : 0
                    }%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>توصيات استراتيجية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {forecast.projectedYearEnd.netProfit < 0 ? (
                  <>
                    <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                      <p className="text-sm text-red-800">
                        <strong>عاجل:</strong> مراجعة استراتيجية التسعير وتقليل المصروفات
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                      <p className="text-sm text-yellow-800">
                        النظر في تنويع مصادر الدخل أو تحسين كفاءة العمليات
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                      <p className="text-sm text-green-800">
                        <strong>ممتاز:</strong> الأرباح المتوقعة إيجابية، فكر في الاستثمار في التوسع
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <p className="text-sm text-blue-800">
                        يمكن تخصيص جزء من الأرباح لتطوير الخدمات أو شراء معدات جديدة
                      </p>
                    </div>
                  </>
                )}
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>ملاحظة:</strong> هذه التوقعات مبنية على البيانات التاريخية وقد تتأثر بعوامل خارجية
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Forecast;