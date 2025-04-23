// AdditionalInfoSection.tsx
import React from "react";
import { Box, Stack } from "@mui/material";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { FormSectionProps } from "./type";

const AdditionalInfoSection: React.FC<FormSectionProps> = ({ control }) => {
  return (
    <Box sx={{ width: "100%" }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2, flexWrap: "wrap" }}>
        <Box sx={{ width: { xs: "100%", md: "48%" } }}>
          <FormField name="joinDate" control={control} label="Join Date" type="datepicker" required size="small" fullWidth />
        </Box>
        <Box sx={{ width: { xs: "100%", md: "48%" } }}>
          <FormField name="contractEndDate" control={control} label="Contract End Date (if applicable)" type="datepicker" size="small" fullWidth />
        </Box>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2, flexWrap: "wrap" }}>
        <Box sx={{ width: { xs: "100%", md: "48%" } }}>
          <FormField
            name="salary"
            control={control}
            label="Annual Salary"
            type="number"
            adornment="$"
            adornmentPosition="start"
            inputProps={{ min: 0, step: 1000 }}
            size="small"
            fullWidth
          />
        </Box>
        <Box sx={{ width: { xs: "100%", md: "48%" } }}>
          <FormField
            name="profileImage"
            control={control}
            label="Profile Image"
            type="file"
            accept="image/*"
            maxSize={5242880} // 5MB
            helperText="Upload a profile picture (max 5MB)"
            size="small"
            fullWidth
          />
        </Box>
      </Stack>
    </Box>
  );
};

export default AdditionalInfoSection;
