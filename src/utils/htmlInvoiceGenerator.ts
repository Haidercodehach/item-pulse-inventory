import type jsPDF from 'jspdf';

interface InvoiceData {
  sale: any;
  company: any;
  settings: any;
}

const validateSaleData = (sale: any): string[] => {
  const errors: string[] = [];
  if (!sale) return ['Sale data is missing'];
  if (!sale.invoice_number) errors.push('Invoice number is missing');
  if (!sale.total_amount && sale.total_amount !== 0) errors.push('Total amount is missing');
  if (!sale.created_at) errors.push('Sale date is missing');
  return errors;
};

const eur = (v: any) => `€${parseFloat(v || 0).toFixed(2)}`;

export const formatSaleType = (condition?: string | null) => {
  const value = (condition || '').toLowerCase();
  if (/usat|used|refurbish/.test(value)) return 'Used';
  if (/nuov|new/.test(value)) return 'New';
  return 'Other / Not set';
};

// Split payments are stored as "split:card=120.00;cash=80.00".
export const encodeSplitPayment = (card: number, cash: number) =>
  `split:card=${card.toFixed(2)};cash=${cash.toFixed(2)}`;

export const formatPaymentMethod = (method?: string | null) => {
  const value = (method || '').trim();
  const split = /^split:card=([\d.]+);cash=([\d.]+)$/i.exec(value);
  if (split) return `Card €${Number(split[1]).toFixed(2)} + Cash €${Number(split[2]).toFixed(2)}`;
  if (/^cash$/i.test(value)) return 'Cash';
  if (/^card$/i.test(value)) return 'Card';
  return value || 'Not provided';
};

// Addresses the shop no longer wants printed on receipts.
const REMOVED_ADDRESS = /andrea doria/i;

// The Address field can hold several addresses separated by commas or new lines.
export const invoiceAddressLines = (company: any): string[] =>
  String(company?.address || '')
    .split(/[\n,]/)
    .map((line) => line.trim())
    .filter((line) => line && !REMOVED_ADDRESS.test(line));

export const invoiceDeviceLines = (saleItem: any) => {
  const item = { ...(saleItem || {}), ...(saleItem?.inventory_items || {}) };
  const details = [
    item.color && `Color: ${item.color}`,
    item.condition && `Condition: ${item.condition}`,
  ].filter(Boolean).join('; ');

  return [
    `Device Name: ${item.name || 'Not provided'}`,
    `IMEI Number: ${item.sku || 'Not provided'}`,
    `Warranty: ${item.warranty || 'Not provided'}`,
    `Storage: ${item.storage || 'Not provided'}`,
    `Details: ${details || 'Not provided'}`,
    `Sale Type: ${formatSaleType(item.condition)}`,
  ];
};

