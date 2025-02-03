import { Box, Container } from "@mui/material";
import React, { useCallback, useState } from "react";
import { Search } from "@mui/icons-material";
import { ProfileMastDto } from "@/interfaces/SecurityManagement/ProfileListData";
import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import ProfileDetails from "../SubPage/ProfileListDetails";
import ProfileListSearch from "../SubPage/ProfileListSearch";

const ProfileListPage: React.FC = () => {
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
        <Box sx={{ marginBottom: 2 }}>
          <ActionButtonGroup buttons={actionButtons} orientation="horizontal" />
        </Box>
        <ProfileDetails />
        <ProfileListSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
      </Container>
    </>
  );
};

export default ProfileListPage;
