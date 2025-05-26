import CustomButton from "@/components/Button/CustomButton";
import CustomGrid from "@/components/CustomGrid/CustomGrid";
import FormField from "@/components/FormField/FormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import useDayjs from "@/hooks/Common/useDateTime";
import { useLoading } from "@/hooks/Common/useLoading";
import { AppointBookingDto } from "@/interfaces/FrontOffice/AppointBookingDto";
import { AppointmentService } from "@/services/NotGenericPaternServices/AppointmentService";
import { Close, Print } from "@mui/icons-material";
import { Box, debounce, Grid, Pagination } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";

interface AppointmentSearchProps {
  open: boolean;
  onClose: () => void;
}

const AppointmentSearch: React.FC<AppointmentSearchProps> = ({ open, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [appointments, setAppointments] = useState<AppointBookingDto[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<AppointBookingDto[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const { isLoading, setLoading } = useLoading();
  const { formatDate, formatTime, formatDateTime } = useDayjs();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPdfDialog, setShowPdfDialog] = useState(false);

  const fetchInitialAppointments = async () => {
    setLoading(true);
    try {
      const result = await AppointmentService.searchAppointments(null, 1, 100);
      if (result.success && result.data) {
        setAppointments(result.data.items);
        setFilteredAppointments(result.data.items);
        setTotalPages(Math.ceil(result.data.items.length / pageSize));
      } else {
        console.error("Error fetching initial appointments:", result.errorMessage);
      }
    } catch (error) {
      console.error("Error fetching initial appointments:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      fetchInitialAppointments();
    }
  }, [open]);

  const handleLocalSearch = useCallback(
    (search: string) => {
      const lowercasedSearch = search.toLowerCase();
      const filtered = appointments.filter((appointment) => Object.values(appointment).some((value) => value && value.toString().toLowerCase().includes(lowercasedSearch)));
      setFilteredAppointments(filtered);
      setTotalPages(Math.ceil(filtered.length / pageSize));
      setPage(1);
    },
    [appointments, pageSize]
  );

  const handleServerSearch = useCallback(
    async (search: string) => {
      setLoading(true);
      try {
        const result = await AppointmentService.searchAppointments(search, 1, 100);
        if (result.success && result.data) {
          setAppointments(result.data.items);
          setFilteredAppointments(result.data.items);
          setTotalPages(Math.ceil(result.data.items.length / pageSize));
          setPage(1);
        } else {
          console.error("Error fetching appointments:", result.errorMessage);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
      setLoading(false);
    },
    [pageSize]
  );

  const debouncedServerSearch = debounce(handleServerSearch, 300);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);

    if (newSearchTerm.length < 3) {
      handleLocalSearch(newSearchTerm);
    } else {
      debouncedServerSearch(newSearchTerm);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    fetchInitialAppointments();
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const onPrint = async (row: AppointBookingDto) => {
    try {
      setLoading(true);
      const pdfBlob = await AppointmentService.generateAppointmentSlip(row.abID);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(pdfUrl);
      setShowPdfDialog(true);
    } catch (error) {
      console.error("Error generating appointment slip:", error);
      // Handle error (e.g., show an error message)
    } finally {
      setLoading(false);
    }
  };

  const closePdfDialog = () => {
    setShowPdfDialog(false);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  const getFullName = (row: AppointBookingDto): string => {
    const parts = [row.abTitle, row.abFName, row.abMName, row.abLName].filter(Boolean);
    return parts.join(" ").trim();
  };

  const columns = [
    { key: "abID", header: "App No", visible: true },
    {
      key: "pChartCode",
      header: "UHID",
      visible: true,
      render: (row: AppointBookingDto) => row.pChartCode || "Non - Registered",
    },
    { key: "abFName", header: "Name", visible: true, render: (row: AppointBookingDto) => getFullName(row) },
    {
      key: "abDate",
      header: "App Date",
      visible: true,
      render: (row: AppointBookingDto) => formatDate(row.abDate),
    },
    {
      key: "abTime",
      header: "Start Time",
      visible: true,
      render: (row: AppointBookingDto) => formatTime(row.abTime),
    },
    {
      key: "dob",
      header: "DOB",
      visible: true,
      render: (row: AppointBookingDto) => formatDate(row.dob),
    },
    { key: "abPType", header: "Type", visible: true },
    { key: "abStatus", header: "Status", visible: true },
    { key: "appPhone1", header: "Ph No", visible: true },
    { key: "providerName", header: "Attending Physician", visible: true },
    { key: "rCreatedBy", header: "Booked By", visible: true },
    {
      key: "rCreatedOn",
      header: "Booked On",
      visible: true,
      render: (row: any) => formatDateTime(row.rCreatedOn),
    },
    {
      key: "print",
      header: "Print",
      visible: true,
      render: (row: AppointBookingDto) => <CustomButton text="" onClick={() => onPrint(row)} icon={Print} size="small" />,
    },
  ];

  const paginatedAppointments = filteredAppointments.slice((page - 1) * pageSize, page * pageSize);

  const dialogContent = (
    <>
      <Box mb={2}>
        <Grid container>
          <FormField
            type="search"
            label="Search"
            value={searchTerm}
            onChange={handleSearchChange}
            name="search"
            ControlID="SearchField"
            placeholder="Search appointments..."
            InputProps={{
              type: "search",
              onInput: (e: React.ChangeEvent<HTMLInputElement>) => {
                if (e.target.value === "") {
                  handleClearSearch();
                }
              },
            }}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
      </Box>
      <CustomGrid columns={columns} data={paginatedAppointments} />
      <Box mt={2} display="flex" justifyContent="center">
        <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
      </Box>
    </>
  );

  const dialogActions = <CustomButton variant="contained" text="Close" icon={Close} size="medium" onClick={onClose} color="secondary" />;

  return (
    <>
      <GenericDialog
        open={open}
        onClose={onClose}
        title="Appointment Search"
        maxWidth="xxl"
        fullWidth
        showCloseButton
        actions={dialogActions}
        disableBackdropClick
        disableEscapeKeyDown
        dialogContentSx={{
          minHeight: "600px",
          maxHeight: "600px",
          overflowY: "auto",
        }}
      >
        {dialogContent}
      </GenericDialog>
      <GenericDialog
        open={showPdfDialog}
        onClose={closePdfDialog}
        title="Appointment Slip"
        maxWidth="xl"
        fullWidth
        showCloseButton
        actions={<CustomButton variant="contained" text="Close" icon={Close} size="medium" onClick={closePdfDialog} color="secondary" />}
      >
        {pdfUrl && <iframe src={pdfUrl} width="100%" height="1000vh" style={{ border: "none" }} />}
      </GenericDialog>
    </>
  );
};

export default AppointmentSearch;
