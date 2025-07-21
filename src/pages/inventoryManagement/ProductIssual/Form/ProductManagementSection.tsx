import CustomButton from "@/components/Button/CustomButton";
import { GrnDetailDto } from "@/interfaces/InventoryManagement/GRNDto";
import { ProductBatchDto } from "@/interfaces/InventoryManagement/ProductBatchDto";
import { ProductIssualDetailDto } from "@/interfaces/InventoryManagement/ProductIssualDto";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import { BatchSelectionDialog, useBatchSelection } from "@/pages/inventoryManagement/CommonPage/BatchSelectionDialog";
import { billingService } from "@/services/BillingServices/BillingService";
import { grnDetailService, productListService } from "@/services/InventoryManagementService/inventoryManagementService";
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Error as ErrorIcon, Info as InfoIcon, Warning as WarningIcon } from "@mui/icons-material";
import { Alert, Box, Chip, CircularProgress, Grid, IconButton, Paper, TextField, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Control, FieldArrayWithId, FieldErrors, UseFieldArrayAppend, UseFieldArrayRemove, UseFormSetValue, useWatch } from "react-hook-form";
import * as z from "zod";
import { ProductSearch, ProductSearchRef } from "../../CommonPage/Product/ProductSearchForm";

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
  sellUnitPrice: z.number().optional(),
  requestedQty: z.number().min(0, "Requested quantity must be non-negative"),
  issuedQty: z.number().min(0, "Issued quantity must be non-negative"),
  availableQty: z.number().optional(),
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
  rActiveYN: z.string().default("Y"),
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
  rActiveYN: z.string().default("Y"),
  details: z.array(issualDetailSchema).min(1, "At least one product detail is required"),
});

type ProductIssualFormData = z.infer<typeof schema>;
type ProductDetailWithId = ProductIssualDetailDto & {
  id: string;
  cgst?: number;
  sgst?: number;
  // Additional ProductListDto fields for comprehensive display
  barcode?: string;
  vedCode?: string;
  abcCode?: string;
  prescription?: string;
  sellable?: string;
  taxable?: string;
  chargableYN?: string;
  isAssetYN?: string;
  transferYN?: string;
  leadTime?: number;
  leadTimeDesc?: string;
  rOL?: number;
  universalCode?: number;
  cgstPerValue?: number;
  sgstPerValue?: number;
};

interface ProductDetailsSectionProps {
  control: Control<ProductIssualFormData>;
  fields: FieldArrayWithId<ProductIssualFormData, "details", "id">[];
  append: UseFieldArrayAppend<ProductIssualFormData, "details">;
  remove: UseFieldArrayRemove;
  setValue: UseFormSetValue<ProductIssualFormData>;
  errors: FieldErrors<ProductIssualFormData>;
  isViewMode: boolean;
  showAlert: (type: string, message: string, severity: "success" | "error" | "warning" | "info") => void;
}

