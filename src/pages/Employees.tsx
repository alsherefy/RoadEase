import React, { useState } from 'react';
import { Plus, Edit, Trash2, User, Shield, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { User as UserType } from '../types';
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
  const [editingEmployee, setEditingEmployee] = useState<UserType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee' as 'manager' | 'employee' | 'technician',
    phone: ''
  });

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
      phone: ''
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
      phone: employee.phone || ''
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
              ...(employeeForm.password && { password: employeeForm.password })
            }
          : emp
      );
      setEmployees(updatedEmployees);
      localStorage.setItem('roadease_users', JSON.stringify(updatedEmployees));
    } else {
      const newEmployee: UserType = {
        id: Math.random().toString(36).substr(2, 9),
        name: employeeForm.name,
        email: employeeForm.email,
        role: employeeForm.role,
        phone: employeeForm.phone,
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

  const getRoleText = (role: string) => {
    switch (role) {
      case 'manager': return 'مدير';
      case 'employee': return 'موظف';
      case 'technician': return 'فني';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager': return 'bg-red-100 text-red-800';
      case 'employee': return 'bg-blue-100 text-blue-800';
      case 'technician': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Only managers can access this page
  if (user?.role !== 'manager') {
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
                  {employees.filter(emp => emp.role === 'manager').length}
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
                <p className="text-sm font-medium text-gray-600">الفنيين</p>
                <p className="text-2xl font-bold text-green-600">
                  {employees.filter(emp => emp.role === 'technician').length}
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
                <option value="manager">مدير</option>
                <option value="employee">موظف</option>
                <option value="technician">فني</option>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الموظف</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead>تاريخ الإنضمام</TableHead>
                <TableHead>{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
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
                    {new Date(employee.createdAt).toLocaleDateString('ar-SA')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Edit}
                        onClick={() => handleEditEmployee(employee)}
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
                onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value as 'manager' | 'employee' | 'technician' })}
              >
                <option value="employee">موظف</option>
                <option value="technician">فني</option>
                <option value="manager">مدير</option>
              </Select>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">صلاحيات الأدوار:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>مدير:</strong> جميع الصلاحيات</p>
              <p><strong>موظف:</strong> العملاء، الطلبات، المخزون، الفواتير</p>
              <p><strong>فني:</strong> لوحة التحكم، طلبات الصيانة</p>
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
    </div>
  );
};

export default Employees;