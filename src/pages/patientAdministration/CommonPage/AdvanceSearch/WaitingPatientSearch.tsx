import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { SelectChangeEvent, Grid } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import { UserState } from "@/store/features/auth/types";
import { ContactMastService } from "@/services/NotGenericPaternServices/ContactMastService";
import CustomGrid from "@/components/CustomGrid/CustomGrid";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import { DateFilterType } from "@/interfaces/PatientAdministration/revisitFormData";
import { RevisitService } from "@/services/PatientAdministrationServices/RevisitService/RevisitService";
import CustomButton from "@/components/Button/CustomButton";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { formatDate } from "@/utils/Common/dateUtils";
import FormField from "@/components/FormField/FormField";
import { useAlert } from "@/providers/AlertProvider";
import FloatingLabelTextBox from "@/components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";

interface WaitingPatientSearchProps {
  userInfo: UserState;
  show: boolean;
  handleClose: () => void;
  onPatientSelect: (patientId: string) => void;
}

const WaitingPatientSearch: React.FC<WaitingPatientSearchProps> = ({ userInfo, show, handleClose, onPatientSelect }) => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [attendingPhy, setAttendingPhy] = useState("");
  const [fromDate, setFromDate] = useState<Date | undefined>(new Date());
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [physicians, setPhysicians] = useState<Array<{ value: string; label: string }>>([]);
  const [originalSearchResults, setOriginalSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showAlert } = useAlert();

  // Use refs to track dialog state and prevent unnecessary API calls
  const isDialogOpen = useRef(false);
  const initialLoadDone = useRef(false);
  const isCurrentlyFetching = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchWaitingPatients = useCallback(async () => {
    // Prevent multiple concurrent requests
    if (!isDialogOpen.current || isCurrentlyFetching.current) {
      return;
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      isCurrentlyFetching.current = true;
      setIsLoading(true);

      const dateFilterTypeEnum = dateRange ? DateFilterType[dateRange as keyof typeof DateFilterType] : undefined;

      const data = await RevisitService.getWaitingPatientDetails(attendingPhy ? parseInt(attendingPhy) : undefined, dateFilterTypeEnum, fromDate, toDate);

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const fetchedResults = data.data || [];
      setOriginalSearchResults(fetchedResults);
      setSearchResults(fetchedResults);
      initialLoadDone.current = true;
    } catch (error) {
      // Only show error if request wasn't aborted
      if (!abortControllerRef.current?.signal.aborted) {
        console.error("Failed to fetch waiting patient details", error);
        showAlert("Error", "Failed to fetch waiting patient details. Please try again.", "error");
      }
    } finally {
      isCurrentlyFetching.current = false;
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [attendingPhy, dateRange, fromDate, toDate]); // Removed isLoading from dependencies

  // Handle dialog open/close
  useEffect(() => {
    isDialogOpen.current = show;

    if (show) {
      // Only perform the initial load once when the dialog opens
      if (!initialLoadDone.current) {
        fetchWaitingPatients();
      }
    } else {
      // Reset state when dialog closes
      initialLoadDone.current = false;

      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      // Reset loading state
      if (isCurrentlyFetching.current) {
        isCurrentlyFetching.current = false;
        setIsLoading(false);
      }
    }
  }, [show]); // Removed fetchWaitingPatients from dependencies to prevent loops

  // Handle search parameter changes
  useEffect(() => {
    if (show && initialLoadDone.current) {
      fetchWaitingPatients();
    }
  }, [dateRange, attendingPhy, fromDate, toDate, show]); // Removed fetchWaitingPatients from dependencies

  const handleDateRangeChange = useCallback((event: SelectChangeEvent<unknown>, child: React.ReactNode) => {
    setDateRange(event.target.value as string);
  }, []);

  // Fetch physicians only once when dialog opens
  useEffect(() => {
    if (show && physicians.length === 0 && !isCurrentlyFetching.current) {
      const fetchPhysicians = async () => {
        try {
          isCurrentlyFetching.current = true;
          setIsLoading(true);

          const endpoint = "GetActiveConsultants";
          const fetchedPhysicians = await ContactMastService.fetchAttendingPhysician(endpoint, userInfo.compID || 0);

          setPhysicians(
            fetchedPhysicians.map((option: any) => ({
              value: String(option.value),
              label: option.label,
            }))
          );
        } catch (error) {
          console.error("Failed to fetch attending physicians", error);
          showAlert("Error", "Failed to fetch attending physicians. Please try again.", "error");
        } finally {
          isCurrentlyFetching.current = false;
          setIsLoading(false);
        }
      };

      fetchPhysicians();
    }
  }, [show, userInfo.compID, physicians.length]);

  const handleAttendingPhyChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      const [conID, cdID] = event.target.value.split("-");
      const selectedPhysician = physicians.find((physician) => physician.value === `${conID}-${cdID}`);

      setAttendingPhy(event.target.value);
    },
    [physicians]
  );

  const handlePatientSelect = useCallback(
    (patientId: string) => {
      onPatientSelect(patientId);
      handleClose();
      showAlert("Success", "Patient selected successfully!", "success");
    },
    [onPatientSelect, handleClose]
  );

  const handleCancelVisit = useCallback(
    async (opVID: string) => {
      try {
        showAlert("Confirm", "Are you sure you want to cancel this visit?", "warning", {
          showCancelButton: true,
          confirmButtonText: "Yes, cancel it",
          cancelButtonText: "No, keep it",
          onConfirm: async () => {
            const result = await RevisitService.cancelVisit(parseInt(opVID), userInfo.userName!);
            if (result.success) {
              showAlert("Success", "Visit cancelled successfully!", "success");
              fetchWaitingPatients();
            } else {
              showAlert("Error", `Failed to cancel the visit: ${result.errorMessage}`, "error");
            }
          },
        });
      } catch (error) {
        console.error("An error occurred while canceling the visit:", error);
        showAlert("Error", "An unexpected error occurred while canceling the visit.", "error");
      }
    },
    [userInfo.userName, fetchWaitingPatients]
  );

  // Filter results based on search term (client-side filtering)
  const filteredResults = useMemo(() => {
    if (!searchTerm) return originalSearchResults;

    const lowercasedSearchTerm = searchTerm.toLowerCase().trim();
    return originalSearchResults.filter((patient) => Object.values(patient).some((value) => String(value).toLowerCase().includes(lowercasedSearchTerm)));
  }, [searchTerm, originalSearchResults]);

  // Update displayed results when filter changes
  useEffect(() => {
    setSearchResults(filteredResults);
  }, [filteredResults]);

  const handleFromDateChange = useCallback(
    (selectedDate: Date | null) => {
      if (!selectedDate) return;

      if (toDate && selectedDate > toDate) {
        showAlert("Warning", "From Date cannot be greater than To Date", "warning");
        return;
      }
      setFromDate(selectedDate);
    },
    [toDate]
  );

  const handleToDateChange = useCallback(
    (selectedDate: Date | null) => {
      if (!selectedDate) return;

      if (fromDate && selectedDate < fromDate) {
        showAlert("Warning", "To Date cannot be less than From Date", "warning");
        return;
      }
      setToDate(selectedDate);
    },
    [fromDate]
  );

  // Search button handler - explicitly trigger a search
  const handleSearch = useCallback(() => {
    if (!isCurrentlyFetching.current) {
      fetchWaitingPatients();
    }
  }, [fetchWaitingPatients]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const columns = [
    {
      key: "pVisitDate",
      header: "Visited Date",
      visible: true,
      render: (row: any) => formatDate(row.pVisitDate),
    },
    { key: "opNumber", header: "Visit Code", visible: true },
    { key: "pChartCode", header: "UHID", visible: true },
    { key: "patientName", header: "Patient Name", visible: true },
    { key: "attendingPhysicianName", header: "Attending Physician", visible: true },
    { key: "rCreatedBy", header: "Visit Created By", visible: true },
    {
      key: "CancelVisit",
      header: "Action",
      visible: true,
      render: (row: any) => <CustomButton text="Cancel Visit" onClick={() => handleCancelVisit(row.opVID.toString())} icon={CancelIcon} color="error" size="small" />,
    },
  ];

  const dialogContent = (
    <>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FloatingLabelTextBox
            ControlID="SearchWaitingPatient"
            title="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter name or other details"
            size="small"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
        <FormField
          type="select"
          label="Attending Physician"
          value={attendingPhy}
          name="attendingPhy"
          ControlID="AttendingPhysician"
          options={physicians}
          onChange={handleAttendingPhyChange}
          isMandatory={false}
          size="small"
        />
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
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <CustomButton text="Search" onClick={handleSearch} color="primary" size="medium" disabled={isLoading || isCurrentlyFetching.current} />
        </Grid>
      </Grid>
      <CustomGrid
        columns={columns}
        data={searchResults}
        minHeight="500px"
        maxHeight="500px"
        loading={isLoading}
        emptyStateMessage="No waiting patients found. Try changing your search criteria."
      />
    </>
  );

  const dialogActions = <CustomButton icon={CloseIcon} text="Close" color="secondary" onClick={handleClose} />;

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
