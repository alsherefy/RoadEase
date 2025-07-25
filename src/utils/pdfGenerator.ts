import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Invoice, Customer, Settings } from '../types';
import { generateZATCAQR, formatSaudiDateTime, formatSaudiCurrency } from './zatcaQR';

export const generateInvoicePDF = async (invoice: Invoice, customer: Customer, settings: Settings) => {
  try {
    // Create a new jsPDF instance with A4 size
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Set up fonts - use helvetica for better compatibility
    pdf.setFont('helvetica');
    
    // Colors
    const darkColor = [31, 41, 55]; // Dark gray
    const lightColor = [107, 114, 128]; // Light gray
    const primaryColor = [0, 0, 0]; // Black for text
    
    // Header - Simple white background with border
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(20, 20, 170, 40);
    
    // Company Info - Black text on white background
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(settings.workshopName || 'ROAD EASE', 105, 35, { align: 'center' });
    
    // Company details in English only to avoid Arabic display issues
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Auto Workshop Management System', 105, 42, { align: 'center' });
    
    // Contact info
    pdf.setFontSize(8);
    let contactY = 48;
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
    
    // Invoice Title
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('TAX INVOICE', 105, 75, { align: 'center' });
    pdf.setFontSize(14);
    pdf.text('فاتورة ضريبية', 105, 82, { align: 'center' });
    
    // Invoice Details Section
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    // Left side - Invoice info
    pdf.setFont('helvetica', 'bold');
    pdf.text('Invoice Details:', 25, 100);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Invoice No: ${invoice.invoiceNumber}`, 25, 107);
    pdf.text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString('en-GB')}`, 25, 114);
    pdf.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString('en-GB')}`, 25, 121);
    
    // Payment method
    const paymentMethodText = getPaymentMethodText(invoice.paymentMethod || 'cash');
    pdf.text(`Payment: ${paymentMethodText}`, 25, 128);
    
    // Payment status
    const statusText = getPaymentStatusText(invoice.paymentStatus);
    pdf.text(`Status: ${statusText}`, 25, 135);
    
    // Right side - Customer info (English only to avoid encoding issues)
    pdf.setFont('helvetica', 'bold');
    pdf.text('Bill To:', 120, 100);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Customer: ${customer.name}`, 120, 107);
    pdf.text(`Phone: ${customer.phone}`, 120, 114);
    if (customer.email) {
      pdf.text(`Email: ${customer.email}`, 120, 121);
    }
    if (customer.address) {
      const addressLines = pdf.splitTextToSize(`Address: ${customer.address}`, 70);
      pdf.text(addressLines, 120, 128);
    }
    
    // Items table
    let yPosition = 150;
    
    // Table header
    pdf.setFillColor(245, 245, 245);
    pdf.rect(25, yPosition, 160, 10, 'F');
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(25, yPosition, 160, 10);
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text('Description', 30, yPosition + 6);
    pdf.text('Qty', 100, yPosition + 6);
    pdf.text('Unit Price', 120, yPosition + 6);
    pdf.text('Total (SAR)', 155, yPosition + 6);
    
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
        pdf.setFillColor(250, 250, 250);
        pdf.rect(25, yPosition - 3, 160, 8, 'F');
      }
      
      // Item description in English to avoid encoding issues
      pdf.text(item.description, 30, yPosition + 2);
      pdf.text(item.quantity.toString(), 100, yPosition + 2);
      pdf.text(formatSaudiCurrency(item.unitPrice), 120, yPosition + 2);
      pdf.text(formatSaudiCurrency(item.total), 155, yPosition + 2);
      
      yPosition += 8;
    });
    
    // Totals section
    yPosition += 10;
    const totalsX = 120;
    
    // Draw line above totals
    pdf.setDrawColor(0, 0, 0);
    pdf.line(25, yPosition, 185, yPosition);
    yPosition += 8;
    
    // Subtotal
    pdf.setFont('helvetica', 'normal');
    pdf.text('Subtotal:', totalsX, yPosition);
    pdf.text(`${formatSaudiCurrency(invoice.subtotal)} SAR`, 165, yPosition);
    yPosition += 7;
    
    // Discount (if any)
    if (invoice.discount && invoice.discount > 0) {
      pdf.text(`Discount (${invoice.discount}%):`, totalsX, yPosition);
      pdf.text(`-${formatSaudiCurrency(invoice.discountAmount || 0)} SAR`, 165, yPosition);
      yPosition += 7;
    }
    
    // VAT
    const vatPercentage = (settings.vatRate * 100).toFixed(1);
    pdf.text(`VAT (${vatPercentage}%):`, totalsX, yPosition);
    pdf.text(`${formatSaudiCurrency(invoice.vatAmount)} SAR`, 165, yPosition);
    yPosition += 7;
    
    // Total
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('Total Amount:', totalsX, yPosition);
    pdf.text(`${formatSaudiCurrency(invoice.totalAmount)} SAR`, 165, yPosition);
    
    // Generate ZATCA QR Code
    const qrData = generateZATCAQR({
      sellerName: settings.workshopName,
      vatNumber: settings.taxNumber,
      timestamp: formatSaudiDateTime(new Date(invoice.issueDate)),
      invoiceTotal: formatSaudiCurrency(invoice.totalAmount),
      vatTotal: formatSaudiCurrency(invoice.vatAmount)
    });
    
    // Generate QR code image
    try {
      const qrImageData = await QRCode.toDataURL(qrData, {
        width: 80,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      // Add QR code to PDF
      yPosition += 15;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ZATCA E-Invoice QR Code:', 25, yPosition);
      pdf.text('رمز الاستجابة السريعة للفاتورة الإلكترونية:', 25, yPosition + 5);
      
      // Add QR code image
      pdf.addImage(qrImageData, 'PNG', 25, yPosition + 10, 25, 25);
      
      // Add QR instructions
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Scan this QR code to verify the invoice', 55, yPosition + 20);
      pdf.text('امسح هذا الرمز للتحقق من الفاتورة', 55, yPosition + 25);
      
    } catch (qrError) {
      console.warn('Could not generate QR code:', qrError);
      // Add text instead of QR if generation fails
      yPosition += 15;
      pdf.setFontSize(10);
      pdf.text('E-Invoice Code: ' + qrData.substring(0, 50) + '...', 25, yPosition);
    }
    
    // Notes (if any) - in English to avoid encoding issues
    if (invoice.notes) {
      yPosition += 35;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('Notes:', 25, yPosition);
      yPosition += 7;
      
      pdf.setFont('helvetica', 'normal');
      // Convert Arabic notes to English or keep as is if already English
      const noteLines = pdf.splitTextToSize(invoice.notes, 160);
      pdf.text(noteLines, 25, yPosition);
    }
    
    // Footer
    const footerY = 270;
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    
    // Footer text in English
    pdf.text('Thank you for choosing ROAD EASE', 105, footerY, { align: 'center' });
    pdf.text('All prices are inclusive of VAT', 105, footerY + 5, { align: 'center' });
    
    if (settings.invoiceSettings?.terms) {
      const termsLines = pdf.splitTextToSize('Terms: ' + settings.invoiceSettings.terms, 160);
      pdf.text(termsLines, 105, footerY + 12, { align: 'center' });
    }
    
    // Add border around the entire document
    pdf.setDrawColor(150, 150, 150);
    pdf.rect(15, 15, 180, 260);
    
    // Save the PDF
    pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF file');
  }
};

const getPaymentMethodText = (method: string): string => {
  switch (method) {
    case 'cash': return 'Cash';
    case 'mada': return 'Mada Card';
    case 'visa': return 'Visa Card';
    default: return 'Cash';
  }
};

const getPaymentStatusText = (status: string): string => {
  switch (status) {
    case 'paid': return 'Paid';
    case 'partial': return 'Partial Payment';
    case 'unpaid': return 'Unpaid';
    default: return 'Unpaid';
  }
};