import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Invoice, Customer } from '../types';

export const generateInvoicePDF = async (invoice: Invoice, customer: Customer, settings?: any) => {
  try {
    // Create a new jsPDF instance
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Set up fonts and colors
    pdf.setFont('helvetica');
    
    // Header
    pdf.setFontSize(20);
    pdf.setTextColor(40, 40, 40);
    pdf.text('فاتورة', 105, 20, { align: 'center' });
    
    // Company info (if available in settings)
    if (settings?.companyName) {
      pdf.setFontSize(14);
      pdf.text(settings.companyName, 20, 35);
    }
    
    // Invoice details
    pdf.setFontSize(12);
    pdf.text(`رقم الفاتورة: ${invoice.invoiceNumber}`, 20, 50);
    pdf.text(`تاريخ الإصدار: ${invoice.issueDate}`, 20, 60);
    pdf.text(`تاريخ الاستحقاق: ${invoice.dueDate}`, 20, 70);
    
    // Customer info
    pdf.text('بيانات العميل:', 20, 90);
    pdf.text(`الاسم: ${customer.name}`, 20, 100);
    pdf.text(`الهاتف: ${customer.phone}`, 20, 110);
    if (customer.email) {
      pdf.text(`البريد الإلكتروني: ${customer.email}`, 20, 120);
    }
    
    // Payment method
    const paymentMethodText = getPaymentMethodText(invoice.paymentMethod);
    pdf.text(`طريقة الدفع: ${paymentMethodText}`, 20, 130);
    
    // Items table header
    let yPosition = 150;
    pdf.setFillColor(240, 240, 240);
    pdf.rect(20, yPosition, 170, 10, 'F');
    pdf.text('الصنف', 25, yPosition + 7);
    pdf.text('الكمية', 80, yPosition + 7);
    pdf.text('السعر', 120, yPosition + 7);
    pdf.text('المجموع', 160, yPosition + 7);
    
    // Items
    yPosition += 15;
    invoice.items.forEach((item, index) => {
      const itemTotal = item.quantity * item.price;
      pdf.text(`صنف ${index + 1}`, 25, yPosition);
      pdf.text(item.quantity.toString(), 80, yPosition);
      pdf.text(`${item.price.toFixed(2)} ريال`, 120, yPosition);
      pdf.text(`${itemTotal.toFixed(2)} ريال`, 160, yPosition);
      yPosition += 10;
    });
    
    // Totals
    yPosition += 10;
    pdf.line(20, yPosition, 190, yPosition);
    yPosition += 10;
    
    pdf.text(`المجموع الفرعي: ${invoice.subtotal.toFixed(2)} ريال`, 120, yPosition);
    yPosition += 10;
    pdf.text(`الضريبة (15%): ${invoice.tax.toFixed(2)} ريال`, 120, yPosition);
    yPosition += 10;
    pdf.setFontSize(14);
    pdf.text(`المجموع الكلي: ${invoice.total.toFixed(2)} ريال`, 120, yPosition);
    
    // Notes
    if (invoice.notes) {
      yPosition += 20;
      pdf.setFontSize(12);
      pdf.text('ملاحظات:', 20, yPosition);
      yPosition += 10;
      pdf.text(invoice.notes, 20, yPosition);
    }
    
    // Status
    yPosition += 20;
    const statusText = getStatusText(invoice.status);
    pdf.text(`حالة الفاتورة: ${statusText}`, 20, yPosition);
    
    // Save the PDF
    pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('حدث خطأ في إنشاء ملف PDF');
  }
};

const getPaymentMethodText = (method: string): string => {
  switch (method) {
    case 'cash': return 'نقداً';
    case 'mada': return 'بطاقة مدى';
    case 'visa': return 'فيزا';
    default: return 'نقداً';
  }
};

const getStatusText = (status: string): string => {
  switch (status) {
    case 'draft': return 'مسودة';
    case 'sent': return 'مرسلة';
    case 'paid': return 'مدفوعة';
    case 'overdue': return 'متأخرة';
    default: return 'مسودة';
  }
};