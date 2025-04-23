import React from "react";
import { Box, Stack } from "@mui/material";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { genderOptions } from "./formOptions";
import { FormSectionProps } from "./type";

const PersonalInfoSection: React.FC<FormSectionProps> = ({ control }) => {
  return (
    <Box sx={{ width: "100%" }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2, flexWrap: "wrap" }}>
        <Box sx={{ width: { xs: "100%", md: "48%" } }}>
          <FormField name="firstName" control={control} label="First Name" type="text" required size="small" fullWidth />
        </Box>
        <Box sx={{ width: { xs: "100%", md: "48%" } }}>
          <FormField name="lastName" control={control} label="Last Name" type="text" required size="small" fullWidth />
        </Box>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2, flexWrap: "wrap" }}>
        <Box sx={{ width: { xs: "100%", md: "48%" } }}>
          <FormField name="email" control={control} label="Email" type="email" required size="small" fullWidth />
        </Box>
        <Box sx={{ width: { xs: "100%", md: "48%" } }}>
          <FormField name="phone" control={control} label="Phone Number" type="tel" placeholder="+1 (123) 456-7890" size="small" fullWidth />
        </Box>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2, flexWrap: "wrap" }}>
        <Box sx={{ width: { xs: "100%", md: "48%" } }}>
          <FormField
            name="password"
            control={control}
            label="Password"
            type="password"
            required
            helperText="At least 8 characters with uppercase, lowercase and numbers"
            size="small"
            fullWidth
          />
        </Box>
        <Box sx={{ width: { xs: "100%", md: "48%" } }}>
          <FormField name="confirmPassword" control={control} label="Confirm Password" type="password" required size="small" fullWidth />
        </Box>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2, flexWrap: "wrap" }}>
        <Box sx={{ width: { xs: "100%", md: "48%" } }}>
          <FormField name="age" control={control} label="Age" type="number" inputProps={{ min: 18, max: 100 }} size="small" fullWidth />
        </Box>
        <Box sx={{ width: { xs: "100%", md: "48%" } }}>
          <FormField name="gender" control={control} label="Gender" type="radio" options={genderOptions} required row size="small" fullWidth />
        </Box>
      </Stack>
    </Box>
  );
};

export default PersonalInfoSection;
