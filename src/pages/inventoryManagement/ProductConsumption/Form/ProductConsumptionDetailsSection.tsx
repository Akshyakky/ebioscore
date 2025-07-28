import CustomButton from "@/components/Button/CustomButton";
import { GrnDetailDto } from "@/interfaces/InventoryManagement/GRNDto";
import { ProductBatchDto } from "@/interfaces/InventoryManagement/ProductBatchDto";

import { ProductConsumptionDetailDto } from "@/interfaces/InventoryManagement/ProductConsumption";
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

const consumptionDetailSchema = z.object({
  deptConsDetID: z.number(),
  deptConsID: z.number(),
  psdid: z.number(),
  pisid: z.number(),
  psbid: z.number(),
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
  affectedQty: z.number().min(0, "Consumed quantity must be non-negative").optional(),
  affectedUnitQty: z.number().optional(),
  issuedQty: z.number().min(0, "Issued quantity must be non-negative").optional(),
  availableQty: z.number().optional(),
  prescriptionYN: z.string().optional(),
  expiryYN: z.string().optional(),
  sellableYN: z.string().optional(),
  taxableYN: z.string().optional(),
  psGrpID: z.number().optional(),
  psGrpName: z.string().optional(),
  pGrpID: z.number().optional(),
  pGrpName: z.string().optional(),
  taxID: z.number().optional(),
  taxCode: z.string().optional(),
  taxName: z.string().optional(),
  mrp: z.number().optional(),
  manufacturerID: z.number().optional(),
  manufacturerCode: z.string().optional(),
  manufacturerName: z.string().optional(),
  grnDetID: z.number(),
  grnDate: z.date(),
  auGrpID: z.number(),
  consumptionRemarks: z.string().optional(),
});

const schema = z.object({
  deptConsID: z.number(),
  deptConsDate: z.date(),
  fromDeptID: z.number().min(1, "Department is required"),
  fromDeptName: z.string(),
  auGrpID: z.number().optional(),
  catDesc: z.string().optional(),
  catValue: z.string().optional(),
  deptConsCode: z.string().optional(),
  rActiveYN: z.string().default("Y"),
  details: z.array(consumptionDetailSchema).min(1, "At least one product detail is required"),
});

type DepartmentConsumptionFormData = z.infer<typeof schema>;
type DepartmentConsumptionDetailWithId = ProductConsumptionDetailDto & {
  id: string;
  cgst?: number;
  sgst?: number;
};

interface DepartmentConsumptionProductDetailsSectionProps {
  control: Control<DepartmentConsumptionFormData>;
  fields: FieldArrayWithId<DepartmentConsumptionFormData, "details", "id">[];
  append: UseFieldArrayAppend<DepartmentConsumptionFormData, "details">;
  remove: UseFieldArrayRemove;
  setValue: UseFormSetValue<DepartmentConsumptionFormData>;
  errors: FieldErrors<DepartmentConsumptionFormData>;
  isViewMode: boolean;
  showAlert: (type: string, message: string, severity: "success" | "error" | "warning" | "info") => void;
}

