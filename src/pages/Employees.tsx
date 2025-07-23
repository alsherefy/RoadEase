import React, { useState } from 'react';
import { Plus, Edit, Trash2, User, Shield, Clock, Key, Settings as SettingsIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { User as UserType, UserPermissions, Allowance } from '../types';
import { Card, CardHeader, CardContent, CardTitle } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/UI/Table';

const Employees: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [employees, setEmployees] = useState<UserType[]>(() => {
    const saved = localStorage.getItem('roadease_users');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<UserType | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<UserType | null>(null);
  const [editingSalary, setEditingSalary] = useState<UserType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee' as 'admin' | 'employee',
    phone: '',
    permissions: getDefaultPermissions('employee')
  });

  const [permissionsForm, setPermissionsForm] = useState<UserPermissions>(getDefaultPermissions('employee'));
  
  const [salaryForm, setSalaryForm] = useState({
    baseSalary: 0,
    allowances: [] as Allowance[],
    profitPercentage: 0
  });

  function getDefaultPermissions(role: 'admin' | 'employee'): UserPermissions {
    if (role === 'admin') {
      return {
        customers: true,
        serviceOrders: true,
        inventory: true,
        invoices: true,
        expenses: true,
        reports: true,
        employees: true,
        settings: true,
        financialReports: true,
        profitAnalysis: true,
        payroll: true,
        workshopRent: true,
      };
    } else {
      return {
        customers: true,
        serviceOrders: true,
        inventory: true,
        invoices: true,
        expenses: false,
        reports: false,
        employees: false,
        settings: false,
        financialReports: false,
        profitAnalysis: false,
        payroll: false,
        workshopRent: false,
      };
    }
  }

  function generateEmployeeId(): string {
    const existingIds = employees.map(emp => emp.employeeId).filter(id => id.startsWith('EMP-'));
    const numbers = existingIds.map(id => parseInt(id.split('-')[1])).filter(num => !isNaN(num));
    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `EMP-${nextNumber.toString().padStart(3, '0')}`;
  }

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || employee.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const resetForm = () => {
    setEmployeeForm({
      name: '',
      email: '',
      password: '',
      role: 'employee',
      phone: '',
      permissions: getDefaultPermissions('employee')
    });
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditEmployee = (employee: UserType) => {
    setEditingEmployee(employee);
    setEmployeeForm({
      name: employee.name,
      email: employee.email,
      password: '', // Don't show existing password
      role: employee.role,
      phone: employee.phone || '',
      permissions: employee.permissions
    });
    setIsModalOpen(true);
  };

  const handleDeleteEmployee = (id: string) => {
    if (id === user?.id) {
      alert('لا يمكنك حذف حسابك الخاص');
      return;
    }
    
    if (window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      const updatedEmployees = employees.filter(emp => emp.id !== id);
      setEmployees(updatedEmployees);
      localStorage.setItem('roadease_users', JSON.stringify(updatedEmployees));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEmployee) {
      const updatedEmployees = employees.map(emp => 
        emp.id === editingEmployee.id 
          ? { 
              ...emp, 
              name: employeeForm.name,
              email: employeeForm.email,
              role: employeeForm.role,
              phone: employeeForm.phone,
              permissions: employeeForm.permissions,
              ...(employeeForm.password && { password: employeeForm.password })
            }
          : emp
      );
      setEmployees(updatedEmployees);
      localStorage.setItem('roadease_users', JSON.stringify(updatedEmployees));
    } else {
      const newEmployee: UserType = {
        id: Math.random().toString(36).substr(2, 9),
        employeeId: generateEmployeeId(),
        name: employeeForm.name,
        email: employeeForm.email,
        role: employeeForm.role,
        phone: employeeForm.phone,
        permissions: employeeForm.permissions,
        createdAt: new Date()
      };
      
      const updatedEmployees = [...employees, newEmployee];
      setEmployees(updatedEmployees);
      
      // Also save with password for login
      const usersWithPassword = JSON.parse(localStorage.getItem('roadease_users') || '[]');
      usersWithPassword.push({ ...newEmployee, password: employeeForm.password });
      localStorage.setItem('roadease_users', JSON.stringify(usersWithPassword));
    }
    
    setIsModalOpen(false);
    resetForm();
    setEditingEmployee(null);
  };

  const handleEditPermissions = (employee: UserType) => {
    setEditingPermissions(employee);
    setPermissionsForm(employee.permissions);
    setIsPermissionsModalOpen(true);
  };

  const handleSavePermissions = () => {
    if (!editingPermissions) return;
    
    const updatedEmployees = employees.map(emp => 
      emp.id === editingPermissions.id 
        ? { ...emp, permissions: permissionsForm }
        : emp
    );
    setEmployees(updatedEmployees);
    localStorage.setItem('roadease_users', JSON.stringify(updatedEmployees));
    
    setIsPermissionsModalOpen(false);
    setEditingPermissions(null);
  };

  const handleEditSalary = (employee: UserType) => {
    setEditingSalary(employee);
    setSalaryForm({
      baseSalary: employee.salary?.baseSalary || 0,
      allowances: employee.salary?.allowances || [],
      profitPercentage: employee.salary?.profitPercentage || 0
    });
    setIsSalaryModalOpen(true);
  };

  const handleSaveSalary = () => {
    if (!editingSalary) return;
    
    const updatedEmployees = employees.map(emp => 
      emp.id === editingSalary.id 
        ? { ...emp, salary: salaryForm }
        : emp
    );
    setEmployees(updatedEmployees);
    localStorage.setItem('roadease_users', JSON.stringify(updatedEmployees));
    
    setIsSalaryModalOpen(false);
    setEditingSalary(null);
  };

  const addAllowance = () => {
    setSalaryForm(prev => ({
      ...prev,
      allowances: [...prev.allowances, {
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        amount: 0,
        type: 'fixed'
      }]
    }));
  };

  const removeAllowance = (id: string) => {
    setSalaryForm(prev => ({
      ...prev,
      allowances: prev.allowances.filter(a => a.id !== id)
    }));
  };

  const updateAllowance = (id: string, field: string, value: any) => {
    setSalaryForm(prev => ({
      ...prev,
      allowances: prev.allowances.map(a => 
        a.id === id ? { ...a, [field]: value } : a
      )
    }));
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'مدير';
      case 'employee': return 'موظف';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'employee': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Only managers can access this page
  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">غير مصرح</h2>
        <p className="text-gray-600">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('employees')}</h1>
        <Button icon={Plus} onClick={handleAddEmployee}>
          إضافة موظف جديد
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الموظفين</p>
                <p className="text-2xl font-bold text-blue-600">{employees.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">المديرين</p>
                <p className="text-2xl font-bold text-red-600">
                  {employees.filter(emp => emp.role === 'admin').length}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">الموظفين</p>
                <p className="text-2xl font-bold text-green-600">
                  {employees.filter(emp => emp.role === 'employee').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>قائمة الموظفين</CardTitle>
            <div className="flex space-x-4">
              <div className="w-64">
                <Input
                  type="text"
                  placeholder="البحث في الموظفين..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">جميع الأدوار</option>
                <option value="admin">مدير</option>
                <option value="employee">موظف</option>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الموظف</TableHead>
                <TableHead>الموظف</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead>الراتب</TableHead>
                <TableHead>تاريخ الإنضمام</TableHead>
                <TableHead>{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {employee.employeeId}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {employee.name.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium">{employee.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.phone || 'غير متوفر'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(employee.role)}`}>
                      {getRoleText(employee.role)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {employee.salary ? (
                      <span className="text-green-600 font-medium">
                        {employee.salary.baseSalary.toLocaleString()} ريال
                      </span>
                    ) : (
                      <span className="text-gray-400">غير محدد</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(employee.createdAt).toLocaleDateString('ar-SA')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={SettingsIcon}
                        onClick={() => handleEditPermissions(employee)}
                        title="إدارة الصلاحيات"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={DollarSign}
                        onClick={() => handleEditSalary(employee)}
                        title="إدارة الراتب"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Edit}
                        onClick={() => handleEditEmployee(employee)}
                        title="تعديل البيانات"
                      />
                      {employee.id !== user?.id && (
                        <Button
                          size="sm"
                          variant="danger"
                          icon={Trash2}
                          onClick={() => handleDeleteEmployee(employee.id)}
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              لا توجد موظفين متاحين
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmployee ? 'تعديل الموظف' : 'إضافة موظف جديد'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الاسم الكامل
            </label>
            <Input
              type="text"
              value={employeeForm.name}
              onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <Input
                type="email"
                value={employeeForm.email}
                onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف
              </label>
              <Input
                type="tel"
                value={employeeForm.phone}
                onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <Input
                type="password"
                value={employeeForm.password}
                onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })}
                placeholder={editingEmployee ? 'اتركها فارغة للاحتفاظ بالحالية' : ''}
                required={!editingEmployee}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الدور الوظيفي
              </label>
              <Select
                value={employeeForm.role}
                onChange={(e) => {
                  const newRole = e.target.value as 'admin' | 'employee';
                  setEmployeeForm({ 
                    ...employeeForm, 
                    role: newRole,
                    permissions: getDefaultPermissions(newRole)
                  });
                }}
              >
                <option value="employee">موظف</option>
                <option value="admin">مدير</option>
              </Select>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">صلاحيات الأدوار:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>مدير:</strong> جميع الصلاحيات</p>
              <p><strong>موظف:</strong> صلاحيات محدودة (يمكن تخصيصها)</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              {t('cancel')}
            </Button>
            <Button type="submit">
              {t('save')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Permissions Modal */}
      <Modal
        isOpen={isPermissionsModalOpen}
        onClose={() => setIsPermissionsModalOpen(false)}
        title={`إدارة صلاحيات: ${editingPermissions?.name}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(permissionsForm).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setPermissionsForm(prev => ({
                    ...prev,
                    [key]: e.target.checked
                  }))}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {getPermissionLabel(key)}
                </span>
              </label>
            ))}
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsPermissionsModalOpen(false)}
            >
              إلغاء
            </Button>
            <Button onClick={handleSavePermissions}>
              حفظ الصلاحيات
            </Button>
          </div>
        </div>
      </Modal>

      {/* Salary Modal */}
      <Modal
        isOpen={isSalaryModalOpen}
        onClose={() => setIsSalaryModalOpen(false)}
        title={`إدارة راتب: ${editingSalary?.name}`}
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الراتب الأساسي (ريال)
            </label>
            <Input
              type="number"
              value={salaryForm.baseSalary}
              onChange={(e) => setSalaryForm(prev => ({
                ...prev,
                baseSalary: parseFloat(e.target.value) || 0
              }))}
              placeholder="5000"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                البدلات والمكافآت
              </label>
              <Button
                type="button"
                size="sm"
                onClick={addAllowance}
              >
                إضافة بدل
              </Button>
            </div>
            
            <div className="space-y-3">
              {salaryForm.allowances.map((allowance) => (
                <div key={allowance.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Input
                    type="text"
                    value={allowance.name}
                    onChange={(e) => updateAllowance(allowance.id, 'name', e.target.value)}
                    placeholder="اسم البدل"
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={allowance.amount}
                    onChange={(e) => updateAllowance(allowance.id, 'amount', parseFloat(e.target.value) || 0)}
                    placeholder="المبلغ"
                    className="w-24"
                  />
                  <Select
                    value={allowance.type}
                    onChange={(e) => updateAllowance(allowance.id, 'type', e.target.value)}
                    className="w-24"
                  >
                    <option value="fixed">ثابت</option>
                    <option value="percentage">نسبة</option>
                  </Select>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => removeAllowance(allowance.id)}
                  >
                    حذف
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نسبة من صافي الربح (%)
            </label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={salaryForm.profitPercentage}
              onChange={(e) => setSalaryForm(prev => ({
                ...prev,
                profitPercentage: parseFloat(e.target.value) || 0
              }))}
              placeholder="5"
            />
            <p className="text-sm text-gray-500 mt-1">
              سيتم إضافة هذه النسبة من صافي الربح الشهري إلى الراتب
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">ملخص الراتب:</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>الراتب الأساسي: {salaryForm.baseSalary.toLocaleString()} ريال</p>
              <p>إجمالي البدلات: {salaryForm.allowances.reduce((sum, a) => sum + a.amount, 0).toLocaleString()} ريال</p>
              <p>نسبة الربح: {salaryForm.profitPercentage}%</p>
              <p className="font-bold border-t pt-1">
                الراتب الثابت: {(salaryForm.baseSalary + salaryForm.allowances.reduce((sum, a) => sum + a.amount, 0)).toLocaleString()} ريال
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsSalaryModalOpen(false)}
            >
              إلغاء
            </Button>
            <Button onClick={handleSaveSalary}>
              حفظ الراتب
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

function getPermissionLabel(key: string): string {
  const labels: Record<string, string> = {
    customers: 'العملاء',
    serviceOrders: 'طلبات الصيانة',
    inventory: 'المخزون',
    invoices: 'الفواتير',
    expenses: 'المصروفات',
    reports: 'التقارير',
    employees: 'الموظفين',
    settings: 'الإعدادات',
    financialReports: 'التقارير المالية',
    profitAnalysis: 'تحليل الأرباح',
    payroll: 'الرواتب',
    workshopRent: 'إيجار الورشة'
  };
  return labels[key] || key;
}

export default Employees;