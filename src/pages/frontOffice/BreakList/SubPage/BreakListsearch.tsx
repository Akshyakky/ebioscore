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
import { BreakListData } from "../../../../interfaces/frontOffice/BreakListData";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import { debounce } from "../../../../utils/Common/debounceUtils";
import {
  notifyError,
} from "../../../../utils/Common/toastManager";
import CustomButton from "../../../../components/Button/CustomButton";
import CustomSwitch from "../../../../components/Checkbox/ColorSwitch";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import GlobalSpinner from "../../../../components/GlobalSpinner/GlobalSpinner";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
import EditIcon from "@mui/icons-material/Edit";
import { BreakListConDetailsService } from "../../../../services/FrontOfficeServices/BreakListConDetailService";
import { BreakConDetailData } from "../../../../interfaces/frontOffice/BreakConDetailsData"

interface BreakListSearchProps {
  show: boolean;
  handleClose: () => void;
  onEditBreak:(row: BreakConDetailData) => Promise<void>
  selectedBreak: BreakListData | null;
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

 
  const fetchBreakConDetails = async () => {
    debugger 
    setIsLoading(true);
    try {
      const result = await BreakListConDetailsService.getAllBreakConDetails(token!);
      if (result.success && result.data) {
        setSearchResults(result.data);
        const initialSwitchStatus = result.data.reduce((acc, item) => {
          acc[item.bCDID] = item.rActiveYN === "Y";
          return acc;
        }, {} as { [key: number]: boolean });
        console.log("Initial switch status:", initialSwitchStatus);
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
    if (searchTerm) {
      debouncedSearch(searchTerm);
    }
  }, [searchTerm]);

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      setIsLoading(true);
      BreakListConDetailsService.getAllBreakConDetails(token!)
        .then((result) => {
          if (result.success && result.data) {
            const filteredResults = result.data.filter((breakList) =>
              breakList.breakName
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
            );
            setSearchResults(filteredResults);
          } else {
            console.error("Failed to fetch search results.");
            setSearchResults([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching search results:", error);
          setSearchResults([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 300),
    [token]
  );

  useEffect(() => {
    if (show) {
      fetchBreakConDetails();
    }
  }, [show]);

  const handleEditAndClose = async (row: BreakConDetailData) => {
    debugger
    try {
      const result = await BreakListConDetailsService.getBreakConDetailById(token!, row.blID);

      if (result.success && result.data) {
        onEditBreak(row);  // Pass the selected row directly to the handleEdit function
        handleClose();
      } else {
        console.error("Error:", result.errorMessage || "No break connection details found.");
        notifyError(result.errorMessage || "Error fetching break connection details.");
      }
    } catch (error) {
      console.error("Error fetching break connection details:", error);
      notifyError("Error fetching break connection details.");
    }
  };
  
  
  
  

  const handleSwitchChange = async (
    row: BreakConDetailData,
    checked: boolean
  ) => {
    console.log("Switch changed for bCDID:", row.bCDID, "New status:", checked);
    
    try {
      const result = await BreakListConDetailsService.updateBreakConDetailActiveStatus(
        token!,
        row.bCDID,
        checked
      );
      
      console.log("Update result:", result);
      
      if (result.success) {
        setSwitchStatus((prevState) => ({
          ...prevState,
          [row.bCDID]: checked,
        }));
      } else {
        notifyError(result.errorMessage || "Error updating break condition status.");
        console.error("Error updating status:", result.errorMessage);
      }
    } catch (error) {
      notifyError("Error updating break condition status.");
      console.error("Error:", error);
    }
  };
  


  const handleSuspendChange=()=>{
console.log("the data ")
  }
 

  const dataWithIndex = searchResults.map((item, index) => ({
    ...item,
    serialNumber: index + 1,
    Status: item.rActiveYN === "Y" ? "Active" : "hidden",
  }));

  const handleDialogClose = () => {
    setSearchTerm("");
    handleClose();
  };

  useEffect(() => {
    if (show) {
      fetchBreakConDetails();
    }
  }, [show]);
  

  // const handleSuspendChange = async (
  //   row: BreakConDetailData,
  //   checked: boolean
  // ) => {
  //   try {
  //     // Replace with actual service method to update suspend status
  //     const result = await BreakListConDetailsService.updateBreakConDetailSuspendStatus(
  //       token!,
  //       row.bCDID,
  //       checked
  //     );
  //     if (result.success) {
  //       setSuspendStatus((prevState) => ({
  //         ...prevState,
  //         [row.bCDID]: checked,
  //       }));
  //     } else {
  //       setSuspendStatus((prevState) => ({
  //         ...prevState,
  //         [row.bCDID]: !checked,
  //       }));
  //       notifyError(result.errorMessage || "Error updating suspend status.");
  //     }
  //   } catch (error) {
  //     notifyError("Error updating suspend status.");
  //     setSuspendStatus((prevState) => ({
  //       ...prevState,
  //       [row.bCDID]: !checked,
  //     }));
  //   }
  // };

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
    { key: "serialNumber", header: "Sl.No", visible: true },
    { key: "breakName", header: "Break Name", visible: true },
    {
      key: "conResName",
      header: "Resource Name/Physician Name",
      visible: true,
    },
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
              checked={switchStatus[row.bCDID] || false}
              onChange={(event) =>
                handleSwitchChange(row, event.target.checked)
              }
            />
          }
          label={switchStatus[row.bCDID] ? "Active" : "Hidden"}
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
                handleSuspendChange()
              }
            />
          }
          label={suspendStatus[row.bCDID] ? "Suspended" : "Active"}
        />
      ),
    },
  ];



  return (
    <Dialog
      open={show}
      onClose={(reason) => {
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
                placeholder="Enter break name"
                size="small"
                autoComplete="off"
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