const DepartmentConsumptionProductDetailsSection: React.FC<DepartmentConsumptionProductDetailsSectionProps> = ({
  control,
  fields,
  append,
  remove,
  setValue,
  errors,
  isViewMode,
  showAlert,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<ProductListDto | null>(null);
  const [selectedProductConsumedQty, setSelectedProductConsumedQty] = useState<number | undefined>(undefined);
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
  const fromDeptName = useWatch({ control, name: "fromDeptName" });

  const { isDialogOpen: isBatchSelectionDialogOpen, availableBatches, openDialog: openBatchDialog, closeDialog: closeBatchDialog } = useBatchSelection();

  const clearTemporaryFields = useCallback(() => {
    setSelectedProduct(null);
    setSelectedProductConsumedQty(undefined);
    setIsAddingProduct(false);
    setIsLoadingBatches(false);
    setEditingProductIndex(null);
    setIsEditingExistingProduct(false);
    setProductSearchSelection(null);
    setProductSearchInputValue("");
    setClearProductSearchTrigger((prev) => prev + 1);
  }, []);

  const mapCompleteProductListToConsumptionDetail = useCallback(
    (completeProduct: ProductListDto, batch: ProductBatchDto, consumedQty: number = 0, existingDetail?: any): ProductConsumptionDetailDto => {
      const safeConsumedQty = Math.max(0, consumedQty);
      const unitPrice = batch.sellingPrice || completeProduct.defaultPrice || 0;
      const unitsPerPack = completeProduct.unitPack || 1;

      return {
        deptConsDetID: existingDetail?.deptConsDetID || 0,
        deptConsID: existingDetail?.deptConsID || 0,
        psdid: existingDetail?.psdid || 0,
        pisid: existingDetail?.pisid || 0,
        psbid: batch.grnDetID || 0,
        pGrpID: completeProduct.pGrpID || 0,
        pGrpName: completeProduct.productGroupName || "",
        productID: completeProduct.productID,
        productCode: completeProduct.productCode || "",
        productName: completeProduct.productName || "",
        catValue: completeProduct.catValue || "MEDI",
        catDesc: completeProduct.catDescription || "REVENUE",
        mfID: completeProduct.mFID || completeProduct.manufacturerID || 0,
        mfName: completeProduct.MFName || completeProduct.manufacturerName || "",
        pUnitID: completeProduct.pUnitID || 0,
        pUnitName: completeProduct.pUnitName || "",
        pUnitsPerPack: unitsPerPack,
        pkgID: completeProduct.pPackageID || 0,
        pkgName: completeProduct.productPackageName || "",
        batchNo: batch.batchNo || "",
        expiryDate: batch.expiryDate ? new Date(batch.expiryDate) : undefined,
        unitPrice: unitPrice,
        tax: completeProduct.gstPerValue || 0,
        sellUnitPrice: unitPrice,
        affectedQty: safeConsumedQty || 1, // Always set a default value of 1
        affectedUnitQty: (safeConsumedQty || 1) * unitsPerPack, // Calculate unit quantity
        // issuedQty: existingDetail?.issuedQty || 0, // Issued Qty (separate field)
        availableQty: batch.productQOH || 0,
        prescriptionYN: completeProduct.prescription || "N",
        expiryYN: completeProduct.expiry || "N",
        sellableYN: completeProduct.sellable || "Y",
        taxableYN: completeProduct.taxable || "Y",
        psGrpID: completeProduct.psGrpID || 0,
        psGrpName: completeProduct.psGroupName || "",
        manufacturerID: completeProduct.manufacturerID || 0,
        manufacturerCode: completeProduct.manufacturerCode || "",
        manufacturerName: completeProduct.manufacturerName || "",
        taxID: completeProduct.taxID || 0,
        taxCode: completeProduct.taxCode || "",
        taxName: completeProduct.taxName || "",
        mrp: completeProduct.defaultPrice || 0,
        grnDetID: batch.grnDetID || 0,
        grnDate: new Date(),
        auGrpID: 18,
        consumptionRemarks: existingDetail?.consumptionRemarks || completeProduct.productNotes || "",
        rActiveYN: "Y",

        // Additional fields from ProductListDto
        // barcode: completeProduct.barcode || "",
        // vedCode: completeProduct.vedCode || "",
        // abcCode: completeProduct.abcCode || "",
        // chargableYN: completeProduct.chargableYN || "N",
        // chargePercentage: completeProduct.chargePercentage || 0,
        // isAssetYN: completeProduct.isAssetYN || "N",
        // productDiscount: completeProduct.productDiscount || 0,
        // supplierStatus: completeProduct.supplierStatus || "Active",
        // medicationGenericName: completeProduct.medicationGenericName || "",
        // productLocation: completeProduct.productLocation || "",
        // productNotes: completeProduct.productNotes || "",
        // serialNumber: completeProduct.serialNumber || "",
        // hsnCODE: completeProduct.hsnCODE || "",
        // gstPerValue: completeProduct.gstPerValue || 0,
        // cgstPerValue: completeProduct.cgstPerValue || 0,
        // sgstPerValue: completeProduct.sgstPerValue || 0,
        // universalCode: completeProduct.universalCode || 0,
        // transferYN: completeProduct.transferYN || "N",
        // rNotes: "",
        // baseUnit: completeProduct.baseUnit || 1,
        // issueUnit: completeProduct.issueUnit || 1,
        // leadTime: completeProduct.leadTime || 0,
        // leadTimeDesc: completeProduct.leadTimeDesc || "",
        // rOL: completeProduct.rOL || 0,
        // pLocationID: completeProduct.pLocationID || 0,
        // pLocationCode: completeProduct.pLocationCode || "",
        // pLocationName: completeProduct.pLocationName || "",
      };
    },
    []
  );

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

  const handleBatchSelect = useCallback(
    async (batch: ProductBatchDto) => {
      try {
        debugger;
        setIsLoadingBatches(true);
        closeBatchDialog();

        // Fetch the complete product details using productID
        const productResponse = await productListService.getById(batch.productID);
        if (!productResponse.success || !productResponse.data) {
          throw new Error(`Failed to fetch complete ProductListDto for productID: ${batch.productID}`);
        }
        const completeProductData: ProductListDto = productResponse.data;

        // Create a new ProductConsumptionDetailDto using the fetched product details
        const newProductDetail: ProductConsumptionDetailDto = {
          deptConsDetID: 0, // or existingDetail?.deptConsDetID if editing
          deptConsID: 0, // This should be set to the correct deptConsID
          psdid: 0, // Set as needed
          pisid: 0, // Set as needed
          psbid: batch.grnDetID || 0,
          pGrpID: completeProductData.pGrpID || 0,
          pGrpName: completeProductData.productGroupName || "",
          productID: completeProductData.productID,
          productCode: completeProductData.productCode || "",
          productName: completeProductData.productName || "",
          catValue: completeProductData.catValue || "MEDI",
          catDesc: completeProductData.catDescription || "REVENUE",
          mfID: completeProductData.mFID || 0,
          mfName: completeProductData.MFName || completeProductData.manufacturerName || "",
          pUnitID: completeProductData.pUnitID || 0,
          pUnitName: completeProductData.pUnitName || "",
          pUnitsPerPack: completeProductData.unitPack || 1,
          pkgID: completeProductData.pPackageID || 0,
          pkgName: completeProductData.productPackageName || "",
          batchNo: batch.batchNo || "",
          expiryDate: batch.expiryDate ? new Date(batch.expiryDate) : undefined,
          unitPrice: batch.sellingPrice || completeProductData.defaultPrice || 0,
          tax: completeProductData.gstPerValue || 0,
          sellUnitPrice: batch.sellingPrice || completeProductData.defaultPrice || 0,
          affectedQty: selectedProductConsumedQty || 0, // Default to 1 if no quantity specified
          affectedUnitQty: (selectedProductConsumedQty || 0) * (completeProductData.unitPack || 0), // Calculate unit quantity
          prescriptionYN: completeProductData.prescription || "N",
          expiryYN: completeProductData.expiry || "N",
          sellableYN: completeProductData.sellable || "Y",
          taxableYN: completeProductData.taxable || "Y",
          psGrpID: completeProductData.psGrpID || 0,
          psGrpName: completeProductData.psGroupName || "",
          manufacturerID: completeProductData.manufacturerID || 0,
          manufacturerCode: completeProductData.manufacturerCode || "",
          manufacturerName: completeProductData.manufacturerName || "",
          taxID: completeProductData.taxID || 0,
          taxCode: completeProductData.taxCode || "",
          taxName: completeProductData.taxName || "",
          mrp: completeProductData.defaultPrice || 0,
          grnDetID: batch.grnDetID || 0,
          grnDate: new Date(), // Set to current date or as needed
          auGrpID: 18, // Set as needed
          consumptionRemarks: completeProductData.productNotes || "",
          rActiveYN: "Y",
        };

        if (isEditingExistingProduct && editingProductIndex !== null) {
          setValue(`details.${editingProductIndex}`, newProductDetail, {
            shouldValidate: true,
            shouldDirty: true,
          });
          showAlert("Success", `Department consumption product "${completeProductData.productName}" updated successfully`, "success");
        } else {
          append(newProductDetail);
          showAlert("Success", `Product "${completeProductData.productName}" added for department consumption, batch: ${batch.batchNo}`, "success");
        }

        clearTemporaryFields();
      } catch (error) {
        showAlert("Error", `Failed to fetch product data for department consumption. Please try again.`, "error");
        clearTemporaryFields();
      } finally {
        setIsLoadingBatches(false);
      }
    },
    [selectedProductConsumedQty, isEditingExistingProduct, editingProductIndex, append, setValue, showAlert, closeBatchDialog, clearTemporaryFields]
  );

  const handleProductSelect = useCallback(
    async (product: ProductListDto | null) => {
      if (!product?.productID) {
        clearTemporaryFields();
        return;
      }
      if (!fromDeptID) {
        showAlert("Warning", "Please select a department first for the consumption", "warning");
        return;
      }
      if (!isEditingExistingProduct && fields.find((d) => d.productID === product.productID)) {
        showAlert("Warning", `"${product.productName}" is already added to the consumption list.`, "warning");
        productSearchRef.current?.clearSelection();
        return;
      }
      try {
        debugger;
        setSelectedProduct(product);
        setIsLoadingBatches(true);
        const response = await billingService.getBatchNoProduct(product.productID, fromDeptID);
        if (response.success && response.data) {
          const batches = response.data;
          if (batches.length === 0) {
            showAlert("Warning", "No batches available for this product in the department", "warning");
            clearTemporaryFields();
          } else {
            openBatchDialog(batches);
          }
        } else {
          showAlert("Warning", "Failed to fetch product batches for consumption", "warning");
          clearTemporaryFields();
        }
      } catch (error) {
        showAlert("Error", "Failed to fetch product batches for consumption", "error");
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
        const productResponse = await productListService.getById(productDetail.productID);
        if (!productResponse.success || !productResponse.data) {
          throw new Error("Failed to fetch complete ProductListDto for editing consumption");
        }
        const fullProductData = productResponse.data;
        setSelectedProduct(fullProductData);
        setSelectedProductConsumedQty(productDetail.affectedQty || 0);
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
        showAlert("Error", "Failed to load product data for editing consumption", "error");
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
    const totalConsumedQty = watchedDetails?.reduce((sum, item) => sum + (item.affectedQty || 0), 0) || 0;
    const totalIssuedQty = watchedDetails?.reduce((sum, item) => sum + (item.issuedQty || 0), 0) || 0;
    const totalValue = watchedDetails?.reduce((sum, item) => sum + (item.unitPrice || 0) * (item.affectedQty || 0), 0) || 0;
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
      totalConsumedQty,
      totalIssuedQty,
      totalValue,
      zeroQohItems,
      expiring30Days,
      expiring90Days,
      expiredItems,
    };
  }, [watchedDetails]);

  const dataGridRows: GridRowsProp<DepartmentConsumptionDetailWithId> = useMemo(() => {
    return fields.map((field, index) => {
      const totalTax = field.tax || 0;
      const cgst = totalTax / 2;
      const sgst = totalTax / 2;

      const row: DepartmentConsumptionDetailWithId = {
        deptConsDetID: field.deptConsDetID ?? 0,
        deptConsID: field.deptConsID ?? 0,
        psdid: field.psdid ?? 0,
        pisid: field.pisid ?? 0,
        psbid: field.psbid ?? 0,
        pGrpID: field.pGrpID ?? 0,
        pGrpName: field.pGrpName ?? "",
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
        affectedQty: field.affectedQty ?? 0,
        affectedUnitQty: field.affectedUnitQty ?? 0,
        availableQty: field.availableQty ?? 0,
        prescriptionYN: field.prescriptionYN ?? "N",
        expiryYN: field.expiryYN ?? "N",
        sellableYN: field.sellableYN ?? "Y",
        taxableYN: field.taxableYN ?? "Y",
        psGrpID: field.psGrpID ?? 0,
        psGrpName: field.psGrpName ?? "",
        manufacturerID: field.manufacturerID ?? 0,
        manufacturerCode: field.manufacturerCode ?? "",
        manufacturerName: field.manufacturerName ?? "",
        taxID: field.taxID ?? 0,
        taxCode: field.taxCode ?? "",
        taxName: field.taxName ?? "",
        mrp: field.mrp ?? 0,
        grnDetID: field.grnDetID ?? 0,
        grnDate: field.grnDate ?? new Date(),
        auGrpID: field.auGrpID ?? 18,
        consumptionRemarks: field.consumptionRemarks ?? "",
        rActiveYN: "Y",
        id: `${field.productID}-${field.deptConsDetID || index}`,
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
      field: "issuedQty",
      headerName: "Issued Qty",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const index = fields.findIndex((field) => {
          if (field.deptConsDetID && params.row.deptConsDetID) {
            return field.deptConsDetID === params.row.deptConsDetID;
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
            inputProps={{ min: 0, max: availableQty, step: 0.01 }}
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
      field: "affectedQty",
      headerName: "Consuming Qty",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const index = fields.findIndex((field) => {
          if (field.deptConsDetID && params.row.deptConsDetID) {
            return field.deptConsDetID === params.row.deptConsDetID;
          }
          return field.productID === params.row.productID;
        });

        if (index === -1) {
          return (
            <Typography variant="body2" sx={{ fontSize: "0.875rem", textAlign: "right" }}>
              {params.row.affectedQty || 0}
            </Typography>
          );
        }
        const currentValue = watchedDetails?.[index]?.affectedQty || params.row.affectedQty || 0;
        const availableQty = watchedDetails?.[index]?.availableQty || params.row.availableQty || 0;
        const unitsPerPack = watchedDetails?.[index]?.pUnitsPerPack || params.row.pUnitsPerPack || 1;

        return (
          <TextField
            size="small"
            type="number"
            value={currentValue}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0;
              if (value > availableQty) {
                showAlert("Warning", `Consuming quantity (${value}) cannot exceed available quantity (${availableQty})`, "warning");
                return;
              }

              // Update both affectedQty and affectedUnitQty
              setValue(`details.${index}.affectedQty`, value, {
                shouldValidate: true,
                shouldDirty: true,
              });
              setValue(`details.${index}.affectedUnitQty`, value * unitsPerPack, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
            disabled={isViewMode}
            inputProps={{ min: 0, max: availableQty, step: 0.01 }}
            error={!!errors.details?.[index]?.affectedQty || currentValue > availableQty}
            helperText={currentValue > availableQty ? "Cannot exceed available qty" : ""}
            sx={{
              width: "120px",
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
      field: "consumptionRemarks",
      headerName: "Remarks",
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const index = fields.findIndex((field) => {
          if (field.deptConsDetID && params.row.deptConsDetID) {
            return field.deptConsDetID === params.row.deptConsDetID;
          }
          return field.productID === params.row.productID;
        });

        if (index === -1 || isViewMode) {
          return (
            <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
              {params.row.consumptionRemarks || ""}
            </Typography>
          );
        }

        const currentValue = watchedDetails?.[index]?.consumptionRemarks || params.row.consumptionRemarks || "";

        return (
          <TextField
            size="small"
            value={currentValue}
            onChange={(e) => {
              setValue(`details.${index}.consumptionRemarks`, e.target.value, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
            disabled={isViewMode}
            placeholder="Add remarks..."
            sx={{
              width: "130px",
              "& .MuiInputBase-input": {
                cursor: "text",
              },
            }}
          />
        );
      },
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
          if (field.deptConsDetID && params.row.deptConsDetID) {
            return field.deptConsDetID === params.row.deptConsDetID;
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
            <Tooltip title="Remove from Consumption">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(index);
                  showAlert("Info", `Product "${params.row.productName}" removed from consumption`, "info");
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
                Edit Product for Department Consumption
              </>
            ) : (
              <>
                <AddIcon color="primary" />
                Add Products for Department Consumption
              </>
            )}
          </Typography>

          <Grid container spacing={2} alignItems="center">
            <Grid size={{ sm: 12, md: 6 }}>
              <ProductSearch
                ref={productSearchRef}
                onProductSelect={handleProductSelect}
                clearTrigger={clearProductSearchTrigger}
                label="Search Product for Consumption"
                placeholder="Scan barcode or search product name for consumption..."
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
                    Loading product data for consumption...
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid size={{ sm: 6, md: 3 }}>
              <TextField
                label="Consumption Quantity"
                type="number"
                value={selectedProductConsumedQty || ""}
                onChange={(e) => setSelectedProductConsumedQty(parseFloat(e.target.value) || undefined)}
                disabled={isViewMode || !selectedProduct || isAddingProduct || isLoadingBatches}
                size="small"
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                placeholder="Enter quantity consumed"
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
                <strong>Product Selected for Consumption:</strong> {selectedProduct.productName}
                <br />
                <strong>Product Code:</strong> {selectedProduct.productCode || "N/A"}
                <br />
                <strong>Status:</strong> Waiting for batch selection for consumption...
              </Typography>
            </Alert>
          )}
        </Paper>
      )}

      <Paper elevation={1} sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Department Consumption Products ({fields.length} items)
            {fromDeptName && <Chip label={`Department: ${fromDeptName}`} size="small" color="success" variant="outlined" sx={{ ml: 2 }} />}
          </Typography>

          {fields.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No products added for consumption yet. {!isViewMode && "Select products above to begin the consumption process."}
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
              At least one product detail is required for consumption
            </Alert>
          )}

          <Box sx={{ mt: 2, p: 2, bgcolor: "background.paper", borderRadius: 1, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Department Consumption Summary
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ sm: 2, xs: 6 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h6" color="primary">
                    {statistics.totalProducts}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Products
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ sm: 2, xs: 6 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h6" color="success.main">
                    {statistics.totalConsumedQty}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Consumed Qty
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ sm: 2, xs: 6 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h6" color="info.main">
                    {statistics.totalIssuedQty}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Issued Qty
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ sm: 2, xs: 6 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h6" color="secondary.main">
                    ₹{statistics.totalValue.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Value
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ sm: 2, xs: 6 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h6" color={statistics.zeroQohItems > 0 ? "warning.main" : "success.main"}>
                    {statistics.zeroQohItems}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Zero Stock
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ sm: 2, xs: 6 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h6" color={statistics.expiredItems > 0 ? "error.main" : "success.main"}>
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
              {statistics.totalProducts === 0 && <Chip label="No products added for consumption yet" color="default" size="small" icon={<InfoIcon />} />}
            </Box>
          </Box>
        </Box>
      </Paper>

      <BatchSelectionDialog open={isBatchSelectionDialogOpen} onClose={closeBatchDialog} onSelect={handleBatchSelect} data={availableBatches} />
    </>
  );
};

export default DepartmentConsumptionProductDetailsSection;
