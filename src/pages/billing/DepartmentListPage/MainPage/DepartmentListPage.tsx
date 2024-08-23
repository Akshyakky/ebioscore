import { Box, Container, Paper } from "@mui/material";
import ActionButtonGroup, {
  ButtonProps,
} from "../../../../components/Button/ActionButtonGroup";
import Search from "@mui/icons-material/Search";
import DepartmentListDetails from "../SubPage/DepartmentListDetails";
import { useState } from "react";
import DepartmentListSearch from "../SubPage/DepartmentListSearch";

const DepartmentListPage: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleAdvancedSearch = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
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
          <ActionButtonGroup
            buttons={actionButtons}
            groupVariant="contained"
            groupSize="medium"
            orientation="horizontal"
            color="primary"
          />
        </Box>
        <DepartmentListDetails />
        <DepartmentListSearch open={isSearchOpen} onClose={handleCloseSearch} />
      </Container>
    </>
  );
};

export default DepartmentListPage;
