      import { LanguageProvider } from './contexts/LanguageContext';
import { AppProvider } from './contexts/AppContext';
import ServiceOrders from './pages/ServiceOrders';
import Inventory from './pages/Inventory';
import Invoices from './pages/Invoices';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Employees from './pages/Employees';
import Payroll from './pages/Payroll';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/expenses" element={
        <ProtectedRoute>
          <Expenses />
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      } />
      <Route path="/employees" element={
        <ProtectedRoute>
          <Employees />
        </ProtectedRoute>
      } />
      <Route path="/payroll" element={
        <ProtectedRoute>
          <Payroll />
        </ProtectedRoute>
      } />
      <Route path="/forecast" element={
        <ProtectedRoute>
          <Forecast />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AppProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

const Dashboard = () => {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="text-center lg:text-right">
        <p className="text-gray-600 text-sm lg:text-base">إدارة شاملة لورشة السيارات</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-300 border-r-4 border-orange-500">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-full shadow-sm`}>
                  <stat.icon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center text-lg lg:text-xl">
              <TrendingUp className="h-5 w-5 mr-2 text-orange-500" />
              الإيرادات الشهرية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#F97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center text-lg lg:text-xl">
              <Wrench className="h-5 w-5 mr-2 text-orange-500" />
              طلبات الخدمة الحديثة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="p-3 lg:p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{order.customerName}</p>
                        <p className="text-xs lg:text-sm text-gray-600 mt-2 flex items-center">
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
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center text-lg lg:text-xl">
              <Package className="h-5 w-5 mr-2 text-orange-500" />
              حالة المخزون
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockItems.length > 0 ? (
              <div className="space-y-3">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 lg:p-4 border border-red-200 rounded-lg bg-gradient-to-r from-red-50 to-red-100 hover:shadow-md transition-shadow">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-1">الحد الأدنى: {item.minQuantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600 text-sm lg:text-base bg-white px-2 py-1 rounded">{item.quantity}</p>
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
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center text-lg lg:text-xl">
              <Users className="h-5 w-5 mr-2 text-orange-500" />
              أداء الموظفين
            </CardTitle>
          </CardHeader>
          <CardContent>
            {employeePerformance.length > 0 ? (
              <div className="space-y-3">
                {employeePerformance.map((employee, index) => (
                  <div key={index} className="flex items-center justify-between p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-sm">{employee.name.charAt(0)}</span>
                      </div>
                      <div className="mr-3">
                        <p className="font-medium text-gray-900">{employee.name}</p>
                        <p className="text-xs text-gray-500">{employee.completedOrders} طلب مكتمل</p>
                      </div>
                    </div>
                    <span className="font-bold text-green-600 text-sm lg:text-base bg-green-50 px-2 py-1 rounded">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default App;