import CustomButton from "@/components/Button/CustomButton";
import { formatCurrency } from "@/utils/Common/formatUtils";
import {
  CheckCircle as ApproveIcon,
  AttachMoney as MoneyIcon,
  Refresh as RefreshIcon,
  Assessment as ReportIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import { Avatar, Box, Card, CardContent, Chip, Grid, LinearProgress, List, ListItem, ListItemAvatar, ListItemText, Paper, Stack, Typography, useTheme } from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import useEnhancedGRN from "../hooks/useGrnhooks";

interface DashboardStats {
  totalGrns: number;
  totalValue: number;
  avgGrnValue: number;
  approvalRate: number;
  overdueCount: number;
  todayGrns: number;
  thisWeekGrns: number;
  thisMonthGrns: number;
  topSupplier: string;
  topDepartment: string;
  qualityPassRate: number;
  avgProcessingTime: number;
}

interface ChartData {
  monthlyTrends: Array<{
    month: string;
    grns: number;
    value: number;
    approved: number;
  }>;
  supplierDistribution: Array<{
    name: string;
    value: number;
    count: number;
  }>;
  departmentDistribution: Array<{
    name: string;
    value: number;
    count: number;
  }>;
  statusDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  dailyActivity: Array<{
    date: string;
    created: number;
    approved: number;
  }>;
}

const GRNDashboard: React.FC = () => {
  const theme = useTheme();
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: dayjs().subtract(6, "months").format("YYYY-MM-DD"),
    to: dayjs().format("YYYY-MM-DD"),
  });

  const { grns, statistics, loading, refreshGrns, getDashboardData, getRecentActivity } = useEnhancedGRN();

  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    refreshGrns();
    loadRecentActivity();
  }, [refreshGrns]);

  const loadRecentActivity = async () => {
    try {
      const activity = await getRecentActivity(10);
      setRecentActivity(activity || []);
    } catch (error) {
      console.error("Failed to load recent activity:", error);
    }
  };

  // Calculate comprehensive dashboard statistics
  const dashboardStats = useMemo((): DashboardStats => {
    if (!grns || grns.length === 0) {
      return {
        totalGrns: 0,
        totalValue: 0,
        avgGrnValue: 0,
        approvalRate: 0,
        overdueCount: 0,
        todayGrns: 0,
        thisWeekGrns: 0,
        thisMonthGrns: 0,
        topSupplier: "N/A",
        topDepartment: "N/A",
        qualityPassRate: 0,
        avgProcessingTime: 0,
      };
    }

    const today = dayjs().startOf("day");
    const weekStart = dayjs().startOf("week");
    const monthStart = dayjs().startOf("month");

    const todayGrns = grns.filter((grn) => dayjs(grn.grnDate).isSame(today, "day")).length;
    const thisWeekGrns = grns.filter((grn) => dayjs(grn.grnDate).isAfter(weekStart)).length;
    const thisMonthGrns = grns.filter((grn) => dayjs(grn.grnDate).isAfter(monthStart)).length;

    const approvedGrns = grns.filter((grn) => grn.grnApprovedYN === "Y").length;
    const approvalRate = grns.length > 0 ? (approvedGrns / grns.length) * 100 : 0;

    const overdueGrns = grns.filter((grn) => {
      const grnDate = dayjs(grn.grnDate);
      const daysOld = dayjs().diff(grnDate, "days");
      return grn.grnApprovedYN !== "Y" && daysOld > 7;
    }).length;

    // Calculate top supplier by value
    const supplierTotals = grns.reduce((acc, grn) => {
      const supplierId = grn.supplrID.toString();
      if (!acc[supplierId]) {
        acc[supplierId] = { name: grn.supplrName || `Supplier ${grn.supplrID}`, total: 0 };
      }
      acc[supplierId].total += grn.netTot || grn.tot || 0;
      return acc;
    }, {} as Record<string, { name: string; total: number }>);

    const topSupplier = Object.values(supplierTotals).reduce((max, supplier) => (supplier.total > max.total ? supplier : max), { name: "N/A", total: 0 }).name;

    // Calculate top department by count
    const deptCounts = grns.reduce((acc, grn) => {
      const deptId = grn.deptID.toString();
      if (!acc[deptId]) {
        acc[deptId] = { name: grn.deptName || `Department ${grn.deptID}`, count: 0 };
      }
      acc[deptId].count += 1;
      return acc;
    }, {} as Record<string, { name: string; count: number }>);

    const topDepartment = Object.values(deptCounts).reduce((max, dept) => (dept.count > max.count ? dept : max), { name: "N/A", count: 0 }).name;

    // Quality pass rate
    const qualityCheckedGrns = grns.filter((grn) => grn.qualityCheckYN === "Y").length;
    const qualityPassRate = grns.length > 0 ? (qualityCheckedGrns / grns.length) * 100 : 0;

    // Average processing time (days from creation to approval)
    const processingTimes = grns.filter((grn) => grn.grnApprovedYN === "Y" && grn.approvalDate).map((grn) => dayjs(grn.approvalDate).diff(dayjs(grn.grnDate), "days"));

    const avgProcessingTime = processingTimes.length > 0 ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length : 0;

    return {
      totalGrns: grns.length,
      totalValue: statistics.totalValue,
      avgGrnValue: statistics.avgValue,
      approvalRate,
      overdueCount: overdueGrns,
      todayGrns,
      thisWeekGrns,
      thisMonthGrns,
      topSupplier,
      topDepartment,
      qualityPassRate,
      avgProcessingTime,
    };
  }, [grns, statistics]);

  // Prepare chart data
  const chartData = useMemo((): ChartData => {
    if (!grns || grns.length === 0) {
      return {
        monthlyTrends: [],
        supplierDistribution: [],
        departmentDistribution: [],
        statusDistribution: [],
        dailyActivity: [],
      };
    }

    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const month = dayjs().subtract(i, "month");
      const monthGrns = grns.filter((grn) => dayjs(grn.grnDate).isSame(month, "month"));

      monthlyTrends.push({
        month: month.format("MMM YYYY"),
        grns: monthGrns.length,
        value: monthGrns.reduce((sum, grn) => sum + (grn.netTot || grn.tot || 0), 0),
        approved: monthGrns.filter((grn) => grn.grnApprovedYN === "Y").length,
      });
    }

    // Supplier distribution (top 5)
    const supplierTotals = grns.reduce((acc, grn) => {
      const supplierId = grn.supplrID.toString();
      if (!acc[supplierId]) {
        acc[supplierId] = {
          name: grn.supplrName || `Supplier ${grn.supplrID}`,
          value: 0,
          count: 0,
        };
      }
      acc[supplierId].value += grn.netTot || grn.tot || 0;
      acc[supplierId].count += 1;
      return acc;
    }, {} as Record<string, { name: string; value: number; count: number }>);

    const supplierDistribution = Object.values(supplierTotals)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Department distribution (top 5)
    const deptTotals = grns.reduce((acc, grn) => {
      const deptId = grn.deptID.toString();
      if (!acc[deptId]) {
        acc[deptId] = {
          name: grn.deptName || `Department ${grn.deptID}`,
          value: 0,
          count: 0,
        };
      }
      acc[deptId].value += grn.netTot || grn.tot || 0;
      acc[deptId].count += 1;
      return acc;
    }, {} as Record<string, { name: string; value: number; count: number }>);

    const departmentDistribution = Object.values(deptTotals)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Status distribution
    const statusDistribution = [
      {
        name: "Approved",
        value: grns.filter((grn) => grn.grnApprovedYN === "Y").length,
        color: "#4caf50",
      },
      {
        name: "Pending",
        value: grns.filter((grn) => grn.grnApprovedYN !== "Y").length,
        color: "#ff9800",
      },
      {
        name: "Overdue",
        value: grns.filter((grn) => {
          const daysOld = dayjs().diff(dayjs(grn.grnDate), "days");
          return grn.grnApprovedYN !== "Y" && daysOld > 7;
        }).length,
        color: "#f44336",
      },
      {
        name: "Hidden",
        value: grns.filter((grn) => grn.hideYN === "Y").length,
        color: "#9e9e9e",
      },
    ].filter((item) => item.value > 0);

    // Daily activity (last 30 days)
    const dailyActivity = [];
    for (let i = 29; i >= 0; i--) {
      const date = dayjs().subtract(i, "day");
      const dayGrns = grns.filter((grn) => dayjs(grn.grnDate).isSame(date, "day"));

      dailyActivity.push({
        date: date.format("DD/MM"),
        created: dayGrns.length,
        approved: dayGrns.filter((grn) => grn.grnApprovedYN === "Y").length,
      });
    }

    return {
      monthlyTrends,
      supplierDistribution,
      departmentDistribution,
      statusDistribution,
      dailyActivity,
    };
  }, [grns]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" color="primary" fontWeight="bold">
          <ReportIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          GRN Dashboard & Analytics
        </Typography>
        <CustomButton variant="outlined" icon={RefreshIcon} text="Refresh Data" onClick={refreshGrns} />
      </Box>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ height: "100%", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardStats.totalGrns}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total GRNs
                  </Typography>
                  <Stack direction="row" spacing={1} mt={1}>
                    <Chip label={`Today: ${dashboardStats.todayGrns}`} size="small" />
                    <Chip label={`Week: ${dashboardStats.thisWeekGrns}`} size="small" />
                  </Stack>
                </Box>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                  <ReportIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ height: "100%", background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white" }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {formatCurrency(dashboardStats.totalValue, "INR", "en-IN")}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total Value
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Avg: {formatCurrency(dashboardStats.avgGrnValue, "INR", "en-IN")}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                  <MoneyIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ height: "100%", background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white" }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardStats.approvalRate.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Approval Rate
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={dashboardStats.approvalRate}
                    sx={{
                      mt: 1,
                      bgcolor: "rgba(255,255,255,0.3)",
                      "& .MuiLinearProgress-bar": { bgcolor: "white" },
                    }}
                  />
                </Box>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                  <ApproveIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ height: "100%", background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", color: "white" }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardStats.avgProcessingTime.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Avg Processing Days
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Overdue: {dashboardStats.overdueCount}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                  <SpeedIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} mb={4}>
        {/* Monthly Trends */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Monthly GRN Trends
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <AreaChart data={chartData.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value, name) => [
                    name === "value" ? formatCurrency(Number(value), "INR", "en-IN") : value,
                    name === "grns" ? "GRN Count" : name === "value" ? "Total Value" : "Approved",
                  ]}
                />
                <Area yAxisId="right" type="monotone" dataKey="value" stroke="#8884d8" fill="url(#colorValue)" />
                <Bar yAxisId="left" dataKey="grns" fill="#82ca9d" />
                <Line yAxisId="left" type="monotone" dataKey="approved" stroke="#ff7300" />
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Status Distribution */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={chartData.statusDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Detailed Analytics */}
      <Grid container spacing={3} mb={4}>
        {/* Top Suppliers */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Suppliers by Value
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.supplierDistribution} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => formatCurrency(value, "INR", "en-IN")} />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value), "INR", "en-IN"), "Total Value"]} />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Departments */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Departments by Value
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.departmentDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis tickFormatter={(value) => formatCurrency(value, "INR", "en-IN")} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value), "INR", "en-IN"), "Total Value"]} />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Daily Activity & Recent Activity */}
      <Grid container spacing={3}>
        {/* Daily Activity Chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Daily Activity (Last 30 Days)
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData.dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="created" stroke="#8884d8" name="Created" />
                <Line type="monotone" dataKey="approved" stroke="#82ca9d" name="Approved" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Activity Feed */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: 280, overflow: "auto" }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List dense>
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <ListItem key={index}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        <TimelineIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={activity.description || "GRN Activity"} secondary={dayjs(activity.timestamp).format("DD/MM/YYYY HH:mm")} />
                  </ListItem>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
                  No recent activity found
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Performance Insights */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Performance Insights
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary" fontWeight="bold">
                {dashboardStats.qualityPassRate.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Quality Pass Rate
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Box textAlign="center">
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {dashboardStats.topSupplier}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Top Performing Supplier
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Box textAlign="center">
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {dashboardStats.topDepartment}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Most Active Department
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Box textAlign="center">
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {dashboardStats.thisMonthGrns}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This Month's GRNs
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default GRNDashboard;
