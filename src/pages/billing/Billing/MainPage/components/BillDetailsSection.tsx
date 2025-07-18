// src/pages/billing/Billing/MainPage/components/BillDetailsSection.tsx
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { Card, CardContent, Divider, Grid, Typography } from "@mui/material";
import React from "react";
import { Control, UseFormSetValue } from "react-hook-form";
import { BillingFormData, DropdownOption } from "../types";

interface BillDetailsSectionProps {
  control: Control<BillingFormData>;
  dropdownValues: any;
  physicians: DropdownOption[];
  referals: DropdownOption[];
  setValue: UseFormSetValue<BillingFormData>;
}

export const BillDetailsSection: React.FC<BillDetailsSectionProps> = ({ control, dropdownValues, physicians, referals, setValue }) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Bill Details
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid size={{ sm: 12, md: 4 }}>
            <FormField
              name="pTypeID"
              control={control}
              label="Payment Source [PIC]"
              type="select"
              required
              size="small"
              fullWidth
              options={dropdownValues.pic || []}
              defaultText="Select Payment Source"
              onChange={(data: any) => {
                if (data && typeof data === "object" && "value" in data) {
                  setValue("pTypeName", data.label || "", { shouldDirty: true });
                  setValue("pTypeCode", data.value?.toString() || "", { shouldDirty: true });
                }
              }}
            />
          </Grid>

          <Grid size={{ sm: 12, md: 4 }}>
            <FormField
              name="referralID"
              control={control}
              label="Primary Introducing Source"
              type="select"
              size="small"
              fullWidth
              options={referals || []}
              defaultText="Select Primary Introducing Source"
              onChange={(data: any) => {
                if (data && typeof data === "object" && "value" in data) {
                  setValue("referralName", data.label || "", { shouldDirty: true });
                }
              }}
            />
          </Grid>

          <Grid size={{ sm: 12, md: 4 }}>
            <FormField
              name="referral2ID"
              control={control}
              label="Secondary Introducing Source"
              type="select"
              size="small"
              fullWidth
              options={referals || []}
              defaultText="Select Secondary Introducing Source"
              onChange={(data: any) => {
                if (data && typeof data === "object" && "value" in data) {
                  setValue("referralName2", data.label || "", { shouldDirty: true });
                }
              }}
            />
          </Grid>

          <Grid size={{ sm: 12, md: 4 }}>
            <FormField
              name="physicianID"
              control={control}
              label="Attending Physician"
              type="select"
              size="small"
              fullWidth
              options={physicians || []}
              defaultText="Select Attending Physician"
              onChange={(data: any) => {
                if (data && typeof data === "object" && "value" in data) {
                  setValue("physicianName", data.label || "", { shouldDirty: true });
                }
              }}
            />
          </Grid>

          <Grid size={{ sm: 12 }}>
            <FormField name="rNotes" control={control} label="Notes" type="textarea" size="small" fullWidth rows={2} placeholder="Enter bill remarks" />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
