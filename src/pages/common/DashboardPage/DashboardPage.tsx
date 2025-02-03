import React, { useEffect, useState } from "react";
import { Container, Grid, Box, Card, CardContent, Typography, Badge, SelectChangeEvent, Paper } from "@mui/material";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import VisibilityIcon from "@mui/icons-material/Visibility";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import { DashBoardService } from "../../../services/DashboardServices/DashBoardService";
import { useSelector } from "react-redux";
import { useLoading } from "../../../context/LoadingContext";
import DropdownSelect from "../../../components/DropDown/DropdownSelect";
import FloatingLabelTextBox from "../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import CustomButton from "../../../components/Button/CustomButton";
import { styled, useTheme } from "@mui/material/styles";
import { useAppSelector } from "@/store/hooks";

// Define the interface for the count data
interface CountData {
  myCount: number;
  overallCount: number;
}

// Define the type with an index signature
type TitleMapping = {
  [key: string]: string;
};

// Your existing StyledBadge component
const StyledLeftBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: -3,
    top: 13,
    padding: "4px 4px",
    transform: "scale(1) translate(80%, -50%)",
    transformOrigin: "100% 0%",
    backgroundColor: theme.palette.info.main,
    color: theme.palette.common.white,
  },
}));

const StyledRightBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: -3,
    top: 13,
    padding: "4px 4px",
    transform: "scale(1) translate(-150%, -50%)",
    transformOrigin: "100% 0%",
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.common.white,
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  boxShadow: "0px 8px 16px rgba(0,0,0,0.1)",
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: "0px 12px 24px rgba(0,0,0,0.15)",
  },
}));

// Define the mapping object with explicit types
const titleMapping: TitleMapping = {
  registration: "Registration",
  revisit: "Revisit",
  admission: "Admission",
  wbtransfer: "Ward Bed Transfer",
  discharge: "Discharge",
  income: "Income",
  collection: "Collection",
  refund: "Refund",
  creditnote: "Credit Note",
  transfernote: "Transfer Note",
  transferpaydetail: "Transfer Pay Details",
  advancecollection: "Advance Collection",
  dischargesummary: "Discarge Summary",
  // ... more mappings
};

const DashboardPage: React.FC = () => {
  const today = new Date();
  const setStartOfDay = (date: Date) => {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
    return utcDate.toISOString().split("T")[0]; // Return only the date part
  };

  const setEndOfDay = (date: Date) => {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999));
    return utcDate.toISOString();
  };

  const [dateRange, setDateRange] = useState({
    fromDate: setStartOfDay(today),
    toDate: setStartOfDay(today),
  });
  const [selectedOption, setSelectedOption] = useState("TD");
  const [counts, setCounts] = useState<Record<string, CountData>>({});
  const [showCounts, setShowCounts] = useState(false);
  const userInfo = useAppSelector((state) => state.auth);
  const token = userInfo.token!;
  const { setLoading } = useLoading();

  useEffect(() => {
    if (new Date(dateRange.fromDate) > new Date(dateRange.toDate)) {
      setDateRange((prev) => ({
        ...prev,
        fromDate: prev.toDate, // Reset fromDate to toDate if it's after toDate
      }));
    }
  }, [dateRange.fromDate, dateRange.toDate]);

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
    setShowCounts(true); // Set showCounts to true after data is fetched
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

  const theme = useTheme();

  return (
    <Container maxWidth={false}>
      <Paper elevation={3} sx={{ padding: theme.spacing(5), marginTop: theme.spacing(5) }}>
        <Typography variant="h6" sx={{ borderBottom: "1px solid #000" }}>
          Statistics
        </Typography>
        <Grid container spacing={3} alignItems="center">
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
            <CustomButton variant="contained" size="medium" onClick={handleShowButtonClick} icon={VisibilityIcon} text="SHOW" color="primary" />
          </Grid>
        </Grid>

        {showCounts && (
          <Grid container spacing={3} sx={{ marginTop: theme.spacing(3) }}>
            {Object.entries(counts).map(([key, countData]) => (
              <Grid item xs={12} sm={6} lg={4} key={key}>
                <StyledCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {titleMapping[key.toLowerCase()] || key}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <StyledLeftBadge
                        badgeContent={countData.myCount}
                        color="primary"
                        anchorOrigin={{
                          vertical: "top",
                          horizontal: "right",
                        }}
                        showZero
                      >
                        <PersonIcon />
                      </StyledLeftBadge>
                      <StyledRightBadge
                        badgeContent={countData.overallCount}
                        color="secondary"
                        anchorOrigin={{
                          vertical: "top",
                          horizontal: "right",
                        }}
                        showZero
                      >
                        <GroupIcon />
                      </StyledRightBadge>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default DashboardPage;
