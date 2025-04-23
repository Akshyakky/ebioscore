import React from "react";
import { Grid } from "@mui/material";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { genderOptions } from "./formOptions";
import { FormSectionProps } from "./type";

const PersonalInfoSection: React.FC<FormSectionProps> = ({ control }) => {
  return (
    <>
      <Grid item xs={12} md={6}>
        <FormField name="firstName" control={control} label="First Name" type="text" required size="small" />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormField name="lastName" control={control} label="Last Name" type="text" required size="small" />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormField name="email" control={control} label="Email" type="email" required size="small" />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormField name="phone" control={control} label="Phone Number" type="tel" placeholder="+1 (123) 456-7890" size="small" />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormField
          name="password"
          control={control}
          label="Password"
          type="password"
          required
          helperText="At least 8 characters with uppercase, lowercase and numbers"
          size="small"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormField name="confirmPassword" control={control} label="Confirm Password" type="password" required size="small" />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormField name="age" control={control} label="Age" type="number" inputProps={{ min: 18, max: 100 }} size="small" />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormField name="gender" control={control} label="Gender" type="radio" options={genderOptions} required row size="small" />
      </Grid>
    </>
  );
};

export default PersonalInfoSection;
