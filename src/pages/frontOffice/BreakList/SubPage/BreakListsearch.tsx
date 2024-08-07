

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
import { debounce } from "../../../../utils/Common/debounceUtils";
import { BreakListService } from "../../../../services/FrontOfficeServices/BreakListService";
import { ContactMastService } from "../../../../services/CommonServices/ContactMastService";
import { ResourceListService } from "../../../../services/FrontOfficeServices/ResourceListServices";
import { BreakListData } from "../../../../interfaces/frontOffice/BreakListData";
import { ResourceListData } from "../../../../interfaces/frontOffice/ResourceListData";
import { BreakListConDetailsService } from "../../../../services/FrontOfficeServices/BreakListConDetailService";
import { BreakConDetailData } from "../../../../interfaces/frontOffice/BreakConDetailsData";
import { PhysicianValue } from "../../../../interfaces/Common/DropdownOption";

interface BreakListSearchProps {
  show: boolean;
  handleClose: () => void;
  onEditBreak: (breakList: BreakListData) => void;
  selectedBreak: BreakListData | null;
}

interface Physician {
  value: number;
  label: string;
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
  const [isPhyResYN,] = useState("Y"); 
  const [resources, setResources] = useState<{ [id: number]: string }>({});
  const [physicians, setPhysicians] = useState<{ [id: number]: string }>({});
  const [resourceList, setResourceList] = useState<ResourceListData[]>([]);
  const [breakListData, setBreakListData] = useState<BreakListData | null>(null);
  const [breakConDetails, setBreakConDetails] = useState<BreakConDetailData[]>([]);
  const [, setLoadingResources] = useState(false);
  const [, setLoadingPhysicians] = useState(false);
  const [physicianList, setPhysicianList] = useState<Physician[]>([]);

  // Fetch break list details when a break list is selected for editing
  useEffect(() => {
    if (selectedBreak) {
      console.log("Selected break:", selectedBreak);
      setBreakListData(selectedBreak);
    } else {
      console.error("Selected break is null or undefined.");
      setBreakListData(null); // Handle the null case
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
      fetchBreakConDetails();

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
      acc[item.bLID] = item.rActiveYN === "Y";
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
        rActiveYN: checked ? "Y" as const : "N" as const,
      };

      const result = await BreakListService.saveBreakList(token!, updatedBreakList);

      if (result.success) {
        notifySuccess(`Break list status updated to ${checked ? "Active" : "Hidden"}`);
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


  const fetchResources = async () => {
    setLoadingResources(true);
    try {
      const result = await ResourceListService.getAllResourceLists(token!);
      if (result.success) {
        setResourceList(result.data ?? []);
      } else {
        notifyError(result.errorMessage || "Failed to fetch resource list.");
      }
    } catch (error) {
      notifyError("An error occurred while fetching the resource list.");
    } finally {
      setLoadingResources(false);
    }
  };
  
  useEffect(() => {
    if (breakListData?.isPhyResYN === "Y") {
      fetchResources();
    }
  }, [breakListData?.isPhyResYN]);
  
  useEffect(() => {
    const fetchPhysicians = async () => {
      setLoadingPhysicians(true);
      try {
        const response = await ContactMastService.fetchAttendingPhysician(
          token!,
          "GetActiveConsultants",
          breakListData?.compID || 0
        );
        const physicianOptions = response.map((item: any) => ({
          value: item.value,
          label: item.label,
        }));
        setPhysicianList(physicianOptions);
      } catch (error) {
        console.error("Failed to fetch physicians:", error);
      } finally {
        setLoadingPhysicians(false);
      }
    };
  
    fetchPhysicians();
  }, [token, breakListData?.compID]);
  
  const fetchBreakConDetails = async () => {
    try {
      const result = await BreakListConDetailsService.getAllBreakConDetails(token!);
      if (result.success && result.data) {
        setBreakConDetails(result.data);
      } else {
        console.error("Failed to fetch break condition details.");
      }
    } catch (error) {
      console.error("Error fetching break condition details:", error);
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
    {
      key: "name",
      header: "Name",
      visible: true,
      render: (row: BreakListData) => {
        const detail = breakConDetails.find((detail) => detail.bLID === row.bLID);
  
        if (!detail) {
          return "N/A";
        }
  
        const resourceName = resources[detail.hPLID] || "N/A";
        const physicianName = physicianList.find((physician: Physician) => physician.value === detail.hPLID)?.label || "N/A";
  
        if (isPhyResYN === "Y") {
          return resourceName;
        } else if (isPhyResYN === "N") {
          return physicianName;
        }
  
        return "N/A";
      },
    },
    {
      key: "recordStatus",
      header: "Record Status",
      visible: true,
      render: (row: BreakListData) => (
        <Box display="flex" alignItems="center">
          <Typography variant="body2" sx={{ marginRight: 2 }}>
            {switchStatus[row.bLID] ? "Active" : "Hidden"}
          </Typography>
          <CustomSwitch
            size="medium"
            color="secondary"
            checked={switchStatus[row.bLID] || false}
            onChange={(event) => handleSwitchChange(row, event.target.checked)}
          />
        </Box>
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
      