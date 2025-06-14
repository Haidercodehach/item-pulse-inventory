
import React from 'react';

interface InvoiceTemplateProps {
  sale: any;
  company: any;
  settings: any;
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ sale, company, settings }) => {
  const subtotal = parseFloat(sale.subtotal || 0);
  const discountAmount = parseFloat(sale.discount_amount || 0);
  const taxAmount = parseFloat(sale.tax_amount || 0);
  const totalAmount = parseFloat(sale.total_amount || 0);

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{company?.name || 'Your Company'}</h1>
          {company?.address && <p className="text-gray-600">{company.address}</p>}
          {company?.phone && <p className="text-gray-600">Phone: {company.phone}</p>}
          {company?.email && <p className="text-gray-600">Email: {company.email}</p>}
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
          <p className="text-gray-600">#{sale.invoice_number}</p>
          <p className="text-gray-600">Date: {new Date(sale.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Customer Information */}
      {(sale.customer_name || sale.customer_email || sale.customer_phone) && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Bill To:</h3>
          <div className="text-gray-600">
            {sale.customer_name && <p>{sale.customer_name}</p>}
            {sale.customer_email && <p>{sale.customer_email}</p>}
            {sale.customer_phone && <p>{sale.customer_phone}</p>}
            {sale.customer_address && <p>{sale.customer_address}</p>}
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="border border-gray-300 px-4 py-3 text-left">Item</th>
              <th className="border border-gray-300 px-4 py-3 text-center">Qty</th>
              <th className="border border-gray-300 px-4 py-3 text-right">Unit Price</th>
              <th className="border border-gray-300 px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {(sale.sale_items || []).map((item: any, index: number) => {
              const itemName = item.inventory_items?.name || item.name || 'Unknown Item';
              const quantity = item.quantity || 0;
              const unitPrice = parseFloat(item.unit_price || 0);
              const totalPrice = parseFloat(item.total_price || 0);

              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3">{itemName}</td>
                  <td className="border border-gray-300 px-4 py-3 text-center">{quantity}</td>
                  <td className="border border-gray-300 px-4 py-3 text-right">${unitPrice.toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-3 text-right">${totalPrice.toFixed(2)}</td>
                </tr>
              );
            })}
            {(!sale.sale_items || sale.sale_items.length === 0) && (
              <tr>
                <td className="border border-gray-300 px-4 py-3" colSpan={4}>No items</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2 border-b border-gray-300">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-semibold">${subtotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-300">
              <span className="text-gray-600">Discount:</span>
              <span className="font-semibold text-red-600">-${discountAmount.toFixed(2)}</span>
            </div>
          )}
          {taxAmount > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-300">
              <span className="text-gray-600">Tax:</span>
              <span className="font-semibold">${taxAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 border-b-2 border-gray-800">
            <span className="text-lg font-bold">Total:</span>
            <span className="text-lg font-bold">${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-600">
        {sale.notes && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Notes:</h4>
            <p>{sale.notes}</p>
          </div>
        )}
        <p className="text-lg font-semibold">Thank you for your business!</p>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
