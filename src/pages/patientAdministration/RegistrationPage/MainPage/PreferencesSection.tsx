import React from "react";
import { Grid } from "@mui/material";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { notificationOptions } from "./formOptions";
import { FormSectionProps } from "./type";

const PreferencesSection: React.FC<FormSectionProps> = ({ control }) => {
  return (
    <>
      <Grid item xs={12}>
        <FormField name="notificationPreferences" control={control} label="Notification Preferences" type="checkbox" options={notificationOptions} row size="small" />
      </Grid>

      <Grid item xs={12}>
        <FormField name="termsAgreed" control={control} label="I agree to the terms, conditions, and privacy policy" type="checkbox" required size="small" />
      </Grid>
    </>
  );
};

export default PreferencesSection;
