// src/pages/common/AlertManagerPage/SubPage/PatientDemographicsForm.tsx
import React, { useEffect, useState } from "react";
import { Box, Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import { PatientDemoGraph } from "@/interfaces/PatientAdministration/patientDemoGraph";
import { PatientDemoGraphService } from "@/services/PatientAdministrationServices/RegistrationService/PatientDemoGraphService";
import { useLoading } from "@/context/LoadingContext";
import { notifyError, notifySuccess } from "@/utils/Common/toastManager";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import CustomButton from "@/components/Button/CustomButton";
import { sanitizeFormData } from "@/utils/Common/sanitizeInput";
import useDropdownValues, { DropdownType } from "@/hooks/PatientAdminstration/useDropdownValues";

interface PatientDemographicsFormProps {
  open: boolean;
  onClose: () => void;
  pChartID: number;
  onSaved: () => void;
}

const PatientDemographicsForm: React.FC<PatientDemographicsFormProps> = ({ open, onClose, pChartID, onSaved }) => {
  const { setLoading } = useLoading();

  // Dropdown lists required for this form
  const requiredDropdowns: DropdownType[] = ["title", "gender", "bloodGroup", "country", "city", "area"];
  const { title, gender, bloodGroup, country, city, area, isLoading: isLoadingDropdowns } = useDropdownValues(requiredDropdowns);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm<PatientDemoGraph>();

  useEffect(() => {
    const fetchPatientDetails = async () => {
      if (!pChartID || !open) return;

      try {
        setLoading(true);

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
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [pChartID, open, reset, setLoading, onClose]);

  const onSubmit = async (data: PatientDemoGraph) => {
    try {
      setLoading(true);
      // Sanitize form data
      const sanitizedData = sanitizeFormData(data);

      const result = await PatientDemoGraphService.savePatientDemographics(sanitizedData);

      if (result.success) {
        notifySuccess("Patient demographics updated successfully");
        onSaved();
        onClose();
      } else {
        notifyError(result.errorMessage || "Failed to update patient demographics");
      }
    } catch (error) {
      console.error("Error saving patient demographics:", error);
      notifyError("An error occurred while saving patient demographics");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      // You could add a confirmation dialog here if needed
      reset();
    }
    onClose();
  };

  // Define dialog actions
  const dialogActions = (
    <>
      <CustomButton variant="outlined" text="Cancel" onClick={handleCancel} color="inherit" size="medium" />
      <CustomButton variant="contained" text="Save Changes" onClick={handleSubmit(onSubmit)} color="primary" size="medium" disabled={!isDirty || !isValid} />
    </>
  );

  return (
    <GenericDialog
      open={open}
      onClose={handleCancel}
      title="Edit Patient Demographics"
      maxWidth="md"
      fullWidth
      showCloseButton
      actions={dialogActions}
      disableBackdropClick={isDirty}
      titleSx={{ bgcolor: "primary.main", color: "white" }}
    >
      <Box component="form" sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {/* Patient ID (Read-only) */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="pChartCode" control={control} label="UHID" type="text" required disabled size="small" />
          </Grid>

          {/* Title */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="pTitle" control={control} label="Title" type="select" options={title || []} required size="small" />
          </Grid>

          {/* First Name */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="pfName" control={control} label="First Name" type="text" required size="small" />
          </Grid>

          {/* Last Name */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="plName" control={control} label="Last Name" type="text" required size="small" />
          </Grid>

          {/* Date of Birth */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="dob" control={control} label="Date of Birth" type="datepicker" required size="small" />
          </Grid>

          {/* Gender */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="pGender" control={control} label="Gender" type="select" options={gender || []} required size="small" />
          </Grid>

          {/* Blood Group */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="pBldGrp" control={control} label="Blood Group" type="select" options={bloodGroup || []} size="small" />
          </Grid>

          {/* Phone Number */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="pAddPhone1" control={control} label="Phone Number" type="text" required size="small" />
          </Grid>

          {/* Email */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="pAddEmail" control={control} label="Email" type="text" size="small" />
          </Grid>

          {/* Street Address */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="pAddStreet" control={control} label="Street Address" type="text" size="small" />
          </Grid>

          {/* Area */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="patArea" control={control} label="Area" type="select" options={area || []} size="small" />
          </Grid>

          {/* City */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="pAddCity" control={control} label="City" type="select" options={city || []} size="small" />
          </Grid>

          {/* Country */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="pAddActualCountry" control={control} label="Country" type="select" options={country || []} size="small" />
          </Grid>

          {/* ID Document Type */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="indentityType" control={control} label="ID Document Type" type="text" size="small" />
          </Grid>

          {/* ID Document Number */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="indentityValue" control={control} label="ID Document Number" type="text" size="small" />
          </Grid>
        </Grid>
      </Box>
    </GenericDialog>
  );
};

export default PatientDemographicsForm;
