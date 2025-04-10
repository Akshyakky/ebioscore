import React, { useEffect, useState } from "react";
import { Grid, Typography, Paper, Box, useTheme } from "@mui/material";
import FormField from "@/components/FormField/FormField";
import CustomButton from "@/components/Button/CustomButton";
import SpecialGrid from "@/components/SpecialGrid/SpecialGrid";
import { LComponentDto } from "@/interfaces/Laboratory/LInvMastDto";

interface PrintPreferencesProps {
  componentsList: LComponentDto[];
  reportTitle: string;
  subTitle: string;
  onReportTitleChange: (title: string) => void;
  onSubTitleChange: (subTitle: string) => void;
  onClear: () => void;
  onUpdateComponentOrder: (newOrder: LComponentDto[]) => void;
}

const PrintPreferences: React.FC<PrintPreferencesProps> = ({ componentsList, reportTitle, subTitle, onReportTitleChange, onSubTitleChange, onClear, onUpdateComponentOrder }) => {
  const theme = useTheme();
  const [orderedComponents, setOrderedComponents] = useState<LComponentDto[]>(componentsList);

  useEffect(() => {
    setOrderedComponents(componentsList);
  }, [componentsList]);

  const handleReorder = (newOrder: LComponentDto[]) => {
    setOrderedComponents(newOrder);
    onUpdateComponentOrder(newOrder);
  };

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Typography variant="h6" id="print-preference-header">
        Print Preferences
      </Typography>

      <Grid container spacing={2}>
        <FormField
          type="text"
          label="Report Title"
          value={reportTitle}
          onChange={(e) => onReportTitleChange(e.target.value)}
          name="reportTitle"
          ControlID="reportTitle"
          placeholder="Enter Report Title"
          maxLength={100}
          isMandatory
        />

        <FormField
          type="text"
          label="Sub Title"
          value={subTitle}
          onChange={(e) => onSubTitleChange(e.target.value)}
          name="subTitle"
          ControlID="subTitle"
          placeholder="Enter Sub Title"
          maxLength={100}
          isMandatory
        />
      </Grid>

      <Box sx={{ mt: 3, mb: 2 }}>
        <SpecialGrid<LComponentDto>
          data={orderedComponents}
          onReorder={handleReorder}
          getItemId={(item) => item.compoID}
          renderLabel={(item) => item.compoNameCD || "Unnamed Component"}
        />
      </Box>
    </Paper>
  );
};

export default PrintPreferences;
