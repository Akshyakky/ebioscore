import React, { useCallback, useContext, useEffect, useState } from "react";
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
import { BreakListData } from "../../../../interfaces/frontOffice/BreakListData";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import { debounce } from "../../../../utils/Common/debounceUtils";
import { notifyError, notifySuccess } from "../../../../utils/Common/toastManager";
import CustomButton from "../../../../components/Button/CustomButton";
import CustomSwitch from "../../../../components/Checkbox/ColorSwitch";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import GlobalSpinner from "../../../../components/GlobalSpinner/GlobalSpinner";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
import EditIcon from "@mui/icons-material/Edit";
import { BreakListService } from "../../../../services/FrontOfficeServices/BreakListService";
import { BreakListConDetailsService } from "../../../../services/FrontOfficeServices/BreakListConDetailService";
import { ResourceListService } from "../../../../services/FrontOfficeServices/ResourceListServices";
import { ContactMastService } from "../../../../services/CommonServices/ContactMastService";
import { ResourceListData } from "../../../../interfaces/frontOffice/ResourceListData";
import { BreakConDetailData } from "../../../../interfaces/frontOffice/BreakConDetailsData";
import { PhysicianValue } from "../../../../interfaces/Common/DropdownOption";

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
  selectedBreak,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<BreakListData[]>([]);
  const [switchStatus, setSwitchStatus] = useState<{ [key: number]: boolean }>({});
  const { token } = useSelector((state: RootState) => state.userDetails);
  const [breakListData, setBreakListData] = useState<BreakListData | null>(null);


 
  const fetchBreakConDetails = async () => {
    setIsLoading(true);
    try {
      const result = await BreakListConDetailsService.getAllBreakConDetails(token!);
      if (result.success && result.data) {
        setSearchResults(result.data);
        const initialSwitchStatus = result.data.reduce((acc, item) => {
          acc[item.bLID] = item.rActiveYN === "Y";
          return acc;
        }, {} as { [key: number]: boolean });
        setSwitchStatus(initialSwitchStatus);
      } else {
        console.error("Failed to fetch break connection details.");
      }
    } catch (error) {
      console.error("Error fetching break connection details:", error);
      notifyError("Error fetching break connection details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      fetchBreakConDetails();
    }
  }, [show]);

  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    }
  }, [searchTerm]);

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      setIsLoading(true);
      BreakListConDetailsService.getAllBreakConDetails(token!)
        .then(result => {
          if (result.success && result.data) {
            const filteredResults = result.data.filter(breakList =>
              breakList.breakName.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setSearchResults(filteredResults);
          } else {
            console.error("Failed to fetch search results.");
            setSearchResults([]);
          }
        })
        .catch(error => {
          console.error("Error fetching search results:", error);
          setSearchResults([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 300),
    [token]
  );

  const handleEditAndClose = async (resource: BreakListData) => {
    try {
      const result = await BreakListService.getBreakListById(token!, resource.bLID);
      if (result.success && result.data) {
        onEditBreak(result.data);
      } else {
        notifyError(result.errorMessage || "Error fetching break list details.");
      }
      handleClose();
    } catch (error) {
      console.error("Error fetching break list details:", error);
      notifyError("Error fetching break list details.");
    }
  };

  const handleSwitchChange = async (resource: BreakConDetailData, checked: boolean) => {
    debugger 
    try {
      if (!resource.blID) {
        console.error("BreakListData bLID is undefined or null.");
        return;
      }
  
      // Call the API to update the break condition detail active status
      const result = await BreakListConDetailsService.updateBreakConDetailActiveStatus(
        token!,
        resource.blID,
        checked
      );
  
      if (result.success) {
        // Update local switch status
        setSwitchStatus(prevState => ({
          ...prevState,
          [resource.blID]: checked,
        }));
  
        // Notify success
        notifySuccess(`Break status updated to ${checked ? "Active" : "Hidden"}`);
      } else {
        // Notify error and revert switch status if update fails
        notifyError(result.errorMessage || "Error updating break status.");
        setSwitchStatus(prevState => ({
          ...prevState,
          [resource.blID]: !checked, // revert to previous state
        }));
      }
    } catch (error) {
      // Handle errors and revert switch status
      notifyError("Error updating break status.");
      console.error("Error:", error);
      setSwitchStatus(prevState => ({
        ...prevState,
        [resource.blID]: !checked, // revert to previous state
      }));
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
    { key: "breakName", header: "Break Name", visible: true },
    { key: "conResName", header: "Resource Name/Physician Name", visible: true },
    {
      key: "recordStatus",
      header: "Record Status",
      visible: true,
      render: (row: BreakConDetailData) => (
        <FormControlLabel
          control={
            <CustomSwitch
              size="medium"
              color="secondary"
              checked={switchStatus[row.blID] || false}
              onChange={(event) => handleSwitchChange(row, event.target.checked)}
            />
          }
          label={switchStatus[row.blID] ? "Active" : "Hidden"}
        />
      ),
    }
  ];

  const dataWithIndex = searchResults.map((item, index) => ({
    ...item,
    serialNumber: index + 1,
    Status: item.rActiveYN === "Y" ? "Active" : "Hidden",
  }));

  const handleDialogClose = () => {
    setSearchTerm("");
    handleClose();
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
      <DialogContent sx={{ minHeight: "600px", maxHeight: "600px", overflowY: "auto" }}>
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
              />
            </Grid>
          </Grid>
        </Box>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="500px">
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
