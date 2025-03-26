import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import { UserListDto } from "@/interfaces/SecurityManagement/UserListData";
import { Search } from "@mui/icons-material";
import { Box, Container } from "@mui/material";
import React, { useCallback, useState } from "react";
import UserListDetails from "../SubPage/UserListDetails";
import UserListSearch from "../SubPage/UserListSearch";

const UserListPage: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<UserListDto | undefined>(undefined);

  const handleAdvancedSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  const handleSelect = useCallback((data: UserListDto) => {
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
        <Box sx={{ marginBottom: 2 }}>
          <ActionButtonGroup buttons={actionButtons} orientation="horizontal" />
          <UserListDetails selectedUser={selectedData} />
          <UserListSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
        </Box>
      </Container>
    </>
  );
};

export default UserListPage;
