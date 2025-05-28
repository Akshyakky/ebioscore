// src/pages/patientAdministration/RegistrationPage/Components/PatientInsuranceManagement.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Box, Typography, Paper, Grid, Stack, Chip, Alert, IconButton } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Save as SaveIcon, Cancel as CancelIcon, AccountBalance as InsuranceIcon } from "@mui/icons-material";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import SmartButton from "@/components/Button/SmartButton";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import { useAlert } from "@/providers/AlertProvider";
import { useLoading } from "@/hooks/Common/useLoading";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { InsuranceCarrierService } from "@/services/CommonServices/InsuranceCarrierService";
import { OPIPInsurancesDto } from "@/interfaces/PatientAdministration/InsuranceDetails";
import { formatDt } from "@/utils/Common/dateUtils";
import { useServerDate } from "@/hooks/Common/useServerDate";

// Validation schema for Patient Insurance form
const patientInsuranceSchema = z.object({
  oPIPInsID: z.number().default(0),
  pChartID: z.number().min(1, "Patient Chart ID is required"),
  insurID: z.number().min(1, "Insurance carrier is required"),
  insurCode: z.string().optional().default(""),
  insurName: z.string().default(""),
  policyNumber: z.string().min(1, "Policy number is required"),
  policyHolder: z.string().min(1, "Policy holder name is required"),
  groupNumber: z.string().optional().default(""),
  policyStartDt: z.date().default(new Date()),
  policyEndDt: z.date().default(new Date()),
  guarantor: z.string().optional().default(""),
  relationVal: z.string().min(1, "Relationship to insured is required"),
  relation: z.string().default(""),
  address1: z.string().optional().default(""),
  address2: z.string().optional().default(""),
  phone1: z.string().optional().default(""),
  phone2: z.string().optional().default(""),
  rActiveYN: z.enum(["Y", "N"]).default("Y"),
  rNotes: z.string().optional().default(""),
  insurStatusCode: z.string().optional().default(""),
  insurStatusName: z.string().optional().default(""),
  pChartCode: z.string().optional().default(""),
  pChartCompID: z.number().optional().default(0),
  referenceNo: z.string().optional().default(""),
  transferYN: z.enum(["Y", "N"]).default("N"),
  coveredVal: z.string().optional().default(""),
  coveredFor: z.string().optional().default(""),
});

type PatientInsuranceFormData = z.infer<typeof patientInsuranceSchema>;

interface PatientInsuranceManagementProps {
  pChartID: number;
  patientName: string;
  open: boolean;
  onClose: () => void;
}

