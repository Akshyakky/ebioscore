import CustomButton from "@/components/Button/CustomButton";
import { GrnDetailDto } from "@/interfaces/InventoryManagement/GRNDto";
import { ProductIssualDetailDto } from "@/interfaces/InventoryManagement/ProductIssualDto";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import { grnDetailService, productListService } from "@/services/InventoryManagementService/inventoryManagementService";
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Error as ErrorIcon, Info as InfoIcon, Save, Warning as WarningIcon } from "@mui/icons-material";
import { Alert, Box, Chip, CircularProgress, Grid, IconButton, InputAdornment, Paper, TextField, Tooltip, Typography } from "@mui/material";
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
  const [availableBatches, setAvailableBatches] = useState<GrnDetailDto[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<GrnDetailDto | null>(null);
  const [selectedProductBatchNo, setSelectedProductBatchNo] = useState<string>("");
  const [selectedProductQoh, setSelectedProductQoh] = useState<number | undefined>(undefined);
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
  const clearTemporaryFields = useCallback(() => {
    setSelectedProduct(null);
    setAvailableBatches([]);
    setSelectedBatch(null);
    setSelectedProductBatchNo("");
    setSelectedProductQoh(undefined);
    setSelectedProductIssuedQty(undefined);
    setIsAddingProduct(false);
    setIsLoadingBatches(false);
    setEditingProductIndex(null);
    setIsEditingExistingProduct(false);
    setProductSearchSelection(null);
    setProductSearchInputValue("");
    setClearProductSearchTrigger((prev) => prev + 1);
  }, []);

  const getExpiryDateFromGrn = useCallback((grnDetail: GrnDetailDto): Date | undefined => {
    if (!grnDetail.expiryDate) return undefined;
    try {
      const dateStr = grnDetail.expiryDate.toString();
      let parsedDate: Date;
      if (dateStr.includes("T") || dateStr.includes("Z")) {
        parsedDate = new Date(dateStr);
      } else {
        parsedDate = new Date(dateStr);
      }
      return parsedDate;
    } catch (error) {}
  }, []);

  const getAvailableQuantity = useCallback((grnDetail: GrnDetailDto): number => {
    return grnDetail.acceptQty || 0;
  }, []);

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
      const row = {
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

  const validateProductForAddition = (selectedProduct: ProductListDto) => {
    const errors: string[] = [];
    const issuedQty = selectedProductIssuedQty || 0;
    const availableQty = selectedProductQoh || 0;
    if (issuedQty < 0) {
      errors.push("Issue quantity must be non-negative");
    }
    if (issuedQty > availableQty) {
      errors.push(`Issue quantity (${issuedQty}) cannot exceed available quantity (${availableQty})`);
    }
    return errors;
  };

  const handleProductSelect = useCallback(
    async (product: ProductListDto | null) => {
      if (!product?.productID) {
        clearTemporaryFields();
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
        if (grnResponse.success && grnResponse.data) {
          const grnData = Array.isArray(grnResponse.data) ? grnResponse.data : [grnResponse.data];
          const validBatches: GrnDetailDto[] = grnData
            .filter((grn: GrnDetailDto) => {
              return grn && grn.batchNo && grn.acceptQty && grn.acceptQty > 0;
            })
            .sort((a: GrnDetailDto, b: GrnDetailDto) => {
              const dateA = getExpiryDateFromGrn(a);
              const dateB = getExpiryDateFromGrn(b);
              if (dateA && dateB) {
                return dateA.getTime() - dateB.getTime();
              }
              return 0;
            });
          setAvailableBatches(validBatches);
          if (validBatches.length > 0) {
            const firstBatch = validBatches[0];
            setSelectedBatch(firstBatch);
            setSelectedProductBatchNo(firstBatch.batchNo || "");
            setSelectedProductQoh(getAvailableQuantity(firstBatch));
            setSelectedProductIssuedQty(0);
          } else {
            showAlert("Warning", "No batch information found for this product in GRN records.", "warning");
            setSelectedBatch(null);
            setSelectedProductBatchNo("");
            setSelectedProductQoh(0);
            setSelectedProductIssuedQty(0);
          }
        } else {
          showAlert("Warning", "No GRN batch data found. Using product default values.", "warning");
          const batchNo = fullProductData.serialNumber || fullProductData.batchNumber || "";
          const availableQty = fullProductData.availableQty || fullProductData.rOL || 0;

          const mockGrnDetail: GrnDetailDto = {
            grnDetID: 0,
            grnID: 0,
            productID: fullProductData.productID,
            catValue: fullProductData.catValue || "MEDI",
            batchNo,
            acceptQty: availableQty,
            unitPrice: fullProductData.defaultPrice || 0,
            defaultPrice: fullProductData.defaultPrice || 0,
          };
          setSelectedBatch(mockGrnDetail);
          setSelectedProductBatchNo(batchNo);
          setSelectedProductQoh(availableQty);
          setSelectedProductIssuedQty(0);
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
        showAlert("Error", "Failed to fetch product details. Please try again.", "error");
        clearTemporaryFields();
      } finally {
        setIsAddingProduct(false);
        setIsLoadingBatches(false);
        productSearchRef.current?.clearSelection();
      }
    },
    [fields, showAlert, getExpiryDateFromGrn, getAvailableQuantity, clearTemporaryFields]
  );

  const handleBatchSelect = useCallback(
    (batchNo: string) => {
      const batch = availableBatches.find((b) => b.batchNo === batchNo);
      if (batch) {
        setSelectedBatch(batch);
        setSelectedProductBatchNo(batch.batchNo || "");
        setSelectedProductQoh(getAvailableQuantity(batch));
        setSelectedProductIssuedQty(0);
      }
    },
    [availableBatches, getAvailableQuantity, getExpiryDateFromGrn]
  );

  const handleEditExistingProduct = useCallback(
    async (index: number) => {
      if (isViewMode) return;

      const productDetail = fields[index];
      if (!productDetail) return;

      try {
        setIsAddingProduct(true);
        setIsLoadingBatches(true);
        setEditingProductIndex(index);
        setIsEditingExistingProduct(true);

        const productResponse = await productListService.getById(productDetail.productID);
        if (!productResponse.success || !productResponse.data) {
          throw new Error("Failed to fetch product details");
        }

        const fullProductData = productResponse.data;
        setSelectedProduct(fullProductData);

        const grnResponse = await grnDetailService.getById(productDetail.productID);
        if (grnResponse.success && grnResponse.data) {
          const grnData = Array.isArray(grnResponse.data) ? grnResponse.data : [grnResponse.data];
          const validBatches = grnData
            .filter((grn: GrnDetailDto) => grn && grn.batchNo && grn.acceptQty && grn.acceptQty > 0)
            .sort((a: GrnDetailDto, b: GrnDetailDto) => {
              const dateA = getExpiryDateFromGrn(a);
              const dateB = getExpiryDateFromGrn(b);
              if (dateA && dateB) {
                return dateA.getTime() - dateB.getTime();
              }
              return 0;
            });

          setAvailableBatches(validBatches);

          let matchingBatch = validBatches.find((batch) => batch.batchNo === productDetail.batchNo);
          if (!matchingBatch) {
            matchingBatch = {
              grnDetID: 0,
              grnID: 0,
              productID: productDetail.productID,
              catValue: productDetail.catValue || "MEDI",
              batchNo: productDetail.batchNo || "",
              acceptQty: productDetail.availableQty || 0,
              unitPrice: productDetail.unitPrice || 0,
              defaultPrice: productDetail.unitPrice || 0,
              expiryDate: productDetail.expiryDate,
            };
          }

          setSelectedBatch(matchingBatch);
        } else {
          const mockBatch: GrnDetailDto = {
            grnDetID: 0,
            grnID: 0,
            productID: productDetail.productID,
            catValue: productDetail.catValue || "MEDI",
            batchNo: productDetail.batchNo || "",
            acceptQty: productDetail.availableQty || 0,
            unitPrice: productDetail.unitPrice || 0,
            defaultPrice: productDetail.unitPrice || 0,
            expiryDate: productDetail.expiryDate ? productDetail.expiryDate.toISOString() : undefined,
          };
          setAvailableBatches([mockBatch]);
          setSelectedBatch(mockBatch);
        }
        setSelectedProductBatchNo(productDetail.batchNo || "");
        setSelectedProductQoh(productDetail.availableQty || 0);
        setSelectedProductIssuedQty(productDetail.issuedQty || 0);
        showAlert("Info", `Editing product "${productDetail.productName}" - modify the details below and click Update`, "info");
      } catch (error) {
        showAlert("Error", "Failed to load product for editing", "error");
        clearTemporaryFields();
      } finally {
        setIsAddingProduct(false);
        setIsLoadingBatches(false);
      }
    },
    [fields, isViewMode, getExpiryDateFromGrn, showAlert, clearTemporaryFields]
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

    const issuedQty = selectedProductIssuedQty || 0;

    const validationErrors = validateProductForAddition(selectedProduct);
    if (validationErrors.length > 0) {
      showAlert("Error", validationErrors.join(". "), "error");
      return;
    }

    if (!isEditingExistingProduct) {
      if (fields.find((item) => item.productID === selectedProduct.productID && item.batchNo === selectedBatch.batchNo)) {
        showAlert("Warning", "Product with this batch already exists in the list", "warning");
        return;
      }
    }

    try {
      const totalGst = selectedProduct.gstPerValue || 0;
      const batchExpiryDate = getExpiryDateFromGrn(selectedBatch);
      const productDetail: ProductIssualDetailDto = {
        pisDetID: isEditingExistingProduct && editingProductIndex !== null ? fields[editingProductIndex].pisDetID : 0,
        pisid: isEditingExistingProduct && editingProductIndex !== null ? fields[editingProductIndex].pisid : 0,
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
        expiryDate: batchExpiryDate,
        unitPrice: getUnitPrice(selectedBatch),
        tax: totalGst,
        sellUnitPrice: selectedProduct.sellPrice || selectedProduct.defaultPrice || 0,
        requestedQty: issuedQty,
        issuedQty: issuedQty,
        availableQty: getAvailableQuantity(selectedBatch),
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
        rActiveYN: "Y",
        remarks: "",
      };
      if (isEditingExistingProduct && editingProductIndex !== null) {
        setValue(`details.${editingProductIndex}`, productDetail, { shouldValidate: true, shouldDirty: true });
        showAlert("Success", `Product "${selectedProduct.productName}" updated successfully.`, "success");
      } else {
        append(productDetail);
        showAlert("Success", `"${selectedProduct.productName}" (ID: ${selectedProduct.productID}, Batch: ${selectedBatch.batchNo}) added successfully.`, "success");
      }
      clearTemporaryFields();
    } catch (error) {
      showAlert("Error", "Failed to process product. Please try again.", "error");
    }
  }, [
    selectedProduct,
    selectedBatch,
    fields,
    append,
    setValue,
    showAlert,
    selectedProductIssuedQty,
    getExpiryDateFromGrn,
    getUnitPrice,
    getAvailableQuantity,
    clearTemporaryFields,
    isEditingExistingProduct,
    editingProductIndex,
  ]);

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
      flex: 1,
      minWidth: 200,
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
      flex: 0.8,
      minWidth: 150,
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
            disabled={isViewMode}
            inputProps={{ min: 0, step: 0.01 }}
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
                label="Product Search"
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
                    Loading product details...
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid size={{ sm: 6, md: 2 }}>
              {availableBatches.length > 1 ? (
                <TextField
                  select
                  label="Batch No"
                  value={selectedProductBatchNo}
                  onChange={(e) => handleBatchSelect(e.target.value)}
                  disabled={isViewMode || !selectedProduct || isAddingProduct || isLoadingBatches}
                  size="small"
                  fullWidth
                  SelectProps={{
                    native: false,
                  }}
                >
                  {availableBatches.map((batch) => {
                    const expiryDate = getExpiryDateFromGrn(batch);
                    return (
                      <option key={batch.batchNo} value={batch.batchNo || ""}>
                        {`${batch.batchNo} (Qty: ${getAvailableQuantity(batch)}${expiryDate ? `, Exp: ${expiryDate.toLocaleDateString()}` : ""})`}
                      </option>
                    );
                  })}
                </TextField>
              ) : (
                <TextField
                  label="Batch No"
                  value={selectedProductBatchNo}
                  disabled={isViewMode || !selectedProduct || isAddingProduct || isLoadingBatches}
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
              <TextField
                label=" QOH (Units)"
                type="number"
                value={selectedProductQoh || ""}
                disabled={isViewMode || !selectedProduct || isAddingProduct || isLoadingBatches}
                size="small"
                fullWidth
                placeholder="Auto-filled from GRN"
              />
            </Grid>

            <Grid size={{ sm: 6, md: 2 }}>
              <TextField
                label="Issue Quantity"
                type="number"
                value={selectedProductIssuedQty || ""}
                onChange={(e) => setSelectedProductIssuedQty(parseFloat(e.target.value) || undefined)}
                disabled={isViewMode || !selectedProduct || isAddingProduct || isLoadingBatches}
                size="small"
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                placeholder="Enter quantity to issue (0 allowed)"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {isEditingExistingProduct && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip label={`Editing: ${selectedProduct?.productName || "Product"}`} color="primary" size="small" variant="outlined" />
                <CustomButton variant="outlined" text="Cancel Edit" onClick={clearTemporaryFields} size="small" color="secondary" />
              </Box>
            )}
            <Box sx={{ ml: "auto" }}>
              <CustomButton
                variant="contained"
                text={isEditingExistingProduct ? "Update Product" : "Add to List"}
                onClick={handleAddToList}
                disabled={!selectedProduct || !selectedBatch || isViewMode || isAddingProduct || isLoadingBatches}
                icon={isEditingExistingProduct ? Save : AddIcon}
                color={isEditingExistingProduct ? "success" : "primary"}
                size="medium"
              />
            </Box>
          </Box>

          {selectedProduct && selectedBatch && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Selected:</strong> {selectedProduct.productName} |<strong> Batch:</strong> {selectedBatch.batchNo} |<strong> Available:</strong>{" "}
                {getAvailableQuantity(selectedBatch)} units
                {(() => {
                  const expiryDate = getExpiryDateFromGrn(selectedBatch);
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
            Product Details ({fields.length} items)
          </Typography>

          {!isViewMode && fields.length > 0 && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Click on any product row to edit it, or use the Edit button in the Actions column. Set issued quantity to 0 for products you don't want to issue.
            </Typography>
          )}

          {fields.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No products added yet. {!isViewMode && "Use the product search above to add products."}
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
                onRowClick={(params) => {
                  if (!isViewMode) {
                    const index = fields.findIndex((field) => {
                      if (field.pisDetID && params.row.pisDetID) {
                        return field.pisDetID === params.row.pisDetID;
                      }
                      return field.productID === params.row.productID;
                    });
                    if (index !== -1) {
                      handleEditExistingProduct(index);
                    }
                  }
                }}
                sx={{
                  "& .MuiDataGrid-cell": {
                    borderRight: "1px solid rgba(224, 224, 224, 1)",
                  },
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                    borderBottom: "2px solid rgba(224, 224, 224, 1)",
                  },
                  "& .MuiDataGrid-row": {
                    cursor: isViewMode ? "default" : "pointer",
                    "&:hover": {
                      backgroundColor: isViewMode ? "inherit" : "rgba(0, 0, 0, 0.04)",
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
              Issue Summary
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
    </>
  );
};

export default ProductDetailsSection;
