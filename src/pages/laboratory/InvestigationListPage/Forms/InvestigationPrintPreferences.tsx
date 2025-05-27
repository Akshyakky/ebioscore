// src/pages/laboratory/InvestigationListPage/SubPage/PrintPreference.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Grid, Typography, Paper, Box, IconButton, Chip } from "@mui/material";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import { LComponentDto } from "@/interfaces/Laboratory/LInvMastDto";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import CustomButton from "@/components/Button/CustomButton";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";

interface PrintPreferencesProps {
  componentsList: LComponentDto[];
  reportTitle: string;
  subTitle: string;
  onReportTitleChange: (title: string) => void;
  onSubTitleChange: (subTitle: string) => void;
  onClear: () => void;
  onUpdateComponentOrder: (newOrder: LComponentDto[]) => void;
}

// Form validation schema
const formSchema = z.object({
  reportTitle: z.string().max(100, "Report Title must be less than 100 characters"),
  subTitle: z.string().max(100, "Sub Title must be less than 100 characters"),
});

type FormData = z.infer<typeof formSchema>;

const PrintPreferences: React.FC<PrintPreferencesProps> = ({ componentsList, reportTitle, subTitle, onReportTitleChange, onSubTitleChange, onClear, onUpdateComponentOrder }) => {
  const [orderedComponents, setOrderedComponents] = useState<LComponentDto[]>(componentsList);
  const [selectedComponentId, setSelectedComponentId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  // React Hook Form setup
  const { control, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reportTitle,
      subTitle,
    },
  });

  // Update ordered components when componentsList changes
  useEffect(() => {
    setOrderedComponents(componentsList);
  }, [componentsList]);

  // Handle form value changes
  const onSubmit = (data: FormData) => {
    onReportTitleChange(data.reportTitle);
    onSubTitleChange(data.subTitle);
  };

  // Auto-save when form values change
  useEffect(() => {
    reset({
      reportTitle,
      subTitle,
    });
  }, [reportTitle, subTitle, reset]);

  // Move component in the order
  const moveComponent = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    const newOrder = [...orderedComponents];
    const [movedItem] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedItem);

    setOrderedComponents(newOrder);
    onUpdateComponentOrder(newOrder);
  };

  // Handle drag start
  const handleDragStart = (index: number) => {
    setIsDragging(true);
    setDraggedItemIndex(index);
  };

  // Handle drag over
  const handleDragOver = (index: number) => {
    if (draggedItemIndex === null) return;
    if (index === dropTargetIndex) return;

    setDropTargetIndex(index);
  };

  // Handle drop
  const handleDrop = () => {
    if (draggedItemIndex === null || dropTargetIndex === null) return;

    moveComponent(draggedItemIndex, dropTargetIndex);

    setIsDragging(false);
    setDraggedItemIndex(null);
    setDropTargetIndex(null);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedItemIndex(null);
    setDropTargetIndex(null);
  };

  // Move selected component to top
  const moveToTop = () => {
    if (selectedComponentId === null) return;

    const index = orderedComponents.findIndex((comp) => comp.compoID === selectedComponentId);
    if (index > 0) {
      moveComponent(index, 0);
    }
  };

  // Move selected component to bottom
  const moveToBottom = () => {
    if (selectedComponentId === null) return;

    const index = orderedComponents.findIndex((comp) => comp.compoID === selectedComponentId);
    if (index >= 0 && index < orderedComponents.length - 1) {
      moveComponent(index, orderedComponents.length - 1);
    }
  };

  // CustomGrid columns configuration
  const columns: Column<LComponentDto>[] = useMemo(
    () => [
      {
        key: "dragHandle",
        header: "",
        visible: true,
        width: 50,
        render: (item, rowIndex) => (
          <DragIndicatorIcon
            sx={{
              cursor: "grab",
              color: "text.secondary",
              "&:hover": { color: "primary.main" },
            }}
            onMouseDown={() => handleDragStart(rowIndex)}
          />
        ),
      },
      {
        key: "compoNameCD",
        header: "Component Name",
        visible: true,
        render: (item) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              fontWeight: item.compoID === selectedComponentId ? 600 : 400,
              color: item.compoID === selectedComponentId ? "primary.main" : "text.primary",
            }}
          >
            {item.compoNameCD || "Unnamed Component"}
            {item.compoID === selectedComponentId && <Chip size="small" label="Selected" color="primary" sx={{ ml: 1 }} />}
          </Box>
        ),
      },
      {
        key: "compOCodeCD",
        header: "Code",
        visible: true,
        width: 120,
        render: (item) => item.compOCodeCD || "No Code",
      },
      {
        key: "actions",
        header: "Actions",
        visible: true,
        width: 120,
        render: (item, rowIndex) => (
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton size="small" color="primary" disabled={rowIndex === 0} onClick={() => moveComponent(rowIndex, rowIndex - 1)}>
              <ArrowUpwardIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" color="primary" disabled={rowIndex === orderedComponents.length - 1} onClick={() => moveComponent(rowIndex, rowIndex + 1)}>
              <ArrowDownwardIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ],
    [orderedComponents.length, selectedComponentId]
  );

  return (
    <Paper variant="elevation" sx={{ p: 3 }}>
      <form onChange={handleSubmit(onSubmit)}>
        <Typography variant="h6" gutterBottom>
          Print Preferences
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ sm: 12, md: 3 }}>
            <FormField type="text" name="reportTitle" control={control} label="Report Title" fullWidth placeholder="Enter Report Title" variant="outlined" size="small" />
          </Grid>
          <Grid size={{ sm: 12, md: 3 }}>
            <FormField type="text" name="subTitle" control={control} label="Sub Title" fullWidth placeholder="Enter Sub Title" variant="outlined" size="small" />
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>
          Component Print Order
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Drag and drop components to change their print order, or use the arrow buttons.
          </Typography>
        </Box>

        <Paper
          variant="outlined"
          sx={{
            mb: 3,
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
            data={orderedComponents}
            maxHeight="400px"
            onRowClick={(item) => setSelectedComponentId(item.compoID)}
            customRowStyle={(item) => ({
              backgroundColor: item.compoID === selectedComponentId ? "rgba(25, 118, 210, 0.08)" : undefined,
              borderLeft: item.compoID === selectedComponentId ? "4px solid #1976d2" : "4px solid transparent",
            })}
          />
        </Paper>

        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
          <Box>
            <EnhancedFormField type="switch" name="enableCustomOrder" control={control} label="Use Custom Print Order" defaultValue="Y" />
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <CustomButton variant="outlined" color="primary" onClick={moveToTop} disabled={selectedComponentId === null}>
              Move to Top
            </CustomButton>
            <CustomButton variant="outlined" color="primary" onClick={moveToBottom} disabled={selectedComponentId === null}>
              Move to Bottom
            </CustomButton>
            <CustomButton variant="outlined" color="secondary" onClick={onClear}>
              Clear Preferences
            </CustomButton>
          </Box>
        </Box>
      </form>
    </Paper>
  );
};

export default PrintPreferences;
