import { useState, useEffect } from "react";
import { useInventory } from "@/hooks/useInventory";
import { useSales } from "@/hooks/useSales";
import { useSettings } from "@/hooks/useSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  Calculator,
  ShoppingCart,
  Zap,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const invoiceSettings = getSetting("invoice_settings");
  const taxRate = invoiceSettings?.setting_value
    ? (invoiceSettings.setting_value as { tax_rate: number }).tax_rate || 0.22
    : 0.22;

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (item: any) => {
    // Check if item has sufficient stock
    if (!item.quantity || item.quantity <= 0) {
      console.warn("Insufficient stock for item:", item.name);
      return;
    }

    const existingItem = cart.find((cartItem) => cartItem.id === item.id);

    if (existingItem) {
      // Check if adding one more would exceed available stock
      if (existingItem.quantity >= item.quantity) {
        console.warn("Cannot add more items - insufficient stock");
        return;
      }

      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
                total: (cartItem.quantity + 1) * cartItem.price,
              }
            : cartItem
        )
      );
    } else {
      setCart([
        ...cart,
        {
          id: item.id,
          name: item.name,
          sku: item.sku,
          price: item.price || 0,
          quantity: 1,
          total: item.price || 0,
        },
      ]);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    // Find the inventory item to check stock
    const inventoryItem = items.find((item) => item.id === id);
    if (inventoryItem && quantity > inventoryItem.quantity) {
      console.warn("Cannot set quantity higher than available stock");
      return;
    }

    setCart(
      cart.map((item) =>
        item.id === id
          ? { ...item, quantity, total: quantity * item.price }
          : item
      )
    );
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerInfo({ name: "", email: "", phone: "", address: "" });
    setDiscountAmount(0);
    setNotes("");
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = 0;
  const total = subtotal - discountAmount;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const saleData = {
      customer_name: customerInfo.name || null,
      customer_email: customerInfo.email || null,
      customer_phone: customerInfo.phone || null,
      customer_address: customerInfo.address || null,
      subtotal: subtotal.toFixed(2),
      tax_rate: taxRate.toString(), // Save 22% tax rate for records
      tax_amount: taxAmount.toFixed(2), // Save 0.00 as tax amount
      discount_amount: discountAmount.toFixed(2),
      total_amount: total.toFixed(2),
      payment_method: paymentMethod,
      payment_status: "paid",
      notes: notes || null,
    };

    const saleItems = cart.map((item) => ({
      item_id: item.id,
      quantity: item.quantity,
      unit_price: item.price.toFixed(2),
      total_price: item.total.toFixed(2),
    }));

    try {
      console.log("Processing sale with data:", { saleData, saleItems });
      await processSale({ saleData, saleItems });
      clearCart();
      setIsCheckoutOpen(false);
    } catch (error) {
      console.error("Error processing sale:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="glass rounded-xl p-8 flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white"></div>
          <p className="text-white/90 font-medium text-lg">
            Loading POS System...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-[calc(100vh-12rem)] p-4 md:p-6">
      {/* Product Search Section */}
      <div className="xl:col-span-2 space-y-6">
        <Card className="glass border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-300 backdrop-blur-lg">
          <CardHeader className="pb-3 border-b border-white/10">
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="bg-gradient-warm p-2.5 rounded-lg shadow-lg hover-glow">
                <Search className="w-5 h-5" />
              </div>
              <span className="text-lg">Product Search</span>
              <Badge
                variant="secondary"
                className="ml-auto bg-white/20 text-white border-white/30 px-3"
              >
                {filteredItems.length} items
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
              <Input
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/20 border border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:ring-2 focus:ring-primary/40 transition-all rounded-lg shadow-sm hover:bg-white/25"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 bg-white/20 border border-white/40 hover:scale-90 group rounded-xl hover-lift"
                  onClick={() => addToCart(item)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-base text-white group-hover:text-white truncate pr-2">
                        {item.name}
                      </h3>
                      <Zap className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs text-white/70 mb-3">{item.sku}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg text-white">
                        €{(item.price || 0).toFixed(2)}
                      </span>
                      <Badge
                        variant={
                          item.quantity > 10
                            ? "default"
                            : item.quantity > 0
                            ? "secondary"
                            : "destructive"
                        }
                        className={`rounded-full mx-2 px-3 py-1 text-xs font-semibold shadow-sm border ${
                          item.quantity > 10
                            ? "bg-green-100 text-green-800 border-green-200"
                            : item.quantity > 0
                            ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        }`}
                      >
                        Stock: {item.quantity || 0}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredItems.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60">
                    No products found matching your search
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shopping Cart Section */}
      <div className="space-y-6">
        <Card className="glass border border-white/30 shadow-2xl h-full flex flex-col backdrop-blur-lg">
          <CardHeader className="pb-3 border-b border-white/10">
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="bg-gradient-warm p-2.5 rounded-lg shadow-lg hover-glow">
                <Calculator className="w-5 h-5" />
              </div>
              <span className="text-center text-lg">Shopping Cart</span>
              <Badge
                variant="secondary"
                className=" text-center bg-white/20 text-white border-white/30 px-3"
              >
                {cart.length} items
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-4">
            <div className="flex-1 overflow-y-auto mb-4 custom-scrollbar pr-2">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60 text-lg font-medium mb-2">
                    Your cart is empty
                  </p>
                  <p className="text-white/40 text-sm">
                    Add products to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="transition-all flex-col items-center gap-3 hover:shadow-lg border-b border-white/30 pb-4"
                    >
                      <div className="flex-1 min-w-0 text-xl text-white text-center break-after-all">
                        {item.name}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0 bg-white/20 border-white/30 text-white hover:bg-white/30 transition-colors"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-base text-white font-semibold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0 bg-white/20 border-white/30 text-white hover:bg-white/30 transition-colors"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0 bg-red-500/30 border-red-300/30 text-red-300 hover:bg-red-500/40 ml-1.5 transition-colors"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                        <div className="text-base font-bold text-white min-w-[70px] text-right">
                          €{item.total.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="space-y-4 border-t border-white/20 pt-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 space-y-2.5 shadow-lg">
                  <div className="flex justify-between text-white/90">
                    <span>Subtotal:</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white/90">
                    <span>Discount:</span>
                    <span>-€{discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white/90">
                    <span>Tax ({(taxRate * 100).toFixed(0)}%):</span>
                    <span>€{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-white border-t border-white/20 pt-2.5 mt-2">
                    <span>Total:</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full bg-white/20 border-white/30 text-white hover:bg-white/30 transition-colors"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </Button>
                  <Dialog
                    open={isCheckoutOpen}
                    onOpenChange={setIsCheckoutOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="w-full bg-gradient-warm hover:opacity-90 text-white font-semibold py-3 shadow-lg rounded-lg transition-all hover:shadow-xl">
                        <Receipt className="w-4 h-4 mr-2" />
                        Checkout - €{total.toFixed(2)}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl p-6">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                          <Receipt className="w-5 h-5" />
                          Complete Sale
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="customer-name">Customer Name</Label>
                            <Input
                              id="customer-name"
                              value={customerInfo.name}
                              onChange={(e) =>
                                setCustomerInfo({
                                  ...customerInfo,
                                  name: e.target.value,
                                })
                              }
                              placeholder="Optional"
                              className="rounded-lg border-gray-300 focus:border-yellow-400"
                            />
                          </div>
                          <div>
                            <Label htmlFor="customer-phone">Phone</Label>
                            <Input
                              id="customer-phone"
                              value={customerInfo.phone}
                              onChange={(e) =>
                                setCustomerInfo({
                                  ...customerInfo,
                                  phone: e.target.value,
                                })
                              }
                              placeholder="Optional"
                              className="rounded-lg border-gray-300 focus:border-yellow-400"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="customer-email">Email</Label>
                          <Input
                            id="customer-email"
                            type="email"
                            value={customerInfo.email}
                            onChange={(e) =>
                              setCustomerInfo({
                                ...customerInfo,
                                email: e.target.value,
                              })
                            }
                            placeholder="Optional"
                            className="rounded-lg border-gray-300 focus:border-yellow-400"
                          />
                        </div>

                        <div>
                          <Label htmlFor="discount">Discount Amount</Label>
                          <Input
                            id="discount"
                            type="number"
                            step="0.01"
                            value={discountAmount}
                            onChange={(e) =>
                              setDiscountAmount(parseFloat(e.target.value) || 0)
                            }
                            placeholder="0.00"
                            className="rounded-lg border-gray-300 focus:border-yellow-400"
                          />
                        </div>

                        <div>
                          <Label htmlFor="payment-method">Payment Method</Label>
                          <Select
                            value={paymentMethod}
                            onValueChange={setPaymentMethod}
                          >
                            <SelectTrigger className="rounded-lg border-gray-300 focus:border-yellow-400">
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
                            className="rounded-lg border-gray-300 focus:border-yellow-400"
                          />
                        </div>

                        <div className="bg-gradient-warm p-4 rounded-lg text-white shadow-md">
                          <div className="text-lg font-bold text-center">
                            Total: €{total.toFixed(2)}
                          </div>
                        </div>

                        <Button
                          className="w-full bg-gradient-cool hover:opacity-90 text-white font-semibold py-3 rounded-lg"
                          onClick={handleCheckout}
                          disabled={isProcessing}
                        >
                          {isProcessing ? "Processing..." : "Complete Sale"}
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
