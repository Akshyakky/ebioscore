import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Grid, Box } from "@mui/material";
import { Save as SaveIcon, Close as CloseIcon } from "@mui/icons-material";
import { PatNokDetailsDto } from "@/interfaces/PatientAdministration/PatNokDetailsDto";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import CustomButton from "@/components/Button/CustomButton";
import { useServerDate } from "@/hooks/Common/useServerDate";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { useLoading } from "@/context/LoadingContext";
import SmartButton from "@/components/Button/SmartButton";

interface NextOfKinFormProps {
  onSave: (data: PatNokDetailsDto) => Promise<void>;
  onCancel: () => void;
  initialData?: PatNokDetailsDto | null;
  pChartID: number;
  pChartCode: string;
}

const NextOfKinForm: React.FC<NextOfKinFormProps> = ({ onSave, onCancel, initialData, pChartID, pChartCode }) => {
  const { setLoading } = useLoading();
  const serverDate = useServerDate();
  const isEditMode = !!initialData?.pNokID;
  const { ...dropdownValues } = useDropdownValues(["title", "relation", "country", "city", "area"]);

  const defaultValues: PatNokDetailsDto = {
    ID: 0,
    pNokID: 0,
    pChartID: pChartID,
    pNokPChartCode: pChartCode,
    pNokPChartID: 0,
    pNokRegStatusVal: "",
    pNokRegStatus: "",
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
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitted },
  } = useForm<PatNokDetailsDto>({
    defaultValues: initialData || defaultValues,
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset(defaultValues);
    }
  }, [initialData, reset]);

  const onSubmit = async (data: PatNokDetailsDto) => {
    try {
      setLoading(true);
      await onSave(data);
    } finally {
      setLoading(false);
    }
  };

  const registrationStatusOptions = [
    { value: "Y", label: "Registered" },
    { value: "N", label: "Non Registered" },
  ];

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        {/* Personal Information */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ fontWeight: "bold", mb: 1 }}>Personal Information</Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="pNokTitleVal"
            control={control}
            rules={{ required: "Title is required" }}
            render={({ field }) => (
              <EnhancedFormField
                {...field}
                control={control}
                type="select"
                label="Title"
                required
                options={dropdownValues.title || []}
                fullWidth
                helperText={errors.pNokTitleVal?.message}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="pNokFName"
            control={control}
            rules={{ required: "First name is required" }}
            render={({ field }) => <EnhancedFormField {...field} control={control} type="text" label="First Name" required fullWidth helperText={errors.pNokFName?.message} />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Controller name="pNokMName" control={control} render={({ field }) => <EnhancedFormField {...field} control={control} type="text" label="Middle Name" fullWidth />} />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="pNokLName"
            control={control}
            rules={{ required: "Last name is required" }}
            render={({ field }) => <EnhancedFormField {...field} control={control} type="text" label="Last Name" required fullWidth helperText={errors.pNokLName?.message} />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="pNokDob"
            control={control}
            render={({ field }) => <EnhancedFormField {...field} control={control} type="datepicker" label="Date of Birth" fullWidth />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="pNokRelNameVal"
            control={control}
            rules={{ required: "Relationship is required" }}
            render={({ field }) => (
              <EnhancedFormField
                {...field}
                control={control}
                type="select"
                label="Relationship"
                required
                options={dropdownValues.relation || []}
                fullWidth
                helperText={errors.pNokRelNameVal?.message}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="pNokRegStatusVal"
            control={control}
            render={({ field }) => <EnhancedFormField {...field} control={control} type="radio" label="Registration Type" options={registrationStatusOptions} row />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="pNokPssnID"
            control={control}
            render={({ field }) => <EnhancedFormField {...field} control={control} type="text" label="ID/Passport No." fullWidth />}
          />
        </Grid>

        {/* Contact Information */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ fontWeight: "bold", mb: 1, mt: 2 }}>Contact Information</Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="pAddPhone1"
            control={control}
            rules={{ required: "Phone number is required" }}
            render={({ field }) => <EnhancedFormField {...field} control={control} type="tel" label="Phone Number" required fullWidth helperText={errors.pAddPhone1?.message} />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="pAddPhone2"
            control={control}
            render={({ field }) => <EnhancedFormField {...field} control={control} type="tel" label="Alternative Phone" fullWidth />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Controller name="pAddPhone3" control={control} render={({ field }) => <EnhancedFormField {...field} control={control} type="tel" label="Emergency Phone" fullWidth />} />
        </Grid>

        {/* Address Information */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ fontWeight: "bold", mb: 1, mt: 2 }}>Address Information</Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Controller name="pNokDoorNo" control={control} render={({ field }) => <EnhancedFormField {...field} control={control} type="text" label="Door No." fullWidth />} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Controller name="pNokStreet" control={control} render={({ field }) => <EnhancedFormField {...field} control={control} type="text" label="Street" fullWidth />} />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="pNokAreaVal"
            control={control}
            render={({ field }) => <EnhancedFormField {...field} control={control} type="select" label="Area" options={dropdownValues.area || []} fullWidth />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="pNokCityVal"
            control={control}
            render={({ field }) => <EnhancedFormField {...field} control={control} type="select" label="City" options={dropdownValues.city || []} fullWidth />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Controller name="pNokState" control={control} render={({ field }) => <EnhancedFormField {...field} control={control} type="text" label="State" fullWidth />} />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Controller name="pNokPostcode" control={control} render={({ field }) => <EnhancedFormField {...field} control={control} type="text" label="Postal Code" fullWidth />} />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="pNokCountryVal"
            control={control}
            render={({ field }) => <EnhancedFormField {...field} control={control} type="select" label="Country" options={dropdownValues.country || []} fullWidth />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Controller name="rNotes" control={control} render={({ field }) => <EnhancedFormField {...field} control={control} type="textarea" label="Notes" fullWidth rows={3} />} />
        </Grid>

        {/* Form Actions */}
        <Grid size={{ xs: 12 }}>
          <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
            <CustomButton variant="outlined" text="Cancel" icon={CloseIcon} onClick={onCancel} color="error" />
            <SmartButton variant="contained" text={isEditMode ? "Update" : "Save"} icon={SaveIcon} color="primary" loadingText="Saving..." successText="Saved!" />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NextOfKinForm;
