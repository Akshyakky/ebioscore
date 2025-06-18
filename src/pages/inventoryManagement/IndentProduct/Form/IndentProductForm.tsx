import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { IndentDetailDto, IndentMastDto, IndentSaveRequestDto } from "@/interfaces/InventoryManagement/IndentProductDto";
import { ProductSearchResult } from "@/interfaces/InventoryManagement/Product/ProductSearch.interface";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import { ProductOverviewDto } from "@/interfaces/InventoryManagement/ProductOverviewDto";
import { PatientOption, PatientSearchResult } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";
import { useAlert } from "@/providers/AlertProvider";
import { productListService, productOverviewService } from "@/services/InventoryManagementService/inventoryManagementService";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Add as AddIcon,
  AddShoppingCart as AddProductIcon,
  Assignment as AssignmentIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Business as DepartmentIcon,
  Description as InfoIcon,
  Inventory as InventoryIcon,
  LocalHospital as PatientIcon,
  ViewList as ProductListIcon,
  ShoppingCart as PurchaseIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { Alert, alpha, Badge, Box, Card, CardContent, Chip, Divider, Grid, MenuItem, Paper, Select, TextField, Tooltip, Typography, useTheme } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { PatientDemographics } from "../../../patientAdministration/CommonPage/Patient/PatientDemographics/PatientDemographics";
import { PatientSearch } from "../../../patientAdministration/CommonPage/Patient/PatientSearch/PatientSearch";
import { ProductSearch, ProductSearchRef } from "../../CommonPage/Product/ProductSearchForm";
import { useIndentProduct } from "../hooks/useIndentProduct";

interface IndentProductFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: IndentMastDto | null;
  viewOnly?: boolean;
  selectedDepartment: { deptID: number; department: string };
  onChangeDepartment?: () => void;
}

const indentFormSchema = z.object({
  indentID: z.number().default(0),
  indentCode: z.string().min(1, "Indent code is required"),
  indentDate: z.date().default(() => new Date()),
  indentType: z.string().default(""),
  indentTypeValue: z.string().min(1, "Indent type is required"),
  fromDeptID: z.number().min(1, "From department is required"),
  fromDeptName: z.string().min(1, "From department name is required"),
  toDeptID: z.number().optional(),
  toDeptName: z.string().optional(),
  pChartID: z.number().optional(),
  pChartCode: z.string().optional(),
  autoIndentYN: z.string().default("N"),
  indentAcknowledgement: z.string().optional(),
  rNotes: z.string().optional(),
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().default("N"),
});

type IndentFormData = z.infer<typeof indentFormSchema>;

interface IndentDetailRow extends IndentDetailDto {
  isNew?: boolean;
  tempId?: string;
  id?: string | number;
  pChartID?: number;
  pChartCode?: string;
}

