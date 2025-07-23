// ZATCA QR Code Generator for Saudi Arabia e-Invoicing Phase 1
export interface ZATCAQRData {
  sellerName: string;
  vatNumber: string;
  timestamp: string;
  invoiceTotal: string;
  vatTotal: string;
}

export function generateZATCAQR(data: ZATCAQRData): string {
  // TLV (Tag-Length-Value) encoding for ZATCA QR
  const tlvData = [
    { tag: 1, value: data.sellerName },      // Seller name
    { tag: 2, value: data.vatNumber },       // VAT registration number
    { tag: 3, value: data.timestamp },       // Time stamp
    { tag: 4, value: data.invoiceTotal },    // Invoice total (with VAT)
    { tag: 5, value: data.vatTotal }         // VAT total
  ];

  let qrString = '';
  
  tlvData.forEach(item => {
    const tagHex = item.tag.toString(16).padStart(2, '0');
    const valueBytes = new TextEncoder().encode(item.value);
    const lengthHex = valueBytes.length.toString(16).padStart(2, '0');
    const valueHex = Array.from(valueBytes)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
    
    qrString += tagHex + lengthHex + valueHex;
  });

  // Convert hex string to base64
  const bytes = [];
  for (let i = 0; i < qrString.length; i += 2) {
    bytes.push(parseInt(qrString.substr(i, 2), 16));
  }
  
  return btoa(String.fromCharCode.apply(null, bytes));
}

export function formatSaudiDateTime(date: Date): string {
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

export function formatSaudiCurrency(amount: number): string {
  return amount.toFixed(2);
}