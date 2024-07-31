// BreakListPage.tsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Grid, Paper, Typography, Button, Container, Box } from "@mui/material";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
import GlobalSpinner from "../../../../components/GlobalSpinner/GlobalSpinner";
import ActionButtonGroup from "../../../../components/Button/ActionButtonGroup";
import SearchIcon from "@mui/icons-material/Search";
import { RootState } from "../../../../store/reducers";
import { notifyError } from "../../../../utils/Common/toastManager";
import { BreakListData } from "../../../../interfaces/frontOffice/BreakListData";
import MainLayout from "../../../../layouts/MainLayout/MainLayout";
import BreakListDetails from "../SubPage/BreakListDetails";
import { BreakListService } from "../../../../services/frontOffice/BreakListService";
import BreakListSearch from "../SubPage/BreakListsearch";

const BreakListPage: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.userDetails);
  const [breakList, setBreakList] = useState<BreakListData[]>([]);
  const [selectedBreak, setSelectedBreak] = useState<BreakListData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const dispatch = useDispatch();

  // Fetch Break List Function
  const fetchBreakList = async () => {
    setLoading(true);
    try {
      const result = await BreakListService.getAllBreakLists(token!);
      if (result.success) {
        setBreakList(result.data || []);
      } else {
        notifyError(result.errorMessage || "Failed to fetch break list.");
      }
    } catch (error) {
      notifyError("An error occurred while fetching the break list.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBreakList();
  }, [dispatch]);

  // Handle Save Operation
  const handleSave = (savedBreak: BreakListData) => {
    if (isEditMode) {
      setBreakList((prev) =>
        prev.map((breakItem) => (breakItem.bLID === savedBreak.bLID ? savedBreak : breakItem))
      );
    } else {
      setBreakList((prev) => [...prev, savedBreak]);
    }
    setIsEditMode(false);
    setSelectedBreak(null);
  };

  // Handle Clear Operation
  const handleClear = () => {
    setSelectedBreak(null);
    setIsEditMode(false);
  };

  // Handle Edit Operation
  const handleEdit = (breakData: BreakListData) => {
    setSelectedBreak(breakData);
    setIsEditMode(true);
  };

  const handleAdvancedSearch = () => {
    setIsSearchDialogOpen(true);
  };

  const handleCloseSearchDialog = () => {
    setIsSearchDialogOpen(false);
  };

  return (
    <MainLayout>
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
        {loading && <GlobalSpinner />}
        <BreakListDetails
          breakData={selectedBreak}
          onSave={handleSave}
          onClear={handleClear}
          isEditMode={isEditMode}
          setFormData={() => {}} // Temporary fix to avoid TypeScript error
        />
        <BreakListSearch
          show={isSearchDialogOpen}
          handleClose={handleCloseSearchDialog}
          onEditBreak={handleEdit}
          selectedBreak={selectedBreak}
        />
      </Container>
    </MainLayout>
  );
};

export default BreakListPage;
