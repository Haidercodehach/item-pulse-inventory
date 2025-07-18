import { useInventory } from "@/hooks/useInventory";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { useMemo, useEffect, useState } from "react";

const Dashboard = () => {
  const { items, transactions, isLoading } = useInventory();
  const [soldItems, setSoldItems] = useState(0);

  const metrics = useMemo(() => {
    const totalItems = items
      .filter((item) => item.status === "available")
      .reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalValue = items.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    );
    const soldItems = items.filter((item) => item.status === "sold").length;

    const recentTransactions = transactions.slice(0, 7).reverse();

    return {
      totalItems,
      totalValue,
      soldItems,
      recentTransactions,
    };
  }, [items, transactions]);

  useEffect(() => {
    const soldCount = transactions.length;
    setSoldItems(soldCount);
  }, [transactions]);

  const categoryData = useMemo(() => {
    const categoryMap = new Map();
    items.forEach((item) => {
      const category = item.categories?.name || "Uncategorized";
      categoryMap.set(
        category,
        (categoryMap.get(category) || 0) + (item.quantity || 0)
      );
    });

    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [items]);

  const COLORS = ["#F72585", "#7209B7", "#3A0CA3", "#4361EE", "#4CC9F0"];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-vibrant relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute top-20 -left-20 w-60 h-60 bg-white/5 rounded-full animate-bounce-slow"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/15 rounded-full animate-pulse-slow"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="animate-pulse-slow">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center glass">
              <Sparkles className="w-8 h-8 text-white animate-float" />
            </div>
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

      <div className="relative z-10 p-6 space-y-6 animate-fade-in">
        <div className="bg-gradient-cool rounded-2xl p-8 text-white animate-slide-up">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8 animate-float" />
            Dashboard
          </h1>
          <p className="text-white/80">
            Overview of your inventory management system
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            className="hover-lift animate-slide-up glass border-white/20 backdrop-blur-md"
            style={{ animationDelay: "100ms" }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">
                Total Items
              </CardTitle>
              <div className="p-2 bg-gradient-cool rounded-lg">
                <Package className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {metrics.totalItems}
              </div>
              <p className="text-xs text-white/70">Unique inventory items</p>
            </CardContent>
          </Card>

          {/* <Card
            className="hover-lift animate-slide-up glass border-white/20 backdrop-blur-md"
            style={{ animationDelay: "200ms" }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">
                Total Value
              </CardTitle>
              <div className="p-2 bg-gradient-warm rounded-lg">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                €{metrics.totalValue.toFixed(2)}
              </div>
              <p className="text-xs text-white/70">Current inventory value</p>
            </CardContent>
          </Card> */}

          <Card
            className="hover-lift animate-slide-up glass border-white/20 backdrop-blur-md"
            style={{ animationDelay: "300ms" }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">
                Total Sold Items
              </CardTitle>
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-200">
                {soldItems}
              </div>
              <p className="text-xs text-white/70">Items sold</p>
            </CardContent>
          </Card>

          {/* <Card
            className="hover-lift animate-slide-up glass border-white/20 backdrop-blur-md"
            style={{ animationDelay: "400ms" }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">
                Recent Transactions
              </CardTitle>
              <div className="p-2 bg-gradient-to-r from-gradient-cyan to-gradient-teal rounded-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {transactions.length}
              </div>
              <p className="text-xs text-white/70">Total transactions</p>
            </CardContent>
          </Card> */}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card
            className="hover-lift animate-slide-up glass border-white/20 backdrop-blur-md"
            style={{ animationDelay: "500ms" }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <div className="w-2 h-2 bg-gradient-vibrant rounded-full animate-pulse-slow"></div>
                Inventory by Category
              </CardTitle>
              <CardDescription className="text-white/70">
                Distribution of items across categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card
            className="hover-lift animate-slide-up glass border-white/20 backdrop-blur-md"
            style={{ animationDelay: "600ms" }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <div className="w-2 h-2 bg-gradient-cool rounded-full animate-pulse-slow"></div>
                Recent Transaction Trends
              </CardTitle>
              <CardDescription className="text-white/70">
                Last 7 transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.recentTransactions}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.2)"
                  />
                  <XAxis
                    dataKey="created_at"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                    stroke="rgba(255,255,255,0.7)"
                  />
                  <YAxis stroke="rgba(255,255,255,0.7)" />
                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="new_quantity"
                    stroke="url(#gradient1)"
                    strokeWidth={3}
                    dot={{ fill: "#4361EE", strokeWidth: 2, r: 4 }}
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
      </div>
    </div>
  );
};

export default Dashboard;
