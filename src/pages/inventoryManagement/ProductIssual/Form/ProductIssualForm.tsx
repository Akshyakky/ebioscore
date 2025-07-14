import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { GrnDetailDto } from "@/interfaces/InventoryManagement/GRNDto";
import { ProductIssualCompositeDto, ProductIssualDetailDto, ProductIssualDto } from "@/interfaces/InventoryManagement/ProductIssualDto";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import { useAlert } from "@/providers/AlertProvider";
import { grnDetailService, productListService } from "@/services/InventoryManagementService/inventoryManagementService";
import { productIssualService } from "@/services/InventoryManagementService/ProductIssualService/ProductIssualService";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Add as AddIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh,
  Save,
  Search as SearchIcon,
  Sync as SyncIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { Alert, Box, Chip, CircularProgress, Grid, IconButton, InputAdornment, Paper, TextField, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { ProductSearch, ProductSearchRef } from "../../CommonPage/Product/ProductSearchForm";
import { useProductIssual } from "../hooks/useProductIssual";

interface ProductIssualFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: ProductIssualDto | null;
  viewOnly?: boolean;
  selectedDepartmentId?: number;
  selectedDepartmentName?: string;
}

const issualDetailSchema = z.object({
  pisDetID: z.number(),
  pisid: z.number(),
  productID: z.number().min(1, "Product is required"),
  productCode: z.string().optional(),
  productName: z.string().min(1, "Product name is required"),
  catValue: z.string().optional(),
  catDesc: z.string().optional(),
  mfID: z.number().optional(),
  mfName: z.string().optional(),
  pUnitID: z.number().optional(),
  pUnitName: z.string().optional(),
  pUnitsPerPack: z.number().optional(),
  pkgID: z.number().optional(),
  pkgName: z.string().optional(),
  batchNo: z.string().optional(),
  expiryDate: z.date().optional(),
  unitPrice: z.number().optional(),
  tax: z.number().optional(),
  cgst: z.number().optional(),
  sgst: z.number().optional(),
  sellUnitPrice: z.number().optional(),
  requestedQty: z.number().min(0, "Requested quantity must be non-negative"),
  issuedQty: z.number().min(0.01, "Issued quantity must be greater than 0"),
  availableQty: z.number().optional(),
  rol: z.number().optional(),
  expiryYN: z.string().optional(),
  psGrpID: z.number().optional(),
  psGrpName: z.string().optional(),
  pGrpID: z.number().optional(),
  pGrpName: z.string().optional(),
  taxID: z.number().optional(),
  taxCode: z.string().optional(),
  taxName: z.string().optional(),
  hsnCode: z.string().optional(),
  mrp: z.number().optional(),
  manufacturerID: z.number().optional(),
  manufacturerCode: z.string().optional(),
  manufacturerName: z.string().optional(),
  psbid: z.number().optional(),
  location: z.string().optional(),
  remarks: z.string().optional(),
});

const schema = z.object({
  pisid: z.number(),
  pisDate: z.date(),
  fromDeptID: z.number().min(1, "From department is required"),
  fromDeptName: z.string(),
  toDeptID: z.number().min(1, "To department is required"),
  toDeptName: z.string(),
  auGrpID: z.number().optional(),
  catDesc: z.string().optional(),
  catValue: z.string().optional(),
  indentNo: z.string().optional(),
  pisCode: z.string().optional(),
  recConID: z.number().optional(),
  recConName: z.string().optional(),
  approvedYN: z.string(),
  approvedID: z.number().optional(),
  approvedBy: z.string().optional(),
  selectedProductBatchNo: z.string().optional(),
  selectedProductQoh: z.number().optional(),
  selectedProductIssuedQty: z.number().min(0.01, "Issued quantity must be greater than 0").optional(),
  details: z.array(issualDetailSchema).min(1, "At least one product detail is required"),
});

type ProductIssualFormData = z.infer<typeof schema>;

type ProductDetailWithId = ProductIssualDetailDto & {
  id: string;
  cgst?: number;
  sgst?: number;
  rol?: number;
  location?: string;
};

