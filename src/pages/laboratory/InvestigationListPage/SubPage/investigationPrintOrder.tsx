import React, { useState, useEffect, useCallback, ChangeEvent } from "react";
import { Grid, Box } from "@mui/material";
import CustomButton from "@/components/Button/CustomButton";
import FloatingLabelTextBox from "@/components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { investigationlistService } from "@/services/Laboratory/LaboratoryService";
import { showAlert } from "@/utils/Common/showAlert";
import CloseIcon from "@mui/icons-material/Close";
import SpecialGrid from "@/components/SpecialGrid/SpecialGrid";

interface InvestigationPrintOrderProps {
  show: boolean;
  handleClose: () => void;
  onSelectInvestigation: (data: { invID: number; invName?: string }) => void;
}

const InvestigationPrintOrder: React.FC<InvestigationPrintOrderProps> = ({ show, handleClose }) => {
  const [investigations, setInvestigations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredInvestigations, setFilteredInvestigations] = useState<any[]>([]);
  const [orderedInvestigations, setOrderedInvestigations] = useState<any[]>([]);
  const [selectedInvestigationId, setSelectedInvestigationId] = useState<number | null>(null);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [movePosition, setMovePosition] = useState<string>("");
  const [moveItem, setMoveItem] = useState<any>(null);

  const fetchInvestigations = useCallback(async () => {
    try {
      const result = await investigationlistService.getAll();
      if (result.success && result.data) {
        setInvestigations(result.data);
      } else {
        showAlert("Error", "Failed to fetch investigations", "error");
      }
    } catch (error) {
      showAlert("Error", "Error fetching investigations", "error");
    }
  }, []);

  useEffect(() => {
    if (show) {
      fetchInvestigations();
    }
  }, [show, fetchInvestigations]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredInvestigations(investigations);
    } else {
      const lowerTerm = searchTerm.toLowerCase().trim();
      const filtered = investigations.filter((inv) => {
        const invName = inv.lInvMastDto?.invName || "";
        const invID = String(inv.lInvMastDto?.invID || "");
        return invName.toLowerCase().includes(lowerTerm) || invID.toLowerCase().includes(lowerTerm);
      });
      setFilteredInvestigations(filtered);
    }
  }, [searchTerm, investigations]);

  useEffect(() => {
    const ordered = filteredInvestigations.map((inv, index) => ({
      ...inv,
      order: index + 1,
    }));
    setOrderedInvestigations(ordered);
  }, [filteredInvestigations]);

  // Clear search term when dialog is closed
  useEffect(() => {
    if (!show) {
      setSearchTerm("");
    }
  }, [show]);

  const updateInvestigationOrder = (updatedList: any[]) => {
    const ordered = updatedList.map((inv, index) => ({
      ...inv,
      order: index + 1,
    }));
    setOrderedInvestigations(ordered);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const selectedInvestigation = orderedInvestigations.find((inv) => inv.lInvMastDto?.invID === selectedInvestigationId);
  const handleOpenMoveDialog = (inv: any) => {
    setMoveItem(inv);
    setMovePosition(String(inv.order));
    setMoveDialogOpen(true);
  };

  const handleCloseMoveDialog = () => {
    setMoveDialogOpen(false);
    setMoveItem(null);
    setMovePosition("");
  };

  const handleMovePositionChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMovePosition(e.target.value);
  };

  const handleMoveSubmit = () => {
    if (!moveItem) return;
    const newPos = parseInt(movePosition, 10);
    if (isNaN(newPos) || newPos < 1 || newPos > orderedInvestigations.length) {
      showAlert("Warning", `Please enter a valid position between 1 and ${orderedInvestigations.length}`, "warning");
      return;
    }
    showAlert("Confirm", `Are you sure you want to move this item to position ${newPos}?`, "warning", {
      showCancelButton: true,
      confirmButtonText: "Yes, Move",
      cancelButtonText: "No, Cancel",
      onConfirm: () => {
        const updated = [...orderedInvestigations];
        const oldIndex = updated.findIndex((inv) => inv.lInvMastDto?.invID === moveItem.lInvMastDto?.invID);
        if (oldIndex === -1) return;

        const [item] = updated.splice(oldIndex, 1);
        updated.splice(newPos - 1, 0, item); // insert at new position
        updateInvestigationOrder(updated); // updates the internal order field, not the ID

        showAlert("Success", `Moved to position ${newPos}`, "success");
        handleCloseMoveDialog();
      },
    });
  };

  const handleMoveTop = () => {
    if (!moveItem) return;
    const updated = [...orderedInvestigations];
    const oldIndex = updated.findIndex((inv) => inv.lInvMastDto?.invID === moveItem.lInvMastDto?.invID);
    if (oldIndex === -1) return;

    const [item] = updated.splice(oldIndex, 1);
    updated.unshift(item);
    updateInvestigationOrder(updated);
    handleCloseMoveDialog();
  };

  const handleMoveBottom = () => {
    if (!moveItem) return;
    const updated = [...orderedInvestigations];
    const oldIndex = updated.findIndex((inv) => inv.lInvMastDto?.invID === moveItem.lInvMastDto?.invID);
    if (oldIndex === -1) return;

    const [item] = updated.splice(oldIndex, 1);
    updated.push(item);
    updateInvestigationOrder(updated);
    handleCloseMoveDialog();
  };

  // Custom close handler that clears the search term
  const handleDialogClose = () => {
    setSearchTerm(""); // Clear search term
    handleClose(); // Call the original handleClose from props
  };

  const renderDraggableList = () => (
    <SpecialGrid
      data={orderedInvestigations}
      onReorder={(newList) => setOrderedInvestigations(newList)}
      getItemId={(item) => item.lInvMastDto?.invID}
      renderLabel={(item) => item.lInvMastDto?.invName || "Unnamed Investigation"}
      selectedId={selectedInvestigationId}
      onSelect={(id: any, e: any) => {
        if (e?.target?.closest(".arrow-button")) return;

        const selected = orderedInvestigations.find((inv) => inv.lInvMastDto?.invID === id);
        if (selected) {
          setSelectedInvestigationId(id);
          handleOpenMoveDialog(selected);
        }
      }}
    />
  );

  const dialogContent = (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={4}>
          <FloatingLabelTextBox
            title="Search Investigations"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by investigation name or ID"
            size="small"
            ControlID="investigation-search"
          />
        </Grid>
      </Grid>
      {renderDraggableList()}
    </Box>
  );
  const dialogActions = <CustomButton icon={CloseIcon} text="Close" color="secondary" onClick={handleDialogClose} />;

  return (
    <>
      <GenericDialog
        open={show}
        onClose={handleDialogClose}
        title="Saved Investigations"
        maxWidth="lg"
        fullWidth
        dialogContentSx={{
          minHeight: "500px",
          maxHeight: "500px",
          overflowY: "auto",
        }}
        actions={dialogActions}
      >
        {dialogContent}
      </GenericDialog>
      {moveItem && (
        <GenericDialog
          open={moveDialogOpen}
          onClose={handleCloseMoveDialog}
          title={`Move ${moveItem.lInvMastDto?.invName || "Unnamed Investigation"} from position ${moveItem.order} to:`}
          maxWidth="sm"
          fullWidth={true}
          actions={
            <>
              <CustomButton variant="outlined" color="inherit" onClick={handleCloseMoveDialog}>
                Cancel
              </CustomButton>
              <CustomButton variant="contained" color="primary" onClick={handleMoveSubmit}>
                Move
              </CustomButton>
              <CustomButton variant="contained" color="primary" onClick={handleMoveTop}>
                Top
              </CustomButton>
              <CustomButton variant="contained" color="primary" onClick={handleMoveBottom}>
                Bottom
              </CustomButton>
            </>
          }
        >
          <FloatingLabelTextBox
            title={`Position between 1 and ${orderedInvestigations.length}`}
            value={movePosition}
            onChange={handleMovePositionChange}
            placeholder="Enter new position"
            size="small"
            ControlID="move-position"
          />
        </GenericDialog>
      )}
    </>
  );
};

export default InvestigationPrintOrder;
