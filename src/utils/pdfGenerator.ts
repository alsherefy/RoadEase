import jsPDF from 'jspdf';
import { Invoice, Customer, Settings } from '../types';

export const generateInvoicePDF = async (invoice: Invoice, customer: Customer, settings: Settings) => {
  try {
    // Create a new jsPDF instance with A4 size
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Set up fonts - use a font that supports Arabic
    // Since jsPDF doesn't have built-in Arabic fonts, we'll use a workaround
    pdf.setFont('helvetica');
    
    // Colors
    const primaryColor = [249, 115, 22]; // Orange
    const darkColor = [31, 41, 55]; // Dark gray
    const lightColor = [107, 114, 128]; // Light gray
    
    // Header Background
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, 0, 210, 35, 'F');
    
    // Company Logo Area (if logo exists)
    if (settings.logo) {
      // Logo placeholder - you can implement actual logo loading here
      pdf.setFillColor(255, 255, 255);
      pdf.circle(30, 17.5, 8, 'F');
    }
    
    // Company Info - White text on orange background
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(settings.workshopName || 'ROAD EASE', 105, 15, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    if (settings.address) {
      pdf.text(settings.address, 105, 22, { align: 'center' });
    }
    
    // Contact info in smaller text
    pdf.setFontSize(8);
    let contactY = 27;
    if (settings.phone) {
      pdf.text(`Tel: ${settings.phone}`, 105, contactY, { align: 'center' });
      contactY += 3;
    }
    if (settings.email) {
      pdf.text(`Email: ${settings.email}`, 105, contactY, { align: 'center' });
      contactY += 3;
    }
    if (settings.taxNumber) {
      pdf.text(`Tax No: ${settings.taxNumber}`, 105, contactY, { align: 'center' });
    }
    
    // Reset text color to black
    pdf.setTextColor(0, 0, 0);
    
    // Invoice Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    pdf.text('INVOICE', 105, 50, { align: 'center' });
    pdf.text('فاتورة', 105, 58, { align: 'center' });
    
    // Invoice Details Section
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    // Left side - Invoice info
    pdf.setFont('helvetica', 'bold');
    pdf.text('Invoice Details:', 20, 75);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Invoice No: ${invoice.invoiceNumber}`, 20, 82);
    pdf.text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString('en-GB')}`, 20, 89);
    pdf.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString('en-GB')}`, 20, 96);
    
    // Payment method
    const paymentMethodText = getPaymentMethodText(invoice.paymentMethod || 'cash');
    pdf.text(`Payment: ${paymentMethodText}`, 20, 103);
    
    // Payment status
    const statusText = getPaymentStatusText(invoice.paymentStatus);
    pdf.text(`Status: ${statusText}`, 20, 110);
    
    // Right side - Customer info
    pdf.setFont('helvetica', 'bold');
    pdf.text('Bill To:', 120, 75);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Customer: ${customer.name}`, 120, 82);
    pdf.text(`Phone: ${customer.phone}`, 120, 89);
    if (customer.email) {
      pdf.text(`Email: ${customer.email}`, 120, 96);
    }
    if (customer.address) {
      // Split address into multiple lines if too long
      const addressLines = pdf.splitTextToSize(`Address: ${customer.address}`, 70);
      pdf.text(addressLines, 120, 103);
    }
    
    // Items table
    let yPosition = 130;
    
    // Table header background
    pdf.setFillColor(240, 240, 240);
    pdf.rect(20, yPosition, 170, 10, 'F');
    
    // Table border
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(20, yPosition, 170, 10);
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text('Description / الوصف', 25, yPosition + 6);
    pdf.text('Qty', 110, yPosition + 6);
    pdf.text('Unit Price', 130, yPosition + 6);
    pdf.text('Total', 165, yPosition + 6);
    
    // Table items
    pdf.setFont('helvetica', 'normal');
    yPosition += 15;
    
    invoice.items.forEach((item, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Alternate row background
      if (index % 2 === 0) {
        pdf.setFillColor(248, 249, 250);
        pdf.rect(20, yPosition - 3, 170, 8, 'F');
      }
      
      // Item description - handle Arabic text by displaying it as is
      const description = item.description;
      pdf.text(description, 25, yPosition + 2);
      pdf.text(item.quantity.toString(), 110, yPosition + 2);
      pdf.text(`${item.unitPrice.toFixed(2)}`, 130, yPosition + 2);
      pdf.text(`${item.total.toFixed(2)}`, 165, yPosition + 2);
      
      yPosition += 8;
    });
    
    // Totals section
    yPosition += 10;
    const totalsX = 120;
    
    // Draw line above totals
    pdf.setDrawColor(0, 0, 0);
    pdf.line(20, yPosition, 190, yPosition);
    yPosition += 8;
    
    // Subtotal
    pdf.setFont('helvetica', 'normal');
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
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text('Total Amount:', totalsX, yPosition);
    pdf.text(`${invoice.totalAmount.toFixed(2)} ${settings.currency}`, 165, yPosition);
    
    // Notes (if any)
    if (invoice.notes) {
      yPosition += 15;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Notes / ملاحظات:', 20, yPosition);
      yPosition += 7;
      
      pdf.setFont('helvetica', 'normal');
      // Handle Arabic text in notes
      const noteLines = pdf.splitTextToSize(invoice.notes, 170);
      pdf.text(noteLines, 20, yPosition);
    }
    
    // Footer
    const footerY = 270;
    pdf.setFontSize(8);
    pdf.setTextColor(lightColor[0], lightColor[1], lightColor[2]);
    
    if (settings.invoiceSettings?.footer) {
      pdf.text(settings.invoiceSettings.footer, 105, footerY, { align: 'center' });
    }
    
    if (settings.invoiceSettings?.terms) {
      const termsLines = pdf.splitTextToSize(settings.invoiceSettings.terms, 170);
      pdf.text(termsLines, 105, footerY + 7, { align: 'center' });
    }
    
    // Add border around the entire document
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(15, 40, 180, 240);
    
    // Save the PDF
    pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('حدث خطأ في إنشاء ملف PDF');
  }
};

const getPaymentMethodText = (method: string): string => {
  switch (method) {
    case 'cash': return 'Cash';
    case 'mada': return 'Mada';
    case 'visa': return 'Visa';
    default: return 'Cash';
  }
};

const getPaymentStatusText = (status: string): string => {
  switch (status) {
    case 'paid': return 'Paid';
    case 'partial': return 'Partial';
    case 'unpaid': return 'Unpaid';
    default: return 'Unpaid';
  }
};