import React from "react";
import { Grid } from "@mui/material";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { FormSectionProps } from "./type";

const AdditionalInfoSection: React.FC<FormSectionProps> = ({ control }) => {
  return (
    <>
      <Grid item xs={12} md={6}>
        <FormField name="joinDate" control={control} label="Join Date" type="datepicker" required size="small" />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormField name="contractEndDate" control={control} label="Contract End Date (if applicable)" type="datepicker" size="small" />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormField name="salary" control={control} label="Annual Salary" type="number" adornment="$" adornmentPosition="start" inputProps={{ min: 0, step: 1000 }} size="small" />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormField
          name="profileImage"
          control={control}
          label="Profile Image"
          type="file"
          accept="image/*"
          maxSize={5242880} // 5MB
          helperText="Upload a profile picture (max 5MB)"
          size="small"
        />
      </Grid>
    </>
  );
};

export default AdditionalInfoSection;