// Draws the invoice directly as vector PDF (no screenshotting the page), so it
// never blocks the main thread like the old HTML-to-canvas approach did.
export const generateInvoicePDF = async (data: InvoiceData): Promise<jsPDF> => {
  const { sale, company = {} } = data;
  const errors = validateSaleData(sale);
  if (errors.length) throw new Error(`Failed to generate invoice PDF: Invalid sale data: ${errors.join(', ')}`);

  const [{ default: JsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, M = 15;

  doc.setFont('helvetica', 'bold').setFontSize(26).setTextColor(31, 41, 55);
  doc.text(company?.name || 'Your Company', M, 22);
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(75, 85, 99);
  let y = 29;
  const headerLines = [
    ...invoiceAddressLines(company),
    company?.phone && `Phone: ${company.phone}`,
    company?.email && `Email: ${company.email}`,
  ];
  for (const line of headerLines) {
    if (line) { doc.text(String(line), M, y); y += 5; }
  }

  doc.setFont('helvetica', 'bold').setFontSize(24).setTextColor(31, 41, 55);
  doc.text('INVOICE', W - M, 22, { align: 'right' });
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(75, 85, 99);
  doc.text(`#${sale.invoice_number}`, W - M, 29, { align: 'right' });
  doc.text(`Date: ${new Date(sale.created_at).toLocaleDateString()}`, W - M, 34, { align: 'right' });

  y = Math.max(y, 40) + 4;
  const customer = [sale.customer_name, sale.customer_email, sale.customer_phone, sale.customer_address].filter(Boolean);
  if (customer.length) {
    doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(31, 41, 55);
    doc.text('Bill To:', M, y); y += 6;
    doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(75, 85, 99);
    customer.forEach((c) => { doc.text(String(c), M, y); y += 5; });
    y += 3;
  }

  const items = sale.sale_items || [];
  autoTable(doc, {
    startY: y,
    head: [['Device Details', 'Qty', 'Unit Price', 'Total']],
    body: items.length
      ? items.map((it: any) => [invoiceDeviceLines(it).join('\n'), String(it.quantity || 0), eur(it.unit_price), eur(it.total_price)])
      : [['No items', '', '', '']],
    margin: { left: M, right: M },
    styles: { fontSize: 12, cellPadding: 5, minCellHeight: 14, lineColor: [209, 213, 219], lineWidth: 0.2, valign: 'top' },
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 13 },
    columnStyles: {
      0: { cellWidth: 92 },
      1: { cellWidth: 14, halign: 'center' },
      2: { cellWidth: 37, halign: 'right' },
      3: { cellWidth: 37, halign: 'right' },
    },
  });

  y = ((doc as any).lastAutoTable?.finalY || y) + 10;
  if (y > 200) {
    doc.addPage();
    y = 20;
  }
  const row = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal').setFontSize(bold ? 16 : 12).setTextColor(31, 41, 55);
    doc.text(label, W - M - 80, y);
    doc.text(value, W - M, y, { align: 'right' });
    y += bold ? 11 : 8;
  };
  row('Payment Method:', formatPaymentMethod(sale.payment_method));
  row('Subtotal:', eur(sale.subtotal));
  if (parseFloat(sale.discount_amount || 0) > 0) row('Discount:', `-${eur(sale.discount_amount)}`);
  if (parseFloat(sale.tax_amount || 0) > 0) row('Tax:', eur(sale.tax_amount));
  doc.setDrawColor(31, 41, 55).setLineWidth(0.5).line(W - M - 80, y - 4, W - M, y - 4);
  y += 2;
  row('Total:', eur(sale.total_amount), true);

  y += 8;
  doc.setTextColor(75, 85, 99);
  if (sale.notes) {
    doc.setFont('helvetica', 'bold').setFontSize(10).text('Notes:', W / 2, y, { align: 'center' }); y += 5;
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(String(sale.notes), W - 2 * M);
    doc.text(lines, W / 2, y, { align: 'center' }); y += lines.length * 5 + 4;
  }
  // Fill the rest of the page: a seller signature line and a footer pinned to the bottom.
  const H = 297;
  const sigY = Math.max(y + 20, H - 55);
  doc.setDrawColor(156, 163, 175).setLineWidth(0.3);
  doc.line(M, sigY, M + 70, sigY);
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(75, 85, 99);
  doc.text('Seller signature', M, sigY + 5);
  doc.setFillColor(37, 99, 235).rect(0, H - 30, W, 30, 'F');
  doc.setFont('helvetica', 'bold').setFontSize(14).setTextColor(255, 255, 255);
  doc.text('Thank you for your business!', W / 2, H - 17, { align: 'center' });
  doc.setFont('helvetica', 'normal').setFontSize(9);
  const contact = [company?.name, company?.phone, company?.email].filter(Boolean).join('  |  ');
  if (contact) doc.text(String(contact), W / 2, H - 10, { align: 'center' });
  return doc;
};

export const downloadInvoice = async (sale: any, company: any = {}, settings: any = {}) => {
  const doc = await generateInvoicePDF({ sale, company, settings });
  doc.save(`invoice-${sale.invoice_number}.pdf`);
};

export const printInvoice = async (sale: any, company: any = {}, settings: any = {}) => {
  const doc = await generateInvoicePDF({ sale, company, settings });
  const url = URL.createObjectURL(doc.output('blob'));
  const w = window.open(url, '_blank');
  if (!w) throw new Error('Failed to open print window. Please check your browser popup settings.');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};
