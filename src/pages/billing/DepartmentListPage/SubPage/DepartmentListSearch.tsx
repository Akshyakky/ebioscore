import { DepartmentDto } from "../../../../interfaces/Billing/DepartmentDto";
import CustomButton from "../../../../components/Button/CustomButton";
import { Edit } from "@mui/icons-material";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import CustomSwitch from "../../../../components/Checkbox/ColorSwitch";
import { Box } from "@mui/material";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
import Close from "@mui/icons-material/Close";
import { DepartmentListService } from "../../../../services/BillingServices/DepartmentListService";

interface DepartmentListSearchProps {
  open: boolean;
  onClose: () => void;
}

const DepartmentListSearch: React.FC<DepartmentListSearchProps> = ({
  open,
  onClose,
}) => {
  const [switchStatus, setSwitchStatus] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<DepartmentDto[]>([]);
  useEffect(() => {
    if (open) {
      fetchAllDepartments();
    }
  }, [open]);

  const fetchAllDepartments = async () => {
    const result = await DepartmentListService.getAllDepartments();
    if (result.success && result.data) {
      const initialSwitchStatus = result.data.reduce(
        (statusMap, item) => {
          statusMap[item.deptID] = item.rActiveYN === "Y";
          return statusMap;
        },
        {} as { [key: number]: boolean }
      );
      setSwitchStatus(initialSwitchStatus);
      setSearchResults(result.data);
    } else {
      setSearchResults([]);
    }
  };
  const handleEditAndClose = (departmentDto: DepartmentDto) => {
    onClose();
  };
  const handleSwitchChange = async (
    departmentDto: DepartmentDto,
    checked: boolean
  ) => {
    const result = await DepartmentListService.updateDepartmentActiveStatus(
      departmentDto.deptID,
      checked
    );
    if (result.success) {
      setSwitchStatus((prev) => ({ ...prev, [departmentDto.deptID]: checked }));
    }
  };

  const dataWithIndex = searchResults.map((item, index) => ({
    ...item,
    serialNumber: index + 1,
    Status: switchStatus[item.deptID] ? "Active" : "Hidden",
  }));

  const columns = [
    {
      key: "DeptartmentEdit",
      header: "Edit",
      visible: true,
      render: (row: DepartmentDto) => (
        <CustomButton
          text="Edit"
          onClick={() => handleEditAndClose(row)}
          icon={Edit}
        />
      ),
    },
    { key: "serialNumber", header: "Sl No", visible: true },
    { key: "deptCode", header: "Department Code", visible: true },
    { key: "deptName", header: "Department Name", visible: true },
    { key: "deptType", header: "Department Type", visible: true },
    { key: "rNotes", header: "Remarks", visible: true },
    {
      key: "status",
      header: "Status",
      visible: true,
      render: (row: DepartmentDto) => (
        <Typography variant="body2">
          {switchStatus[row.deptID] ? "Active" : "Hidden"}
        </Typography>
      ),
    },
    {
      key: "DeptStatus",
      header: "Action",
      visible: true,
      render: (row: DepartmentDto) => (
        <CustomSwitch
          size="medium"
          color="secondary"
          checked={switchStatus[row.deptID]}
          onChange={(event) => handleSwitchChange(row, event.target.checked)}
        />
      ),
    },
  ];
  const handleDialogClose = () => {
    setSearchTerm("");
    onClose();
  };

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
            DEPARTMENT LIST
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
                placeholder="Enter department name or code"
                size="small"
                autoComplete="off"
              />
            </Grid>
          </Grid>
        </Box>
        <CustomGrid
          columns={columns}
          data={dataWithIndex}
          searchTerm={searchTerm}
        />
      </DialogContent>
      <DialogActions>
        <CustomButton
          variant="contained"
          text="Close"
          icon={Close}
          size="medium"
          onClick={handleDialogClose}
          color="secondary"
        />
      </DialogActions>
    </Dialog>
  );
};
export default DepartmentListSearch;
