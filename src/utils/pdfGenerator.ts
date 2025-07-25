import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { Invoice, Customer, Settings } from '../types';
import { generateZATCAQR, formatSaudiDateTime, formatSaudiCurrency } from './zatcaQR';

export const generateInvoicePDF = async (invoice: Invoice, customer: Customer, settings: Settings) => {
  try {
    // Create HTML template for the invoice
    const invoiceHTML = await createInvoiceHTML(invoice, customer, settings);
    
    // Create a temporary container for the HTML
    const container = document.createElement('div');
    container.innerHTML = invoiceHTML;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '210mm'; // A4 width
    container.style.backgroundColor = 'white';
    document.body.appendChild(container);

    // Wait for fonts to load
    await document.fonts.ready;
    
    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
      scale: 2, // Higher quality
      useCORS: true,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        // Ensure fonts are loaded in the cloned document
        const link = clonedDoc.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap';
        link.rel = 'stylesheet';
        clonedDoc.head.appendChild(link);
      }
    });

    // Remove the temporary container
    document.body.removeChild(container);

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
    
    // Save the PDF
    pdf.save(`فاتورة-${invoice.invoiceNumber}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('حدث خطأ في إنشاء ملف PDF');
  }
};

const createInvoiceHTML = async (invoice: Invoice, customer: Customer, settings: Settings): Promise<string> => {
  // Generate QR code
  const qrData = generateZATCAQR({
    sellerName: settings.workshopName,
    vatNumber: settings.taxNumber,
    timestamp: formatSaudiDateTime(new Date(invoice.issueDate)),
    invoiceTotal: formatSaudiCurrency(invoice.totalAmount),
    vatTotal: formatSaudiCurrency(invoice.vatAmount)
  });

  let qrCodeDataURL = '';
  try {
    qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 120,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  } catch (error) {
    console.warn('Could not generate QR code:', error);
  }

  const paymentMethodText = getPaymentMethodText(invoice.paymentMethod || 'cash');
  const statusText = getPaymentStatusText(invoice.paymentStatus);

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Cairo', Arial, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #333;
          background: white;
          padding: 20px;
          width: 210mm;
          min-height: 297mm;
        }
        
        .invoice-container {
          max-width: 100%;
          margin: 0 auto;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          overflow: hidden;
        }
        
        .header {
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          padding: 30px;
          text-align: center;
          border-bottom: 3px solid #374151;
        }
        
        .header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 10px;
          letter-spacing: 2px;
        }
        
        .header .subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 15px;
        }
        
        .contact-info {
          font-size: 11px;
          color: #374151;
          line-height: 1.6;
        }
        
        .invoice-title {
          background: transparent;
          color: #1f2937;
          padding: 15px;
          text-align: center;
          font-size: 18px;
          font-weight: 600;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .invoice-details {
          padding: 25px;
        }
        
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }
        
        .detail-section h3 {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 10px;
          padding-bottom: 5px;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 11px;
        }
        
        .detail-label {
          font-weight: 600;
          color: #374151;
        }
        
        .detail-value {
          color: #1f2937;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 11px;
        }
        
        .items-table th {
          background: #f9fafb;
          border: 1px solid #d1d5db;
          padding: 12px 8px;
          text-align: center;
          font-weight: 600;
          color: #374151;
        }
        
        .items-table td {
          border: 1px solid #d1d5db;
          padding: 10px 8px;
          text-align: center;
        }
        
        .items-table tbody tr:nth-child(even) {
          background: #f9fafb;
        }
        
        .totals-section {
          margin-top: 20px;
          border-top: 2px solid #e5e7eb;
          padding-top: 15px;
        }
        
        .totals-grid {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          max-width: 400px;
          margin-left: auto;
        }
        
        .total-row {
          display: contents;
        }
        
        .total-label {
          text-align: right;
          font-weight: 600;
          padding: 8px 0;
        }
        
        .total-value {
          text-align: left;
          padding: 8px 0;
          min-width: 120px;
        }
        
        .final-total {
          border-top: 2px solid #e5e7eb;
          font-size: 16px;
          font-weight: 700;
          color: #1f2937;
        }
        
        .qr-section {
          margin-top: 30px;
          padding: 20px;
          background: #f9fafb;
          border-radius: 8px;
          text-align: center;
        }
        
        .qr-title {
          font-size: 13px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 10px;
        }
        
        .qr-subtitle {
          font-size: 11px;
          color: #6b7280;
          margin-bottom: 15px;
        }
        
        .qr-code {
          margin: 0 auto 10px;
        }
        
        .qr-instructions {
          font-size: 10px;
          color: #6b7280;
          line-height: 1.5;
        }
        
        .notes-section {
          margin-top: 20px;
          padding: 15px;
          background: transparent;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        
        .notes-title {
          font-size: 12px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
        }
        
        .notes-content {
          font-size: 11px;
          color: #374151;
          line-height: 1.5;
        }
        
        .footer {
          margin-top: 30px;
          padding: 20px;
          background: #f3f4f6;
          text-align: center;
          font-size: 10px;
          color: #6b7280;
          border-top: 1px solid #d1d5db;
        }
        
        .footer-title {
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }
        
        .terms {
          margin-top: 15px;
          font-size: 9px;
          line-height: 1.4;
          color: #9ca3af;
        }
        
        @media print {
          body { margin: 0; padding: 0; }
          .invoice-container { border: none; border-radius: 0; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="header">
          <h1>${settings.workshopName}</h1>
          <div class="subtitle">نظام إدارة ورشة السيارات المتكامل</div>
          <div class="contact-info">
            ${settings.phone ? `هاتف: ${settings.phone}<br>` : ''}
            ${settings.email ? `بريد إلكتروني: ${settings.email}<br>` : ''}
            ${settings.address ? `العنوان: ${settings.address}<br>` : ''}
            ${settings.taxNumber ? `الرقم الضريبي: ${settings.taxNumber}` : ''}
          </div>
        </div>
        
        <!-- Invoice Title -->
        <div class="invoice-title">
          فاتورة ضريبية - TAX INVOICE
        </div>
        
        <!-- Invoice Details -->
        <div class="invoice-details">
          <div class="details-grid">
            <!-- Invoice Info -->
            <div class="detail-section">
              <h3>تفاصيل الفاتورة</h3>
              <div class="detail-row">
                <span class="detail-label">رقم الفاتورة:</span>
                <span class="detail-value">${invoice.invoiceNumber}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">تاريخ الإصدار:</span>
                <span class="detail-value">${new Date(invoice.issueDate).toLocaleDateString('ar-SA')}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">تاريخ الاستحقاق:</span>
                <span class="detail-value">${new Date(invoice.dueDate).toLocaleDateString('ar-SA')}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">طريقة الدفع:</span>
                <span class="detail-value">${paymentMethodText}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">حالة الدفع:</span>
                <span class="detail-value">${statusText}</span>
              </div>
            </div>
            
            <!-- Customer Info -->
            <div class="detail-section">
              <h3>بيانات العميل</h3>
              <div class="detail-row">
                <span class="detail-label">اسم العميل:</span>
                <span class="detail-value">${customer.name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">رقم الهاتف:</span>
                <span class="detail-value">${customer.phone}</span>
              </div>
              ${customer.email ? `
              <div class="detail-row">
                <span class="detail-label">البريد الإلكتروني:</span>
                <span class="detail-value">${customer.email}</span>
              </div>
              ` : ''}
              ${customer.address ? `
              <div class="detail-row">
                <span class="detail-label">العنوان:</span>
                <span class="detail-value">${customer.address}</span>
              </div>
              ` : ''}
            </div>
          </div>
          
          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th>الوصف</th>
                <th>الكمية</th>
                <th>السعر الوحدة</th>
                <th>المجموع</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td style="text-align: right; padding-right: 10px;">${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${formatSaudiCurrency(item.unitPrice)} ريال</td>
                  <td>${formatSaudiCurrency(item.total)} ريال</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <!-- Totals -->
          <div class="totals-section">
            <div class="totals-grid">
              <div class="total-row">
                <div class="total-label">المجموع الفرعي:</div>
                <div class="total-value">${formatSaudiCurrency(invoice.subtotal)} ريال</div>
              </div>
              
              ${invoice.discount && invoice.discount > 0 ? `
              <div class="total-row">
                <div class="total-label">الخصم (${invoice.discount}%):</div>
                <div class="total-value">-${formatSaudiCurrency(invoice.discountAmount || 0)} ريال</div>
              </div>
              ` : ''}
              
              <div class="total-row">
                <div class="total-label">ضريبة القيمة المضافة (${(settings.vatRate * 100).toFixed(1)}%):</div>
                <div class="total-value">${formatSaudiCurrency(invoice.vatAmount)} ريال</div>
              </div>
              
              <div class="total-row final-total">
                <div class="total-label">المجموع الكلي:</div>
                <div class="total-value">${formatSaudiCurrency(invoice.totalAmount)} ريال</div>
              </div>
            </div>
          </div>
          
          <!-- QR Code Section -->
          ${qrCodeDataURL ? `
          <div class="qr-section">
            <div class="qr-title">رمز الاستجابة السريعة للفاتورة الإلكترونية</div>
            <div class="qr-subtitle">ZATCA E-Invoice QR Code</div>
            <div class="qr-code">
              <img src="${qrCodeDataURL}" alt="QR Code" style="width: 120px; height: 120px;">
            </div>
            <div class="qr-instructions">
              امسح هذا الرمز للتحقق من صحة الفاتورة<br>
              Scan this QR code to verify the invoice
            </div>
          </div>
          ` : ''}
          
          <!-- Notes -->
          ${invoice.notes ? `
          <div class="notes-section">
            <div class="notes-title">ملاحظات:</div>
            <div class="notes-content">${invoice.notes}</div>
          </div>
          ` : ''}
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-title">شكراً لاختياركم ${settings.workshopName}</div>
          <div>جميع الأسعار شاملة ضريبة القيمة المضافة</div>
          ${settings.invoiceSettings?.terms ? `
          <div class="terms">${settings.invoiceSettings.terms}</div>
          ` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
};

const getPaymentMethodText = (method: string): string => {
  switch (method) {
    case 'cash': return 'نقداً';
    case 'mada': return 'بطاقة مدى';
    case 'visa': return 'بطاقة فيزا';
    default: return 'نقداً';
  }
};

const getPaymentStatusText = (status: string): string => {
  switch (status) {
    case 'paid': return 'مدفوع';
    case 'partial': return 'دفع جزئي';
    case 'unpaid': return 'غير مدفوع';
    default: return 'غير مدفوع';
  }
};