import { useState } from "react";
import { Box, Container } from "@mui/material";
import MainLayout from "../../../../layouts/MainLayout/MainLayout";
import SearchIcon from "@mui/icons-material/Search";
import ActionButtonGroup, {
  ButtonProps,
} from "../../../../components/Button/ActionButtonGroup";
import ProfileDetails from "../SubPage/ProfileDetails";
import AccesDetails from "../SubPage/AccessDetails";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";

const ProfileListPage: React.FC = () => {
  const [isSaved, setIsSaved] = useState(false);

  const handleAdvancedSearch = async () => {
    // Implement advanced search functionality
  };

  const userInfo = useSelector((state: RootState) => state.userDetails);
  const effectiveUserID = userInfo
    ? userInfo.adminYN === "Y"
      ? 0
      : userInfo.userID
    : -1;
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
        {isSaved && (
          <AccesDetails userID={effectiveUserID} token={userInfo.token} />
        )}
      </Container>
    </MainLayout>
  );
};

export default ProfileListPage;
