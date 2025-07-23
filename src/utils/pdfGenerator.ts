import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Invoice, Settings } from '../types';
import { generateZATCAQR, formatSaudiDateTime, formatSaudiCurrency } from './zatcaQR';

export async function generateInvoicePDF(invoice: Invoice, settings: Settings): Promise<void> {
  // Generate ZATCA QR Code
  const qrData = generateZATCAQR({
    sellerName: settings.workshopName,
    vatNumber: settings.vatNumber,
    timestamp: formatSaudiDateTime(new Date(invoice.issueDate)),
    invoiceTotal: formatSaudiCurrency(invoice.total),
    vatTotal: formatSaudiCurrency(invoice.vatAmount)
  });

  // Create invoice HTML
  const invoiceHTML = createInvoiceHTML(invoice, settings, qrData);
  
  // Create temporary element
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = invoiceHTML;
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.width = '210mm';
  tempDiv.style.backgroundColor = 'white';
  tempDiv.style.fontFamily = 'Arial, sans-serif';
  tempDiv.style.direction = 'rtl';
  
  document.body.appendChild(tempDiv);

  try {
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123 // A4 height in pixels at 96 DPI
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add watermark if enabled
    if (settings.invoiceSettings.logoAsWatermark && settings.logo) {
      pdf.addImage(settings.logo, 'PNG', 50, 100, 110, 110, '', 'NONE', 0.1);
    }

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      
      // Add watermark to additional pages
      if (settings.invoiceSettings.logoAsWatermark && settings.logo) {
        pdf.addImage(settings.logo, 'PNG', 50, 100, 110, 110, '', 'NONE', 0.1);
      }
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`فاتورة-${invoice.invoiceNumber}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('فشل في إنشاء ملف PDF');
  } finally {
    document.body.removeChild(tempDiv);
  }
}

function createInvoiceHTML(invoice: Invoice, settings: Settings, qrCode: string): string {
  const isRTL = true; // Always RTL for Saudi invoices
  
  return `
    <div style="padding: 20px; font-family: Arial, sans-serif; direction: rtl; background: white;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid ${settings.theme.primary}; padding-bottom: 20px;">
        ${settings.logo ? `<img src="${settings.logo}" alt="Logo" style="max-height: 80px; margin-bottom: 10px;" />` : ''}
        <h1 style="color: ${settings.theme.primary}; font-size: 28px; margin: 10px 0; font-weight: bold;">
          ${settings.workshopName}
        </h1>
        <h2 style="color: #666; font-size: 18px; margin: 5px 0; font-weight: normal;">
          ${settings.workshopNameEn}
        </h2>
        <div style="color: #666; font-size: 14px; line-height: 1.5;">
          <p style="margin: 2px 0;">${settings.address}</p>
          <p style="margin: 2px 0;">${settings.addressEn}</p>
          <p style="margin: 2px 0;">هاتف: ${settings.phone} | Phone: ${settings.phone}</p>
          <p style="margin: 2px 0;">بريد إلكتروني: ${settings.email} | Email: ${settings.email}</p>
          <p style="margin: 2px 0;">الرقم الضريبي: ${settings.vatNumber} | VAT No: ${settings.vatNumber}</p>
          <p style="margin: 2px 0;">رقم السجل التجاري: ${settings.crNumber} | CR No: ${settings.crNumber}</p>
        </div>
      </div>

      <!-- Invoice Info and Customer Info -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
        <!-- Customer Info -->
        <div style="width: 48%;">
          <h3 style="color: #333; border-bottom: 2px solid ${settings.theme.primary}; padding-bottom: 8px; margin-bottom: 15px; font-size: 18px;">
            بيانات العميل | Customer Information
          </h3>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
            <p style="margin: 8px 0; font-size: 14px;"><strong>الاسم | Name:</strong> ${invoice.customerInfo.name}</p>
            ${invoice.customerInfo.nameEn ? `<p style="margin: 8px 0; font-size: 14px;"><strong>Name (EN):</strong> ${invoice.customerInfo.nameEn}</p>` : ''}
            <p style="margin: 8px 0; font-size: 14px;"><strong>الهاتف | Phone:</strong> ${invoice.customerInfo.phone}</p>
            ${invoice.customerInfo.email ? `<p style="margin: 8px 0; font-size: 14px;"><strong>البريد | Email:</strong> ${invoice.customerInfo.email}</p>` : ''}
            ${invoice.customerInfo.address ? `<p style="margin: 8px 0; font-size: 14px;"><strong>العنوان | Address:</strong> ${invoice.customerInfo.address}</p>` : ''}
            ${invoice.customerInfo.vatNumber ? `<p style="margin: 8px 0; font-size: 14px;"><strong>الرقم الضريبي | VAT No:</strong> ${invoice.customerInfo.vatNumber}</p>` : ''}
          </div>
        </div>

        <!-- Invoice Info -->
        <div style="width: 48%; text-align: left;">
          <h3 style="color: #333; border-bottom: 2px solid ${settings.theme.primary}; padding-bottom: 8px; margin-bottom: 15px; font-size: 18px;">
            بيانات الفاتورة | Invoice Information
          </h3>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
            <p style="margin: 8px 0; font-size: 14px;"><strong>رقم الفاتورة | Invoice No:</strong> ${invoice.invoiceNumber}</p>
            <p style="margin: 8px 0; font-size: 14px;"><strong>تاريخ الإصدار | Issue Date:</strong> ${new Date(invoice.issueDate).toLocaleDateString('ar-SA')} | ${new Date(invoice.issueDate).toLocaleDateString('en-US')}</p>
            <p style="margin: 8px 0; font-size: 14px;"><strong>تاريخ الاستحقاق | Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString('ar-SA')} | ${new Date(invoice.dueDate).toLocaleDateString('en-US')}</p>
            <p style="margin: 8px 0; font-size: 14px;">
              <strong>الحالة | Status:</strong> 
              <span style="color: ${invoice.status === 'paid' ? '#10B981' : invoice.status === 'pending' ? '#F59E0B' : '#EF4444'};">
                ${invoice.status === 'paid' ? 'مدفوع | Paid' : invoice.status === 'pending' ? 'معلق | Pending' : 'متأخر | Overdue'}
              </span>
            </p>
            ${invoice.paymentMethod ? `<p style="margin: 8px 0; font-size: 14px;"><strong>طريقة الدفع | Payment Method:</strong> ${getPaymentMethodText(invoice.paymentMethod)}</p>` : ''}
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <div style="margin-bottom: 30px;">
        <h3 style="color: #333; border-bottom: 2px solid ${settings.theme.primary}; padding-bottom: 8px; margin-bottom: 15px; font-size: 18px;">
          تفاصيل الفاتورة | Invoice Details
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background: ${settings.theme.primary}; color: white;">
              <th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-size: 14px;">الوصف | Description</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-size: 14px; width: 80px;">الكمية | Qty</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-size: 14px; width: 100px;">السعر | Price</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-size: 14px; width: 80px;">ض.ق.م | VAT</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-size: 14px; width: 100px;">المجموع | Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((item, index) => `
              <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f9f9f9'};">
                <td style="border: 1px solid #ddd; padding: 12px; font-size: 13px;">
                  <div style="font-weight: bold; margin-bottom: 4px;">${item.description}</div>
                  ${item.descriptionEn ? `<div style="color: #666; font-size: 12px;">${item.descriptionEn}</div>` : ''}
                </td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center; font-size: 13px;">${item.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center; font-size: 13px;">${formatSaudiCurrency(item.unitPrice)} ${settings.currency}</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center; font-size: 13px;">${formatSaudiCurrency(item.vatAmount)} ${settings.currency}</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center; font-size: 13px; font-weight: bold;">${formatSaudiCurrency(item.total)} ${settings.currency}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Totals and QR Code -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
        <!-- QR Code -->
        <div style="width: 200px; text-align: center;">
          <h4 style="color: #333; margin-bottom: 10px; font-size: 16px;">رمز الاستجابة السريعة | QR Code</h4>
          <div style="border: 2px solid ${settings.theme.primary}; padding: 10px; border-radius: 8px; background: white;">
            <div style="width: 150px; height: 150px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; margin: 0 auto; border-radius: 4px;">
              <div style="font-size: 10px; text-align: center; color: #666; word-break: break-all; padding: 5px;">
                ${qrCode.substring(0, 50)}...
              </div>
            </div>
          </div>
          <p style="font-size: 11px; color: #666; margin-top: 8px;">
            امسح للتحقق من الفاتورة<br/>
            Scan to verify invoice
          </p>
        </div>

        <!-- Totals -->
        <div style="width: 300px;">
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; border: 2px solid ${settings.theme.primary};">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
              <span>المجموع الفرعي | Subtotal:</span>
              <span style="font-weight: bold;">${formatSaudiCurrency(invoice.subtotal)} ${settings.currency}</span>
            </div>
            ${invoice.discountAmount > 0 ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #dc2626; font-size: 14px;">
                <span>الخصم | Discount (${invoice.discount}%):</span>
                <span style="font-weight: bold;">-${formatSaudiCurrency(invoice.discountAmount)} ${settings.currency}</span>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
              <span>ضريبة القيمة المضافة | VAT (${(settings.vatRate * 100).toFixed(0)}%):</span>
              <span style="font-weight: bold;">${formatSaudiCurrency(invoice.vatAmount)} ${settings.currency}</span>
            </div>
            <hr style="border: none; border-top: 2px solid ${settings.theme.primary}; margin: 15px 0;" />
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; color: ${settings.theme.primary};">
              <span>المجموع الإجمالي | Grand Total:</span>
              <span>${formatSaudiCurrency(invoice.total)} ${settings.currency}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Notes -->
      ${invoice.notes ? `
        <div style="margin-bottom: 20px;">
          <h4 style="color: #333; margin-bottom: 10px; font-size: 16px;">ملاحظات | Notes:</h4>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid ${settings.theme.primary};">
            <p style="margin: 0; font-size: 14px; line-height: 1.5;">${invoice.notes}</p>
          </div>
        </div>
      ` : ''}

      <!-- Footer -->
      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid ${settings.theme.primary};">
        ${settings.seal ? `<img src="${settings.seal}" alt="Seal" style="max-height: 60px; margin-bottom: 15px;" />` : ''}
        <p style="color: ${settings.theme.primary}; font-weight: bold; margin: 10px 0; font-size: 16px;">
          ${settings.invoiceSettings.footer}
        </p>
        <p style="color: ${settings.theme.primary}; font-weight: bold; margin: 10px 0; font-size: 14px;">
          ${settings.invoiceSettings.footerEn}
        </p>
        <div style="color: #666; font-size: 12px; margin: 15px 0; line-height: 1.4;">
          <p style="margin: 5px 0;">${settings.invoiceSettings.terms}</p>
          <p style="margin: 5px 0;">${settings.invoiceSettings.termsEn}</p>
        </div>
        <p style="color: #999; font-size: 11px; margin-top: 20px;">
          هذه فاتورة إلكترونية معتمدة من هيئة الزكاة والضريبة والجمارك<br/>
          This is an electronic invoice approved by ZATCA
        </p>
      </div>
    </div>
  `;
}

function getPaymentMethodText(method: string): string {
  const methods = {
    cash: 'نقداً | Cash',
    card: 'بطاقة | Card',
    transfer: 'تحويل | Transfer',
    check: 'شيك | Check'
  };
  return methods[method as keyof typeof methods] || method;
}