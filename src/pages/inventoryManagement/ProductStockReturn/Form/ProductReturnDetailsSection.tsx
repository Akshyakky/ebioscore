import { ProductBatchDto } from "@/interfaces/InventoryManagement/ProductBatchDto";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import { ProductStockReturnDetailDto, ReturnType } from "@/interfaces/InventoryManagement/ProductStockReturnDto";
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

const returnDetailSchema = z.object({
  psrdID: z.number(),
  psrID: z.number(),
  productID: z.number().min(1, "Product is required"),
  productCode: z.string().optional(),
  productName: z.string().min(1, "Product name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  totalAmount: z.number().min(0, "Total amount must be non-negative"),
  batchNo: z.string().optional(),
  expiryDate: z.date().optional(),
  prescriptionYN: z.string().optional(),
  expiryYN: z.string().optional(),
  sellableYN: z.string().optional(),
  taxableYN: z.string().optional(),
  availableQty: z.number().optional(),
  tax: z.number().optional(),
  returnReason: z.string().optional(),
  rActiveYN: z.string().default("Y"),
});

const schema = z.object({
  psrID: z.number(),
  psrDate: z.date(),
  returnTypeCode: z.string().min(1, "Return type is required"),
  fromDeptID: z.number().min(1, "From department is required"),
  fromDeptName: z.string(),
  toDeptID: z.number().optional(),
  toDeptName: z.string().optional(),
  supplierID: z.number().optional(),
  supplierName: z.string().optional(),
  auGrpID: z.number().optional(),
  catDesc: z.string().optional(),
  catValue: z.string().optional(),
  psrCode: z.string().optional(),
  approvedYN: z.string(),
  approvedID: z.number().optional(),
  approvedBy: z.string().optional(),
  rActiveYN: z.string().default("Y"),
  productStockReturnDetails: z.array(returnDetailSchema).min(1, "At least one product detail is required"),
});

type ProductStockReturnFormData = z.infer<typeof schema>;
type ProductDetailWithId = ProductStockReturnDetailDto & {
  id: string;
  cgst?: number;
  sgst?: number;
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
  control: Control<ProductStockReturnFormData>;
  fields: FieldArrayWithId<ProductStockReturnFormData, "productStockReturnDetails", "id">[];
  append: UseFieldArrayAppend<ProductStockReturnFormData, "productStockReturnDetails">;
  remove: UseFieldArrayRemove;
  setValue: UseFormSetValue<ProductStockReturnFormData>;
  errors: FieldErrors<ProductStockReturnFormData>;
  isViewMode: boolean;
  showAlert: (type: string, message: string, severity: "success" | "error" | "warning" | "info") => void;
}

const StockReturnProductSection: React.FC<ProductDetailsSectionProps> = ({ control, fields, append, remove, setValue, errors, isViewMode, showAlert }) => {
  const [selectedProduct, setSelectedProduct] = useState<ProductListDto | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState<number | undefined>(undefined);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);
  const [isEditingExistingProduct, setIsEditingExistingProduct] = useState(false);
  const [productSearchSelection, setProductSearchSelection] = useState<any>(null);
  const [, setProductSearchInputValue] = useState<string>("");
  const [clearProductSearchTrigger, setClearProductSearchTrigger] = useState(0);
  const [returnReason, setReturnReason] = useState<string>("");
  const productSearchRef = useRef<ProductSearchRef>(null);
  const watchedDetails = useWatch({ control, name: "productStockReturnDetails" });
  const fromDeptID = useWatch({ control, name: "fromDeptID" });
  const returnTypeCode = useWatch({ control, name: "returnTypeCode" });
  const { isDialogOpen: isBatchSelectionDialogOpen, availableBatches, openDialog: openBatchDialog, closeDialog: closeBatchDialog } = useBatchSelection();

  const clearTemporaryFields = useCallback(() => {
    setSelectedProduct(null);
    setSelectedQuantity(undefined);
    setIsAddingProduct(false);
    setIsLoadingBatches(false);
    setEditingProductIndex(null);
    setIsEditingExistingProduct(false);
    setProductSearchSelection(null);
    setProductSearchInputValue("");
    setReturnReason("");
    setClearProductSearchTrigger((prev) => prev + 1);
  }, []);

  const mapCompleteProductListToReturnDetail = useCallback(
    (completeProduct: ProductListDto, batch: ProductBatchDto, quantity: number = 0, reason: string = ""): ProductStockReturnDetailDto => {
      const safeQuantity = Math.max(0, quantity);
      return {
        psrdID: 0,
        psrID: 0,
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
        manufacturedDate: undefined,
        grnDate: new Date(),
        unitPrice: batch.sellingPrice || completeProduct.defaultPrice || 0,
        tax: completeProduct.gstPerValue || 0,
        sellUnitPrice: batch.sellingPrice || completeProduct.defaultPrice || 0,
        quantity: safeQuantity,
        totalAmount: safeQuantity * (batch.sellingPrice || completeProduct.defaultPrice || 0),
        availableQty: batch.productQOH || 0,
        prescriptionYN: completeProduct.prescription === "Yes" ? "Y" : "N",
        expiryYN: completeProduct.expiry === "Yes" ? "Y" : "N",
        sellableYN: completeProduct.sellable === "Yes" ? "Y" : "N",
        taxableYN: completeProduct.taxable === "Yes" ? "Y" : "N",
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
        psdID: 0,
        transferYN: "N",
        freeRetQty: 0,
        freeRetUnitQty: 0,
        returnReason: reason,
        rActiveYN: "Y",
      };
    },
    []
  );

  const convertGrnToBatchDto = useCallback(
    (grn: any, product: ProductListDto): ProductBatchDto => {
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

  const handleBatchSelect = useCallback(
    async (batch: ProductBatchDto) => {
      try {
        setIsLoadingBatches(true);
        closeBatchDialog();
        const productResponse = await productListService.getById(batch.productID);
        if (!productResponse.success || !productResponse.data) {
          throw new Error(`Failed to fetch complete ProductListDto for productID: ${batch.productID}`);
        }
        const completeProductData = productResponse.data;
        const newProductDetail = mapCompleteProductListToReturnDetail(
          completeProductData,
          batch,
          selectedQuantity || 0,
          returnReason || getDefaultReasonByReturnType(returnTypeCode)
        );

        if (isEditingExistingProduct && editingProductIndex !== null) {
          setValue(`productStockReturnDetails.${editingProductIndex}`, newProductDetail, {
            shouldValidate: true,
            shouldDirty: true,
          });
          showAlert("Success", `Return product "${completeProductData.productName}" updated successfully`, "success");
        } else {
          append(newProductDetail);
          showAlert("Success", `Product "${completeProductData.productName}" added for return, batch: ${batch.batchNo}`, "success");
        }

        clearTemporaryFields();
      } catch (error) {
        showAlert("Error", `Failed to fetch product data for return. Please try again.`, "error");
        clearTemporaryFields();
      } finally {
        setIsLoadingBatches(false);
      }
    },
    [
      selectedQuantity,
      returnReason,
      returnTypeCode,
      isEditingExistingProduct,
      editingProductIndex,
      append,
      setValue,
      showAlert,
      closeBatchDialog,
      clearTemporaryFields,
      mapCompleteProductListToReturnDetail,
    ]
  );

  const getDefaultReasonByReturnType = (type: string): string => {
    switch (type) {
      case ReturnType.Supplier:
        return "Quality issues - returning to supplier";
      case ReturnType.Internal:
        return "Department transfer adjustment";
      case ReturnType.Expired:
        return "Item has reached expiry date";
      case ReturnType.Damaged:
        return "Item damaged in storage";
      default:
        return "Stock adjustment";
    }
  };

  const handleProductSelect = useCallback(
    async (product: ProductListDto | null) => {
      if (!product?.productID) {
        clearTemporaryFields();
        return;
      }
      if (!fromDeptID) {
        showAlert("Warning", "Please select a department first for the return", "warning");
        return;
      }
      if (!isEditingExistingProduct && fields.find((d) => d.productID === product.productID)) {
        showAlert("Warning", `"${product.productName}" is already added to the return list.`, "warning");
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
            showAlert("Warning", "No batches available for this product in the selected department", "warning");
            clearTemporaryFields();
          } else {
            openBatchDialog(batches);
          }
        } else {
          showAlert("Warning", "Failed to fetch product batches for return", "warning");
          clearTemporaryFields();
        }
      } catch (error) {
        showAlert("Error", "Failed to fetch product batches for return", "error");
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
        setIsEditingExistingProduct(true);
        setEditingProductIndex(index);
        setIsAddingProduct(true);
        setIsLoadingBatches(true);
        setSelectedQuantity(productDetail.quantity || 0);
        setReturnReason(productDetail.returnReason || "");

        const productResponse = await productListService.getById(productDetail.productID);
        if (!productResponse.success || !productResponse.data) {
          throw new Error("Failed to fetch complete ProductListDto for editing return");
        }
        const fullProductData = productResponse.data;
        setSelectedProduct(fullProductData);

        const grnResponse = await grnDetailService.getById(productDetail.productID);
        if (grnResponse.success && grnResponse.data) {
          const grnData = Array.isArray(grnResponse.data) ? grnResponse.data : [grnResponse.data];
          const validBatches = grnData
            .filter((grn: any) => grn && grn.batchNo && grn.acceptQty && grn.acceptQty > 0)
            .sort((a: any, b: any) => {
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
        showAlert("Error", "Failed to load product data for editing return", "error");
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
    const totalReturnQuantity = watchedDetails?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
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
      totalReturnQuantity,
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
        psrdID: field.psrdID ?? 0,
        psrID: field.psrID ?? 0,
        productID: field.productID ?? 0,
        productCode: field.productCode ?? "",
        productName: field.productName ?? "",
        catValue: "MEDI",
        catDesc: "REVENUE",
        // mfID: field.id ?? 0,
        mfName: field.productName ?? "",
        pUnitID: field.productID ?? 0,
        pUnitName: "",
        pUnitsPerPack: 1,
        pkgID: 0,
        pkgName: "",
        batchNo: field.batchNo ?? "",
        expiryDate: field.expiryDate,
        manufacturedDate: new Date(),
        grnDate: new Date(),
        unitPrice: field.unitPrice ?? 0,
        tax: field.tax ?? 0,
        cgst: cgst,
        sgst: sgst,
        sellUnitPrice: 0,
        quantity: field.quantity ?? 0,
        totalAmount: field.totalAmount ?? 0,
        availableQty: field.availableQty ?? 0,
        prescriptionYN: field.prescriptionYN ?? "N",
        expiryYN: field.expiryYN ?? "N",
        sellableYN: field.sellableYN ?? "N",
        taxableYN: field.taxableYN ?? "N",
        psGrpID: 0,
        psGrpName: "",
        pGrpID: 0,
        pGrpName: "",
        taxID: 0,
        taxCode: "",
        taxName: "",
        hsnCode: "",
        mrp: 0,
        manufacturerID: 0,
        manufacturerCode: "",
        manufacturerName: "",
        psbid: 0,
        psdID: 0,
        transferYN: "N",
        freeRetQty: 0,
        freeRetUnitQty: 0,
        returnReason: field.returnReason ?? "",
        rActiveYN: field.rActiveYN ?? "Y",
        id: `${field.productID}-${field.psrdID || index}`,
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

  const getReturnTypeLabel = () => {
    switch (returnTypeCode) {
      case ReturnType.Supplier:
        return "Supplier Return";
      case ReturnType.Internal:
        return "Internal Transfer Return";
      case ReturnType.Expired:
        return "Expired Items Return";
      case ReturnType.Damaged:
        return "Damaged Items Return";
      default:
        return "Product Return";
    }
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
      field: "returnReason",
      headerName: "Return Reason",
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const index = fields.findIndex((field) => {
          if (field.psrdID && params.row.psrdID) {
            return field.psrdID === params.row.psrdID;
          }
          return field.productID === params.row.productID;
        });

        if (index === -1) {
          return (
            <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
              {params.value || ""}
            </Typography>
          );
        }

        const currentValue = watchedDetails?.[index]?.returnReason || params.value || "";

        return (
          <TextField
            size="small"
            value={currentValue}
            onChange={(e) => {
              setValue(`productStockReturnDetails.${index}.returnReason`, e.target.value, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
            disabled={isViewMode}
            placeholder="Reason for return"
            sx={{
              width: "100%",
              "& .MuiInputBase-input": {
                cursor: "text",
              },
            }}
          />
        );
      },
    },
    {
      field: "quantity",
      headerName: "Return Qty",
      width: 130,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const index = fields.findIndex((field) => {
          if (field.psrdID && params.row.psrdID) {
            return field.psrdID === params.row.psrdID;
          }
          return field.productID === params.row.productID;
        });

        if (index === -1) {
          return (
            <Typography variant="body2" sx={{ fontSize: "0.875rem", textAlign: "right" }}>
              {params.row.quantity || 0}
            </Typography>
          );
        }

        const currentValue = watchedDetails?.[index]?.quantity || params.row.quantity || 0;
        const availableQty = watchedDetails?.[index]?.availableQty || params.row.availableQty || 0;

        return (
          <TextField
            size="small"
            type="number"
            value={currentValue}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0;
              if (value > availableQty) {
                showAlert("Warning", `Return quantity (${value}) cannot exceed available quantity (${availableQty})`, "warning");
                return;
              }
              setValue(`productStockReturnDetails.${index}.quantity`, value, {
                shouldValidate: true,
                shouldDirty: true,
              });
              setValue(`productStockReturnDetails.${index}.totalAmount`, value * (params.row.unitPrice || 0), {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
            disabled={isViewMode}
            inputProps={{ min: 0, max: availableQty, step: 0.01 }}
            error={!!errors.productStockReturnDetails?.[index]?.quantity || currentValue > availableQty}
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
      field: "availableQty",
      headerName: "Available Qty",
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
      field: "totalAmount",
      headerName: "Total Amount",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: "0.875rem", textAlign: "right", fontWeight: 500 }}>
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
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        if (isViewMode) return null;

        const index = fields.findIndex((field) => {
          if (field.psrdID && params.row.psrdID) {
            return field.psrdID === params.row.psrdID;
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
            <Tooltip title="Remove from Return">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(index);
                  showAlert("Info", `Product "${params.row.productName}" removed from return`, "info");
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
                Edit Product for {getReturnTypeLabel()}
              </>
            ) : (
              <>
                <AddIcon color="primary" />
                Add Products for {getReturnTypeLabel()}
              </>
            )}
          </Typography>

          <Grid container spacing={2} alignItems="center">
            <Grid size={{ sm: 12, md: 6 }}>
              <ProductSearch
                ref={productSearchRef}
                onProductSelect={handleProductSelect}
                clearTrigger={clearProductSearchTrigger}
                label={`Search Product for ${returnTypeCode} Return`}
                placeholder="Scan barcode or search product name for return..."
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
                    Loading product data for return...
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid size={{ sm: 6, md: 2 }}>
              <TextField
                label="Return Quantity"
                type="number"
                value={selectedQuantity || ""}
                onChange={(e) => setSelectedQuantity(parseFloat(e.target.value) || undefined)}
                disabled={isViewMode || !selectedProduct || isAddingProduct || isLoadingBatches}
                size="small"
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                placeholder="Enter quantity to return"
              />
            </Grid>

            <Grid size={{ sm: 6, md: 4 }}>
              <TextField
                label="Return Reason"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                disabled={isViewMode || !selectedProduct || isAddingProduct || isLoadingBatches}
                size="small"
                fullWidth
                placeholder={`Reason for ${returnTypeCode} return`}
              />
            </Grid>
          </Grid>

          {selectedProduct && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Product Selected for Return:</strong> {selectedProduct.productName}
                <br />
                <strong>Product Code:</strong> {selectedProduct.productCode || "N/A"}
                <br />
                <strong>Status:</strong> Waiting for batch selection for return...
              </Typography>
            </Alert>
          )}
        </Paper>
      )}

      <Paper elevation={1} sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {getReturnTypeLabel()} Products ({fields.length} items)
          </Typography>

          {fields.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No products added for return yet. {!isViewMode && "Select products above to begin the return process."}
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

          {errors.productStockReturnDetails && (
            <Alert severity="error" sx={{ mt: 2 }}>
              At least one product detail is required for return
            </Alert>
          )}

          <Box sx={{ mt: 2, p: 2, bgcolor: "background.paper", borderRadius: 1, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              {getReturnTypeLabel()} Summary
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
                  <Typography variant="h6" color="info.main">
                    {statistics.totalReturnQuantity}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Return Qty
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ sm: 3, xs: 3 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h6" color={returnTypeCode === ReturnType.Expired ? "error.main" : "text.primary"}>
                    {statistics.expiredItems}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Expired Items
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
            </Grid>

            <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
              {statistics.expiredItems > 0 && <Chip label={`${statistics.expiredItems} Expired Items`} color="error" size="small" icon={<ErrorIcon />} />}
              {statistics.zeroQohItems > 0 && <Chip label={`${statistics.zeroQohItems} Zero Stock`} color="warning" size="small" icon={<WarningIcon />} />}
              {statistics.expiring30Days > 0 && <Chip label={`${statistics.expiring30Days} Expiring ≤30 Days`} color="error" size="small" icon={<ErrorIcon />} />}
              {statistics.expiring90Days > 0 && <Chip label={`${statistics.expiring90Days} Expiring ≤90 Days`} color="info" size="small" icon={<InfoIcon />} />}
              {statistics.totalProducts === 0 && <Chip label="No products added for return yet" color="default" size="small" icon={<InfoIcon />} />}
              {returnTypeCode && <Chip label={`Return Type: ${getReturnTypeLabel()}`} color="primary" size="small" icon={<InfoIcon />} />}
            </Box>
          </Box>
        </Box>
      </Paper>

      <BatchSelectionDialog open={isBatchSelectionDialogOpen} onClose={closeBatchDialog} onSelect={handleBatchSelect} data={availableBatches} />
    </>
  );
};

export default StockReturnProductSection;
