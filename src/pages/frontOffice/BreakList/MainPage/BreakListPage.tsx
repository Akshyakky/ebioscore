import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Box } from "@mui/material";
import GlobalSpinner from "../../../../components/GlobalSpinner/GlobalSpinner";
import ActionButtonGroup from "../../../../components/Button/ActionButtonGroup";
import SearchIcon from "@mui/icons-material/Search";
import { RootState } from "../../../../store/reducers";
import { notifyError } from "../../../../utils/Common/toastManager";
import { BreakListData } from "../../../../interfaces/FrontOffice/BreakListData";
import BreakListDetails from "../SubPage/BreakListDetails";
import { BreakListService } from "../../../../services/FrontOfficeServices/BreakListServices/BreakListService";
import BreakListSearch from "../SubPage/BreakListsearch";
import { BreakConDetailData } from "../../../../interfaces/FrontOffice/BreakConDetailsData";
import { BreakListConDetailsService } from "../../../../services/FrontOfficeServices/BreakListServices/BreakListConDetailService";

const BreakListPage: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.userDetails);
  const [breakList, setBreakList] = useState<BreakListData[]>([]);
  const [selectedBreak, setSelectedBreak] = useState<BreakListData | null>(null);
  const [breakConDetails, setBreakConDetails] = useState<BreakConDetailData[] | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const dispatch = useDispatch();
  const frequencyNumber = breakList.length;


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
    // setBreakConDetails(null); // Clear breakConDetails on save
  };

  // Handle Clear Operation
  const handleClear = () => {
    setSelectedBreak(null);
    setIsEditMode(false);
    setBreakConDetails(null); // Clear breakConDetails on clear
  };

  // Handle Edit Operation
  const handleEdit = async (row: BreakConDetailData) => {
    debugger
    console.log("Going to edit data with blID:", row.blID);

    setLoading(true);
    try {
      const breakListResult = await BreakListService.getBreakListById(token!, row.blID);
      if (breakListResult.success) {
        console.log("the editing Data", breakListResult)
        setSelectedBreak(breakListResult.data ? breakListResult.data : null);
        const breakConResult = await BreakListConDetailsService.getBreakConDetailById(token!, row.blID);
        if (breakConResult.success) {
          console.log("the editing con Data", breakConResult)
          if (breakConResult.data !== undefined) {
            setBreakConDetails(breakConResult.data);
          }
        } else {
          notifyError(breakConResult.errorMessage || "Error fetching break connection details.");
        }
      } else {
        notifyError(breakListResult.errorMessage || "Error fetching break list details.");
      }
      setIsEditMode(true);
      setIsSearchDialogOpen(false);
    } catch (error) {
      console.error("Error fetching details:", error);
      notifyError("Error fetching details.");
    }
    setLoading(false);
  };

  const handleAdvancedSearch = () => {
    setIsSearchDialogOpen(true);
  };

  const handleCloseSearchDialog = () => {
    setIsSearchDialogOpen(false);
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


      {loading && <GlobalSpinner />}
      <BreakListDetails
        frequencyNumber={frequencyNumber}
        breakData={selectedBreak}
        breakConDetails={breakConDetails}
        onSave={handleSave}
        onClear={handleClear}
        isEditMode={isEditMode}
        setFormData={() => { }}
        formattedEndDate={new Date()}
      />

      <BreakListSearch
        show={isSearchDialogOpen}
        handleClose={handleCloseSearchDialog}
        onEditBreak={handleEdit}
        selectedBreak={selectedBreak}
      />
    </Container>
  );
};

export default BreakListPage;
