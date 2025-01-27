import { Box, Container, Divider, Grid, Typography } from "@mui/material";
import { Suspense, useState } from "react";
import { Loader } from "lucide-react";
import AppModifiedDetails from "../SubPage/AppModifiedListDetails";
import React from "react";
import AppModifiedListSearch from "../SubPage/AppModifiedListSearch";
import { AppModifiedMast } from "@/interfaces/HospitalAdministration/AppModifiedlistDto";
import ActionButtonGroup from "@/components/Button/ActionButtonGroup";
import SearchIcon from "@mui/icons-material/Search";
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
          <AppModifiedListSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
        </Grid>
      </Grid>
    </Container>
  );
};
export default AppModifiedListPage;
