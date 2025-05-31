import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  useMediaQuery,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  Paper,
  Stack,
  Skeleton,
  CardHeader,
  Tab,
  Tabs,
} from "@mui/material";
import {
  People as RegistrationIcon,
  Refresh as RevisitIcon,
  LocalHospital as AdmissionIcon,
  TransferWithinAStation as TransferIcon,
  ExitToApp as DischargeIcon,
  AttachMoney as IncomeIcon,
  Payment as CollectionIcon,
  Undo as RefundIcon,
  Receipt as CreditNoteIcon,
  SwapHoriz as TransferNoteIcon,
  AccountBalance as TransferPayIcon,
  TrendingUp as AdvanceIcon,
  DateRange as DateIcon,
  Refresh as RefreshIcon,
  Person as UserIcon,
  Group as AllUsersIcon,
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  ErrorOutline as ErrorIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { DashBoardService } from "@/services/NotGenericPaternServices/DashBoardService";
import { useAlert } from "@/providers/AlertProvider";
import CustomButton from "@/components/Button/CustomButton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Area,
  AreaChart,
} from "recharts";
interface DashboardMetric {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  userEndpoint: string;
  allEndpoint: string;
  category: "patient" | "financial" | "operational";
  format: "count" | "currency";
  description: string;
}

const dashboardMetrics: DashboardMetric[] = [
  {
    id: "registration",
    title: "Patient Registrations",
    icon: RegistrationIcon,
    color: "#2196F3",
    userEndpoint: "GetRegistrationUserwise",
    allEndpoint: "GetRegistration",
    category: "patient",
    format: "count",
    description: "New patient registrations",
  },
  {
    id: "revisit",
    title: "Patient Revisits",
    icon: RevisitIcon,
    color: "#FF9800",
    userEndpoint: "GetRevisitUserwise",
    allEndpoint: "GetRevisit",
    category: "patient",
    format: "count",
    description: "Patient revisit appointments",
  },
  {
    id: "admission",
    title: "Patient Admissions",
    icon: AdmissionIcon,
    color: "#4CAF50",
    userEndpoint: "GetAdmissionUserwise",
    allEndpoint: "GetAdmission",
    category: "patient",
    format: "count",
    description: "New patient admissions",
  },
  {
    id: "transfer",
    title: "Ward/Bed Transfers",
    icon: TransferIcon,
    color: "#9C27B0",
    userEndpoint: "GetWBTransferUserwise",
    allEndpoint: "GetWBTransfer",
    category: "operational",
    format: "count",
    description: "Patient transfers between wards/beds",
  },
  {
    id: "discharge",
    title: "Patient Discharges",
    icon: DischargeIcon,
    color: "#F44336",
    userEndpoint: "GetDischargeUserwise",
    allEndpoint: "GetDischarge",
    category: "patient",
    format: "count",
    description: "Patient discharge records",
  },
  {
    id: "income",
    title: "Total Income",
    icon: IncomeIcon,
    color: "#4CAF50",
    userEndpoint: "GetIncomeUserwise",
    allEndpoint: "GetIncome",
    category: "financial",
    format: "currency",
    description: "Total revenue generated",
  },
  {
    id: "collection",
    title: "Payment Collection",
    icon: CollectionIcon,
    color: "#2196F3",
    userEndpoint: "GetCollectionUserwise",
    allEndpoint: "GetCollection",
    category: "financial",
    format: "currency",
    description: "Total payments collected",
  },
  {
    id: "refund",
    title: "Refunds Processed",
    icon: RefundIcon,
    color: "#FF5722",
    userEndpoint: "GetRefundUserwise",
    allEndpoint: "GetRefund",
    category: "financial",
    format: "currency",
    description: "Total refunds issued",
  },
  {
    id: "creditNote",
    title: "Credit Notes",
    icon: CreditNoteIcon,
    color: "#795548",
    userEndpoint: "GetCreditNoteUserwise",
    allEndpoint: "GetCreditNote",
    category: "financial",
    format: "currency",
    description: "Credit notes issued",
  },
  {
    id: "transferNote",
    title: "Transfer Notes",
    icon: TransferNoteIcon,
    color: "#607D8B",
    userEndpoint: "GetTransferNoteUserwise",
    allEndpoint: "GetTransferNote",
    category: "financial",
    format: "currency",
    description: "Financial transfer notes",
  },
  {
    id: "transferPay",
    title: "Transfer Payments",
    icon: TransferPayIcon,
    color: "#3F51B5",
    userEndpoint: "GetTransferPayDetailUserwise",
    allEndpoint: "GetTransferPayDetail",
    category: "financial",
    format: "currency",
    description: "Transfer payment details",
  },
  {
    id: "advance",
    title: "Advance Collections",
    icon: AdvanceIcon,
    color: "#009688",
    userEndpoint: "GetAdvanceCollectionUserwise",
    allEndpoint: "GetAdvanceCollection",
    category: "financial",
    format: "currency",
    description: "Advance payments collected",
  },
];

