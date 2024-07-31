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
import { ReasonListData } from "../../../../interfaces/frontOffice/ReasonListData";
import { debounce } from "../../../../utils/Common/debounceUtils";
import { ReasonListService } from "../../../../services/frontOffice/ReasonListService";

interface ReasonListSearchProps {
  show: boolean;
  handleClose: () => void;
  onEditProfile: (reason: ReasonListData) => void;
  selectedReason: ReasonListData | null;
}

const ReasonListSearch: React.FC<ReasonListSearchProps> = ({
  show,
  handleClose,
  onEditProfile,
  
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<ReasonListData[]>([]);
  const { token } = useSelector((state: RootState) => state.userDetails);
  const [switchStatus, setSwitchStatus] = useState<{ [key: number]: boolean }>({});

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const result = await ReasonListService.getAllReasonLists(token!);
      if (result.success && result.data) {
        const filteredResults = result.data.filter(
          (reason) =>
            reason.arlCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            reason.arlName.toLowerCase().includes(searchQuery.toLowerCase())
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
      acc[item.arlID] = item.rActiveYN === "Y";
      return acc;
    }, {} as { [key: number]: boolean });

    setSwitchStatus(initialSwitchStatus);
  }, [searchResults]);

  const handleEditAndClose = async (reason: ReasonListData) => {
    try {
      onEditProfile(reason);
      handleClose();
    } catch (error) {
      notifyError("Error fetching reason details.");
    }
  };

  const handleSwitchChange = async (reason: ReasonListData, checked: boolean) => {
    try {
      if (!reason.arlID) {
        console.error("Reason arlID is undefined or null.");
        return;
      }

      const updatedReason = {
        ...reason,
        rActiveYN: checked ? "Y" : "N",
      };

      const result = await ReasonListService.saveReasonList(token!, updatedReason);

      if (result.success) {
        notifySuccess(`Reason status updated to ${checked ? "Active" : "Hidden"}`);
        setSwitchStatus((prevState) => ({
          ...prevState,
          [reason.arlID]: checked,
        }));
      } else {
        notifyError(`Error updating reason status: ${result.errorMessage}`);
        setSwitchStatus((prevState) => ({
          ...prevState,
          [reason.arlID]: !checked,
        }));
      }
    } catch (error) {
      notifyError("Error updating reason status.");
    }
  };

  const columns = [
    {
      key: "ReasonEdit",
      header: "Edit",
      visible: true,
      render: (row: ReasonListData) => (
        <CustomButton
          text="Edit"
          onClick={() => handleEditAndClose(row)}
          icon={EditIcon}
        />
      ),
    },
    { key: "serialNumber", header: "Sl.No", visible: true },
    { key: "arlCode", header: "Reason Code", visible: true },
    { key: "arlName", header: "Reason Description", visible: true },
    { key: "arlDuration", header: "Duration", visible: true },
    { key: "rlName", header: "Resource", visible: true }, 
    { key: "rNotes", header: "Instructions", visible: true }, 
    {
      key: "status",
      header: "Status",
      visible: true,
      render: (row: ReasonListData) => (
        <Typography variant="body2">
          {switchStatus[row.arlID] ? "Active" : "Hidden"}
        </Typography>
      ),
    },
    {
      key: "reasonStatus",
      header: "Reason Status",
      visible: true,
      render: (row: ReasonListData) => (
        <CustomSwitch
          size="medium"
          color="secondary"
          checked={switchStatus[row.arlID] || false}
          onChange={(event) => handleSwitchChange(row, event.target.checked)}
        />
      ),
    },
  ];

  const dataWithIndex = searchResults.map((item, index) => ({
    ...item,
    serialNumber: index + 1,
    Status: item.rActiveYN === "Y" ? "Active" : "Hidden",
    rlName: item.rlName,
    rNotes: item.rNotes,
  }));

  console.log("Data with index:", dataWithIndex); //

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
          <Typography variant="h6" id="reason-list-header">
            REASON SEARCH LIST
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
                placeholder="Enter reason name or code"
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

export default ReasonListSearch;
