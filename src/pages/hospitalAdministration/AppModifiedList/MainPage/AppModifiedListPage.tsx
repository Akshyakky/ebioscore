import React, { Suspense, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { Loader } from "lucide-react";
import { AppModifiedMast } from "@/interfaces/HospitalAdministration/AppModifiedlistDto";
import { Box, Container, Divider, Grid, Typography } from "@mui/material";
import ActionButtonGroup from "@/components/Button/ActionButtonGroup";
import AppModifiedDetails from "../SubPage/AppModifiedListDetails";
import AppModifiedMastSearch from "../SubPage/AppModifiedListSearch";
const AppModifiedListPage: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<AppModifiedMast | undefined>(undefined);

  const handleAdvancedSearch = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  const handleSelect = (data: AppModifiedMast) => {
    setSelectedData(data);
  };

  return (
    <Container maxWidth={false}>
      <Box sx={{ marginBottom: 2 }}>
        <ActionButtonGroup
          buttons={[
            {
              variant: "contained",
              size: "medium",
              icon: SearchIcon,
              text: "Advanced Search",
              onClick: handleAdvancedSearch,
            },
          ]}
        />
      </Box>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            App Modified Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Suspense fallback={<Loader type="skeleton" />}>
            <AppModifiedDetails selectedData={selectedData} />
          </Suspense>
          <AppModifiedMastSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
        </Grid>
      </Grid>
    </Container>
  );
};
export default AppModifiedListPage;
