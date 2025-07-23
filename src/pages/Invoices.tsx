import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Eye, Edit, Trash2, Download, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import Modal from '../components/UI/Modal';
import Table from '../components/UI/Table';
import { Invoice, Customer, ServiceOrder, InventoryItem } from '../types';
import { generateInvoicePDF } from '../utils/pdfGenerator';

const Invoices: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');

  const [formData, setFormData] = useState({
    customerId: '',
    serviceOrderId: '',
    items: [] as { itemId: string; quantity: number; price: number }[],
    subtotal: 0,
    tax: 0,
    total: 0,
    status: 'draft' as 'draft' | 'sent' | 'paid' | 'overdue',
    paymentMethod: 'cash' as 'cash' | 'mada' | 'visa',
    dueDate: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load invoices from localStorage
    const savedInvoices = localStorage.getItem('invoices');
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    }

    // Load customers from localStorage
    const savedCustomers = localStorage.getItem('customers');
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    }

    // Load service orders from localStorage
    const savedServiceOrders = localStorage.getItem('serviceOrders');
    if (savedServiceOrders) {
      setServiceOrders(JSON.parse(savedServiceOrders));
    }

    // Load inventory from localStorage
    const savedInventory = localStorage.getItem('inventory');
    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    }
  };

  const saveInvoices = (updatedInvoices: Invoice[]) => {
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
    setInvoices(updatedInvoices);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const customer = customers.find(c => c.id === formData.customerId);
    const serviceOrder = serviceOrders.find(so => so.id === formData.serviceOrderId);
    
    if (!customer) return;

    const invoiceData: Invoice = {
      id: editingInvoice?.id || Date.now().toString(),
      invoiceNumber: editingInvoice?.invoiceNumber || `INV-${Date.now()}`,
      customerId: formData.customerId,
      customerName: customer.name,
      serviceOrderId: formData.serviceOrderId,
      serviceOrderNumber: serviceOrder?.orderNumber || '',
      items: formData.items,
      subtotal: formData.subtotal,
      tax: formData.tax,
      total: formData.total,
      status: formData.status,
      paymentMethod: formData.paymentMethod,
      issueDate: editingInvoice?.issueDate || new Date().toISOString().split('T')[0],
      dueDate: formData.dueDate,
      notes: formData.notes,
      createdBy: user?.name || '',
      createdAt: editingInvoice?.createdAt || new Date().toISOString()
    };

    if (editingInvoice) {
      const updatedInvoices = invoices.map(inv => 
        inv.id === editingInvoice.id ? invoiceData : inv
      );
      saveInvoices(updatedInvoices);
    } else {
      saveInvoices([...invoices, invoiceData]);
    }

    resetForm();
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      serviceOrderId: '',
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      status: 'draft',
      paymentMethod: 'cash',
      dueDate: '',
      notes: ''
    });
    setEditingInvoice(null);
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      customerId: invoice.customerId,
      serviceOrderId: invoice.serviceOrderId || '',
      items: invoice.items,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      status: invoice.status,
      paymentMethod: invoice.paymentMethod,
      dueDate: invoice.dueDate,
      notes: invoice.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('confirmDelete'))) {
      const updatedInvoices = invoices.filter(inv => inv.id !== id);
      saveInvoices(updatedInvoices);
    }
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    const customer = customers.find(c => c.id === invoice.customerId);
    if (customer) {
      generateInvoicePDF(invoice, customer);
    }
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const tax = subtotal * 0.15; // 15% VAT
    const total = subtotal + tax;
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      tax,
      total
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [formData.items]);

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { itemId: '', quantity: 1, price: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesPaymentMethod = paymentMethodFilter === 'all' || invoice.paymentMethod === paymentMethodFilter;
    
    return matchesSearch && matchesStatus && matchesPaymentMethod;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'sent': return 'text-blue-600 bg-blue-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="w-4 h-4" />;
      case 'mada': return <CreditCard className="w-4 h-4" />;
      case 'visa': return <Smartphone className="w-4 h-4" />;
      default: return <Banknote className="w-4 h-4" />;
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

  const columns = [
    { key: 'invoiceNumber', label: t('invoiceNumber') },
    { key: 'customerName', label: t('customer') },
    { key: 'total', label: t('total'), render: (value: number) => `${value.toFixed(2)} ${t('currency')}` },
    { 
      key: 'status', 
      label: t('status'), 
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {t(value)}
        </span>
      )
    },
    { 
      key: 'paymentMethod', 
      label: 'طريقة الدفع', 
      render: (value: string) => (
        <div className="flex items-center gap-2">
          {getPaymentMethodIcon(value)}
          <span className="text-sm">{getPaymentMethodText(value)}</span>
        </div>
      )
    },
    { key: 'issueDate', label: t('issueDate') },
    { key: 'dueDate', label: t('dueDate') }
  ];

  const actions = [
    {
      label: t('view'),
      icon: Eye,
      onClick: (invoice: Invoice) => handleDownloadPDF(invoice),
      className: 'text-blue-600 hover:text-blue-800'
    },
    {
      label: t('edit'),
      icon: Edit,
      onClick: (invoice: Invoice) => handleEdit(invoice),
      className: 'text-green-600 hover:text-green-800'
    },
    {
      label: t('download'),
      icon: Download,
      onClick: (invoice: Invoice) => handleDownloadPDF(invoice),
      className: 'text-purple-600 hover:text-purple-800'
    },
    {
      label: t('delete'),
      icon: Trash2,
      onClick: (invoice: Invoice) => handleDelete(invoice.id),
      className: 'text-red-600 hover:text-red-800'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            {t('invoices')}
          </h1>
          <p className="text-gray-600 mt-1">إدارة الفواتير وطرق الدفع</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('addInvoice')}
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6 bg-gradient-to-r from-gray-50 to-white border-l-4 border-orange-500 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={t('searchInvoices')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
          >
            <option value="all">{t('allStatuses')}</option>
            <option value="draft">{t('draft')}</option>
            <option value="sent">{t('sent')}</option>
            <option value="paid">{t('paid')}</option>
            <option value="overdue">{t('overdue')}</option>
          </Select>
          <Select
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
            className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
          >
            <option value="all">جميع طرق الدفع</option>
            <option value="cash">نقداً</option>
            <option value="mada">بطاقة مدى</option>
            <option value="visa">فيزا</option>
          </Select>
        </div>
      </Card>

      {/* Invoices Table */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">قائمة الفواتير</h2>
          </div>
        </div>
        <div className="p-6">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">لا توجد فواتير</p>
              <p className="text-gray-400 mt-2">ابدأ بإنشاء فاتورة جديدة</p>
            </div>
          ) : (
            <Table
              data={filteredInvoices}
              columns={columns}
              actions={actions}
            />
          )}
        </div>
      </Card>

      {/* Invoice Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingInvoice ? t('editInvoice') : t('addInvoice')}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('customer')} *
              </label>
              <Select
                value={formData.customerId}
                onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                required
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              >
                <option value="">{t('selectCustomer')}</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('serviceOrder')}
              </label>
              <Select
                value={formData.serviceOrderId}
                onChange={(e) => setFormData(prev => ({ ...prev, serviceOrderId: e.target.value }))}
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              >
                <option value="">{t('selectServiceOrder')}</option>
                {serviceOrders
                  .filter(so => so.customerId === formData.customerId)
                  .map(serviceOrder => (
                    <option key={serviceOrder.id} value={serviceOrder.id}>
                      {serviceOrder.orderNumber}
                    </option>
                  ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('status')} *
              </label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                required
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              >
                <option value="draft">{t('draft')}</option>
                <option value="sent">{t('sent')}</option>
                <option value="paid">{t('paid')}</option>
                <option value="overdue">{t('overdue')}</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                طريقة الدفع *
              </label>
              <Select
                value={formData.paymentMethod}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                required
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              >
                <option value="cash">نقداً</option>
                <option value="mada">بطاقة مدى</option>
                <option value="visa">فيزا</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('dueDate')} *
              </label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                required
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Items Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">{t('items')}</h3>
              <Button
                type="button"
                onClick={addItem}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('addItem')}
              </Button>
            </div>

            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border rounded-lg bg-gray-50">
                <Select
                  value={item.itemId}
                  onChange={(e) => {
                    const selectedItem = inventory.find(inv => inv.id === e.target.value);
                    updateItem(index, 'itemId', e.target.value);
                    if (selectedItem) {
                      updateItem(index, 'price', selectedItem.price);
                    }
                  }}
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                >
                  <option value="">{t('selectItem')}</option>
                  {inventory.map(invItem => (
                    <option key={invItem.id} value={invItem.id}>
                      {invItem.name}
                    </option>
                  ))}
                </Select>

                <Input
                  type="number"
                  placeholder={t('quantity')}
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                  min="1"
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />

                <Input
                  type="number"
                  placeholder={t('price')}
                  value={item.price}
                  onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />

                <Button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{t('subtotal')}:</span>
                <span>{formData.subtotal.toFixed(2)} {t('currency')}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('tax')} (15%):</span>
                <span>{formData.tax.toFixed(2)} {t('currency')}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>{t('total')}:</span>
                <span>{formData.total.toFixed(2)} {t('currency')}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('notes')}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder={t('enterNotes')}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            >
              {editingInvoice ? t('updateInvoice') : t('createInvoice')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Invoices;