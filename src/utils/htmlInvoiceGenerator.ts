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

  doc.setFont('helvetica', 'bold').setFontSize(20).setTextColor(31, 41, 55);
  doc.text(company?.name || 'Your Company', M, 22);
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(75, 85, 99);
  let y = 29;
  for (const line of [company?.address, company?.phone && `Phone: ${company.phone}`, company?.email && `Email: ${company.email}`]) {
    if (line) { doc.text(String(line), M, y); y += 5; }
  }

  doc.setFont('helvetica', 'bold').setFontSize(18).setTextColor(31, 41, 55);
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
    head: [['Item', 'Qty', 'Unit Price', 'Total']],
    body: items.length
      ? items.map((it: any) => [it.inventory_items?.name || it.name || 'Unknown Item', String(it.quantity || 0), eur(it.unit_price), eur(it.total_price)])
      : [['No items', '', '', '']],
    margin: { left: M, right: M },
    styles: { fontSize: 10, cellPadding: 3, lineColor: [209, 213, 219], lineWidth: 0.2 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
  });

  y = ((doc as any).lastAutoTable?.finalY || y) + 10;
  const row = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal').setFontSize(bold ? 12 : 10).setTextColor(31, 41, 55);
    doc.text(label, W - M - 60, y);
    doc.text(value, W - M, y, { align: 'right' });
    y += bold ? 8 : 6;
  };
  row('Subtotal:', eur(sale.subtotal));
  if (parseFloat(sale.discount_amount || 0) > 0) row('Discount:', `-${eur(sale.discount_amount)}`);
  if (parseFloat(sale.tax_amount || 0) > 0) row('Tax:', eur(sale.tax_amount));
  doc.setDrawColor(31, 41, 55).setLineWidth(0.5).line(W - M - 60, y - 4, W - M, y - 4);
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
  doc.setFont('helvetica', 'bold').setFontSize(12).text('Thank you for your business!', W / 2, y, { align: 'center' });
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
