// EmploymentInfoSection.tsx
import React from "react";
import { Box, Stack } from "@mui/material";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { departmentOptions, positionOptions, roleOptions, skillOptions } from "./formOptions";
import { FormSectionProps } from "./type";

const EmploymentInfoSection: React.FC<FormSectionProps> = ({ control }) => {
  return (
    <Box sx={{ width: "100%" }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2, flexWrap: "wrap" }}>
        <Box sx={{ width: { xs: "100%", md: "48%" } }}>
          <FormField name="employeeId" control={control} label="Employee ID" type="text" helperText="Leave blank to auto-generate" size="small" fullWidth />
        </Box>
        <Box sx={{ width: { xs: "100%", md: "48%" } }}>
          <FormField name="department" control={control} label="Department" type="select" options={departmentOptions} required size="small" fullWidth />
        </Box>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2, flexWrap: "wrap" }}>
        <Box sx={{ width: { xs: "100%", md: "48%" } }}>
          <FormField name="position" control={control} label="Position" type="select" options={positionOptions} required size="small" fullWidth />
        </Box>
        <Box sx={{ width: { xs: "100%", md: "48%" } }}>
          <FormField
            name="roles"
            control={control}
            label="System Roles"
            type="multiselect"
            options={roleOptions}
            required
            helperText="Select at least one role"
            size="small"
            fullWidth
          />
        </Box>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2, flexWrap: "wrap" }}>
        <Box sx={{ width: { xs: "100%", md: "48%" } }}>
          <FormField name="skills" control={control} label="Skills" type="multiselect" options={skillOptions} size="small" fullWidth />
        </Box>
        <Box sx={{ width: { xs: "100%", md: "48%" } }}>
          <FormField
            name="bio"
            control={control}
            label="Professional Bio"
            type="textarea"
            rows={3}
            helperText="Brief professional summary (max 500 characters)"
            size="small"
            fullWidth
          />
        </Box>
      </Stack>
    </Box>
  );
};

export default EmploymentInfoSection;
