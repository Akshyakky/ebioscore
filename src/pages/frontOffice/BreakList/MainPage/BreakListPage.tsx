import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Box } from "@mui/material";
import GlobalSpinner from "../../../../components/GlobalSpinner/GlobalSpinner";
import ActionButtonGroup from "../../../../components/Button/ActionButtonGroup";
import SearchIcon from "@mui/icons-material/Search";
import { RootState } from "../../../../store/reducers";
import { notifyError } from "../../../../utils/Common/toastManager";
import BreakListDetails from "../SubPage/BreakListDetails";
import { BreakListService } from "../../../../services/FrontOfficeServices/BreakListServices/BreakListService";
import BreakListSearch from "../SubPage/BreakListsearch";
import { BreakConDetailData } from "../../../../interfaces/frontOffice/BreakConDetailsData";
import { BreakListConDetailsService } from "../../../../services/FrontOfficeServices/BreakListServices/BreakListConDetailService";
import { BreakListData } from "../../../../interfaces/frontOffice/BreakListData";

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<BreakListData | undefined>(undefined);


  const fetchBreakList = async () => {
    setLoading(true);
    try {
      const result = await BreakListService.getAllBreakLists();
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


  const handleAdvancedSearch = () => {
    setIsSearchOpen(true);
};
  // Handle Edit Operation




  const handleCloseSearchDialog = () => {
    setIsSearchDialogOpen(false);
  };

  
  const handleSelect = (data: BreakListData) => {
    setSelectedData(data);
};

  
  const handleCloseSearch = () => {
    setIsSearchOpen(false);
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
       open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect}/>
    </Container>
  );
};

export default BreakListPage;
