
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface InvoiceData {
  sale: any;
  company: any;
  settings: any;
}

export const generateInvoicePDF = (data: InvoiceData) => {
  const { sale, company, settings } = data;
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.text(company.name || 'Your Company', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Invoice: ${sale.invoice_number}`, 20, 35);
  doc.text(`Date: ${new Date(sale.created_at).toLocaleDateString()}`, 20, 45);
  
  // Company Info
  if (company.address) doc.text(company.address, 20, 55);
  if (company.phone) doc.text(`Phone: ${company.phone}`, 20, 65);
  if (company.email) doc.text(`Email: ${company.email}`, 20, 75);

  // Customer Info
  if (sale.customer_name || sale.customer_email || sale.customer_phone) {
    doc.text('Bill To:', 120, 35);
    let yPos = 45;
    if (sale.customer_name) {
      doc.text(sale.customer_name, 120, yPos);
      yPos += 10;
    }
    if (sale.customer_email) {
      doc.text(sale.customer_email, 120, yPos);
      yPos += 10;
    }
    if (sale.customer_phone) {
      doc.text(sale.customer_phone, 120, yPos);
      yPos += 10;
    }
    if (sale.customer_address) {
      doc.text(sale.customer_address, 120, yPos);
    }
  }

  // Items table
  const tableData = sale.sale_items?.map((item: any) => [
    item.inventory_items?.name || 'Unknown Item',
    item.quantity.toString(),
    `$${parseFloat(item.unit_price).toFixed(2)}`,
    `$${parseFloat(item.total_price).toFixed(2)}`
  ]) || [];

  (doc as any).autoTable({
    head: [['Item', 'Qty', 'Price', 'Total']],
    body: tableData,
    startY: 90,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const totalsX = 140;
  
  doc.text(`Subtotal: $${parseFloat(sale.subtotal).toFixed(2)}`, totalsX, finalY);
  doc.text(`Discount: -$${parseFloat(sale.discount_amount).toFixed(2)}`, totalsX, finalY + 10);
  doc.text(`Tax: $${parseFloat(sale.tax_amount).toFixed(2)}`, totalsX, finalY + 20);
  
  doc.setFontSize(14);
  doc.text(`Total: $${parseFloat(sale.total_amount).toFixed(2)}`, totalsX, finalY + 35);
  
  // Footer
  doc.setFontSize(10);
  if (sale.notes) {
    doc.text(`Notes: ${sale.notes}`, 20, finalY + 50);
  }
  
  doc.text('Thank you for your business!', 20, finalY + 65);

  return doc;
};

export const downloadInvoice = (sale: any, company: any, settings: any) => {
  const doc = generateInvoicePDF({ sale, company, settings });
  doc.save(`invoice-${sale.invoice_number}.pdf`);
};

export const printInvoice = (sale: any, company: any, settings: any) => {
  const doc = generateInvoicePDF({ sale, company, settings });
  doc.autoPrint();
  window.open(doc.output('bloburl'), '_blank');
};
