import { useState } from 'react';
import { useSales } from '@/hooks/useSales';
import { useSettings } from '@/hooks/useSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Printer, Search, Receipt, DollarSign, Sparkles } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { downloadInvoice, printInvoice } from '@/utils/htmlInvoiceGenerator';
import { useToast } from '@/hooks/use-toast';

const Sales = () => {
  const { sales, salesLoading } = useSales();
  const { getSetting } = useSettings();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState<string | null>(null);

  const companyInfo = getSetting('company_info')?.setting_value || {};
  const invoiceSettings = getSetting('invoice_settings')?.setting_value || {};

  const filteredSales = sales.filter(sale => 
    sale.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sale.customer_name && sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount.toString()), 0);

  const validateSaleForInvoice = (sale: any): string | null => {
    if (!sale) return 'Sale data is missing';
    if (!sale.invoice_number) return 'Invoice number is missing';
    if (!sale.id) return 'Sale ID is missing';
    if (!sale.created_at) return 'Sale date is missing';
    if (sale.total_amount === undefined || sale.total_amount === null) return 'Total amount is missing';
    return null;
  };

  const handleDownloadInvoice = async (sale: any) => {
    try {
      setIsDownloading(sale.id);
      
      // Validate sale data
      const validationError = validateSaleForInvoice(sale);
      if (validationError) {
        throw new Error(validationError);
      }
      
      console.log('Downloading invoice for sale:', {
        id: sale.id,
        invoice_number: sale.invoice_number,
        items_count: sale.sale_items?.length || 0
      });
      
      await downloadInvoice(sale, companyInfo, invoiceSettings);
      
      toast({
        title: "Success",
        description: `Invoice ${sale.invoice_number} downloaded successfully!`,
      });
    } catch (error: any) {
      console.error('Download error:', error);
      
      const errorMessage = error?.message || 'Failed to download invoice';
      
      toast({
        title: "Download Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDownloading(null);
    }
  };

  const handlePrintInvoice = async (sale: any) => {
    try {
      setIsPrinting(sale.id);
      
      // Validate sale data
      const validationError = validateSaleForInvoice(sale);
      if (validationError) {
        throw new Error(validationError);
      }
      
      console.log('Printing invoice for sale:', {
        id: sale.id,
        invoice_number: sale.invoice_number,
        items_count: sale.sale_items?.length || 0
      });
      
      await printInvoice(sale, companyInfo, invoiceSettings);
      
      toast({
        title: "Success",
        description: `Invoice ${sale.invoice_number} sent to printer!`,
      });
    } catch (error: any) {
      console.error('Print error:', error);
      
      const errorMessage = error?.message || 'Failed to print invoice';
      
      toast({
        title: "Print Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsPrinting(null);
    }
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
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-vibrant">
        <div className="animate-pulse-slow">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center glass">
            <Sparkles className="w-8 h-8 text-white animate-float" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-vibrant relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute top-20 -left-20 w-60 h-60 bg-white/5 rounded-full animate-bounce-slow"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/15 rounded-full animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 space-y-6 p-6 animate-fade-in">
        <div className="flex justify-between items-center bg-gradient-cool rounded-2xl p-8 text-white animate-slide-up">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Receipt className="w-8 h-8 animate-float" />
              Sales Management
            </h1>
            <p className="text-white/80">View and manage your sales transactions</p>
          </div>
          <Card className="w-64 glass border-white/20">
            <CardContent className="flex items-center p-4">
              <DollarSign className="w-8 h-8 text-green-400 mr-3 animate-pulse" />
              <div>
                <p className="text-sm text-white/80">Total Revenue</p>
                <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="glass border-white/20 hover-lift animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Search className="w-4 h-4" />
              Search Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                <Input
                  placeholder="Search by invoice number or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm"
                />
              </div>
              <div className="text-sm text-white/80 flex items-center">
                <Receipt className="w-4 h-4 mr-1" />
                {filteredSales.length} sales found
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Table */}
        <Card className="glass border-white/20 hover-lift animate-slide-up" style={{ animationDelay: '300ms' }}>
          <CardHeader>
            <CardTitle className="text-white">Sales History</CardTitle>
            <CardDescription className="text-white/80">
              View all sales transactions and download invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="text-white/90">Invoice #</TableHead>
                    <TableHead className="text-white/90">Customer</TableHead>
                    <TableHead className="text-white/90">Date</TableHead>
                    <TableHead className="text-white/90">Items</TableHead>
                    <TableHead className="text-white/90">Total</TableHead>
                    <TableHead className="text-white/90">Payment</TableHead>
                    <TableHead className="text-white/90">Status</TableHead>
                    <TableHead className="text-white/90">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Receipt className="w-12 h-12 text-white/40" />
                          <p className="text-white/60">No sales found</p>
                          <p className="text-sm text-white/40">
                            {searchTerm ? 'Try adjusting your search' : 'Sales will appear here once you make transactions'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSales.map((sale) => (
                      <TableRow key={sale.id} className="border-white/20 hover:bg-white/5">
                        <TableCell className="font-mono text-white">{sale.invoice_number}</TableCell>
                        <TableCell className="text-white">{sale.customer_name || 'Walk-in Customer'}</TableCell>
                        <TableCell className="text-white/80">{new Date(sale.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-white/80">{sale.sale_items?.length || 0} items</TableCell>
                        <TableCell className="font-semibold text-white">${parseFloat(sale.total_amount.toString()).toFixed(2)}</TableCell>
                        <TableCell className="capitalize text-white/80">{sale.payment_method || 'N/A'}</TableCell>
                        <TableCell>{getPaymentStatusBadge(sale.payment_status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadInvoice(sale)}
                              disabled={isDownloading === sale.id}
                              className="border-white/30 text-white hover:bg-white hover:text-primary"
                              title="Download Invoice PDF"
                            >
                              {isDownloading === sale.id ? (
                                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handlePrintInvoice(sale)}
                              disabled={isPrinting === sale.id}
                              className="border-white/30 text-white hover:bg-white hover:text-primary"
                              title="Print Invoice"
                            >
                              {isPrinting === sale.id ? (
                                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              ) : (
                                <Printer className="w-4 h-4" />
                              )}
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
    </div>
  );
};

export default Sales;
