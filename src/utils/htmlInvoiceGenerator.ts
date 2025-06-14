
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { createRoot } from 'react-dom/client';
import InvoiceTemplate from '@/components/InvoiceTemplate';
import React from 'react';

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

const renderInvoiceToCanvas = async (data: InvoiceData): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a temporary container
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = '800px';
      document.body.appendChild(container);

      // Create React root and render the invoice
      const root = createRoot(container);
      const invoiceElement = React.createElement(InvoiceTemplate, data);
      
      root.render(invoiceElement);

      // Wait for the component to render, then capture it
      setTimeout(async () => {
        try {
          const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: 800,
            height: container.scrollHeight || 1200
          });

          // Cleanup
          root.unmount();
          document.body.removeChild(container);
          
          resolve(canvas);
        } catch (error) {
          // Cleanup on error
          root.unmount();
          document.body.removeChild(container);
          reject(error);
        }
      }, 1000); // Give React time to render
    } catch (error) {
      reject(error);
    }
  });
};

export const generateInvoicePDF = async (data: InvoiceData): Promise<jsPDF> => {
  const { sale, company = {}, settings = {} } = data;
  
  console.log('Starting HTML-to-PDF invoice generation with data:', {
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

    // Render invoice to canvas
    const canvas = await renderInvoiceToCanvas(data);
    
    // Create PDF from canvas
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add the image to PDF
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    console.log('HTML-to-PDF invoice generated successfully');
    return pdf;
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    console.error('Sale data structure:', JSON.stringify(sale, null, 2));
    throw new Error(`Failed to generate invoice PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const downloadInvoice = async (sale: any, company: any = {}, settings: any = {}) => {
  try {
    console.log('Starting invoice download for sale:', sale?.id);
    
    if (!sale) {
      throw new Error('Sale data is required for invoice generation');
    }
    
    if (!sale.invoice_number) {
      throw new Error('Invoice number is missing from sale data');
    }
    
    const doc = await generateInvoicePDF({ sale, company, settings });
    const fileName = `invoice-${sale.invoice_number}.pdf`;
    
    console.log('Downloading invoice as:', fileName);
    doc.save(fileName);
    
  } catch (error) {
    console.error('Error downloading invoice:', error);
    throw error;
  }
};

export const printInvoice = async (sale: any, company: any = {}, settings: any = {}) => {
  try {
    console.log('Starting invoice print for sale:', sale?.id);
    
    if (!sale) {
      throw new Error('Sale data is required for invoice generation');
    }
    
    if (!sale.invoice_number) {
      throw new Error('Invoice number is missing from sale data');
    }
    
    const doc = await generateInvoicePDF({ sale, company, settings });
    
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    
    if (!printWindow) {
      throw new Error('Failed to open print window. Please check your browser popup settings.');
    }
    
    // Clean up the URL after a delay
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
    
    console.log('Invoice sent to printer successfully');
    
  } catch (error) {
    console.error('Error printing invoice:', error);
    throw error;
  }
};
