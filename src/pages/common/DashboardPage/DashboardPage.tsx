import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Container,
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
  Tab,
  Tabs,
  MenuItem,
  Menu,
} from "@mui/material";
import { BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { styled } from "@mui/material/styles";
import {
  Person as PersonIcon,
  Group as GroupIcon,
  VisibilityOutlined as VisibilityIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  Bookmark as BookmarkIcon,
  FileDownload as DownloadIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  BarChart as BarChartIcon,
  DonutLarge as DonutIcon,
  TableChart as TableIcon,
} from "@mui/icons-material";
import { endOfMonth, endOfWeek, endOfYear, startOfMonth, startOfWeek, startOfYear, format, parse } from "date-fns";
import CustomButton from "@/components/Button/CustomButton";
import { useLoading } from "@/context/LoadingContext";
import { DashBoardService } from "@/services/DashboardServices/DashBoardService";
import { useAppSelector } from "@/store/hooks";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";

// Define the date format constant to ensure consistency
const DATE_FORMAT = "DD/MM/YYYY";

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

// Form type for date range
type DateRangeFormValues = {
  fromDate: string;
  toDate: string;
  dateRangeOption: string;
};

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const today = new Date();

  // Set default date range to current month in DD/MM/YYYY format
  const defaultFromDate = dayjs(startOfMonth(today)).format(DATE_FORMAT);
  const defaultToDate = dayjs(endOfMonth(today)).format(DATE_FORMAT);

  const [dateRange, setDateRange] = useState({
    fromDate: formatDateForAPI(defaultFromDate),
    toDate: formatDateForAPI(defaultToDate),
  });

  // React Hook Form setup
  const { control, setValue, watch } = useForm<DateRangeFormValues>({
    defaultValues: {
      fromDate: defaultFromDate,
      toDate: defaultToDate,
      dateRangeOption: "TM", // Default to This Month
    },
  });

  // Function to format date from DD/MM/YYYY to YYYY-MM-DD for API
  function formatDateForAPI(dateString: string): string {
    if (!dateString) return "";

    // Parse the DD/MM/YYYY format into a Date object
    const parts = dateString.split("/");
    if (parts.length !== 3) return "";

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JavaScript Date
    const year = parseInt(parts[2], 10);

    const date = new Date(year, month, day);
    return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD
  }

  // Watch form values to update dateRange state
  const fromDateWatch = watch("fromDate");
  const toDateWatch = watch("toDate");
  const dateRangeOptionWatch = watch("dateRangeOption");

  useEffect(() => {
    setDateRange({
      fromDate: formatDateForAPI(fromDateWatch),
      toDate: formatDateForAPI(toDateWatch),
    });
  }, [fromDateWatch, toDateWatch]);

  // Update selectedOption when dropdown value changes
  useEffect(() => {
    if (dateRangeOptionWatch) {
      setSelectedOption(dateRangeOptionWatch);
      handleDateRangeChange(dateRangeOptionWatch);
    }
  }, [dateRangeOptionWatch]);

  const [selectedOption, setSelectedOption] = useState("TM"); // Default to This Month
  const [counts, setCounts] = useState<Record<string, CountData>>({});
  const [filteredCounts, setFilteredCounts] = useState<Record<string, CountData>>({});
  const [showCounts, setShowCounts] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "chart" | "table">("cards");
  const [trendData, setTrendData] = useState<any[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [bookmarkAnchorEl, setBookmarkAnchorEl] = useState<null | HTMLElement>(null);
  const [showPersonalOnly, setShowPersonalOnly] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

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
    // Validate date range - ensure fromDate is not after toDate
    if (fromDateWatch && toDateWatch) {
      const fromParts = fromDateWatch.split("/");
      const toParts = toDateWatch.split("/");

      if (fromParts.length === 3 && toParts.length === 3) {
        const fromDate = new Date(parseInt(fromParts[2], 10), parseInt(fromParts[1], 10) - 1, parseInt(fromParts[0], 10));

        const toDate = new Date(parseInt(toParts[2], 10), parseInt(toParts[1], 10) - 1, parseInt(toParts[0], 10));

        if (fromDate > toDate) {
          setValue("toDate", fromDateWatch);
        }
      }
    }
  }, [fromDateWatch, toDateWatch, setValue]);

  useEffect(() => {
    if (selectedCategory) {
      // Generate trend data when a category is selected
      setTrendData(generateTrendData(selectedCategory, 7));
    }
  }, [selectedCategory]);

  // Effect to apply filters
  useEffect(() => {
    if (Object.keys(counts).length > 0) {
      let filtered = { ...counts };

      // Apply category filter if any categories are selected
      if (selectedCategories.length > 0) {
        filtered = Object.entries(filtered)
          .filter(([key]) => selectedCategories.includes(key.toLowerCase()))
          .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
      }

      setFilteredCounts(filtered);
    }
  }, [counts, selectedCategories, showPersonalOnly]);

  const handleDateRangeChange = (selectedValue: string) => {
    const today = new Date();
    let from, to;

    switch (selectedValue) {
      case "TD": // Today
        from = dayjs(today).format(DATE_FORMAT);
        to = dayjs(today).format(DATE_FORMAT);
        break;
      case "YD": // Yesterday
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        from = dayjs(yesterday).format(DATE_FORMAT);
        to = dayjs(yesterday).format(DATE_FORMAT);
        break;
      case "TW": // This Week
        from = dayjs(startOfWeek(today)).format(DATE_FORMAT);
        to = dayjs(endOfWeek(today)).format(DATE_FORMAT);
        break;
      case "LW": // Last Week
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        from = dayjs(startOfWeek(lastWeekStart)).format(DATE_FORMAT);
        to = dayjs(endOfWeek(lastWeekStart)).format(DATE_FORMAT);
        break;
      case "TM": // This Month
        from = dayjs(startOfMonth(today)).format(DATE_FORMAT);
        to = dayjs(endOfMonth(today)).format(DATE_FORMAT);
        break;
      case "LM": // Last Month
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        from = dayjs(startOfMonth(lastMonth)).format(DATE_FORMAT);
        to = dayjs(endOfMonth(lastMonth)).format(DATE_FORMAT);
        break;
      case "TY": // This Year
        from = dayjs(startOfYear(today)).format(DATE_FORMAT);
        to = dayjs(endOfYear(today)).format(DATE_FORMAT);
        break;
      case "LY": // Last Year
        const lastYear = new Date(today);
        lastYear.setFullYear(lastYear.getFullYear() - 1);
        from = dayjs(startOfYear(lastYear)).format(DATE_FORMAT);
        to = dayjs(endOfYear(lastYear)).format(DATE_FORMAT);
        break;
      case "DT": // Date Range
        return; // The user will pick the dates
      default:
        from = dayjs(startOfMonth(today)).format(DATE_FORMAT);
        to = dayjs(endOfMonth(today)).format(DATE_FORMAT);
    }

    setValue("fromDate", from);
    setValue("toDate", to);
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
      const newCounts: Record<string, CountData> = {};

      for (const category of categories) {
        const myCountResult = await DashBoardService.fetchCount(`Get${category}Userwise`, dateRange);
        const overallCountResult = await DashBoardService.fetchCount(`Get${category}`, dateRange);

        const isMyCountAvailable = !myCountResult.unauthorized && !myCountResult.error;
        const isOverallCountAvailable = !overallCountResult.unauthorized && !overallCountResult.error;

        newCounts[category.toLowerCase()] = {
          myCount: isMyCountAvailable ? myCountResult.count : 0,
          overallCount: isOverallCountAvailable ? overallCountResult.count : 0,
        };
      }

      setCounts(newCounts);
      setFilteredCounts(newCounts);
    } catch (error) {
      console.error("Error in fetchData", error);
    } finally {
      setLoading(false);
      setShowCounts(true);
    }
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

  // New function to toggle personal only filter
  const handleTogglePersonalOnly = () => {
    setShowPersonalOnly(!showPersonalOnly);
  };

  // New function to handle all categories selection
  const handleAllCategoriesClick = () => {
    // If all categories are already selected, clear the selection
    if (selectedCategories.length === 0) {
      setSelectedCategories(Object.keys(counts).map((key) => key.toLowerCase()));
    } else {
      setSelectedCategories([]);
    }
  };

  // Options for the date range dropdown formatted for EnhancedFormField
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

  // Calculate summary statistics based on filtered counts
  const getTotalPersonalCounts = () => {
    return Object.values(filteredCounts).reduce((sum, item) => sum + item.myCount, 0);
  };

  const getTotalOverallCounts = () => {
    return Object.values(filteredCounts).reduce((sum, item) => sum + item.overallCount, 0);
  };

  const getHighestCategory = () => {
    if (Object.keys(filteredCounts).length === 0) return null;

    return Object.entries(filteredCounts).reduce(
      (highest, [key, value]) => {
        const countValue = showPersonalOnly ? value.myCount : value.overallCount;
        return countValue > highest.count ? { key, count: countValue } : highest;
      },
      { key: "", count: 0 }
    );
  };

  // Create data for summary charts
  const getPieChartData = () => {
    return Object.entries(filteredCounts).map(([key, value]) => ({
      name: titleMapping[key.toLowerCase()]?.title || key,
      value: showPersonalOnly ? value.myCount : value.overallCount,
    }));
  };

  // Format date range for display
  const getFormattedDateRange = () => {
    // The dates are already in DD/MM/YYYY format in the form state
    if (fromDateWatch === toDateWatch) {
      return fromDateWatch;
    }
    return `${fromDateWatch} - ${toDateWatch}`;
  };

  // Get counts to display based on filters
  const getDisplayCounts = useMemo(() => {
    if (showPersonalOnly) {
      // When "Show personal only" is active, modify the displayed counts
      return Object.entries(filteredCounts).reduce((acc, [key, value]) => {
        acc[key] = {
          myCount: value.myCount,
          overallCount: value.myCount, // Show personal count as overall count
        };
        return acc;
      }, {} as Record<string, CountData>);
    }
    return filteredCounts;
  }, [filteredCounts, showPersonalOnly]);

  // Run fetchData when component mounts with default month range
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container maxWidth={false}>
      {/* Header Section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}></Box>
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
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, alignItems: { sm: "center" } }}>
          <Box sx={{ flex: "1 1 auto", maxWidth: { xs: "100%", sm: "25%" } }}>
            <FormField
              name="dateRangeOption"
              control={control}
              type="select"
              label="Select date range"
              variant="outlined"
              size="small"
              options={dateRangeOptions}
              defaultValue={selectedOption}
            />
          </Box>

          {selectedOption === "DT" && (
            <>
              <Box sx={{ flex: "1 1 auto", maxWidth: { xs: "100%", sm: "25%" } }}>
                <FormField name="fromDate" control={control} type="datepicker" label="From Date" variant="outlined" size="small" required />
              </Box>
              <Box sx={{ flex: "1 1 auto", maxWidth: { xs: "100%", sm: "25%" } }}>
                <FormField name="toDate" control={control} type="datepicker" label="To Date" variant="outlined" size="small" required />
              </Box>
            </>
          )}

          <Box sx={{ display: "flex", gap: 1, alignSelf: { xs: "flex-end", sm: "center" } }}>
            <CustomButton variant="contained" size="medium" onClick={handleShowButtonClick} icon={VisibilityIcon} text="SHOW" color="primary" />
            <IconButton>
              <FilterIcon />
            </IconButton>
          </Box>
        </Box>

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
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            mb: 3,
          }}
        >
          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%", md: "1 1 22%" } }}>
            <StyledCard sx={{ height: "100%" }}>
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
          </Box>

          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%", md: "1 1 22%" } }}>
            <StyledCard sx={{ height: "100%" }}>
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
          </Box>

          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%", md: "1 1 22%" } }}>
            <StyledCard sx={{ height: "100%" }}>
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
          </Box>

          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%", md: "1 1 22%" } }}>
            <StyledCard sx={{ height: "100%" }}>
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
          </Box>
        </Box>
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
                  mb: 0,
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
              <FilterChip
                label="All Categories"
                variant="outlined"
                color={selectedCategories.length > 0 ? "primary" : "default"}
                onClick={handleAllCategoriesClick}
                onDelete={selectedCategories.length > 0 ? handleAllCategoriesClick : undefined}
              />
              <FilterChip label="Show personal only" variant="outlined" color={showPersonalOnly ? "primary" : "default"} onClick={handleTogglePersonalOnly} />
            </Box>
          </Box>

          {/* Cards View */}
          {viewMode === "cards" && (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 3,
              }}
            >
              {Object.entries(getDisplayCounts).map(([key, countData]) => {
                const mappingKey = key.toLowerCase();
                const mappingInfo = titleMapping[mappingKey] || {
                  title: key,
                  icon: PersonIcon,
                  color: theme.palette.primary.main,
                };

                return (
                  <Box
                    key={key}
                    sx={{
                      flex: {
                        xs: "1 1 100%",
                        sm: "1 1 45%",
                        md: "1 1 30%",
                        lg: "1 1 22%",
                      },
                      minWidth: { xs: "100%", sm: "260px", md: "280px" },
                    }}
                  >
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

                            {!showPersonalOnly && (
                              <CountBadge
                                sx={{
                                  bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                  color: theme.palette.secondary.main,
                                }}
                              >
                                <GroupIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                {countData.overallCount}
                              </CountBadge>
                            )}
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
                  </Box>
                );
              })}
            </Box>
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
                      data={Object.entries(getDisplayCounts).map(([key, data]) => ({
                        name: titleMapping[key.toLowerCase()]?.title || key,
                        personal: data.myCount,
                        overall: showPersonalOnly ? 0 : data.overallCount,
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
                      {!showPersonalOnly && <Bar dataKey="overall" name="Overall" fill={theme.palette.secondary.main} />}
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
                        {!showPersonalOnly && (
                          <th
                            style={{
                              padding: theme.spacing(1.5),
                              textAlign: "center",
                              borderBottom: `1px solid ${theme.palette.divider}`,
                            }}
                          >
                            Overall Count
                          </th>
                        )}
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
                      {Object.entries(getDisplayCounts).map(([key, data]) => {
                        const percentage = data.overallCount > 0 ? ((data.myCount / data.overallCount) * 100).toFixed(1) : "0";

                        return (
                          <tr
                            key={key}
                            style={{
                              backgroundColor: "transparent",
                              transition: "background-color 0.2s",
                              cursor: "pointer",
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = alpha(theme.palette.primary.main, 0.04);
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                            }}
                            onClick={() => handleCategoryClick(key)}
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
                            {!showPersonalOnly && (
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
                            )}
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
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCategoryClick(key);
                                }}
                              >
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
