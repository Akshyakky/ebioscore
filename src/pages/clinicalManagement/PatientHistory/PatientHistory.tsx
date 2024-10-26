import { Box, Paper, Tab, Tabs, Typography } from "@mui/material";
import { useState } from "react";
import { FamilyHistory } from "./FamilyHistory/FamilyHistory";
import { TabPanel } from "./TabPanel";

export const PatientHistory: React.FC<{
  pChartID: number;
  opipNo: number;
  opipCaseNo: number;
}> = ({ pChartID, opipNo, opipCaseNo }) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Paper>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Family History" />
            <Tab label="Social History" />
            <Tab label="Past Medical History" />
            {/* Add more history types as needed */}
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <FamilyHistory pChartID={pChartID} opipNo={opipNo} opipCaseNo={opipCaseNo} />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {/* Social History Component */}
          <Typography>Social History Component (To be implemented)</Typography>
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          {/* Past Medical History Component */}
          <Typography>Past Medical History Component (To be implemented)</Typography>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default PatientHistory;
