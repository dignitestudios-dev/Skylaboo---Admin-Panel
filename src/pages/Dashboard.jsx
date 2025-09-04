import React, { useState, useEffect, useMemo } from "react";
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
import useAppConfigsActions from "../hooks/app-configs/useAppConfigsActions";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import StatsCard from "../components/common/StatsCard";
import DashboardLoader from "../components/loader/DashboardLoader";
import useGetDashboardAnalytics from "../hooks/dashboard-analytics/useGetDashboardAnalytics";
import { formatPercentage, getTrend } from "../utils/helpers";

const Dashboard = () => {
  const { addNotification, dashboardAnalytics } = useApp();
  const { loading } = useAppConfigsActions();
  const { loading: loadingAnalytics } = useGetDashboardAnalytics();
  console.log("dashboardAnalytics: ", dashboardAnalytics);
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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "danger";
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

  const mainStats = useMemo(
    () => [
      {
        title: "Total Revenue",
        value: formatCurrency(dashboardAnalytics?.stats?.totalRevenue),
        icon: TrendingUp,
      },
      {
        title: "Monthly Revenue",
        value: formatCurrency(dashboardAnalytics?.stats?.totalRevenueThisMonth),
        change: formatPercentage(
          dashboardAnalytics?.percentageChange?.revenueThisMonth,
          2
        ),
        trend: getTrend(dashboardAnalytics?.percentageChange?.revenueThisMonth),
        icon: DollarSign,
      },
      {
        title: "Yearly Revenue",
        value: formatCurrency(dashboardAnalytics?.stats?.totalRevenueThisYear),
        change: formatPercentage(
          dashboardAnalytics?.percentageChange?.revenueThisYear,
          2
        ),
        trend: getTrend(dashboardAnalytics?.percentageChange?.revenueThisYear),
        icon: DollarSign,
      },
    ],
    [dashboardAnalytics]
  );

  const secondaryStats = useMemo(
    () => [
      {
        title: "Total Transactions",
        value: formatNumber(dashboardAnalytics?.stats?.totalTransactions),
        icon: CreditCard,
      },
      {
        title: "Monthly Transactions",
        value: formatNumber(
          dashboardAnalytics?.stats?.totalTransactionsThisMonth
        ),
        change: formatPercentage(
          dashboardAnalytics?.percentageChange?.transactionsThisMonth,
          2
        ),
        trend: getTrend(
          dashboardAnalytics?.percentageChange?.transactionsThisMonth
        ),
        icon: CreditCard,
      },
      {
        title: "Yearly Transactions",
        value: formatNumber(
          dashboardAnalytics?.stats?.totalTransactionsThisYear
        ),
        change: formatPercentage(
          dashboardAnalytics?.percentageChange?.transactionsThisYear,
          2
        ),
        trend: getTrend(
          dashboardAnalytics?.percentageChange?.transactionsThisYear
        ),
        icon: CreditCard,
      },
    ],
    [dashboardAnalytics]
  );

  return (
    <>
      {loading || loadingAnalytics ? (
        <DashboardLoader />
      ) : (
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
            {mainStats?.map((stat, index) => (
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
            {secondaryStats?.map((stat, index) => (
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
                  <AreaChart data={dashboardAnalytics?.revenueChartData || []}>
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
            <Card>
              <Card.Header>
                <Card.Title>Transaction Trends</Card.Title>
              </Card.Header>
              <Card.Content className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardAnalytics?.revenueChartData || []}>
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
          </div>

          {/* Bottom Section */}
          <div>
            {/* Transaction Status Summary */}
            <Card>
              <Card.Header>
                <Card.Title>Transaction Status</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                  {dashboardAnalytics?.transactionData?.map(
                    (transaction, index) => (
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
                    )
                  )}
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
