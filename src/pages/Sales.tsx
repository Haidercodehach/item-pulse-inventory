
import { useState } from 'react';
import { useSales } from '@/hooks/useSales';
import { useSettings } from '@/hooks/useSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Printer, Search, Receipt, DollarSign } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { downloadInvoice, printInvoice } from '@/utils/invoiceGenerator';

const Sales = () => {
  const { sales, salesLoading } = useSales();
  const { getSetting } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');

  const companyInfo = getSetting('company_info')?.setting_value || {};
  const invoiceSettings = getSetting('invoice_settings')?.setting_value || {};

  const filteredSales = sales.filter(sale => 
    sale.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sale.customer_name && sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount.toString()), 0);

  const handleDownloadInvoice = (sale: any) => {
    downloadInvoice(sale, companyInfo, invoiceSettings);
  };

  const handlePrintInvoice = (sale: any) => {
    printInvoice(sale, companyInfo, invoiceSettings);
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default">Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (salesLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading sales...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
          <p className="text-gray-600">View and manage your sales transactions</p>
        </div>
        <Card className="w-64">
          <CardContent className="flex items-center p-4">
            <DollarSign className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search Sales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by invoice number or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              <Receipt className="w-4 h-4 mr-1" />
              {filteredSales.length} sales found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales History</CardTitle>
          <CardDescription>
            View all sales transactions and download invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Receipt className="w-12 h-12 text-gray-400" />
                        <p className="text-gray-500">No sales found</p>
                        <p className="text-sm text-gray-400">
                          {searchTerm ? 'Try adjusting your search' : 'Sales will appear here once you make transactions'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-mono">{sale.invoice_number}</TableCell>
                      <TableCell>{sale.customer_name || 'Walk-in Customer'}</TableCell>
                      <TableCell>{new Date(sale.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{sale.sale_items?.length || 0} items</TableCell>
                      <TableCell className="font-semibold">${parseFloat(sale.total_amount.toString()).toFixed(2)}</TableCell>
                      <TableCell className="capitalize">{sale.payment_method || 'N/A'}</TableCell>
                      <TableCell>{getPaymentStatusBadge(sale.payment_status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadInvoice(sale)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handlePrintInvoice(sale)}
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sales;
