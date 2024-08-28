import React, { useCallback, useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  Box,
  FormControlLabel,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import { debounce } from "../../../../utils/Common/debounceUtils";
import {
  notifyError,
  notifySuccess,
} from "../../../../utils/Common/toastManager";
import CustomButton from "../../../../components/Button/CustomButton";
import CustomSwitch from "../../../../components/Checkbox/ColorSwitch";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import GlobalSpinner from "../../../../components/GlobalSpinner/GlobalSpinner";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
import EditIcon from "@mui/icons-material/Edit";
import SuspendForm from "./SuspendForm";
import { BreakConDetailData } from "../../../../interfaces/frontOffice/BreakConDetailsData";
import RefreshIcon from "@mui/icons-material/Refresh";
import { BreakConSuspendService } from "../../../../services/FrontOfficeServices/BreakConSuspendService";
import { BreakListConDetailsService } from "../../../../services/FrontOfficeServices/BreakListServices/BreakListConDetailService";
import { BreakListData } from "../../../../interfaces/frontOffice/BreakListData";

interface BreakListSearchProps {
  show: boolean;
  handleClose: () => void;
  onEditBreak: (row: BreakConDetailData) => Promise<void>;
  selectedBreak: BreakListData | null;
  token: string;
}

const BreakListSearch: React.FC<BreakListSearchProps> = ({
  show,
  handleClose,
  onEditBreak,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<BreakConDetailData[]>([]);
  const [switchStatus, setSwitchStatus] = useState<{ [key: number]: boolean }>({});
  const { token } = useSelector((state: RootState) => state.userDetails);
  const [suspendStatus, setSuspendStatus] = useState<{ [key: number]: boolean }>({});

  const [selectedBreak, setSelectedBreak] = useState<BreakConDetailData | null>(
    null
  );
  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const [showResumeButton, setShowResumeButton] = useState(false);

  const [selectedBreakForSuspend, setSelectedBreakForSuspend] =
    useState<BreakConDetailData | null>(null);

  const fetchBreakConDetails = async () => {
    setIsLoading(true);
    try {
      const result = await BreakListConDetailsService.getAllBreakConDetails(token!);
      if (result.success && result.data) {
        const updatedSearchResults = result.data.map((item) => ({
          ...item,
          recordStatus: item.rActiveYN === "Y" ? "Active" : "Hidden",
        }));

        setSearchResults(updatedSearchResults);

        // Initialize switchStatus based on rActiveYN
        const initialSwitchStatus = result.data.reduce((acc, item) => {
          acc[item.bCDID] = item.rActiveYN === "Y";
          return acc;
        }, {} as { [key: number]: boolean });

        setSwitchStatus(initialSwitchStatus);

        // Initialize suspendStatus if necessary
        const initialSuspendStatus = result.data.reduce((acc, item) => {
          acc[item.bCDID] = item.suspendStatus === "Suspended";
          return acc;
        }, {} as { [key: number]: boolean });

        setSuspendStatus(initialSuspendStatus);
      } else {
        notifyError("Failed to fetch break connection details.");
      }
    } catch (error) {
      notifyError("Error fetching break connection details.");
    } finally {
      setIsLoading(false);
    }
  };


  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      setIsLoading(true);
      BreakListConDetailsService.getAllBreakConDetails(token!)
        .then((result) => {
          if (result.success && result.data) {
            const filteredResults = result.data.filter((breakList) =>
              breakList.breakName.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setSearchResults(filteredResults);
          } else {
            setSearchResults([]);
          }
        })
        .catch(() => {
          setSearchResults([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 300),
    [token]
  );

  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    }
  }, [searchTerm, debouncedSearch]);

  useEffect(() => {
    if (show) {
      fetchBreakConDetails();
    }
  }, [show]);

  const handleEditAndClose = async (row: BreakConDetailData) => {
    try {
      const result = await BreakListConDetailsService.getBreakConDetailById(token!, row.blID);
      if (result.success && result.data) {
        onEditBreak(row);
        handleClose();
      } else {
        notifyError(result.errorMessage || "No break connection details found.");
      }
    } catch {
      notifyError("Error fetching break connection details.");
    }
  };

  useEffect(() => {
    if (selectedBreak) {
    }
  }, [selectedBreak]);

const handleSwitchChange = async (row: BreakConDetailData, checked: boolean) => {
  try {
    debugger 
    // Ensure bCDID is defined
    if (!row.bCDID) {
      console.error("BreakConDetail bCDID is undefined or null.");
      return;
    }

    // Call the API to update the break condition status with boolean value
    const result = await BreakListConDetailsService.updateBreakConDetailActiveStatus(token!, row.bCDID, checked);

    if (result.success) {
      notifySuccess(`Break condition status updated to ${checked ? "Active" : "Hidden"}`);
      
      // Update search results and switch status
      setSearchResults((prevResults) =>
        prevResults.map((item) =>
          item.bCDID === row.bCDID
            ? {
                ...item,
                recordStatus: checked ? "Active" : "Hidden", // Update recordStatus
                rActiveYN: checked ? "Y" : "N", // Update rActiveYN
              }
            : item
        )
      );
     

      setSwitchStatus((prevState) => ({
        ...prevState,
        [row.bCDID]: checked, // Keep track of switch state
      }));
      console.log("The Record status is ", row.recordStatus)
    } else {
      notifyError(`Error updating break condition status: ${result.errorMessage}`);
      setSwitchStatus((prevState) => ({
        ...prevState,
        [row.bCDID]: !checked, // Revert to previous state
      }));
    }
  } catch (error) {
    notifyError("Error updating break condition status.");
    console.error("Error:", error);
   
  }
};

  




  const handleSuspendChange = async (row: BreakConDetailData, checked: boolean) => {
    if (checked) {
      setSelectedBreak(row);
      setShowSuspendForm(true);
    } else {
      try {
        const result = await BreakConSuspendService.updateBreakConSuspendActiveStatus(token!, row.bCDID, false);
        if (result.success) {
          setSuspendStatus((prevState) => ({
            ...prevState,
            [row.bCDID]: false,
          }));
        } else {
          notifyError("Error updating suspend status.");
        }
      } catch {
        notifyError("Error updating suspend status.");
      }
    }
  };

  const handleSuspendSuccess = () => {
    if (selectedBreakForSuspend) {
      setSuspendStatus((prevState) => ({
        ...prevState,
        [selectedBreakForSuspend.bCDID]: true,
      }));
    }
    setShowResumeButton(true);
  };

  const handleSuspendFormClose = () => {
    setShowSuspendForm(false);
  };

  const handleResume = async () => {
    if (selectedBreakForSuspend) {
      setIsLoading(true);
      try {
        const response = await BreakConSuspendService.updateBreakConSuspendActiveStatus(token!, selectedBreakForSuspend.bCDID, false);
        if (response.success) {
          notifySuccess("Break resumed successfully.");
          setSwitchStatus((prevState) => ({
            ...prevState,
            [selectedBreakForSuspend.bCDID]: false,
          }));
          setShowResumeButton(false);
        } else {
          notifyError("Error resuming break.");
        }
      } catch {
        notifyError("Error resuming break.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDialogClose = () => {
    debugger
    setSearchTerm("");
    handleClose();
  };

  
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setSearchTerm(searchTerm.trim());
    }
  };

  const dataWithIndex = searchResults.map((item, index) => ({
    ...item,
    serialNumber: index + 1,
    Status: item.rActiveYN === "Y" ? "Active" : "Hidden",
  }));

  const columns = [
    {
      key: "BreakEdit",
      header: "Edit",
      visible: true,
      render: (row: BreakConDetailData) => (
        <CustomButton
          text="Edit"
          onClick={() => handleEditAndClose(row)}
          icon={EditIcon}
        />
      ),
    },
    { key: "serialNumber", header: "S.No", visible: true },
    { key: "breakName", header: "Break Name", visible: true },
    {
      key: "status",
      header: "Status",
      visible: true,
      render: (row: BreakConDetailData) => (
        <Typography variant="body2">
          {switchStatus[row.bCDID] ? "Active" : "Hidden"}
        </Typography>
      ),
    },
    {
      key: "recordStatus",
      header: "Record Status",
      visible: true,
      render: (row: BreakConDetailData) => (
        <CustomSwitch
          size="medium"
          color="secondary"
          checked={switchStatus[row.bCDID] || false}
          onChange={(event) => handleSwitchChange(row, event.target.checked)}
        />
      ),
    },
    {
      key: "suspendStatus",
      header: "Suspend",
      visible: true,
      render: (row: BreakConDetailData) => (
        <FormControlLabel
          control={
            <CustomSwitch
              size="medium"
              color="secondary"
              checked={suspendStatus[row.bCDID] || false}
              onChange={(event) =>
                handleSuspendChange(row, event.target.checked)
              }
            />
          }
          label={suspendStatus[row.bCDID] ? "Suspended" : "Not Suspended"}
        />
      ),
    },
  ];

  return (
    <Dialog
      open={show}
      onClose={(reason) => {
        if (reason !== "backdropClick" && reason !== "escapeKeyDown") {

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
                placeholder="Enter break name"
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

        {showResumeButton && (
          <CustomButton
            text="Resume"
            icon={RefreshIcon}
            onClick={handleResume}
            color="primary"
          />
        )}
      </DialogActions>

      {showSuspendForm && (
        <Dialog
          open={showSuspendForm}
          onClose={handleSuspendFormClose}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Suspend Break</DialogTitle>
          <DialogContent>
            <SuspendForm
              open={showSuspendForm}
              onClose={handleSuspendFormClose}
              selectedBreakId={selectedBreak}
              onSuspendSuccess={handleSuspendSuccess}
              token={token || ""}
            />
          </DialogContent>
        </Dialog>
      )}


    </Dialog>
  );
};

export default BreakListSearch;
