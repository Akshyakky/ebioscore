import React, { useEffect } from "react";
import { Grid, Paper } from "@mui/material";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";

interface IndentProductFooterProps {
  setValue: any;
  control: any;
  getValues: any;
  watch: any;
}

const IndentProductFooter: React.FC<IndentProductFooterProps> = ({ setValue, control, getValues, watch }) => {
  const rActiveYN = watch("IndentMaster.rActiveYN");
  const indentApprovedYN = watch("IndentMaster.indentApprovedYN");

  const handleRActiveToggle = () => {
    const newValue = rActiveYN === "Y" ? "N" : "Y";
    setValue("IndentMaster.rActiveYN", newValue);

    const details = getValues("IndentDetails") ?? [];
    setValue(
      "IndentDetails",
      details.map((d: any) => ({ ...d, rActiveYN: newValue }))
    );
  };

  const handleIndentApprovedToggle = (event: any) => {
    const newValue = event.target.checked ? "N" : "Y";
    setValue("IndentMaster.indentApprovedYN", newValue);
  };

  useEffect(() => {
    console.log("Current values:", {
      rNotes: getValues("IndentMaster.rNotes"),
      rActiveYN: getValues("IndentMaster.rActiveYN"),
      indentApprovedYN: getValues("IndentMaster.indentApprovedYN"),
    });
  }, [getValues, rActiveYN, indentApprovedYN]);

  return (
    <Paper variant="outlined" sx={{ padding: 2 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <FormField name="IndentMaster.rNotes" control={control} label="Remarks" type="textarea" size="small" rows={3} />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <FormField name="IndentMaster.rActiveYN" control={control} label="Hide Indent" type="switch" onChange={handleRActiveToggle} />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <FormField name="IndentMaster.indentApprovedYN" control={control} label="Finalize Indent" type="switch" onChange={handleIndentApprovedToggle} />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default IndentProductFooter;
