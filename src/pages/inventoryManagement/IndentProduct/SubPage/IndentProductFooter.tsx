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
  const handleFinalizeToggle = (isFinalized: boolean) => {
    setValue("IndentMaster.indentApprovedYN", isFinalized ? "Y" : "N");
    showAlert("Success", `Indent Finalized: ${isFinalized ? "Yes" : "No"}`, "success");
  };
  const handleRemarksChange = (value: string) => {
    setValue("IndentMaster.remarks", value);
  };

  const handleHideToggle = (isHidden: boolean) => {
    const updatedRActiveYN = isHidden ? "N" : "Y";
    setValue("IndentMaster.rActiveYN", updatedRActiveYN);
    const indentDetails = getValues("IndentDetails");
    const updatedIndentDetails = indentDetails.map((detail: any) => ({
      ...detail,
      rActiveYN: updatedRActiveYN,
    }));

    setValue("IndentDetails", updatedIndentDetails);

    showAlert("Success", `Hide Indent: ${isHidden ? "Yes" : "No"}`, "success");
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

      <form>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormField name="IndentMaster.remarks" control={control} label="Remarks" type="textarea" size="small" rows={3} onChange={(e) => handleRemarksChange(e.target.value)} />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormField name="IndentMaster.hide" control={control} label="Hide Indent" type="checkbox" onChange={(e) => handleHideToggle(e.target.checked)} size="small" />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormField
              name="IndentMaster.finalizeIndent"
              control={control}
              label="Finalize Indent"
              type="checkbox"
              onChange={(e) => handleFinalizeToggle(e.target.checked)}
              size="small"
            />
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default IndentProductFooter;