const CompleteProductIssualForm: React.FC<ProductIssualFormProps> = ({ open, onClose, initialData, viewOnly = false, selectedDepartmentId, selectedDepartmentName }) => {
  const { setLoading } = useLoading();
  const { getIssualWithDetailsById, saveIssualWithDetails, generateIssualCode } = useProductIssual();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [clearProductSearchTrigger, setClearProductSearchTrigger] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<ProductListDto | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // Updated state to use GrnDetailDto directly
  const [availableBatches, setAvailableBatches] = useState<GrnDetailDto[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<GrnDetailDto | null>(null);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);

  // Debug flag - set to false for production
  const DEBUG_MODE = false;

  const productSearchRef = useRef<ProductSearchRef>(null);
  const { department } = useDropdownValues(["department"]);
  const { showAlert } = useAlert();

  const isAddMode = !initialData;

  const defaultValues: ProductIssualFormData = useMemo(
    () => ({
      pisid: 0,
      pisDate: new Date(),
      fromDeptID: selectedDepartmentId || 0,
      fromDeptName: selectedDepartmentName || "",
      toDeptID: 0,
      toDeptName: "",
      auGrpID: 18,
      catDesc: "REVENUE",
      catValue: "MEDI",
      indentNo: "",
      pisCode: "",
      recConID: 0,
      recConName: "",
      approvedYN: "N",
      approvedID: 0,
      approvedBy: "",
      selectedProductBatchNo: "",
      selectedProductQoh: undefined,
      selectedProductIssuedQty: undefined,
      details: [],
    }),
    [selectedDepartmentId, selectedDepartmentName]
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isDirty, isValid },
  } = useForm<ProductIssualFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "details",
  });

  const fromDeptID = useWatch({ control, name: "fromDeptID" });
  const watchedDetails = useWatch({ control, name: "details" });
  const selectedProductIssuedQty = useWatch({ control, name: "selectedProductIssuedQty" });

  // Helper function to convert GrnDetailDto expiry date string to Date
  const getExpiryDateFromGrn = useCallback(
    (grnDetail: GrnDetailDto): Date | undefined => {
      if (!grnDetail.expiryDate) return undefined;
      try {
        // Handle different date formats that might come from backend
        const dateStr = grnDetail.expiryDate.toString();
        if (DEBUG_MODE) console.log("Raw expiry date from GRN:", dateStr);

        // Try parsing as ISO string first, then as general date
        let parsedDate: Date;
        if (dateStr.includes("T") || dateStr.includes("Z")) {
          // ISO format
          parsedDate = new Date(dateStr);
        } else {
          // Handle various date formats (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, etc.)
          parsedDate = new Date(dateStr);
        }

        // Validate the date
        if (isNaN(parsedDate.getTime())) {
          if (DEBUG_MODE) console.warn("Invalid date format from GRN:", dateStr);
          return undefined;
        }

        if (DEBUG_MODE) console.log("Parsed expiry date:", parsedDate);
        return parsedDate;
      } catch (error) {
        if (DEBUG_MODE) console.error("Error parsing expiry date from GRN:", grnDetail.expiryDate, error);
        return undefined;
      }
    },
    [DEBUG_MODE]
  );

  // Helper function to get available quantity from GrnDetailDto
  const getAvailableQuantity = useCallback((grnDetail: GrnDetailDto): number => {
    return grnDetail.acceptQty || 0;
  }, []);

  // Helper function to get unit price from GrnDetailDto
  const getUnitPrice = useCallback((grnDetail: GrnDetailDto): number => {
    return grnDetail.unitPrice || grnDetail.defaultPrice || 0;
  }, []);

  const statistics = useMemo(() => {
    const totalProducts = watchedDetails?.length || 0;
    const totalRequestedQty = watchedDetails?.reduce((sum, item) => sum + (item.requestedQty || 0), 0) || 0;
    const totalIssuedQty = watchedDetails?.reduce((sum, item) => sum + (item.issuedQty || 0), 0) || 0;
    const zeroQohItems = watchedDetails?.filter((item) => (item.availableQty || 0) === 0).length || 0;
    const expiring30Days =
      watchedDetails?.filter((item) => {
        if (!item.expiryDate) return false;
        const diffTime = new Date(item.expiryDate).getTime() - new Date().getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && diffDays > 0;
      }).length || 0;
    const expiring90Days =
      watchedDetails?.filter((item) => {
        if (!item.expiryDate) return false;
        const diffTime = new Date(item.expiryDate).getTime() - new Date().getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 90 && diffDays > 30;
      }).length || 0;
    const expiredItems =
      watchedDetails?.filter((item) => {
        if (!item.expiryDate) return false;
        return new Date(item.expiryDate) < new Date();
      }).length || 0;

    return {
      totalProducts,
      totalRequestedQty,
      totalIssuedQty,
      zeroQohItems,
      expiring30Days,
      expiring90Days,
      expiredItems,
    };
  }, [watchedDetails]);

  const dataGridRows: GridRowsProp<ProductDetailWithId> = useMemo(() => {
    return fields.map((field, index) => {
      const totalTax = field.tax || 0;
      const cgst = totalTax / 2;
      const sgst = totalTax / 2;
      return {
        pisDetID: field.pisDetID ?? 0,
        pisid: field.pisid ?? 0,
        productID: field.productID ?? 0,
        productCode: field.productCode ?? "",
        productName: field.productName ?? "",
        catValue: field.catValue ?? "MEDI",
        catDesc: field.catDesc ?? "REVENUE",
        mfID: field.mfID ?? 0,
        mfName: field.mfName ?? "",
        pUnitID: field.pUnitID ?? 0,
        pUnitName: field.pUnitName ?? "",
        pUnitsPerPack: field.pUnitsPerPack ?? 1,
        pkgID: field.pkgID ?? 0,
        pkgName: field.pkgName ?? "",
        batchNo: field.batchNo ?? "",
        expiryDate: field.expiryDate,
        unitPrice: field.unitPrice ?? 0,
        tax: field.tax ?? 0,
        cgst: cgst,
        sgst: sgst,
        sellUnitPrice: field.sellUnitPrice ?? 0,
        requestedQty: field.requestedQty ?? 1,
        issuedQty: field.issuedQty ?? 1,
        availableQty: field.availableQty ?? 0,
        rol: field.rol ?? 0,
        expiryYN: field.expiryYN ?? "N",
        psGrpID: field.psGrpID ?? 0,
        psGrpName: field.psGrpName ?? "",
        pGrpID: field.pGrpID ?? 0,
        pGrpName: field.pGrpName ?? "",
        taxID: field.taxID ?? 0,
        taxCode: field.taxCode ?? "",
        taxName: field.taxName ?? "",
        hsnCode: field.hsnCode ?? "",
        mrp: field.mrp ?? 0,
        manufacturerID: field.manufacturerID ?? 0,
        manufacturerCode: field.manufacturerCode ?? "",
        manufacturerName: field.manufacturerName ?? "",
        psbid: field.psbid ?? 0,
        location: field.location ?? "",
        remarks: field.remarks ?? "",
        id: `${field.productID}-${index}`,
      };
    });
  }, [fields]);

  const validateProductForAddition = (selectedProduct: ProductListDto, formValues: any) => {
    const errors: string[] = [];
    const issuedQty = formValues.selectedProductIssuedQty || 0;
    const availableQty = formValues.selectedProductQoh || 0;

    if (issuedQty <= 0) {
      errors.push("Issue quantity must be greater than 0");
    }

    if (issuedQty > availableQty) {
      errors.push(`Issue quantity (${issuedQty}) cannot exceed available quantity (${availableQty})`);
    }

    return errors;
  };

  const generateIssualCodeAsync = async () => {
    const deptId = fromDeptID || selectedDepartmentId;
    if (!isAddMode || !deptId) return;
    try {
      setIsGeneratingCode(true);
      const code = await generateIssualCode(deptId);
      if (code) {
        setValue("pisCode", code, { shouldValidate: true, shouldDirty: true });
      } else {
        showAlert("Warning", "Failed to generate issue code", "warning");
      }
    } catch (error) {
      console.error("Error generating issue code:", error);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  useEffect(() => {
    const deptId = fromDeptID || selectedDepartmentId;
    if (deptId && isAddMode) {
      generateIssualCodeAsync();
    }
  }, [fromDeptID, selectedDepartmentId, isAddMode]);

  useEffect(() => {
    if (initialData) {
      loadIssualDetails();
    } else {
      reset(defaultValues);
    }
  }, [initialData]);

  // Effect to update form values when selectedDepartmentId changes (for new issuals)
  useEffect(() => {
    if (isAddMode && selectedDepartmentId && selectedDepartmentName) {
      setValue("fromDeptID", selectedDepartmentId, { shouldValidate: true, shouldDirty: false });
      setValue("fromDeptName", selectedDepartmentName, { shouldValidate: true, shouldDirty: false });
    }
  }, [isAddMode, selectedDepartmentId, selectedDepartmentName, setValue]);

  // Effect to reset form when defaultValues change (department change)
  useEffect(() => {
    if (isAddMode && !initialData) {
      reset(defaultValues);
    }
  }, [defaultValues, isAddMode, initialData, reset]);

  const loadIssualDetails = async () => {
    if (!initialData) return;
    try {
      setLoading(true);
      const issualWithDetails = await getIssualWithDetailsById(initialData.pisid);
      if (issualWithDetails) {
        const formData: ProductIssualFormData = {
          pisid: issualWithDetails.productIssual.pisid,
          pisDate: new Date(issualWithDetails.productIssual.pisDate),
          fromDeptID: issualWithDetails.productIssual.fromDeptID,
          fromDeptName: issualWithDetails.productIssual.fromDeptName,
          toDeptID: issualWithDetails.productIssual.toDeptID,
          toDeptName: issualWithDetails.productIssual.toDeptName,
          auGrpID: issualWithDetails.productIssual.auGrpID || 18,
          catDesc: issualWithDetails.productIssual.catDesc || "REVENUE",
          catValue: issualWithDetails.productIssual.catValue || "MEDI",
          indentNo: issualWithDetails.productIssual.indentNo || "",
          pisCode: issualWithDetails.productIssual.pisCode || "",
          recConID: issualWithDetails.productIssual.recConID || 0,
          recConName: issualWithDetails.productIssual.recConName || "",
          approvedYN: issualWithDetails.productIssual.approvedYN,
          approvedID: issualWithDetails.productIssual.approvedID || 0,
          approvedBy: issualWithDetails.productIssual.approvedBy || "",
          selectedProductBatchNo: "",
          selectedProductQoh: undefined,
          selectedProductIssuedQty: undefined,
          details: issualWithDetails.details.map((detail) => ({
            pisDetID: detail.pisDetID,
            pisid: detail.pisid,
            productID: detail.productID,
            productCode: detail.productCode || "",
            productName: detail.productName,
            catValue: detail.catValue || "MEDI",
            catDesc: detail.catDesc || "REVENUE",
            mfID: detail.mfID || 0,
            mfName: detail.mfName || "",
            pUnitID: detail.pUnitID || 0,
            pUnitName: detail.pUnitName || "",
            pUnitsPerPack: detail.pUnitsPerPack || 1,
            pkgID: detail.pkgID || 0,
            pkgName: detail.pkgName || "",
            batchNo: detail.batchNo || "",
            expiryDate: detail.expiryDate ? new Date(detail.expiryDate) : undefined,
            unitPrice: detail.unitPrice || 0,
            tax: detail.tax || 0,
            cgst: (detail.tax || 0) / 2,
            sgst: (detail.tax || 0) / 2,
            sellUnitPrice: detail.sellUnitPrice || 0,
            requestedQty: detail.requestedQty,
            issuedQty: detail.issuedQty,
            availableQty: detail.availableQty || 0,
            rol: detail.rol || 0,
            expiryYN: detail.expiryYN || "N",
            psGrpID: detail.psGrpID || 0,
            psGrpName: detail.psGrpName || "",
            pGrpID: detail.pGrpID || 0,
            pGrpName: detail.pGrpName || "",
            taxID: detail.taxID || 0,
            taxCode: detail.taxCode || "",
            taxName: detail.taxName || "",
            hsnCode: detail.hsnCode || "",
            mrp: detail.mrp || 0,
            manufacturerID: detail.manufacturerID || 0,
            manufacturerCode: detail.manufacturerCode || "",
            manufacturerName: detail.manufacturerName || "",
            psbid: detail.psbid || 0,
            location: detail.location || "",
            remarks: detail.remarks || "",
          })),
        };

        reset(formData);
      }
    } catch (error) {
      console.error("Error loading issual details:", error);
      showAlert("Error", "Failed to load issual details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = useCallback(
    async (product: ProductListDto | null) => {
      debugger;
      if (!product?.productID) {
        setSelectedProduct(null);
        setAvailableBatches([]);
        setSelectedBatch(null);
        setValue("selectedProductBatchNo", "");
        setValue("selectedProductQoh", undefined);
        setValue("selectedProductIssuedQty", undefined);
        return;
      }

      if (fields.find((d) => d.productID === product.productID)) {
        showAlert("Warning", `"${product.productName}" is already added to the list.`, "warning");
        productSearchRef.current?.clearSelection();
        return;
      }

      setIsAddingProduct(true);
      setIsLoadingBatches(true);
      try {
        const productData = await productListService.getById(product.productID);
        if (!productData.success || !productData.data) {
          throw new Error("Failed to fetch product details");
        }
        const fullProductData = productData.data;
        setSelectedProduct(fullProductData);
        const grnResponse = await grnDetailService.getById(product.productID);
        if (DEBUG_MODE) console.log("GRN Response for product:", product.productID, grnResponse);
        if (grnResponse.success && grnResponse.data) {
          const grnData = Array.isArray(grnResponse.data) ? grnResponse.data : [grnResponse.data];
          if (DEBUG_MODE) console.log("GRN Data for batches:", grnData);
          const validBatches: GrnDetailDto[] = grnData
            .filter((grn: GrnDetailDto) => {
              if (DEBUG_MODE) {
                console.log("Checking GRN detail:", {
                  batchNo: grn.batchNo,
                  acceptQty: grn.acceptQty,
                  expiryDate: grn.expiryDate,
                  hasValidData: grn && grn.batchNo && grn.acceptQty && grn.acceptQty > 0,
                });
              }
              return grn && grn.batchNo && grn.acceptQty && grn.acceptQty > 0;
            })
            .sort((a: GrnDetailDto, b: GrnDetailDto) => {
              // Sort by expiry date (FEFO - First Expiry First Out)
              const dateA = getExpiryDateFromGrn(a);
              const dateB = getExpiryDateFromGrn(b);
              if (dateA && dateB) {
                return dateA.getTime() - dateB.getTime();
              }
              return 0;
            });

          if (DEBUG_MODE) console.log("Valid batches after filtering and sorting:", validBatches);
          setAvailableBatches(validBatches);

          if (validBatches.length > 0) {
            const firstBatch = validBatches[0];
            if (DEBUG_MODE) console.log("Selected first batch:", firstBatch);
            setSelectedBatch(firstBatch);
            setValue("selectedProductBatchNo", firstBatch.batchNo || "");
            setValue("selectedProductQoh", getAvailableQuantity(firstBatch));
            setValue("selectedProductIssuedQty", 1);
          } else {
            // No batches available from GRN
            showAlert("Warning", "No batch information found for this product in GRN records.", "warning");
            setSelectedBatch(null);
            setValue("selectedProductBatchNo", "");
            setValue("selectedProductQoh", 0);
            setValue("selectedProductIssuedQty", 1);
          }
        } else {
          showAlert("Warning", "No GRN batch data found. Using product default values.", "warning");
          const batchNo = fullProductData.serialNumber || fullProductData.batchNumber || "";
          const availableQty = fullProductData.availableQty || fullProductData.rOL || 0;

          // Create a mock GrnDetailDto for consistency - NO EXPIRY DATE since it's not from GRN
          const mockGrnDetail: GrnDetailDto = {
            grnDetID: 0,
            grnID: 0,
            productID: fullProductData.productID,
            catValue: fullProductData.catValue || "MEDI",
            batchNo,
            acceptQty: availableQty,
            unitPrice: fullProductData.defaultPrice || 0,
            defaultPrice: fullProductData.defaultPrice || 0,
            // Deliberately not setting expiryDate as it should come from GRN
          };

          if (DEBUG_MODE) console.log("Created mock GRN detail (no GRN data available):", mockGrnDetail);
          setSelectedBatch(mockGrnDetail);
          setValue("selectedProductBatchNo", batchNo);
          setValue("selectedProductQoh", availableQty);
          setValue("selectedProductIssuedQty", 1);
        }

        showAlert("Success", `Product "${fullProductData.productName}" selected.`, "success");
        setTimeout(() => {
          const issueQtyField = document.querySelector('input[name="selectedProductIssuedQty"]') as HTMLInputElement;
          if (issueQtyField) {
            issueQtyField.focus();
            issueQtyField.select();
          }
        }, 100);
      } catch (error) {
        console.error("Error fetching product/batch data:", error);
        showAlert("Error", "Failed to fetch product details. Please try again.", "error");

        setSelectedProduct(null);
        setAvailableBatches([]);
        setSelectedBatch(null);
        setValue("selectedProductBatchNo", "");
        setValue("selectedProductQoh", 0);
        setValue("selectedProductIssuedQty", undefined);
      } finally {
        setIsAddingProduct(false);
        setIsLoadingBatches(false);
        productSearchRef.current?.clearSelection();
      }
    },
    [fields, setValue, showAlert, getExpiryDateFromGrn, getAvailableQuantity]
  );

  const handleBatchSelect = useCallback(
    (batchNo: string) => {
      const batch = availableBatches.find((b) => b.batchNo === batchNo);
      if (batch) {
        if (DEBUG_MODE) {
          console.log("Batch selected:", {
            batchNo: batch.batchNo,
            rawExpiryDate: batch.expiryDate,
            parsedExpiryDate: getExpiryDateFromGrn(batch),
            availableQty: getAvailableQuantity(batch),
          });
        }
        setSelectedBatch(batch);
        setValue("selectedProductBatchNo", batch.batchNo || "");
        setValue("selectedProductQoh", getAvailableQuantity(batch));
        setValue("selectedProductIssuedQty", 1);
      }
    },
    [availableBatches, setValue, getAvailableQuantity, getExpiryDateFromGrn, DEBUG_MODE]
  );

  const handleAddToList = useCallback(() => {
    if (!selectedProduct) {
      showAlert("Warning", "Please select a product first", "warning");
      return;
    }

    if (!selectedBatch) {
      showAlert("Warning", "Please select a batch first", "warning");
      return;
    }

    if (fields.find((item) => item.productID === selectedProduct.productID && item.batchNo === selectedBatch.batchNo)) {
      showAlert("Warning", "Product with this batch already exists in the list", "warning");
      return;
    }

    const currentValues = getValues();
    if (!currentValues.selectedProductIssuedQty || currentValues.selectedProductIssuedQty <= 0) {
      showAlert("Error", "Please enter a valid issue quantity greater than 0", "error");
      return;
    }

    const validationErrors = validateProductForAddition(selectedProduct, currentValues);
    if (validationErrors.length > 0) {
      showAlert("Error", validationErrors.join(". "), "error");
      return;
    }

    try {
      const issuedQty = currentValues.selectedProductIssuedQty || 1;
      const totalGst = selectedProduct.gstPerValue || 0;
      const cgst = totalGst / 2;
      const sgst = totalGst / 2;

      // Get expiry date from selected batch
      const batchExpiryDate = getExpiryDateFromGrn(selectedBatch);
      if (DEBUG_MODE) {
        console.log("Adding product to list:", {
          productName: selectedProduct.productName,
          batchNo: selectedBatch.batchNo,
          rawExpiryFromGRN: selectedBatch.expiryDate,
          parsedExpiryDate: batchExpiryDate,
          selectedBatch: selectedBatch,
        });
      }

      const newDetail: ProductIssualDetailDto & { cgst: number; sgst: number; rol: number; location: string } = {
        pisDetID: 0,
        pisid: 0,
        productID: selectedProduct.productID,
        productCode: selectedProduct.productCode || "",
        productName: selectedProduct.productName || "",
        catValue: selectedProduct.catValue || "",
        catDesc: selectedProduct.catDescription || "",
        mfID: selectedProduct.mFID || 0,
        mfName: selectedProduct.MFName || "",
        pUnitID: selectedProduct.pUnitID || 0,
        pUnitName: selectedProduct.pUnitName || "",
        pUnitsPerPack: selectedProduct.unitPack || 1,
        pkgID: selectedProduct.pPackageID || 0,
        pkgName: selectedProduct.productPackageName || "",
        batchNo: selectedBatch.batchNo || "",
        expiryDate: batchExpiryDate, // Use the properly parsed date from GRN
        unitPrice: getUnitPrice(selectedBatch),
        tax: totalGst,
        cgst: cgst,
        sgst: sgst,
        sellUnitPrice: selectedProduct.sellPrice || selectedProduct.defaultPrice || 0,
        requestedQty: issuedQty,
        issuedQty: issuedQty,
        availableQty: getAvailableQuantity(selectedBatch),
        rol: selectedProduct.rOL || 0,
        expiryYN: selectedProduct.expiry || "N",
        psGrpID: selectedProduct.psGrpID || 0,
        psGrpName: selectedProduct.psGroupName || "",
        pGrpID: selectedProduct.pGrpID || 0,
        pGrpName: selectedProduct.productGroupName || "",
        taxID: selectedProduct.taxID || 0,
        taxCode: selectedProduct.taxCode || "",
        taxName: selectedProduct.taxName || "",
        hsnCode: selectedProduct.hsnCODE || "",
        mrp: selectedProduct.mrp || selectedProduct.defaultPrice || 0,
        manufacturerID: selectedProduct.manufacturerID || 0,
        manufacturerCode: selectedProduct.manufacturerCode || "",
        manufacturerName: selectedProduct.manufacturerName || "",
        psbid: selectedProduct.psbid || 0,
        location: selectedProduct.productLocation || "",
        remarks: "",
      };

      if (DEBUG_MODE) console.log("Final detail object being added:", newDetail);
      append(newDetail);
      showAlert("Success", `"${selectedProduct.productName}" (ID: ${selectedProduct.productID}, Batch: ${selectedBatch.batchNo}) added successfully.`, "success");

      // Reset form
      setSelectedProduct(null);
      setAvailableBatches([]);
      setSelectedBatch(null);
      setValue("selectedProductBatchNo", "");
      setValue("selectedProductQoh", undefined);
      setValue("selectedProductIssuedQty", 1);
      setClearProductSearchTrigger((prev) => prev + 1);

      setTimeout(() => {
        const searchField = document.querySelector(".product-search-field input") as HTMLInputElement;
        if (searchField) {
          searchField.focus();
        }
      }, 100);
    } catch (error) {
      console.error("Error adding product to list:", error);
      showAlert("Error", "Failed to add product to list. Please try again.", "error");
    }
  }, [selectedProduct, selectedBatch, fields, append, showAlert, getValues, setValue, getExpiryDateFromGrn, getUnitPrice, getAvailableQuantity]);

  // Custom service wrapper to handle PascalCase transformation
  const saveIssualWithDetailsTransformed = useCallback(async (issualData: ProductIssualCompositeDto) => {
    // Transform camelCase to PascalCase for backend
    const transformedData = {
      productIssual: {
        PISID: issualData.productIssual.pisid,
        PISDate: issualData.productIssual.pisDate,
        FromDeptID: issualData.productIssual.fromDeptID,
        FromDeptName: issualData.productIssual.fromDeptName,
        ToDeptID: issualData.productIssual.toDeptID,
        ToDeptName: issualData.productIssual.toDeptName,
        AuGrpID: issualData.productIssual.auGrpID || 18,
        CatDesc: issualData.productIssual.catDesc || "REVENUE",
        CatValue: issualData.productIssual.catValue || "MEDI",
        IndentNo: issualData.productIssual.indentNo || "",
        PisCode: issualData.productIssual.pisCode || "",
        RecConID: issualData.productIssual.recConID || 0,
        RecConName: issualData.productIssual.recConName || "",
        ApprovedYN: issualData.productIssual.approvedYN || "N",
        ApprovedID: issualData.productIssual.approvedID || 0,
        ApprovedBy: issualData.productIssual.approvedBy || "",
      },
      details: issualData.details.map((detail) => ({
        PISDetID: detail.pisDetID || 0,
        PISID: detail.pisid || 0,
        ProductID: detail.productID,
        ProductCode: detail.productCode || "",
        ProductName: detail.productName,
        CatValue: detail.catValue || "MEDI",
        CatDesc: detail.catDesc || "REVENUE",
        MFID: detail.mfID || 0,
        MFName: detail.mfName || "",
        PUnitID: detail.pUnitID || 0,
        PUnitName: detail.pUnitName || "",
        PUnitsPerPack: detail.pUnitsPerPack || 1,
        PkgID: detail.pkgID || 0,
        PkgName: detail.pkgName || "",
        BatchNo: detail.batchNo || "",
        ExpiryDate: detail.expiryDate,
        UnitPrice: detail.unitPrice || 0,
        Tax: detail.tax || 0,
        SellUnitPrice: detail.sellUnitPrice || 0,
        RequestedQty: detail.requestedQty,
        IssuedQty: detail.issuedQty,
        AvailableQty: detail.availableQty || 0,
        ExpiryYN: detail.expiryYN || "N",
        PSGrpID: detail.psGrpID || 0,
        PSGrpName: detail.psGrpName || "",
        PGrpID: detail.pGrpID || 0,
        PGrpName: detail.pGrpName || "",
        TaxID: detail.taxID || 0,
        TaxCode: detail.taxCode || "",
        TaxName: detail.taxName || "",
        HSNCode: detail.hsnCode || "",
        MRP: detail.mrp || 0,
        ManufacturerID: detail.manufacturerID || 0,
        ManufacturerCode: detail.manufacturerCode || "",
        ManufacturerName: detail.manufacturerName || "",
        PSBID: detail.psbid || 0,
        Remarks: detail.remarks || "",
      })),
    };

    console.log("Transformed data for backend:", JSON.stringify(transformedData, null, 2));

    // Call the actual service with transformed data
    try {
      const response = await productIssualService.createIssualWithDetails(transformedData as any);
      return response;
    } catch (error) {
      console.error("Backend service error:", error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to save issual",
        data: undefined,
      };
    }
  }, []);

  const onSubmit = async (data: ProductIssualFormData) => {
    if (viewOnly) return;
    setFormError(null);
    try {
      setIsSaving(true);
      setLoading(true);

      // Debug logging
      console.log("Form data before validation:", data);

      // Additional validation for department selection
      if (!data.fromDeptID || data.fromDeptID === 0) {
        if (selectedDepartmentId) {
          // If we have selectedDepartmentId but form doesn't, update the form
          setValue("fromDeptID", selectedDepartmentId);
          setValue("fromDeptName", selectedDepartmentName || "");
          data.fromDeptID = selectedDepartmentId;
          data.fromDeptName = selectedDepartmentName || "";
        } else {
          throw new Error("From department is required. Please select a department.");
        }
      }

      if (!data.toDeptID || data.toDeptID === 0) {
        throw new Error("To department is required. Please select a destination department.");
      }

      if (data.fromDeptID === data.toDeptID) {
        throw new Error("From Department and To Department cannot be the same");
      }

      const fromDept = department?.find((d) => Number(d.value) === data.fromDeptID);
      const toDept = department?.find((d) => Number(d.value) === data.toDeptID);

      // Create the composite DTO with proper camelCase structure for frontend validation
      const issualCompositeDto: ProductIssualCompositeDto = {
        productIssual: {
          pisid: data.pisid,
          pisDate: data.pisDate,
          fromDeptID: data.fromDeptID,
          fromDeptName: fromDept?.label || data.fromDeptName,
          toDeptID: data.toDeptID,
          toDeptName: toDept?.label || data.toDeptName,
          auGrpID: data.auGrpID || 18,
          catDesc: data.catDesc || "REVENUE",
          catValue: data.catValue || "MEDI",
          indentNo: data.indentNo || "",
          pisCode: data.pisCode || "",
          recConID: data.recConID || 0,
          recConName: data.recConName || "",
          approvedYN: data.approvedYN || "N",
          approvedID: data.approvedID || 0,
          approvedBy: data.approvedBy || "",
          totalItems: data.details.length,
          totalRequestedQty: data.details.reduce((sum, detail) => sum + detail.requestedQty, 0),
          totalIssuedQty: data.details.reduce((sum, detail) => sum + detail.issuedQty, 0),
        } as ProductIssualDto,
        details: data.details.map(
          (detail) =>
            ({
              pisDetID: detail.pisDetID || 0,
              pisid: detail.pisid || 0,
              productID: detail.productID,
              productCode: detail.productCode || "",
              productName: detail.productName,
              catValue: detail.catValue || "MEDI",
              catDesc: detail.catDesc || "REVENUE",
              mfID: detail.mfID || 0,
              mfName: detail.mfName || "",
              pUnitID: detail.pUnitID || 0,
              pUnitName: detail.pUnitName || "",
              pUnitsPerPack: detail.pUnitsPerPack || 1,
              pkgID: detail.pkgID || 0,
              pkgName: detail.pkgName || "",
              batchNo: detail.batchNo || "",
              expiryDate: detail.expiryDate,
              unitPrice: detail.unitPrice || 0,
              tax: detail.tax || 0,
              sellUnitPrice: detail.sellUnitPrice || 0,
              requestedQty: detail.requestedQty,
              issuedQty: detail.issuedQty,
              availableQty: detail.availableQty || 0,
              expiryYN: detail.expiryYN || "N",
              psGrpID: detail.psGrpID || 0,
              psGrpName: detail.psGrpName || "",
              pGrpID: detail.pGrpID || 0,
              pGrpName: detail.pGrpName || "",
              taxID: detail.taxID || 0,
              taxCode: detail.taxCode || "",
              taxName: detail.taxName || "",
              hsnCode: detail.hsnCode || "",
              mrp: detail.mrp || 0,
              manufacturerID: detail.manufacturerID || 0,
              manufacturerCode: detail.manufacturerCode || "",
              manufacturerName: detail.manufacturerName || "",
              psbid: detail.psbid || 0,
              remarks: detail.remarks || "",
            } as ProductIssualDetailDto)
        ),
      };

      console.log("Frontend DTO (camelCase):", JSON.stringify(issualCompositeDto, null, 2));

      // Use our custom service wrapper that handles PascalCase transformation
      const response = await saveIssualWithDetailsTransformed(issualCompositeDto);

      if (response.success) {
        showAlert("Success", isAddMode ? "Product Issual created successfully" : "Product Issual updated successfully", "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save product issual");
      }
    } catch (error) {
      console.error("Error saving product issual:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save product issual";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const performReset = () => {
    reset(initialData ? undefined : defaultValues);
    setFormError(null);
    setSelectedProduct(null);
    setAvailableBatches([]);
    setSelectedBatch(null);
    setIsAddingProduct(false);
    setClearProductSearchTrigger((prev) => prev + 1);
  };

  const handleReset = () => {
    if (isDirty) {
      setShowResetConfirmation(true);
    } else {
      performReset();
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowCancelConfirmation(true);
    } else {
      onClose();
    }
  };

  const getExpiryWarning = (expiryDate?: Date) => {
    if (!expiryDate) return null;

    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "expired";
    if (diffDays <= 30) return "warning";
    if (diffDays <= 90) return "caution";
    return null;
  };

  const detailColumns: GridColDef[] = [
    {
      field: "slNo",
      headerName: "Sl. No",
      width: 70,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const index = dataGridRows.findIndex((row) => row.id === params.id);
        return index + 1;
      },
    },
    {
      field: "productName",
      headerName: "Product Name",
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
          {params.value || ""}
        </Typography>
      ),
    },
    {
      field: "hsnCode",
      headerName: "HSN Code",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
          {params.value || ""}
        </Typography>
      ),
    },
    {
      field: "manufacturerName",
      headerName: "Manufacturer",
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
          {params.value || ""}
        </Typography>
      ),
    },
    {
      field: "batchNo",
      headerName: "Batch No",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
          {params.value || ""}
        </Typography>
      ),
    },
    {
      field: "pGrpName",
      headerName: "Group",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
          {params.value || ""}
        </Typography>
      ),
    },
    {
      field: "location",
      headerName: "Location",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
          {params.value || ""}
        </Typography>
      ),
    },
    {
      field: "requestedQty",
      headerName: "Required Qty",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: "0.875rem", textAlign: "right" }}>
          {params.value || 0}
        </Typography>
      ),
    },
    {
      field: "availableQty",
      headerName: "QOH(Units)",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: "0.875rem", textAlign: "right" }}>
          {params.value || 0}
        </Typography>
      ),
    },
    {
      field: "issuedQty",
      headerName: "Issued Qty",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const index = fields.findIndex((field) => field.productID === params.row.productID);
        const currentValue = watchedDetails?.[index]?.issuedQty || 0;
        return (
          <TextField
            size="small"
            type="number"
            value={currentValue}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0;
              setValue(`details.${index}.issuedQty`, value, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
            disabled={viewOnly}
            inputProps={{ min: 0.01, step: 0.01 }}
            error={!!errors.details?.[index]?.issuedQty}
            sx={{
              width: "100px",
              "& .MuiInputBase-input": {
                cursor: "text",
                textAlign: "right",
              },
            }}
          />
        );
      },
    },
    {
      field: "expiryDate",
      headerName: "Exp Date",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const warning = getExpiryWarning(params.value);
        const displayDate = params.value ? new Date(params.value).toLocaleDateString() : "";

        return (
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.875rem",
              color: warning === "expired" ? "error.main" : warning === "warning" ? "warning.main" : "inherit",
            }}
          >
            {displayDate}
          </Typography>
        );
      },
    },
    {
      field: "rol",
      headerName: "ROL",
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: "0.875rem", textAlign: "right" }}>
          {params.value || 0}
        </Typography>
      ),
    },
    {
      field: "mrp",
      headerName: "MRP",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: "0.875rem", textAlign: "right" }}>
          ₹{(params.value || 0).toFixed(2)}
        </Typography>
      ),
    },
    {
      field: "tax",
      headerName: "GST %",
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: "0.875rem", textAlign: "right" }}>
          {(params.value || 0).toFixed(2)}%
        </Typography>
      ),
    },
    {
      field: "cgst",
      headerName: "CGST %",
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: "0.875rem", textAlign: "right" }}>
          {(params.value || 0).toFixed(2)}%
        </Typography>
      ),
    },
    {
      field: "sgst",
      headerName: "SGST %",
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: "0.875rem", textAlign: "right" }}>
          {(params.value || 0).toFixed(2)}%
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Delete",
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        if (viewOnly) return null;
        const index = fields.findIndex((field) => field.productID === params.row.productID);
        return (
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              remove(index);
            }}
            sx={{
              bgcolor: "rgba(211, 47, 47, 0.08)",
              "&:hover": { bgcolor: "rgba(211, 47, 47, 0.15)" },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        );
      },
    },
  ];

  const dialogTitle = viewOnly ? "View Product Issual Details" : isAddMode ? "Create New Product Issual" : `Edit Product Issual - ${initialData?.pisCode}`;

  const dialogActions = viewOnly ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton text="Clear" onClick={handleReset} variant="outlined" color="error" disabled={isSaving} />
      <SmartButton
        text="Save"
        onClick={handleSubmit(onSubmit)}
        variant="contained"
        color="success"
        icon={Save}
        asynchronous={true}
        showLoadingIndicator={true}
        loadingText="Saving..."
        successText="Saved!"
        disabled={isSaving || !isValid || fields.length === 0}
      />
    </Box>
  );

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

          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ sm: 12, md: 3 }}>
                <FormField
                  name="pisCode"
                  control={control}
                  label="Issue Code"
                  type="text"
                  required
                  disabled={viewOnly || !isAddMode}
                  size="small"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment:
                      isAddMode && !viewOnly && fromDeptID ? (
                        <InputAdornment position="end">
                          {isGeneratingCode ? (
                            <CircularProgress size={20} />
                          ) : (
                            <IconButton size="small" onClick={generateIssualCodeAsync} title="Generate new code">
                              <Refresh />
                            </IconButton>
                          )}
                        </InputAdornment>
                      ) : null,
                  }}
                />
              </Grid>

              <Grid size={{ sm: 12, md: 3 }}>
                <FormField
                  name="fromDeptID"
                  control={control}
                  label="From Department"
                  type="select"
                  required
                  disabled={viewOnly || (!isAddMode && initialData?.approvedYN === "Y") || (isAddMode && !!selectedDepartmentId)}
                  size="small"
                  options={department || []}
                  fullWidth
                  onChange={(value) => {
                    const selectedDept = department?.find((d) => Number(d.value) === Number(value.value));
                    setValue("fromDeptName", selectedDept?.label || "");
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {isAddMode && selectedDepartmentId ? (
                          <Tooltip title="Auto-populated from selected department">
                            <IconButton size="small" disabled>
                              <CheckIcon />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <IconButton size="small">
                            <SyncIcon />
                          </IconButton>
                        )}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid size={{ sm: 12, md: 3 }}>
                <FormField
                  name="toDeptID"
                  control={control}
                  label="To Department"
                  type="select"
                  required
                  disabled={viewOnly}
                  size="small"
                  options={department?.filter((d) => Number(d.value) !== fromDeptID) || []}
                  fullWidth
                  onChange={(value) => {
                    const selectedDept = department?.find((d) => Number(d.value) === Number(value.value));
                    setValue("toDeptName", selectedDept?.label || "");
                  }}
                />
              </Grid>

              <Grid size={{ sm: 12, md: 3 }}>
                <FormField name="indentNo" control={control} label="Indent No." type="text" disabled={viewOnly} size="small" fullWidth />
              </Grid>
            </Grid>
          </Paper>

          {!viewOnly && (
            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AddIcon color="primary" />
                Add Products
              </Typography>

              <Grid container spacing={2} alignItems="center">
                <Grid size={{ sm: 12, md: 6 }}>
                  <ProductSearch
                    ref={productSearchRef}
                    onProductSelect={handleProductSelect}
                    clearTrigger={clearProductSearchTrigger}
                    label="Product Search"
                    placeholder="Scan barcode or search product name..."
                    disabled={viewOnly || isAddingProduct}
                    className="product-search-field"
                  />
                  {isAddingProduct && (
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        Loading product details...
                      </Typography>
                    </Box>
                  )}
                </Grid>

                <Grid size={{ sm: 6, md: 2 }}>
                  {availableBatches.length > 1 ? (
                    <FormField
                      name="selectedProductBatchNo"
                      control={control}
                      label="Batch No"
                      type="select"
                      disabled={viewOnly || !selectedProduct || isAddingProduct || isLoadingBatches}
                      size="small"
                      fullWidth
                      options={availableBatches.map((batch) => {
                        const expiryDate = getExpiryDateFromGrn(batch);
                        return {
                          value: batch.batchNo || "",
                          label: `${batch.batchNo} (Qty: ${getAvailableQuantity(batch)}${expiryDate ? `, Exp: ${expiryDate.toLocaleDateString()}` : ""})`,
                        };
                      })}
                      onChange={(value) => handleBatchSelect(value.value)}
                    />
                  ) : (
                    <FormField
                      name="selectedProductBatchNo"
                      control={control}
                      label="Batch No"
                      type="text"
                      disabled={viewOnly || !selectedProduct || isAddingProduct || isLoadingBatches}
                      size="small"
                      fullWidth
                      placeholder={isLoadingBatches ? "Loading batches..." : "Auto-filled from GRN"}
                      InputProps={{
                        startAdornment: isLoadingBatches ? (
                          <InputAdornment position="start">
                            <CircularProgress size={16} />
                          </InputAdornment>
                        ) : null,
                      }}
                    />
                  )}
                </Grid>

                <Grid size={{ sm: 6, md: 2 }}>
                  <FormField
                    name="selectedProductQoh"
                    control={control}
                    label="Available Qty"
                    type="number"
                    disabled={viewOnly || !selectedProduct || isAddingProduct || isLoadingBatches}
                    size="small"
                    fullWidth
                    placeholder="Auto-filled from GRN"
                  />
                </Grid>

                <Grid size={{ sm: 6, md: 2 }}>
                  <FormField
                    name="selectedProductIssuedQty"
                    control={control}
                    label="Issue Quantity"
                    type="number"
                    disabled={viewOnly || !selectedProduct || isAddingProduct || isLoadingBatches}
                    size="small"
                    fullWidth
                    inputProps={{ min: 0.01, step: 0.01 }}
                    placeholder="Enter quantity to issue"
                    required
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                <CustomButton
                  variant="contained"
                  text="Add to List"
                  onClick={handleAddToList}
                  disabled={!selectedProduct || !selectedBatch || viewOnly || isAddingProduct || isLoadingBatches || !selectedProductIssuedQty || selectedProductIssuedQty <= 0}
                  icon={AddIcon}
                  color="primary"
                  size="medium"
                />
              </Box>

              {selectedProduct && selectedBatch && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Selected:</strong> {selectedProduct.productName} |<strong> Batch:</strong> {selectedBatch.batchNo} |<strong> Available:</strong>{" "}
                    {getAvailableQuantity(selectedBatch)} units
                    {(() => {
                      const expiryDate = getExpiryDateFromGrn(selectedBatch);
                      if (DEBUG_MODE) {
                        console.log("Displaying expiry date in alert:", {
                          rawDate: selectedBatch.expiryDate,
                          parsedDate: expiryDate,
                        });
                      }
                      return expiryDate ? (
                        <span>
                          {" "}
                          | <strong>Expiry:</strong> {expiryDate.toLocaleDateString()}
                        </span>
                      ) : (
                        <span>
                          {" "}
                          | <strong>Expiry:</strong> Not available
                        </span>
                      );
                    })()}
                  </Typography>
                </Alert>
              )}

              {selectedProduct && availableBatches.length === 0 && !isLoadingBatches && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2">No batch information found in GRN records for this product. Please verify the product has been received through GRN.</Typography>
                </Alert>
              )}
            </Paper>
          )}

          <Paper elevation={1} sx={{ mb: 3 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Product Details
              </Typography>

              {fields.length === 0 ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  No products added yet. Use the product search above to add products.
                </Alert>
              ) : (
                <Box sx={{ height: 400, width: "100%" }}>
                  <DataGrid
                    rows={dataGridRows}
                    columns={detailColumns}
                    pageSizeOptions={[5, 10, 25]}
                    initialState={{
                      pagination: {
                        paginationModel: { page: 0, pageSize: 10 },
                      },
                    }}
                    disableRowSelectionOnClick
                    density="compact"
                    sx={{
                      "& .MuiDataGrid-cell": {
                        borderRight: "1px solid rgba(224, 224, 224, 1)",
                      },
                      "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                        borderBottom: "2px solid rgba(224, 224, 224, 1)",
                      },
                    }}
                  />
                </Box>
              )}

              {errors.details && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  At least one product detail is required
                </Alert>
              )}

              <Box sx={{ mt: 2, p: 2, bgcolor: "background.paper", borderRadius: 1, border: "1px solid", borderColor: "divider" }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Issue Summary
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h6" color="primary">
                        {statistics.totalProducts}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total Products
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h6" color="primary">
                        {statistics.totalIssuedQty}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total Issue Qty
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h6" color={statistics.zeroQohItems > 0 ? "warning.main" : "text.primary"}>
                        {statistics.zeroQohItems}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Zero Stock
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h6" color={statistics.expiredItems > 0 ? "error.main" : "text.primary"}>
                        {statistics.expiredItems}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Expired Items
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {statistics.expiredItems > 0 && <Chip label={`${statistics.expiredItems} Expired Items`} color="error" size="small" icon={<ErrorIcon />} />}
                  {statistics.zeroQohItems > 0 && <Chip label={`${statistics.zeroQohItems} Zero Stock`} color="warning" size="small" icon={<WarningIcon />} />}
                  {statistics.expiring30Days > 0 && <Chip label={`${statistics.expiring30Days} Expiring ≤30 Days`} color="error" size="small" icon={<ErrorIcon />} />}
                  {statistics.expiring90Days > 0 && <Chip label={`${statistics.expiring90Days} Expiring ≤90 Days`} color="info" size="small" icon={<InfoIcon />} />}
                  {statistics.totalProducts === 0 && <Chip label="No products added yet" color="default" size="small" icon={<InfoIcon />} />}
                </Box>
              </Box>
            </Box>
          </Paper>
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
        message="Are you sure you want to reset the form? All unsaved changes will be lost."
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

export default CompleteProductIssualForm;
