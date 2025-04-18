import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Divider,
  useTheme,
  alpha,
  IconButton,
  ButtonGroup,
  Button,
  Chip,
  Tooltip,
  SelectChangeEvent,
  Tab,
  Tabs,
  MenuItem,
  Menu,
} from "@mui/material";
import { BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { styled } from "@mui/material/styles";
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  VisibilityOutlined as VisibilityIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  Settings as SettingsIcon,
  Bookmark as BookmarkIcon,
  FileDownload as DownloadIcon,
  FilterList as FilterIcon,
  ArrowDropDown as ArrowDropDownIcon,
  MoreVert as MoreVertIcon,
  BarChart as BarChartIcon,
  DonutLarge as DonutIcon,
  TableChart as TableIcon,
} from "@mui/icons-material";
import { endOfMonth, endOfWeek, endOfYear, startOfMonth, startOfWeek, startOfYear } from "date-fns";
import CustomButton from "@/components/Button/CustomButton";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import FloatingLabelTextBox from "@/components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import { useLoading } from "@/context/LoadingContext";
import { DashBoardService } from "@/services/DashboardServices/DashBoardService";
import { useAppSelector } from "@/store/hooks";

// Define the interface for the count data
interface CountData {
  myCount: number;
  overallCount: number;
}

// Define the type with an index signature
type TitleMapping = {
  [key: string]: {
    title: string;
    icon: React.ElementType;
    color: string;
  };
};

// Enhanced styled components
const StyledCard = styled(Card)(({ theme }) => ({
  boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
  borderRadius: 12,
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  height: "100%",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0px 8px 16px rgba(0,0,0,0.12)",
  },
}));

const StyledStatCard = styled(Card)(({ theme }) => ({
  boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
  borderRadius: 12,
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  height: "100%",
  position: "relative",
  overflow: "visible",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0px 8px 16px rgba(0,0,0,0.12)",
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 48,
  height: 48,
  borderRadius: "50%",
  marginBottom: theme.spacing(2),
}));

const CountBadge = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  borderRadius: 20,
  display: "flex",
  alignItems: "center",
  marginRight: theme.spacing(1),
  fontWeight: 600,
}));

const FilterChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  borderRadius: 16,
  fontWeight: 500,
}));

const ViewToggleButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  borderRadius: 8,
  padding: theme.spacing(0.5, 1.5),
  fontWeight: 500,
}));

// Enhanced mapping object with more details
const titleMapping: TitleMapping = {
  registration: {
    title: "Registration",
    icon: PersonIcon,
    color: "#2196f3",
  },
  revisit: {
    title: "Revisit",
    icon: PersonIcon,
    color: "#4caf50",
  },
  admission: {
    title: "Admission",
    icon: PersonIcon,
    color: "#9c27b0",
  },
  wbtransfer: {
    title: "Ward Bed Transfer",
    icon: PersonIcon,
    color: "#ff9800",
  },
  discharge: {
    title: "Discharge",
    icon: PersonIcon,
    color: "#f44336",
  },
  income: {
    title: "Income",
    icon: PersonIcon,
    color: "#00bcd4",
  },
  collection: {
    title: "Collection",
    icon: PersonIcon,
    color: "#8bc34a",
  },
  refund: {
    title: "Refund",
    icon: PersonIcon,
    color: "#ffc107",
  },
  creditnote: {
    title: "Credit Note",
    icon: PersonIcon,
    color: "#795548",
  },
  transfernote: {
    title: "Transfer Note",
    icon: PersonIcon,
    color: "#607d8b",
  },
  transferpaydetail: {
    title: "Transfer Pay Details",
    icon: PersonIcon,
    color: "#e91e63",
  },
  advancecollection: {
    title: "Advance Collection",
    icon: PersonIcon,
    color: "#3f51b5",
  },
  dischargesummary: {
    title: "Discharge Summary",
    icon: PersonIcon,
    color: "#009688",
  },
};

