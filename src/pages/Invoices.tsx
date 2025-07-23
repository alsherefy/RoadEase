import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import { Card } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import { Table } from '../components/UI/Table';
import { FileText, Plus, Send, Download, Eye, Mail, MessageCircle, Printer } from 'lucide-react';
import { Invoice, Customer, ServiceOrder } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Invoices: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { invoices, customers, serviceOrders, addInvoice, updateInvoice } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState({
    customerId: '',
    serviceOrderId: '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
    discount: 0,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const customer = customers.find(c => c.id === formData.customerId);
    const serviceOrder = serviceOrders.find(so => so.id === formData.serviceOrderId);
    
    if (!customer) return;

    const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const discountAmount = (subtotal * formData.discount) / 100;
    const taxableAmount = subtotal - discountAmount;
    const vatAmount = taxableAmount * 0.15; // 15% VAT
    const total = taxableAmount + vatAmount;

    const invoiceData: Omit<Invoice, 'id'> = {
      invoiceNumber: `INV-${Date.now()}`,
      customerId: formData.customerId,
      customerName: customer.name,
      serviceOrderId: formData.serviceOrderId || undefined,
      items: formData.items,
      subtotal,
      discount: formData.discount,
      discountAmount,
      vatAmount,
      total,
      status: 'pending',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: formData.notes,
      createdAt: new Date().toISOString()
    };

    if (selectedInvoice) {
      updateInvoice(selectedInvoice.id, invoiceData);
    } else {
      addInvoice(invoiceData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      serviceOrderId: '',
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
      discount: 0,
      notes: ''
    });
    setSelectedInvoice(null);
    setIsModalOpen(false);
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setFormData({
      customerId: invoice.customerId,
      serviceOrderId: invoice.serviceOrderId || '',
      items: invoice.items,
      discount: invoice.discount,
      notes: invoice.notes || ''
    });
    setIsModalOpen(true);
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0 }]
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

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSendEmail = (invoice: Invoice) => {
    // Simulate email sending
    alert(t('Invoice sent via email successfully!'));
  };

  const handleSendWhatsApp = (invoice: Invoice) => {
    generateInvoicePDF(invoice);
  };

  const generateInvoicePDF = async (invoice: Invoice) => {
    const customer = customers.find(c => c.id === invoice.customerId);
    if (!customer) return;

    // Create a temporary div for the invoice content
    const invoiceElement = document.createElement('div');
    invoiceElement.style.position = 'absolute';
    invoiceElement.style.left = '-9999px';
    invoiceElement.style.width = '210mm';
    invoiceElement.style.padding = '20px';
    invoiceElement.style.fontFamily = 'Arial, sans-serif';
    invoiceElement.style.backgroundColor = 'white';
    invoiceElement.style.direction = 'rtl';

    invoiceElement.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f97316; padding-bottom: 20px;">
        <h1 style="color: #f97316; font-size: 28px; margin: 0;">ROAD EASE</h1>
        <p style="color: #666; margin: 5px 0;">نظام إدارة ورشة السيارات</p>
        <p style="color: #666; margin: 0; font-size: 14px;">${settings.address}</p>
        <p style="color: #666; margin: 0; font-size: 14px;">هاتف: ${settings.phone} | بريد: ${settings.email}</p>
        <p style="color: #666; margin: 0; font-size: 14px;">الرقم الضريبي: ${settings.taxNumber}</p>
      </div>

      <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
        <div style="width: 48%;">
          <h3 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">بيانات العميل</h3>
          <p style="margin: 5px 0;"><strong>الاسم:</strong> ${customer.name}</p>
          <p style="margin: 5px 0;"><strong>الهاتف:</strong> ${customer.phone}</p>
          ${customer.email ? `<p style="margin: 5px 0;"><strong>البريد:</strong> ${customer.email}</p>` : ''}
          ${customer.address ? `<p style="margin: 5px 0;"><strong>العنوان:</strong> ${customer.address}</p>` : ''}
        </div>
        <div style="width: 48%; text-align: left;">
          <h3 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">بيانات الفاتورة</h3>
          <p style="margin: 5px 0;"><strong>رقم الفاتورة:</strong> ${invoice.invoiceNumber}</p>
          <p style="margin: 5px 0;"><strong>تاريخ الإصدار:</strong> ${new Date(invoice.issueDate).toLocaleDateString('ar-SA')}</p>
          <p style="margin: 5px 0;"><strong>تاريخ الاستحقاق:</strong> ${new Date(invoice.dueDate).toLocaleDateString('ar-SA')}</p>
          <p style="margin: 5px 0;"><strong>الحالة:</strong> ${invoice.status === 'paid' ? 'مدفوع' : invoice.status === 'pending' ? 'معلق' : 'متأخر'}</p>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f97316; color: white;">
            <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">الوصف</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">الكمية</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">السعر</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">المجموع</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map(item => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 10px;">${item.description}</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${item.quantity}</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${item.unitPrice.toFixed(2)} ريال</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${item.total.toFixed(2)} ريال</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="text-align: left; margin-bottom: 30px;">
        <div style="display: inline-block; min-width: 300px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>المجموع الفرعي:</span>
            <span>${invoice.subtotal.toFixed(2)} ريال</span>
          </div>
          ${invoice.discountAmount > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px; color: #dc2626;">
              <span>الخصم (${invoice.discount}%):</span>
              <span>-${invoice.discountAmount.toFixed(2)} ريال</span>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>ضريبة القيمة المضافة (15%):</span>
            <span>${invoice.vatAmount.toFixed(2)} ريال</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; border-top: 2px solid #f97316; padding-top: 10px; color: #f97316;">
            <span>المجموع الإجمالي:</span>
            <span>${invoice.total.toFixed(2)} ريال</span>
          </div>
        </div>
      </div>

      ${invoice.notes ? `
        <div style="margin-bottom: 20px;">
          <h4 style="color: #333; margin-bottom: 10px;">ملاحظات:</h4>
          <p style="background-color: #f9f9f9; padding: 10px; border-radius: 5px; margin: 0;">${invoice.notes}</p>
        </div>
      ` : ''}

      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
        <p style="color: #f97316; font-weight: bold; margin: 0;">${settings.invoiceSettings.footer}</p>
        <p style="color: #666; font-size: 12px; margin: 10px 0 0 0;">${settings.invoiceSettings.terms}</p>
      </div>
    `;

    document.body.appendChild(invoiceElement);

    try {
      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`فاتورة-${invoice.invoiceNumber}.pdf`);
      alert('تم تحميل الفاتورة بصيغة PDF بنجاح!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('حدث خطأ في إنشاء ملف PDF');
    } finally {
      document.body.removeChild(invoiceElement);
    }
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    // Simulate PDF download
    alert(t('Invoice PDF downloaded successfully!'));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const columns = [
    { key: 'invoiceNumber', label: t('Invoice Number') },
    { key: 'customerName', label: t('Customer') },
    { key: 'issueDate', label: t('Issue Date') },
    { key: 'dueDate', label: t('Due Date') },
    { key: 'total', label: t('Total') },
    { key: 'status', label: t('Status') },
    { key: 'actions', label: t('Actions') }
  ];

  const tableData = invoices.map(invoice => ({
    ...invoice,
    total: `${invoice.total.toFixed(2)} ${t('SAR')}`,
    status: (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
        {t(invoice.status)}
      </span>
    ),
    actions: (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleEdit(invoice)}
          className="p-1"
        >
          <Eye className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDownloadPDF(invoice)}
          className="p-1"
          title="تحميل PDF"
        >
          <Download className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSendEmail(invoice)}
          className="p-1"
          title="إرسال بالإيميل"
        >
          <Mail className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSendWhatsApp(invoice)}
          className="p-1"
          title="إرسال بالواتساب"
        >
          <MessageCircle className="w-4 h-4" />
        </Button>
      </div>
    )
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">{t('Invoices')}</h1>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t('New Invoice')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('Total Invoices')}</p>
              <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
            </div>
            <FileText className="w-8 h-8 text-orange-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('Paid Invoices')}</p>
              <p className="text-2xl font-bold text-green-600">
                {invoices.filter(inv => inv.status === 'paid').length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('Pending Invoices')}</p>
              <p className="text-2xl font-bold text-yellow-600">
                {invoices.filter(inv => inv.status === 'pending').length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('Total Revenue')}</p>
              <p className="text-2xl font-bold text-blue-600">
                {invoices.filter(inv => inv.status === 'paid')
                  .reduce((sum, inv) => sum + inv.total, 0).toFixed(2)} {t('SAR')}
              </p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('All Invoices')}</h2>
          <Table columns={columns} data={tableData} />
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={selectedInvoice ? t('Edit Invoice') : t('New Invoice')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label={t('Customer')}
              value={formData.customerId}
              onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
              required
            >
              <option value="">{t('Select Customer')}</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </Select>

            <Select
              label={t('Service Order (Optional)')}
              value={formData.serviceOrderId}
              onChange={(e) => setFormData(prev => ({ ...prev, serviceOrderId: e.target.value }))}
            >
              <option value="">{t('Select Service Order')}</option>
              {serviceOrders.map(order => (
                <option key={order.id} value={order.id}>
                  {order.orderNumber} - {order.description}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('Invoice Items')}
            </label>
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                <div className="col-span-5">
                  <Input
                    placeholder={t('Description')}
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder={t('Qty')}
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                    min="1"
                    required
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    placeholder={t('Unit Price')}
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="col-span-2">
                  {formData.items.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeItem(index)}
                      className="w-full"
                    >
                      {t('Remove')}
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addItem}
              className="mt-2"
            >
              {t('Add Item')}
            </Button>
          </div>

          <Input
            label={t('Discount (%)')}
            type="number"
            value={formData.discount}
            onChange={(e) => setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
            min="0"
            max="100"
            step="0.01"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('Notes')}
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder={t('Additional notes...')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={resetForm}>
              {t('Cancel')}
            </Button>
            <Button type="submit">
              {selectedInvoice ? t('Update Invoice') : t('Create Invoice')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Invoices;