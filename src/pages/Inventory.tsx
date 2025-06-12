
import { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Edit, Trash2, Package, Sparkles } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ItemForm from '@/components/ItemForm';
import { useToast } from '@/hooks/use-toast';

const Inventory = () => {
  const { items, categories, suppliers, deleteItem, isLoading, isDeleting } = useInventory();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSupplier, setSelectedSupplier] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    const matchesSupplier = selectedSupplier === 'all' || item.supplier_id === selectedSupplier;
    
    return matchesSearch && matchesCategory && matchesSupplier;
  });

  const handleDelete = async (itemId: string, itemName: string) => {
    if (window.confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
      deleteItem(itemId);
    }
  };

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (quantity <= minStock) return { label: 'Low Stock', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  if (isLoading) {
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
              <Package className="w-8 h-8 animate-float" />
              Inventory Management
            </h1>
            <p className="text-white/80">Manage your inventory items, track stock levels, and more</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-primary hover:bg-white/90 hover-lift">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl glass border-white/20 backdrop-blur-md">
              <DialogHeader>
                <DialogTitle className="text-white">Add New Item</DialogTitle>
              </DialogHeader>
              <ItemForm 
                onSuccess={() => setIsAddDialogOpen(false)}
                categories={categories}
                suppliers={suppliers}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="glass border-white/20 hover-lift animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Filter className="w-4 h-4" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                  <SelectValue placeholder="All Suppliers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Suppliers</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-sm text-white/80 flex items-center">
                <Package className="w-4 h-4 mr-1" />
                {filteredItems.length} items found
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card className="glass border-white/20 hover-lift animate-slide-up" style={{ animationDelay: '300ms' }}>
          <CardHeader>
            <CardTitle className="text-white">Items</CardTitle>
            <CardDescription className="text-white/80">
              Manage your inventory items and track stock levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="text-white/90">Name</TableHead>
                    <TableHead className="text-white/90">SKU</TableHead>
                    <TableHead className="text-white/90">Category</TableHead>
                    <TableHead className="text-white/90">Supplier</TableHead>
                    <TableHead className="text-white/90">Quantity</TableHead>
                    <TableHead className="text-white/90">Price</TableHead>
                    <TableHead className="text-white/90">Status</TableHead>
                    <TableHead className="text-white/90">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Package className="w-12 h-12 text-white/40" />
                          <p className="text-white/60">No items found</p>
                          <p className="text-sm text-white/40">
                            {searchTerm || selectedCategory !== 'all' || selectedSupplier !== 'all'
                              ? 'Try adjusting your filters'
                              : 'Add your first inventory item to get started'
                            }
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => {
                      const status = getStockStatus(item.quantity || 0, item.min_stock_level || 0);
                      return (
                        <TableRow key={item.id} className="border-white/20 hover:bg-white/5">
                          <TableCell className="font-medium text-white">{item.name}</TableCell>
                          <TableCell className="font-mono text-sm text-white/80">{item.sku}</TableCell>
                          <TableCell className="text-white/80">{item.categories?.name || '-'}</TableCell>
                          <TableCell className="text-white/80">{item.suppliers?.name || '-'}</TableCell>
                          <TableCell className="text-white">
                            <span className={item.quantity === 0 ? 'text-red-400 font-semibold' : ''}>
                              {item.quantity || 0}
                            </span>
                            {item.min_stock_level && (
                              <span className="text-white/60 text-sm ml-1">
                                (min: {item.min_stock_level})
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-white">${(item.price || 0).toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setEditingItem(item)}
                                    className="border-white/30 text-white hover:bg-white hover:text-primary"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl glass border-white/20 backdrop-blur-md">
                                  <DialogHeader>
                                    <DialogTitle className="text-white">Edit Item</DialogTitle>
                                  </DialogHeader>
                                  <ItemForm 
                                    item={editingItem}
                                    onSuccess={() => setEditingItem(null)}
                                    categories={categories}
                                    suppliers={suppliers}
                                  />
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(item.id, item.name)}
                                disabled={isDeleting}
                                className="border-white/30 text-white hover:bg-red-500 hover:text-white"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
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

export default Inventory;
