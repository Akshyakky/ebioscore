import { useState } from "react";
import { Box, Container } from "@mui/material";
import MainLayout from "../../../../layouts/MainLayout/MainLayout";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import ActionButtonGroup, { ButtonProps } from "../../../../components/Button/ActionButtonGroup";
import ProfileDetails from "../SubPage/ProfileDetails";
import AccesDetails from "../SubPage/AccesDetails";

const ProfileListPage: React.FC = () => {
  const [isSaved, setIsSaved] = useState(false);

  const handleAdvancedSearch = async () => {
    // Implement advanced search functionality
  };

  const actionButtons: ButtonProps[] = [
    {
      variant: "contained",
      size: "medium",
      icon: SearchIcon,
      text: "Advanced Search",
      onClick: handleAdvancedSearch,
    },
  ];

  const handleSave = () => {
    setIsSaved(true);
  };

  const handleClear = () => {
    setIsSaved(false);
  };

  return (
    <MainLayout>
      <Container maxWidth={false}>
        <Box sx={{ marginBottom: 2 }}>
          <ActionButtonGroup buttons={actionButtons} />
        </Box>
        <ProfileDetails onSave={handleSave} onClear={handleClear} />
        {isSaved && <AccesDetails />}
      </Container>
    </MainLayout>
  );
};

export default ProfileListPage;
