import jsPDF from 'jspdf';
import { Invoice, Customer, Settings } from '../types';

export const generateInvoicePDF = async (invoice: Invoice, customer: Customer, settings: Settings) => {
  try {
    // Create a new jsPDF instance with A4 size
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Set up fonts and colors
    pdf.setFont('helvetica');
    
    // Header - Company Info
    pdf.setFontSize(20);
    pdf.setTextColor(40, 40, 40);
    pdf.text(settings.workshopName || 'ROAD EASE', 105, 20, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    if (settings.address) {
      pdf.text(settings.address, 105, 30, { align: 'center' });
    }
    if (settings.phone) {
      pdf.text(`Tel: ${settings.phone}`, 105, 37, { align: 'center' });
    }
    if (settings.email) {
      pdf.text(`Email: ${settings.email}`, 105, 44, { align: 'center' });
    }
    if (settings.taxNumber) {
      pdf.text(`Tax No: ${settings.taxNumber}`, 105, 51, { align: 'center' });
    }
    
    // Invoice Title
    pdf.setFontSize(18);
    pdf.setTextColor(40, 40, 40);
    pdf.text('INVOICE / فاتورة', 105, 65, { align: 'center' });
    
    // Invoice Details
    pdf.setFontSize(11);
    pdf.setTextColor(60, 60, 60);
    
    // Left side - Invoice info
    pdf.text(`Invoice No: ${invoice.invoiceNumber}`, 20, 80);
    pdf.text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 20, 87);
    pdf.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 20, 94);
    
    // Payment method
    const paymentMethodText = getPaymentMethodText(invoice.paymentMethod || 'cash');
    pdf.text(`Payment Method: ${paymentMethodText}`, 20, 101);
    
    // Payment status
    const statusText = getPaymentStatusText(invoice.paymentStatus);
    pdf.text(`Status: ${statusText}`, 20, 108);
    
    // Right side - Customer info
    pdf.text('Bill To:', 120, 80);
    pdf.setFont('helvetica', 'bold');
    pdf.text(customer.name, 120, 87);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Phone: ${customer.phone}`, 120, 94);
    if (customer.email) {
      pdf.text(`Email: ${customer.email}`, 120, 101);
    }
    if (customer.address) {
      pdf.text(`Address: ${customer.address}`, 120, 108);
    }
    
    // Items table
    let yPosition = 125;
    
    // Table header
    pdf.setFillColor(240, 240, 240);
    pdf.rect(20, yPosition, 170, 8, 'F');
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('Description', 25, yPosition + 5);
    pdf.text('Qty', 110, yPosition + 5);
    pdf.text('Unit Price', 130, yPosition + 5);
    pdf.text('Total', 165, yPosition + 5);
    
    // Table items
    pdf.setFont('helvetica', 'normal');
    yPosition += 12;
    
    invoice.items.forEach((item, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.text(item.description, 25, yPosition);
      pdf.text(item.quantity.toString(), 110, yPosition);
      pdf.text(`${item.unitPrice.toFixed(2)} ${settings.currency}`, 130, yPosition);
      pdf.text(`${item.total.toFixed(2)} ${settings.currency}`, 165, yPosition);
      
      yPosition += 7;
    });
    
    // Totals section
    yPosition += 10;
    const totalsX = 130;
    
    // Draw line above totals
    pdf.line(20, yPosition, 190, yPosition);
    yPosition += 8;
    
    // Subtotal
    pdf.text('Subtotal:', totalsX, yPosition);
    pdf.text(`${invoice.subtotal.toFixed(2)} ${settings.currency}`, 165, yPosition);
    yPosition += 7;
    
    // Discount (if any)
    if (invoice.discount && invoice.discount > 0) {
      pdf.text(`Discount (${invoice.discount}%):`, totalsX, yPosition);
      pdf.text(`-${(invoice.discountAmount || 0).toFixed(2)} ${settings.currency}`, 165, yPosition);
      yPosition += 7;
    }
    
    // VAT
    const vatPercentage = (settings.vatRate * 100).toFixed(1);
    pdf.text(`VAT (${vatPercentage}%):`, totalsX, yPosition);
    pdf.text(`${invoice.vatAmount.toFixed(2)} ${settings.currency}`, 165, yPosition);
    yPosition += 7;
    
    // Total
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('Total Amount:', totalsX, yPosition);
    pdf.text(`${invoice.totalAmount.toFixed(2)} ${settings.currency}`, 165, yPosition);
    
    // Notes (if any)
    if (invoice.notes) {
      yPosition += 15;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('Notes:', 20, yPosition);
      yPosition += 7;
      
      // Split notes into multiple lines if needed
      const noteLines = pdf.splitTextToSize(invoice.notes, 170);
      pdf.text(noteLines, 20, yPosition);
    }
    
    // Footer
    const footerY = 280;
    pdf.setFontSize(9);
    pdf.setTextColor(120, 120, 120);
    
    if (settings.invoiceSettings?.footer) {
      pdf.text(settings.invoiceSettings.footer, 105, footerY, { align: 'center' });
    }
    
    if (settings.invoiceSettings?.terms) {
      pdf.text(settings.invoiceSettings.terms, 105, footerY + 7, { align: 'center' });
    }
    
    // Save the PDF
    pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('حدث خطأ في إنشاء ملف PDF');
  }
};

const getPaymentMethodText = (method: string): string => {
  switch (method) {
    case 'cash': return 'Cash / نقداً';
    case 'mada': return 'Mada / مدى';
    case 'visa': return 'Visa / فيزا';
    default: return 'Cash / نقداً';
  }
};

const getPaymentStatusText = (status: string): string => {
  switch (status) {
    case 'paid': return 'Paid / مدفوع';
    case 'partial': return 'Partial / جزئي';
    case 'unpaid': return 'Unpaid / غير مدفوع';
    default: return 'Unpaid / غير مدفوع';
  }
};