import React, { useState, useEffect, useCallback, ChangeEvent } from "react";
import { Grid, Box, Paper, Typography, IconButton } from "@mui/material";
import CustomButton from "@/components/Button/CustomButton";
import FloatingLabelTextBox from "@/components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { investigationlistService } from "@/services/Laboratory/LaboratoryService";
import { showAlert } from "@/utils/Common/showAlert";
import CloseIcon from "@mui/icons-material/Close";

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

  const updateInvestigationOrder = (updatedList: any[]) => {
    const ordered = updatedList.map((inv, index) => ({
      ...inv,
      order: index + 1,
    }));
    setOrderedInvestigations(ordered);
  };

  const handleDragStart = (event: React.DragEvent, index: number) => {
    event.dataTransfer.setData("drag-item-index", index.toString());
  };

  const handleDrop = (event: React.DragEvent, dropIndex: number) => {
    const draggedIndex = Number(event.dataTransfer.getData("drag-item-index"));
    if (draggedIndex === dropIndex) return;
    const updated = [...orderedInvestigations];
    const [draggedItem] = updated.splice(draggedIndex, 1);
    updated.splice(dropIndex, 0, draggedItem);
    updateInvestigationOrder(updated);
  };

  const moveInvestigation = (index: number, direction: "up" | "down") => {
    setOrderedInvestigations((prev) => {
      const newOrder = [...prev];
      if (direction === "up" && index > 0) {
        [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      } else if (direction === "down" && index < newOrder.length - 1) {
        [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
      }
      updateInvestigationOrder(newOrder);
      return newOrder;
    });
  };

  const moveToTop = () => {
    if (selectedInvestigationId === null) return;
    setOrderedInvestigations((prev) => {
      const item = prev.find((inv) => inv.lInvMastDto?.invID === selectedInvestigationId);
      if (!item) return prev;
      const rest = prev.filter((inv) => inv.lInvMastDto?.invID !== selectedInvestigationId);
      const newOrder = [item, ...rest];
      updateInvestigationOrder(newOrder);
      return newOrder;
    });
  };

  const moveToBottom = () => {
    if (selectedInvestigationId === null) return;
    setOrderedInvestigations((prev) => {
      const item = prev.find((inv) => inv.lInvMastDto?.invID === selectedInvestigationId);
      if (!item) return prev;
      const rest = prev.filter((inv) => inv.lInvMastDto?.invID !== selectedInvestigationId);
      const newOrder = [...rest, item];
      updateInvestigationOrder(newOrder);
      return newOrder;
    });
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
        updated.splice(newPos - 1, 0, item);
        item.lInvMastDto.invID = newPos;
        updateInvestigationOrder(updated);
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

  const renderDraggableList = () => (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          fontWeight: "bold",
          backgroundColor: "#1976D2",
          color: "#FFFFFF",
          p: "8px 16px",
          mb: 1,
          borderRadius: 2,
        }}
      >
        <Typography sx={{ width: 140 }}>Print Order</Typography>
        <Typography sx={{ flex: 1 }}>Investigation Name</Typography>
        <Typography sx={{ width: 100, textAlign: "center" }}>Actions</Typography>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          maxHeight: "40vh",
          overflowY: "auto",
          p: 2,
          borderRadius: 2,
          backgroundColor: "#FFFFFF",
          borderColor: "#ECEFF1",
        }}
      >
        {orderedInvestigations.length > 0 ? (
          orderedInvestigations.map((inv, index) => (
            <Box
              key={inv.lInvMastDto?.invID}
              draggable
              onClick={() => {
                setSelectedInvestigationId(inv.lInvMastDto?.invID || null);
                handleOpenMoveDialog(inv);
              }}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, index)}
              sx={{
                display: "flex",
                alignItems: "center",
                p: "10px 16px",
                borderRadius: 2,
                mb: 1.5,
                cursor: "move",
                backgroundColor: selectedInvestigationId === inv.lInvMastDto?.invID ? "#E3F2FD" : index % 2 === 0 ? "#F7FAFC" : "#FFFFFF",
                boxShadow: selectedInvestigationId === inv.lInvMastDto?.invID ? "0px 2px 8px rgba(33,150,243,0.2)" : "0px 1px 4px rgba(0,0,0,0.05)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
                },
              }}
            >
              <Box sx={{ width: 140, display: "flex", alignItems: "center" }}>
                <DragIndicatorIcon sx={{ color: "#90A4AE", mr: 1 }} />
                <Typography sx={{ fontWeight: 500, color: "#455A64" }}>{inv.lInvMastDto?.invID}</Typography>
              </Box>
              <Typography
                sx={{
                  flex: 1,
                  fontWeight: 500,
                  color: "#455A64",
                  fontSize: "0.95rem",
                }}
              >
                {inv.lInvMastDto?.invName || "Unnamed Investigation"}
              </Typography>
              <Box
                sx={{
                  width: 100,
                  display: "flex",
                  justifyContent: "center",
                  gap: 0.5,
                }}
              >
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveInvestigation(index, "up");
                  }}
                  disabled={index === 0}
                  sx={{ p: 0.5 }}
                >
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveInvestigation(index, "down");
                  }}
                  disabled={index === orderedInvestigations.length - 1}
                  sx={{ p: 0.5 }}
                >
                  <ArrowDownwardIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4, fontStyle: "italic" }}>
            No investigations available.
          </Typography>
        )}
      </Paper>
    </>
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
  const dialogActions = <CustomButton icon={CloseIcon} text="Close" color="secondary" onClick={handleClose} />;

  return (
    <>
      <GenericDialog
        open={show}
        onClose={handleClose}
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
