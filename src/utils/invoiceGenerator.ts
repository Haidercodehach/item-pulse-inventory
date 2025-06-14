
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface InvoiceData {
  sale: any;
  company: any;
  settings: any;
}

const validateSaleData = (sale: any): string[] => {
  const errors: string[] = [];
  
  if (!sale) {
    errors.push('Sale data is missing');
    return errors;
  }
  
  if (!sale.invoice_number) {
    errors.push('Invoice number is missing');
  }
  
  if (!sale.total_amount && sale.total_amount !== 0) {
    errors.push('Total amount is missing');
  }
  
  if (!sale.created_at) {
    errors.push('Sale date is missing');
  }
  
  return errors;
};

const formatSaleItems = (saleItems: any[]): any[] => {
  if (!Array.isArray(saleItems)) {
    console.warn('Sale items is not an array:', saleItems);
    return [];
  }
  
  return saleItems.map((item: any) => {
    const itemName = item.inventory_items?.name || item.name || 'Unknown Item';
    const quantity = item.quantity?.toString() || '0';
    const unitPrice = parseFloat(item.unit_price || 0);
    const totalPrice = parseFloat(item.total_price || 0);
    
    return [
      itemName,
      quantity,
      `$${unitPrice.toFixed(2)}`,
      `$${totalPrice.toFixed(2)}`
    ];
  });
};

export const generateInvoicePDF = (data: InvoiceData) => {
  const { sale, company = {}, settings = {} } = data;
  
  console.log('Starting invoice generation with data:', {
    saleId: sale?.id,
    invoiceNumber: sale?.invoice_number,
    companyName: company?.name,
    itemsCount: sale?.sale_items?.length
  });

  try {
    // Validate sale data
    const validationErrors = validateSaleData(sale);
    if (validationErrors.length > 0) {
      console.error('Sale data validation failed:', validationErrors);
      throw new Error(`Invalid sale data: ${validationErrors.join(', ')}`);
    }

    const doc = new jsPDF();

    // Header section
    doc.setFontSize(20);
    doc.text(company?.name || 'Your Company', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Invoice: ${sale.invoice_number}`, 20, 35);
    doc.text(`Date: ${new Date(sale.created_at).toLocaleDateString()}`, 20, 45);
    
    // Company information
    let yPosition = 55;
    if (company?.address) {
      doc.text(company.address, 20, yPosition);
      yPosition += 10;
    }
    if (company?.phone) {
      doc.text(`Phone: ${company.phone}`, 20, yPosition);
      yPosition += 10;
    }
    if (company?.email) {
      doc.text(`Email: ${company.email}`, 20, yPosition);
      yPosition += 10;
    }

    // Customer information
    if (sale.customer_name || sale.customer_email || sale.customer_phone) {
      doc.text('Bill To:', 120, 35);
      let customerY = 45;
      
      if (sale.customer_name) {
        doc.text(sale.customer_name, 120, customerY);
        customerY += 10;
      }
      if (sale.customer_email) {
        doc.text(sale.customer_email, 120, customerY);
        customerY += 10;
      }
      if (sale.customer_phone) {
        doc.text(sale.customer_phone, 120, customerY);
        customerY += 10;
      }
      if (sale.customer_address) {
        doc.text(sale.customer_address, 120, customerY);
      }
    }

    // Format and validate sale items
    const tableData = formatSaleItems(sale.sale_items || []);
    
    if (tableData.length === 0) {
      console.warn('No sale items found, adding placeholder row');
      tableData.push(['No items', '0', '$0.00', '$0.00']);
    }

    // Generate items table using autoTable
    autoTable(doc, {
      head: [['Item', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      startY: Math.max(yPosition + 10, 90),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 20, right: 20 },
    });

    // Calculate totals section position
    const finalY = (doc as any).lastAutoTable?.finalY || 150;
    const totalsX = 140;
    let totalsY = finalY + 15;
    
    // Display totals
    const subtotal = parseFloat(sale.subtotal || 0);
    const discountAmount = parseFloat(sale.discount_amount || 0);
    const taxAmount = parseFloat(sale.tax_amount || 0);
    const totalAmount = parseFloat(sale.total_amount || 0);
    
    doc.setFontSize(10);
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, totalsX, totalsY);
    totalsY += 10;
    
    if (discountAmount > 0) {
      doc.text(`Discount: -$${discountAmount.toFixed(2)}`, totalsX, totalsY);
      totalsY += 10;
    }
    
    if (taxAmount > 0) {
      doc.text(`Tax: $${taxAmount.toFixed(2)}`, totalsX, totalsY);
      totalsY += 10;
    }
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Total: $${totalAmount.toFixed(2)}`, totalsX, totalsY + 5);
    
    // Footer section
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    if (sale.notes) {
      doc.text(`Notes: ${sale.notes}`, 20, totalsY + 25);
      totalsY += 15;
    }
    
    doc.text('Thank you for your business!', 20, totalsY + 35);

    console.log('Invoice PDF generated successfully');
    return doc;
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    console.error('Sale data structure:', JSON.stringify(sale, null, 2));
    throw new Error(`Failed to generate invoice PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const downloadInvoice = (sale: any, company: any = {}, settings: any = {}) => {
  try {
    console.log('Starting invoice download for sale:', sale?.id);
    
    if (!sale) {
      throw new Error('Sale data is required for invoice generation');
    }
    
    if (!sale.invoice_number) {
      throw new Error('Invoice number is missing from sale data');
    }
    
    const doc = generateInvoicePDF({ sale, company, settings });
    const fileName = `invoice-${sale.invoice_number}.pdf`;
    
    console.log('Downloading invoice as:', fileName);
    doc.save(fileName);
    
  } catch (error) {
    console.error('Error downloading invoice:', error);
    throw error;
  }
};

export const printInvoice = (sale: any, company: any = {}, settings: any = {}) => {
  try {
    console.log('Starting invoice print for sale:', sale?.id);
    
    if (!sale) {
      throw new Error('Sale data is required for invoice generation');
    }
    
    if (!sale.invoice_number) {
      throw new Error('Invoice number is missing from sale data');
    }
    
    const doc = generateInvoicePDF({ sale, company, settings });
    doc.autoPrint();
    
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    
    if (!printWindow) {
      throw new Error('Failed to open print window. Please check your browser popup settings.');
    }
    
    console.log('Invoice sent to printer successfully');
    
  } catch (error) {
    console.error('Error printing invoice:', error);
    throw error;
  }
};
