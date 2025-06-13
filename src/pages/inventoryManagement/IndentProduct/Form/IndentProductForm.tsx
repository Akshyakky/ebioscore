// src/pages/inventoryManagement/IndentProduct/Form/IndentProductForm.tsx

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Add as AddIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Business as DepartmentIcon,
  Assignment as IndentIcon,
  Person as PatientIcon,
  Inventory as ProductIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { Alert, Box, Button, Card, CardContent, Chip, Divider, Grid, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef, GridRenderCellParams, GridRenderEditCellParams, GridRowId, GridRowModel, GridRowsProp } from "@mui/x-data-grid";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";

import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { usePatientSearch } from "@/hooks/PatientAdminstration/patient/usePatientSearch";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { ProductSearch, ProductSearchRef } from "../../CommonPage/Product/ProductSearchForm";

import { useLoading } from "@/hooks/Common/useLoading";
import { useAlert } from "@/providers/AlertProvider";
import { useIndentProduct } from "../hooks/useIndentProduct";

import { IndentDetailDto, IndentMastDto, IndentSaveRequestDto } from "@/interfaces/InventoryManagement/IndentProductDto";
import { ProductSearchResult } from "@/interfaces/InventoryManagement/Product/ProductSearch.interface";
import { PatientOption } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";

// Validation schemas
const indentDetailSchema = z.object({
  indentDetID: z.number().default(0),
  indentID: z.number().optional(),
  productID: z.number().min(1, "Product is required"),
  productCode: z.string().min(1, "Product code is required"),
  productName: z.string().min(1, "Product name is required"),
  catValue: z.string().optional(),
  pGrpID: z.number().optional(),
  requiredQty: z.number().min(1, "Quantity must be at least 1"),
  requiredUnitQty: z.number().optional(),
  pUnitID: z.number().optional(),
  pUnitName: z.string().optional(),
  unitPack: z.number().optional(),
  manufacturerID: z.number().optional(),
  manufacturerName: z.string().optional(),
  qoh: z.number().optional(),
  reOrderLevel: z.number().optional(),
  rNotes: z.string().optional(),
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().default("N"),
});

const indentMasterSchema = z.object({
  indentID: z.number().default(0),
  indentCode: z.string().min(1, "Indent code is required"),
  fromDeptID: z.number().min(1, "From department is required"),
  fromDeptName: z.string().optional(),
  toDeptID: z.number().min(1, "To department is required"),
  toDeptName: z.string().optional(),
  indentDate: z.date(),
  pChartID: z.number().optional(),
  pChartCode: z.string().optional(),
  indentType: z.string().default("NORMAL"),
  indentTypeValue: z.string().optional(),
  autoIndentYN: z.string().default("N"),
  transferYN: z.string().default("N"),
  rActiveYN: z.string().default("Y"),
  rNotes: z.string().optional(),
});

const indentFormSchema = z.object({
  indentMaster: indentMasterSchema,
  indentDetails: z.array(indentDetailSchema).min(1, "At least one product is required"),
});

type IndentFormData = z.infer<typeof indentFormSchema>;
type IndentDetailFormData = z.infer<typeof indentDetailSchema>;

interface IndentProductFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: IndentMastDto | null;
  viewOnly?: boolean;
  selectedDepartment: { deptID: number; department: string };
  onChangeDepartment?: () => void;
}

// Custom cell components for the data grid
const ProductSearchCell = ({ params, onProductSelect }: { params: GridRenderEditCellParams; onProductSelect: (product: ProductSearchResult | null, rowId: GridRowId) => void }) => {
  const productSearchRef = useRef<ProductSearchRef>(null);

  const handleProductSelect = (product: ProductSearchResult | null) => {
    onProductSelect(product, params.id);
  };

  return (
    <Box sx={{ width: "100%", p: 1 }}>
      <ProductSearch ref={productSearchRef} onProductSelect={handleProductSelect} label="" placeholder="Search product..." className="grid-product-search" disabled={false} />
    </Box>
  );
};

const QuantityCell = ({ params }: { params: GridRenderCellParams }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      <Typography variant="body2" fontWeight="medium">
        {params.value || 0}
      </Typography>
    </Box>
  );
};

