// src/pages/laboratory/InvestigationListPage/SubPage/InvestigationPrintOrder.tsx
import React, { useState, useEffect, useCallback, ChangeEvent } from "react";
import { Grid, Box, Paper, Chip, Typography, IconButton } from "@mui/material";
import CustomButton from "@/components/Button/CustomButton";
import FloatingLabelTextBox from "@/components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { investigationlistService } from "@/services/Laboratory/LaboratoryService";
import { showAlert } from "@/utils/Common/showAlert";
import CloseIcon from "@mui/icons-material/Close";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";

interface InvestigationPrintOrderProps {
  show: boolean;
  handleClose: () => void;
  onSelectInvestigation: (data: { invID: number; invName?: string }) => void;
}

const InvestigationPrintOrder: React.FC<InvestigationPrintOrderProps> = ({ show, handleClose, onSelectInvestigation }) => {
  const [investigations, setInvestigations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredInvestigations, setFilteredInvestigations] = useState<any[]>([]);
  const [orderedInvestigations, setOrderedInvestigations] = useState<any[]>([]);
  const [selectedInvestigationId, setSelectedInvestigationId] = useState<number | null>(null);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [movePosition, setMovePosition] = useState<string>("");
  const [moveSelectedItem, setMoveSelectedItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchInvestigations = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await investigationlistService.getAll();
      if (result.success && result.data) {
        setInvestigations(result.data);
      } else {
        showAlert("Error", "Failed to fetch investigations", "error");
      }
    } catch (error) {
      showAlert("Error", "Error fetching investigations", "error");
    } finally {
      setIsLoading(false);
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

  useEffect(() => {
    if (!show) {
      setSearchTerm("");
    }
  }, [show]);

  const handleMoveItem = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index > 0) {
      moveItem(index, index - 1);
    } else if (direction === "down" && index < orderedInvestigations.length - 1) {
      moveItem(index, index + 1);
    }
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    const updated = [...orderedInvestigations];
    const [item] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, item);

    // Update order property for all items
    const reordered = updated.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));

    setOrderedInvestigations(reordered);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleRowSelect = (item: any) => {
    setSelectedInvestigationId(item.lInvMastDto?.invID);
    setMoveSelectedItem(item);
  };

  const handleOpenMoveDialog = () => {
    if (!moveSelectedItem) return;
    setMovePosition(String(moveSelectedItem.order || ""));
    setMoveDialogOpen(true);
  };

  const handleCloseMoveDialog = () => {
    setMoveDialogOpen(false);
    setMovePosition("");
  };

  const handleMovePositionChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMovePosition(e.target.value);
  };

  const handleMoveSubmit = () => {
    if (!moveSelectedItem) return;
    const newPos = parseInt(movePosition, 10);
    if (isNaN(newPos) || newPos < 1 || newPos > orderedInvestigations.length) {
      showAlert("Warning", `Please enter a valid position between 1 and ${orderedInvestigations.length}`, "warning");
      return;
    }

    // Find current index of the item
    const currentIndex = orderedInvestigations.findIndex((inv) => inv.lInvMastDto?.invID === moveSelectedItem.lInvMastDto?.invID);

    if (currentIndex === -1) return;

    // Move item to new position (accounting for 0-based index)
    moveItem(currentIndex, newPos - 1);
    showAlert("Success", `Moved to position ${newPos}`, "success");
    handleCloseMoveDialog();
  };

  const handleMoveTop = () => {
    if (!moveSelectedItem) return;
    const currentIndex = orderedInvestigations.findIndex((inv) => inv.lInvMastDto?.invID === moveSelectedItem.lInvMastDto?.invID);
    if (currentIndex > 0) {
      moveItem(currentIndex, 0);
    }
    handleCloseMoveDialog();
  };

  const handleMoveBottom = () => {
    if (!moveSelectedItem) return;
    const currentIndex = orderedInvestigations.findIndex((inv) => inv.lInvMastDto?.invID === moveSelectedItem.lInvMastDto?.invID);
    if (currentIndex >= 0 && currentIndex < orderedInvestigations.length - 1) {
      moveItem(currentIndex, orderedInvestigations.length - 1);
    }
    handleCloseMoveDialog();
  };

  const handleDialogClose = () => {
    setSearchTerm("");
    handleClose();
  };

  // CustomGrid columns configuration
  const columns: Column<any>[] = [
    {
      key: "dragHandle",
      header: "",
      visible: true,
      width: 50,
      render: () => <DragIndicatorIcon sx={{ color: "text.secondary" }} />,
    },
    {
      key: "order",
      header: "#",
      visible: true,
      width: 60,
      render: (row) => row.order,
    },
    {
      key: "invName",
      header: "Investigation Name",
      visible: true,
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {row.lInvMastDto?.invName || "Unnamed Investigation"}
          {row.lInvMastDto?.invID === selectedInvestigationId && <Chip size="small" label="Selected" color="primary" />}
        </Box>
      ),
    },
    {
      key: "invCode",
      header: "Code",
      visible: true,
      width: 120,
      render: (row) => row.lInvMastDto?.invCode,
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      width: 120,
      render: (row, rowIndex) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            color="primary"
            disabled={rowIndex === 0}
            onClick={(e) => {
              e.stopPropagation();
              handleMoveItem(rowIndex, "up");
            }}
          >
            <ArrowUpwardIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="primary"
            disabled={rowIndex === orderedInvestigations.length - 1}
            onClick={(e) => {
              e.stopPropagation();
              handleMoveItem(rowIndex, "down");
            }}
          >
            <ArrowDownwardIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <>
      <GenericDialog
        open={show}
        onClose={handleDialogClose}
        title="Investigation Print Order"
        maxWidth="lg"
        fullWidth
        dialogContentSx={{
          minHeight: "500px",
          maxHeight: "700px",
          overflowY: "auto",
        }}
        actions={
          <>
            <CustomButton variant="outlined" color="primary" onClick={handleOpenMoveDialog} disabled={!selectedInvestigationId}>
              Move Selected
            </CustomButton>
            <CustomButton icon={CloseIcon} text="Close" color="secondary" onClick={handleDialogClose} />
          </>
        }
      >
        <Box>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ sm: 12, md: 6 }}>
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

          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <Typography>Loading investigations...</Typography>
            </Box>
          ) : (
            <Paper
              variant="outlined"
              sx={{
                "& .MuiTableRow-root": {
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                },
              }}
            >
              <CustomGrid
                columns={columns}
                data={orderedInvestigations}
                onRowClick={handleRowSelect}
                maxHeight="500px"
                emptyStateMessage={searchTerm ? "No investigations match your search" : "No investigations found"}
                customRowStyle={(item) => ({
                  backgroundColor: item.lInvMastDto?.invID === selectedInvestigationId ? "rgba(25, 118, 210, 0.08)" : undefined,
                  borderLeft: item.lInvMastDto?.invID === selectedInvestigationId ? "4px solid #1976d2" : "4px solid transparent",
                })}
              />
            </Paper>
          )}
        </Box>
      </GenericDialog>

      {moveSelectedItem && (
        <GenericDialog
          open={moveDialogOpen}
          onClose={handleCloseMoveDialog}
          title={`Move ${moveSelectedItem.lInvMastDto?.invName || "Unnamed Investigation"} from position ${moveSelectedItem.order} to:`}
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
            type="number"
            min={1}
            max={orderedInvestigations.length}
          />
        </GenericDialog>
      )}
    </>
  );
};

export default InvestigationPrintOrder;
