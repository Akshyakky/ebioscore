import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { Grid, Stack } from "@mui/material";
import React from "react";
import { Control } from "react-hook-form";

interface ApprovalSectionProps {
  investigationId: number;
  control: Control<any>;
  technicianOptions: Array<{ value: number; label: string }>;
  consultantOptions: Array<{ value: number; label: string }>;
  watchTechnicianId: number;
  watchConsultantId: number;
  onTechnicianChange: (value: any) => void;
  onConsultantChange: (value: any) => void;
}

export const ApprovalSection: React.FC<ApprovalSectionProps> = ({
  investigationId,
  control,
  technicianOptions,
  consultantOptions,
  watchTechnicianId,
  watchConsultantId,
  onTechnicianChange,
  onConsultantChange,
}) => {
  const invPrefix = `inv_${investigationId}`;

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Stack spacing={2}>
          <FormField
            name={`${invPrefix}_technicianId`}
            control={control}
            label="Technician"
            type="select"
            size="small"
            fullWidth
            options={technicianOptions}
            placeholder="Select Technician"
            onChange={onTechnicianChange}
          />
          <FormField name={`${invPrefix}_technicianApproval`} control={control} label="Technician Approved" type="switch" size="small" disabled={!watchTechnicianId} />
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Stack spacing={2}>
          <FormField
            name={`${invPrefix}_consultantId`}
            control={control}
            label="Lab Consultant"
            type="select"
            size="small"
            fullWidth
            options={consultantOptions}
            placeholder="Select Consultant"
            onChange={onConsultantChange}
          />
          <FormField name={`${invPrefix}_consultantApproval`} control={control} label="Consultant Approved" type="switch" size="small" disabled={!watchConsultantId} />
        </Stack>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <FormField
          name={`${invPrefix}_remarks`}
          control={control}
          label="Remarks"
          type="textarea"
          size="small"
          fullWidth
          rows={2}
          placeholder="Enter any remarks for this investigation"
        />
      </Grid>
    </Grid>
  );
};
