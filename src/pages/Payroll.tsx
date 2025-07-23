import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, TrendingUp, Download, Plus, Eye } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { PayrollRecord, User } from '../types';
import { Card, CardHeader, CardContent, CardTitle } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Select from '../components/UI/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/UI/Table';

const Payroll: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { settings } = useApp();
  
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [netProfit, setNetProfit] = useState(0);

  useEffect(() => {
    loadData();
    calculateNetProfit();
  }, []);

  const loadData = () => {
    const savedPayroll = localStorage.getItem('roadease_payroll');
    const savedEmployees = localStorage.getItem('roadease_users');
    
    if (savedPayroll) setPayrollRecords(JSON.parse(savedPayroll));
    if (savedEmployees) {
      const allUsers = JSON.parse(savedEmployees);
      setEmployees(allUsers.filter((u: User) => u.salary));
    }
  };

  const calculateNetProfit = () => {
    // This would normally come from the financial reports
    // For demo purposes, we'll use a sample calculation
    const invoices = JSON.parse(localStorage.getItem('roadease_invoices') || '[]');
    const expenses = JSON.parse(localStorage.getItem('roadease_expenses') || '[]');
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const monthlyRevenue = invoices
      .filter((inv: any) => inv.createdAt.startsWith(currentMonth) && inv.status === 'paid')
      .reduce((sum: number, inv: any) => sum + inv.total, 0);
    
    const monthlyExpenses = expenses
      .filter((exp: any) => exp.date.startsWith(currentMonth))
      .reduce((sum: number, exp: any) => sum + exp.amount, 0);
    
    setNetProfit(monthlyRevenue - monthlyExpenses);
  };

  const processPayroll = () => {
    const month = selectedMonth;
    const existingRecord = payrollRecords.find(r => r.month === month);
    
    if (existingRecord) {
      alert('تم معالجة رواتب هذا الشهر مسبقاً');
      return;
    }

    const newRecords: PayrollRecord[] = employees.map(employee => {
      const baseSalary = employee.salary?.baseSalary || 0;
      const allowances = employee.salary?.allowances?.reduce((sum, a) => sum + a.amount, 0) || 0;
      const profitShare = (netProfit * (employee.salary?.profitPercentage || 0)) / 100;
      const totalSalary = baseSalary + allowances + profitShare;

      return {
        id: Math.random().toString(36).substr(2, 9),
        employeeId: employee.employeeId,
        employeeName: employee.name,
        month,
        baseSalary,
        allowances,
        profitShare,
        totalSalary,
        paidDate: new Date(),
        createdAt: new Date()
      };
    });

    const updatedRecords = [...payrollRecords, ...newRecords];
    setPayrollRecords(updatedRecords);
    localStorage.setItem('roadease_payroll', JSON.stringify(updatedRecords));
    
    setIsProcessModalOpen(false);
    alert(`تم معالجة رواتب ${employees.length} موظف لشهر ${month}`);
  };

  const viewPayrollDetails = (record: PayrollRecord) => {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  };

  const exportPayrollReport = () => {
    const month = selectedMonth;
    const monthRecords = payrollRecords.filter(r => r.month === month);
    
    if (monthRecords.length === 0) {
      alert('لا توجد بيانات رواتب لهذا الشهر');
      return;
    }

    const csvContent = [
      ['رقم الموظف', 'اسم الموظف', 'الراتب الأساسي', 'البدلات', 'نصيب الأرباح', 'إجمالي الراتب'],
      ...monthRecords.map(record => [
        record.employeeId,
        record.employeeName,
        record.baseSalary.toString(),
        record.allowances.toString(),
        record.profitShare.toString(),
        record.totalSalary.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `payroll-${month}.csv`;
    link.click();
  };

  const getMonthlyTotal = (month: string) => {
    return payrollRecords
      .filter(r => r.month === month)
      .reduce((sum, r) => sum + r.totalSalary, 0);
  };

  const getUniqueMonths = () => {
    const months = [...new Set(payrollRecords.map(r => r.month))];
    return months.sort().reverse();
  };

  // Only admins can access payroll
  if (!user?.permissions?.payroll) {
    return (
      <div className="text-center py-8">
        <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">غير مصرح</h2>
        <p className="text-gray-600">ليس لديك صلاحية للوصول إلى نظام الرواتب</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">إدارة الرواتب</h1>
        <div className="flex space-x-4">
          <Button
            icon={Download}
            variant="secondary"
            onClick={exportPayrollReport}
          >
            تصدير التقرير
          </Button>
          <Button
            icon={Plus}
            onClick={() => setIsProcessModalOpen(true)}
          >
            معالجة رواتب الشهر
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">الموظفين المستحقين</p>
                <p className="text-2xl font-bold text-blue-600">{employees.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">صافي الربح الشهري</p>
                <p className="text-2xl font-bold text-green-600">
                  {netProfit.toLocaleString()} {settings.currency}
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
                <p className="text-sm font-medium text-gray-600">رواتب الشهر الحالي</p>
                <p className="text-2xl font-bold text-orange-600">
                  {getMonthlyTotal(new Date().toISOString().slice(0, 7)).toLocaleString()} {settings.currency}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الرواتب السنوية</p>
                <p className="text-2xl font-bold text-purple-600">
                  {payrollRecords.reduce((sum, r) => sum + r.totalSalary, 0).toLocaleString()} {settings.currency}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payroll History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>سجل الرواتب</CardTitle>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">جميع الأشهر</option>
              {getUniqueMonths().map(month => (
                <option key={month} value={month}>
                  {new Date(month + '-01').toLocaleDateString('ar-SA', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </option>
              ))}
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الموظف</TableHead>
                <TableHead>اسم الموظف</TableHead>
                <TableHead>الشهر</TableHead>
                <TableHead>الراتب الأساسي</TableHead>
                <TableHead>البدلات</TableHead>
                <TableHead>نصيب الأرباح</TableHead>
                <TableHead>إجمالي الراتب</TableHead>
                <TableHead>تاريخ الدفع</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollRecords
                .filter(record => !selectedMonth || record.month === selectedMonth)
                .map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {record.employeeId}
                    </code>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{record.employeeName}</span>
                  </TableCell>
                  <TableCell>
                    {new Date(record.month + '-01').toLocaleDateString('ar-SA', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </TableCell>
                  <TableCell>
                    {record.baseSalary.toLocaleString()} {settings.currency}
                  </TableCell>
                  <TableCell>
                    {record.allowances.toLocaleString()} {settings.currency}
                  </TableCell>
                  <TableCell>
                    {record.profitShare.toLocaleString()} {settings.currency}
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-green-600">
                      {record.totalSalary.toLocaleString()} {settings.currency}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(record.paidDate).toLocaleDateString('ar-SA')}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={Eye}
                      onClick={() => viewPayrollDetails(record)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {payrollRecords.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              لا توجد سجلات رواتب متاحة
            </div>
          )}
        </CardContent>
      </Card>

      {/* Process Payroll Modal */}
      <Modal
        isOpen={isProcessModalOpen}
        onClose={() => setIsProcessModalOpen(false)}
        title="معالجة رواتب الشهر"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اختر الشهر
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">ملخص المعالجة:</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>عدد الموظفين: {employees.length}</p>
              <p>صافي الربح الشهري: {netProfit.toLocaleString()} {settings.currency}</p>
              <p>إجمالي الرواتب المتوقع: {
                employees.reduce((sum, emp) => {
                  const baseSalary = emp.salary?.baseSalary || 0;
                  const allowances = emp.salary?.allowances?.reduce((s, a) => s + a.amount, 0) || 0;
                  const profitShare = (netProfit * (emp.salary?.profitPercentage || 0)) / 100;
                  return sum + baseSalary + allowances + profitShare;
                }, 0).toLocaleString()
              } {settings.currency}</p>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>تنبيه:</strong> بعد معالجة الرواتب، سيتم قفل البيانات ولا يمكن تعديلها.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsProcessModalOpen(false)}
            >
              إلغاء
            </Button>
            <Button onClick={processPayroll}>
              معالجة الرواتب
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Payroll Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`تفاصيل راتب: ${selectedRecord?.employeeName}`}
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">رقم الموظف</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRecord.employeeId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">الشهر</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedRecord.month + '-01').toLocaleDateString('ar-SA', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">تفاصيل الراتب:</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>الراتب الأساسي:</span>
                  <span>{selectedRecord.baseSalary.toLocaleString()} {settings.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span>البدلات والمكافآت:</span>
                  <span>{selectedRecord.allowances.toLocaleString()} {settings.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span>نصيب الأرباح:</span>
                  <span>{selectedRecord.profitShare.toLocaleString()} {settings.currency}</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>إجمالي الراتب:</span>
                  <span className="text-green-600">
                    {selectedRecord.totalSalary.toLocaleString()} {settings.currency}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>تاريخ الدفع:</span>
                <span>{new Date(selectedRecord.paidDate).toLocaleDateString('ar-SA')}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Payroll;