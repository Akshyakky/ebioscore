import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import { DropdownOption } from "@/interfaces/Common/DropdownOption";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import { ProductOverviewDto } from "@/interfaces/InventoryManagement/ProductOverviewDto";
import { useAlert } from "@/providers/AlertProvider";
import { productOverviewService } from "@/services/InventoryManagementService/inventoryManagementService";
import {
  Send as ApplyIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ContentCopy as CopyIcon,
  Edit as EditIcon,
  FileDownload as ImportIcon,
  SelectAll as SelectAllIcon,
} from "@mui/icons-material";
import { Alert, Box, Button, Checkbox, Chip, Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Paper, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import ProductOverviewForm from "../../ProductOverview/Form/ProductOverviewForm";

interface ProductDepartmentOverviewProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  departments?: DropdownOption[];
}

interface DepartmentOverviewRow extends ProductOverviewDto {
  isSelected?: boolean;
  hasChanges?: boolean;
}

const ProductDepartmentOverview: React.FC<ProductDepartmentOverviewProps> = ({ open, onClose, departments }) => {
  const { showAlert } = useAlert();
  const { setLoading } = useLoading();
  const [departmentOverviews, setDepartmentOverviews] = useState<DepartmentOverviewRow[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<Set<number>>(new Set());
  const [showApplyConfirmation, setShowApplyConfirmation] = useState(false);
  const [importMenuAnchor, setImportMenuAnchor] = useState<null | HTMLElement>(null);

  // Form dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOverview, setSelectedOverview] = useState<ProductOverviewDto | null>(null);
  const [selectedDepartmentInfo, setSelectedDepartmentInfo] = useState<{ deptID: number; department: string } | null>(null);

  // Get selectedProduct from form context using useWatch
  const { control } = useFormContext();
  const selectedProduct: ProductListDto | null = useWatch({
    control,
    name: "selectedProduct",
  });

  // Load existing product overviews for all departments
  useEffect(() => {
    if (open && selectedProduct) {
      loadDepartmentOverviews();
    }
  }, [open, selectedProduct]);

  const loadDepartmentOverviews = async () => {
    if (!selectedProduct) return;

    try {
      setLoading(true);
      const response = await productOverviewService.getAll();

      if (response.success && response.data) {
        const productOverviews = response.data.filter((overview: ProductOverviewDto) => overview.productID === selectedProduct.productID);
        const overviewMap = new Map(productOverviews.map((overview: ProductOverviewDto) => [overview.deptID, overview]));

        const allDepartmentRows: DepartmentOverviewRow[] =
          departments?.map((dept) => {
            const existingOverview = overviewMap.get(Number(dept.value));

            if (existingOverview) {
              return {
                ...existingOverview,
                isSelected: false,
                hasChanges: false,
              };
            } else {
              return {
                pvID: 0,
                productID: selectedProduct.productID,
                productCode: selectedProduct.productCode || "",
                productName: selectedProduct.productName || "",
                deptID: Number(dept.value),
                department: dept.label,
                fsbCode: "N",
                rackNo: "",
                shelfNo: "",
                minLevelUnits: 0,
                maxLevelUnits: 0,
                dangerLevelUnits: 0,
                reOrderLevel: 0,
                avgDemand: 0,
                stockLevel: 0,
                supplierAllocation: "N",
                poStatus: "N",
                defaultYN: "N",
                isAutoIndentYN: "N",
                productLocation: "",
                pLocationID: selectedProduct.pLocationID || 0,
                rActiveYN: "Y",
                transferYN: "N",
                rNotes: "",
                isSelected: false,
                hasChanges: false,
              };
            }
          }) || [];

        setDepartmentOverviews(allDepartmentRows);
      }
    } catch (error) {
      showAlert("Error", "Failed to load department overviews", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (row: DepartmentOverviewRow) => {
    setSelectedOverview(row);
    setSelectedDepartmentInfo({
      deptID: row.deptID,
      department: row.department || "",
    });
    setIsFormOpen(true);
  };

  const handleFormClose = (refreshData?: boolean) => {
    setIsFormOpen(false);
    setSelectedOverview(null);
    setSelectedDepartmentInfo(null);

    if (refreshData) {
      loadDepartmentOverviews();
    }
  };

  const handleSelectDepartment = (deptId: number, selected: boolean) => {
    setSelectedDepartments((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(deptId);
      } else {
        newSet.delete(deptId);
      }
      return newSet;
    });

    setDepartmentOverviews((prev) => prev.map((row) => (row.deptID === deptId ? { ...row, isSelected: selected } : row)));
  };

  const handleSelectAll = () => {
    const allDeptIds = departmentOverviews.map((row) => row.deptID);
    const allSelected = selectedDepartments.size === allDeptIds.length;

    if (allSelected) {
      setSelectedDepartments(new Set());
      setDepartmentOverviews((prev) => prev.map((row) => ({ ...row, isSelected: false })));
    } else {
      setSelectedDepartments(new Set(allDeptIds));
      setDepartmentOverviews((prev) => prev.map((row) => ({ ...row, isSelected: true })));
    }
  };

  const handleImportFromDepartment = (sourceDeptId: number) => {
    const sourceRow = departmentOverviews.find((r) => r.deptID === sourceDeptId);
    if (!sourceRow) return;

    const fieldsToImport = {
      fsbCode: sourceRow.fsbCode,
      rackNo: sourceRow.rackNo,
      shelfNo: sourceRow.shelfNo,
      minLevelUnits: sourceRow.minLevelUnits,
      maxLevelUnits: sourceRow.maxLevelUnits,
      dangerLevelUnits: sourceRow.dangerLevelUnits,
      reOrderLevel: sourceRow.reOrderLevel,
      avgDemand: sourceRow.avgDemand,
      supplierAllocation: sourceRow.supplierAllocation,
      poStatus: sourceRow.poStatus,
      isAutoIndentYN: sourceRow.isAutoIndentYN,
      productLocation: sourceRow.productLocation,
      pLocationID: sourceRow.pLocationID,
      rActiveYN: sourceRow.rActiveYN,
      transferYN: sourceRow.transferYN,
      rNotes: sourceRow.rNotes,
    };

    setDepartmentOverviews((prev) =>
      prev.map((row) => {
        if (row.isSelected && row.deptID !== sourceDeptId) {
          return {
            ...row,
            ...fieldsToImport,
            hasChanges: true,
          };
        }
        return row;
      })
    );

    setImportMenuAnchor(null);
    showAlert("Success", `Imported details from ${sourceRow.department} to selected departments`, "success");
  };

  const handleApplyToSelected = async () => {
    if (!selectedProduct) {
      showAlert("Error", "No product selected", "error");
      return;
    }

    if (selectedDepartments.size === 0) {
      showAlert("Warning", "Please select at least one department", "warning");
      return;
    }

    try {
      setLoading(true);

      const savePromises = departmentOverviews
        .filter((row) => row.isSelected)
        .map((row) => {
          const dataToSave: ProductOverviewDto = {
            ...row,
            productID: selectedProduct.productID,
            productCode: selectedProduct.productCode || "",
            productName: selectedProduct.productName || "",
          };
          return productOverviewService.save(dataToSave);
        });

      const results = await Promise.all(savePromises);
      const successCount = results.filter((r) => r.success).length;

      if (successCount === results.length) {
        showAlert("Success", `Successfully saved ${successCount} department overviews`, "success");
        await loadDepartmentOverviews();
      } else {
        showAlert("Warning", `Saved ${successCount} out of ${results.length} department overviews`, "warning");
      }
    } catch (error) {
      showAlert("Error", "Failed to save department overviews", "error");
    } finally {
      setLoading(false);
      setShowApplyConfirmation(false);
    }
  };

  const getStockStatusChip = (row: DepartmentOverviewRow) => {
    if (row.pvID === 0) {
      return <Chip size="small" color="default" label="Not Configured" />;
    }
    if (row.stockLevel && row.dangerLevelUnits && row.stockLevel <= row.dangerLevelUnits) {
      return <Chip size="small" color="error" label="Danger Level" />;
    }
    if (row.stockLevel && row.minLevelUnits && row.stockLevel <= row.minLevelUnits) {
      return <Chip size="small" color="warning" label="Low Stock" />;
    }
    return <Chip size="small" color="success" label="Normal" />;
  };

  const columns: Column<DepartmentOverviewRow>[] = [
    {
      key: "select",
      header: "Select",
      visible: true,
      width: 50,
      render: (row) => <Checkbox checked={row.isSelected || false} onChange={(e) => handleSelectDepartment(row.deptID, e.target.checked)} />,
    },
    {
      key: "department",
      header: "Department",
      visible: true,
      width: 200,
      formatter: (value: string, row: DepartmentOverviewRow) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2">{value}</Typography>
          {row.pvID === 0 && <Chip size="small" color="info" label="New" />}
        </Stack>
      ),
    },
    {
      key: "location",
      header: "Location Info",
      visible: true,
      width: 250,
      render: (row) => {
        const locationParts = [row.productLocation, row.rackNo, row.shelfNo].filter(Boolean);
        return locationParts.length > 0 ? locationParts.join(" / ") : "-";
      },
    },
    {
      key: "stockLevels",
      header: "Stock Levels",
      visible: true,
      width: 300,
      render: (row) => (
        <Stack spacing={0.5}>
          <Typography variant="caption">
            Min: {row.minLevelUnits} | Max: {row.maxLevelUnits} | Danger: {row.dangerLevelUnits}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2">Stock: {row.stockLevel || 0}</Typography>
            {getStockStatusChip(row)}
          </Stack>
        </Stack>
      ),
    },
    {
      key: "reorderInfo",
      header: "Reorder Info",
      visible: true,
      width: 200,
      render: (row) => (
        <Stack spacing={0.5}>
          <Typography variant="caption">Reorder: {row.reOrderLevel || 0}</Typography>
          <Typography variant="caption">Avg Demand: {row.avgDemand || 0}</Typography>
        </Stack>
      ),
    },
    {
      key: "settings",
      header: "Settings",
      visible: true,
      width: 150,
      render: (row) => (
        <Stack spacing={0.5}>
          {row.isAutoIndentYN === "Y" && <Chip size="small" color="info" label="Auto Indent" />}
          <Chip size="small" color={row.rActiveYN === "Y" ? "success" : "error"} label={row.rActiveYN === "Y" ? "Active" : "Inactive"} />
        </Stack>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      width: 120,
      render: (row) => (
        <IconButton size="small" color="primary" onClick={() => handleEditClick(row)}>
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const hasAnyConfiguredDepartment = departmentOverviews.some((row) => row.pvID !== 0);

  // If no product is selected, show a message or close the dialog
  if (!selectedProduct && open) {
    return (
      <GenericDialog open={open} onClose={() => onClose()} title="Department Overview" maxWidth="xl" fullWidth showCloseButton>
        <Box sx={{ p: 2 }}>
          <Alert severity="warning">No product selected. Please select a product to view department overview.</Alert>
        </Box>
      </GenericDialog>
    );
  }

  return (
    <>
      <GenericDialog
        open={open}
        onClose={() => onClose()}
        title={`Department Overview - ${selectedProduct?.productName} (${selectedProduct?.productCode})`}
        maxWidth="xl"
        fullWidth
        showCloseButton
      >
        <Box sx={{ p: 2 }}>
          {selectedDepartments.size > 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {selectedDepartments.size} department(s) selected for bulk operations
            </Alert>
          )}

          <Paper sx={{ mb: 2, p: 2 }}>
            <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Department-wise Product Configuration</Typography>

              <Stack direction="row" spacing={2}>
                <Button variant="outlined" startIcon={<SelectAllIcon />} onClick={handleSelectAll}>
                  {selectedDepartments.size === departmentOverviews.length ? "Deselect All" : "Select All"}
                </Button>

                {hasAnyConfiguredDepartment && (
                  <Button
                    variant="outlined"
                    startIcon={<ImportIcon />}
                    endIcon={<ArrowDropDownIcon />}
                    onClick={(e) => setImportMenuAnchor(e.currentTarget)}
                    disabled={selectedDepartments.size === 0}
                  >
                    Import From Department
                  </Button>
                )}

                <SmartButton
                  text="Apply to Selected"
                  icon={ApplyIcon}
                  onClick={() => setShowApplyConfirmation(true)}
                  variant="contained"
                  color="primary"
                  disabled={selectedDepartments.size === 0}
                  asynchronous={true}
                  showLoadingIndicator={true}
                  loadingText="Saving..."
                />
              </Stack>
            </Stack>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <CustomGrid columns={columns} data={departmentOverviews} maxHeight="500px" emptyStateMessage="No departments found" loading={false} />
          </Paper>

          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <SmartButton text="Close" onClick={() => onClose(true)} variant="contained" color="primary" />
          </Box>
        </Box>
      </GenericDialog>

      {/* Product Overview Form Dialog */}
      {isFormOpen && selectedDepartmentInfo && (
        <ProductOverviewForm open={isFormOpen} onClose={handleFormClose} initialData={selectedOverview} viewOnly={false} selectedDepartment={selectedDepartmentInfo} />
      )}

      {/* Import Menu */}
      <Menu anchorEl={importMenuAnchor} open={Boolean(importMenuAnchor)} onClose={() => setImportMenuAnchor(null)}>
        <MenuItem disabled>
          <Typography variant="caption" color="text.secondary">
            Select source department
          </Typography>
        </MenuItem>
        <Divider />
        {departmentOverviews
          .filter((row) => row.pvID !== 0)
          .map((row) => (
            <MenuItem key={row.deptID} onClick={() => handleImportFromDepartment(row.deptID)}>
              <ListItemIcon>
                <CopyIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{row.department}</ListItemText>
            </MenuItem>
          ))}
      </Menu>

      {/* Apply Confirmation Dialog */}
      <ConfirmationDialog
        open={showApplyConfirmation}
        onClose={() => setShowApplyConfirmation(false)}
        onConfirm={handleApplyToSelected}
        title="Apply to Selected Departments"
        message={`Are you sure you want to save the configuration for ${selectedDepartments.size} selected department(s)?`}
        confirmText="Apply"
        cancelText="Cancel"
        type="info"
        maxWidth="sm"
      />
    </>
  );
};

export default ProductDepartmentOverview;
