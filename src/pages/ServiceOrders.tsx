import React, { useState } from 'react';
import { Plus, Edit, Trash2, User, Car, Clock, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { ServiceOrder } from '../types';
import { Card, CardHeader, CardContent, CardTitle } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/UI/Table';

const ServiceOrders: React.FC = () => {
  const { t } = useLanguage();
  const { 
    serviceOrders, 
    customers, 
    inventory,
    addInvoice,
    addServiceOrder, 
    updateServiceOrder, 
    deleteServiceOrder 
  } = useApp();
  const { user } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null);
  const [completingOrder, setCompletingOrder] = useState<ServiceOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  
  const [orderForm, setOrderForm] = useState({
    customerId: '',
    carId: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignedTechnician: '',
    laborCost: 0,
    notes: '',
    partsUsed: [] as { itemId: string; quantity: number; unitPrice: number }[]
  });

  const filteredOrders = serviceOrders.filter(order => {
    const customer = customers.find(c => c.id === order.customerId);
    const car = customer?.cars.find(c => c.id === order.carId);
    
    const matchesSearch = searchTerm === '' || 
                         order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer?.phone.includes(searchTerm) ||
                         car?.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         car?.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         car?.plateNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const resetForm = () => {
    setOrderForm({
      customerId: '',
      carId: '',
      description: '',
      priority: 'medium',
      assignedTechnician: '',
      laborCost: 0,
      notes: '',
      partsUsed: []
    });
    setCustomerSearchTerm('');
    setShowCustomerDropdown(false);
  };

  const handleAddOrder = () => {
    setEditingOrder(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditOrder = (order: ServiceOrder) => {
    setEditingOrder(order);
    const customer = customers.find(c => c.id === order.customerId);
    setCustomerSearchTerm(customer?.name || '');
    setOrderForm({
      customerId: order.customerId,
      carId: order.carId,
      description: order.description,
      priority: order.priority,
      assignedTechnician: order.assignedTechnician || '',
      laborCost: order.laborCost,
      notes: order.notes || '',
      partsUsed: order.partsUsed
    });
    setIsModalOpen(true);
  };

  const handleDeleteOrder = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      deleteServiceOrder(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingOrder) {
      updateServiceOrder(editingOrder.id, {
        customerId: orderForm.customerId,
        carId: orderForm.carId,
        description: orderForm.description,
        priority: orderForm.priority,
        assignedTechnician: orderForm.assignedTechnician,
        laborCost: orderForm.laborCost,
        notes: orderForm.notes,
        partsUsed: orderForm.partsUsed
      });
    } else {
      addServiceOrder({
        customerId: orderForm.customerId,
        carId: orderForm.carId,
        description: orderForm.description,
        status: 'open',
        priority: orderForm.priority,
        assignedTechnician: orderForm.assignedTechnician,
        laborCost: orderForm.laborCost,
        notes: orderForm.notes,
        partsUsed: orderForm.partsUsed
      });
    }
    
    setIsModalOpen(false);
    resetForm();
    setEditingOrder(null);
  };

  const handleCompleteOrder = (order: ServiceOrder) => {
    setCompletingOrder(order);
    setIsCompleteModalOpen(true);
  };

  const handleConfirmComplete = () => {
    if (!completingOrder) return;

    // Update order status to completed
    updateServiceOrder(completingOrder.id, {
      status: 'completed',
      actualCompletion: new Date()
    });

    // Create invoice automatically
    const customer = customers.find(c => c.id === completingOrder.customerId);
    if (customer) {
      const invoiceItems = [
        {
          description: completingOrder.description,
          quantity: 1,
          unitPrice: completingOrder.laborCost,
          total: completingOrder.laborCost
        },
        ...completingOrder.partsUsed.map(part => {
          const inventoryItem = inventory.find(item => item.id === part.itemId);
          return {
            description: inventoryItem?.name || 'قطعة غيار',
            quantity: part.quantity,
            unitPrice: part.unitPrice,
            total: part.quantity * part.unitPrice
          };
        })
      ];

      const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
      const vatAmount = subtotal * 0.15;
      const totalAmount = subtotal + vatAmount;

      addInvoice({
        invoiceNumber: `INV-${Date.now()}`,
        customerId: completingOrder.customerId,
        customerName: customer.name,
        serviceOrderId: completingOrder.id,
        items: invoiceItems,
        subtotal,
        discount: 0,
        discountAmount: 0,
        vatAmount,
        totalAmount,
        paymentStatus: 'unpaid',
        paymentMethod: 'cash',
        status: 'pending',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: `فاتورة طلب الصيانة رقم: ${completingOrder.id}`
      });

      alert('تم إقفال الطلب وإنشاء الفاتورة بنجاح!');
    }

    setIsCompleteModalOpen(false);
    setCompletingOrder(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'مفتوح';
      case 'in_progress': return 'تحت التنفيذ';
      case 'completed': return 'مكتمل';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const selectedCustomer = customers.find(c => c.id === orderForm.customerId);
  const availableCars = selectedCustomer?.cars || [];
  
  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.phone.includes(customerSearchTerm)
  );
  
  const handleCustomerSelect = (customer: any) => {
    setOrderForm({ ...orderForm, customerId: customer.id, carId: '' });
    setCustomerSearchTerm(customer.name);
    setShowCustomerDropdown(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('serviceOrders')}</h1>
        <Button icon={Plus} onClick={handleAddOrder}>
          {t('addServiceOrder')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>طلبات الصيانة</CardTitle>
            <div className="flex space-x-4">
              <div className="w-64">
                <Input
                  type="text"
                  placeholder="البحث باسم العميل، الجوال، الوصف، أو السيارة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">جميع الحالات</option>
                <option value="open">مفتوح</option>
                <option value="in_progress">تحت التنفيذ</option>
                <option value="completed">مكتمل</option>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الوصف</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>السيارة</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الأولوية</TableHead>
                <TableHead>الفني</TableHead>
                <TableHead>التكلفة</TableHead>
                <TableHead>{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const customer = customers.find(c => c.id === order.customerId);
                const car = customer?.cars.find(c => c.id === order.carId);
                
                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{customer?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4 text-gray-400" />
                        <span>{car?.make} {car?.model}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <AlertCircle className={`h-4 w-4 ${getPriorityColor(order.priority)}`} />
                        <span className={getPriorityColor(order.priority)}>
                          {order.priority === 'high' ? 'عالي' : 
                           order.priority === 'medium' ? 'متوسط' : 'منخفض'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{order.assignedTechnician || 'غير محدد'}</TableCell>
                    <TableCell>{order.laborCost} ريال</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {order.status !== 'completed' && (
                          <Button
                            size="sm"
                            variant="success"
                            icon={CheckCircle}
                            onClick={() => handleCompleteOrder(order)}
                            title="إقفال الطلب"
                          />
                        )}
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={Edit}
                          onClick={() => handleEditOrder(order)}
                        />
                        <Button
                          size="sm"
                          variant="danger"
                          icon={Trash2}
                          onClick={() => handleDeleteOrder(order.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              لا توجد طلبات صيانة متاحة
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOrder ? 'تعديل طلب الصيانة' : t('addServiceOrder')}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('customer')}
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={customerSearchTerm}
                  onChange={(e) => {
                    setCustomerSearchTerm(e.target.value);
                    setShowCustomerDropdown(true);
                    if (e.target.value === '') {
                      setOrderForm({ ...orderForm, customerId: '', carId: '' });
                    }
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  placeholder="ابحث عن العميل بالاسم أو رقم الجوال..."
                  required
                />
                
                {showCustomerDropdown && customerSearchTerm && filteredCustomers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredCustomers.slice(0, 10).map(customer => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => handleCustomerSelect(customer)}
                        className="w-full px-4 py-2 text-right hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{customer.name}</p>
                          <p className="text-sm text-gray-600">{customer.phone}</p>
                          {customer.email && (
                            <p className="text-xs text-gray-500">{customer.email}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {showCustomerDropdown && customerSearchTerm && filteredCustomers.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
                    <p className="text-gray-500 text-center">لا توجد نتائج</p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('car')}
              </label>
              <Select
                value={orderForm.carId}
                onChange={(e) => setOrderForm({ ...orderForm, carId: e.target.value })}
                required
                disabled={!orderForm.customerId}
              >
                <option value="">اختر السيارة</option>
                {availableCars.map(car => (
                  <option key={car.id} value={car.id}>
                    {car.make} {car.model} - {car.plateNumber}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('description')}
            </label>
            <Input
              type="text"
              value={orderForm.description}
              onChange={(e) => setOrderForm({ ...orderForm, description: e.target.value })}
              placeholder="وصف العمل المطلوب"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('priority')}
              </label>
              <Select
                value={orderForm.priority}
                onChange={(e) => setOrderForm({ ...orderForm, priority: e.target.value as 'low' | 'medium' | 'high' })}
              >
                <option value="low">منخفض</option>
                <option value="medium">متوسط</option>
                <option value="high">عالي</option>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('assignedTechnician')}
              </label>
              <Input
                type="text"
                value={orderForm.assignedTechnician}
                onChange={(e) => setOrderForm({ ...orderForm, assignedTechnician: e.target.value })}
                placeholder="اسم الفني المسؤول"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('laborCost')}
            </label>
            <Input
              type="number"
              value={orderForm.laborCost}
              onChange={(e) => setOrderForm({ ...orderForm, laborCost: parseFloat(e.target.value) || 0 })}
              placeholder="تكلفة العمالة بالريال"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('notes')}
            </label>
            <textarea
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              rows={3}
              value={orderForm.notes}
              onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
              placeholder="ملاحظات إضافية"
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

      {/* Complete Order Modal */}
      <Modal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        title="إقفال طلب الصيانة"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">تأكيد إقفال الطلب</h4>
            <p className="text-blue-800 text-sm">
              سيتم إقفال طلب الصيانة وإنشاء فاتورة تلقائياً للعميل
            </p>
          </div>

          {completingOrder && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-2">تفاصيل الطلب:</h5>
              <p className="text-sm text-gray-600 mb-1">
                <strong>الوصف:</strong> {completingOrder.description}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <strong>تكلفة العمالة:</strong> {completingOrder.laborCost} ريال
              </p>
              <p className="text-sm text-gray-600">
                <strong>القطع المستخدمة:</strong> {completingOrder.partsUsed.length} قطعة
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCompleteModalOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              variant="success"
              icon={CheckCircle}
              onClick={handleConfirmComplete}
            >
              تأكيد الإقفال
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ServiceOrders;