const IndentProductForm: React.FC<IndentProductFormProps> = ({ open, onClose, initialData, viewOnly = false, selectedDepartment }) => {
  const theme = useTheme();
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();
  const { saveIndent, getNextIndentCode, getIndentById } = useIndentProduct();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductSearchResult | null>(null);
  const [indentDetails, setindentDetails] = useState<IndentDetailRow[]>([]);
  const [clearPatientTrigger, setClearPatientTrigger] = useState(0);
  const [hasGeneratedCode, setHasGeneratedCode] = useState(false);
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const productSearchRef = useRef<ProductSearchRef>(null);
  const { department: departments, departmentIndent, productUnit: productOptions } = useDropdownValues(["department", "departmentIndent", "productUnit"]);
  const isAddMode = !initialData;
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);

  const supplierOptions = [
    { value: "1", label: "Supplier 1" },
    { value: "2", label: "Supplier 2" },
    { value: "3", label: "Supplier 3" },
  ];

  const packageOptions = [
    { value: "1", label: "Package 1" },
    { value: "2", label: "Package 2" },
    { value: "3", label: "Package 3" },
  ];

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty, isValid },
  } = useForm<IndentFormData>({
    resolver: zodResolver(indentFormSchema),
    mode: "onChange",
  });
  const watchedIndentTypeValue = useWatch({ control, name: "indentTypeValue" });
  const watchedFromDeptID = useWatch({ control, name: "fromDeptID" });

  useEffect(() => {
    if (watchedIndentTypeValue && departmentIndent) {
      const selectedOption = departmentIndent.find((option) => option.value === watchedIndentTypeValue);
      if (selectedOption) {
        setValue("indentType", selectedOption.label || "", { shouldValidate: true });
      }
    }
  }, [watchedIndentTypeValue, departmentIndent, setValue]);

  const generateIndentCode = useCallback(async () => {
    if (!isAddMode || !selectedDepartment.deptID) return;
    try {
      setIsGeneratingCode(true);
      const currentYear = new Date().getFullYear();
      const deptCode = selectedDepartment.department.substring(0, 4).toUpperCase();
      const nextCode = await getNextIndentCode("IND", 3);
      if (nextCode) {
        const generatedCode = `${deptCode}/${currentYear}/${nextCode.substring(nextCode.length - 3)}`;
        setValue("indentCode", generatedCode, { shouldValidate: true, shouldDirty: true });
      }
    } catch (error) {
      showAlert("Warning", "Failed to generate indent code. Please enter manually.", "warning");
    } finally {
      setIsGeneratingCode(false);
    }
  }, [isAddMode, selectedDepartment.deptID, selectedDepartment.department, getNextIndentCode, setValue, showAlert]);

  const defaultValues: IndentFormData = useMemo(
    () => ({
      indentID: initialData?.indentID || 0,
      indentCode: initialData?.indentCode || "",
      indentDate: initialData?.indentDate ? new Date(initialData.indentDate) : new Date(),
      indentType: initialData?.indentType || "",
      indentTypeValue: initialData?.indentTypeValue || "",
      fromDeptID: selectedDepartment.deptID,
      fromDeptName: selectedDepartment.department,
      toDeptID: initialData?.toDeptID || 0,
      toDeptName: initialData?.toDeptName || "",
      pChartID: initialData?.pChartID || 0,
      pChartCode: initialData?.pChartCode || "",
      autoIndentYN: initialData?.autoIndentYN || "N",
      indentAcknowledgement: initialData?.indentAcknowledgement || "",
      rNotes: initialData?.rNotes || "",
      rActiveYN: initialData?.rActiveYN || "Y",
      transferYN: initialData?.transferYN || "N",
    }),
    [initialData, selectedDepartment]
  );

  useEffect(() => {
    if (open && !isFormInitialized) {
      reset(defaultValues);
      setIsFormInitialized(true);
      setHasGeneratedCode(!!initialData);
      setIsDataFetched(false);
      setindentDetails([]);
      setSelectedProduct(null);
      setSelectedPatient(null);
      setFormError(null);
    }
  }, [open, defaultValues, reset, isFormInitialized, initialData]);

  useEffect(() => {
    if (!open) {
      setIsFormInitialized(false);
      setIsDataFetched(false);
    }
  }, [open]);

  const fetchPatientById = async (pChartID: number): Promise<PatientOption | null> => {
    try {
      return null;
    } catch (error) {
      return null;
    }
  };

  const createFallbackPatientOption = (pChartID: number, pChartCode: string): PatientOption => {
    return {
      pChartID: pChartID,
      pChartCode: pChartCode,
      pfName: "",
      plName: "",
      fullName: `Patient ${pChartCode}`,
      pAddPhone1: "",
      pDob: null,
    };
  };

  useEffect(() => {
    const fetchindentDetails = async () => {
      if (open && isFormInitialized && !isAddMode && initialData?.indentID && !isDataFetched) {
        try {
          setLoading(true);
          const response = await getIndentById(initialData.indentID);
          if (response) {
            if (response.indentMaster) {
              const masterData = response.indentMaster;

              // ... existing form values setup ...
              const formValues = {
                indentID: masterData.indentID || 0,
                indentCode: masterData.indentCode || "",
                indentDate: masterData.indentDate ? new Date(masterData.indentDate) : new Date(),
                indentType: masterData.indentType || "",
                indentTypeValue: masterData.indentTypeValue || "",
                fromDeptID: selectedDepartment.deptID,
                fromDeptName: selectedDepartment.department,
                toDeptID: masterData.toDeptID || 0,
                toDeptName: masterData.toDeptName || "",
                pChartID: masterData.pChartID || 0,
                pChartCode: masterData.pChartCode || "",
                autoIndentYN: masterData.autoIndentYN || "N",
                indentAcknowledgement: masterData.indentAcknowledgement || "",
                rNotes: masterData.rNotes || "",
                rActiveYN: masterData.rActiveYN || "Y",
                transferYN: masterData.transferYN || "N",
              };
              reset(formValues);
              if (masterData.pChartID && masterData.pChartCode) {
                try {
                  const completePatientData = await fetchPatientById(masterData.pChartID);
                  if (completePatientData) {
                    setSelectedPatient(completePatientData);
                  } else {
                    const fallbackPatient = createFallbackPatientOption(masterData.pChartID, masterData.pChartCode);
                    setSelectedPatient(fallbackPatient);
                  }
                } catch (error) {
                  const fallbackPatient = createFallbackPatientOption(masterData.pChartID, masterData.pChartCode);
                  setSelectedPatient(fallbackPatient);
                }
              } else {
                setSelectedPatient(null);
              }
            }
            if (response.indentDetails && response.indentDetails.length > 0) {
              const transformedDetails = response.indentDetails.map((detail, index) => {
                const uniqueId = detail.indentDetID && detail.indentDetID > 0 ? detail.indentDetID : `existing-${index}-${Date.now()}`;
                const pChartID = response.indentMaster?.pChartID || 0;
                const pChartCode = response.indentMaster?.pChartCode || "";
                const selectedUnit = productOptions?.find((unit) => unit.value === String(detail.pUnitID));
                const unitName = selectedUnit ? selectedUnit.label : detail.pUnitName || "";
                return {
                  ...detail,
                  id: uniqueId,
                  isNew: false,
                  tempId: `existing-${index}`,
                  pChartID: pChartID,
                  pChartCode: pChartCode,
                  pUnitName: unitName,
                };
              });
              setindentDetails(transformedDetails);
            } else {
              setindentDetails([]);
            }
          }
          setIsDataFetched(true);
        } catch (error) {
          showAlert("Error", "Failed to fetch indent details", "error");
          setIsDataFetched(true);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchindentDetails();
  }, [open, isFormInitialized, isAddMode, initialData?.indentID, isDataFetched, getIndentById, setLoading, showAlert, reset, selectedDepartment]);

  useEffect(() => {
    if (isAddMode && selectedDepartment.deptID && !hasGeneratedCode && isFormInitialized) {
      generateIndentCode().then(() => {
        setHasGeneratedCode(true);
      });
    }
  }, [isAddMode, selectedDepartment.deptID, hasGeneratedCode, generateIndentCode, isFormInitialized]);

  const performReset = useCallback(() => {
    const resetValues = {
      indentID: initialData?.indentID || 0,
      indentCode: initialData?.indentCode || "",
      indentDate: initialData?.indentDate ? new Date(initialData.indentDate) : new Date(),
      indentType: initialData?.indentType || "",
      indentTypeValue: initialData?.indentTypeValue || "",
      fromDeptID: selectedDepartment.deptID,
      fromDeptName: selectedDepartment.department,
      toDeptID: initialData?.toDeptID || 0,
      toDeptName: initialData?.toDeptName || "",
      pChartID: initialData?.pChartID || 0,
      pChartCode: initialData?.pChartCode || "",
      autoIndentYN: initialData?.autoIndentYN || "N",
      indentAcknowledgement: initialData?.indentAcknowledgement || "",
      rNotes: initialData?.rNotes || "",
      rActiveYN: initialData?.rActiveYN || "Y",
      transferYN: initialData?.transferYN || "N",
    };
    reset(resetValues);
    if (isAddMode) {
      setindentDetails([]);
    } else {
      setIsDataFetched(false);
    }
    setSelectedProduct(null);
    setSelectedPatient(null);
    setFormError(null);
    setClearPatientTrigger((prev) => prev + 1);
    productSearchRef.current?.clearSelection();

    if (isAddMode) {
      generateIndentCode();
    }
  }, [reset, initialData, selectedDepartment, isAddMode, generateIndentCode]);

  const fetchProductDetails = async (productID: number) => {
    try {
      setLoading(true);
      const [productRes, productOverviewRes] = await Promise.all([productListService.getById(productID), productOverviewService.getAll()]);
      const product: ProductListDto = productRes.data ?? ({} as ProductListDto);

      if (!product || !product.productID) {
        showAlert("Warning", "Product data not found.", "warning");
        return;
      }

      const productOverview = productOverviewRes.data?.find((p: ProductOverviewDto) => p.productID === productID) || {
        stockLevel: 0,
        avgDemand: 0,
        reOrderLevel: 0,
        minLevelUnits: 0,
        maxLevelUnits: 0,
        productLocation: "",
      };

      const selectedUnit = productOptions?.find((unit) => unit.value === String(product.issueUnit));
      const unitName = selectedUnit ? selectedUnit.label : "";
      const indentID = initialData?.indentID || 0;
      const tempId = `temp-${Date.now()}`;
      const newRow: IndentDetailRow = {
        indentDetID: 0,
        indentID: indentID,
        productID: product.productID,
        productCode: product.productCode ?? "",
        productName: product.productName ?? product.catValue ?? "—",
        catValue: product.catValue ?? "",
        catDesc: product.catDescription ?? "",
        pGrpID: product.pGrpID,
        pGrpName: product.productGroupName ?? "",
        psGrpID: product.psGrpID,
        psGrpName: product.psGroupName ?? "",
        baseUnit: product.baseUnit ?? 1,
        package: product.productPackageName ?? "",
        ppkgID: product.pPackageID ?? 0,
        ppkgName: product.productPackageName ?? "",
        pUnitID: product.issueUnit ? product.issueUnit : 0,
        pUnitName: unitName,
        hsnCode: product.hsnCODE ?? "",
        manufacturerID: product.manufacturerID,
        manufacturerCode: product.manufacturerCode,
        manufacturerName: product.manufacturerName,
        mfName: product.mfName ?? "",
        supplierID: 0,
        supplierName: "",
        qoh: productOverview.stockLevel ?? 0,
        average: productOverview.avgDemand ?? 0,
        averageDemand: productOverview.avgDemand ?? 0,
        reOrderLevel: productOverview.reOrderLevel ?? 0,
        rOL: productOverview.reOrderLevel ?? 0,
        minLevelUnits: productOverview.minLevelUnits ?? 0,
        maxLevelUnits: productOverview.maxLevelUnits ?? 0,
        Location: productOverview.productLocation ?? product.productLocation ?? "",
        StockLevel: productOverview.stockLevel ?? 0,
        requiredQty: 1,
        requiredUnitQty: 1,
        receivedQty: 0,
        netValue: 0,
        leadTime: product.leadTime ?? 0,
        tax: product.gstPerValue ?? 0,
        cgstPerValue: product.cgstPerValue ?? 0,
        sgstPerValue: product.sgstPerValue ?? 0,
        expiryYN: product.expiry ?? "N",
        rActiveYN: product.rActiveYN ?? "Y",
        transferYN: product.transferYN ?? "N",
        rNotes: product.rNotes ?? "",
        units: product.issueUnit ? String(product.issueUnit) : "",
        unitsPackage: product.unitPack ?? 1,
        unitPack: product.unitPack ?? 1,
        deptIssualYN: "N",
        indentDetStatusCode: "PENDING",
        indGrnDetStatusCode: "PENDING",
        groupName: product.productGroupName ?? "",
        Roq: productOverview.reOrderLevel ?? 0,
        poNo: 0,
        deptIssualID: 0,
        grnDetID: 0,
        imrMedID: 0,
        isNew: true,
        tempId: tempId,
        id: tempId,
        pChartID: selectedPatient?.pChartID ?? 0,
        pChartCode: selectedPatient?.pChartCode ?? "",
      };

      const updatedGrid = [...indentDetails, newRow];
      setindentDetails(updatedGrid);
    } catch (err) {
      showAlert("Error", "Failed to fetch product details.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCellValueChange = useCallback((rowIndex: number, field: keyof IndentDetailRow, value: any) => {
    setindentDetails((prev) => prev.map((item, index) => (index === rowIndex ? { ...item, [field]: value } : item)));
  }, []);

  const renderNumberField = (params: GridRenderCellParams, field: keyof IndentDetailRow) => (
    <TextField
      size="small"
      type="number"
      value={params.row[field] || ""}
      onChange={(e) => {
        const rowIndex = indentDetails.findIndex((item) => item.id === params.id);
        if (rowIndex !== -1) {
          handleCellValueChange(rowIndex, field, parseFloat(e.target.value) || 0);
        }
      }}
      sx={{ width: "100%" }}
      inputProps={{ style: { textAlign: "right" } }}
      disabled={viewOnly}
    />
  );

  const renderDisabledNumberField = (params: GridRenderCellParams, field: keyof IndentDetailRow) => (
    <TextField size="small" type="number" value={params.row[field] ?? 0} disabled sx={{ width: "100%" }} inputProps={{ style: { textAlign: "right" } }} />
  );

  const renderSelect = (params: GridRenderCellParams, valueField: keyof IndentDetailRow, nameField: keyof IndentDetailRow, options: { value: string; label: string }[]) => (
    <Select
      size="small"
      value={params.row[valueField] || ""}
      onChange={(e) => {
        const value = e.target.value;
        const selectedOption = options.find((opt) => opt.value === value);
        const rowIndex = indentDetails.findIndex((item) => item.id === params.id);

        if (rowIndex !== -1 && selectedOption) {
          handleCellValueChange(rowIndex, valueField, selectedOption.value);
          handleCellValueChange(rowIndex, nameField, selectedOption.label);
        }
      }}
      sx={{ width: "100%" }}
      displayEmpty
      disabled={viewOnly}
      renderValue={(selected) => {
        if (!selected) return "Select an Option";
        const selectedStr = String(selected);
        const opt = options.find((o) => String(o.value) === selectedStr);
        return opt ? opt.label : selectedStr;
      }}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  );

  const handleClearPatient = useCallback(() => {
    setSelectedPatient(null);
    setClearPatientTrigger((prev) => prev + 1);
    setValue("pChartID", 0);
    setValue("pChartCode", "");
    showAlert("Success", "Patient selection cleared", "success");
  }, [setValue, showAlert]);

  const handlePatientSelect = useCallback(
    (patient: PatientSearchResult | null) => {
      if (patient) {
        const patientOption: PatientOption = {
          pChartID: patient.pChartID,
          pChartCode: patient.pChartCode,
          pfName: "",
          plName: "",
          fullName: patient.fullName,
          pAddPhone1: "",
          pDob: null,
        };
        setSelectedPatient(patientOption);
        setValue("pChartID", patient.pChartID);
        setValue("pChartCode", patient.pChartCode);
      } else {
        setSelectedPatient(null);
        setValue("pChartID", 0);
        setValue("pChartCode", "");
      }
    },
    [setValue]
  );

  const handleProductSelect = useCallback((product: ProductSearchResult | null) => {
    setSelectedProduct(product);
  }, []);

  const handleAddProduct = useCallback(async () => {
    if (!selectedProduct) {
      showAlert("Warning", "Please select a product", "warning");
      return;
    }
    const existingProduct = indentDetails.find((detail) => detail.productID === selectedProduct.productID);
    if (existingProduct) {
      const confirmed = await new Promise<boolean>((resolve) => {
        showAlert("Duplicate Product", "This product is already in the grid. Are you sure you want to add it again?", "warning", {
          showConfirmButton: true,
          showCancelButton: true,
          confirmButtonText: "Yes, Add it",
          cancelButtonText: "No, Cancel",
          onConfirm: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });
      if (!confirmed) {
        setSelectedProduct(null);
        productSearchRef.current?.clearSelection();
        return;
      }
    }
    await fetchProductDetails(selectedProduct.productID);
    setSelectedProduct(null);
    productSearchRef.current?.clearSelection();
  }, [selectedProduct, indentDetails, showAlert, fetchProductDetails]);

  const handleRemoveProduct = useCallback(
    (id: string | number) => {
      showAlert("Confirm Deletion", "Are you sure you want to delete this product?", "warning", {
        onConfirm: () => {
          setindentDetails((prev) => prev.filter((detail) => detail.id !== id));
        },
        onCancel: () => {},
      });
    },
    [showAlert]
  );

  const handleToDepartmentChange = useCallback(
    (value: any) => {
      try {
        let deptId = "";
        if (typeof value === "object" && value !== null) {
          deptId = value.target?.value !== undefined ? value.target.value : value.value !== undefined ? value.value : "";
        } else {
          deptId = String(value);
        }

        if (!deptId) {
          setValue("toDeptID", 0);
          setValue("toDeptName", "");
          return;
        }

        const dept = departments?.find((d: any) => d.value === deptId);
        if (dept) {
          setValue("toDeptID", parseInt(deptId));
          setValue("toDeptName", dept.label ?? "");
        } else {
          showAlert("Warning", "Selected department not found in the options. Please select a valid department.", "warning");
        }
      } catch (error) {
        showAlert("Error", "An error occurred while processing department selection. Please try again.", "error");
      }
    },
    [departments, setValue, showAlert]
  );

  const detailColumns: GridColDef[] = useMemo(
    () => [
      {
        field: "supplierName",
        headerName: "Supplier Name",
        width: 150,
        sortable: false,
        renderCell: (params) => renderSelect(params, "supplierID", "supplierName", supplierOptions || []),
      },
      {
        field: "productName",
        headerName: "Product Name",
        width: 180,
        sortable: false,
      },
      {
        field: "hsnCode",
        headerName: "HSN Code",
        width: 100,
        sortable: false,
      },
      {
        field: "Location",
        headerName: "Location",
        width: 120,
        sortable: false,
      },
      {
        field: "manufacturerName",
        headerName: "Manufacturer",
        width: 150,
        sortable: false,
      },
      {
        field: "requiredQty",
        headerName: "Required Qty",
        width: 110,
        sortable: false,
        renderCell: (params) => renderNumberField(params, "requiredQty"),
      },
      {
        field: "netValue",
        headerName: "Net Value",
        width: 110,
        sortable: false,
        renderCell: (params) => renderDisabledNumberField(params, "netValue"),
      },
      {
        field: "requiredUnitQty",
        headerName: "Units/Package",
        width: 120,
        sortable: false,
        renderCell: (params) => renderNumberField(params, "requiredUnitQty"),
      },
      {
        field: "pUnitName",
        headerName: "Units",
        width: 150,
        sortable: false,
        renderCell: (params) => renderSelect(params, "pUnitID", "pUnitName", productOptions || []),
      },
      {
        field: "ppkgName",
        headerName: "Package",
        width: 150,
        sortable: false,
        renderCell: (params) => renderSelect(params, "ppkgID", "ppkgName", packageOptions || []),
      },
      {
        field: "groupName",
        headerName: "Group Name",
        width: 120,
        sortable: false,
      },
      {
        field: "maxLevelUnits",
        headerName: "Maximum Level Units",
        width: 150,
        sortable: false,
      },
      {
        field: "minLevelUnits",
        headerName: "Minimum Level Units",
        width: 150,
        sortable: false,
      },
      {
        field: "StockLevel",
        headerName: "Stock Level",
        width: 100,
        sortable: false,
      },
      {
        field: "baseUnit",
        headerName: "Base Unit",
        width: 100,
        sortable: false,
      },
      {
        field: "leadTime",
        headerName: "Lead Time",
        width: 100,
        sortable: false,
      },
      {
        field: "qoh",
        headerName: "QOH [Units]",
        width: 120,
        sortable: false,
      },
      {
        field: "averageDemand",
        headerName: "Average Demand",
        width: 130,
        sortable: false,
      },
      {
        field: "Roq",
        headerName: "ROQ",
        width: 80,
        sortable: false,
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Delete",
        width: 70,
        getActions: (params) => [
          <GridActionsCellItem
            icon={
              <Tooltip title="Remove Product">
                <DeleteIcon color="error" />
              </Tooltip>
            }
            label="Remove"
            onClick={() => handleRemoveProduct(params.id)}
            disabled={viewOnly}
            showInMenu={false}
          />,
        ],
      },
    ],
    [supplierOptions, packageOptions, productOptions, viewOnly, handleRemoveProduct]
  );
  const visibleColumns = viewOnly ? detailColumns.filter((col) => col.field !== "actions") : detailColumns;

  const onSubmit = async (data: IndentFormData) => {
    if (viewOnly) return;
    if (!data.indentTypeValue || !data.indentCode) {
      showAlert("Error", "Indent Type and Indent Code are required.", "error");
      return;
    }
    if (indentDetails.length === 0) {
      showAlert("Warning", "Please add at least one product to the indent", "warning");
      return;
    }
    if (!data.toDeptID) {
      showAlert("Error", "To Department is required.", "error");
      return;
    }
    if ((data.indentTypeValue === "departmentIndent01" || data.indentType === "Patient Indent") && !data.pChartID) {
      showAlert("Warning", "Please select a patient for patient indent", "warning");
      return;
    }
    const validindentDetails = indentDetails.filter((detail) => detail.productID && (detail.requiredQty || 0) > 0);
    if (validindentDetails.length === 0) {
      showAlert("Error", "Indent Details cannot be empty or incomplete.", "error");
      return;
    }
    setFormError(null);
    try {
      setIsSaving(true);
      setLoading(true);
      const isUpdate = initialData && initialData.indentID > 0;
      const indentID = isUpdate ? initialData.indentID : 0;
      const indentMaster: IndentMastDto = {
        indentID: indentID,
        indentCode: data.indentCode,
        indentDate: data.indentDate,
        indentType: data.indentType || data.indentTypeValue,
        indentTypeValue: data.indentTypeValue,
        fromDeptID: data.fromDeptID,
        fromDeptName: data.fromDeptName,
        toDeptID: data.toDeptID || 0,
        toDeptName: data.toDeptName || "",
        pChartID: data.pChartID || 0,
        pChartCode: data.pChartCode || "",
        autoIndentYN: data.autoIndentYN,
        indentApprovedYN: "N",
        indentAcknowledgement: data.indentAcknowledgement || "",
        indStatusCode: "PENDING",
        indStatus: "Pending",
        rActiveYN: data.rActiveYN,
        transferYN: data.transferYN,
        rNotes: data.rNotes || "",
      };

      const indentDetailsData: IndentDetailDto[] = validindentDetails.map((detail) => {
        const { isNew, tempId, id, ...cleanDetail } = detail;
        return {
          ...cleanDetail,
          indentID: indentID,
        };
      });

      const saveRequest: IndentSaveRequestDto = {
        indentMaster: indentMaster,
        indentDetails: indentDetailsData,
      };
      const response = await saveIndent(saveRequest);
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

  const handleReset = useCallback(() => {
    if (isDirty || indentDetails.length > 0) {
      setShowResetConfirmation(true);
    } else {
      performReset();
    }
  }, [isDirty, indentDetails.length, performReset]);

  const handleCancel = useCallback(() => {
    if (isDirty || indentDetails.length > 0) {
      setShowCancelConfirmation(true);
    } else {
      onClose();
    }
  }, [isDirty, indentDetails.length, onClose]);

  const getIndentTypeInfo = (type: string) => {
    if (type === "departmentIndent" || type === "Department Indent") {
      return { icon: DepartmentIcon, label: "Department Indent", color: theme.palette.primary.main };
    } else if (type === "departmentIndent01" || type === "Patient Indent") {
      return { icon: PatientIcon, label: "Patient Indent", color: theme.palette.success.main };
    } else if (type === "Purchase Indent") {
      return { icon: PurchaseIcon, label: "Purchase Indent", color: theme.palette.warning.main };
    } else {
      return { icon: DepartmentIcon, label: "Department Indent", color: theme.palette.primary.main };
    }
  };

  const currentTypeInfo = getIndentTypeInfo(watchedIndentTypeValue);
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
          <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={CancelIcon} disabled={isSaving || (!isDirty && indentDetails.length === 0)} />
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
            disabled={isSaving || !isValid || indentDetails.length === 0}
          />
        </Box>
      </Box>
    );
  }, [viewOnly, handleCancel, handleReset, handleSubmit, onSubmit, onClose, isSaving, isDirty, isValid, indentDetails.length, isAddMode]);

  const toDepartmentOptions = useMemo(() => {
    return (departments || [])
      .filter((d: any) => d.value !== watchedFromDeptID.toString() && d.isStoreYN === "Y")
      .map((dept: any) => ({
        value: parseInt(dept.value.toString()),
        label: dept.label,
      }));
  }, [departments, watchedFromDeptID]);

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
        <Box component="form" noValidate sx={{ p: 2 }}>
          {formError && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setFormError(null)}>
              {formError}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: alpha(currentTypeInfo.color, 0.05),
                  borderLeft: `4px solid ${currentTypeInfo.color}`,
                  mb: 2,
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={2}>
                    <currentTypeInfo.icon sx={{ color: currentTypeInfo.color, fontSize: 36 }} />
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color={currentTypeInfo.color}>
                        {currentTypeInfo.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        From: {selectedDepartment.department}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Badge badgeContent={indentDetails.length} color="primary" showZero sx={{ "& .MuiBadge-badge": { fontSize: "0.8rem", height: "22px", minWidth: "22px" } }}>
                      <Chip icon={<InventoryIcon />} label="Products" variant="outlined" color="primary" />
                    </Badge>
                    <FormField name="rActiveYN" control={control} label="Active" type="switch" disabled={viewOnly} size="small" />
                  </Box>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Card variant="outlined" sx={{ borderLeft: "3px solid #1976d2" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                    <AssignmentIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <FormField name="indentCode" control={control} label="Indent Code" type="text" required disabled={viewOnly || !isAddMode} size="small" fullWidth />
                        {!viewOnly && isAddMode && (
                          <SmartButton
                            text="Generate"
                            onClick={generateIndentCode}
                            variant="outlined"
                            size="small"
                            icon={RefreshIcon}
                            disabled={isGeneratingCode}
                            asynchronous={true}
                            showLoadingIndicator={true}
                            loadingText="..."
                          />
                        )}
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormField name="indentDate" control={control} label="Indent Date" type="datepicker" required disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormField
                        name="indentTypeValue"
                        control={control}
                        label="Indent Type"
                        type="select"
                        required
                        disabled={viewOnly}
                        options={(departmentIndent ?? []).map((item) => ({
                          value: item.value,
                          label: item.label,
                        }))}
                        size="small"
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormField name="fromDeptName" control={control} label="From Department" type="text" required disabled={true} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormField
                        name="toDeptID"
                        control={control}
                        type="select"
                        label="To Department"
                        options={toDepartmentOptions}
                        disabled={viewOnly}
                        required
                        size="small"
                        onChange={handleToDepartmentChange}
                        fullWidth
                      />
                    </Grid>

                    {(watchedIndentTypeValue === "departmentIndent01" || watchedIndentTypeValue === "Patient Indent") && (
                      <>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                            <Box sx={{ flexGrow: 1 }}>
                              <PatientSearch
                                onPatientSelect={handlePatientSelect}
                                clearTrigger={clearPatientTrigger}
                                label="Select Patient"
                                disabled={viewOnly}
                                initialSelection={selectedPatient} // This will show the patient name when editing
                              />
                            </Box>
                            <SmartButton text="Clear" onClick={handleClearPatient} variant="outlined" color="error" icon={DeleteIcon} size="small" disabled={viewOnly} />
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Card
                            variant="outlined"
                            sx={{
                              borderRadius: 2,
                              overflow: "hidden",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                              transition: "box-shadow 0.3s ease",
                              "&:hover": {
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              },
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                              width: "100%",
                              mt: 2,
                            }}
                          >
                            <Box
                              sx={{
                                p: 2,
                                borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: 32,
                                  height: 32,
                                  borderRadius: "8px",
                                }}
                              >
                                <PatientIcon sx={{ color: theme.palette.primary.main, fontSize: 18 }} />
                              </Box>
                              <Typography variant="h6" fontWeight="600" color="primary.main">
                                Patient Demographics
                              </Typography>
                              <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: alpha(theme.palette.primary.main, 0.2) }} />
                              <Typography variant="body2" color="text.secondary">
                                {selectedPatient ? "View patient details" : "Select a patient to view details"}
                              </Typography>
                            </Box>
                            <CardContent sx={{ p: 2 }}>
                              {selectedPatient ? (
                                <PatientDemographics
                                  pChartID={selectedPatient.pChartID}
                                  showEditButton={true}
                                  showRefreshButton={true}
                                  onEditClick={() => showAlert("Info", "Edit patient clicked", "info")}
                                  variant="detailed"
                                  emptyStateMessage="No demographics information available"
                                />
                              ) : (
                                <Paper
                                  sx={{
                                    p: 4,
                                    textAlign: "center",
                                    borderRadius: 2,
                                    border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      width: 64,
                                      height: 64,
                                      borderRadius: "50%",
                                      mx: "auto",
                                      mb: 2,
                                    }}
                                  >
                                    <PatientIcon sx={{ fontSize: 32, color: alpha(theme.palette.primary.main, 0.7) }} />
                                  </Box>
                                  <Typography variant="h6" fontWeight="600" color="text.primary" gutterBottom>
                                    No Patient Selected
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: "auto" }}>
                                    Use the patient search above to select a patient and view their demographics information
                                  </Typography>
                                </Paper>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      </>
                    )}

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box>
                        <FormField name="autoIndentYN" control={control} label="Auto Indent" type="switch" disabled={viewOnly} size="small" />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                          Enable automatic indent generation based on stock levels
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {!viewOnly && (
              <Grid size={{ xs: 12 }}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    transition: "box-shadow 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    },
                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      borderBottom: `1px solid ${alpha(theme.palette.success.main, 0.12)}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 32,
                        height: 32,
                        borderRadius: "8px",
                      }}
                    >
                      <AddProductIcon sx={{ color: theme.palette.success.main, fontSize: 18 }} />
                    </Box>
                    <Typography variant="h6" fontWeight="600" color="success.main">
                      Add Products
                    </Typography>
                    <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: alpha(theme.palette.success.main, 0.2) }} />
                    <Typography variant="body2" color="text.secondary">
                      Search and add products to this indent
                    </Typography>
                  </Box>
                  <CardContent sx={{ pt: 3 }}>
                    <Grid container spacing={2} alignItems="end">
                      <Grid size={{ xs: 12, md: 9 }}>
                        <ProductSearch ref={productSearchRef} onProductSelect={handleProductSelect} label="Select Product" disabled={viewOnly} className="product-search-field" />
                      </Grid>

                      <Grid size={{ xs: 12, md: 3 }}>
                        <SmartButton
                          text="Add Product"
                          onClick={handleAddProduct}
                          variant="contained"
                          color="success"
                          icon={AddIcon}
                          disabled={!selectedProduct}
                          sx={{
                            height: 40,
                            boxShadow: theme.shadows[2],
                            "&:hover": {
                              boxShadow: theme.shadows[4],
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  transition: "box-shadow 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  },
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderBottom: `1px solid ${alpha(theme.palette.info.main, 0.12)}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 32,
                        height: 32,
                        borderRadius: "8px",
                      }}
                    >
                      <ProductListIcon sx={{ color: theme.palette.info.main, fontSize: 18 }} />
                    </Box>
                    <Typography variant="h6" fontWeight="600" color="info.main">
                      Indent Products
                    </Typography>
                    <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: alpha(theme.palette.info.main, 0.2) }} />
                    <Typography variant="body2" color="text.secondary">
                      Manage product quantities and details
                    </Typography>
                  </Box>
                  {indentDetails.length > 0 && (
                    <Chip
                      label={`${indentDetails.length} ${indentDetails.length === 1 ? "Product" : "Products"}`}
                      variant="outlined"
                      color="info"
                      size="small"
                      sx={{
                        fontWeight: "600",
                        borderWidth: 2,
                      }}
                    />
                  )}
                </Box>
                <CardContent sx={{ pt: 3 }}>
                  {indentDetails.length > 0 ? (
                    <Box>
                      <DataGrid
                        rows={indentDetails}
                        columns={visibleColumns}
                        density="compact"
                        disableRowSelectionOnClick
                        hideFooterSelectedRowCount
                        pageSizeOptions={[5, 10, 25, 50]}
                        initialState={{
                          pagination: {
                            paginationModel: { pageSize: 10 },
                          },
                          columns: {
                            columnVisibilityModel: {
                              baseUnit: false,
                              leadTime: false,
                              maxLevelUnits: false,
                              minLevelUnits: false,
                            },
                          },
                        }}
                        onProcessRowUpdateError={(error) => {
                          console.error("Row update error:", error);
                          showAlert("Error", "Failed to update field", "error");
                        }}
                        sx={{
                          "& .MuiDataGrid-cell:focus": {
                            outline: "none",
                          },
                          "& .MuiDataGrid-row:hover": {
                            backgroundColor: alpha(theme.palette.info.main, 0.04),
                          },
                          "& .MuiDataGrid-columnHeaders": {
                            backgroundColor: alpha(theme.palette.info.main, 0.06),
                            borderBottom: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                            fontWeight: "600",
                          },
                          "& .MuiDataGrid-cell": {
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                          },
                          "& .MuiDataGrid-columnHeader:focus": {
                            outline: "none",
                          },
                          "& .MuiDataGrid-columnHeader:focus-within": {
                            outline: "none",
                          },
                        }}
                      />
                    </Box>
                  ) : (
                    <Paper
                      sx={{
                        p: 4,
                        textAlign: "center",
                        borderRadius: 2,
                        border: `2px dashed ${alpha(theme.palette.info.main, 0.3)}`,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 64,
                          height: 64,
                          borderRadius: "50%",
                          mx: "auto",
                          mb: 2,
                        }}
                      >
                        <InventoryIcon sx={{ fontSize: 32, color: alpha(theme.palette.info.main, 0.7) }} />
                      </Box>
                      <Typography variant="h6" fontWeight="600" color="text.primary" gutterBottom>
                        No Products Added
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: "auto", mb: 3 }}>
                        {viewOnly ? "This indent doesn't have any products" : "Use the product search above to add products to this indent"}
                      </Typography>
                      {!viewOnly && (
                        <SmartButton
                          text="Add First Product"
                          variant="outlined"
                          color="info"
                          onClick={() => {
                            const searchField = document.querySelector(".product-search-field input");
                            if (searchField) {
                              (searchField as HTMLInputElement).focus();
                            }
                          }}
                          icon={AddIcon}
                          size="small"
                          sx={{
                            borderWidth: 2,
                            "&:hover": {
                              borderWidth: 2,
                            },
                          }}
                        />
                      )}
                    </Paper>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  transition: "box-shadow 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  },
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderBottom: `1px solid ${alpha(theme.palette.secondary.main, 0.12)}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 32,
                      height: 32,
                      borderRadius: "8px",
                    }}
                  >
                    <InfoIcon sx={{ color: theme.palette.secondary.main, fontSize: 18 }} />
                  </Box>
                  <Typography variant="h6" fontWeight="600" color="secondary.main">
                    Additional Information
                  </Typography>
                  <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: alpha(theme.palette.secondary.main, 0.2) }} />
                  <Typography variant="body2" color="text.secondary">
                    Notes and acknowledgements
                  </Typography>
                </Box>
                <CardContent sx={{ pt: 3 }}>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormField
                        name="indentAcknowledgement"
                        control={control}
                        label="Acknowledgement"
                        type="textarea"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        rows={4}
                        placeholder="Enter acknowledgement or approval notes"
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormField
                        name="rNotes"
                        control={control}
                        label="Notes"
                        type="textarea"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        rows={4}
                        placeholder="Enter any additional notes or special instructions for this indent"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </GenericDialog>

      <ConfirmationDialog
        open={showResetConfirmation}
        onClose={() => setShowResetConfirmation(false)}
        onConfirm={() => {
          performReset();
          setShowResetConfirmation(false);
        }}
        title="Reset Form"
        message="Are you sure you want to reset the form? All unsaved changes and added products will be lost."
        confirmText="Reset"
        cancelText="Cancel"
        type="warning"
        maxWidth="sm"
      />

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