const PatientInsuranceManagement: React.FC<PatientInsuranceManagementProps> = ({ pChartID, patientName, open, onClose }) => {
  const [insuranceList, setInsuranceList] = useState<OPIPInsurancesDto[]>([]);
  const [selectedInsurance, setSelectedInsurance] = useState<OPIPInsurancesDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [insuranceToDelete, setInsuranceToDelete] = useState<OPIPInsurancesDto | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { showAlert } = useAlert();
  const { setLoading } = useLoading();
  const serverDate = useServerDate();

  // Load dropdown values
  const dropdownValues = useDropdownValues(["insurance", "relation", "coverFor"]);

  // Form setup
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm<PatientInsuranceFormData>({
    resolver: zodResolver(patientInsuranceSchema),
    mode: "onChange",
    defaultValues: {
      oPIPInsID: 0,
      pChartID,
      insurID: 0,
      insurCode: "",
      insurName: "",
      policyNumber: "",
      policyHolder: "",
      groupNumber: "",
      policyStartDt: serverDate,
      policyEndDt: new Date(serverDate.getTime() + 365 * 24 * 60 * 60 * 1000), // One year from now
      guarantor: "",
      relationVal: "",
      relation: "",
      address1: "",
      address2: "",
      phone1: "",
      phone2: "",
      rActiveYN: "Y",
      rNotes: "",
      insurStatusCode: "",
      insurStatusName: "",
      pChartCode: "",
      pChartCompID: 0,
      referenceNo: "",
      transferYN: "N",
      coveredVal: "",
      coveredFor: "",
    },
  });

  const watchedPolicyStartDate = watch("policyStartDt");

  // Load patient insurance data
  const loadInsuranceData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await InsuranceCarrierService.getOPIPInsuranceByPChartID(pChartID);

      if (result.success && result.data) {
        setInsuranceList(result.data);
      } else {
        setInsuranceList([]);
        if (result.errorMessage) {
          console.error("Error loading insurance data:", result.errorMessage);
        }
      }
    } catch (error) {
      console.error("Error loading insurance data:", error);
      showAlert("Error", "Failed to load insurance information", "error");
      setInsuranceList([]);
    } finally {
      setLoading(false);
    }
  }, [pChartID, showAlert]);

  // Load data when component opens
  useEffect(() => {
    if (open && pChartID) {
      loadInsuranceData();
    }
  }, [open, pChartID, loadInsuranceData]);

  // Auto-adjust policy end date when start date changes
  useEffect(() => {
    if (watchedPolicyStartDate) {
      const endDate = new Date(watchedPolicyStartDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
      setValue("policyEndDt", endDate, { shouldDirty: false });
    }
  }, [watchedPolicyStartDate, setValue]);

  // Handle form submission
  const onSubmit = async (data: PatientInsuranceFormData) => {
    setFormError(null);

    try {
      setLoading(true);

      const insuranceData: OPIPInsurancesDto = {
        oPIPInsID: data.oPIPInsID || 0,
        pChartID: data.pChartID,
        insurID: data.insurID,
        insurName: data.insurName,
        relationVal: data.relationVal,
        rActiveYN: data.rActiveYN,
        policyStartDt: data.policyStartDt || serverDate,
        policyEndDt: data.policyEndDt || new Date(serverDate.getTime() + 365 * 24 * 60 * 60 * 1000),
        ...data,
      };

      const result = await InsuranceCarrierService.addOrUpdateOPIPInsurance(insuranceData);

      if (result.success) {
        showAlert("Success", `Insurance ${formMode === "create" ? "added" : "updated"} successfully`, "success");
        setIsFormOpen(false);
        reset();
        await loadInsuranceData();
      } else {
        throw new Error(result.errorMessage || "Failed to save insurance details");
      }
    } catch (error) {
      console.error("Error saving insurance:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save insurance details";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle dropdown changes
  const handleInsuranceChange = useCallback(
    (event: any) => {
      const value = event?.target?.value || event?.value || event;
      const selectedOption = dropdownValues.insurance?.find((option) => Number(option.value) === Number(value));
      if (selectedOption) {
        setValue("insurID", Number(value), { shouldValidate: true, shouldDirty: true });
        setValue("insurName", selectedOption.label, { shouldValidate: true, shouldDirty: true });
        setValue("insurCode", selectedOption.value?.toString() || "", { shouldDirty: true });
      }
    },
    [dropdownValues.insurance, setValue]
  );

  const handleRelationChange = useCallback(
    (event: any) => {
      const value = event?.target?.value || event?.value || event;
      const selectedOption = dropdownValues.relation?.find((option) => option.value === value);
      if (selectedOption) {
        setValue("relationVal", value, { shouldValidate: true, shouldDirty: true });
        setValue("relation", selectedOption.label, { shouldValidate: true, shouldDirty: true });
      }
    },
    [dropdownValues.relation, setValue]
  );

  const handleCoverForChange = useCallback(
    (event: any) => {
      const value = event?.target?.value || event?.value || event;
      const selectedOption = dropdownValues.coverFor?.find((option) => option.value === value);
      if (selectedOption) {
        setValue("coveredVal", value, { shouldValidate: true, shouldDirty: true });
        setValue("coveredFor", selectedOption.label, { shouldValidate: true, shouldDirty: true });
      }
    },
    [dropdownValues.coverFor, setValue]
  );

  // Action handlers
  const handleAddNew = useCallback(() => {
    setSelectedInsurance(null);
    setFormMode("create");
    reset({
      oPIPInsID: 0,
      pChartID,
      policyStartDt: serverDate,
      policyEndDt: new Date(serverDate.getTime() + 365 * 24 * 60 * 60 * 1000),
      rActiveYN: "Y",
      transferYN: "N",
    });
    setIsFormOpen(true);
  }, [reset, pChartID, serverDate]);

  const handleEdit = useCallback(
    (insurance: OPIPInsurancesDto) => {
      setSelectedInsurance(insurance);
      setFormMode("edit");

      // Populate form with existing data
      reset({
        ...insurance,
        policyStartDt: insurance.policyStartDt ? new Date(insurance.policyStartDt) : serverDate,
        policyEndDt: insurance.policyEndDt ? new Date(insurance.policyEndDt) : new Date(serverDate.getTime() + 365 * 24 * 60 * 60 * 1000),
        rActiveYN: insurance.rActiveYN as "Y" | "N",
        transferYN: insurance.transferYN as "Y" | "N",
      });
      setIsFormOpen(true);
    },
    [reset, serverDate]
  );

  const handleDeleteClick = useCallback((insurance: OPIPInsurancesDto) => {
    setInsuranceToDelete(insurance);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!insuranceToDelete) return;

    try {
      setLoading(true);

      const result = await InsuranceCarrierService.hideOPIPInsurance(insuranceToDelete.oPIPInsID);

      if (result.success) {
        showAlert("Success", "Insurance deactivated successfully", "success");
        await loadInsuranceData();
      } else {
        throw new Error(result.errorMessage || "Failed to deactivate insurance");
      }
    } catch (error) {
      console.error("Error deactivating insurance:", error);
      showAlert("Error", "Failed to deactivate insurance", "error");
    } finally {
      setLoading(false);
      setIsDeleteConfirmOpen(false);
      setInsuranceToDelete(null);
    }
  }, [insuranceToDelete, showAlert, loadInsuranceData]);

  // Check if policy is expired
  const isPolicyExpired = useCallback((endDate: Date) => {
    return new Date() > new Date(endDate);
  }, []);

  // Grid columns definition
  const columns: Column<OPIPInsurancesDto>[] = [
    {
      key: "insurName",
      header: "Insurance Carrier",
      visible: true,
      sortable: true,
      render: (item) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {item.insurName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {item.insurCode}
          </Typography>
        </Box>
      ),
    },
    {
      key: "policyNumber",
      header: "Policy Number",
      visible: true,
      sortable: true,
      formatter: (value: string) => value || "-",
    },
    {
      key: "policyHolder",
      header: "Policy Holder",
      visible: true,
      sortable: true,
      formatter: (value: string) => value || "-",
    },
    {
      key: "relation",
      header: "Relationship",
      visible: true,
      sortable: true,
      formatter: (value: string) => value || "-",
    },
    {
      key: "policyPeriod",
      header: "Policy Period",
      visible: true,
      sortable: true,
      render: (item) => (
        <Box>
          <Typography variant="body2">
            {item.policyStartDt ? formatDt(item.policyStartDt) : "-"} to {item.policyEndDt ? formatDt(item.policyEndDt) : "-"}
          </Typography>
          {item.policyEndDt && isPolicyExpired(item.policyEndDt) && <Chip size="small" color="error" label="Expired" />}
        </Box>
      ),
    },
    {
      key: "groupNumber",
      header: "Group Number",
      visible: true,
      sortable: true,
      formatter: (value: string) => value || "-",
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
        title={`Insurance Management - ${patientName}`}
        fullWidth
        maxWidth="lg"
        showCloseButton
        actions={
          <Box display="flex" justifyContent="space-between" width="100%">
            <SmartButton text="Add Insurance" icon={AddIcon} onClick={handleAddNew} variant="contained" color="primary" />
            <SmartButton text="Close" onClick={onClose} variant="outlined" color="inherit" />
          </Box>
        }
      >
        <Box sx={{ p: 1 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <InsuranceIcon />
              Insurance Records
            </Typography>

            <CustomGrid
              columns={columns}
              data={insuranceList}
              maxHeight="400px"
              emptyStateMessage="No insurance records found"
              rowKeyField="oPIPInsID"
              density="medium"
              showDensityControls={false}
            />
          </Paper>
        </Box>
      </GenericDialog>

      {/* Insurance Form Dialog */}
      <GenericDialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={`${formMode === "create" ? "Add" : "Edit"} Insurance`}
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
            {/* Insurance Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Insurance Information
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField
                name="insurID"
                control={control}
                label="Insurance Carrier"
                type="select"
                required
                size="small"
                options={dropdownValues.insurance || []}
                onChange={handleInsuranceChange}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField name="policyNumber" control={control} label="Policy Number" type="text" required size="small" />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField name="policyHolder" control={control} label="Policy Holder" type="text" required size="small" />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField name="groupNumber" control={control} label="Group Number" type="text" size="small" />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <FormField name="policyStartDt" control={control} label="Policy Start Date" type="datepicker" required size="small" />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <FormField name="policyEndDt" control={control} label="Policy End Date" type="datepicker" required size="small" />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <FormField
                name="relationVal"
                control={control}
                label="Relationship to Insured"
                type="select"
                required
                size="small"
                options={dropdownValues.relation || []}
                onChange={handleRelationChange}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField name="guarantor" control={control} label="Guarantor" type="text" size="small" />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField name="referenceNo" control={control} label="Reference Number" type="text" size="small" />
            </Grid>

            {/* Coverage Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
                Coverage Information
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField
                name="coveredVal"
                control={control}
                label="Covered For"
                type="select"
                size="small"
                options={dropdownValues.coverFor || []}
                onChange={handleCoverForChange}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField name="rActiveYN" control={control} label="Active Status" type="switch" size="small" />
            </Grid>

            {/* Contact Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
                Contact Information
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField name="phone1" control={control} label="Primary Phone" type="tel" size="small" />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField name="phone2" control={control} label="Secondary Phone" type="tel" size="small" />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField name="address1" control={control} label="Address Line 1" type="text" size="small" />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField name="address2" control={control} label="Address Line 2" type="text" size="small" />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormField name="rNotes" control={control} label="Notes" type="textarea" size="small" rows={3} placeholder="Additional notes about the insurance coverage" />
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
        message={`Are you sure you want to deactivate the insurance record for "${insuranceToDelete?.insurName}" with policy number "${insuranceToDelete?.policyNumber}"?`}
        confirmText="Deactivate"
        cancelText="Cancel"
        type="warning"
        maxWidth="sm"
      />
    </>
  );
};

export default PatientInsuranceManagement;
