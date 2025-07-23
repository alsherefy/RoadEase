      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <p className="text-gray-600 text-sm lg:text-base">إدارة شاملة لورشة السيارات</p>
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-green-300 mx-auto mb-2" />
                  <p className="text-green-600 font-medium">جميع العناصر متوفرة بكميات كافية</p>
                </div>
            <Card key={index} className="hover:shadow-lg transition-all duration-300 border-r-4 border-orange-500">
        <div className="text-center lg:text-right">
import { LanguageProvider } from './contexts/LanguageContext';
                    <p className="text-xs lg:text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
import { AppProvider } from './contexts/AppContext';
                    <p className="text-lg lg:text-2xl font-bold text-gray-900">{stat.value}</p>
        <Card className="shadow-lg border-0">
                  <div className={`${stat.bgColor} p-3 rounded-full shadow-sm`}>
            <CardTitle className="flex items-center text-lg lg:text-xl">
import ServiceOrders from './pages/ServiceOrders';
import Inventory from './pages/Inventory';
import Invoices from './pages/Invoices';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Employees from './pages/Employees';
import Payroll from './pages/Payroll';
                <div key={order.id} className="p-3 lg:p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow-md transition-shadow">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
import Settings from './pages/Settings';
                    <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${

            <CardTitle className="flex items-center text-lg lg:text-xl">
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
            <ResponsiveContainer width="100%" height={280}>
                  <p className="text-xs lg:text-sm text-gray-600 mt-2 flex items-center">
                    <Wrench className="h-3 w-3 mr-1" />
        </div>
                <XAxis dataKey="month" fontSize={12} />
      </div>
  }
                <Bar dataKey="revenue" fill="#F97316" radius={[4, 4, 0, 0]} />
                <div className="text-center py-8">
                  <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">لا توجد طلبات حديثة</p>
                </div>
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};
        <Card className="shadow-lg border-0">

            <CardTitle className="flex items-center text-lg lg:text-xl">
  return (
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
                <div key={index} className="flex items-center justify-between p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-shadow">
          <Expenses />
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-sm">
      } />
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      } />
      <Route path="/employees" element={
                  <span className="font-bold text-green-600 text-sm lg:text-base bg-green-50 px-2 py-1 rounded">
        <ProtectedRoute>
        </ProtectedRoute>
      } />
      <Route path="/payroll" element={
    <div className="space-y-6 p-4 lg:p-6">
                <div className="text-center py-8">
          <Payroll />
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
      } />
                  <p className="text-gray-500">لا توجد بيانات متاحة</p>
      <Route path="/forecast" element={
                </div>
        <ProtectedRoute>
          <Forecast />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
          <Settings />
        <Card className="shadow-lg border-0">
      } />
            <CardTitle className="flex items-center text-lg lg:text-xl">
    </Routes>
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
                <div key={item.id} className="flex items-center justify-between p-3 lg:p-4 border border-red-200 rounded-lg bg-gradient-to-r from-red-50 to-red-100 hover:shadow-md transition-shadow">
        <AppProvider>
            <AppRoutes />
          </Router>
        </AppProvider>
                    <p className="font-bold text-red-600 text-sm lg:text-base bg-white px-2 py-1 rounded">{item.quantity}</p>
      </AuthProvider>
                    <p className="text-xs text-gray-500 mt-1">الحد الأدنى: {item.minQuantity}</p>
}

export default App;