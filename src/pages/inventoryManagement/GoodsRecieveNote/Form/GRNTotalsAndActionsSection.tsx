// src/components/GRN/GRNTotalsAndActionsSection.tsx

import CustomButton from "@/components/Button/CustomButton";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import { GRNDetailDto } from "@/interfaces/InventoryManagement/GRNDto";
import { Check as ApplyIcon, DeleteSweep as DeleteAllIcon, History as HistoryIcon, AddBusiness as NewDeptIcon } from "@mui/icons-material";
import { Box, FormControlLabel, Grid, Paper, Stack, Switch, Typography, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Control, UseFormSetValue, UseFormWatch } from "react-hook-form";

interface GRNTotalsAndActionsSectionProps {
  grnDetails: GRNDetailDto[];
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  onDeleteAll: () => void;
  onShowHistory: () => void;
  onNewIssueDepartment: () => void;
  onApplyDiscount: () => void;
  disabled?: boolean;
  isApproved?: boolean;
}

const TotalDisplayField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <Box
    sx={{
      p: 2,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      height: "100%",
      borderRadius: 1,
      border: "1px solid",
      borderColor: "divider",
    }}
  >
    <Typography variant="subtitle2" component="div" sx={{ fontWeight: "bold", mr: 1, whiteSpace: "nowrap" }}>
      {label}:
    </Typography>
    {children}
  </Box>
);

const GRNTotalsAndActionsSection: React.FC<GRNTotalsAndActionsSectionProps> = ({
  control,
  setValue,
  watch,
  onDeleteAll,
  onShowHistory,
  onNewIssueDepartment,
  onApplyDiscount,
  disabled = false,
  isApproved = false,
}) => {
  const theme = useTheme();
  const [isDiscountInPercentage, setIsDiscountInPercentage] = useState(watch("discPercentageYN") === "Y");
  const watchedDiscountType = watch("discPercentageYN");

  useEffect(() => {
    setIsDiscountInPercentage(watchedDiscountType === "Y");
  }, [watchedDiscountType]);

  const handleDiscountToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setValue("discPercentageYN", isChecked ? "Y" : "N", { shouldDirty: true });
    setValue("disc", 0, { shouldDirty: true });
  };

  const allDisabled = disabled || isApproved;

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2.5,
        mt: 2,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems="center" mb={2.5}>
        <CustomButton text="Delete All" icon={DeleteAllIcon} color="error" onClick={onDeleteAll} disabled={allDisabled} />
        <CustomButton text="Show History" icon={HistoryIcon} color="warning" onClick={onShowHistory} />
        <CustomButton text="New Issual Department" icon={NewDeptIcon} color="primary" onClick={onNewIssueDepartment} />
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={1} alignItems="center">
          <FormControlLabel
            control={<Switch checked={isDiscountInPercentage} onChange={handleDiscountToggle} disabled={allDisabled} color="primary" />}
            label=""
            title={isDiscountInPercentage ? "Switch to Amount-based Discount" : "Switch to Percentage-based Discount"}
            sx={{ mr: 0 }}
          />
          <EnhancedFormField name="disc" control={control} type="number" placeholder={isDiscountInPercentage ? "Discount %" : "Discount Amt"} size="small" disabled={allDisabled} />
          <CustomButton text="Apply" icon={ApplyIcon} color="secondary" onClick={onApplyDiscount} disabled={allDisabled} />
        </Stack>
      </Stack>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 2.4, sm: 6 }}>
          <TotalDisplayField label="Items Total">
            <EnhancedFormField name="tot" control={control} type="number" disabled fullWidth variant="outlined" />
          </TotalDisplayField>
        </Grid>
        <Grid size={{ xs: 12, md: 2.4, sm: 6 }}>
          <TotalDisplayField label="Tax Amount">
            <EnhancedFormField name="taxAmt" control={control} type="number" disabled fullWidth variant="outlined" />
          </TotalDisplayField>
        </Grid>
        <Grid size={{ xs: 12, md: 2.4, sm: 6 }}>
          <TotalDisplayField label="PO Disc. Amt">
            <EnhancedFormField name="poDiscAmt" control={control} type="number" disabled fullWidth variant="outlined" />
          </TotalDisplayField>
        </Grid>
        <Grid size={{ xs: 12, md: 2.4, sm: 6 }}>
          <TotalDisplayField label="Coin Adjustment">
            <EnhancedFormField name="roundingAdjustment" control={control} type="number" fullWidth variant="outlined" disabled={allDisabled} />
          </TotalDisplayField>
        </Grid>
        <Grid size={{ xs: 12, md: 2.4, sm: 6 }}>
          <TotalDisplayField label="Total">
            <EnhancedFormField name="netTot" control={control} type="number" disabled fullWidth variant="outlined" />
          </TotalDisplayField>
        </Grid>

        <Grid size={{ xs: 12, md: 2.4, sm: 6 }}>
          <TotalDisplayField label="Others">
            <EnhancedFormField name="otherAmt" control={control} type="number" fullWidth variant="outlined" disabled={allDisabled} />
          </TotalDisplayField>
        </Grid>
        <Grid size={{ xs: 12, md: 2.4, sm: 6 }}>
          <TotalDisplayField label="Net Total">
            <EnhancedFormField name="netTot" control={control} type="number" disabled fullWidth variant="outlined" />
          </TotalDisplayField>
        </Grid>
        <Grid size={{ xs: 12, md: 2.4, sm: 6 }}>
          <TotalDisplayField label="Coin Adjustment">
            <EnhancedFormField name="coinAdj" control={control} type="number" fullWidth variant="outlined" disabled={allDisabled} />
          </TotalDisplayField>
        </Grid>
        <Grid size={{ xs: 12, md: 4.8, sm: 6 }}>
          <TotalDisplayField label="Balance">
            <EnhancedFormField name="balanceAmt" control={control} type="number" disabled fullWidth variant="outlined" />
          </TotalDisplayField>
        </Grid>
      </Grid>
      <Box mt={2.5}>
        <EnhancedFormField
          name="rNotes"
          control={control}
          type="textarea"
          label="Remarks"
          fullWidth
          disabled={allDisabled}
          placeholder="Enter any additional remarks or notes for this GRN..."
        />
      </Box>
    </Paper>
  );
};

export default GRNTotalsAndActionsSection;
