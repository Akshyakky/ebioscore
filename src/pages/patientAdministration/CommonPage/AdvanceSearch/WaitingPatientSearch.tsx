import React, { useState, useEffect, useCallback } from "react";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
import CustomButton from "../../../../components/Button/CustomButton";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import { SelectChangeEvent, Grid } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import { DateFilterType } from "../../../../interfaces/PatientAdministration/revisitFormData";
import { RevisitService } from "../../../../services/PatientAdministrationServices/RevisitService/RevisitService";
import { UserState } from "../../../../store/userTypes";
import GenericDialog from "../../../../components/GenericDialog/GenericDialog";
import { formatDate } from "../../../../utils/Common/dateUtils";
import FormField from "../../../../components/FormField/FormField";
import { showAlert } from "../../../../utils/Common/showAlert";

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
  const [physicians, setPhysicians] = useState<Array<{ value: string; label: string }>>([]);

  const fetchWaitingPatients = useCallback(async () => {
    try {
      const dateFilterTypeEnum = dateRange
        ? DateFilterType[dateRange as keyof typeof DateFilterType]
        : undefined;
      const data = await RevisitService.getWaitingPatientDetails(
        attendingPhy ? parseInt(attendingPhy) : undefined,
        dateFilterTypeEnum,
        fromDate,
        toDate
      );
      setSearchResults(data.data || []);

      if (data.data?.length === 0) {
        showAlert("Info", "No waiting patients found for the selected criteria.", "info");
      }
    } catch (error) {
      console.error("Failed to fetch waiting patient details", error);
      showAlert(
        "Error",
        "Failed to fetch waiting patient details. Please try again.",
        "error"
      );
    }
  }, [userInfo.token, attendingPhy, dateRange, fromDate, toDate]);

  useEffect(() => {
    fetchWaitingPatients();
  }, [fetchWaitingPatients]);

  const handleDateRangeChange = useCallback((
    event: SelectChangeEvent<unknown>,
    child: React.ReactNode
  ) => {
    setDateRange(event.target.value as string);
  }, []);

  const handleAttendingPhyChange = useCallback((
    event: SelectChangeEvent<unknown>,
    child: React.ReactNode
  ) => {
    setAttendingPhy(event.target.value as string);
  }, []);

  const handlePatientSelect = useCallback((patientId: string) => {
    onPatientSelect(patientId);
    handleClose();
    showAlert("Success", "Patient selected successfully!", "success");
  }, [onPatientSelect, handleClose]);

  const handleCancelVisit = useCallback(async (opVID: string) => {
    try {
      showAlert(
        "Confirm",
        "Are you sure you want to cancel this visit?",
        "warning",
        {
          showCancelButton: true,
          confirmButtonText: "Yes, cancel it",
          cancelButtonText: "No, keep it",
          onConfirm: async () => {
            const result = await RevisitService.cancelVisit(
              parseInt(opVID),
              userInfo.userName!
            );
            if (result.success) {
              showAlert("Success", "Visit cancelled successfully!", "success");
              fetchWaitingPatients(); // Refresh the list
            } else {
              showAlert(
                "Error",
                `Failed to cancel the visit: ${result.errorMessage}`,
                "error"
              );
            }
          }
        }
      );
    } catch (error) {
      console.error("An error occurred while canceling the visit:", error);
      showAlert(
        "Error",
        "An unexpected error occurred while canceling the visit.",
        "error"
      );
    }
  }, [userInfo.userName, fetchWaitingPatients]);

  const handleFromDateChange = useCallback((selectedDate: Date | null) => {
    if (!selectedDate) return;

    if (toDate && selectedDate > toDate) {
      showAlert(
        "Warning",
        "From Date cannot be greater than To Date",
        "warning"
      );
      return;
    }
    setFromDate(selectedDate);
  }, [toDate]);

  const handleToDateChange = useCallback((selectedDate: Date | null) => {
    if (!selectedDate) return;

    if (fromDate && selectedDate < fromDate) {
      showAlert(
        "Warning",
        "To Date cannot be less than From Date",
        "warning"
      );
      return;
    }
    setToDate(selectedDate);
  }, [fromDate]);

  const columns = [
    {
      key: "pVisitDate",
      header: "Visited Date",
      visible: true,
      render: (row: any) => formatDate(row.pVisitDate),
    },
    { key: "opNumber", header: "Visit Code", visible: true },
    { key: "pChartCode", header: "UHID", visible: true },
    { key: "deptName", header: "Patient Name", visible: true },
    { key: "attendingPhysicianName", header: "Attending Physician", visible: true },
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
          size="small"
        />
      ),
    },
  ];

  const dialogContent = (
    <>
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
            <FormField
              type="datepicker"
              label="From Date"
              name="FromDate"
              ControlID="FromDate"
              value={fromDate}
              onChange={handleFromDateChange}
              placeholder="From Date"
              size="small"
              isMandatory={true}
              disabled={false}
              gridProps={{ xs: 12, sm: 6, md: 4 }}
            />
            <FormField
              type="datepicker"
              label="To Date"
              name="ToDate"
              ControlID="ToDate"
              value={toDate}
              onChange={handleToDateChange}
              placeholder="To Date"
              size="small"
              isMandatory={true}
              disabled={false}
              gridProps={{ xs: 12, sm: 6, md: 4 }}
            />
          </>
        )}
      </Grid>
      <CustomGrid
        columns={columns}
        data={searchResults}
        minHeight="500px"
        maxHeight="500px"
      />
    </>
  );

  const dialogActions = (
    <CustomButton
      icon={CloseIcon}
      text="Close"
      color="secondary"
      onClick={handleClose}
    />
  );

  return (
    <GenericDialog
      open={show}
      onClose={handleClose}
      title="Waiting Patient Search"
      maxWidth="lg"
      fullWidth
      disableBackdropClick
      dialogContentSx={{
        minHeight: "600px",
        maxHeight: "600px",
        overflowY: "auto",
      }}
      actions={dialogActions}
    >
      {dialogContent}
    </GenericDialog>
  );
};

export default React.memo(WaitingPatientSearch);