interface MetricCardProps {
  metric: DashboardMetric;
  userValue: number;
  allValue: number;
  viewMode: "user" | "all";
  loading: boolean;
  error: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric, userValue, allValue, viewMode, loading, error }) => {
  const theme = useTheme();
  const IconComponent = metric.icon;
  const currentValue = viewMode === "user" ? userValue : allValue;

  const formatValue = (value: number, format: "count" | "currency"): string => {
    if (format === "currency") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    return value.toLocaleString();
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case "patient":
        return theme.palette.primary.main;
      case "financial":
        return theme.palette.success.main;
      case "operational":
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Card
      sx={{
        height: "100%",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: theme.shadows[8],
        },
        border: `1px solid ${theme.palette.divider}`,
        borderLeft: `4px solid ${metric.color}`,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: `${metric.color}20`,
              color: metric.color,
              mr: 2,
              width: 56,
              height: 56,
            }}
          >
            <IconComponent fontSize="large" />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: "1rem",
                lineHeight: 1.2,
                mb: 0.5,
              }}
              noWrap
            >
              {metric.title}
            </Typography>
            <Chip
              label={metric.category.toUpperCase()}
              size="small"
              sx={{
                bgcolor: getCategoryColor(metric.category),
                color: "white",
                fontWeight: 600,
                fontSize: "0.7rem",
              }}
            />
          </Box>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
          {metric.description}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <Box>
            <Skeleton variant="text" width="60%" height={48} />
            <Skeleton variant="text" width="40%" height={24} />
          </Box>
        ) : error ? (
          <Alert severity="error" icon={<ErrorIcon fontSize="small" />} sx={{ fontSize: "0.75rem" }}>
            Failed to load data
          </Alert>
        ) : (
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: metric.color,
                fontSize: { xs: "1.8rem", sm: "2.2rem" },
              }}
            >
              {formatValue(currentValue, metric.format)}
            </Typography>

            <Paper elevation={0} sx={{ bgcolor: "grey.50", p: 1.5, borderRadius: 2 }}>
              <Grid container spacing={1}>
                <Grid size={{ xs: 6 }}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      My Data
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: viewMode === "user" ? metric.color : "text.primary",
                      }}
                    >
                      {formatValue(userValue, metric.format)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      All Data
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: viewMode === "all" ? metric.color : "text.primary",
                      }}
                    >
                      {formatValue(allValue, metric.format)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div role="tabpanel" hidden={value !== index} id={`chart-tabpanel-${index}`} aria-labelledby={`chart-tab-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

type ViewMode = "user" | "all";
type CategoryFilter = "all" | "patient" | "financial" | "operational";

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { showErrorAlert } = useAlert();

  const [fromDate, setFromDate] = useState<Dayjs>(dayjs().subtract(30, "days"));
  const [toDate, setToDate] = useState<Dayjs>(dayjs());
  const [viewMode, setViewMode] = useState<ViewMode>("user");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [chartTab, setChartTab] = useState(0);

  const dateRange = useMemo(
    () => ({
      fromDate: fromDate.format("YYYY-MM-DD"),
      toDate: toDate.format("YYYY-MM-DD"),
    }),
    [fromDate, toDate]
  );

  // Query for fetching all metrics
  const {
    data: metricsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dashboard-metrics", dateRange],
    queryFn: async () => {
      const results = await Promise.allSettled(
        dashboardMetrics.map(async (metric) => {
          const [userResult, allResult] = await Promise.allSettled([
            DashBoardService.fetchCount(metric.userEndpoint, dateRange),
            DashBoardService.fetchCount(metric.allEndpoint, dateRange),
          ]);

          return {
            id: metric.id,
            userValue: userResult.status === "fulfilled" ? userResult.value.count : 0,
            allValue: allResult.status === "fulfilled" ? allResult.value.count : 0,
            userError: userResult.status === "rejected" || (userResult.status === "fulfilled" && userResult.value.error),
            allError: allResult.status === "rejected" || (allResult.status === "fulfilled" && allResult.value.error),
            unauthorized: userResult.status === "fulfilled" && userResult.value.unauthorized,
          };
        })
      );

      return results.reduce((acc, result) => {
        if (result.status === "fulfilled") {
          acc[result.value.id] = result.value;
        }
        return acc;
      }, {} as Record<string, any>);
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const filteredMetrics = useMemo(() => {
    if (categoryFilter === "all") return dashboardMetrics;
    return dashboardMetrics.filter((metric) => metric.category === categoryFilter);
  }, [categoryFilter]);

  const totals = useMemo(() => {
    if (!metricsData) return { userTotal: 0, allTotal: 0 };

    const financialMetrics = dashboardMetrics.filter((m) => m.category === "financial");
    let userTotal = 0;
    let allTotal = 0;

    financialMetrics.forEach((metric) => {
      const data = metricsData[metric.id];
      if (data && !data.userError && !data.allError) {
        userTotal += data.userValue;
        allTotal += data.allValue;
      }
    });

    return { userTotal, allTotal };
  }, [metricsData]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!metricsData) return [];

    return dashboardMetrics.map((metric) => {
      const data = metricsData[metric.id];
      return {
        name: metric.title.replace(/Patient |Total |Payment |Ward\/Bed /g, ""),
        userValue: data?.userValue || 0,
        allValue: data?.allValue || 0,
        category: metric.category,
        color: metric.color,
        format: metric.format,
      };
    });
  }, [metricsData]);

  const categoryChartData = useMemo(() => {
    if (!metricsData) return [];

    const categories = ["patient", "financial", "operational"];
    return categories.map((category) => {
      const categoryMetrics = dashboardMetrics.filter((m) => m.category === category);
      const userTotal = categoryMetrics.reduce((sum, metric) => {
        const data = metricsData[metric.id];
        return sum + (data?.userValue || 0);
      }, 0);
      const allTotal = categoryMetrics.reduce((sum, metric) => {
        const data = metricsData[metric.id];
        return sum + (data?.allValue || 0);
      }, 0);

      return {
        name: category.charAt(0).toUpperCase() + category.slice(1),
        userValue: userTotal,
        allValue: allTotal,
      };
    });
  }, [metricsData]);

  const pieChartData = useMemo(() => {
    const financialMetrics = dashboardMetrics.filter((m) => m.category === "financial");
    return financialMetrics
      .map((metric) => {
        const data = metricsData?.[metric.id];
        return {
          name: metric.title.replace(/Total |Payment /g, ""),
          value: viewMode === "user" ? data?.userValue || 0 : data?.allValue || 0,
          color: metric.color,
        };
      })
      .filter((item) => item.value > 0);
  }, [metricsData, viewMode]);

  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (err) {
      showErrorAlert("Refresh Failed", "Failed to refresh dashboard data. Please try again.");
    }
  };

  const handleViewModeChange = (event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode) setViewMode(newMode);
  };

  const handleCategoryChange = (event: React.MouseEvent<HTMLElement>, newCategory: CategoryFilter | null) => {
    if (newCategory) setCategoryFilter(newCategory);
  };

  const handleChartTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setChartTab(newValue);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, border: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Typography key={index} variant="body2" sx={{ color: entry.color }}>
              {entry.dataKey === "userValue" ? "My Data" : "All Data"}: {formatCurrency(entry.value)}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }} action={<CustomButton variant="outlined" size="small" text="Retry" onClick={handleRefresh} color="error" />}>
          Failed to load dashboard data. Please check your connection and try again.
        </Alert>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <Box sx={{ p: 3, maxWidth: "1400px", mx: "auto" }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <DashboardIcon sx={{ fontSize: 40, color: "primary.main", mr: 2 }} />
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: "text.primary" }}>
                Hospital Management Dashboard
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Real-time overview of hospital operations and financial metrics
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Controls */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Date Range Controls */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ p: 2, height: "100%" }}>
              <Stack direction={isMobile ? "column" : "row"} spacing={2} alignItems="center">
                <DateIcon color="action" />
                <DatePicker
                  label="From Date"
                  value={fromDate}
                  onChange={(date) => date && setFromDate(dayjs(date))}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: { minWidth: "140px" },
                      variant: "outlined",
                    },
                  }}
                />
                <DatePicker
                  label="To Date"
                  value={toDate}
                  onChange={(date) => date && setToDate(dayjs(date))}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: { minWidth: "140px" },
                      variant: "outlined",
                    },
                  }}
                />
                <Tooltip title="Refresh Dashboard">
                  <IconButton
                    onClick={handleRefresh}
                    disabled={isLoading}
                    color="primary"
                    sx={{
                      animation: isLoading ? "spin 1s linear infinite" : "none",
                      "@keyframes spin": {
                        "0%": { transform: "rotate(0deg)" },
                        "100%": { transform: "rotate(360deg)" },
                      },
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Card>
          </Grid>

          {/* View Mode Toggle */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ p: 2, height: "100%", display: "flex", alignItems: "center" }}>
              <ToggleButtonGroup value={viewMode} exclusive onChange={handleViewModeChange} size="small" fullWidth sx={{ "& .MuiToggleButton-root": { py: 1 } }}>
                <ToggleButton value="user">
                  <UserIcon sx={{ mr: 1, fontSize: "1.2rem" }} />
                  My Data
                </ToggleButton>
                <ToggleButton value="all">
                  <AllUsersIcon sx={{ mr: 1, fontSize: "1.2rem" }} />
                  All Data
                </ToggleButton>
              </ToggleButtonGroup>
            </Card>
          </Grid>

          {/* Category Filter */}
          <Grid size={{ xs: 12, lg: 3 }}>
            <Card sx={{ p: 2, height: "100%", display: "flex", alignItems: "center" }}>
              <ToggleButtonGroup
                value={categoryFilter}
                exclusive
                onChange={handleCategoryChange}
                size="small"
                fullWidth
                sx={{ "& .MuiToggleButton-root": { py: 1, fontSize: "0.8rem" } }}
              >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="patient">Patient</ToggleButton>
                <ToggleButton value="financial">Financial</ToggleButton>
                <ToggleButton value="operational">Ops</ToggleButton>
              </ToggleButtonGroup>
            </Card>
          </Grid>
        </Grid>

        {/* Summary Cards */}
        {categoryFilter === "all" && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  p: 3,
                  background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
                  color: "white",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box sx={{ position: "relative", zIndex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <TrendingUpIcon sx={{ fontSize: 40, mr: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Total Financial Revenue (My Data)
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {formatCurrency(totals.userTotal)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    position: "absolute",
                    top: -20,
                    right: -20,
                    opacity: 0.1,
                    fontSize: "8rem",
                  }}
                >
                  💰
                </Box>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  p: 3,
                  background: "linear-gradient(135deg, #2196F3 0%, #1976d2 100%)",
                  color: "white",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box sx={{ position: "relative", zIndex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <TrendingUpIcon sx={{ fontSize: 40, mr: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Total Financial Revenue (All Data)
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {formatCurrency(totals.allTotal)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    position: "absolute",
                    top: -20,
                    right: -20,
                    opacity: 0.1,
                    fontSize: "8rem",
                  }}
                >
                  💰
                </Box>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Charts Section */}
        <Card sx={{ mb: 4 }}>
          <CardHeader
            title="Analytics Dashboard"
            subheader="Visual representation of hospital metrics and trends"
            avatar={
              <Avatar sx={{ bgcolor: "primary.main" }}>
                <BarChartIcon />
              </Avatar>
            }
          />
          <CardContent>
            <Tabs value={chartTab} onChange={handleChartTabChange} variant="scrollable" scrollButtons="auto">
              <Tab icon={<BarChartIcon />} label="Comparison Chart" />
              <Tab icon={<PieChartIcon />} label="Financial Breakdown" />
              <Tab icon={<LineChartIcon />} label="Category Overview" />
            </Tabs>

            <TabPanel value={chartTab} index={0}>
              <Card elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  My Data vs All Data Comparison
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="userValue" fill="#2196F3" name="My Data" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="allValue" fill="#4CAF50" name="All Data" radius={[4, 4, 0, 0]} />
                  </ComposedChart>
                </ResponsiveContainer>
              </Card>
            </TabPanel>

            <TabPanel value={chartTab} index={1}>
              <Card elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Financial Metrics Distribution ({viewMode === "user" ? "My Data" : "All Data"})
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => [formatCurrency(Number(value)), "Amount"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </TabPanel>

            <TabPanel value={chartTab} index={2}>
              <Card elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Category-wise Performance Overview
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={categoryChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="userValue" stackId="1" stroke="#2196F3" fill="#2196F3" fillOpacity={0.6} name="My Data" />
                    <Area type="monotone" dataKey="allValue" stackId="2" stroke="#4CAF50" fill="#4CAF50" fillOpacity={0.6} name="All Data" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </TabPanel>
          </CardContent>
        </Card>

        {/* Metrics Grid */}
        <Grid container spacing={3}>
          {filteredMetrics.map((metric) => {
            const data = metricsData?.[metric.id];

            return (
              <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 3 }} key={metric.id}>
                <MetricCard
                  metric={metric}
                  userValue={data?.userValue || 0}
                  allValue={data?.allValue || 0}
                  viewMode={viewMode}
                  loading={isLoading}
                  error={data?.userError || data?.allError || false}
                />
              </Grid>
            );
          })}
        </Grid>

        {/* Loading Overlay */}
        {isLoading && (
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: "rgba(255, 255, 255, 0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              backdropFilter: "blur(2px)",
            }}
          >
            <Card sx={{ p: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <CircularProgress size={48} thickness={3.6} />
              <Typography variant="h6" color="text.secondary">
                Loading Dashboard Data...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
                Please wait while we fetch the latest metrics
              </Typography>
            </Card>
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default DashboardPage;
