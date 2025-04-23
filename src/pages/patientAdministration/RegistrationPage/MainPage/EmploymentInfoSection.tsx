import React from "react";
import { Grid } from "@mui/material";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { departmentOptions, positionOptions, roleOptions, skillOptions } from "./formOptions";
import { FormSectionProps } from "./type";

const EmploymentInfoSection: React.FC<FormSectionProps> = ({ control }) => {
  return (
    <>
      <Grid item xs={12} md={6}>
        <FormField name="employeeId" control={control} label="Employee ID" type="text" helperText="Leave blank to auto-generate" size="small" />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormField name="department" control={control} label="Department" type="select" options={departmentOptions} required size="small" />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormField name="position" control={control} label="Position" type="select" options={positionOptions} required size="small" />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormField name="roles" control={control} label="System Roles" type="multiselect" options={roleOptions} required helperText="Select at least one role" size="small" />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormField name="skills" control={control} label="Skills" type="multiselect" options={skillOptions} size="small" />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormField name="bio" control={control} label="Professional Bio" type="textarea" rows={3} helperText="Brief professional summary (max 500 characters)" size="small" />
      </Grid>
    </>
  );
};

export default EmploymentInfoSection;
