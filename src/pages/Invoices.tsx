import React, { useState } from 'react';
import { Plus, Edit, Trash2, Download, Eye, Send, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Invoice } from '../types';
import { Card, CardHeader, CardContent, CardTitle } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/UI/Table';
import { generateInvoicePDF } from '../utils/pdfGenerator';

const Invoices: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { 
    invoices, 
    customers, 
    serviceOrders,
    inventory,
    addInvoice, 
    updateInvoice,
    settings 
  } = useApp();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  
  const [invoiceForm, setInvoiceForm] = useState({
    customerId: '',
    serviceOrderId: '',
    items: [] as { description: string; quantity: number; unitPrice: number; total: number }[],
    subtotal: 0,
    discount: 0,
    discountAmount: 0,
    vatAmount: 0,
    totalAmount: 0,
    paymentStatus: 'unpaid' as 'paid' | 'partial' | 'unpaid',
    paymentMethod: 'cash' as 'cash' | 'mada' | 'visa',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  });

  const filteredInvoices = invoices.filter(invoice => {
    const customer = customers.find(c => c.id === invoice.customerId);
    
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.paymentStatus === statusFilter;
    const matchesPayment = paymentFilter === 'all' || invoice.paymentMethod === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const totalRevenue = filteredInvoices
    .filter(inv => inv.paymentStatus === 'paid')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const resetForm = () => {
    setInvoiceForm({
      customerId: '',
      serviceOrderId: '',
      items: [],
      subtotal: 0,
      discount: 0,
      discountAmount: 0,
      vatAmount: 0,
      totalAmount: 0,
      paymentStatus: 'unpaid',
      paymentMethod: 'cash',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: ''
    });
  };

  const calculateTotals = () => {
    const subtotal = invoiceForm.items.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = subtotal * (invoiceForm.discount / 100);
    const afterDiscount = subtotal - discountAmount;
    const vatAmount = afterDiscount * settings.vatRate;
    const totalAmount = afterDiscount + vatAmount;

    setInvoiceForm(prev => ({
      ...prev,
      subtotal,
      discountAmount,
      vatAmount,
      totalAmount
    }));
  };

  const handleAddInvoice = () => {
    setEditingInvoice(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setInvoiceForm({
      customerId: invoice.customerId,
      serviceOrderId: invoice.serviceOrderId || '',
      items: invoice.items,
      subtotal: invoice.subtotal,
      discount: invoice.discount || 0,
      discountAmount: invoice.discountAmount || 0,
      vatAmount: invoice.vatAmount,
      totalAmount: invoice.totalAmount,
      paymentStatus: invoice.paymentStatus,
      paymentMethod: invoice.paymentMethod || 'cash',
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      notes: invoice.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const customer = customers.find(c => c.id === invoiceForm.customerId);
    if (!customer) return;

    if (editingInvoice) {
      updateInvoice(editingInvoice.id, {
        customerId: invoiceForm.customerId,
        customerName: customer.name,
        serviceOrderId: invoiceForm.serviceOrderId,
        items: invoiceForm.items,
        subtotal: invoiceForm.subtotal,
        discount: invoiceForm.discount,
        discountAmount: invoiceForm.discountAmount,
        vatAmount: invoiceForm.vatAmount,
        totalAmount: invoiceForm.totalAmount,
        paymentStatus: invoiceForm.paymentStatus,
        paymentMethod: invoiceForm.paymentMethod,
        issueDate: invoiceForm.issueDate,
        dueDate: invoiceForm.dueDate,
        notes: invoiceForm.notes
      });
    } else {
      addInvoice({
        invoiceNumber: `INV-${Date.now()}`,
        customerId: invoiceForm.customerId,
        customerName: customer.name,
        serviceOrderId: invoiceForm.serviceOrderId,
        items: invoiceForm.items,
        subtotal: invoiceForm.subtotal,
        discount: invoiceForm.discount,
        discountAmount: invoiceForm.discountAmount,
        vatAmount: invoiceForm.vatAmount,
        totalAmount: invoiceForm.totalAmount,
        paymentStatus: invoiceForm.paymentStatus,
        paymentMethod: invoiceForm.paymentMethod,
        status: 'pending',
        issueDate: invoiceForm.issueDate,
        dueDate: invoiceForm.dueDate,
        notes: invoiceForm.notes
      });
    }
    
    setIsModalOpen(false);
    resetForm();
    setEditingInvoice(null);
  };

  const addItem = () => {
    setInvoiceForm(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...invoiceForm.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    
    setInvoiceForm(prev => ({ ...prev, items: updatedItems }));
    setTimeout(calculateTotals, 0);
  };

  const removeItem = (index: number) => {
    setInvoiceForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
    setTimeout(calculateTotals, 0);
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    const customer = customers.find(c => c.id === invoice.customerId);
    if (customer) {
      generateInvoicePDF(invoice, customer, settings);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'partial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unpaid': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'مدفوع';
      case 'partial': return 'جزئي';
      case 'unpaid': return 'غير مدفوع';
      default: return status;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="h-4 w-4" />;
      case 'mada': return <CreditCard className="h-4 w-4" />;
      case 'visa': return <CreditCard className="h-4 w-4" />;
      default: return <Banknote className="h-4 w-4" />;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'نقداً';
      case 'mada': return 'بطاقة مدى';
      case 'visa': return 'فيزا';
      default: return 'نقداً';
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'bg-green-100 text-green-800';
      case 'mada': return 'bg-blue-100 text-blue-800';
      case 'visa': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('invoices')}</h1>
            <p className="text-blue-100 text-lg">إدارة الفواتير وطرق الدفع</p>
          </div>
          <Button 
            icon={Plus} 
            onClick={handleAddInvoice}
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            {t('addInvoice')}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">إجمالي الإيرادات</p>
                <p className="text-3xl font-bold text-green-800">
                  {totalRevenue.toLocaleString()} {settings.currency}
                </p>
              </div>
              <div className="bg-green-500 p-3 rounded-full shadow-lg">
                <Download className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">عدد الفواتير</p>
                <p className="text-3xl font-bold text-blue-800">{filteredInvoices.length}</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-full shadow-lg">
                <Eye className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 mb-1">فواتير معلقة</p>
                <p className="text-3xl font-bold text-yellow-800">
                  {filteredInvoices.filter(inv => inv.paymentStatus === 'unpaid').length}
                </p>
              </div>
              <div className="bg-yellow-500 p-3 rounded-full shadow-lg">
                <Send className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">متوسط الفاتورة</p>
                <p className="text-3xl font-bold text-purple-800">
                  {filteredInvoices.length > 0 ? 
                    Math.round(totalRevenue / filteredInvoices.filter(inv => inv.paymentStatus === 'paid').length || 1).toLocaleString() : 0
                  } {settings.currency}
                </p>
              </div>
              <div className="bg-purple-500 p-3 rounded-full shadow-lg">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-800">قائمة الفواتير</CardTitle>
            <div className="flex space-x-4">
              <div className="w-64">
                <Input
                  type="text"
                  placeholder="البحث في الفواتير..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">جميع الحالات</option>
                <option value="paid">مدفوع</option>
                <option value="partial">جزئي</option>
                <option value="unpaid">غير مدفوع</option>
              </Select>
              <Select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="all">جميع طرق الدفع</option>
                <option value="cash">نقداً</option>
                <option value="mada">بطاقة مدى</option>
                <option value="visa">فيزا</option>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الفاتورة</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>طريقة الدفع</TableHead>
                <TableHead>حالة الدفع</TableHead>
                <TableHead>تاريخ الإصدار</TableHead>
                <TableHead>تاريخ الاستحقاق</TableHead>
                <TableHead>{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => {
                const customer = customers.find(c => c.id === invoice.customerId);
                
                return (
                  <TableRow key={invoice.id} className="hover:bg-gray-50">
                    <TableCell>
                      <code className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">
                        {invoice.invoiceNumber}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {customer?.name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium">{customer?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-green-600 text-lg">
                        {invoice.totalAmount.toLocaleString()} {settings.currency}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getPaymentMethodColor(invoice.paymentMethod || 'cash')}`}>
                        {getPaymentMethodIcon(invoice.paymentMethod || 'cash')}
                        <span>{getPaymentMethodText(invoice.paymentMethod || 'cash')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(invoice.paymentStatus)}`}>
                        {getStatusText(invoice.paymentStatus)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.issueDate).toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.dueDate).toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={Download}
                          onClick={() => handleDownloadPDF(invoice)}
                          title="تحميل PDF"
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={Edit}
                          onClick={() => handleEditInvoice(invoice)}
                          title="تعديل"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">لا توجد فواتير متاحة</p>
              <p className="text-sm">ابدأ بإنشاء فاتورة جديدة</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingInvoice ? 'تعديل الفاتورة' : t('addInvoice')}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer and Service Order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('customer')}
              </label>
              <Select
                value={invoiceForm.customerId}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, customerId: e.target.value })}
                required
              >
                <option value="">اختر العميل</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                طلب الصيانة (اختياري)
              </label>
              <Select
                value={invoiceForm.serviceOrderId}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, serviceOrderId: e.target.value })}
              >
                <option value="">بدون طلب صيانة</option>
                {serviceOrders
                  .filter(order => order.customerId === invoiceForm.customerId)
                  .map(order => (
                    <option key={order.id} value={order.id}>
                      {order.description}
                    </option>
                  ))}
              </Select>
            </div>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                طريقة الدفع
              </label>
              <Select
                value={invoiceForm.paymentMethod}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, paymentMethod: e.target.value as 'cash' | 'mada' | 'visa' })}
              >
                <option value="cash">نقداً</option>
                <option value="mada">بطاقة مدى</option>
                <option value="visa">فيزا</option>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حالة الدفع
              </label>
              <Select
                value={invoiceForm.paymentStatus}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, paymentStatus: e.target.value as 'paid' | 'partial' | 'unpaid' })}
              >
                <option value="unpaid">غير مدفوع</option>
                <option value="partial">جزئي</option>
                <option value="paid">مدفوع</option>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نسبة الخصم (%)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={invoiceForm.discount}
                onChange={(e) => {
                  setInvoiceForm({ ...invoiceForm, discount: parseFloat(e.target.value) || 0 });
                  setTimeout(calculateTotals, 0);
                }}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ الإصدار
              </label>
              <Input
                type="date"
                value={invoiceForm.issueDate}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, issueDate: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ الاستحقاق
              </label>
              <Input
                type="date"
                value={invoiceForm.dueDate}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                بنود الفاتورة
              </label>
              <Button
                type="button"
                size="sm"
                onClick={addItem}
              >
                إضافة بند
              </Button>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {invoiceForm.items.map((item, index) => (
                <div key={index} className="grid grid-cols-5 gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <Input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="وصف البند"
                    required
                  />
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    placeholder="الكمية"
                    required
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    placeholder="السعر"
                    required
                  />
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {item.total.toFixed(2)} ريال
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => removeItem(index)}
                  >
                    حذف
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span>{invoiceForm.subtotal.toFixed(2)} {settings.currency}</span>
              </div>
              <div className="flex justify-between">
                <span>الخصم ({invoiceForm.discount}%):</span>
                <span>-{invoiceForm.discountAmount.toFixed(2)} {settings.currency}</span>
              </div>
              <div className="flex justify-between">
                <span>ضريبة القيمة المضافة ({(settings.vatRate * 100).toFixed(1)}%):</span>
                <span>{invoiceForm.vatAmount.toFixed(2)} {settings.currency}</span>
              </div>
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>المجموع الكلي:</span>
                <span className="text-green-600">{invoiceForm.totalAmount.toFixed(2)} {settings.currency}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات
            </label>
            <textarea
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              rows={3}
              value={invoiceForm.notes}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
              placeholder="ملاحظات إضافية..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
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

export default Invoices;