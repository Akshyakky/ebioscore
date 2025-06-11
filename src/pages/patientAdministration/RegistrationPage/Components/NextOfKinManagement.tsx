// src/pages/patientAdministration/RegistrationPage/Components/NextOfKinManagement.tsx
import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import { useServerDate } from "@/hooks/Common/useServerDate";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { PatNokDetailsDto } from "@/interfaces/PatientAdministration/PatNokDetailsDto";
import { useAlert } from "@/providers/AlertProvider";
import { PatNokService } from "@/services/PatientAdministrationServices/RegistrationService/PatNokService";
import { formatDt } from "@/utils/Common/dateUtils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, People as NextOfKinIcon, Save as SaveIcon } from "@mui/icons-material";
import { Alert, Box, Chip, Grid, IconButton, Paper, Stack, Typography } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Validation schema for Next of Kin form
const nextOfKinSchema = z.object({
  pNokID: z.number().default(0),
  pChartID: z.number().min(1, "Patient Chart ID is required"),
  pNokPChartCode: z.string().default(""),
  pNokPChartID: z.number().optional().default(0),
  pNokRegStatusVal: z.string().default("N"),
  pNokRegStatus: z.string().default("Not Registered"),
  pNokPssnID: z.string().optional().default(""),
  pNokDob: z.date().default(new Date()),
  pNokRelNameVal: z.string().min(1, "Relationship is required"),
  pNokRelName: z.string().default(""),
  pNokTitleVal: z.string().min(1, "Title is required"),
  pNokTitle: z.string().default(""),
  pNokFName: z.string().min(1, "First name is required"),
  pNokMName: z.string().optional().default(""),
  pNokLName: z.string().min(1, "Last name is required"),
  pNokActualCountryVal: z.string().optional().default(""),
  pNokActualCountry: z.string().optional().default(""),
  pNokAreaVal: z.string().optional().default(""),
  pNokArea: z.string().optional().default(""),
  pNokCityVal: z.string().optional().default(""),
  pNokCity: z.string().optional().default(""),
  pNokCountryVal: z.string().optional().default(""),
  pNokCountry: z.string().optional().default(""),
  pNokDoorNo: z.string().optional().default(""),
  pAddPhone1: z.string().min(1, "Primary phone is required"),
  pAddPhone2: z.string().optional().default(""),
  pAddPhone3: z.string().optional().default(""),
  pNokPostcode: z.string().optional().default(""),
  pNokState: z.string().optional().default(""),
  pNokStreet: z.string().optional().default(""),
  rActiveYN: z.enum(["Y", "N"]).default("Y"),
  rNotes: z.string().optional().default(""),
  transferYN: z.enum(["Y", "N"]).default("N"),
});

type NextOfKinFormData = z.infer<typeof nextOfKinSchema>;

interface NextOfKinManagementProps {
  pChartID: number;
  patientName: string;
  open: boolean;
  onClose: () => void;
}

