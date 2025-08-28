import React, { useState, useEffect } from "react";
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  CreditCard,
  MessageSquare,
  Bell,
  UserCheck,
  UserX,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS, API_CONFIG } from "../config/constants";
import { useApp } from "../contexts/AppContext";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import StatsCard from "../components/common/StatsCard";

const Dashboard = () => {
  const { addNotification } = useApp();
  const [stats, setStats] = useState({
    totalRevenue: 8290282.0,
    totalRevenueThisYear: 89131.0,
    totalRevenueThisMonth: 9432.0,
    totalTransactions: 30912,
    totalTransactionsThisMonth: 89,
    totalTransactionsThisYear: 989,
  });

  // Revenue chart data (monthly)
  const [revenueData] = useState([
    { month: "Jan", revenue: 45000, users: 1200, transactions: 450 },
    { month: "Feb", revenue: 52000, users: 1350, transactions: 520 },
    { month: "Mar", revenue: 48000, users: 1280, transactions: 480 },
    { month: "Apr", revenue: 61000, users: 1520, transactions: 610 },
    { month: "May", revenue: 55000, users: 1420, transactions: 550 },
    { month: "Jun", revenue: 67000, users: 1680, transactions: 670 },
    { month: "Jul", revenue: 72000, users: 1800, transactions: 720 },
    { month: "Aug", revenue: 69000, users: 1750, transactions: 690 },
    { month: "Sep", revenue: 78000, users: 1950, transactions: 780 },
    { month: "Oct", revenue: 84000, users: 2100, transactions: 840 },
    { month: "Nov", revenue: 89000, users: 2250, transactions: 890 },
    { month: "Dec", revenue: 95000, users: 2400, transactions: 950 },
  ]);

  // User analytics data
  const [userAnalytics] = useState([
    { name: "Active", value: 8432, color: CHART_COLORS.success },
    { name: "Inactive", value: 3877, color: CHART_COLORS.warning },
    { name: "Blocked", value: 234, color: CHART_COLORS.error },
  ]);

  // Recent activities
  const [recentActivities] = useState([
    {
      id: 1,
      type: "user_registered",
      user: "John Doe",
      time: "2 minutes ago",
      icon: UserCheck,
    },
    {
      id: 2,
      type: "transaction_completed",
      user: "Jane Smith",
      amount: 299,
      time: "5 minutes ago",
      icon: CreditCard,
    },
    {
      id: 3,
      type: "support_ticket",
      user: "Bob Johnson",
      time: "10 minutes ago",
      icon: MessageSquare,
    },
    {
      id: 4,
      type: "user_blocked",
      user: "Alice Brown",
      time: "15 minutes ago",
      icon: UserX,
    },
    {
      id: 5,
      type: "notification_sent",
      count: 1250,
      time: "30 minutes ago",
      icon: Bell,
    },
  ]);

  // Transaction status data
  const [transactionData] = useState([
    { status: "Completed", customer: "customer@mail.com", amount: 892340 },
    { status: "Pending", customer: "customer@mail.com", amount: 45670 },
    { status: "Failed", customer: "customer@mail.com", amount: 12340 },
    { status: "Refunded", customer: "customer@mail.com", amount: 8900 },
  ]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const getActivityIcon = (type) => {
    const iconMap = {
      user_registered: UserCheck,
      transaction_completed: CreditCard,
      support_ticket: MessageSquare,
      user_blocked: UserX,
      notification_sent: Bell,
    };
    return iconMap[type] || Activity;
  };

  const getActivityColor = (type) => {
    const colorMap = {
      user_registered: "text-green-600",
      transaction_completed: "text-blue-600",
      support_ticket: "text-yellow-600",
      user_blocked: "text-red-600",
      notification_sent: "text-purple-600",
    };
    return colorMap[type] || "text-gray-600";
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "danger";
      case "refunded":
        return "info";
      default:
        return "default";
    }
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new activity
      const activities = [
        "New user registered",
        "Transaction completed",
        "Support ticket created",
        "User blocked",
        "Notification sent",
      ];

      const randomActivity =
        activities[Math.floor(Math.random() * activities.length)];

      addNotification({
        title: "System Update",
        message: randomActivity,
        type: "info",
      });
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [addNotification]);

  const mainStats = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      change: "+22.4%",
      trend: "up",
      icon: TrendingUp,
    },
    {
      title: "Monthly Revenue",
      value: formatNumber(stats.totalRevenueThisMonth),
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Yearly Revenue",
      value: formatNumber(stats.totalRevenueThisYear),
      change: "+3.2%",
      trend: "up",
      icon: DollarSign,
    },
  ].filter((stat) => stat.show !== false);

  const secondaryStats = [
    {
      title: "Total Transactions",
      value: formatNumber(stats.totalTransactions),
      change: "+18.7%",
      trend: "up",
      icon: CreditCard,
    },
    {
      title: "Monthly Transactions",
      value: formatNumber(stats.totalTransactionsThisMonth),
      change: "+8.2%",
      trend: "up",
      icon: CreditCard,
    },
    {
      title: "Yearly Transactions",
      value: formatNumber(stats.totalTransactionsThisYear),
      change: "+18.7%",
      trend: "up",
      icon: CreditCard,
    },
  ].filter((stat) => stat.show !== false);

  return (
    <div className="space-y-6 fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back! Here's what's happening with your platform today.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mainStats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.trend === "up" ? "positive" : "negative"}
            icon={stat.icon ? <stat.icon /> : null}
            index={index}
          />
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {secondaryStats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.trend === "up" ? "positive" : "negative"}
            icon={stat.icon ? <stat.icon /> : null}
            index={index + 2}
          />
        ))}
      </div>

      {/* Charts Section */}
      {API_CONFIG.stripe.enabled && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <Card.Header className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Monthly Revenue Growth
              </h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Revenue
                </span>
              </div>
            </Card.Header>
            <Card.Content className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={CHART_COLORS.primary}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={CHART_COLORS.primary}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#374151"
                    opacity={0.3}
                  />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), "Revenue"]}
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#F9FAFB",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card.Content>
          </Card>

          {/* Transaction Trends */}
          {API_CONFIG.stripe.enabled && (
            <Card>
              <Card.Header>
                <Card.Title>Transaction Trends</Card.Title>
              </Card.Header>
              <Card.Content className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#374151"
                      opacity={0.3}
                    />
                    <XAxis dataKey="month" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#F9FAFB",
                      }}
                    />
                    <Bar dataKey="transactions" fill={CHART_COLORS.secondary} />
                  </BarChart>
                </ResponsiveContainer>
              </Card.Content>
            </Card>
          )}
        </div>
      )}

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Status Summary */}
        <Card>
          <Card.Header>
            <Card.Title>Transaction Status</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {transactionData.map((transaction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Badge variant={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.customer}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
