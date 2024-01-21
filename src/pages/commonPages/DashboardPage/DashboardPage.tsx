import React, { useState } from "react";
import {
  Container,
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
  Badge,
  SelectChangeEvent,
} from "@mui/material";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import VisibilityIcon from "@mui/icons-material/Visibility";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import MainLayout from "../../../layouts/MainLayout/MainLayout";
import { DashBoardService } from "../../../services/DashboardService/DashBoardService";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/reducers";
import { useLoading } from "../../../context/LoadingContext";
import DropdownSelect from "../../../components/DropDown/DropdownSelect";
import FloatingLabelTextBox from "../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import CustomButton from "../../../components/Button/CustomButton";

// Define the interface for the count data
interface CountData {
  myCount: number | null;
  overallCount: number | null;
  show: boolean;
}

// Define the type with an index signature
type TitleMapping = {
  [key: string]: string;
};

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
  // ... more mappings
};

const DashboardPage: React.FC = () => {
  const today = new Date();
  const setStartOfDay = (date: Date) => {
    const utcDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
    );
    return utcDate.toISOString();
  };

  const setEndOfDay = (date: Date) => {
    const utcDate = new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        23,
        59,
        59,
        999
      )
    );
    return utcDate.toISOString();
  };

  const [dateRange, setDateRange] = useState({
    fromDate: setStartOfDay(today),
    toDate: setEndOfDay(today),
  });
  const [selectedOption, setSelectedOption] = useState("TD");
  const [counts, setCounts] = useState<Record<string, CountData>>({});
  const [showCounts, setShowCounts] = useState(false);
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const token = userInfo.token!;
  const { setLoading } = useLoading();

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
        from = setStartOfDay(
          startOfWeek(new Date(today.setDate(today.getDate() - 7)))
        );
        to = setEndOfDay(endOfWeek(new Date(today.setDate(today.getDate()))));
        break;
      case "TM": // This Month
        from = setStartOfDay(startOfMonth(today));
        to = setEndOfDay(endOfMonth(today));
        break;
      case "LM": // Last Month
        from = setStartOfDay(
          startOfMonth(new Date(today.setMonth(today.getMonth() - 1)))
        );
        to = setEndOfDay(
          endOfMonth(new Date(today.setMonth(today.getMonth())))
        );
        break;
      case "TY": // This Year
        from = setStartOfDay(startOfYear(today));
        to = setEndOfDay(endOfYear(today));
        break;
      case "LY": // Last Year
        from = setStartOfDay(
          startOfYear(new Date(today.setFullYear(today.getFullYear() - 1)))
        );
        to = setEndOfDay(
          endOfYear(new Date(today.setFullYear(today.getFullYear())))
        );
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
        const myCountResult = await DashBoardService.fetchCount(
          `Get${category}Userwise`,
          dateRange,
          token
        );
        const overallCountResult = await DashBoardService.fetchCount(
          `Get${category}`,
          dateRange,
          token
        );

        const isMyCountAvailable =
          !myCountResult.unauthorized && !myCountResult.error;
        const isOverallCountAvailable =
          !overallCountResult.unauthorized && !overallCountResult.error;

        if (isMyCountAvailable || isOverallCountAvailable) {
          setCounts((prevCounts) => ({
            ...prevCounts,
            [category.toLowerCase()]: {
              myCount: isMyCountAvailable ? myCountResult.count : null,
              overallCount: isOverallCountAvailable
                ? overallCountResult.count
                : null,
              show: true, // Set show to true if either count is available
            },
          }));
        } else {
          setCounts((prevCounts) => ({
            ...prevCounts,
            [category.toLowerCase()]: {
              ...prevCounts[category.toLowerCase()],
              show: false, // Set show to false if neither count is available
            },
          }));
        }
      }
    } catch (error) {
      console.error("Error in fetchData", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
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
  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={2}>
              <DropdownSelect
                label="Select date range"
                name="dateRange"
                value={selectedOption}
                options={dateRangeOptions}
                onChange={handleSelect}
                size="small"
              />

              {selectedOption === "DT" && (
                <Box display="flex" gap={2}>
                  <FloatingLabelTextBox
                    ControlID="fromDate"
                    title="From"
                    type="date"
                    size="small"
                    value={String(dateRange.fromDate)}
                    onChange={handleDateRangeChange}
                  />
                  <FloatingLabelTextBox
                    ControlID="toDate"
                    title="To"
                    type="date"
                    size="small"
                    value={String(dateRange.toDate)}
                    onChange={handleDateRangeChange}
                  />
                </Box>
              )}

              <CustomButton
                variant="contained"
                size="small"
                onClick={handleShowButtonClick}
                icon={VisibilityIcon}
                text="Show"
              />
            </Box>
          </Grid>

          {showCounts && (
            <Grid container spacing={2}>
              {Object.entries(counts).map(([key, countData]) =>
                countData.show ? (
                  <Grid item xs={12} md={6} lg={3} key={key}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">
                          {titleMapping[key.toLowerCase()] || key}
                        </Typography>
                        <Box display="flex" gap={2}>
                          {countData.myCount !== null && (
                            <Badge
                              badgeContent={`My Count: ${countData.myCount}`}
                              color="primary"
                            >
                              <PersonIcon />
                            </Badge>
                          )}
                          {countData.overallCount !== null && (
                            <Badge
                              badgeContent={`Overall: ${countData.overallCount}`}
                              color="success"
                            >
                              <GroupIcon />
                            </Badge>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ) : null
              )}
            </Grid>
          )}
        </Grid>
      </Container>
    </MainLayout>
  );
};

export default DashboardPage;
