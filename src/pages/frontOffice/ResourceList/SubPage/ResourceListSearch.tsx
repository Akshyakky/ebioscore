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
import { ResourceListData } from "../../../../interfaces/FrontOffice/ResourceListData";
import { ResourceListService } from "../../../../services/FrontOfficeServices/ResourceListServices/ResourceListServices";
import { debounce } from "../../../../utils/Common/debounceUtils";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
import EditIcon from "@mui/icons-material/Edit";
import { notifyError, notifySuccess } from "../../../../utils/Common/toastManager";

interface ResourceListSearchProps {
  show: boolean;
  handleClose: () => void;
  onEditProfile: (resource: ResourceListData) => void;
  selectedResource: ResourceListData | null;
}

const ResourceListSearch: React.FC<ResourceListSearchProps> = ({
  show,
  handleClose,
  onEditProfile,
  selectedResource,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<ResourceListData[]>([]);
  const { token } = useSelector((state: RootState) => state.userDetails);
  const [switchStatus, setSwitchStatus] = useState<{ [key: number]: boolean }>({});

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const result = await ResourceListService.getAllResourceLists(token!);
      if (result.success && result.data) {
        const filteredResults = result.data.filter(
          (resource) =>
            resource.rLName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.rLCode?.toLowerCase().includes(searchQuery.toLowerCase())
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
      performSearch(""); // Fetch all resources when the form is opened
    }
  }, [show]);

  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    } else if (show) {
      performSearch(""); // Fetch all resources when the search term is cleared
    }
  }, [searchTerm, debouncedSearch, show]);

  useEffect(() => {
    const initialSwitchStatus = searchResults.reduce((acc, item) => {
      acc[item.rLID] = item.rActiveYN === "Y";
      return acc;
    }, {} as { [key: number]: boolean });

    setSwitchStatus(initialSwitchStatus);
  }, [searchResults]);

  const handleEditAndClose = async (resource: ResourceListData) => {
    try {
      const result = await ResourceListService.getResourceById(token!, resource.rLID);
      if (result.success && result.data) {
        onEditProfile(result.data);
        handleClose();
      } else {
        notifyError(result.errorMessage || "Error fetching resource details.");
      }
    } catch (error) {
      console.error("Error fetching resource details:", error);
      notifyError("Error fetching resource details.");
    }
  };

  const handleSwitchChange = async (resource: ResourceListData, checked: boolean) => {
    try {
      if (!resource.rLID) {
        console.error("Resource rLID is undefined or null.");
        return;
      }

      const updatedResource = {
        ...resource,
        rActiveYN: checked ? "Y" : "N",
      };

      const result = await ResourceListService.saveResourceList(token!, updatedResource);

      if (result.success) {
        notifySuccess(`Resource status updated to ${checked ? "Active" : "Hidden"}`);
        setSwitchStatus((prevState) => ({
          ...prevState,
          [resource.rLID]: checked,
        }));
      } else {
        notifyError(`Error updating resource status: ${result.errorMessage}`);
        setSwitchStatus((prevState) => ({
          ...prevState,
          [resource.rLID]: !checked, // revert to previous state
        }));
      }
    } catch (error) {
      notifyError("Error updating resource status");
      console.error("Error:", error);
      setSwitchStatus((prevState) => ({
        ...prevState,
        [resource.rLID]: !checked, // revert to previous state
      }));
    }
  };

  const dataWithIndex = searchResults.map((item, index) => ({
    ...item,
    serialNumber: index + 1,
    Status: item.rActiveYN === "Y" ? "Active" : "Hidden",
  }));

  const columns = [
    {
      key: "ResourceEdit",
      header: "Edit",
      visible: true,
      render: (row: ResourceListData) => (
        <CustomButton
          text="Edit"
          onClick={() => handleEditAndClose(row)}
          icon={EditIcon}
        />
      ),
    },
    { key: "serialNumber", header: "Sl.No", visible: true },
    { key: "rLCode", header: "Resource Code", visible: true },
    { key: "rLName", header: "Resource Name", visible: true },
    { key: "rLOtYN", header: "Is Operation Theatre", visible: true },
    { key: "rLValidateYN", header: "Is Validate", visible: true },
    {
      key: "status",
      header: "Status",
      visible: true,
      render: (row: ResourceListData) => (
        <Typography variant="body2">
          {switchStatus[row.rLID] ? "Active" : "Hidden"}
        </Typography>
      ),
    },
    {
      key: "resourceStatus",
      header: "Resource Status",
      visible: true,
      render: (row: ResourceListData) => (
        <CustomSwitch
          size="medium"
          color="secondary"
          checked={switchStatus[row.rLID] || false}
          onChange={(event) => handleSwitchChange(row, event.target.checked)}
        />
      ),
    },
  ];

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
          <Typography variant="h6" id="resource-list-header">
            RESOURCE SEARCH LIST
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
                placeholder="Enter resource name or code"
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

export default ResourceListSearch;