const ProductDetailsSection: React.FC<ProductDetailsSectionProps> = ({ control, fields, append, remove, setValue, errors, isViewMode, showAlert }) => {
  const [selectedProduct, setSelectedProduct] = useState<ProductListDto | null>(null);
  const [selectedProductIssuedQty, setSelectedProductIssuedQty] = useState<number | undefined>(undefined);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);
  const [isEditingExistingProduct, setIsEditingExistingProduct] = useState(false);
  const [productSearchSelection, setProductSearchSelection] = useState<any>(null);
  const [, setProductSearchInputValue] = useState<string>("");
  const [clearProductSearchTrigger, setClearProductSearchTrigger] = useState(0);
  const productSearchRef = useRef<ProductSearchRef>(null);
  const watchedDetails = useWatch({ control, name: "details" });
  const fromDeptID = useWatch({ control, name: "fromDeptID" });

  // Use the BatchSelectionDialog hook
  const { isDialogOpen: isBatchSelectionDialogOpen, availableBatches, openDialog: openBatchDialog, closeDialog: closeBatchDialog } = useBatchSelection();

  const clearTemporaryFields = useCallback(() => {
    setSelectedProduct(null);
    setSelectedProductIssuedQty(undefined);
    setIsAddingProduct(false);
    setIsLoadingBatches(false);
    setEditingProductIndex(null);
    setIsEditingExistingProduct(false);
    setProductSearchSelection(null);
    setProductSearchInputValue("");
    setClearProductSearchTrigger((prev) => prev + 1);
  }, []);

  // Enhanced helper function to map complete ProductListDto to ProductIssualDetailDto
  const mapCompleteProductListToIssualDetail = useCallback((completeProduct: ProductListDto, batch: ProductBatchDto, issuedQty: number = 0): ProductIssualDetailDto => {
    const safeIssuedQty = Math.max(0, issuedQty);

    // Get requestedQty from ProductListDto - assuming there's a field like 'requestedQuantity' or 'orderQuantity'
    // Replace 'requestedQuantity' with the actual field name from ProductListDto
    // If no such field exists, you can use a default value or get it from another source
    const requestedQtyFromProduct = completeProduct.requestedQuantity || completeProduct.orderQuantity || completeProduct.defaultQuantity || 1;

    return {
      pisDetID: 0,
      pisid: 0,
      productID: completeProduct.productID,
      productCode: completeProduct.productCode || "",
      productName: completeProduct.productName || "",
      catValue: completeProduct.catValue || "MEDI",
      catDesc: completeProduct.catDescription || "REVENUE",
      mfID: completeProduct.mFID || completeProduct.manufacturerID || 0,
      mfName: completeProduct.MFName || completeProduct.manufacturerName || "",
      pUnitID: completeProduct.pUnitID || 0,
      pUnitName: completeProduct.pUnitName || "",
      pUnitsPerPack: completeProduct.unitPack || 1,
      pkgID: completeProduct.pPackageID || 0,
      pkgName: completeProduct.productPackageName || "",
      batchNo: batch.batchNo || "",
      expiryDate: batch.expiryDate ? new Date(batch.expiryDate) : undefined,
      unitPrice: batch.sellingPrice || completeProduct.defaultPrice || 0,
      tax: completeProduct.gstPerValue || 0,
      sellUnitPrice: batch.sellingPrice || completeProduct.defaultPrice || 0,
      requestedQty: requestedQtyFromProduct, // Non-editable, comes from ProductListDto
      issuedQty: safeIssuedQty,
      availableQty: batch.productQOH || 0,
      expiryYN: completeProduct.expiry || "N",
      psGrpID: completeProduct.psGrpID || 0,
      psGrpName: completeProduct.psGroupName || "",
      pGrpID: completeProduct.pGrpID || 0,
      pGrpName: completeProduct.productGroupName || "",
      taxID: completeProduct.taxID || 0,
      taxCode: completeProduct.taxCode || "",
      taxName: completeProduct.taxName || "",
      hsnCode: completeProduct.hsnCODE || "",
      mrp: completeProduct.defaultPrice || 0,
      manufacturerID: completeProduct.manufacturerID || 0,
      manufacturerCode: completeProduct.manufacturerCode || "",
      manufacturerName: completeProduct.manufacturerName || "",
      psbid: batch.grnDetID || 0,
      rActiveYN: completeProduct.rActiveYN || "Y",
      remarks: completeProduct.productNotes || "",
    };
  }, []);

  // Convert GrnDetailDto to ProductBatchDto format for BatchSelectionDialog
  const convertGrnToBatchDto = useCallback(
    (grn: GrnDetailDto, product: ProductListDto): ProductBatchDto => {
      return {
        productID: grn.productID,
        productName: product.productName || "",
        batchNo: grn.batchNo || "",
        expiryDate: grn.expiryDate ? new Date(grn.expiryDate) : undefined,
        grnDetID: grn.grnDetID,
        deptID: fromDeptID || 0,
        deptName: "",
        productQOH: grn.acceptQty || 0,
        sellingPrice: grn.unitPrice || grn.defaultPrice || 0,
      } as ProductBatchDto;
    },
    [fromDeptID]
  );

  // Enhanced handleBatchSelect to fetch complete ProductListDto by productID
  const handleBatchSelect = useCallback(
    async (batch: ProductBatchDto) => {
      try {
        debugger;
        setIsLoadingBatches(true);
        closeBatchDialog();

        const productResponse = await productListService.getById(batch.productID);

        if (!productResponse.success || !productResponse.data) {
          throw new Error(`Failed to fetch complete ProductListDto for productID: ${batch.productID}`);
        }

        const completeProductData = productResponse.data;
        const newProductDetail = mapCompleteProductListToIssualDetail(completeProductData, batch, selectedProductIssuedQty || 0);

        if (isEditingExistingProduct && editingProductIndex !== null) {
          // Update existing product
          setValue(`details.${editingProductIndex}`, newProductDetail, {
            shouldValidate: true,
            shouldDirty: true,
          });
          showAlert("Success", `Product "${completeProductData.productName}" updated successfully`, "success");
        } else {
          // Add new product only if not editing
          append(newProductDetail);
          showAlert("Success", `Product "${completeProductData.productName}" added for batch: ${batch.batchNo}`, "success");
        }

        clearTemporaryFields();
      } catch (error) {
        console.error("Error in handleBatchSelect:", error);
        showAlert("Error", `Failed to fetch product data. Please try again.`, "error");
        clearTemporaryFields();
      } finally {
        setIsLoadingBatches(false);
      }
    },
    [
      selectedProductIssuedQty,
      isEditingExistingProduct,
      editingProductIndex,
      append,
      setValue,
      showAlert,
      closeBatchDialog,
      clearTemporaryFields,
      mapCompleteProductListToIssualDetail,
    ]
  );

  const handleProductSelect = useCallback(
    async (product: ProductListDto | null) => {
      if (!product?.productID) {
        clearTemporaryFields();
        return;
      }

      if (!fromDeptID) {
        showAlert("Warning", "Please select a from department first", "warning");
        return;
      }

      // Only check for duplicate products when adding new (not when editing existing)
      if (!isEditingExistingProduct && fields.find((d) => d.productID === product.productID)) {
        showAlert("Warning", `"${product.productName}" is already added to the list.`, "warning");
        productSearchRef.current?.clearSelection();
        return;
      }

      try {
        setSelectedProduct(product);
        setIsLoadingBatches(true);

        const response = await billingService.getBatchNoProduct(product.productID, fromDeptID);

        if (response.success && response.data) {
          const batches = response.data;

          if (batches.length === 0) {
            showAlert("Warning", "No batches available for this product", "warning");
            clearTemporaryFields();
          } else {
            openBatchDialog(batches);
          }
        } else {
          showAlert("Warning", "Failed to fetch product batches", "warning");
          clearTemporaryFields();
        }
      } catch (error) {
        showAlert("Error", "Failed to fetch product batches", "error");
        clearTemporaryFields();
      } finally {
        setIsLoadingBatches(false);
      }
    },
    [fields, showAlert, fromDeptID, clearTemporaryFields, openBatchDialog, isEditingExistingProduct]
  );

  const handleEditExistingProduct = useCallback(
    async (index: number) => {
      if (isViewMode) return;

      const productDetail = fields[index];
      if (!productDetail) return;

      try {
        // Set editing state first
        setIsEditingExistingProduct(true);
        setEditingProductIndex(index);
        setIsAddingProduct(true);
        setIsLoadingBatches(true);

        const productResponse = await productListService.getById(productDetail.productID);
        if (!productResponse.success || !productResponse.data) {
          throw new Error("Failed to fetch complete ProductListDto for editing");
        }

        const fullProductData = productResponse.data;
        setSelectedProduct(fullProductData);
        setSelectedProductIssuedQty(productDetail.issuedQty || 0);

        const grnResponse = await grnDetailService.getById(productDetail.productID);
        if (grnResponse.success && grnResponse.data) {
          const grnData = Array.isArray(grnResponse.data) ? grnResponse.data : [grnResponse.data];
          const validBatches = grnData
            .filter((grn: GrnDetailDto) => grn && grn.batchNo && grn.acceptQty && grn.acceptQty > 0)
            .sort((a: GrnDetailDto, b: GrnDetailDto) => {
              const dateA = a.expiryDate ? new Date(a.expiryDate).getTime() : 0;
              const dateB = b.expiryDate ? new Date(b.expiryDate).getTime() : 0;
              return dateA - dateB;
            });

          if (validBatches.length > 1) {
            const batchDtos = validBatches.map((grn) => convertGrnToBatchDto(grn, fullProductData));
            openBatchDialog(batchDtos);
          } else if (validBatches.length === 1) {
            const batch = convertGrnToBatchDto(validBatches[0], fullProductData);
            handleBatchSelect(batch);
          }
        }
      } catch (error) {
        showAlert("Error", "Failed to load product data for editing", "error");
        clearTemporaryFields();
      } finally {
        setIsAddingProduct(false);
        setIsLoadingBatches(false);
      }
    },
    [fields, isViewMode, showAlert, clearTemporaryFields, convertGrnToBatchDto, openBatchDialog, handleBatchSelect]
  );

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

      const row: ProductDetailWithId = {
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
        requestedQty: field.requestedQty ?? 0,
        issuedQty: field.issuedQty ?? 0,
        availableQty: field.availableQty ?? 0,
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
        rActiveYN: field.rActiveYN ?? "Y",
        remarks: field.remarks ?? "",
        id: `${field.productID}-${field.pisDetID || index}`,
      };

      return row;
    });
  }, [fields]);

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
      field: "productCode",
      headerName: "Product Code",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
          {params.value || ""}
        </Typography>
      ),
    },
    {
      field: "productName",
      headerName: "Product Name",
      flex: 1,
      minWidth: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Tooltip title={params.value || ""} placement="top">
          <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
            {params.value || ""}
          </Typography>
        </Tooltip>
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
      flex: 0.8,
      minWidth: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Tooltip title={params.value || ""} placement="top">
          <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
            {params.value || ""}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: "batchNo",
      headerName: "Batch No",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: "0.875rem", fontWeight: 500, color: "primary.main" }}>
          {params.value || ""}
        </Typography>
      ),
    },
    {
      field: "pGrpName",
      headerName: "Product Group",
      width: 130,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Tooltip title={params.value || ""} placement="top">
          <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
            {params.value || ""}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: "psGrpName",
      headerName: "Sub Group",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Tooltip title={params.value || ""} placement="top">
          <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
            {params.value || ""}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: "pUnitName",
      headerName: "Unit",
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
          {params.value || ""}
        </Typography>
      ),
    },
    {
      field: "pkgName",
      headerName: "Package",
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
      headerName: "Requested Qty",
      width: 130,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            fontSize: "0.875rem",
            textAlign: "right",
            fontWeight: 500,
            color: "primary.main",
          }}
        >
          {params.row.requestedQty || 0}
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
        <Typography
          variant="body2"
          sx={{
            fontSize: "0.875rem",
            textAlign: "right",
            color: (params.value || 0) === 0 ? "warning.main" : "inherit",
            fontWeight: (params.value || 0) === 0 ? 600 : 400,
          }}
        >
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
        const index = fields.findIndex((field) => {
          if (field.pisDetID && params.row.pisDetID) {
            return field.pisDetID === params.row.pisDetID;
          }
          return field.productID === params.row.productID;
        });

        if (index === -1) {
          return (
            <Typography variant="body2" sx={{ fontSize: "0.875rem", textAlign: "right" }}>
              {params.row.issuedQty || 0}
            </Typography>
          );
        }

        const currentValue = watchedDetails?.[index]?.issuedQty || params.row.issuedQty || 0;
        const availableQty = watchedDetails?.[index]?.availableQty || params.row.availableQty || 0;

        return (
          <TextField
            size="small"
            type="number"
            value={currentValue}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0;

              // Check against availableQty instead of requestedQty
              if (value > availableQty) {
                showAlert("Warning", `Issued quantity (${value}) cannot exceed available quantity (${availableQty})`, "warning");
                return;
              }

              setValue(`details.${index}.issuedQty`, value, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
            disabled={isViewMode}
            inputProps={{ min: 0, max: availableQty, step: 0.01 }} // Use availableQty as max
            error={!!errors.details?.[index]?.issuedQty || currentValue > availableQty}
            helperText={currentValue > availableQty ? "Cannot exceed available qty" : ""}
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
              fontWeight: warning ? 600 : 400,
            }}
          >
            {displayDate}
          </Typography>
        );
      },
    },
    {
      field: "unitPrice",
      headerName: "Unit Price",
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
      field: "taxCode",
      headerName: "Tax Code",
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
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        if (isViewMode) return null;

        const index = fields.findIndex((field) => {
          if (field.pisDetID && params.row.pisDetID) {
            return field.pisDetID === params.row.pisDetID;
          }
          return field.productID === params.row.productID;
        });

        if (index === -1) {
          return null;
        }

        return (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title="Edit Product">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditExistingProduct(index);
                }}
                sx={{
                  bgcolor: "rgba(25, 118, 210, 0.08)",
                  "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Product">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(index);
                  showAlert("Info", `Product "${params.row.productName}" removed from list`, "info");
                }}
                sx={{
                  bgcolor: "rgba(211, 47, 47, 0.08)",
                  "&:hover": { bgcolor: "rgba(211, 47, 47, 0.15)" },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <>
      {!isViewMode && (
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isEditingExistingProduct ? (
              <>
                <EditIcon color="primary" />
                Edit Product
              </>
            ) : (
              <>
                <AddIcon color="primary" />
                Add Products
              </>
            )}
          </Typography>

          <Grid container spacing={2} alignItems="center">
            <Grid size={{ sm: 12, md: 6 }}>
              <ProductSearch
                ref={productSearchRef}
                onProductSelect={handleProductSelect}
                clearTrigger={clearProductSearchTrigger}
                label="Search Product"
                placeholder="Scan barcode or search product name..."
                disabled={isViewMode || isAddingProduct}
                className="product-search-field"
                initialSelection={productSearchSelection}
                setInputValue={setProductSearchInputValue}
                setSelectedProduct={setProductSearchSelection}
              />
              {isAddingProduct && (
                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    Loading product data...
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid size={{ sm: 6, md: 3 }}>
              <TextField
                label="Issue Quantity"
                type="number"
                value={selectedProductIssuedQty || ""}
                onChange={(e) => setSelectedProductIssuedQty(parseFloat(e.target.value) || undefined)}
                disabled={isViewMode || !selectedProduct || isAddingProduct || isLoadingBatches}
                size="small"
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                placeholder="Enter quantity to issue"
              />
            </Grid>

            <Grid size={{ sm: 6, md: 3 }}>
              {isEditingExistingProduct && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip label={`Editing: ${selectedProduct?.productName || "Product"}`} color="primary" size="small" variant="outlined" />
                  <CustomButton variant="outlined" text="Cancel Edit" onClick={clearTemporaryFields} size="small" color="secondary" />
                </Box>
              )}
            </Grid>
          </Grid>

          {selectedProduct && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Product Selected:</strong> {selectedProduct.productName}
                <br />
                <strong>Product Code:</strong> {selectedProduct.productCode || "N/A"}
                <br />
                <strong>Status:</strong> Waiting for batch selection...
              </Typography>
            </Alert>
          )}
        </Paper>
      )}

      <Paper elevation={1} sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Product Details ({fields.length} items)
          </Typography>

          {fields.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No products added yet. {!isViewMode && "Select a product above to get started."}
            </Alert>
          ) : (
            <Box sx={{ height: 500, width: "100%" }}>
              <DataGrid
                rows={dataGridRows}
                columns={detailColumns}
                pageSizeOptions={[5, 10, 25, 50]}
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
                  "& .MuiDataGrid-row": {
                    cursor: "default",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
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
              Summary
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ sm: 3, xs: 3 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h6" color="primary">
                    {statistics.totalProducts}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Products
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ sm: 3, xs: 3 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h6" color="primary">
                    {statistics.totalIssuedQty}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Issue Qty
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ sm: 3, xs: 3 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h6" color={statistics.zeroQohItems > 0 ? "warning.main" : "text.primary"}>
                    {statistics.zeroQohItems}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Zero Stock
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ sm: 3, xs: 3 }}>
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

      <BatchSelectionDialog open={isBatchSelectionDialogOpen} onClose={closeBatchDialog} onSelect={handleBatchSelect} data={availableBatches} />
    </>
  );
};

export default ProductDetailsSection;
