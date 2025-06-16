import SmartButton from "@/components/Button/SmartButton";
import { LInvMastDto } from "@/interfaces/Laboratory/InvestigationListDto";
import { useAlert } from "@/providers/AlertProvider";
import { ArrowDownward, ArrowUpward, DragIndicator, Refresh as RefreshIcon, Save as SaveIcon } from "@mui/icons-material";
import { Box, Chip, Grid, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";

interface InvestigationPrintOrderProps {
  invMastList: LInvMastDto[];
  fetchInvMastList: () => void;
  saveInvMast: (investigation: LInvMastDto) => Promise<void>;
  isLoading: boolean;
}

const InvestigationPrintOrder: React.FC<InvestigationPrintOrderProps> = ({ invMastList, fetchInvMastList, saveInvMast, isLoading }) => {
  const { showAlert } = useAlert();
  const [orderedInvestigations, setOrderedInvestigations] = useState<LInvMastDto[]>([]);
  const [hasOrderChanges, setHasOrderChanges] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);
  const dragCounter = useRef(0);

  useEffect(() => {
    if (invMastList && invMastList.length > 0) {
      const sorted = [...invMastList].sort((a, b) => a.invPrintOrder - b.invPrintOrder);
      setOrderedInvestigations(sorted);
    }
  }, [invMastList]);

  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = "move";
    // Add a slight transparency to the dragged element
    if (e.currentTarget) {
      e.currentTarget.style.opacity = "0.5";
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLTableRowElement>) => {
    if (e.currentTarget) {
      e.currentTarget.style.opacity = "1";
    }
    setDraggedItem(null);
    setDragOverItem(null);
    dragCounter.current = 0;
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    e.preventDefault();
    dragCounter.current++;
    if (draggedItem !== null && draggedItem !== index) {
      setDragOverItem(index);
    }
  };

  const handleDragLeave = (_e: React.DragEvent<HTMLTableRowElement>) => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverItem(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLTableRowElement>, dropIndex: number) => {
    e.preventDefault();
    dragCounter.current = 0;

    if (draggedItem === null || draggedItem === dropIndex) {
      return;
    }

    const draggedItemContent = orderedInvestigations[draggedItem];
    const newList = [...orderedInvestigations];

    // Remove the dragged item
    newList.splice(draggedItem, 1);

    // Insert it at the new position
    const adjustedDropIndex = draggedItem < dropIndex ? dropIndex - 1 : dropIndex;
    newList.splice(adjustedDropIndex, 0, draggedItemContent);

    // Update print order for all items
    const updatedList = newList.map((item, idx) => ({
      ...item,
      invPrintOrder: idx + 1,
    }));

    setOrderedInvestigations(updatedList);
    setHasOrderChanges(true);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const moveInvestigation = (index: number, direction: "up" | "down") => {
    const newList = [...orderedInvestigations];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < newList.length) {
      [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];

      const updatedList = newList.map((item, idx) => ({
        ...item,
        invPrintOrder: idx + 1,
      }));

      setOrderedInvestigations(updatedList);
      setHasOrderChanges(true);
    }
  };

  const handleSavePrintOrder = async () => {
    try {
      const updatePromises = orderedInvestigations.map((investigation) => saveInvMast(investigation));

      await Promise.all(updatePromises);
      showAlert("Success", "Print order updated successfully", "success");
      setHasOrderChanges(false);
      fetchInvMastList();
    } catch (error) {
      console.error("Error saving print order:", error);
      showAlert("Error", "Failed to update print order", "error");
    }
  };

  const handleRefresh = () => {
    fetchInvMastList();
    setHasOrderChanges(false);
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h5" component="h1" gutterBottom>
              Investigation Print Order
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Drag and drop rows or use arrow buttons to reorder investigations for printing
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} display="flex" justifyContent="flex-end">
            <Stack direction="row" spacing={1}>
              <SmartButton text="Refresh" icon={RefreshIcon} onClick={handleRefresh} color="info" variant="outlined" size="small" disabled={isLoading} />
              <SmartButton text="Save Order" icon={SaveIcon} onClick={handleSavePrintOrder} color="primary" variant="contained" size="small" disabled={!hasOrderChanges} />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <TableContainer sx={{ maxHeight: "calc(100vh - 350px)" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell width={80}>Order</TableCell>
                <TableCell width={150}>Code</TableCell>
                <TableCell>Investigation Name</TableCell>
                <TableCell width={150}>Type</TableCell>
                <TableCell width={100}>Status</TableCell>
                <TableCell width={150} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orderedInvestigations.map((investigation, index) => (
                <TableRow
                  key={investigation.invID}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  sx={{
                    cursor: "move",
                    backgroundColor: dragOverItem === index ? "action.hover" : "inherit",
                    opacity: draggedItem === index ? 0.5 : 1,
                    transition: "background-color 0.2s ease",
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <TableCell>
                    <Typography variant="h6" color="primary">
                      {index + 1}
                    </Typography>
                  </TableCell>
                  <TableCell>{investigation.invCode}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {investigation.invName}
                    </Typography>
                  </TableCell>
                  <TableCell>{investigation.invType || "-"}</TableCell>
                  <TableCell>
                    <Chip size="small" color={investigation.rActiveYN === "Y" ? "success" : "error"} label={investigation.rActiveYN === "Y" ? "Active" : "Inactive"} />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Move Up">
                        <span>
                          <IconButton size="small" onClick={() => moveInvestigation(index, "up")} disabled={index === 0} color="primary">
                            <ArrowUpward fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Move Down">
                        <span>
                          <IconButton size="small" onClick={() => moveInvestigation(index, "down")} disabled={index === orderedInvestigations.length - 1} color="primary">
                            <ArrowDownward fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Drag to reorder">
                        <IconButton size="small" sx={{ cursor: "grab", "&:active": { cursor: "grabbing" } }}>
                          <DragIndicator fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default InvestigationPrintOrder;
