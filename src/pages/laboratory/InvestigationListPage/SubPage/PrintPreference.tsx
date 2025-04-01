import React, { useCallback, useState, ChangeEvent, useEffect } from "react";
import { Paper, Typography, Grid, Box, IconButton, Divider } from "@mui/material";
import FormField from "@/components/FormField/FormField";
import CustomButton from "@/components/Button/CustomButton";
import { LComponentDto } from "@/interfaces/Laboratory/LInvMastDto";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

interface PrintPreferencesProps {
  componentsList: LComponentDto[];
  reportTitle: string;
  subTitle: string;
  onReportTitleChange: (title: string) => void;
  onSubTitleChange: (subTitle: string) => void;
  onClear: () => void;
  onUpdateComponentOrder: (components: LComponentDto[]) => void;
}

const PrintPreferences: React.FC<PrintPreferencesProps> = ({ onClear, componentsList, reportTitle, subTitle, onReportTitleChange, onSubTitleChange, onUpdateComponentOrder }) => {
  const [, setIsSubTitleChecked] = useState(false);
  const [orderedComponents, setOrderedComponents] = useState<LComponentDto[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<number | null>(null);

  useEffect(() => {
    const sortedComponents = [...componentsList].sort((a, b) => (a.compOrder || 0) - (b.compOrder || 0));
    setOrderedComponents(sortedComponents.map((comp, index) => ({ ...comp, position: index + 1 })));
  }, [componentsList]);

  const updateComponentOrder = (updatedComponents: LComponentDto[]) => {
    const orderedWithPosition = updatedComponents.map((comp, index) => ({
      ...comp,
      compOrder: index + 1,
    }));

    setOrderedComponents(orderedWithPosition);
    onUpdateComponentOrder(orderedWithPosition);
  };

  const moveComponent = (index: number, direction: "up" | "down") => {
    setOrderedComponents((prev) => {
      const newOrder = [...prev];
      if (direction === "up" && index > 0) {
        [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      } else if (direction === "down" && index < newOrder.length - 1) {
        [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
      }
      updateComponentOrder(newOrder);
      return newOrder;
    });
  };

  const handleDrop = (event: React.DragEvent, index: number) => {
    const draggedIndex = Number(event.dataTransfer.getData("drag-item-index"));
    if (draggedIndex === index) return;

    setOrderedComponents((prev) => {
      const updated = [...prev];
      const [draggedItem] = updated.splice(draggedIndex, 1);
      updated.splice(index, 0, draggedItem);
      updateComponentOrder(updated);
      return updated;
    });
  };

  const handleTextInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = event.target;
      if (name === "reportTitle") onReportTitleChange(value);
      if (name === "subTitle") onSubTitleChange(value);
    },
    [onReportTitleChange, onSubTitleChange]
  );

  const handleClear = useCallback(() => {
    setOrderedComponents(componentsList);
    setIsSubTitleChecked(false);
    onClear();
  }, [componentsList, onClear]);

  const moveToTop = () => {
    if (selectedComponentId === null) return;
    setOrderedComponents((prev) => {
      const item = prev.find((c) => c.compoID === selectedComponentId);
      if (!item) return prev;
      return [item, ...prev.filter((c) => c.compoID !== selectedComponentId)];
    });
  };

  const moveToBottom = () => {
    if (selectedComponentId === null) return;
    setOrderedComponents((prev) => {
      const item = prev.find((c) => c.compoID === selectedComponentId);
      if (!item) return prev;
      return [...prev.filter((c) => c.compoID !== selectedComponentId), item];
    });
  };

  const handleDragStart = (event: React.DragEvent, index: number) => {
    event.dataTransfer.setData("drag-item-index", index.toString());
  };

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Print Preferences
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormField type="text" label="Report Title" name="reportTitle" value={reportTitle} onChange={handleTextInputChange} ControlID="reportTitle" maxLength={60} />

          <FormField type="text" label="Sub Title" name="subTitle" value={subTitle} onChange={handleTextInputChange} ControlID="subTitle" maxLength={1000} />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#37474F",
            borderBottom: "2px solid #CFD8DC",
            pb: 5,
            flexGrow: 1,
          }}
        >
          Arrange Components
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <CustomButton
            variant="contained"
            size="small"
            onClick={moveToTop}
            disabled={selectedComponentId === null}
            sx={{
              background: "linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%)",
              color: "#fff",
              boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #1e88e5 0%, #0d47a1 100%)",
                boxShadow: "0 6px 16px rgba(33, 150, 243, 0.5)",
              },
              "&:disabled": {
                background: "#E0E0E0",
                color: "#9E9E9E",
                boxShadow: "none",
              },
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <ArrowUpwardIcon sx={{ fontSize: 18 }} />
            Top
          </CustomButton>

          <CustomButton
            variant="contained"
            size="small"
            onClick={moveToBottom}
            disabled={selectedComponentId === null}
            sx={{
              background: "linear-gradient(135deg, #66bb6a 0%, #388e3c 100%)",
              color: "#fff",
              boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #388e3c 0%, #1b5e20 100%)",
                boxShadow: "0 6px 16px rgba(76, 175, 80, 0.5)",
              },
              "&:disabled": {
                background: "#E0E0E0",
                color: "#9E9E9E",
                boxShadow: "none",
              },
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <ArrowDownwardIcon sx={{ fontSize: 18 }} />
            Bottom
          </CustomButton>
        </Box>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          maxHeight: "60vh",
          overflowY: "auto",
          padding: 2,
          borderRadius: 3,
          boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
          backgroundColor: "#FFFFFF",
          borderColor: "#ECEFF1",
        }}
      >
        {orderedComponents.length > 0 ? (
          orderedComponents.map((component, index) => (
            <Box
              key={component.compoID}
              draggable
              onClick={() => setSelectedComponentId(component.compoID ?? null)}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, index)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 16px",
                borderRadius: 2,
                mb: 1.5,
                cursor: "move",
                backgroundColor: selectedComponentId === component.compoID ? "#E3F2FD" : index % 2 === 0 ? "#F7FAFC" : "#FFFFFF",
                boxShadow: selectedComponentId === component.compoID ? "0px 2px 8px rgba(33,150,243,0.2)" : "0px 1px 4px rgba(0,0,0,0.05)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
                },
              }}
            >
              <DragIndicatorIcon sx={{ color: "#90A4AE", mr: 2 }} />
              <Typography
                sx={{
                  flexGrow: 1,
                  fontWeight: 500,
                  color: "#455A64",
                  fontSize: "0.95rem",
                }}
              >
                {component.compoNameCD}
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={() => moveComponent(index, "up")}
                  disabled={index === 0}
                  sx={{
                    background: "linear-gradient(135deg, #2196F3 0%, #1565C0 100%)",
                    color: "#FFFFFF",
                    boxShadow: "0 4px 10px rgba(33, 150, 243, 0.3)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)",
                      transform: "scale(1.1)",
                      boxShadow: "0 6px 15px rgba(33, 150, 243, 0.5)",
                    },
                    "&:disabled": {
                      background: "#E0E0E0",
                      color: "#9E9E9E",
                      boxShadow: "none",
                    },
                  }}
                >
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>

                <IconButton
                  size="small"
                  onClick={() => moveComponent(index, "down")}
                  disabled={index === orderedComponents.length - 1}
                  sx={{
                    background: "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)",
                    color: "#FFFFFF",
                    boxShadow: "0 4px 10px rgba(76, 175, 80, 0.3)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #388E3C 0%, #1B5E20 100%)",
                      transform: "scale(1.1)",
                      boxShadow: "0 6px 15px rgba(76, 175, 80, 0.5)",
                    },
                    "&:disabled": {
                      background: "#E0E0E0",
                      color: "#9E9E9E",
                      boxShadow: "none",
                    },
                  }}
                >
                  <ArrowDownwardIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4, fontStyle: "italic" }}>
            No components available.
          </Typography>
        )}
      </Paper>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
        <CustomButton variant="contained" color="error" onClick={handleClear}>
          Clear
        </CustomButton>
      </Box>
    </Paper>
  );
};

export default PrintPreferences;
