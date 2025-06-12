import { useState, useEffect } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { useSales } from '@/hooks/useSales';
import { useSettings } from '@/hooks/useSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Minus, Trash2, Receipt, Calculator } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CartItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
}

const POSSystem = () => {
  const { items, isLoading } = useInventory();
  const { processSale, isProcessing } = useSales();
  const { getSetting } = useSettings();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const invoiceSettings = getSetting('invoice_settings');
  const taxRate = invoiceSettings?.setting_value ? 
    (invoiceSettings.setting_value as { tax_rate: number }).tax_rate || 0.0875 : 
    0.0875;

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (item: any) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1, total: (cartItem.quantity + 1) * cartItem.price }
          : cartItem
      ));
    } else {
      setCart([...cart, {
        id: item.id,
        name: item.name,
        sku: item.sku,
        price: item.price || 0,
        quantity: 1,
        total: item.price || 0,
      }]);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCart(cart.map(item => 
      item.id === id 
        ? { ...item, quantity, total: quantity * item.price }
        : item
    ));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerInfo({ name: '', email: '', phone: '', address: '' });
    setDiscountAmount(0);
    setNotes('');
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal - discountAmount) * taxRate;
  const total = subtotal - discountAmount + taxAmount;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const saleData = {
      customer_name: customerInfo.name || null,
      customer_email: customerInfo.email || null,
      customer_phone: customerInfo.phone || null,
      customer_address: customerInfo.address || null,
      subtotal: subtotal.toFixed(2),
      tax_rate: taxRate.toString(),
      tax_amount: taxAmount.toFixed(2),
      discount_amount: discountAmount.toFixed(2),
      total_amount: total.toFixed(2),
      payment_method: paymentMethod,
      payment_status: 'paid',
      notes: notes || null,
    };

    const saleItems = cart.map(item => ({
      item_id: item.id,
      quantity: item.quantity,
      unit_price: item.price.toFixed(2),
      total_price: item.total.toFixed(2),
    }));

    try {
      await processSale({ saleData, saleItems });
      clearCart();
      setIsCheckoutOpen(false);
    } catch (error) {
      console.error('Error processing sale:', error);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading POS...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Product Search */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Product Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {filteredItems.map((item) => (
                <Card 
                  key={item.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => addToCart(item)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.sku}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold text-lg">${(item.price || 0).toFixed(2)}</span>
                      <Badge variant={item.quantity > 0 ? "default" : "destructive"}>
                        Stock: {item.quantity || 0}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cart */}
      <div className="space-y-4">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Cart ({cart.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto mb-4">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Cart is empty</p>
              ) : (
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 p-2 border rounded">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">${item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="text-sm font-medium">
                        ${item.total.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="space-y-4 border-t pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({(taxRate * 100).toFixed(2)}%):</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={clearCart}
                  >
                    Clear Cart
                  </Button>
                  <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Receipt className="w-4 h-4 mr-2" />
                        Checkout
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Complete Sale</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="customer-name">Customer Name</Label>
                            <Input
                              id="customer-name"
                              value={customerInfo.name}
                              onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                              placeholder="Optional"
                            />
                          </div>
                          <div>
                            <Label htmlFor="customer-phone">Phone</Label>
                            <Input
                              id="customer-phone"
                              value={customerInfo.phone}
                              onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                              placeholder="Optional"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="customer-email">Email</Label>
                          <Input
                            id="customer-email"
                            type="email"
                            value={customerInfo.email}
                            onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                            placeholder="Optional"
                          />
                        </div>

                        <div>
                          <Label htmlFor="discount">Discount Amount</Label>
                          <Input
                            id="discount"
                            type="number"
                            step="0.01"
                            value={discountAmount}
                            onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                          />
                        </div>

                        <div>
                          <Label htmlFor="payment-method">Payment Method</Label>
                          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="card">Card</SelectItem>
                              <SelectItem value="check">Check</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="notes">Notes</Label>
                          <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Optional notes..."
                            rows={3}
                          />
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-lg font-bold">
                            Total: ${total.toFixed(2)}
                          </div>
                        </div>

                        <Button 
                          className="w-full" 
                          onClick={handleCheckout}
                          disabled={isProcessing}
                        >
                          {isProcessing ? 'Processing...' : 'Complete Sale'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default POSSystem;
