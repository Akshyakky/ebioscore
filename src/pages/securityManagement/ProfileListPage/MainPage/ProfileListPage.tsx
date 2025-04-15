import { Box, Container } from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import { Search } from "@mui/icons-material";
import { ProfileMastDto } from "@/interfaces/SecurityManagement/ProfileListData";
import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import ProfileDetails from "../SubPage/ProfileListDetails";
import ProfileListSearch from "../SubPage/ProfileListSearch";
import { createEntityService } from "@/utils/Common/serviceFactory";
import { Grid } from "@mui/material";
import PermissionManager from "../../CommonPage/PermissionManager";

const ProfileListPage: React.FC = () => {
  const profileMastService = useMemo(() => createEntityService<ProfileMastDto>("ProfileMast", "securityManagementURL"), []);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<ProfileMastDto | undefined>(undefined);

  const handleAdvancedSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  const handleSelect = useCallback((data: ProfileMastDto) => {
    setSelectedData(data);
  }, []);

  const handleClearPage = (isClear: boolean) => {
    isClear && setSelectedData(undefined);
  };
  const actionButtons: ButtonProps[] = [
    {
      variant: "contained",
      icon: Search,
      text: "Advanced Search",
      onClick: handleAdvancedSearch,
    },
  ];

  return (
    <>
      <Container maxWidth={false}>
        {!selectedData && (
          <Box sx={{ marginBottom: 2 }}>
            <ActionButtonGroup buttons={actionButtons} orientation="horizontal" />
          </Box>
        )}
        <ProfileDetails editData={selectedData} profileMastService={profileMastService} isClear={handleClearPage} />
        <ProfileListSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} profileMastService={profileMastService} />
        {selectedData && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4} xl={3}>
              <PermissionManager mode="profile" details={selectedData} title="Module Permissions" type="M" useMainModules={true} useSubModules={true} />
            </Grid>
            <Grid item xs={12} md={6} lg={4} xl={3}>
              <PermissionManager mode="profile" details={selectedData} title="Report Permissions" type="R" useMainModules={true} useSubModules={false} />
            </Grid>
          </Grid>
        )}
      </Container>
    </>
  );
};

export default ProfileListPage;
