
import { useState } from "react";
import { useInventory } from "@/hooks/useInventory";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Package,
  Sparkles,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import ItemForm from "@/components/ItemForm";
import { useToast } from "@/hooks/use-toast";

const Inventory = () => {
  const { items, categories, suppliers, deleteItem, isLoading, isDeleting } =
    useInventory();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.color &&
        item.color.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.condition &&
        item.condition.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" || item.category_id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (itemId: string, itemName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
      )
    ) {
      deleteItem(itemId);
    }
  };

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity === 0)
      return { label: "Out of Stock", variant: "destructive" as const };
    if (quantity <= minStock)
      return { label: "Low Stock", variant: "secondary" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  const AddItemForm = () => (
    <ItemForm
      onSuccess={() => setIsAddDialogOpen(false)}
      categories={categories}
      suppliers={suppliers}
    />
  );

  const EditItemForm = () => (
    <ItemForm
      item={editingItem}
      onSuccess={() => setEditingItem(null)}
      categories={categories}
      suppliers={suppliers}
    />
  );

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

      <div className="relative z-10 space-y-3 md:space-y-6 p-3 md:p-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-cool rounded-xl md:rounded-2xl p-4 md:p-8 text-white animate-slide-up gap-3 sm:gap-0">
          <div>
            <h1 className="text-xl md:text-3xl font-bold mb-1 md:mb-2 flex items-center gap-2 md:gap-3">
              <Package className="w-5 h-5 md:w-8 md:h-8 animate-float" />
              Inventory Management
            </h1>
            <p className="text-white/80 text-xs md:text-base">
              Manage your inventory items, track stock levels, and more
            </p>
          </div>

          {isMobile ? (
            <Drawer open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DrawerTrigger asChild>
                <Button className="bg-white text-primary hover:bg-white/90 hover-lift w-full sm:w-auto text-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </DrawerTrigger>
              <DrawerContent className="glass border-white/20 backdrop-blur-md">
                <DrawerHeader>
                  <DrawerTitle className="text-white">Add New Item</DrawerTitle>
                </DrawerHeader>
                <div className="p-4">
                  <AddItemForm />
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
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
                <AddItemForm />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Filters */}
        <Card
          className="glass border-white/20 hover-lift animate-slide-up"
          style={{ animationDelay: "200ms" }}
        >
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="flex items-center gap-2 text-white text-base md:text-lg">
              <Filter className="w-4 h-4" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm text-sm"
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white backdrop-blur-sm text-sm">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs md:text-sm text-white/80 flex items-center justify-center sm:justify-start bg-white/5 rounded-md px-3 py-2">
                <Package className="w-4 h-4 mr-1" />
                {filteredItems.length} items found
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table - Mobile Optimized */}
        <Card
          className="glass border-white/20 hover-lift animate-slide-up"
          style={{ animationDelay: "300ms" }}
        >
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-white text-base md:text-lg">Items</CardTitle>
            <CardDescription className="text-white/80 text-xs md:text-sm">
              Manage your inventory items and track stock levels
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 md:p-6">
            {isMobile ? (
              // Mobile Card Layout
              <div className="space-y-3 p-3">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="w-12 h-12 text-white/40" />
                      <p className="text-white/60">No items found</p>
                      <p className="text-sm text-white/40">
                        {searchTerm || selectedCategory !== "all"
                          ? "Try adjusting your filters"
                          : "Add your first inventory item to get started"}
                      </p>
                    </div>
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const status = getStockStatus(
                      item.quantity || 0,
                      item.min_stock_level || 0
                    );
                    return (
                      <Card key={item.id} className="bg-white/5 border-white/20">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-white text-sm truncate">
                                {item.name}
                              </h3>
                              <p className="text-xs text-white/70 font-mono">
                                {item.sku}
                              </p>
                            </div>
                            <Badge variant={status.variant} className="text-xs ml-2">
                              {status.label}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                            {item.categories?.name && (
                              <div>
                                <span className="text-white/60">Category:</span>
                                <span className="text-white ml-1">{item.categories.name}</span>
                              </div>
                            )}
                            <div>
                              <span className="text-white/60">Price:</span>
                              <span className="text-white ml-1">€{(item.price || 0).toFixed(2)}</span>
                            </div>
                            {item.color && (
                              <div>
                                <span className="text-white/60">Color:</span>
                                <span className="text-white ml-1">{item.color}</span>
                              </div>
                            )}
                            {item.condition && (
                              <div>
                                <span className="text-white/60">Condition:</span>
                                <span className="text-white ml-1">{item.condition}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Drawer>
                              <DrawerTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingItem(item)}
                                  className="flex-1 border-white/30 bg-primary text-white hover:bg-white hover:text-primary text-xs"
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                              </DrawerTrigger>
                              <DrawerContent className="glass border-white/20 backdrop-blur-md">
                                <DrawerHeader>
                                  <DrawerTitle className="text-white">
                                    Edit Item
                                  </DrawerTitle>
                                </DrawerHeader>
                                <div className="p-4">
                                  <EditItemForm />
                                </div>
                              </DrawerContent>
                            </Drawer>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(item.id, item.name)}
                              disabled={isDeleting}
                              className="flex-1 border-white/30 text-red-400 hover:bg-red-500 hover:text-white text-xs"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            ) : (
              // Desktop Table Layout
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/20">
                      <TableHead className="text-white/90 min-w-[120px]">
                        Name
                      </TableHead>
                      <TableHead className="text-white/90 min-w-[100px]">
                        SKU
                      </TableHead>
                      <TableHead className="text-white/90 min-w-[100px]">
                        Category
                      </TableHead>
                      <TableHead className="text-white/90 min-w-[100px]">
                        Color
                      </TableHead>
                      <TableHead className="text-white/90 min-w-[100px]">
                        Condition
                      </TableHead>
                      <TableHead className="text-white/90 min-w-[100px]">
                        Storage
                      </TableHead>
                      <TableHead className="text-white/90 min-w-[80px]">
                        Price
                      </TableHead>
                      <TableHead className="text-white/90 min-w-[100px]">
                        Status
                      </TableHead>
                      <TableHead className="text-white/90 min-w-[120px]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <Package className="w-12 h-12 text-white/40" />
                            <p className="text-white/60">No items found</p>
                            <p className="text-sm text-white/40">
                              {searchTerm || selectedCategory !== "all"
                                ? "Try adjusting your filters"
                                : "Add your first inventory item to get started"}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map((item) => {
                        const status = getStockStatus(
                          item.quantity || 0,
                          item.min_stock_level || 0
                        );
                        return (
                          <TableRow
                            key={item.id}
                            className="border-white/20 hover:bg-white/5"
                          >
                            <TableCell className="font-medium text-white text-sm">
                              {item.name}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-white/80">
                              {item.sku}
                            </TableCell>
                            <TableCell className="text-white/80 text-sm">
                              {item.categories?.name || "-"}
                            </TableCell>
                            <TableCell className="text-white/80 text-sm">
                              {item.color || "-"}
                            </TableCell>
                            <TableCell className="text-white/80 text-sm">
                              {item.condition || "-"}
                            </TableCell>
                            <TableCell className="text-white/80 text-sm">
                              {item.storage || "-"}
                            </TableCell>
                            <TableCell className="text-white text-sm">
                              €{(item.price || 0).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={status.variant} className="text-xs">
                                {status.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setEditingItem(item)}
                                      className="border-white/30 text-white bg-primary hover:bg-white hover:text-primary"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl glass border-white/20 backdrop-blur-md">
                                    <DialogHeader>
                                      <DialogTitle className="text-white">
                                        Edit Item
                                      </DialogTitle>
                                    </DialogHeader>
                                    <EditItemForm />
                                  </DialogContent>
                                </Dialog>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(item.id, item.name)}
                                  disabled={isDeleting}
                                  className="border-white/30 text-red-500 hover:bg-red-500 hover:text-white"
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Inventory;
