import React, { useState, useEffect } from "react";
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
import CustomButton from "../../../../components/Button/CustomButton";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import CustomSwitch from "../../../../components/Checkbox/ColorSwitch";
import { ResourceListData } from "../../../../interfaces/FrontOffice/ResourceListData";
import { ResourceListService } from "../../../../services/FrontOfficeServices/ResourceListServices/ResourceListServices";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
import EditIcon from "@mui/icons-material/Edit";

interface ResourceListSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (PIC: ResourceListData) => void;
}

const ResourceListSearch: React.FC<ResourceListSearchProps> = ({ open, onClose, onSelect }) => {
  const [switchStatus, setSwitchStatus] = useState<{ [key: number]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ResourceListData[]>([]);

  useEffect(() => {
    if (open) {
      fetchAllResourceList();
    }
  }, [open]);

  const fetchAllResourceList = async () => {
    const result = await ResourceListService.getAllResourceLists();
    if (result.success && result.data) {
      const initialSwitchStatus = result.data.reduce((statusMap, item) => {
        statusMap[item.rLID] = item.rActiveYN === "Y";
        return statusMap;
      }, {} as { [key: number]: boolean });
      setSwitchStatus(initialSwitchStatus);
      setSearchResults(result.data);
    } else {
      setSearchResults([]);
    }
  };

  const handleEditAndClose = (res: ResourceListData) => {
    onClose();
    onSelect(res);
  };

  const handleSwitchChange = async (res: ResourceListData, checked: boolean,) => {

    const result = await ResourceListService.updateResourceActiveStatus(res.rLID, checked);
    if (result.success) {
      setSwitchStatus((prev) => ({ ...prev, [res.rLID]: checked }));
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
          checked={switchStatus[row.rLID]}
          onChange={(event) => handleSwitchChange(row, event.target.checked)}
        />
      ),
    },
  ];

  const handleDialogClose = () => {
    setSearchTerm("");
    onClose();
  };

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <Dialog
      open={open}
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
                onChange={handleSearchInputChange}
                placeholder="Enter resource name or code"
                size="small"
                autoComplete="off"
              />
            </Grid>
          </Grid>
        </Box>
        <CustomGrid columns={columns} data={dataWithIndex} searchTerm={searchTerm} />
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
