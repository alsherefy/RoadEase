import React, { useState } from 'react';
import { Plus, Edit, Trash2, Car, Phone, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import { Customer, Car as CarType } from '../types';
import { Card, CardHeader, CardContent, CardTitle } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/UI/Table';

const Customers: React.FC = () => {
  const { t } = useLanguage();
  const { 
    customers, 
    addCustomer, 
    updateCustomer, 
    deleteCustomer, 
    addCar,
    vehicleDatabase,
    addCustomVehicleMake,
    addCustomVehicleModel
  } = useApp();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCarModalOpen, setIsCarModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddNewMake, setShowAddNewMake] = useState(false);
  const [showAddNewModel, setShowAddNewModel] = useState(false);
  const [newMakeName, setNewMakeName] = useState('');
  const [newModelName, setNewModelName] = useState('');
  
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  
  const [carForm, setCarForm] = useState({
    make: '',
    makeId: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    plateNumber: '',
    chassisNumber: '',
    mileage: 0
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetCustomerForm = () => {
    setCustomerForm({
      name: '',
      phone: '',
      email: '',
      address: ''
    });
  };

  const resetCarForm = () => {
    setCarForm({
      make: '',
      makeId: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      plateNumber: '',
      chassisNumber: '',
      mileage: 0
    });
    setShowAddNewMake(false);
    setShowAddNewModel(false);
    setNewMakeName('');
    setNewModelName('');
  };

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    resetCustomerForm();
    setIsModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setCustomerForm({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteCustomer = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      deleteCustomer(id);
    }
  };

  const handleSubmitCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        name: customerForm.name,
        phone: customerForm.phone,
        email: customerForm.email,
        address: customerForm.address
      });
    } else {
      addCustomer({
        name: customerForm.name,
        phone: customerForm.phone,
        email: customerForm.email,
        address: customerForm.address,
        cars: []
      });
    }
    
    setIsModalOpen(false);
    resetCustomerForm();
    setEditingCustomer(null);
  };

  const handleAddCar = (customer: Customer) => {
    setSelectedCustomer(customer);
    resetCarForm();
    setIsCarModalOpen(true);
  };

  const handleSubmitCar = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedCustomer) {
      // If adding new make
      if (showAddNewMake && newMakeName) {
        addCustomVehicleMake(newMakeName);
        setCarForm(prev => ({ ...prev, make: newMakeName }));
      }
      
      // If adding new model
      if (showAddNewModel && newModelName && carForm.makeId) {
        addCustomVehicleModel(carForm.makeId, newModelName);
        setCarForm(prev => ({ ...prev, model: newModelName }));
      }
      
      addCar({
        customerId: selectedCustomer.id,
        make: carForm.make,
        model: carForm.model,
        year: carForm.year,
        color: carForm.color,
        plateNumber: carForm.plateNumber,
        chassisNumber: carForm.chassisNumber,
        mileage: carForm.mileage
      });
    }
    
    setIsCarModalOpen(false);
    resetCarForm();
    setSelectedCustomer(null);
  };

  const handleMakeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    if (value === 'add_new') {
      setShowAddNewMake(true);
      setCarForm(prev => ({ ...prev, make: '', makeId: '', model: '' }));
    } else if (value === '') {
      setCarForm(prev => ({ ...prev, make: '', makeId: '', model: '' }));
      setShowAddNewMake(false);
    } else {
      const selectedMake = vehicleDatabase.find(make => make.id === value);
      if (selectedMake) {
        setCarForm(prev => ({ 
          ...prev, 
          make: selectedMake.name, 
          makeId: selectedMake.id,
          model: '' 
        }));
        setShowAddNewMake(false);
      }
    }
    setShowAddNewModel(false);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    if (value === 'add_new') {
      setShowAddNewModel(true);
      setCarForm(prev => ({ ...prev, model: '' }));
    } else if (value === '') {
      setCarForm(prev => ({ ...prev, model: '' }));
      setShowAddNewModel(false);
    } else {
      setCarForm(prev => ({ ...prev, model: value }));
      setShowAddNewModel(false);
    }
  };

  const getAvailableModels = () => {
    if (!carForm.makeId) return [];
    const selectedMake = vehicleDatabase.find(make => make.id === carForm.makeId);
    return selectedMake ? selectedMake.models : [];
  };

  const getAvailableYears = () => {
    const availableModels = getAvailableModels();
    if (availableModels.length === 0) {
      return Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);
    }
    
    const selectedModel = availableModels.find(model => model.name === carForm.model);
    return selectedModel ? selectedModel.years : Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('customers')}</h1>
        <Button icon={Plus} onClick={handleAddCustomer}>
          {t('addCustomer')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>قائمة العملاء</CardTitle>
            <div className="w-64">
              <Input
                type="text"
                placeholder="البحث في العملاء..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('name')}</TableHead>
                <TableHead>{t('phone')}</TableHead>
                <TableHead>{t('email')}</TableHead>
                <TableHead>السيارات</TableHead>
                <TableHead>{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {customer.name.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium">{customer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{customer.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{customer.email}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Car className="h-4 w-4 text-gray-400" />
                      <span>{customer.cars.length}</span>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleAddCar(customer)}
                      >
                        إضافة سيارة
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Edit}
                        onClick={() => handleEditCustomer(customer)}
                      />
                      <Button
                        size="sm"
                        variant="danger"
                        icon={Trash2}
                        onClick={() => handleDeleteCustomer(customer.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              لا توجد عملاء متاحين
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'تعديل العميل' : t('addCustomer')}
      >
        <form onSubmit={handleSubmitCustomer} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('customerName')}
            </label>
            <Input
              type="text"
              value={customerForm.name}
              onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('customerPhone')}
            </label>
            <Input
              type="tel"
              value={customerForm.phone}
              onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('customerEmail')}
            </label>
            <Input
              type="email"
              value={customerForm.email}
              onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('customerAddress')}
            </label>
            <Input
              type="text"
              value={customerForm.address}
              onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
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

      {/* Car Modal */}
      <Modal
        isOpen={isCarModalOpen}
        onClose={() => setIsCarModalOpen(false)}
        title="إضافة سيارة جديدة"
        size="lg"
      >
        <form onSubmit={handleSubmitCar} className="space-y-4">
          {/* Make Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ماركة السيارة
            </label>
            <Select
              value={carForm.makeId}
              onChange={handleMakeChange}
              required={!showAddNewMake}
            >
              <option value="">اختر الماركة</option>
              {vehicleDatabase.map(make => (
                <option key={make.id} value={make.id}>
                  {make.name}
                </option>
              ))}
              <option value="add_new">+ إضافة ماركة جديدة</option>
            </Select>
            
            {showAddNewMake && (
              <div className="mt-2">
                <Input
                  type="text"
                  value={newMakeName}
                  onChange={(e) => {
                    setNewMakeName(e.target.value);
                    setCarForm(prev => ({ ...prev, make: e.target.value }));
                  }}
                  placeholder="أدخل اسم الماركة الجديدة"
                  required
                />
              </div>
            )}
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              موديل السيارة
            </label>
            <Select
              value={carForm.model}
              onChange={handleModelChange}
              required={!showAddNewModel}
              disabled={!carForm.makeId && !showAddNewMake}
            >
              <option value="">اختر الموديل</option>
              {getAvailableModels().map(model => (
                <option key={model.id} value={model.name}>
                  {model.name}
                </option>
              ))}
              {(carForm.makeId || showAddNewMake) && (
                <option value="add_new">+ إضافة موديل جديد</option>
              )}
            </Select>
            
            {showAddNewModel && (
              <div className="mt-2">
                <Input
                  type="text"
                  value={newModelName}
                  onChange={(e) => {
                    setNewModelName(e.target.value);
                    setCarForm(prev => ({ ...prev, model: e.target.value }));
                  }}
                  placeholder="أدخل اسم الموديل الجديد"
                  required
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                سنة الصنع
              </label>
              <Select
                value={carForm.year}
                onChange={(e) => setCarForm({ ...carForm, year: parseInt(e.target.value) })}
                required
              >
                {getAvailableYears().map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                لون السيارة
              </label>
              <Select
                value={carForm.color}
                onChange={(e) => setCarForm({ ...carForm, color: e.target.value })}
                required
              >
                <option value="">اختر اللون</option>
                <option value="أبيض">أبيض</option>
                <option value="أسود">أسود</option>
                <option value="رمادي">رمادي</option>
                <option value="أحمر">أحمر</option>
                <option value="أزرق">أزرق</option>
                <option value="أخضر">أخضر</option>
                <option value="فضي">فضي</option>
                <option value="ذهبي">ذهبي</option>
                <option value="بيج">بيج</option>
                <option value="بني">بني</option>
                <option value="برتقالي">برتقالي</option>
                <option value="أصفر">أصفر</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('plateNumber')}
            </label>
            <Input
              type="text"
              value={carForm.plateNumber}
              onChange={(e) => setCarForm({ ...carForm, plateNumber: e.target.value })}
              placeholder="أ ب ج 123"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('chassisNumber')}
            </label>
            <Input
              type="text"
              value={carForm.chassisNumber}
              onChange={(e) => setCarForm({ ...carForm, chassisNumber: e.target.value })}
              placeholder="رقم هيكل السيارة"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عداد الكيلومترات
            </label>
            <Input
              type="number"
              value={carForm.mileage}
              onChange={(e) => setCarForm({ ...carForm, mileage: parseInt(e.target.value) })}
              placeholder="مثال: 50000"
              required
            />
          </div>

          {(showAddNewMake || showAddNewModel) && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                {showAddNewMake && 'سيتم إضافة الماركة الجديدة إلى قاعدة البيانات لاستخدامها لاحقاً.'}
                {showAddNewModel && 'سيتم إضافة الموديل الجديد إلى قاعدة البيانات لاستخدامها لاحقاً.'}
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCarModalOpen(false)}
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

export default Customers;