import { BPayTypeDto } from "../../../../interfaces/Billing/BPayTypeDto";
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
import { PaymentTypesService } from "../../../../services/BillingServices/PaymentTypesService";

interface PaymentTypesSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (pay: BPayTypeDto) => void;
}

const PaymentTypesSearch: React.FC<PaymentTypesSearchProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const [switchStatus, setSwitchStatus] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<BPayTypeDto[]>([]);

  useEffect(() => {
    if (open) {
      fetchAllBPayTypes();
    }
  }, [open]);

  const fetchAllBPayTypes = async () => {
    const result = await PaymentTypesService.getAllBPayTypes();
    if (result.success && result.data) {
      const initialSwitchStatus = result.data.reduce(
        (statusMap, item) => {
          statusMap[item.payID] = item.rActiveYN === "Y";
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

  const handleEditAndClose = (pay: BPayTypeDto) => {
    onClose();
    onSelect(pay);
  };

  const handleSwitchChange = async (pay: BPayTypeDto, checked: boolean) => {
    const result = await PaymentTypesService.updateBPayTypeActiveStatus(
      pay.payID,
      checked
    );
    if (result.success) {
      setSwitchStatus((prev) => ({ ...prev, [pay.payID]: checked }));
    }
  };

  const dataWithIndex = searchResults.map((item, index) => ({
    ...item,
    serialNumber: index + 1,
    Status: switchStatus[item.payID] ? "Active" : "Hidden",
  }));

  const columns = [
    {
      key: "payEdit",
      header: "Edit",
      visible: true,
      render: (row: BPayTypeDto) => (
        <CustomButton
          text="Edit"
          onClick={() => handleEditAndClose(row)}
          icon={Edit}
        />
      ),
    },
    { key: "serialNumber", header: "Sl No", visible: true },
    { key: "payCode", header: "Payment Type Code", visible: true },
    { key: "payName", header: "Payment Type Name", visible: true },
    { key: "payMode", header: "Payment Mode", visible: true },
    { key: "rNotes", header: "Remarks", visible: true },
    {
      key: "status",
      header: "Status",
      visible: true,
      render: (row: BPayTypeDto) => (
        <Typography variant="body2">
          {switchStatus[row.payID] ? "Active" : "Hidden"}
        </Typography>
      ),
    },
    {
      key: "payStatus",
      header: "Action",
      visible: true,
      render: (row: BPayTypeDto) => (
        <CustomSwitch
          size="medium"
          color="secondary"
          checked={switchStatus[row.payID]} // Use switchStatus only
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
            Payment Type CODE LIST
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
                placeholder="Enter Payment name or code"
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

export default PaymentTypesSearch;
