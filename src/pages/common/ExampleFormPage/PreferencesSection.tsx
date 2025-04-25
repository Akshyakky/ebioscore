// PreferencesSection.tsx
import React from "react";
import { Box } from "@mui/material";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { notificationOptions } from "./formOptions";
import { FormSectionProps } from "./type";

const PreferencesSection: React.FC<FormSectionProps> = ({ control }) => {
  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 2 }}>
        <FormField name="notificationPreferences" control={control} label="Notification Preferences" type="checkbox" options={notificationOptions} row size="small" fullWidth />
      </Box>

      <Box sx={{ mb: 2 }}>
        <FormField name="termsAgreed" control={control} label="I agree to the terms, conditions, and privacy policy" type="checkbox" required size="small" fullWidth />
      </Box>
    </Box>
  );
};

export default PreferencesSection;
