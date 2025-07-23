import React, { useState } from 'react';
import { Plus, Edit, Trash2, DollarSign, Calendar, Tag } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Expense } from '../types';
import { Card, CardHeader, CardContent, CardTitle } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/UI/Table';

const Expenses: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { expenses, addExpense, updateExpense, deleteExpense, settings } = useApp();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    category: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash' as 'cash' | 'card' | 'transfer',
    receipt: ''
  });

  const categories = [...new Set(expenses.map(expense => expense.category))];
  
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const expenseDate = new Date(expense.date);
      const today = new Date();
      
      switch (dateFilter) {
        case 'today':
          matchesDate = expenseDate.toDateString() === today.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = expenseDate >= weekAgo;
          break;
        case 'month':
          matchesDate = expenseDate.getMonth() === today.getMonth() && 
                       expenseDate.getFullYear() === today.getFullYear();
          break;
      }
    }
    
    return matchesSearch && matchesCategory && matchesDate;
  });

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const resetForm = () => {
    setExpenseForm({
      description: '',
      category: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      receipt: ''
    });
  };

  const handleAddExpense = () => {
    setEditingExpense(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      description: expense.description,
      category: expense.category,
      amount: expense.amount,
      date: new Date(expense.date).toISOString().split('T')[0],
      paymentMethod: expense.paymentMethod,
      receipt: expense.receipt || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
      deleteExpense(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingExpense) {
      updateExpense(editingExpense.id, {
        description: expenseForm.description,
        category: expenseForm.category,
        amount: expenseForm.amount,
        date: new Date(expenseForm.date),
        paymentMethod: expenseForm.paymentMethod,
        receipt: expenseForm.receipt
      });
    } else {
      addExpense({
        description: expenseForm.description,
        category: expenseForm.category,
        amount: expenseForm.amount,
        date: new Date(expenseForm.date),
        paymentMethod: expenseForm.paymentMethod,
        receipt: expenseForm.receipt,
        createdBy: user?.id || ''
      });
    }
    
    setIsModalOpen(false);
    resetForm();
    setEditingExpense(null);
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'نقداً';
      case 'card': return 'بطاقة';
      case 'transfer': return 'تحويل';
      default: return method;
    }
  };

  const expenseCategories = [
    'رواتب وأجور',
    'إيجار',
    'كهرباء وماء',
    'صيانة وإصلاحات',
    'قطع غيار',
    'وقود',
    'تأمين',
    'ضرائب ورسوم',
    'تسويق وإعلان',
    'مصاريف إدارية',
    'أخرى'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('expenses')}</h1>
        <Button icon={Plus} onClick={handleAddExpense}>
          {t('addExpense')}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">عدد المصروفات</p>
                <p className="text-2xl font-bold text-gray-900">{filteredExpenses.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Tag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">متوسط المصروف</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredExpenses.length > 0 ? 
                    Math.round(totalExpenses / filteredExpenses.length).toLocaleString() : 0
                  } {settings.currency}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>المصروفات</CardTitle>
            <div className="flex space-x-4">
              <div className="w-48">
                <Input
                  type="text"
                  placeholder="البحث في المصروفات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">جميع الفئات</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>
              <Select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">جميع التواريخ</option>
                <option value="today">اليوم</option>
                <option value="week">هذا الأسبوع</option>
                <option value="month">هذا الشهر</option>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الوصف</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>طريقة الدفع</TableHead>
                <TableHead>المسؤول</TableHead>
                <TableHead>{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      {expense.receipt && (
                        <p className="text-sm text-gray-500">إيصال: {expense.receipt}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                      {expense.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-red-600">
                      {expense.amount.toLocaleString()} {settings.currency}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(expense.date).toLocaleDateString('ar-SA')}
                  </TableCell>
                  <TableCell>
                    {getPaymentMethodText(expense.paymentMethod)}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{expense.createdBy}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Edit}
                        onClick={() => handleEditExpense(expense)}
                      />
                      <Button
                        size="sm"
                        variant="danger"
                        icon={Trash2}
                        onClick={() => handleDeleteExpense(expense.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredExpenses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              لا توجد مصروفات متاحة
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExpense ? 'تعديل المصروف' : t('addExpense')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('expenseDescription')}
            </label>
            <Input
              type="text"
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              placeholder="وصف المصروف"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('expenseCategory')}
              </label>
              <Select
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                required
              >
                <option value="">اختر الفئة</option>
                {expenseCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('amount')}
              </label>
              <Input
                type="number"
                step="0.01"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) || 0 })}
                placeholder="المبلغ بالريال"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('date')}
              </label>
              <Input
                type="date"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('paymentMethod')}
              </label>
              <Select
                value={expenseForm.paymentMethod}
                onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value as 'cash' | 'card' | 'transfer' })}
              >
                <option value="cash">نقداً</option>
                <option value="card">بطاقة</option>
                <option value="transfer">تحويل</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم الإيصال (اختياري)
            </label>
            <Input
              type="text"
              value={expenseForm.receipt}
              onChange={(e) => setExpenseForm({ ...expenseForm, receipt: e.target.value })}
              placeholder="رقم الإيصال أو المرجع"
            />
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

export default Expenses;