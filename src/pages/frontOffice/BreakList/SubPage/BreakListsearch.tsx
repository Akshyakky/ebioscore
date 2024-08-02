import React, { useState, useEffect, useCallback } from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  Box,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import CustomButton from "../../../../components/Button/CustomButton";
import GlobalSpinner from "../../../../components/GlobalSpinner/GlobalSpinner";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import CustomSwitch from "../../../../components/Checkbox/ColorSwitch";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
import EditIcon from "@mui/icons-material/Edit";
import { notifyError, notifySuccess } from "../../../../utils/Common/toastManager";
import { BreakListData } from "../../../../interfaces/frontOffice/BreakListData";
import { debounce } from "../../../../utils/Common/debounceUtils";
import { BreakListService } from "../../../../services/FrontOfficeServices/BreakListService";
import { ResourceListService } from "../../../../services/FrontOfficeServices/ResourceListServices";

interface BreakListSearchProps {
  show: boolean;
  handleClose: () => void;
  onEditBreak: (breakList: BreakListData) => void;
  selectedBreak: BreakListData | null;
}

const BreakListSearch: React.FC<BreakListSearchProps> = ({
  show,
  handleClose,
  onEditBreak,
  selectedBreak
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<BreakListData[]>([]);
  const { token } = useSelector((state: RootState) => state.userDetails);
  const [switchStatus, setSwitchStatus] = useState<{ [key: number]: boolean }>({});
  const [isPhyResYN, setIsPhyResYN] = useState("Y"); 


  const [breakListData, setBreakListData] = useState<BreakListData | null>(null);

  // Fetch break list details when a break list is selected for editing
  useEffect(() => {
    if (selectedBreak) {
      setBreakListData(selectedBreak);
    }
  }, [selectedBreak]);


  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const result = await BreakListService.getAllBreakLists(token!);
      if (result.success && result.data) {
        const filteredResults = result.data.filter(
          (breakList) =>
           
            breakList.bLName.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filteredResults);
      } else {
        console.error("Failed to fetch search results.");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      performSearch(searchQuery);
    }, 300),
    [token]
  );

  useEffect(() => {
    if (show) {
      performSearch("");
    }
  }, [show]);

  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    } else if (show) {
      performSearch("");
    }
  }, [searchTerm, debouncedSearch, show]);

  useEffect(() => {
    const initialSwitchStatus = searchResults.reduce((acc, item) => {
      acc[item.bLID] = item.isPhyResYN === "Y";
      return acc;
    }, {} as { [key: number]: boolean });
    setSwitchStatus(initialSwitchStatus);
  }, [searchResults]);

  
  const handleEditAndClose = async (resource: BreakListData) => {
    try {
      const result = await BreakListService.getBreakListById(token!, resource.bLID);
      if (result.success && result.data) {
        onEditBreak(result.data);
        handleClose();
      } else {
        notifyError(result.errorMessage || "Error fetching resource details.");
      }
    } catch (error) {
      console.error("Error fetching resource details:", error);
      notifyError("Error fetching resource details.");
    }
  };

  const handleSwitchChange = async (breakList: BreakListData, checked: boolean) => {
    try {
      if (!breakList.bLID) {
        console.error("Break list bLID is undefined or null.");
        return;
      }

      const updatedBreakList = {
        ...breakList,
        bLStatus: checked ? "Active" : "Inactive",
      };

      const result = await BreakListService.saveBreakList(token!, updatedBreakList);

      if (result.success) {
        notifySuccess(`Break list status updated to ${checked ? "Active" : "Inactive"}`);
        setSwitchStatus((prevState) => ({
          ...prevState,
          [breakList.bLID]: checked,
        }));
      } else {
        notifyError(`Error updating break list status: ${result.errorMessage}`);
        setSwitchStatus((prevState) => ({
          ...prevState,
          [breakList.bLID]: !checked,
        }));
      }
    } catch (error) {
      notifyError("Error updating break list status.");
    }
  };

  const columns = [
    {
      key: "BreakEdit",
      header: "Edit",
      visible: true,
      render: (row: BreakListData) => (
        <CustomButton
          text="Edit"
          onClick={() => handleEditAndClose(row)}
          icon={EditIcon}
        />
      ),
    },
    { key: "serialNumber", header: "Sl.No", visible: true },
    { key: "bLName", header: "Break Name", visible: true },
    { key: "bLName", header: "provider Name", visible: true },
    {
      key: "bLName",
      header: isPhyResYN === "Y" ? "Resource Name" : "Physician Name",
      visible: true
    },
    {
      key: "status",
      header: "Status",
      visible: true,
      render: (row: BreakListData) => (
        <Typography variant="body2">
          {switchStatus[row.bLID] ? "Active" : "Inactive"}
        </Typography>
      ),
    },
    {
      key: "recordStatus",
      header: "Record Status",
      visible: true,
      render: (row: BreakListData) => (
        <CustomSwitch
          size="medium"
          color="secondary"
          checked={switchStatus[row.bLID] || false}
          onChange={(event) => handleSwitchChange(row, event.target.checked)}
        />
      ),
    },
  ];

  const dataWithIndex = searchResults.map((item, index) => ({
    ...item,
    serialNumber: index + 1,
  }));

  const handleDialogClose = () => {
    setSearchTerm("");
    handleClose();
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setSearchTerm(searchTerm.trim());
    }
  };

  return (
    <Dialog
      open={show}
      onClose={(event, reason) => {
        if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
          handleDialogClose();
        }
      }}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box>
          <Typography variant="h6" id="break-list-header">
            BREAK LIST SEARCH
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent
        sx={{ minHeight: "600px", maxHeight: "600px", overflowY: "auto" }}
      >
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} lg={4}>
              <FloatingLabelTextBox
                ControlID="SearchTerm"
                title="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter break name or provider name"
                size="small"
                autoComplete="off"
                onKeyPress={handleKeyPress}
              />
            </Grid>
          </Grid>
        </Box>
        {isLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="500px"
          >
            <GlobalSpinner />
          </Box>
        ) : (
          <CustomGrid columns={columns} data={dataWithIndex} />
        )}
      </DialogContent>
      <DialogActions>
        <CustomButton
          variant="contained"
          text="Close"
          icon={CloseIcon}
          size="medium"
          onClick={handleDialogClose}
          color="secondary"
        />
      </DialogActions>
    </Dialog>
  );
};

export default BreakListSearch;
