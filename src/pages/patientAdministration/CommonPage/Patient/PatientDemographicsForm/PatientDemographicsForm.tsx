// src/components/Patient/PatientDemographicsForm/PatientDemographicsForm.tsx
import React, { useEffect, useState, useCallback } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { PatientDemoGraphService } from "@/services/PatientAdministrationServices/RegistrationService/PatientDemoGraphService";
import { notifyError, notifySuccess } from "@/utils/Common/toastManager";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import CustomButton from "@/components/Button/CustomButton";
import { sanitizeFormData } from "@/utils/Common/sanitizeInput";
import useDropdownValues, { DropdownType } from "@/hooks/PatientAdminstration/useDropdownValues";
import { PatientDemographicsFormProps } from "./PatientDemographicsFormProps";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import { PatientDemoGraph } from "@/interfaces/PatientAdministration/patientDemoGraph";
import GenericDialog from "@/components/GenericDialog/GenericDialog";

/**
 * Reusable patient demographics form component
 */
export const PatientDemographicsForm: React.FC<PatientDemographicsFormProps> = ({
  open,
  onClose,
  pChartID,
  onSaved,
  initialData,
  title = "Edit Patient Demographics",
  isLoading: externalLoading,
  confirmUnsavedChanges = true,
  displayFields,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

  // Determine actual loading state - either controlled externally or internally
  const loading = externalLoading !== undefined ? externalLoading : isLoading;

  // Dropdown lists required for this form
  const requiredDropdowns: DropdownType[] = ["title", "gender", "bloodGroup", "country", "city", "area", "payment"];
  const { title: titleOptions, gender, bloodGroup, country, city, area, payment: paymentSourceOptions, isLoading: isLoadingDropdowns } = useDropdownValues(requiredDropdowns);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty, isValid },
  } = useForm<PatientDemoGraph>();

  const updateDropdownValues = (fieldName: string, fieldValueName: string, selectedValue: any, options: any[] | undefined) => {
    if (!options) return;

    const selectedOption = options.find((option) => option.value === selectedValue || option.label === selectedValue);

    if (selectedOption) {
      setValue(fieldName as any, selectedOption.label);
      setValue(fieldValueName as any, selectedOption.value);
    }
  };

  // Function to fetch patient data
  const fetchPatientDetails = useCallback(async () => {
    if (!pChartID || !open) return;

    try {
      setIsLoading(true);

      const result = await PatientDemoGraphService.getPatientDemographicsByPChartID(pChartID);

      if (result.success && result.data) {
        reset(result.data);
      } else {
        notifyError(result.errorMessage || "Failed to fetch patient demographics for editing");
        onClose();
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
      notifyError("An error occurred while fetching patient details");
      onClose();
    } finally {
      setIsLoading(false);
    }
  }, [pChartID, open, reset, onClose]);

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      fetchPatientDetails();
    }
  }, [pChartID, open, initialData, reset, fetchPatientDetails]);

  // Form submission handler
  const onSubmit = async (data: PatientDemoGraph) => {
    try {
      setIsLoading(true);
      // Sanitize form data
      const sanitizedData = sanitizeFormData(data);

      const result = await PatientDemoGraphService.savePatientDemographics(sanitizedData);

      if (result.success) {
        notifySuccess("Patient demographics updated successfully");
        if (onSaved) {
          onSaved(sanitizedData);
        }
        onClose();
      } else {
        notifyError(result.errorMessage || "Failed to update patient demographics");
      }
    } catch (error) {
      console.error("Error saving patient demographics:", error);
      notifyError("An error occurred while saving patient demographics");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle dialog close with confirmation if there are unsaved changes
  const handleDialogClose = () => {
    if (isDirty && confirmUnsavedChanges) {
      setShowConfirmDialog(true);
    } else {
      onClose();
    }
  };

  // Define which fields to show based on displayFields prop
  const shouldShowField = (fieldName: keyof PatientDemoGraph): boolean => {
    if (!displayFields) return true;
    return displayFields.includes(fieldName);
  };

  // Dialog actions
  const dialogActions = (
    <>
      <CustomButton variant="outlined" text="Cancel" onClick={handleDialogClose} color="inherit" size="medium" disabled={loading} />
      <CustomButton variant="contained" text="Save Changes" onClick={handleSubmit(onSubmit)} color="primary" size="medium" disabled={!isDirty || !isValid || loading} />
    </>
  );

  // Form content that will be passed as children to GenericDialog
  const formContent = (
    <Box component="form" sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        {/* Patient ID (Read-only) */}
        {shouldShowField("pChartCode") && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="pChartCode" control={control} label="UHID" type="text" required disabled size="small" />
          </Grid>
        )}

        {/* Title */}
        {shouldShowField("pTitle") && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              name="pTitle"
              control={control}
              label="Title"
              type="select"
              options={titleOptions || []}
              required
              size="small"
              onChange={(selectedValue) => {
                updateDropdownValues("pTitle", "pTitleVal", selectedValue, titleOptions);
              }}
            />
          </Grid>
        )}

        {/* First Name */}
        {shouldShowField("pfName") && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="pfName" control={control} label="First Name" type="text" required size="small" />
          </Grid>
        )}

        {/* Last Name */}
        {shouldShowField("plName") && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="plName" control={control} label="Last Name" type="text" required size="small" />
          </Grid>
        )}

        {/* Date of Birth */}
        {shouldShowField("dob") && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="dob" control={control} label="Date of Birth" type="datepicker" required size="small" />
          </Grid>
        )}

        {/* Gender */}
        {shouldShowField("pGender") && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              name="pGender"
              control={control}
              label="Gender"
              type="select"
              options={gender || []}
              required
              size="small"
              onChange={(selectedValue) => {
                updateDropdownValues("pGender", "pGenderVal", selectedValue, gender);
              }}
            />
          </Grid>
        )}

        {/* Patient Type / Payment Source */}
        {shouldShowField("pTypeName") && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              name="pTypeName"
              control={control}
              label="Payment Source"
              type="select"
              options={paymentSourceOptions || []}
              required
              size="small"
              onChange={(selectedValue) => {
                const selectedOption = paymentSourceOptions?.find((option) => option.value === selectedValue || option.label === selectedValue);

                if (selectedOption) {
                  setValue("pTypeID", Number(selectedOption.value));
                  setValue("pTypeName", selectedOption.label);
                }
              }}
            />
          </Grid>
        )}

        {/* Blood Group */}
        {shouldShowField("pBldGrp") && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="pBldGrp" control={control} label="Blood Group" type="select" options={bloodGroup || []} size="small" />
          </Grid>
        )}

        {/* Phone Number */}
        {shouldShowField("pAddPhone1") && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="pAddPhone1" control={control} label="Phone Number" type="text" required size="small" />
          </Grid>
        )}

        {/* Email */}
        {shouldShowField("pAddEmail") && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="pAddEmail" control={control} label="Email" type="text" size="small" />
          </Grid>
        )}

        {/* Street Address */}
        {shouldShowField("pAddStreet") && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="pAddStreet" control={control} label="Street Address" type="text" size="small" />
          </Grid>
        )}

        {/* Area */}
        {shouldShowField("patArea") && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="patArea" control={control} label="Area" type="select" options={area || []} size="small" />
          </Grid>
        )}

        {/* City */}
        {shouldShowField("pAddCity") && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="pAddCity" control={control} label="City" type="select" options={city || []} size="small" />
          </Grid>
        )}

        {/* Country */}
        {shouldShowField("pAddActualCountry") && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="pAddActualCountry" control={control} label="Country" type="select" options={country || []} size="small" />
          </Grid>
        )}

        {/* ID Document Type */}
        {shouldShowField("indentityType") && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="indentityType" control={control} label="ID Document Type" type="text" size="small" />
          </Grid>
        )}

        {/* ID Document Number */}
        {shouldShowField("indentityValue") && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="indentityValue" control={control} label="ID Document Number" type="text" size="small" />
          </Grid>
        )}
      </Grid>
    </Box>
  );

  return (
    <>
      <GenericDialog
        open={open}
        onClose={handleDialogClose}
        title={title}
        maxWidth="md"
        fullWidth={true}
        showCloseButton={true}
        actions={dialogActions}
        disableBackdropClick={true}
        disableEscapeKeyDown={true}
        dialogContentSx={{
          minHeight: "500px",
          maxHeight: "70vh",
          overflowY: "auto",
        }}
        titleSx={{ bgcolor: "primary.main", color: "white", py: 1.5 }}
        actionsSx={{ px: 3, py: 2 }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <Typography>Loading...</Typography>
          </Box>
        ) : (
          formContent
        )}
      </GenericDialog>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={() => {
          setShowConfirmDialog(false);
          onClose();
        }}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to close without saving?"
        type="warning"
      />
    </>
  );
};