const IndentProductForm: React.FC<IndentProductFormProps> = ({ open, onClose, initialData, viewOnly = false, selectedDepartment, onChangeDepartment }) => {
  const { showAlert } = useAlert();
  const { setLoading } = useLoading();
  const { saveIndent, getNextIndentCode, getIndentById, isLoading: indentLoading } = useIndentProduct();

  // State management
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [gridRows, setGridRows] = useState<GridRowsProp>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);

  // Dropdown values
  const { department } = useDropdownValues(["department"]);

  // Patient search hook
  const {
    inputValue: patientSearchValue,
    setInputValue: setPatientSearchValue,
    options: patientOptions,
    selectedPatient: hookSelectedPatient,
    setSelectedPatient: setHookSelectedPatient,
    clearSearch: clearPatientSearch,
  } = usePatientSearch();

  const isAddMode = !initialData;

  // Default form values
  const defaultValues: IndentFormData = useMemo(
    () => ({
      indentMaster: {
        indentID: initialData?.indentID || 0,
        indentCode: initialData?.indentCode || "",
        fromDeptID: selectedDepartment.deptID,
        fromDeptName: selectedDepartment.department,
        toDeptID: initialData?.toDeptID || 0,
        toDeptName: initialData?.toDeptName || "",
        indentDate: initialData?.indentDate ? new Date(initialData.indentDate) : new Date(),
        pChartID: initialData?.pChartID || 0,
        pChartCode: initialData?.pChartCode || "",
        indentType: initialData?.indentType || "NORMAL",
        indentTypeValue: initialData?.indentTypeValue || "Normal",
        autoIndentYN: initialData?.autoIndentYN || "N",
        transferYN: initialData?.transferYN || "N",
        rActiveYN: initialData?.rActiveYN || "Y",
        rNotes: initialData?.rNotes || "",
      },
      indentDetails: [],
    }),
    [initialData, selectedDepartment]
  );

  // Form setup
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isDirty, isValid, errors },
  } = useForm<IndentFormData>({
    defaultValues,
    resolver: zodResolver(indentFormSchema),
    mode: "onChange",
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "indentDetails",
  });

  // Watch form values
  const watchedIndentType = watch("indentMaster.indentType");
  const watchedPChartID = watch("indentMaster.pChartID");

  // Initialize form data
  useEffect(() => {
    if (initialData && open) {
      loadInitialData();
    } else if (!initialData && open) {
      generateIndentCode();
      initializeEmptyForm();
    }
  }, [initialData, open]);

  const loadInitialData = async () => {
    if (!initialData) return;

    try {
      setLoading(true);
      const fullIndentData = await getIndentById(initialData.indentID);

      if (fullIndentData) {
        const formData: IndentFormData = {
          indentMaster: {
            ...defaultValues.indentMaster,
            ...fullIndentData.IndentMaster,
            indentDate: fullIndentData.IndentMaster.indentDate ? new Date(fullIndentData.IndentMaster.indentDate) : new Date(),
          },
          indentDetails: fullIndentData.IndentDetails || [],
        };

        reset(formData);
        setGridRows(convertDetailsToGridRows(fullIndentData.IndentDetails || []));

        // Set selected patient if exists
        if (fullIndentData.IndentMaster.pChartID) {
          // You might want to fetch patient details here
          setSelectedPatient({
            pChartID: fullIndentData.IndentMaster.pChartID,
            pChartCode: fullIndentData.IndentMaster.pChartCode || "",
            pfName: "",
            plName: "",
            pAddPhone1: "",
            pDob: null,
            fullName: fullIndentData.IndentMaster.pChartCode || "",
          });
        }
      }
    } catch (error) {
      showAlert("Error", "Failed to load indent data", "error");
    } finally {
      setLoading(false);
    }
  };

  const initializeEmptyForm = () => {
    reset(defaultValues);
    setGridRows([]);
    addNewDetailRow();
  };

  const generateIndentCode = async () => {
    try {
      const code = await getNextIndentCode();
      if (code) {
        setValue("indentMaster.indentCode", code);
      }
    } catch (error) {
      console.error("Failed to generate indent code:", error);
    }
  };

  const convertDetailsToGridRows = (details: IndentDetailDto[]): GridRowsProp => {
    return details.map((detail, index) => ({
      id: detail.indentDetID || `temp-${index}`,
      indentDetID: detail.indentDetID || 0,
      productID: detail.productID || 0,
      productCode: detail.productCode || "",
      productName: detail.productName || "",
      catValue: detail.catValue || "",
      requiredQty: detail.requiredQty || 1,
      pUnitName: detail.pUnitName || "",
      manufacturerName: detail.manufacturerName || "",
      qoh: detail.qoh || 0,
      reOrderLevel: detail.reOrderLevel || 0,
      rNotes: detail.rNotes || "",
      rActiveYN: detail.rActiveYN || "Y",
    }));
  };

  const addNewDetailRow = () => {
    const newRow = {
      id: `temp-${Date.now()}`,
      indentDetID: 0,
      productID: 0,
      productCode: "",
      productName: "",
      catValue: "",
      requiredQty: 1,
      pUnitName: "",
      manufacturerName: "",
      qoh: 0,
      reOrderLevel: 0,
      rNotes: "",
      rActiveYN: "Y",
    };

    setGridRows((prev) => [...prev, newRow]);

    append({
      indentDetID: 0,
      productID: 0,
      productCode: "",
      productName: "",
      catValue: "",
      requiredQty: 1,
      pUnitID: 0,
      pUnitName: "",
      rActiveYN: "Y",
      transferYN: "N",
    });
  };

  const handleProductSelect = (product: ProductSearchResult | null, rowId: GridRowId) => {
    if (!product) return;

    const rowIndex = gridRows.findIndex((row) => row.id === rowId);
    if (rowIndex === -1) return;

    const updatedRow = {
      ...gridRows[rowIndex],
      productID: product.productID,
      productCode: product.productCode,
      productName: product.productName,
      catValue: product.catValue,
    };

    const newGridRows = [...gridRows];
    newGridRows[rowIndex] = updatedRow;
    setGridRows(newGridRows);

    // Update form data
    update(rowIndex, {
      ...fields[rowIndex],
      productID: product.productID,
      productCode: product.productCode,
      productName: product.productName,
      catValue: product.catValue,
    });
  };

  const handleRowUpdate = (newRow: GridRowModel, oldRow: GridRowModel) => {
    const rowIndex = gridRows.findIndex((row) => row.id === newRow.id);
    if (rowIndex !== -1) {
      update(rowIndex, {
        ...fields[rowIndex],
        requiredQty: newRow.requiredQty,
        rNotes: newRow.rNotes,
      });
    }
    return newRow;
  };

  const handleDeleteRow = (rowId: GridRowId) => {
    const rowIndex = gridRows.findIndex((row) => row.id === rowId);
    if (rowIndex !== -1) {
      const newGridRows = gridRows.filter((row) => row.id !== rowId);
      setGridRows(newGridRows);
      remove(rowIndex);
    }
  };

  const handlePatientSelect = (patient: PatientOption | null) => {
    setSelectedPatient(patient);
    setHookSelectedPatient(patient);

    if (patient) {
      setValue("indentMaster.pChartID", patient.pChartID);
      setValue("indentMaster.pChartCode", patient.pChartCode);
    } else {
      setValue("indentMaster.pChartID", 0);
      setValue("indentMaster.pChartCode", "");
    }
  };

  const onSubmit = async (data: IndentFormData) => {
    if (viewOnly) return;

    setFormError(null);

    if (gridRows.length === 0) {
      setFormError("At least one product is required");
      return;
    }

    try {
      setIsSaving(true);
      setLoading(true);

      const indentData: IndentSaveRequestDto = {
        IndentMaster: {
          ...data.indentMaster,
          fromDeptID: selectedDepartment.deptID,
          fromDeptName: selectedDepartment.department,
          rActiveYN: "Y",
          indentID: data.indentMaster.indentID,
          transferYN: "N",
        },
        IndentDetails: gridRows
          .filter((row) => row.productID > 0)
          .map((row) => ({
            indentDetID: row.indentDetID || 0,
            indentID: data.indentMaster.indentID,
            productID: row.productID,
            productCode: row.productCode,
            requiredQty: row.requiredQty,
            rActiveYN: row.rActiveYN,
            transferYN: "N",
            rNotes: row.rNotes,
            productName: row.productName,
            catValue: row.catValue,
            pUnitName: row.pUnitName,
            manufacturerName: row.manufacturerName,
            qoh: row.qoh,
            reOrderLevel: row.reOrderLevel,
            deptIssualYN: "N",
          })),
      };

      const response = await saveIndent(indentData);

      if (response.success) {
        showAlert("Success", isAddMode ? "Indent created successfully" : "Indent updated successfully", "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save indent");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save indent";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (isDirty) {
      setShowResetConfirmation(true);
    } else {
      performReset();
    }
  };

  const performReset = () => {
    reset(defaultValues);
    setGridRows([]);
    setSelectedPatient(null);
    clearPatientSearch();
    setFormError(null);
    if (!initialData) {
      generateIndentCode();
      addNewDetailRow();
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowCancelConfirmation(true);
    } else {
      onClose();
    }
  };

  // Data Grid columns definition
  const columns: GridColDef[] = [
    {
      field: "productCode",
      headerName: "Product Code",
      width: 200,
      editable: !viewOnly,
      renderEditCell: (params) => <ProductSearchCell params={params} onProductSelect={handleProductSelect} />,
    },
    {
      field: "productName",
      headerName: "Product Name",
      width: 250,
      editable: false,
    },
    {
      field: "catValue",
      headerName: "Category",
      width: 150,
      editable: false,
    },
    {
      field: "requiredQty",
      headerName: "Required Qty",
      width: 120,
      type: "number",
      editable: !viewOnly,
      renderCell: (params) => <QuantityCell params={params} />,
    },
    {
      field: "pUnitName",
      headerName: "Unit",
      width: 100,
      editable: false,
    },
    {
      field: "qoh",
      headerName: "Stock On Hand",
      width: 130,
      type: "number",
      editable: false,
      renderCell: (params) => <Chip size="small" color={params.value > 0 ? "success" : "warning"} label={params.value || 0} />,
    },
    {
      field: "reOrderLevel",
      headerName: "Reorder Level",
      width: 130,
      type: "number",
      editable: false,
    },
    {
      field: "rNotes",
      headerName: "Notes",
      width: 200,
      editable: !viewOnly,
    },
    {
      field: "rActiveYN",
      headerName: "Status",
      width: 100,
      editable: false,
      renderCell: (params) => <Chip size="small" color={params.value === "Y" ? "success" : "error"} label={params.value === "Y" ? "Active" : "Inactive"} />,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 80,
      getActions: (params) => [
        <GridActionsCellItem
          icon={
            <Tooltip title="Delete Row">
              <DeleteIcon />
            </Tooltip>
          }
          label="Delete"
          onClick={() => handleDeleteRow(params.id)}
          disabled={viewOnly}
          color="inherit"
        />,
      ],
    },
  ];

  const dialogTitle = useMemo(() => {
    if (viewOnly) return "View Indent Details";
    if (isAddMode) return "Create New Indent";
    return `Edit Indent - ${initialData?.indentCode}`;
  }, [viewOnly, isAddMode, initialData]);

  const dialogActions = useMemo(() => {
    if (viewOnly) {
      return <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />;
    }

    return (
      <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
        <SmartButton text="Cancel" onClick={handleCancel} variant="outlined" color="inherit" disabled={isSaving} />
        <Box sx={{ display: "flex", gap: 1 }}>
          <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={CancelIcon} disabled={isSaving || (!isDirty && !formError)} />
          <SmartButton
            text={isAddMode ? "Create Indent" : "Update Indent"}
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            color="primary"
            icon={SaveIcon}
            asynchronous={true}
            showLoadingIndicator={true}
            loadingText={isAddMode ? "Creating..." : "Updating..."}
            successText={isAddMode ? "Created!" : "Updated!"}
            disabled={isSaving || !isValid || gridRows.length === 0}
          />
        </Box>
      </Box>
    );
  }, [viewOnly, isSaving, isDirty, isValid, formError, isAddMode, gridRows.length, handleSubmit, onSubmit, onClose, handleReset, handleCancel]);

  return (
    <>
      <GenericDialog
        open={open}
        onClose={() => onClose()}
        title={dialogTitle}
        maxWidth="xl"
        fullWidth
        showCloseButton
        disableBackdropClick={!viewOnly && (isDirty || isSaving)}
        disableEscapeKeyDown={!viewOnly && (isDirty || isSaving)}
        actions={dialogActions}
      >
        <Box component="form" noValidate sx={{ p: 1 }}>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>
              {formError}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Status Toggle */}
            <Grid size={{ xs: 12 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    Department: {selectedDepartment.department}
                  </Typography>
                  {onChangeDepartment && (
                    <SmartButton text="Change Department" onClick={onChangeDepartment} variant="outlined" icon={DepartmentIcon} size="small" color="warning" />
                  )}
                </Box>
                <FormField name="indentMaster.rActiveYN" control={control} label="Active" type="switch" disabled={viewOnly} size="small" />
              </Box>
            </Grid>

            {/* Indent Master Information */}
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined" sx={{ borderLeft: "3px solid #1976d2" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                    <IndentIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                    Indent Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormField
                        name="indentMaster.indentCode"
                        control={control}
                        label="Indent Code"
                        type="text"
                        required
                        disabled={viewOnly || !!initialData}
                        size="small"
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormField name="indentMaster.indentDate" control={control} label="Indent Date" type="datepicker" required disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormField
                        name="indentMaster.indentType"
                        control={control}
                        label="Indent Type"
                        type="select"
                        disabled={viewOnly}
                        options={[
                          { value: "NORMAL", label: "Normal" },
                          { value: "URGENT", label: "Urgent" },
                          { value: "EMERGENCY", label: "Emergency" },
                        ]}
                        size="small"
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormField
                        name="indentMaster.toDeptID"
                        control={control}
                        label="To Department"
                        type="select"
                        required
                        disabled={viewOnly}
                        options={
                          department?.map((dept) => ({
                            value: dept.value,
                            label: dept.label,
                          })) || []
                        }
                        size="small"
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormField name="indentMaster.autoIndentYN" control={control} label="Auto Indent" type="switch" disabled={viewOnly} size="small" />
                    </Grid>

                    {watchedIndentType === "PATIENT" && (
                      <Grid size={{ xs: 12 }}>
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            <PatientIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                            Patient Information
                          </Typography>
                          {/* Patient search would go here - simplified for this example */}
                          <FormField name="indentMaster.pChartCode" control={control} label="Patient Chart Code" type="text" disabled={viewOnly} size="small" fullWidth />
                        </Box>
                      </Grid>
                    )}

                    <Grid size={{ xs: 12 }}>
                      <FormField
                        name="indentMaster.rNotes"
                        control={control}
                        label="Notes"
                        type="textarea"
                        disabled={viewOnly}
                        rows={3}
                        size="small"
                        fullWidth
                        placeholder="Enter any additional notes for this indent"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Product Details Grid */}
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined" sx={{ borderLeft: "3px solid #ff9800" }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" color="#ff9800" fontWeight="bold">
                      <ProductIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                      Product Details ({gridRows.length} items)
                    </Typography>
                    {!viewOnly && (
                      <Button variant="outlined" startIcon={<AddIcon />} onClick={addNewDetailRow} size="small">
                        Add Product
                      </Button>
                    )}
                  </Box>

                  <Box sx={{ height: 400, width: "100%" }}>
                    <DataGrid
                      rows={gridRows}
                      columns={columns}
                      processRowUpdate={handleRowUpdate}
                      disableRowSelectionOnClick
                      hideFooter={gridRows.length <= 10}
                      loading={indentLoading}
                    />
                  </Box>

                  {gridRows.length === 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        py: 4,
                        color: "text.secondary",
                      }}
                    >
                      <ProductIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                      <Typography variant="h6" gutterBottom>
                        No products added
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        Click "Add Product" to start building your indent
                      </Typography>
                      {!viewOnly && (
                        <Button variant="contained" startIcon={<AddIcon />} onClick={addNewDetailRow}>
                          Add First Product
                        </Button>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </GenericDialog>

      {/* Reset Confirmation Dialog */}
      <ConfirmationDialog
        open={showResetConfirmation}
        onClose={() => setShowResetConfirmation(false)}
        onConfirm={() => {
          performReset();
          setShowResetConfirmation(false);
        }}
        title="Reset Form"
        message="Are you sure you want to reset the form? All unsaved changes will be lost."
        confirmText="Reset"
        cancelText="Cancel"
        type="warning"
        maxWidth="sm"
      />

      {/* Cancel Confirmation Dialog */}
      <ConfirmationDialog
        open={showCancelConfirmation}
        onClose={() => setShowCancelConfirmation(false)}
        onConfirm={() => {
          setShowCancelConfirmation(false);
          onClose();
        }}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to cancel?"
        confirmText="Yes, Cancel"
        cancelText="Continue Editing"
        type="warning"
        maxWidth="sm"
      />
    </>
  );
};

export default IndentProductForm;
