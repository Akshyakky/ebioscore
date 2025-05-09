import React, { useEffect } from "react";
import { Grid, Paper, Typography } from "@mui/material";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { showAlert } from "@/utils/Common/showAlert";

interface IndentProductFooterProps {
  setValue: any;
  control: any;
  getValues: any;
}

const IndentProductFooter: React.FC<IndentProductFooterProps> = ({ setValue, control, getValues }) => {
  const handleToggleChange = (field: string, isChecked: boolean, message: string) => {
    const value = isChecked ? "Y" : "N";
    setValue(`IndentMaster.${field}`, value);
    if (field === "rActiveYN") {
      const indentDetails = getValues("IndentDetails");
      if (indentDetails?.length) {
        setValue(
          "IndentDetails",
          indentDetails.map((detail: any) => ({
            ...detail,
            rActiveYN: value,
          }))
        );
      }
    }

    showAlert("Success", `${message}: ${isChecked ? "Yes" : "No"}`, "success");
  };

  useEffect(() => {
    setValue("IndentMaster.indentApprovedYN", "N");
    setValue("IndentMaster.rActiveYN", "Y");
    setValue("IndentMaster.remarks", "");
  }, [setValue]);

  return (
    <Paper variant="outlined" sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Indent Product Footer
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <FormField
            name="IndentMaster.remarks"
            control={control}
            label="Remarks"
            type="textarea"
            size="small"
            rows={3}
            onChange={(e) => setValue("IndentMaster.remarks", e.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <FormField
            name="IndentMaster.hide"
            control={control}
            label="Hide Indent"
            type="checkbox"
            onChange={(e) => handleToggleChange("rActiveYN", !e.target.checked, "Hide Indent")}
            size="small"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <FormField
            name="IndentMaster.finalizeIndent"
            control={control}
            label="Finalize Indent"
            type="checkbox"
            onChange={(e) => handleToggleChange("indentApprovedYN", e.target.checked, "Indent Finalized")}
            size="small"
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default IndentProductFooter;
