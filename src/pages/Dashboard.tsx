
import { useInventory } from '@/hooks/useInventory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Package, TrendingUp, AlertTriangle, DollarSign, Sparkles } from 'lucide-react';
import { useMemo } from 'react';

const Dashboard = () => {
  const { items, transactions, isLoading } = useInventory();

  const metrics = useMemo(() => {
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
    const lowStockItems = items.filter(item => 
      item.quantity !== null && 
      item.min_stock_level !== null && 
      item.quantity <= item.min_stock_level
    ).length;
    
    const recentTransactions = transactions.slice(0, 7).reverse();
    
    return {
      totalItems,
      totalValue,
      lowStockItems,
      recentTransactions,
    };
  }, [items, transactions]);

  const categoryData = useMemo(() => {
    const categoryMap = new Map();
    items.forEach(item => {
      const category = item.categories?.name || 'Uncategorized';
      categoryMap.set(category, (categoryMap.get(category) || 0) + (item.quantity || 0));
    });
    
    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [items]);

  const COLORS = ['#F72585', '#7209B7', '#3A0CA3', '#4361EE', '#4CC9F0'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse-slow">
          <div className="w-16 h-16 bg-gradient-vibrant rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white animate-float" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-cool rounded-2xl p-8 text-white animate-slide-up">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-white/80">Overview of your inventory management system</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-lift animate-slide-up glass border-gradient-pink/20" style={{ animationDelay: '100ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <div className="p-2 bg-gradient-cool rounded-lg">
              <Package className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-cool bg-clip-text text-transparent">{metrics.totalItems}</div>
            <p className="text-xs text-muted-foreground">Unique inventory items</p>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-slide-up glass border-gradient-purple/20" style={{ animationDelay: '200ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <div className="p-2 bg-gradient-warm rounded-lg">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-warm bg-clip-text text-transparent">${metrics.totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Current inventory value</p>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-slide-up glass border-gradient-blue/20" style={{ animationDelay: '300ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Items below minimum level</p>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-slide-up glass border-gradient-cyan/20" style={{ animationDelay: '400ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
            <div className="p-2 bg-gradient-to-r from-gradient-cyan to-gradient-teal rounded-lg">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-gradient-cyan to-gradient-teal bg-clip-text text-transparent">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">Total transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover-lift animate-slide-up glass" style={{ animationDelay: '500ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-vibrant rounded-full animate-pulse-slow"></div>
              Inventory by Category
            </CardTitle>
            <CardDescription>Distribution of items across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-slide-up glass" style={{ animationDelay: '600ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-cool rounded-full animate-pulse-slow"></div>
              Recent Transaction Trends
            </CardTitle>
            <CardDescription>Last 7 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.recentTransactions}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="created_at" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  stroke="#64748b"
                />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="new_quantity" 
                  stroke="url(#gradient1)"
                  strokeWidth={3}
                  dot={{ fill: '#4361EE', strokeWidth: 2, r: 4 }}
                />
                <defs>
                  <linearGradient id="gradient1" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#F72585" />
                    <stop offset="100%" stopColor="#4CC9F0" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {metrics.lowStockItems > 0 && (
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 hover-lift animate-slide-up" style={{ animationDelay: '700ms' }}>
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
              Low Stock Alert
            </CardTitle>
            <CardDescription className="text-orange-600">
              {metrics.lowStockItems} items are running low on stock
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {items
                .filter(item => 
                  item.quantity !== null && 
                  item.min_stock_level !== null && 
                  item.quantity <= item.min_stock_level
                )
                .slice(0, 5)
                .map((item, index) => (
                  <div key={item.id} className="flex justify-between text-sm p-2 bg-white/50 rounded-lg animate-slide-in-right" style={{ animationDelay: `${index * 100}ms` }}>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-orange-600 font-semibold">
                      {item.quantity} / {item.min_stock_level} minimum
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
