//patientAdministration/AdvanceSearch/WaitingPatientSearch.tsx
import React, { useState, useEffect } from "react";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
import CustomButton from "../../../../components/Button/CustomButton";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  SelectChangeEvent,
  Grid,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import { DateFilterType } from "../../../../interfaces/PatientAdministration/revisitFormData";
import { RevisitService } from "../../../../services/PatientAdministrationServices/RevisitService/RevisitService";
import { UserState } from "../../../../store/userTypes";

interface WaitingPatientSearchProps {
  userInfo: UserState;
  show: boolean;
  handleClose: () => void;
  onPatientSelect: (patientId: string) => void;
}

const WaitingPatientSearch: React.FC<WaitingPatientSearchProps> = ({
  userInfo,
  show,
  handleClose,
  onPatientSelect,
}) => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [attendingPhy, setAttendingPhy] = useState("");
  const [fromDate, setFromDate] = useState<Date | undefined>(new Date());
  const [toDate, setToDate] = useState<Date | undefined>(new Date());

  const [physicians, setPhysicians] = useState<
    Array<{ value: string; label: string }>
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dateFilterTypeEnum = dateRange
          ? DateFilterType[dateRange as keyof typeof DateFilterType]
          : undefined;
        const data = await RevisitService.getWaitingPatientDetails(
          userInfo.token!,
          attendingPhy ? parseInt(attendingPhy) : undefined,
          dateFilterTypeEnum,
          fromDate,
          toDate
        );
        setSearchResults(data.data || []);
      } catch (error) {
        console.error("Failed to fetch waiting patient details", error);
      }
    };

    fetchData();
  }, [userInfo.token, attendingPhy, dateRange, fromDate, toDate]);

  const handleDateRangeChange = (
    event: SelectChangeEvent<unknown>,
    child: React.ReactNode
  ) => {
    setDateRange(event.target.value as string);
  };

  const handleAttendingPhyChange = (
    event: SelectChangeEvent<unknown>,
    child: React.ReactNode
  ) => {
    setAttendingPhy(event.target.value as string);
  };
  const handlePatientSelect = (patientId: string) => {
    onPatientSelect(patientId);
    handleClose();
  };
  const handleCancelVisit = async (opVID: string) => {
    try {
      const result = await RevisitService.cancelVisit(
        userInfo.token!,
        parseInt(opVID),
        userInfo.userName!
      );
      if (result.success) {
        alert("Visit cancellation was successful.");
      } else {
        alert("Failed to cancel the visit: " + result.errorMessage);
      }
    } catch (error) {
      console.error("An error occurred while canceling the visit:", error);
      alert("An error occurred while canceling the visit.");
    }
  };
  const columns = [
    { key: "pVisitDate", header: "Visited Date", visible: true },
    { key: "opNumber", header: "Visit Code", visible: true },
    { key: "pChartCode", header: "UHID", visible: true },
    {
      key: "deptName",
      header: "Patient Name",
      visible: true,
    },
    {
      key: "attendingPhysicianName",
      header: "Attending Physician",
      visible: true,
    },
    { key: "rCreatedBy", header: "Visit Created By", visible: true },
    {
      key: "CancelVisit",
      header: "Action",
      visible: true,
      render: (row: any) => (
        <CustomButton
          text="Cancel Visit"
          onClick={() => handleCancelVisit(row.opVID.toString())}
          icon={CancelIcon}
          color="error"
        />
      ),
    },
  ];
  return (
    <Dialog open={show} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Waiting Patient Search</Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <FloatingLabelTextBox
              ControlID="SearchWaitingPatient"
              title="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter name or other details"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <DropdownSelect
              label="Select Date Range"
              name="dateRange"
              value={dateRange}
              options={[
                { value: "Today", label: "Today" },
                { value: "LastOneWeek", label: "Last Week" },
                { value: "LastOneMonth", label: "Last Month" },
                { value: "LastThreeMonths", label: "Last Three Month" },
                { value: "Custom", label: "Custom Range" },
              ]}
              onChange={handleDateRangeChange}
              defaultText="Select Date Range"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <DropdownSelect
              label="Select Attending Physician"
              name="attendingPhy"
              value={attendingPhy}
              options={physicians}
              onChange={handleAttendingPhyChange}
              defaultText="Select Attending Physician"
              size="small"
            />
          </Grid>
          {dateRange === "Custom" && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <FloatingLabelTextBox
                  ControlID="FromDate"
                  title="From Date"
                  type="date"
                  value={fromDate ? fromDate.toISOString().split("T")[0] : ""}
                  onChange={(e) => {
                    const selectedDate = e.target.value
                      ? new Date(e.target.value)
                      : undefined;
                    if (selectedDate && toDate && selectedDate <= toDate) {
                      setFromDate(selectedDate);
                    } else {
                      alert("From Date cannot be greater than To Date");
                    }
                  }}
                  placeholder="From Date"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FloatingLabelTextBox
                  ControlID="ToDate"
                  title="To Date"
                  type="date"
                  value={toDate ? toDate.toISOString().split("T")[0] : ""}
                  onChange={(e) => {
                    const selectedDate = e.target.value
                      ? new Date(e.target.value)
                      : undefined;
                    if (selectedDate && fromDate && selectedDate >= fromDate) {
                      setToDate(selectedDate);
                    } else {
                      alert("To Date cannot be less than From Date");
                    }
                  }}
                  placeholder="To Date"
                  size="small"
                />
              </Grid>
            </>
          )}
        </Grid>
        <CustomGrid
          columns={columns}
          data={searchResults}
          minHeight="500px"
          maxHeight="500px"
        />
      </DialogContent>
      <DialogActions>
        <CustomButton
          icon={CloseIcon}
          text="Close"
          color="secondary"
          onClick={handleClose}
        />
      </DialogActions>
    </Dialog>
  );
};

export default WaitingPatientSearch;
