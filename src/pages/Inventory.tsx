import React, { useState } from 'react';
import { Plus, Edit, Trash2, Package, AlertTriangle, TrendingDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import { InventoryItem } from '../types';
import { Card, CardHeader, CardContent, CardTitle } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/UI/Table';

const Inventory: React.FC = () => {
  const { t } = useLanguage();
  const { 
    inventory, 
    addInventoryItem, 
    updateInventoryItem, 
    deleteInventoryItem,
    updateInventoryQuantity 
  } = useApp();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [quantityAdjustment, setQuantityAdjustment] = useState(0);
  
  const [itemForm, setItemForm] = useState({
    name: '',
    category: '',
    partNumber: '',
    quantity: 0,
    minQuantity: 0,
    cost: 0,
    sellingPrice: 0,
    supplier: '',
    location: ''
  });

  const categories = [...new Set(inventory.map(item => item.category))];
  
  const filteredItems = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = inventory.filter(item => item.quantity <= item.minQuantity);

  const resetForm = () => {
    setItemForm({
      name: '',
      category: '',
      partNumber: '',
      quantity: 0,
      minQuantity: 0,
      cost: 0,
      sellingPrice: 0,
      supplier: '',
      location: ''
    });
  };

  const handleAddItem = () => {
    setEditingItem(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      category: item.category,
      partNumber: item.partNumber,
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      cost: item.cost,
      sellingPrice: item.sellingPrice,
      supplier: item.supplier || '',
      location: item.location || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
      deleteInventoryItem(id);
    }
  };

  const handleAdjustQuantity = (item: InventoryItem) => {
    setAdjustingItem(item);
    setQuantityAdjustment(0);
    setIsAdjustModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      updateInventoryItem(editingItem.id, itemForm);
    } else {
      addInventoryItem(itemForm);
    }
    
    setIsModalOpen(false);
    resetForm();
    setEditingItem(null);
  };

  const handleQuantityAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (adjustingItem && quantityAdjustment !== 0) {
      updateInventoryQuantity(adjustingItem.id, quantityAdjustment);
    }
    
    setIsAdjustModalOpen(false);
    setAdjustingItem(null);
    setQuantityAdjustment(0);
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) {
      return { text: 'نفد المخزون', color: 'text-red-600 bg-red-100' };
    } else if (item.quantity <= item.minQuantity) {
      return { text: 'مخزون منخفض', color: 'text-yellow-600 bg-yellow-100' };
    } else {
      return { text: 'متوفر', color: 'text-green-600 bg-green-100' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('inventory')}</h1>
        <Button icon={Plus} onClick={handleAddItem}>
          {t('addInventoryItem')}
        </Button>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              تنبيه: مخزون منخفض ({lowStockItems.length} عنصر)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockItems.slice(0, 6).map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.partNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{item.quantity}</p>
                    <p className="text-xs text-gray-500">الحد الأدنى: {item.minQuantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>إدارة المخزون</CardTitle>
            <div className="flex space-x-4">
              <div className="w-64">
                <Input
                  type="text"
                  placeholder="البحث في المخزون..."
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم القطعة</TableHead>
                <TableHead>رقم القطعة</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>الكمية</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>سعر التكلفة</TableHead>
                <TableHead>سعر البيع</TableHead>
                <TableHead>المورد</TableHead>
                <TableHead>{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => {
                const stockStatus = getStockStatus(item);
                
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.location}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {item.partNumber}
                      </code>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleAdjustQuantity(item)}
                        >
                          تعديل
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                        {stockStatus.text}
                      </span>
                    </TableCell>
                    <TableCell>{item.cost} ريال</TableCell>
                    <TableCell>{item.sellingPrice} ريال</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={Edit}
                          onClick={() => handleEditItem(item)}
                        />
                        <Button
                          size="sm"
                          variant="danger"
                          icon={Trash2}
                          onClick={() => handleDeleteItem(item.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredItems.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              لا توجد عناصر في المخزون
            </div>
          )}
        </CardContent>
      </Card>

      {/* Item Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'تعديل العنصر' : t('addInventoryItem')}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('itemName')}
              </label>
              <Input
                type="text"
                value={itemForm.name}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('partNumber')}
              </label>
              <Input
                type="text"
                value={itemForm.partNumber}
                onChange={(e) => setItemForm({ ...itemForm, partNumber: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('category')}
              </label>
              <Input
                type="text"
                value={itemForm.category}
                onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                placeholder="مثال: زيوت ومواد تشحيم"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('supplier')}
              </label>
              <Input
                type="text"
                value={itemForm.supplier}
                onChange={(e) => setItemForm({ ...itemForm, supplier: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('quantity')}
              </label>
              <Input
                type="number"
                value={itemForm.quantity}
                onChange={(e) => setItemForm({ ...itemForm, quantity: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('minQuantity')}
              </label>
              <Input
                type="number"
                value={itemForm.minQuantity}
                onChange={(e) => setItemForm({ ...itemForm, minQuantity: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('location')}
              </label>
              <Input
                type="text"
                value={itemForm.location}
                onChange={(e) => setItemForm({ ...itemForm, location: e.target.value })}
                placeholder="مثال: A1-01"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('cost')}
              </label>
              <Input
                type="number"
                step="0.01"
                value={itemForm.cost}
                onChange={(e) => setItemForm({ ...itemForm, cost: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('sellingPrice')}
              </label>
              <Input
                type="number"
                step="0.01"
                value={itemForm.sellingPrice}
                onChange={(e) => setItemForm({ ...itemForm, sellingPrice: parseFloat(e.target.value) || 0 })}
                required
              />
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

      {/* Quantity Adjustment Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="تعديل الكمية"
      >
        <form onSubmit={handleQuantityAdjustment} className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900">{adjustingItem?.name}</h4>
            <p className="text-sm text-gray-600">الكمية الحالية: {adjustingItem?.quantity}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تعديل الكمية
            </label>
            <Input
              type="number"
              value={quantityAdjustment}
              onChange={(e) => setQuantityAdjustment(parseInt(e.target.value) || 0)}
              placeholder="أدخل رقم موجب للإضافة أو سالب للخصم"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              الكمية الجديدة ستكون: {(adjustingItem?.quantity || 0) + quantityAdjustment}
            </p>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAdjustModalOpen(false)}
            >
              {t('cancel')}
            </Button>
            <Button type="submit">
              تأكيد التعديل
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;