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
import CustomButton from "../../../../components/Button/CustomButton";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import CustomSwitch from "../../../../components/Checkbox/ColorSwitch";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
import EditIcon from "@mui/icons-material/Edit";
import { ReasonListService } from "../../../../services/FrontOfficeServices/ReasonListServices/ReasonListService";
import { ReasonListData } from "../../../../interfaces/frontOffice/ReasonListData";

interface ReasonListSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (PIC: ReasonListData) => void;
}

const ReasonListSearch:React.FC<ReasonListSearchProps> = ({ open, onClose, onSelect }) => {

  const [switchStatus, setSwitchStatus] = useState<{ [key: number]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ReasonListData[]>([]);


  useEffect(() => {
    if (open) {
      fetchAllReasonList();
    }
  }, [open]);

  const fetchAllReasonList = async () => {
    const result = await ReasonListService.getAllReasonLists();
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

  const handleEditAndClose = (reason: ReasonListData) => {
    onClose();
    onSelect(reason);
  };

  const handleSwitchChange = async (reason: ReasonListData, checked: boolean,) => {

    const result = await ReasonListService.updateReasonActiveStatus(reason.arlID, checked);
    if (result.success) {
      setSwitchStatus((prev) => ({ ...prev, [reason.arlID]: checked }));
    }
  };

  const dataWithIndex = searchResults.map((item, index) => ({
    ...item,
    serialNumber: index + 1,
    Status: item.rActiveYN === "Y" ? "Active" : "Hidden",
  }));



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
                onChange={handleSearchInputChange}
                placeholder="Enter reason name or code"
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

export default ReasonListSearch;
