import CustomButton from "@/components/Button/CustomButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { GrnDetailDto } from "@/interfaces/InventoryManagement/GRNDto";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import { PurchaseOrderDetailDto, PurchaseOrderMastDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { usePurchaseOrder } from "@/pages/inventoryManagement/PurchaseOrder/hooks/usePurchaseOrder";
import { useAlert } from "@/providers/AlertProvider";
import { productListService } from "@/services/InventoryManagementService/inventoryManagementService";
import {
  Clear as ClearIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  FirstPage,
  Inventory as InventoryIcon,
  AddBusiness as IssueIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  LastPage,
  LocalFireDepartment,
  Assignment as POIcon,
  ShoppingCart as PurchaseIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tabs,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Control, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { ProductSearch, ProductSearchRef } from "../../CommonPage/Product/ProductSearchForm";
import IssueDepartmentDialog, { IssueDepartmentData } from "./NewIssueDepartmentDialog";
import POSearchDialog from "./POSearchDailogue";

interface UnifiedGRNDetailRow extends GrnDetailDto {
  id: string | number;
  _serialNo: number;
  _issueDepartments: IssueDepartmentData[];
  _source: "po" | "manual";
  _expanded?: boolean;
}

interface UnifiedGrnDetailsComponentProps {
  grnDetails: GrnDetailDto[];
  onGrnDetailsChange: (details: GrnDetailDto[]) => void;
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  disabled?: boolean;
  grnApproved?: boolean;
  grnID?: number;
  catValue?: string;
  issueDepartments?: IssueDepartmentData[];
  onIssueDepartmentChange?: (departments: IssueDepartmentData[]) => void;
  onPoDataFetched?: (mast: PurchaseOrderMastDto | null, details: PurchaseOrderDetailDto[]) => void;
}

interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

interface SortingState {
  id: string;
  desc: boolean;
}

interface ColumnFilter {
  id: string;
  value: string;
}

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
}

