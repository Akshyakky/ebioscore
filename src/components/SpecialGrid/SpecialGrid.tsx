import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton, useTheme, Paper, styled } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import CustomButton from "@/components/Button/CustomButton";

export interface SpecialGridProps<T> {
  data: T[];
  onReorder: (newOrder: T[]) => void;
  getItemId: (item: T) => number;
  renderLabel: (item: T) => string;
  onSelect?: (id: number, event?: React.MouseEvent) => void;

  selectedId?: number | null;
}

const Row = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(1.4),
  borderBottom: `1px solid ${theme.palette.divider}`,
  cursor: "grab",
  backgroundColor: theme.palette.mode === "dark" ? "#424242" : "#fff",
  transition: "background-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease",
  "&:hover": {
    backgroundColor: theme.palette.mode === "dark" ? "#333" : "#f5f5f5",
    transform: "scale(1.01)",
    boxShadow: theme.shadows[1],
  },
  "&:active": {
    transform: "scale(0.99)",
  },
}));

const LeftContent = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 10,
});

const SpecialGrid = <T extends {}>({ data, onReorder, getItemId, renderLabel, onSelect }: SpecialGridProps<T>) => {
  const [orderedData, setOrderedData] = useState<T[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const theme = useTheme();

  useEffect(() => {
    setOrderedData(data);
    setSelectedId(null);
  }, [data]);

  const handleDragStart = (event: React.DragEvent, index: number) => {
    event.dataTransfer.setData("drag-index", index.toString());
  };

  const handleDrop = (event: React.DragEvent, dropIndex: number) => {
    const dragIndex = parseInt(event.dataTransfer.getData("drag-index"), 10);
    if (dragIndex === dropIndex) return;

    const newData = [...orderedData];
    const [draggedItem] = newData.splice(dragIndex, 1);
    newData.splice(dropIndex, 0, draggedItem);
    setOrderedData(newData);
    onReorder(newData);
  };

  const moveItem = (from: number, to: number) => {
    const updated = [...orderedData];
    const [item] = updated.splice(from, 1);
    updated.splice(to, 0, item);
    setOrderedData(updated);
    onReorder(updated);
  };

  const moveSelectedToTop = () => {
    if (selectedId === null) return;
    const index = orderedData.findIndex((item) => getItemId(item) === selectedId);
    if (index > 0) {
      moveItem(index, 0);
    }
  };

  const moveSelectedToBottom = () => {
    if (selectedId === null) return;
    const index = orderedData.findIndex((item) => getItemId(item) === selectedId);
    if (index >= 0 && index < orderedData.length - 1) {
      moveItem(index, orderedData.length - 1);
    }
  };

  return (
    <Paper variant="outlined" sx={{ width: "100%", overflow: "hidden" }}>
      {orderedData.map((item, index) => {
        const id = getItemId(item);
        const isSelected = id === selectedId;

        return (
          <Row
            key={id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, index)}
            onClick={(e) => {
              if ((e.target as HTMLElement)?.closest(".arrow-button")) return; // 🔐 ignore arrow clicks
              onSelect?.(id);
            }}
            sx={{
              borderLeft: isSelected ? `4px solid ${theme.palette.primary.main}` : "4px solid transparent",
            }}
          >
            <LeftContent>
              <DragIndicatorIcon sx={{ color: theme.palette.text.secondary }} />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isSelected ? 600 : 400,
                  color: theme.palette.text.primary,
                  transition: "font-weight 0.2s ease",
                }}
              >
                {renderLabel(item)}
              </Typography>
            </LeftContent>
            <Box>
              <IconButton
                size="small"
                disabled={index === 0}
                className="action-no-select"
                onClick={(e) => {
                  e.stopPropagation();
                  moveItem(index, index - 1);
                }}
              >
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>

              <IconButton
                size="small"
                disabled={index === orderedData.length - 1}
                className="action-no-select"
                onClick={(e) => {
                  e.stopPropagation();
                  moveItem(index, index + 1);
                }}
              >
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
            </Box>
          </Row>
        );
      })}

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <CustomButton variant="contained" color="primary" onClick={moveSelectedToTop} disabled={selectedId === null}>
          Top
        </CustomButton>
        <CustomButton variant="contained" color="primary" onClick={moveSelectedToBottom} disabled={selectedId === null}>
          Bottom
        </CustomButton>
      </Box>
    </Paper>
  );
};

export default SpecialGrid;