// Sample data for trend charts
const generateTrendData = (category: string, days: number) => {
  const data = [];
  const today = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);

    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      personal: Math.floor(Math.random() * 10),
      overall: Math.floor(Math.random() * 50),
    });
  }

  return data;
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const today = new Date();
  const [dateRange, setDateRange] = useState({
    fromDate: setStartOfDay(today),
    toDate: setStartOfDay(today),
  });
  const [selectedOption, setSelectedOption] = useState("TD");
  const [counts, setCounts] = useState<Record<string, CountData>>({});
  const [showCounts, setShowCounts] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "chart" | "table">("cards");
  const [trendData, setTrendData] = useState<any[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [bookmarkAnchorEl, setBookmarkAnchorEl] = useState<null | HTMLElement>(null);

  const userInfo = useAppSelector((state) => state.auth);
  const token = userInfo.token!;
  const { setLoading } = useLoading();

  function setStartOfDay(date: Date) {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
    return utcDate.toISOString().split("T")[0]; // Return only the date part
  }

  function setEndOfDay(date: Date) {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999));
    return utcDate.toISOString();
  }

  useEffect(() => {
    if (new Date(dateRange.fromDate) > new Date(dateRange.toDate)) {
      setDateRange((prev) => ({
        ...prev,
        fromDate: prev.toDate, // Reset fromDate to toDate if it's after toDate
      }));
    }
  }, [dateRange.fromDate, dateRange.toDate]);

  useEffect(() => {
    if (selectedCategory) {
      // Generate trend data when a category is selected
      setTrendData(generateTrendData(selectedCategory, 7));
    }
  }, [selectedCategory]);

  const handleSelect = (event: SelectChangeEvent<unknown>) => {
    const selectedValue = event.target.value as string;
    setSelectedOption(selectedValue);
    const today = new Date();
    let from, to;

    switch (event.target.value) {
      case "TD": // Today
        from = setStartOfDay(new Date(today));
        to = setEndOfDay(new Date(today));
        break;
      case "YD": // Yesterday
        from = setStartOfDay(new Date(today.setDate(today.getDate() - 1)));
        to = setEndOfDay(new Date(today.setDate(today.getDate())));
        break;
      case "TW": // This Week
        from = setStartOfDay(startOfWeek(today));
        to = setEndOfDay(endOfWeek(today));
        break;
      case "LW": // Last Week
        from = setStartOfDay(startOfWeek(new Date(today.setDate(today.getDate() - 7))));
        to = setEndOfDay(endOfWeek(new Date(today.setDate(today.getDate()))));
        break;
      case "TM": // This Month
        from = setStartOfDay(startOfMonth(today));
        to = setEndOfDay(endOfMonth(today));
        break;
      case "LM": // Last Month
        from = setStartOfDay(startOfMonth(new Date(today.setMonth(today.getMonth() - 1))));
        to = setEndOfDay(endOfMonth(new Date(today.setMonth(today.getMonth()))));
        break;
      case "TY": // This Year
        from = setStartOfDay(startOfYear(today));
        to = setEndOfDay(endOfYear(today));
        break;
      case "LY": // Last Year
        from = setStartOfDay(startOfYear(new Date(today.setFullYear(today.getFullYear() - 1))));
        to = setEndOfDay(endOfYear(new Date(today.setFullYear(today.getFullYear()))));
        break;
      case "DT": // Date Range
        return; // The user will pick the dates
      default:
        from = setStartOfDay(new Date(today));
        to = setEndOfDay(new Date(today));
    }

    setDateRange({
      fromDate: from,
      toDate: to,
    });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const categories = [
        "Registration",
        "Revisit",
        "Admission",
        "WBTransfer",
        "Discharge",
        "Income",
        "Collection",
        "Refund",
        "CreditNote",
        "TransferNote",
        "TransferPayDetail",
        "AdvanceCollection",
      ];
      for (const category of categories) {
        const myCountResult = await DashBoardService.fetchCount(`Get${category}Userwise`, dateRange);
        const overallCountResult = await DashBoardService.fetchCount(`Get${category}`, dateRange);

        const isMyCountAvailable = !myCountResult.unauthorized && !myCountResult.error;
        const isOverallCountAvailable = !overallCountResult.unauthorized && !overallCountResult.error;

        setCounts((prevCounts) => ({
          ...prevCounts,
          [category.toLowerCase()]: {
            myCount: isMyCountAvailable ? myCountResult.count : 0,
            overallCount: isOverallCountAvailable ? overallCountResult.count : 0,
          },
        }));
      }
    } catch (error) {
      console.error("Error in fetchData", error);
    } finally {
      setLoading(false);
      setShowCounts(true);
    }
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setDateRange((prevDateRange) => {
      const newDateRange = { ...prevDateRange, [name]: value };

      // Validation to ensure "To Date" cannot be earlier than "From Date"
      if (new Date(newDateRange.fromDate) > new Date(newDateRange.toDate)) {
        // If the "From Date" is greater than the "To Date", adjust the "To Date"
        if (name === "fromDate") {
          newDateRange.toDate = value;
        } else if (name === "toDate") {
          newDateRange.fromDate = value;
        }
      }

      return newDateRange;
    });
  };

  const handleShowButtonClick = async () => {
    await fetchData();
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setTabValue(0); // Reset to first tab when selecting a new category
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleBookmarkClick = (event: React.MouseEvent<HTMLElement>) => {
    setBookmarkAnchorEl(event.currentTarget);
  };

  const handleBookmarkClose = () => {
    setBookmarkAnchorEl(null);
  };

  const handleViewModeChange = (mode: "cards" | "chart" | "table") => {
    setViewMode(mode);
  };

  const dateRangeOptions = [
    { value: "TD", label: "Today" },
    { value: "YD", label: "Yesterday" },
    { value: "TW", label: "This Week" },
    { value: "LW", label: "Last Week" },
    { value: "TM", label: "This Month" },
    { value: "LM", label: "Last Month" },
    { value: "TY", label: "This Year" },
    { value: "LY", label: "Last Year" },
    { value: "DT", label: "Date Range" },
  ];

  // Calculate summary statistics
  const getTotalPersonalCounts = () => {
    return Object.values(counts).reduce((sum, item) => sum + item.myCount, 0);
  };

  const getTotalOverallCounts = () => {
    return Object.values(counts).reduce((sum, item) => sum + item.overallCount, 0);
  };

  const getHighestCategory = () => {
    if (Object.keys(counts).length === 0) return null;

    return Object.entries(counts).reduce(
      (highest, [key, value]) => {
        return value.overallCount > highest.count ? { key, count: value.overallCount } : highest;
      },
      { key: "", count: 0 }
    );
  };

  // Create data for summary charts
  const getPieChartData = () => {
    return Object.entries(counts).map(([key, value]) => ({
      name: titleMapping[key.toLowerCase()]?.title || key,
      value: value.overallCount,
    }));
  };

  // Format date range for display
  const getFormattedDateRange = () => {
    const fromDate = new Date(dateRange.fromDate);
    const toDate = new Date(dateRange.toDate);

    if (fromDate.toDateString() === toDate.toDateString()) {
      return fromDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    }

    return `${fromDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${toDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })}`;
  };

  return (
    <Container maxWidth={false}>
      {/* Header Section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <DashboardIcon sx={{ fontSize: 28, mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h5" fontWeight={600}>
            Dashboard
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <ButtonGroup variant="outlined" size="small">
            <Tooltip title="Card View">
              <ViewToggleButton onClick={() => handleViewModeChange("cards")} variant={viewMode === "cards" ? "contained" : "outlined"}>
                <DonutIcon fontSize="small" />
              </ViewToggleButton>
            </Tooltip>
            <Tooltip title="Chart View">
              <ViewToggleButton onClick={() => handleViewModeChange("chart")} variant={viewMode === "chart" ? "contained" : "outlined"}>
                <BarChartIcon fontSize="small" />
              </ViewToggleButton>
            </Tooltip>
            <Tooltip title="Table View">
              <ViewToggleButton onClick={() => handleViewModeChange("table")} variant={viewMode === "table" ? "contained" : "outlined"}>
                <TableIcon fontSize="small" />
              </ViewToggleButton>
            </Tooltip>
          </ButtonGroup>
          <IconButton onClick={handleBookmarkClick} size="small">
            <BookmarkIcon fontSize="small" />
          </IconButton>
          <Menu anchorEl={bookmarkAnchorEl} open={Boolean(bookmarkAnchorEl)} onClose={handleBookmarkClose}>
            <MenuItem onClick={handleBookmarkClose}>Save current view</MenuItem>
            <MenuItem onClick={handleBookmarkClose}>Load saved view</MenuItem>
            <MenuItem onClick={handleBookmarkClose}>Manage bookmarks</MenuItem>
          </Menu>
          <IconButton onClick={handleMenuClick} size="small">
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={handleMenuClose}>Export Dashboard</MenuItem>
            <MenuItem onClick={handleMenuClose}>Print Dashboard</MenuItem>
            <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Filter Section */}
      <Paper elevation={0} sx={{ padding: theme.spacing(3), marginBottom: theme.spacing(3), borderRadius: 2, boxShadow: "0px 2px 8px rgba(0,0,0,0.08)" }}>
        <Typography variant="h6" fontWeight={500} sx={{ mb: 2 }}>
          Date Range
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3} md={3} lg={3}>
            <DropdownSelect label="Select date range" name="dateRange" value={selectedOption} options={dateRangeOptions} onChange={handleSelect} size="small" />
          </Grid>
          {selectedOption === "DT" && (
            <>
              <Grid item xs={12} sm={3} md={3} lg={3}>
                <FloatingLabelTextBox
                  ControlID="fromDate"
                  title="From"
                  type="date"
                  size="small"
                  value={dateRange.fromDate}
                  onChange={handleDateRangeChange}
                  name="fromDate"
                  ariaLabel="From Date"
                />
              </Grid>
              <Grid item xs={12} sm={3} md={3} lg={3}>
                <FloatingLabelTextBox
                  ControlID="toDate"
                  title="To"
                  type="date"
                  size="small"
                  value={dateRange.toDate}
                  onChange={handleDateRangeChange}
                  name="toDate"
                  ariaLabel="To Date"
                />
              </Grid>
            </>
          )}
          <Grid item xs={12} sm={3} md={3} lg={3}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <CustomButton variant="contained" size="medium" onClick={handleShowButtonClick} icon={VisibilityIcon} text="SHOW" color="primary" />
              <IconButton>
                <FilterIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
        {showCounts && (
          <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
            <CalendarIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
            <Typography variant="body2" color="text.secondary">
              {getFormattedDateRange()}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Summary Section - Only shown when data is loaded */}
      {showCounts && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StyledCard>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Activities (Personal)
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <IconWrapper sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1), mr: 2 }}>
                    <PersonIcon fontSize="medium" sx={{ color: theme.palette.primary.main }} />
                  </IconWrapper>
                  <Typography variant="h4" fontWeight={600}>
                    {getTotalPersonalCounts()}
                  </Typography>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StyledCard>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Activities (Overall)
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <IconWrapper sx={{ backgroundColor: alpha(theme.palette.secondary.main, 0.1), mr: 2 }}>
                    <GroupIcon fontSize="medium" sx={{ color: theme.palette.secondary.main }} />
                  </IconWrapper>
                  <Typography variant="h4" fontWeight={600}>
                    {getTotalOverallCounts()}
                  </Typography>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StyledCard>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Highest Activity
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <IconWrapper sx={{ backgroundColor: alpha("#4caf50", 0.1), mr: 2 }}>
                    <TrendingUpIcon fontSize="medium" sx={{ color: "#4caf50" }} />
                  </IconWrapper>
                  <Box>
                    <Typography variant="h5" fontWeight={600}>
                      {getHighestCategory()?.count || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {(getHighestCategory()?.key && titleMapping[getHighestCategory()?.key?.toLowerCase() || ""]?.title) || getHighestCategory()?.key || "None"}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StyledCard>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Distribution
                </Typography>
                <Box sx={{ height: 120, display: "flex", justifyContent: "center" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={getPieChartData()} cx="50%" cy="50%" innerRadius={25} outerRadius={40} paddingAngle={2} dataKey="value">
                        {getPieChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      )}

      {/* Category Details Section */}
      {showCounts && selectedCategory && (
        <Paper elevation={0} sx={{ padding: theme.spacing(3), marginBottom: theme.spacing(3), borderRadius: 2, boxShadow: "0px 2px 8px rgba(0,0,0,0.08)" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconWrapper
                sx={{
                  backgroundColor: alpha(titleMapping[selectedCategory.toLowerCase()]?.color || theme.palette.primary.main, 0.1),
                  width: 36,
                  height: 36,
                  mr: 2,
                }}
              >
                {React.createElement(titleMapping[selectedCategory.toLowerCase()]?.icon || PersonIcon, {
                  fontSize: "small",
                  style: { color: titleMapping[selectedCategory.toLowerCase()]?.color || theme.palette.primary.main },
                })}
              </IconWrapper>
              <Typography variant="h6" fontWeight={500}>
                {titleMapping[selectedCategory.toLowerCase()]?.title || selectedCategory} Detail
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setSelectedCategory(null)}>
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="category detail tabs">
              <Tab label="Trend" />
              <Tab label="Comparison" />
              <Tab label="Breakdown" />
            </Tabs>
          </Box>

          {tabValue === 0 && (
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="personal" name="Personal" stroke={theme.palette.primary.main} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="overall" name="Overall" stroke={theme.palette.secondary.main} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}

          {tabValue === 1 && (
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="personal" name="Personal" fill={theme.palette.primary.main} />
                  <Bar dataKey="overall" name="Overall" fill={theme.palette.secondary.main} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}
          {tabValue === 2 && (
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Category A", value: Math.floor(Math.random() * 100) },
                      { name: "Category B", value: Math.floor(Math.random() * 100) },
                      { name: "Category C", value: Math.floor(Math.random() * 100) },
                      { name: "Category D", value: Math.floor(Math.random() * 100) },
                    ]}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          )}
        </Paper>
      )}

      {/* Main Stats Grid */}
      {showCounts && (
        <>
          {/* View mode selector and filter section */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" fontWeight={500}>
              Statistics
              {selectedOption !== "DT" && (
                <Typography component="span" variant="body2" sx={{ ml: 1, color: "text.secondary" }}>
                  ({dateRangeOptions.find((option) => option.value === selectedOption)?.label})
                </Typography>
              )}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <FilterChip label="All Categories" variant="outlined" color="primary" onDelete={() => {}} />
              <FilterChip label="Show personal only" variant="outlined" color="default" />
            </Box>
          </Box>

          {/* Cards View */}
          {viewMode === "cards" && (
            <Grid container spacing={3}>
              {Object.entries(counts).map(([key, countData]) => {
                const mappingKey = key.toLowerCase();
                const mappingInfo = titleMapping[mappingKey] || {
                  title: key,
                  icon: PersonIcon,
                  color: theme.palette.primary.main,
                };

                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={key}>
                    <StyledStatCard onClick={() => handleCategoryClick(key)}>
                      <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                          <IconWrapper
                            sx={{
                              backgroundColor: alpha(mappingInfo.color, 0.1),
                              width: 40,
                              height: 40,
                              mr: 1.5,
                              mb: 0,
                            }}
                          >
                            {React.createElement(mappingInfo.icon, {
                              style: { color: mappingInfo.color },
                              fontSize: "small",
                            })}
                          </IconWrapper>
                          <Typography variant="h6" fontWeight={500} noWrap>
                            {mappingInfo.title}
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 1.5 }} />

                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <CountBadge
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                              }}
                            >
                              <PersonIcon sx={{ fontSize: 16, mr: 0.5 }} />
                              {countData.myCount}
                            </CountBadge>

                            <CountBadge
                              sx={{
                                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                color: theme.palette.secondary.main,
                              }}
                            >
                              <GroupIcon sx={{ fontSize: 16, mr: 0.5 }} />
                              {countData.overallCount}
                            </CountBadge>
                          </Box>

                          <Tooltip title="View details">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCategoryClick(key);
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </CardContent>
                    </StyledStatCard>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {/* Chart View */}
          {viewMode === "chart" && (
            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Comparative Analysis
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(counts).map(([key, data]) => ({
                        name: titleMapping[key.toLowerCase()]?.title || key,
                        personal: data.myCount,
                        overall: data.overallCount,
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        interval={0}
                        tick={(props) => {
                          const { x, y, payload } = props;
                          return (
                            <text x={x} y={y} dy={16} textAnchor="end" transform={`rotate(-45, ${x}, ${y})`} style={{ fontSize: "12px" }}>
                              {payload.value}
                            </text>
                          );
                        }}
                        height={70}
                      />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="personal" name="Personal" fill={theme.palette.primary.main} />
                      <Bar dataKey="overall" name="Overall" fill={theme.palette.secondary.main} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </StyledCard>
          )}

          {/* Table View */}
          {viewMode === "table" && (
            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Statistical Data
                </Typography>
                <Box sx={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th
                          style={{
                            padding: theme.spacing(1.5),
                            textAlign: "left",
                            borderBottom: `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          Category
                        </th>
                        <th
                          style={{
                            padding: theme.spacing(1.5),
                            textAlign: "center",
                            borderBottom: `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          Personal Count
                        </th>
                        <th
                          style={{
                            padding: theme.spacing(1.5),
                            textAlign: "center",
                            borderBottom: `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          Overall Count
                        </th>
                        <th
                          style={{
                            padding: theme.spacing(1.5),
                            textAlign: "center",
                            borderBottom: `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          Percentage (%)
                        </th>
                        <th
                          style={{
                            padding: theme.spacing(1.5),
                            textAlign: "center",
                            borderBottom: `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(counts).map(([key, data]) => {
                        const percentage = data.overallCount > 0 ? ((data.myCount / data.overallCount) * 100).toFixed(1) : "0";

                        return (
                          <tr
                            key={key}
                            style={{
                              "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.04) },
                            }}
                          >
                            <td
                              style={{
                                padding: theme.spacing(1.5),
                                borderBottom: `1px solid ${theme.palette.divider}`,
                              }}
                            >
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <IconWrapper
                                  sx={{
                                    backgroundColor: alpha(titleMapping[key.toLowerCase()]?.color || theme.palette.primary.main, 0.1),
                                    width: 32,
                                    height: 32,
                                    mr: 1,
                                    mb: 0,
                                  }}
                                >
                                  {React.createElement(titleMapping[key.toLowerCase()]?.icon || PersonIcon, {
                                    style: { color: titleMapping[key.toLowerCase()]?.color || theme.palette.primary.main },
                                    fontSize: "small",
                                  })}
                                </IconWrapper>
                                {titleMapping[key.toLowerCase()]?.title || key}
                              </Box>
                            </td>
                            <td
                              style={{
                                padding: theme.spacing(1.5),
                                textAlign: "center",
                                borderBottom: `1px solid ${theme.palette.divider}`,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color: theme.palette.primary.main,
                                }}
                              >
                                {data.myCount}
                              </Typography>
                            </td>
                            <td
                              style={{
                                padding: theme.spacing(1.5),
                                textAlign: "center",
                                borderBottom: `1px solid ${theme.palette.divider}`,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color: theme.palette.secondary.main,
                                }}
                              >
                                {data.overallCount}
                              </Typography>
                            </td>
                            <td
                              style={{
                                padding: theme.spacing(1.5),
                                textAlign: "center",
                                borderBottom: `1px solid ${theme.palette.divider}`,
                              }}
                            >
                              {percentage}%
                            </td>
                            <td
                              style={{
                                padding: theme.spacing(1.5),
                                textAlign: "center",
                                borderBottom: `1px solid ${theme.palette.divider}`,
                              }}
                            >
                              <IconButton size="small" onClick={() => handleCategoryClick(key)}>
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Box>
              </CardContent>
            </StyledCard>
          )}
        </>
      )}
    </Container>
  );
};

export default DashboardPage;