function EnhancedTablePaginationActions(props: TablePaginationActionsProps) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 0.5 }}>
      <Tooltip title="First page">
        <span>
          <IconButton
            onClick={handleFirstPageButtonClick}
            disabled={page === 0}
            aria-label="first page"
            size="small"
            sx={{
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            {theme.direction === "rtl" ? <LastPage fontSize="small" /> : <FirstPage fontSize="small" />}
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Previous page">
        <span>
          <IconButton
            onClick={handleBackButtonClick}
            disabled={page === 0}
            aria-label="previous page"
            size="small"
            sx={{
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            {theme.direction === "rtl" ? <KeyboardArrowRight fontSize="small" /> : <KeyboardArrowLeft fontSize="small" />}
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Next page">
        <span>
          <IconButton
            onClick={handleNextButtonClick}
            disabled={page >= Math.ceil(count / rowsPerPage) - 1}
            aria-label="next page"
            size="small"
            sx={{
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            {theme.direction === "rtl" ? <KeyboardArrowLeft fontSize="small" /> : <KeyboardArrowRight fontSize="small" />}
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Last page">
        <span>
          <IconButton
            onClick={handleLastPageButtonClick}
            disabled={page >= Math.ceil(count / rowsPerPage) - 1}
            aria-label="last page"
            size="small"
            sx={{
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            {theme.direction === "rtl" ? <FirstPage fontSize="small" /> : <LastPage fontSize="small" />}
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}

const UnifiedGrnDetailsComponent: React.FC<UnifiedGrnDetailsComponentProps> = ({
  grnDetails,
  onGrnDetailsChange,
  control,
  setValue,
  watch,
  disabled = false,
  grnApproved = false,
  grnID = 0,
  catValue = "MEDI",
  issueDepartments = [],
  onIssueDepartmentChange,
  onPoDataFetched,
}) => {
  const theme = useTheme();
  const { showAlert } = useAlert();
  const dropdownValues = useDropdownValues(["taxType"]);
  const productSearchRef = useRef<ProductSearchRef>(null);
  const { getPurchaseOrderById } = usePurchaseOrder();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [activeView, setActiveView] = useState<"all" | "po" | "manual">("all");
  const [isPOSearchOpen, setIsPOSearchOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrderMastDto | null>(null);
  const [, setPoDetails] = useState<PurchaseOrderDetailDto[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    id: string | number | null;
  }>({ open: false, id: null });
  const [isIssueDeptDialogOpen, setIsIssueDeptDialogOpen] = useState(false);
  const [selectedProductForIssue, setSelectedProductForIssue] = useState<GrnDetailDto | null>(null);
  const [editingIssueDepartment, setEditingIssueDepartment] = useState<IssueDepartmentData | null>(null);
  const [poExpanded, setPoExpanded] = useState(false);
  const [manualExpanded, setManualExpanded] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState[]>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showColumnFilters, setShowColumnFilters] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const watchedDeptID = watch("deptID");
  const watchedDeptName = watch("deptName");

  const processedGrnDetails: UnifiedGRNDetailRow[] = useMemo(() => {
    return grnDetails.map((detail, index) => {
      const source = detail.poDetID && detail.poDetID > 0 ? "po" : "manual";
      const associatedIssueDepts = issueDepartments.filter((dept) => dept.productID === detail.productID);
      return {
        ...detail,
        id: detail.grnDetID || detail.poDetID || `temp-${detail.productID}-${index}`,
        _serialNo: index + 1,
        _issueDepartments: associatedIssueDepts,
        _source: source,
        _expanded: expandedRows.has(detail.grnDetID || detail.poDetID || `temp-${detail.productID}-${index}`),
      };
    });
  }, [grnDetails, issueDepartments, expandedRows]);

  const filteredRows = useMemo(() => {
    let filtered = processedGrnDetails;
    if (activeView !== "all") {
      filtered = filtered.filter((row) => row._source === activeView);
    }
    if (globalFilter) {
      filtered = filtered.filter((row) => Object.values(row).some((value) => String(value).toLowerCase().includes(globalFilter.toLowerCase())));
    }

    columnFilters.forEach((filter) => {
      if (filter.value) {
        filtered = filtered.filter((row) => {
          const cellValue = String((row as any)[filter.id] || "").toLowerCase();
          return cellValue.includes(filter.value.toLowerCase());
        });
      }
    });

    if (sorting.length > 0) {
      const sortConfig = sorting[0];
      filtered.sort((a, b) => {
        const aValue = (a as any)[sortConfig.id];
        const bValue = (b as any)[sortConfig.id];

        if (aValue < bValue) return sortConfig.desc ? 1 : -1;
        if (aValue > bValue) return sortConfig.desc ? -1 : 1;
        return 0;
      });
    }

    return filtered;
  }, [processedGrnDetails, activeView, globalFilter, columnFilters, sorting]);

  const paginatedRows = useMemo(() => {
    const startIndex = pagination.pageIndex * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredRows.slice(startIndex, endIndex);
  }, [filteredRows, pagination]);

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPagination((prev) => ({ ...prev, pageIndex: newPage }));
  }, []);

  const handleRequestSort = useCallback(
    (property: string) => {
      const isAsc = sorting.length > 0 && sorting[0].id === property && !sorting[0].desc;
      setSorting([{ id: property, desc: isAsc }]);
    },
    [sorting]
  );

  const handleColumnFilterChange = useCallback((columnId: string, value: string) => {
    setColumnFilters((prev) => {
      const newFilters = prev.filter((f) => f.id !== columnId);
      if (value) {
        newFilters.push({ id: columnId, value });
      }
      return newFilters;
    });
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const handleGlobalFilterChange = useCallback((value: string) => {
    setGlobalFilter(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setColumnFilters([]);
    setGlobalFilter("");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const handleSelectRow = useCallback((id: string | number) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleSelectAllRows = useCallback(() => {
    if (selectedRows.size === paginatedRows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedRows.map((row) => row.id)));
    }
  }, [selectedRows.size, paginatedRows]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [activeView]);

  const handleRowExpand = useCallback((id: string | number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    showAlert("Success", "Data refreshed successfully", "success");
  }, [showAlert]);

  const handlePoSelection = useCallback(
    async (po: PurchaseOrderMastDto) => {
      if (!po?.pOID) return;

      setIsPOSearchOpen(false);
      setSelectedPO(po);

      try {
        const fullPoData = await getPurchaseOrderById(po.pOID);

        if (fullPoData?.purchaseOrderMastDto) {
          const mast = fullPoData.purchaseOrderMastDto;
          const details = fullPoData.purchaseOrderDetailDto || [];

          setValue("poID", mast.pOID, { shouldDirty: true });
          setValue("poNo", mast.pOCode || "", { shouldDirty: true });
          setValue("poDate", mast.pODate ? dayjs(mast.pODate).toDate() : null, { shouldDirty: true });
          setValue("poTotalAmt", mast.totalAmt || 0, { shouldDirty: true });
          setValue("poDiscAmt", mast.discAmt || 0, { shouldDirty: true });

          setPoDetails(details);

          const poBasedGrnDetails = details.filter((poDetail) => poDetail.rActiveYN !== "N").map((poDetail) => createGrnDetailFromPo(poDetail));
          const manualProducts = grnDetails.filter((detail) => !detail.poDetID || detail.poDetID === 0);
          const updatedGrnDetails = [...manualProducts, ...poBasedGrnDetails];

          onGrnDetailsChange(updatedGrnDetails);
          if (onPoDataFetched) {
            onPoDataFetched(mast, details);
          }

          showAlert("Success", `PO ${mast.pOCode} selected with ${details.length} items`, "success");
          setActiveView("po");
          setPoExpanded(true);
        } else {
          showAlert("Warning", "Selected PO has no product details", "warning");
        }
      } catch (error) {
        console.error("Error fetching PO details:", error);
        showAlert("Error", "Failed to load PO details", "error");
      }
    },
    [getPurchaseOrderById, setValue, grnDetails, onGrnDetailsChange, onPoDataFetched, showAlert]
  );

  const createGrnDetailFromPo = useCallback(
    (poDetail: PurchaseOrderDetailDto): GrnDetailDto => {
      return {
        grnDetID: 0,
        grnID,
        poDetID: poDetail.pODetID,
        productID: poDetail.productID,
        productCode: poDetail.productCode || "",
        productName: poDetail.productName || "",
        catValue: poDetail.catValue || catValue,
        catDesc: poDetail.catDesc || "REVENUE",
        mfID: poDetail.manufacturerID,
        mfName: poDetail.manufacturerName || "",
        manufacturerID: poDetail.manufacturerID,
        manufacturerCode: poDetail.manufacturerCode,
        manufacturerName: poDetail.manufacturerName || "",
        pGrpID: poDetail.pGrpID,
        pGrpName: poDetail.pGrpName || "",
        psGrpID: poDetail.pSGrpID,
        psGrpName: poDetail.pSGrpName || "",
        pUnitID: poDetail.pUnitID,
        pUnitName: poDetail.pUnitName || "",
        pUnitsPerPack: poDetail.unitPack || 1,
        pkgID: poDetail.pPkgID,
        pkgName: poDetail.pPkgName || "",
        hsnCode: poDetail.hsnCode || "",
        requiredUnitQty: poDetail.requiredUnitQty || 0,
        recvdQty: poDetail.requiredUnitQty || 0,
        acceptQty: poDetail.requiredUnitQty || 0,
        freeItems: poDetail.freeQty || 0,
        unitPrice: poDetail.unitPrice || 0,
        sellUnitPrice: poDetail.unitPrice || 0,
        defaultPrice: poDetail.unitPrice || 0,
        mrp: 0,
        mrpAbated: 0,
        discAmt: poDetail.discAmt || 0,
        discPercentage: poDetail.discPercentageAmt || 0,
        cgstPerValue: poDetail.cgstPerValue || 0,
        cgstTaxAmt: poDetail.cgstTaxAmt || 0,
        sgstPerValue: poDetail.sgstPerValue || 0,
        sgstTaxAmt: poDetail.sgstTaxAmt || 0,
        taxableAmt: poDetail.taxableAmt || 0,
        taxAfterDiscYN: poDetail.taxAfterDiscYN || "N",
        taxAfterDiscOnMrpYN: poDetail.taxAfterDiscOnMrp || "N",
        taxOnFreeItemsYN: poDetail.taxOnFreeItemYN || "N",
        taxOnMrpYN: poDetail.taxOnMrpYN || "N",
        taxOnUnitPriceYN: poDetail.taxOnUnitPrice || "N",
        batchNo: "",
        refNo: "",
        expiryDate: "",
        productNotes: "",
        expiryYN: "N",
        isFreeItemYN: poDetail.isFreeItemYN || "N",
        productValue: 0,
        itemMrpValue: 0,
        itemTotalProfit: 0,
        itemTotalVat: 0,
        tax: 0,
        chargeablePercent: 0,
        taxCode: "",
        taxID: 0,
        taxModeCode: "",
        taxModeDescription: "",
        taxModeID: "",
        taxName: "",
        rActiveYN: "Y",
        rCreatedBy: "",
        rCreatedDate: "",
        rUpdatedBy: "",
        rUpdatedDate: "",
        rNotes: "",
      };
    },
    [grnID, catValue]
  );

  const handleClearPO = useCallback(() => {
    const manualProducts = grnDetails.filter((detail) => !detail.poDetID || detail.poDetID === 0);
    onGrnDetailsChange(manualProducts);
    setSelectedPO(null);
    setPoDetails([]);
    setValue("poID", 0, { shouldDirty: true });
    setValue("poNo", "", { shouldDirty: true });
    setValue("poDate", null, { shouldDirty: true });
    setValue("poTotalAmt", 0, { shouldDirty: true });
    setValue("poDiscAmt", 0, { shouldDirty: true });

    if (onPoDataFetched) {
      onPoDataFetched(null, []);
    }

    showAlert("Info", "PO selection cleared", "info");
    setActiveView("manual");
  }, [grnDetails, onGrnDetailsChange, setValue, onPoDataFetched, showAlert]);

  const handleProductSelect = useCallback(
    async (product: ProductListDto | null) => {
      if (!product?.productID) return;

      if (grnDetails.find((d) => d.productID === product.productID)) {
        showAlert("Warning", `"${product.productName}" is already added.`, "warning");
        productSearchRef.current?.clearSelection();
        return;
      }
      setIsAddingProduct(true);
      try {
        const productData = await productListService.getById(product.productID);
        const newDetail: GrnDetailDto = {
          grnDetID: 0,
          grnID: grnID > 0 ? grnID : 0,
          poDetID: 0,
          pGrpID: productData.data.pGrpID,
          pGrpName: productData.data.productGroupName,
          productID: productData.data.productID,
          productCode: productData.data.productCode,
          catValue: catValue || "MEDI",
          mfID: productData.data.manufacturerID,
          pUnitID: productData.data.pUnitID,
          pUnitName: productData.data.pUnitName,
          pUnitsPerPack: productData.data.unitPack || 1,
          pkgID: productData.data.pkgID,
          batchNo: "",
          expiryDate: "",
          unitPrice: productData.data.defaultPrice || 0,
          tax: 0,
          sellUnitPrice: productData.data.defaultPrice || 0,
          recvdQty: 1,
          acceptQty: 1,
          freeItems: 0,
          productValue: productData.data.defaultPrice || 0,
          productNotes: "",
          psGrpID: productData.data.psGrpID,
          chargeablePercent: 0,
          discAmt: 0,
          discPercentage: 0,
          expiryYN: productData.data.expiry === "Y" ? "Y" : "N",
          isFreeItemYN: "N",
          itemMrpValue: 0,
          itemTotalProfit: 0,
          itemTotalVat: 0,
          manufacturerCode: productData.data.manufacturerCode,
          manufacturerID: productData.data.manufacturerID,
          manufacturerName: productData.data.manufacturerName,
          mrpAbated: 0,
          mrp: 0,
          requiredUnitQty: 1,
          taxAfterDiscOnMrpYN: "N",
          taxAfterDiscYN: "N",
          taxCode: "",
          taxID: 0,
          taxModeCode: "",
          taxModeDescription: "",
          taxModeID: "",
          taxName: "",
          taxOnFreeItemsYN: "N",
          taxOnMrpYN: "N",
          taxOnUnitPriceYN: "Y",
          catDesc: "REVENUE",
          mfName: productData.data.manufacturerName,
          pkgName: productData.data.pkgName,
          productName: productData.data.productName,
          psGrpName: productData.data.psGroupName,
          refNo: "",
          hsnCode: productData.data.hsnCODE,
          cgstPerValue: productData.data.cgstPerValue || 0,
          cgstTaxAmt: 0,
          sgstPerValue: productData.data.sgstPerValue || 0,
          sgstTaxAmt: 0,
          taxableAmt: productData.data.defaultPrice || 0,
          defaultPrice: productData.data.defaultPrice || 0,
          rActiveYN: "Y",
          rCreatedBy: "",
          rCreatedDate: "",
          rUpdatedBy: "",
          rUpdatedDate: "",
          rNotes: "",
        };
        onGrnDetailsChange([...grnDetails, newDetail]);
        showAlert("Success", `Product "${productData.data.productName}" added.`, "success");
        setActiveView("manual");
      } catch (error) {
        console.error("Error adding product:", error);
        showAlert("Error", "Failed to add product. Please check if the product exists.", "error");
      } finally {
        setIsAddingProduct(false);
        productSearchRef.current?.clearSelection();
      }
    },
    [grnDetails, onGrnDetailsChange, showAlert, grnID, catValue]
  );

  const handleDeleteClick = useCallback((id: string | number) => {
    setDeleteConfirmation({ open: true, id });
  }, []);

  const handleDeleteRow = () => {
    if (!deleteConfirmation.id) return;

    const updatedDetails = grnDetails.filter((detail) => {
      const detailId = detail.grnDetID || detail.poDetID || `temp-${detail.productID}-${grnDetails.indexOf(detail)}`;
      return detailId !== deleteConfirmation.id;
    });

    onGrnDetailsChange(updatedDetails);
    setDeleteConfirmation({ open: false, id: null });
    showAlert("Success", "Product removed successfully.", "success");
  };

  const handleDeleteSelected = useCallback(() => {
    const updatedDetails = grnDetails.filter((detail) => {
      const detailId = detail.grnDetID || detail.poDetID || `temp-${detail.productID}-${grnDetails.indexOf(detail)}`;
      return !selectedRows.has(detailId);
    });

    onGrnDetailsChange(updatedDetails);
    setSelectedRows(new Set());
    showAlert("Success", `${selectedRows.size} products removed successfully.`, "success");
  }, [grnDetails, selectedRows, onGrnDetailsChange, showAlert]);

  const handleDeleteAll = useCallback(() => {
    if (activeView !== "all") {
      const remainingItems = grnDetails.filter((detail) => {
        const source = detail.poDetID && detail.poDetID > 0 ? "po" : "manual";
        return source !== activeView;
      });
      onGrnDetailsChange(remainingItems);
      showAlert("Success", `All ${activeView === "po" ? "PO" : "manual"} products removed.`, "success");
    } else {
      onGrnDetailsChange([]);
      showAlert("Success", "All products removed.", "success");
    }
  }, [activeView, grnDetails, onGrnDetailsChange, showAlert]);

  const handleCellValueChange = useCallback(
    (id: string | number, field: keyof GrnDetailDto, value: any) => {
      const updatedDetails = [...grnDetails];

      const index = updatedDetails.findIndex((detail) => {
        const detailId = detail.grnDetID || detail.poDetID || `temp-${detail.productID}-${updatedDetails.indexOf(detail)}`;
        return detailId === id;
      });
      if (index === -1) return;
      const currentRow = { ...updatedDetails[index] };
      (currentRow as any)[field] = value;

      if (field === "unitPrice" || field === "pUnitsPerPack") {
        const unitPrice = currentRow.unitPrice || 0;
        const unitsPerPack = currentRow.pUnitsPerPack || 1;
        const packPrice = parseFloat((unitPrice * unitsPerPack).toFixed(2));
        currentRow.productValue = packPrice;
      }
      if (field === "recvdQty") {
        currentRow.acceptQty = currentRow.recvdQty;
      }
      if (field === "gstPercentage") {
        const gstValue = Number(value) || 0;
        currentRow.cgstPerValue = parseFloat((gstValue / 2).toFixed(2));
        currentRow.sgstPerValue = parseFloat((gstValue / 2).toFixed(2));
      }
      const receivedQty = currentRow.recvdQty || 0;
      const unitPrice = currentRow.unitPrice || 0;
      const discPercentage = currentRow.discPercentage || 0;
      const cgstRate = currentRow.cgstPerValue || 0;
      const sgstRate = currentRow.sgstPerValue || 0;
      const gstPercentage = cgstRate + sgstRate;
      const isTaxAfterDisc = currentRow.taxAfterDiscYN === "Y";
      let baseAmount = receivedQty * unitPrice;
      let discountAmount = baseAmount * (discPercentage / 100);
      let taxableAmount = baseAmount - discountAmount;
      let totalTaxAmount = isTaxAfterDisc ? taxableAmount * (gstPercentage / 100) : baseAmount * (gstPercentage / 100);
      let finalValue = taxableAmount + totalTaxAmount;
      currentRow.discAmt = parseFloat(discountAmount.toFixed(2));
      currentRow.taxableAmt = parseFloat(taxableAmount.toFixed(2));
      const totalGstPercentage = (currentRow.cgstPerValue || 0) + (currentRow.sgstPerValue || 0);
      if (totalGstPercentage > 0) {
        currentRow.cgstTaxAmt = parseFloat((totalTaxAmount * ((currentRow.cgstPerValue || 0) / totalGstPercentage)).toFixed(2));
        currentRow.sgstTaxAmt = parseFloat((totalTaxAmount * ((currentRow.sgstPerValue || 0) / totalGstPercentage)).toFixed(2));
      } else {
        currentRow.cgstTaxAmt = 0;
        currentRow.sgstTaxAmt = 0;
      }

      currentRow.productValue = parseFloat(finalValue.toFixed(2));

      updatedDetails[index] = currentRow;
      onGrnDetailsChange(updatedDetails);
    },
    [grnDetails, onGrnDetailsChange]
  );

  const handleDropdownChange = useCallback(
    (value: number, id: string | number) => {
      const selectedTax = dropdownValues.taxType?.find((tax) => Number(tax.label) === Number(value));
      const selectedRate = Number(selectedTax?.label || 0);
      handleCellValueChange(id, "gstPercentage", selectedRate);
    },
    [dropdownValues.taxType, handleCellValueChange]
  );

  const handleIssueDepartmentClick = useCallback((row: UnifiedGRNDetailRow) => {
    setSelectedProductForIssue(row);
    setEditingIssueDepartment(null);
    setIsIssueDeptDialogOpen(true);
  }, []);

  const handleEditIssueDepartment = useCallback((row: UnifiedGRNDetailRow, issueDept: IssueDepartmentData) => {
    setSelectedProductForIssue(row);
    setEditingIssueDepartment(issueDept);
    setIsIssueDeptDialogOpen(true);
  }, []);

  const handleDeleteIssueDepartment = useCallback(
    (productID: number, issueDeptId: string) => {
      if (onIssueDepartmentChange) {
        const updatedDepartments = issueDepartments.filter((dept) => !(dept.productID === productID && dept.id === issueDeptId));
        onIssueDepartmentChange(updatedDepartments);
        showAlert("Success", "Issue department removed successfully.", "success");
      }
    },
    [issueDepartments, onIssueDepartmentChange, showAlert]
  );

  const handleIssueDepartmentSubmit = useCallback(
    (data: IssueDepartmentData) => {
      if (onIssueDepartmentChange) {
        let updatedDepartments = [...issueDepartments];
        if (editingIssueDepartment) {
          const index = updatedDepartments.findIndex((dept) => dept.id === editingIssueDepartment.id);
          if (index !== -1) {
            updatedDepartments[index] = data;
            showAlert("Success", "Issue department updated successfully.", "success");
          }
        } else {
          updatedDepartments.push(data);
          showAlert("Success", "Issue department added successfully.", "success");
        }
        onIssueDepartmentChange(updatedDepartments);
      }
      setIsIssueDeptDialogOpen(false);
      setEditingIssueDepartment(null);
      setSelectedProductForIssue(null);
    },
    [editingIssueDepartment, issueDepartments, onIssueDepartmentChange, showAlert]
  );

  const handleIssueDepartmentDialogClose = useCallback(() => {
    setIsIssueDeptDialogOpen(false);
    setEditingIssueDepartment(null);
    setSelectedProductForIssue(null);
  }, []);

  const ColumnFilter = ({ columnId, label }: { columnId: string; label: string }) => {
    const filterValue = columnFilters.find((f) => f.id === columnId)?.value || "";

    return (
      <TextField
        size="small"
        placeholder={`Filter ${label}...`}
        value={filterValue}
        onChange={(e) => handleColumnFilterChange(columnId, e.target.value)}
        InputProps={{
          sx: {
            fontSize: "0.75rem",
            "& .MuiOutlinedInput-input": {
              padding: "4px 8px",
            },
          },
        }}
        sx={{
          width: "100%",
          minWidth: "120px",
          "& .MuiOutlinedInput-root": {
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
          },
        }}
      />
    );
  };

  const renderProductRow = useCallback(
    (row: UnifiedGRNDetailRow, globalIndex: number) => {
      const isFirstRow = globalIndex === 0;
      const isSelected = selectedRows.has(row.id);

      return (
        <React.Fragment key={row.id}>
          <TableRow
            sx={{
              backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.08) : isFirstRow ? alpha(theme.palette.primary.main, 0.02) : "transparent",
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              },
              cursor: "pointer",
            }}
          >
            <TableCell padding="checkbox">
              <Checkbox checked={isSelected} onChange={() => handleSelectRow(row.id)} size="small" disabled={disabled || grnApproved} />
            </TableCell>
            <TableCell>
              <Chip
                label={row._source === "po" ? "PO" : "Manual"}
                size="small"
                color={row._source === "po" ? "primary" : "warning"}
                variant="outlined"
                sx={{ minWidth: 75, fontWeight: 500 }}
              />
            </TableCell>
            <TableCell align="center">
              <Typography variant="body2" fontWeight={500}>
                {pagination.pageIndex * pagination.pageSize + globalIndex + 1}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2" fontWeight={500} noWrap>
                {row.productName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {row.productCode}
              </Typography>
            </TableCell>

            <TableCell align="right">
              <Typography variant="body2" fontWeight={500}>
                {row.requiredUnitQty || 0}
              </Typography>
            </TableCell>
            <TableCell>
              <TextField
                size="small"
                type="number"
                value={row.recvdQty || ""}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  handleCellValueChange(row.id, "recvdQty", value);
                }}
                sx={{ width: "100px" }}
                inputProps={{ style: { textAlign: "right" } }}
                disabled={disabled || grnApproved}
              />
            </TableCell>

            <TableCell>
              <TextField
                size="small"
                type="number"
                value={row.acceptQty || ""}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  handleCellValueChange(row.id, "acceptQty", value);
                }}
                sx={{ width: "100px" }}
                inputProps={{ style: { textAlign: "right" } }}
                disabled={disabled || grnApproved}
              />
            </TableCell>

            <TableCell>
              <TextField
                size="small"
                type="number"
                value={row.freeItems || ""}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  handleCellValueChange(row.id, "freeItems", value);
                }}
                sx={{ width: "80px" }}
                inputProps={{ style: { textAlign: "right" } }}
                disabled={disabled || grnApproved}
              />
            </TableCell>
            <TableCell>{row.pUnitName}</TableCell>

            <TableCell>
              <TextField
                size="small"
                value={row.batchNo || ""}
                onChange={(e) => {
                  handleCellValueChange(row.id, "batchNo", e.target.value);
                }}
                sx={{ width: "100px" }}
                disabled={disabled || grnApproved}
              />
            </TableCell>
            <TableCell>
              <TextField
                size="small"
                type="date"
                value={row.expiryDate ? dayjs(row.expiryDate).format("YYYY-MM-DD") : ""}
                onChange={(e) => {
                  handleCellValueChange(row.id, "expiryDate", e.target.value);
                }}
                sx={{ width: "130px" }}
                disabled={disabled || grnApproved}
                InputLabelProps={{ shrink: true }}
              />
            </TableCell>

            <TableCell>
              <TextField
                size="small"
                type="number"
                value={row.unitPrice || ""}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  handleCellValueChange(row.id, "unitPrice", value);
                }}
                sx={{ width: "100px" }}
                inputProps={{ style: { textAlign: "right" }, step: 0.01 }}
                disabled={disabled || grnApproved}
              />
            </TableCell>
            <TableCell>
              <Select
                size="small"
                value={(row.cgstPerValue || 0) + (row.sgstPerValue || 0) || ""}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  handleDropdownChange(value, row.id);
                }}
                sx={{ width: "80px" }}
                displayEmpty
                disabled={disabled || grnApproved}
              >
                {(dropdownValues.taxType || []).map((option) => (
                  <MenuItem key={option.value} value={Number(option.label)}>
                    {option.label}%
                  </MenuItem>
                ))}
              </Select>
            </TableCell>

            <TableCell align="center">
              <Checkbox
                checked={row.taxAfterDiscYN === "Y"}
                onChange={(e) => {
                  handleCellValueChange(row.id, "taxAfterDiscYN", e.target.checked ? "Y" : "N");
                }}
                disabled={disabled || grnApproved}
                size="small"
              />
            </TableCell>

            <TableCell align="right">
              <Typography variant="body2" fontWeight={500}>
                {(row.cgstTaxAmt || 0).toFixed(2)}
              </Typography>
            </TableCell>

            <TableCell align="right">
              <Typography variant="body2" fontWeight={500}>
                {(row.sgstTaxAmt || 0).toFixed(2)}
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="body2" fontWeight="bold" color="primary">
                {(row.productValue || 0).toFixed(2)}
              </Typography>
            </TableCell>

            <TableCell>
              <Box display="flex" alignItems="center" gap={1}>
                {row._issueDepartments.length > 0 ? (
                  <>
                    <Chip label={`${row._issueDepartments.length} Dept${row._issueDepartments.length > 1 ? "s" : ""}`} size="small" color="success" variant="outlined" />
                    <Tooltip title="View/Edit Issue Departments">
                      <IconButton size="small" onClick={() => handleRowExpand(row.id)} disabled={disabled || grnApproved}>
                        {row._expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </>
                ) : (
                  <Tooltip title="Add Issue Department">
                    <IconButton size="small" onClick={() => handleIssueDepartmentClick(row)} disabled={disabled || grnApproved} color="primary">
                      <IssueIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </TableCell>

            {/* Actions */}
            <TableCell align="center">
              <Tooltip title="Remove Product">
                <IconButton size="small" onClick={() => handleDeleteClick(row.id)} disabled={disabled || grnApproved} color="error">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell colSpan={18} sx={{ p: 0, border: "none" }}>
              <Collapse in={row._expanded} timeout="auto" unmountOnExit>
                <Box sx={{ p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Issue Department Details for {row.productName}
                  </Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Sl.No</TableCell>
                        <TableCell>Issue Department Name</TableCell>
                        <TableCell align="right">Issue Quantity</TableCell>
                        <TableCell align="center">Edit</TableCell>
                        <TableCell align="center">Delete</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {row._issueDepartments.map((dept, index) => (
                        <TableRow key={dept.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{dept.deptName}</TableCell>
                          <TableCell align="right">{dept.quantity}</TableCell>
                          <TableCell align="center">
                            <IconButton size="small" onClick={() => handleEditIssueDepartment(row, dept)} disabled={disabled || grnApproved}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small" onClick={() => handleDeleteIssueDepartment(row.productID, dept.id || "")} disabled={disabled || grnApproved} color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
                    <CustomButton
                      size="small"
                      variant="outlined"
                      text="Add Issue Department"
                      icon={IssueIcon}
                      onClick={() => handleIssueDepartmentClick(row)}
                      disabled={disabled || grnApproved}
                      color="primary"
                    />
                  </Box>
                </Box>
              </Collapse>
            </TableCell>
          </TableRow>
        </React.Fragment>
      );
    },
    [
      selectedRows,
      handleSelectRow,
      handleCellValueChange,
      handleRowExpand,
      handleIssueDepartmentClick,
      handleEditIssueDepartment,
      handleDeleteIssueDepartment,
      handleDeleteClick,
      handleDropdownChange,
      dropdownValues.taxType,
      disabled,
      grnApproved,
      theme.palette.primary.main,
      pagination.pageIndex,
      pagination.pageSize,
    ]
  );

  return (
    <>
      <Accordion expanded={poExpanded} onChange={() => setPoExpanded(!poExpanded)} sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <POIcon color="primary" />
            <Typography variant="h6" color="primary">
              Purchase Order Information
            </Typography>
            <Chip label="Optional" size="small" color="info" variant="outlined" />
            {selectedPO && <Chip label={`PO: ${selectedPO.pOCode}`} size="small" color="success" variant="filled" onDelete={handleClearPO} />}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <EnhancedFormField
                name="poNo"
                control={control}
                type="text"
                label="PO Code"
                size="small"
                disabled
                helperText={selectedPO ? `Selected PO: ${selectedPO.pOCode}` : "Click search to select PO"}
                adornment={
                  <InputAdornment position="end">
                    <CustomButton
                      size="small"
                      variant="outlined"
                      icon={SearchIcon}
                      text="Search"
                      onClick={() => setIsPOSearchOpen(true)}
                      disabled={disabled || grnApproved || !watchedDeptID}
                      color="primary"
                    />
                  </InputAdornment>
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <EnhancedFormField name="poDate" control={control} type="datepicker" label="PO Date" size="small" disabled />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <EnhancedFormField name="poTotalAmt" control={control} type="number" label="PO Amount" size="small" disabled />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={manualExpanded} onChange={() => setManualExpanded(!manualExpanded)} sx={{ mt: 2, boxShadow: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <PurchaseIcon color="primary" />
            <Typography variant="h6" color="primary">
              Manual Product Addition
            </Typography>
            <Chip label="Add products directly" size="small" color="primary" variant="outlined" />
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: { xs: 1, md: 2 } }}>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 8 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <ProductSearch
                    ref={productSearchRef}
                    onProductSelect={handleProductSelect as any}
                    label="Product Search"
                    placeholder="Scan or type to add products manually..."
                    disabled={disabled || grnApproved || isAddingProduct}
                    className="product-search-field"
                  />
                  {isAddingProduct && <CircularProgress size={24} />}
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </AccordionDetails>
      </Accordion>
      <Card
        variant="outlined"
        sx={{
          mt: 2,
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          transition: "box-shadow 0.3s ease",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          },
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <Box
          sx={{
            p: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.04),
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                }}
              >
                <InventoryIcon sx={{ color: theme.palette.primary.main, fontSize: 18 }} />
              </Box>
              <Typography variant="h6" fontWeight="600" color="primary.main">
                GRN Product Details
              </Typography>
              <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: alpha(theme.palette.primary.main, 0.2) }} />
              <Typography variant="body2" color="text.secondary">
                {activeView === "all" ? "All products for GRN" : activeView === "po" ? "PO-based products" : "Manually added products"}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                label={`${filteredRows.length} ${filteredRows.length === 1 ? "Product" : "Products"} ${
                  filteredRows.length !== processedGrnDetails.length ? `(filtered from ${processedGrnDetails.length})` : ""
                }`}
                variant="outlined"
                color="primary"
                size="small"
                sx={{ fontWeight: "600", borderWidth: 2 }}
              />
              {selectedRows.size > 0 && <Chip label={`${selectedRows.size} Selected`} variant="filled" color="secondary" size="small" sx={{ fontWeight: "600" }} />}
            </Box>
          </Box>
          <Toolbar
            variant="dense"
            sx={{
              pl: 0,
              pr: 0,
              minHeight: "auto !important",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <FormControl size="small" sx={{ minWidth: 250 }}>
              <OutlinedInput
                value={globalFilter}
                onChange={(e) => handleGlobalFilterChange(e.target.value)}
                placeholder="Search all columns..."
                startAdornment={
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                }
                endAdornment={
                  globalFilter && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => handleGlobalFilterChange("")}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: theme.palette.background.paper,
                  },
                }}
              />
            </FormControl>

            <Tabs value={activeView} onChange={(_, newValue) => setActiveView(newValue)} component={Paper}>
              <Tab
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <span>All Products</span>
                    <Chip label={processedGrnDetails.length} size="small" color="primary" sx={{ height: 18, minWidth: 24 }} />
                  </Box>
                }
                value="all"
              />
              <Tab
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <span>PO Products</span>
                    <Chip label={processedGrnDetails.filter((row) => row._source === "po").length} size="small" color="primary" sx={{ height: 18, minWidth: 24 }} />
                  </Box>
                }
                value="po"
              />
              <Tab
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <span>Manual Products</span>
                    <Chip label={processedGrnDetails.filter((row) => row._source === "manual").length} size="small" color="primary" sx={{ height: 18, minWidth: 24 }} />
                  </Box>
                }
                value="manual"
              />
            </Tabs>

            <Box sx={{ flex: 1 }} />

            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setShowColumnFilters(!showColumnFilters)}
                color={showColumnFilters ? "primary" : "inherit"}
              >
                Filters
              </Button>
              <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh} disabled={isRefreshing}>
                {isRefreshing ? <CircularProgress size={16} /> : "Refresh"}
              </Button>
              <Button size="small" variant="outlined" startIcon={<ClearIcon />} onClick={handleClearFilters} disabled={!globalFilter && columnFilters.length === 0}>
                Clear Filters
              </Button>
              {selectedRows.size > 0 && (
                <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDeleteSelected} disabled={disabled || grnApproved}>
                  Delete Selected ({selectedRows.size})
                </Button>
              )}
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteAll}
                disabled={disabled || grnApproved || filteredRows.length === 0}
              >
                Remove {activeView === "all" ? "All" : activeView === "po" ? "PO Items" : "Manual Items"}
              </Button>
            </Stack>
          </Toolbar>

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Rows per page:
              </Typography>
              <FormControl size="small" variant="outlined">
                <Select value={pagination.pageSize} onChange={(e) => setPagination({ pageIndex: 0, pageSize: Number(e.target.value) })} sx={{ minWidth: 80 }}>
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Showing {pagination.pageIndex * pagination.pageSize + 1} to {Math.min((pagination.pageIndex + 1) * pagination.pageSize, filteredRows.length)} of {filteredRows.length}{" "}
              entries
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ pt: 0, pb: 0 }}>
          {isAddingProduct ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 200,
              }}
            >
              <LocalFireDepartment sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              <Typography variant="body1" sx={{ ml: 2 }} color="primary">
                Adding product...
              </Typography>
            </Box>
          ) : filteredRows.length > 0 ? (
            <>
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{
                  maxHeight: 600,
                  borderRadius: 1,
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  "& ::-webkit-scrollbar": {
                    width: "12px",
                    height: "12px",
                  },
                  "& ::-webkit-scrollbar-track": {
                    borderRadius: "6px",
                  },
                  "& ::-webkit-scrollbar-thumb": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.6),
                    borderRadius: "6px",
                    border: `2px solid ${alpha(theme.palette.background.paper, 1)}`,
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.8),
                    },
                  },
                  scrollbarWidth: "thin",
                }}
              >
                <Table stickyHeader size="small" sx={{ minWidth: 1400 }}>
                  <TableHead>
                    <TableRow
                      sx={{
                        "& th": {
                          fontWeight: "700",
                          backgroundColor: alpha(theme.palette.primary.main, 0.08),
                          borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          position: "sticky",
                          top: 0,
                          zIndex: 10,
                          fontSize: "0.875rem",
                        },
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedRows.size === paginatedRows.length && paginatedRows.length > 0}
                          indeterminate={selectedRows.size > 0 && selectedRows.size < paginatedRows.length}
                          onChange={handleSelectAllRows}
                          size="small"
                          disabled={disabled || grnApproved}
                        />
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sorting.length > 0 && sorting[0].id === "_source"}
                          direction={sorting.length > 0 && sorting[0].id === "_source" ? (sorting[0].desc ? "desc" : "asc") : "asc"}
                          onClick={() => handleRequestSort("_source")}
                        >
                          Source
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="center">Sl. No</TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sorting.length > 0 && sorting[0].id === "productName"}
                          direction={sorting.length > 0 && sorting[0].id === "productName" ? (sorting[0].desc ? "desc" : "asc") : "asc"}
                          onClick={() => handleRequestSort("productName")}
                        >
                          Product Name
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="right">
                        <TableSortLabel
                          active={sorting.length > 0 && sorting[0].id === "requiredUnitQty"}
                          direction={sorting.length > 0 && sorting[0].id === "requiredUnitQty" ? (sorting[0].desc ? "desc" : "asc") : "asc"}
                          onClick={() => handleRequestSort("requiredUnitQty")}
                        >
                          Required Qty
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Received Qty</TableCell>
                      <TableCell>Accept Qty</TableCell>
                      <TableCell>Free Items</TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sorting.length > 0 && sorting[0].id === "pUnitName"}
                          direction={sorting.length > 0 && sorting[0].id === "pUnitName" ? (sorting[0].desc ? "desc" : "asc") : "asc"}
                          onClick={() => handleRequestSort("pUnitName")}
                        >
                          UOM
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Batch No</TableCell>
                      <TableCell>Expiry Date</TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sorting.length > 0 && sorting[0].id === "unitPrice"}
                          direction={sorting.length > 0 && sorting[0].id === "unitPrice" ? (sorting[0].desc ? "desc" : "asc") : "asc"}
                          onClick={() => handleRequestSort("unitPrice")}
                        >
                          Unit Price
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>GST[%]</TableCell>
                      <TableCell align="center">Tax after Disc</TableCell>
                      <TableCell align="right">CGST Amt</TableCell>
                      <TableCell align="right">SGST Amt</TableCell>
                      <TableCell align="right">
                        <TableSortLabel
                          active={sorting.length > 0 && sorting[0].id === "productValue"}
                          direction={sorting.length > 0 && sorting[0].id === "productValue" ? (sorting[0].desc ? "desc" : "asc") : "asc"}
                          onClick={() => handleRequestSort("productValue")}
                        >
                          Value
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Issue Department</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                    {showColumnFilters && (
                      <TableRow
                        sx={{
                          "& th": {
                            backgroundColor: alpha(theme.palette.primary.main, 0.04),
                            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                            position: "sticky",
                            top: 57,
                            zIndex: 9,
                            padding: "4px 8px",
                          },
                        }}
                      >
                        <TableCell padding="checkbox"></TableCell>
                        <TableCell>
                          <ColumnFilter columnId="_source" label="Source" />
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell>
                          <ColumnFilter columnId="productName" label="Product" />
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell>
                          <ColumnFilter columnId="pUnitName" label="UOM" />
                        </TableCell>
                        <TableCell>
                          <ColumnFilter columnId="batchNo" label="Batch" />
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    )}
                  </TableHead>
                  <TableBody>{paginatedRows.map((row, index) => renderProductRow(row, index))}</TableBody>
                </Table>
              </TableContainer>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2,
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Showing {pagination.pageIndex * pagination.pageSize + 1} to {Math.min((pagination.pageIndex + 1) * pagination.pageSize, filteredRows.length)} of{" "}
                    {filteredRows.length} entries
                  </Typography>
                  {filteredRows.length !== processedGrnDetails.length && (
                    <Typography variant="body2" color="text.secondary">
                      (filtered from {processedGrnDetails.length} total entries)
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Page {pagination.pageIndex + 1} of {Math.ceil(filteredRows.length / pagination.pageSize)}
                  </Typography>
                  <EnhancedTablePaginationActions count={filteredRows.length} page={pagination.pageIndex} rowsPerPage={pagination.pageSize} onPageChange={handleChangePage} />
                </Box>
              </Box>
            </>
          ) : (
            <Paper
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: 2,
                border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                m: 2,
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
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  mx: "auto",
                  mb: 2,
                }}
              >
                <InventoryIcon sx={{ fontSize: 32, color: alpha(theme.palette.primary.main, 0.7) }} />
              </Box>
              <Typography variant="h6" fontWeight="600" color="text.primary" gutterBottom>
                {globalFilter || columnFilters.length > 0 ? "No products match your filters" : "No Products Added"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: "auto" }}>
                {globalFilter || columnFilters.length > 0
                  ? "Try adjusting your search criteria or clearing the filters to see more results."
                  : activeView === "all"
                  ? "Add products via a Purchase Order or manually using the product search."
                  : activeView === "po"
                  ? "Select a Purchase Order to add products from it."
                  : "Use the product search to manually add products."}
              </Typography>
              {(globalFilter || columnFilters.length > 0) && (
                <Button variant="outlined" onClick={handleClearFilters} sx={{ mt: 2 }} startIcon={<ClearIcon />}>
                  Clear All Filters
                </Button>
              )}
            </Paper>
          )}
        </CardContent>
      </Card>

      <POSearchDialog
        open={isPOSearchOpen}
        onClose={() => setIsPOSearchOpen(false)}
        onSelectPO={handlePoSelection}
        departmentId={watchedDeptID || undefined}
        departmentName={watchedDeptName}
      />

      <ConfirmationDialog
        open={deleteConfirmation.open}
        onClose={() => setDeleteConfirmation({ open: false, id: null })}
        onConfirm={handleDeleteRow}
        title="Confirm Delete"
        message="Are you sure you want to delete this item?"
        confirmText="Delete"
        cancelText="Cancel"
        type="warning"
      />

      <IssueDepartmentDialog
        open={isIssueDeptDialogOpen}
        onClose={handleIssueDepartmentDialogClose}
        onSubmit={handleIssueDepartmentSubmit}
        selectedProduct={selectedProductForIssue}
        editData={editingIssueDepartment}
        title={editingIssueDepartment ? "Edit Issue Department" : "New Issue Department"}
      />
    </>
  );
};

export default UnifiedGrnDetailsComponent;