const NextOfKinManagement: React.FC<NextOfKinManagementProps> = ({ pChartID, patientName, open, onClose }) => {
  const [nokList, setNokList] = useState<PatNokDetailsDto[]>([]);
  const [selectedNok, setSelectedNok] = useState<PatNokDetailsDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [nokToDelete, setNokToDelete] = useState<PatNokDetailsDto | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { showAlert } = useAlert();
  const { setLoading } = useLoading();
  const serverDate = useServerDate();

  // Load dropdown values
  const dropdownValues = useDropdownValues(["title", "relation", "area", "city", "country", "state"]);

  // Form setup
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty, isValid },
  } = useForm<NextOfKinFormData>({
    resolver: zodResolver(nextOfKinSchema),
    mode: "onChange",
    defaultValues: {
      pNokID: 0,
      pChartID,
      pNokPChartCode: "",
      pNokPChartID: 0,
      pNokRegStatusVal: "N",
      pNokRegStatus: "Not Registered",
      pNokPssnID: "",
      pNokDob: serverDate,
      pNokRelNameVal: "",
      pNokRelName: "",
      pNokTitleVal: "",
      pNokTitle: "",
      pNokFName: "",
      pNokMName: "",
      pNokLName: "",
      pNokActualCountryVal: "",
      pNokActualCountry: "",
      pNokAreaVal: "",
      pNokArea: "",
      pNokCityVal: "",
      pNokCity: "",
      pNokCountryVal: "",
      pNokCountry: "",
      pNokDoorNo: "",
      pAddPhone1: "",
      pAddPhone2: "",
      pAddPhone3: "",
      pNokPostcode: "",
      pNokState: "",
      pNokStreet: "",
      rActiveYN: "Y",
      rNotes: "",
      transferYN: "N",
    },
  });

  // Load next of kin data
  const loadNextOfKinData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await PatNokService.getNokDetailsByPChartID(pChartID);

      if (result.success && result.data) {
        setNokList(result.data);
      } else {
        setNokList([]);
        if (result.errorMessage) {
          console.error("Error loading Next of Kin data:", result.errorMessage);
        }
      }
    } catch (error) {
      console.error("Error loading Next of Kin data:", error);
      showAlert("Error", "Failed to load Next of Kin information", "error");
      setNokList([]);
    } finally {
      setLoading(false);
    }
  }, [pChartID, showAlert]);

  // Load data when component opens
  useEffect(() => {
    if (open && pChartID) {
      loadNextOfKinData();
    }
  }, [open, pChartID, loadNextOfKinData]);

  // Handle form submission
  const onSubmit = async (data: NextOfKinFormData) => {
    setFormError(null);

    try {
      setLoading(true);

      const nokData: PatNokDetailsDto = {
        ...data,
        pNokID: data.pNokID || 0,
        pNokDob: data.pNokDob || serverDate,
        pNokFName: data.pNokFName,
        pNokMName: data.pNokMName,
        pNokLName: data.pNokLName,
        pAddPhone1: data.pAddPhone1,
        rActiveYN: data.rActiveYN,
        rNotes: data.rNotes,
        transferYN: data.transferYN,
      };

      const result = await PatNokService.saveNokDetails(nokData);

      if (result.success) {
        showAlert("Success", `Next of Kin ${formMode === "create" ? "added" : "updated"} successfully`, "success");
        setIsFormOpen(false);
        reset();
        await loadNextOfKinData();
      } else {
        throw new Error(result.errorMessage || "Failed to save Next of Kin details");
      }
    } catch (error) {
      console.error("Error saving Next of Kin:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save Next of Kin details";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle dropdown changes
  const handleTitleChange = useCallback(
    (event: any) => {
      const value = event?.target?.value || event?.value || event;
      const selectedOption = dropdownValues.title?.find((option) => option.value === value);
      if (selectedOption) {
        setValue("pNokTitleVal", value, { shouldValidate: true, shouldDirty: true });
        setValue("pNokTitle", selectedOption.label, { shouldValidate: true, shouldDirty: true });
      }
    },
    [dropdownValues.title, setValue]
  );

  const handleRelationChange = useCallback(
    (event: any) => {
      const value = event?.target?.value || event?.value || event;
      const selectedOption = dropdownValues.relation?.find((option) => option.value === value);
      if (selectedOption) {
        setValue("pNokRelNameVal", value, { shouldValidate: true, shouldDirty: true });
        setValue("pNokRelName", selectedOption.label, { shouldValidate: true, shouldDirty: true });
      }
    },
    [dropdownValues.relation, setValue]
  );

  // Action handlers
  const handleAddNew = useCallback(() => {
    setSelectedNok(null);
    setFormMode("create");
    reset({
      pNokID: 0,
      pChartID,
      pNokDob: serverDate,
      rActiveYN: "Y",
      transferYN: "N",
    });
    setIsFormOpen(true);
  }, [reset, pChartID, serverDate]);

  const handleEdit = useCallback(
    (nok: PatNokDetailsDto) => {
      setSelectedNok(nok);
      setFormMode("edit");

      // Populate form with existing data
      reset({
        ...nok,
        pNokDob: nok.pNokDob ? new Date(nok.pNokDob) : serverDate,
      } as NextOfKinFormData);
      setIsFormOpen(true);
    },
    [reset, serverDate]
  );

  const handleDeleteClick = useCallback((nok: PatNokDetailsDto) => {
    setNokToDelete(nok);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!nokToDelete) return;

    try {
      setLoading(true);

      // Soft delete by updating active status
      const updatedNok: PatNokDetailsDto = {
        ...nokToDelete,
        rActiveYN: "N",
      };

      const result = await PatNokService.saveNokDetails(updatedNok);

      if (result.success) {
        showAlert("Success", "Next of Kin deactivated successfully", "success");
        await loadNextOfKinData();
      } else {
        throw new Error(result.errorMessage || "Failed to deactivate Next of Kin");
      }
    } catch (error) {
      console.error("Error deactivating Next of Kin:", error);
      showAlert("Error", "Failed to deactivate Next of Kin", "error");
    } finally {
      setLoading(false);
      setIsDeleteConfirmOpen(false);
      setNokToDelete(null);
    }
  }, [nokToDelete, showAlert, loadNextOfKinData]);

  // Grid columns definition
  const columns: Column<PatNokDetailsDto>[] = [
    {
      key: "fullName",
      header: "Name",
      visible: true,
      sortable: true,
      render: (item) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {`${item.pNokFName} ${item.pNokMName || ""} ${item.pNokLName}`.trim()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {item.pNokTitle}
          </Typography>
        </Box>
      ),
    },
    {
      key: "pNokRelName",
      header: "Relationship",
      visible: true,
      sortable: true,
      formatter: (value: string) => value || "-",
    },
    {
      key: "pAddPhone1",
      header: "Phone",
      visible: true,
      sortable: true,
      formatter: (value: string) => value || "-",
    },
    {
      key: "pNokDob",
      header: "Date of Birth",
      visible: true,
      sortable: true,
      render: (item) => <Typography variant="body2">{item.pNokDob ? formatDt(item.pNokDob) : "-"}</Typography>,
    },
    {
      key: "rActiveYN",
      header: "Status",
      visible: true,
      sortable: true,
      formatter: (value: string) => <Chip size="small" color={value === "Y" ? "success" : "error"} label={value === "Y" ? "Active" : "Inactive"} />,
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      render: (item) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" color="primary" onClick={() => handleEdit(item)} sx={{ bgcolor: "rgba(211, 47, 47, 0.08)", "&:hover": { bgcolor: "rgba(211, 47, 47, 0.15)" } }}>
            <EditIcon fontSize="small" />
          </IconButton>
          {item.rActiveYN === "Y" && (
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteClick(item)}
              sx={{ bgcolor: "rgba(211, 47, 47, 0.08)", "&:hover": { bgcolor: "rgba(211, 47, 47, 0.15)" } }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <>
      <GenericDialog
        open={open}
        onClose={onClose}
        title={`Next of Kin Management - ${patientName}`}
        fullWidth
        maxWidth="lg"
        showCloseButton
        actions={
          <Box display="flex" justifyContent="space-between" width="100%">
            <SmartButton text="Add Next of Kin" icon={AddIcon} onClick={handleAddNew} variant="contained" color="primary" />
            <SmartButton
              text="Close"
              onClick={onClose}
              variant="outlined"
              color="inherit"
              sx={{ bgcolor: "rgba(211, 47, 47, 0.08)", "&:hover": { bgcolor: "rgba(211, 47, 47, 0.15)" } }}
            />
          </Box>
        }
      >
        <Box sx={{ p: 1 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <NextOfKinIcon />
              Next of Kin Records
            </Typography>

            <CustomGrid
              columns={columns}
              data={nokList}
              maxHeight="400px"
              emptyStateMessage="No Next of Kin records found"
              rowKeyField="pNokID"
              density="medium"
              showDensityControls={false}
            />
          </Paper>
        </Box>
      </GenericDialog>

      {/* Next of Kin Form Dialog */}
      <GenericDialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={`${formMode === "create" ? "Add" : "Edit"} Next of Kin`}
        fullWidth
        maxWidth="md"
        showCloseButton
        actions={
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <SmartButton text="Cancel" onClick={() => setIsFormOpen(false)} variant="outlined" color="inherit" />
            <SmartButton
              text={formMode === "create" ? "Add" : "Update"}
              onClick={handleSubmit(onSubmit)}
              variant="contained"
              color="primary"
              icon={SaveIcon}
              asynchronous={true}
              showLoadingIndicator={true}
              disabled={!isValid}
            />
          </Box>
        }
      >
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 2 }}>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Personal Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Personal Information
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <FormField
                name="pNokTitleVal"
                control={control}
                label="Title"
                type="select"
                required
                size="small"
                options={dropdownValues.title || []}
                onChange={handleTitleChange}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <FormField name="pNokFName" control={control} label="First Name" type="text" required size="small" />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <FormField name="pNokMName" control={control} label="Middle Name" type="text" size="small" />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <FormField name="pNokLName" control={control} label="Last Name" type="text" required size="small" />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <FormField
                name="pNokRelNameVal"
                control={control}
                label="Relationship"
                type="select"
                required
                size="small"
                options={dropdownValues.relation || []}
                onChange={handleRelationChange}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <FormField name="pNokDob" control={control} label="Date of Birth" type="datepicker" required size="small" />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <FormField name="pNokPssnID" control={control} label="ID Number" type="text" size="small" />
            </Grid>

            {/* Contact Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
                Contact Information
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <FormField name="pAddPhone1" control={control} label="Primary Phone" type="tel" required size="small" />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <FormField name="pAddPhone2" control={control} label="Secondary Phone" type="tel" size="small" />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <FormField name="pAddPhone3" control={control} label="Work Phone" type="tel" size="small" />
            </Grid>

            {/* Address Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
                Address Information
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <FormField name="pNokDoorNo" control={control} label="Door No." type="text" size="small" />
            </Grid>

            <Grid size={{ xs: 12, sm: 9 }}>
              <FormField name="pNokStreet" control={control} label="Street" type="text" size="small" />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <FormField name="pNokAreaVal" control={control} label="Area" type="select" size="small" options={dropdownValues.area || []} />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <FormField name="pNokCityVal" control={control} label="City" type="select" size="small" options={dropdownValues.city || []} />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <FormField name="pNokState" control={control} label="State" type="select" size="small" options={dropdownValues.state || []} />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <FormField name="pNokPostcode" control={control} label="Postal Code" type="text" size="small" />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField name="pNokCountryVal" control={control} label="Country" type="select" size="small" options={dropdownValues.country || []} />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField name="rActiveYN" control={control} label="Active Status" type="switch" size="small" />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormField name="rNotes" control={control} label="Notes" type="textarea" size="small" rows={3} placeholder="Additional notes about the next of kin" />
            </Grid>
          </Grid>
        </Box>
      </GenericDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deactivation"
        message={`Are you sure you want to deactivate the Next of Kin record for "${nokToDelete?.pNokFName} ${nokToDelete?.pNokLName}"?`}
        confirmText="Deactivate"
        cancelText="Cancel"
        type="warning"
        maxWidth="sm"
      />
    </>
  );
};

export default NextOfKinManagement;
