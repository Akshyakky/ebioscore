import SmartButton from "@/components/Button/SmartButton";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { useLoading } from "@/hooks/Common/useLoading";
import useDepartmentSelection from "@/hooks/InventoryManagement/useDepartmentSelection";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { BChargeDto } from "@/interfaces/Billing/BChargeDetails";
import { BillProductsDto, BillSaveRequest } from "@/interfaces/Billing/BillingDto";
import { ProductBatchDto } from "@/interfaces/InventoryManagement/ProductBatchDto";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import { PatientSearchResult } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";
import { GetPatientAllVisitHistory } from "@/interfaces/PatientAdministration/revisitFormData";
import { BatchSelectionDialog, useBatchSelection } from "@/pages/inventoryManagement/CommonPage/BatchSelectionDialog";
import DepartmentSelectionDialog from "@/pages/inventoryManagement/CommonPage/DepartmentSelectionDialog";
import { PatientDemographics } from "@/pages/patientAdministration/CommonPage/Patient/PatientDemographics/PatientDemographics";
import { PatientSearch } from "@/pages/patientAdministration/CommonPage/Patient/PatientSearch/PatientSearch";
import PatientVisitDialog from "@/pages/patientAdministration/RevisitPage/SubPage/PatientVisitDialog";
import { useAlert } from "@/providers/AlertProvider";
import { bChargeService, billingGenericService, billingService } from "@/services/BillingServices/BillingService";
import { productListService } from "@/services/InventoryManagementService/inventoryManagementService";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  MedicalServices as MedicalServicesIcon,
  Save as SaveIcon,
  ShoppingCart as ShoppingCartIcon,
} from "@mui/icons-material";
import {
  Alert,
  Autocomplete,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useBilling } from "../hooks/useBilling";

// Schema definitions (keeping the same)
const BillServicesDtoSchema = z.object({
  billDetID: z.number().default(0),
  billID: z.number().default(0),
  chargeDt: z.union([z.date(), z.string()]).default(new Date()),
  chargeID: z.number(),
  chargeCode: z.string().default(""),
  chargeDesc: z.string().default(""),
  chargeDescLang: z.string().optional(),
  cHValue: z.number().default(0),
  chUnits: z.number().optional().default(1),
  chDisc: z.number().optional().default(0),
  actualDDValue: z.number().optional().default(0),
  actualHCValue: z.number().optional().default(0),
  dCValue: z.number().optional().default(0),
  drPercShare: z.number().optional().default(0),
  dValDisc: z.number().optional().default(0),
  hCValue: z.number().optional().default(0),
  hospPercShare: z.number().optional().default(0),
  hValDisc: z.number().optional().default(0),
  packID: z.number().optional(),
  packName: z.string().optional(),
  physicianID: z.number().optional(),
  PhysicianName: z.string().optional(),
  sGRPID: z.number().optional(),
  sGRPName: z.string().optional(),
  opipNo: z.number().optional(),
  bCHID: z.number(),
  bCHName: z.string().default(""),
  physicianYN: z.string().default("N"),
  nHSXessAmt: z.number().optional().default(0),
  actualAmt: z.number().optional().default(0),
  procedureID: z.number().optional(),
  procedureName: z.string().optional(),
  chargeCost: z.number().default(0),
  deptID: z.number().optional(),
  deptName: z.string().optional(),
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().default("N"),
  rNotes: z.string().optional(),
});

const BillProductsDtoSchema = z.object({
  billDetID: z.number().default(0),
  billID: z.number().default(0),
  productID: z.number(),
  productCode: z.string().optional(),
  productName: z.string().optional(),
  batchNo: z.string().optional(),
  expiryDate: z.union([z.date(), z.string()]).optional(),
  grnDetID: z.number().optional(),
  deptID: z.number(),
  deptName: z.string().default(""),
  cHValue: z.number().default(0),
  chUnits: z.number().optional().default(1),
  chDisc: z.number().optional().default(0),
  actualDDValue: z.number().optional().default(0),
  actualHCValue: z.number().optional().default(0),
  dCValue: z.number().optional().default(0),
  drPercShare: z.number().optional().default(0),
  dValDisc: z.number().optional().default(0),
  hCValue: z.number().optional().default(0),
  hospPercShare: z.number().optional().default(0),
  hValDisc: z.number().optional().default(0),
  packID: z.number().optional(),
  packName: z.string().optional(),
  opipNo: z.number().optional(),
  physicianYN: z.string().default("N"),
  actualAmt: z.number().optional().default(0),
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().default("N"),
  rNotes: z.string().optional(),
});

// Add this to your schema definition
const schema = z.object({
  pChartID: z.number().min(1, "Patient selection is required"),
  pChartCode: z.string().default(""),
  pFName: z.string().default(""),
  pLName: z.string().optional().default(""),
  pMName: z.string().optional().default(""),
  pTitle: z.string().optional().default(""),
  billID: z.number().default(0),
  billCode: z.string().default(""),
  billDate: z.date().default(new Date()),
  pTypeID: z.number().min(1, "Payment source is required"),
  pTypeName: z.string().default(""),
  pTypeCode: z.string().optional().default(""),
  patOPIP: z.enum(["O", "I"]).default("O"),
  billStatus: z.enum(["A", "C", "D"]).default("A"),
  physicianID: z.number().optional(),
  physicianName: z.string().optional(),
  referralID: z.number().optional(),
  referralName: z.string().optional(),
  referral2ID: z.number().optional(),
  referralName2: z.string().optional(),
  billMisc: z.string().optional().default(""),
  admitID: z.number().default(0),
  opipCaseNo: z.number().default(0),
  opIPNo: z.number().default(0),
  disapprovedEmpID: z.number().optional(),
  disapproveEmpName: z.string().optional(),
  groupDisc: z.number().optional().default(0),
  langType: z.string().optional(),
  patMemID: z.number().optional(),
  patMemName: z.string().optional(),
  pckAmount: z.number().optional(),
  pckCode: z.string().optional(),
  pckID: z.number().optional(),
  pckName: z.string().optional(),
  strProfitOrLoss: z.string().optional(),
  profitOrLoss: z.number().optional(),
  sourceID: z.number().default(0),
  source: z.string().optional(),
  oldPChartID: z.number().default(0),
  drBillID: z.number().default(0),
  billGrossAmt: z.number().default(0),
  billDiscAmt: z.number().default(0),
  visitReferenceCode: z.string().optional().default(""), // Add this field to store visit reference
  billServices: z.array(BillServicesDtoSchema).default([]),
  billProducts: z.array(BillProductsDtoSchema).default([]),
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().optional().default("N"),
  rNotes: z.string().optional().default(""),
});

type BillingFormData = z.infer<typeof schema>;

// Interface for DataGrid rows
interface BillServiceRow extends z.infer<typeof BillServicesDtoSchema> {
  id: string | number;
}

interface BillProductRow extends z.infer<typeof BillProductsDtoSchema> {
  id: string | number;
}

// Mock product interface (replace with your actual product interface)
interface ProductDto {
  productID: number;
  productCode: string;
  productName: string;
  unitPrice: number;
  availableQuantity?: number;
  batchNo?: string;
  expiryDate?: string;
  grnDetID?: number;
  deptID?: number;
  deptName?: string;
}

const BillingPage: React.FC = () => {
  const theme = useTheme();
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();
  const [selectedPChartID, setSelectedPChartID] = useState<number>(0);
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);
  const [clearSearchTrigger, setClearSearchTrigger] = useState(0);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isChangingVisit, setIsChangingVisit] = useState(false); // New state for changing visit
  const [formError, setFormError] = useState<string | null>(null);
  const dropdownValues = useDropdownValues(["pic"]);
  const [services, setServices] = useState<BChargeDto[]>([]);
  const [products, setProducts] = useState<ProductListDto[]>([]);
  //   const { contacts: physicians } = useContactMastByCategory({ consValue: "PHY" });
  //   const { contacts: referals } = useContactMastByCategory({ consValue: "REF" });
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState<BChargeDto | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | ProductListDto | null>(null);
  const [itemMode, setItemMode] = useState<"service" | "product">("service");
  const { calculateServiceDiscountAmount, calculateServiceNetAmount, calculateDiscountFromPercent, calculateServicesTotal } = useBilling();
  const {
    deptId: selectedDeptId,
    deptName: selectedDeptName,
    isDialogOpen: isDepartmentDialogOpen,
    isDepartmentSelected,
    openDialog: openDepartmentDialog,
    closeDialog: closeDepartmentDialog,
    handleDepartmentSelect: handleDeptSelect,
  } = useDepartmentSelection();
  const {
    isDialogOpen: isBatchSelectionDialogOpen,
    availableBatches,
    selectedBatch,
    openDialog: openBatchDialog,
    closeDialog: closeBatchDialog,
    handleBatchSelect: handleBatchSelectInternal,
  } = useBatchSelection();
  const physicians = [
    { value: 1, label: "Dr. Ajeesh" },
    { value: 2, label: "Dr. Akash" },
  ];
  const referals = [
    { value: 1, label: "Dr. Ajeesh" },
    { value: 2, label: "Dr. Akash" },
  ];

  const defaultValues: BillingFormData = {
    pChartID: 0,
    pChartCode: "",
    pFName: "",
    pLName: "",
    pMName: "",
    pTitle: "",
    billID: 0,
    billCode: "",
    billDate: new Date(),
    pTypeID: 0,
    pTypeName: "",
    pTypeCode: "",
    patOPIP: "O",
    billStatus: "A",
    physicianID: undefined,
    physicianName: undefined,
    referralID: undefined,
    referralName: undefined,
    referral2ID: undefined,
    referralName2: undefined,
    billMisc: "",
    admitID: 0,
    opipCaseNo: 0,
    opIPNo: 0,
    disapprovedEmpID: undefined,
    disapproveEmpName: undefined,
    groupDisc: 0,
    langType: undefined,
    patMemID: undefined,
    patMemName: undefined,
    pckAmount: undefined,
    pckCode: undefined,
    pckID: undefined,
    pckName: undefined,
    strProfitOrLoss: undefined,
    profitOrLoss: undefined,
    sourceID: 0,
    source: undefined,
    oldPChartID: 0,
    drBillID: 0,
    transferYN: "N",
    billGrossAmt: 0,
    billDiscAmt: 0,
    visitReferenceCode: "",
    billServices: [],
    billProducts: [],
    rActiveYN: "Y",
    rNotes: "",
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
    formState: { errors, isDirty, isValid },
  } = useForm<BillingFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const {
    fields: serviceFields,
    append: appendService,
    remove: removeService,
    update: updateService,
  } = useFieldArray({
    control,
    name: "billServices",
  });

  const {
    fields: productFields,
    append: appendProduct,
    remove: removeProduct,
    update: updateProduct,
  } = useFieldArray({
    control,
    name: "billProducts",
  });
  console.log(productFields, appendProduct, removeProduct);
  const watchedBillServices = watch("billServices");
  const watchedBillProducts = watch("billProducts");
  const watchedVisitReference = watch("visitReferenceCode");
  const watchedGroupDisc = watch("groupDisc");

  // Convert services to DataGrid rows
  const serviceRows: BillServiceRow[] = useMemo(() => {
    return watchedBillServices.map((service, index) => ({
      ...service,
      id: service.billDetID || `temp-service-${index}`,
    }));
  }, [watchedBillServices]);

  // Convert products to DataGrid rows
  const productRows: BillProductRow[] = useMemo(() => {
    return watchedBillProducts.map((product, index) => ({
      ...product,
      id: product.billDetID || `temp-product-${index}`,
    }));
  }, [watchedBillProducts]);

  // Calculate total amounts whenever services or products change
  useEffect(() => {
    let totalGrossAmount = 0;
    let totalDiscountAmount = 0;

    // Calculate services totals
    watchedBillServices.forEach((service) => {
      const quantity = service.chUnits || 1;
      const drAmt = service.dCValue || 0;
      const hospAmt = service.hCValue || 0;
      const drDiscAmt = service.dValDisc || 0;
      const hospDiscAmt = service.hValDisc || 0;

      const grossAmount = quantity * (drAmt + hospAmt);
      const discountAmount = drDiscAmt + hospDiscAmt;

      totalGrossAmount += grossAmount;
      totalDiscountAmount += discountAmount;
    });

    // Calculate products totals (similar logic)
    watchedBillProducts.forEach((product) => {
      const quantity = product.chUnits || 1;
      const drAmt = product.dCValue || 0;
      const hospAmt = product.hCValue || 0;
      const drDiscAmt = product.dValDisc || 0;
      const hospDiscAmt = product.hValDisc || 0;

      const grossAmount = quantity * (drAmt + hospAmt);
      const discountAmount = drDiscAmt + hospDiscAmt;

      totalGrossAmount += grossAmount;
      totalDiscountAmount += discountAmount;
    });

    setValue("billGrossAmt", totalGrossAmount);
    setValue("billDiscAmt", totalDiscountAmount);
  }, [watchedBillServices, watchedBillProducts, setValue]);

  useEffect(() => {
    const fetchServices = async () => {
      setLoadingServices(true);
      try {
        const response = await bChargeService.getAll();
        setServices(response.data as unknown as BChargeDto[]);
      } catch (error) {
        showAlert("Error", "Failed to load services", "error");
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, [showAlert]);

  // Mock fetch products - replace with your actual API call
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        // TODO: Replace with your actual product API call
        const response = await productListService.getAll();
        setProducts(response.data as unknown as ProductListDto[]);
      } catch (error) {
        showAlert("Error", "Failed to load products", "error");
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [showAlert]);

  // Filter services based on search term
  const filteredServices = useMemo(() => {
    if (!serviceSearchTerm || !services) return [];

    const searchLower = serviceSearchTerm.toLowerCase();
    return services.filter(
      (service) =>
        service.chargeCode.toLowerCase().includes(searchLower) ||
        service.chargeDesc.toLowerCase().includes(searchLower) ||
        (service.cShortName && service.cShortName.toLowerCase().includes(searchLower))
    );
  }, [serviceSearchTerm, services]);

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!productSearchTerm || !products) return [];

    const searchLower = productSearchTerm.toLowerCase();
    return products.filter((product) => product.productCode.toLowerCase().includes(searchLower) || product.productName.toLowerCase().includes(searchLower));
  }, [productSearchTerm, products]);

  const handlePatientSelect = useCallback(
    (patientResult: PatientSearchResult) => {
      if (patientResult && patientResult.pChartID) {
        setSelectedPatient(patientResult);
        setSelectedPChartID(patientResult.pChartID);

        setValue("pChartID", patientResult.pChartID, { shouldValidate: true });
        setValue("pChartCode", patientResult.pChartCode || "", { shouldValidate: true });
        setValue("pFName", patientResult.fullName?.split(" ")[0] || "", { shouldValidate: true });
        setValue("pLName", patientResult.fullName?.split(" ")[1] || "", { shouldValidate: true });

        // Clear visit reference when selecting a new patient
        setValue("visitReferenceCode", "", { shouldValidate: true });
        setValue("billMisc", "", { shouldValidate: true });

        setIsHistoryDialogOpen(true);
        setIsChangingVisit(false);
      }
    },
    [setValue]
  );

  const handleCloseHistoryDialog = useCallback(() => {
    setIsHistoryDialogOpen(false);
    setIsChangingVisit(false);
  }, []);

  // Handle service selection from autocomplete
  const handleServiceSelect = useCallback(
    async (service: BChargeDto | null) => {
      if (service) {
        const response = await billingService.getBillingServiceById(service.chargeID);
        appendService(response.data);
        setSelectedService(null);
        setServiceSearchTerm("");
        showAlert("Success", `Service "${service.chargeDesc}" added`, "success");
      }
    },
    [appendService, showAlert]
  );

  // Handle product selection from autocomplete
  const handleProductSelect = useCallback(
    async (product: ProductDto | ProductListDto | null) => {
      if (product && isDepartmentSelected && selectedDeptId) {
        try {
          const response = await billingService.getBatchNoProduct(product.productID, selectedDeptId);

          if (response.success && response.data) {
            if (Array.isArray(response.data)) {
              if (response.data.length === 0) {
                showAlert("Warning", "No batches available for this product", "warning");
              } else if (response.data.length === 1) {
                appendProduct(response.data[0]);
                showAlert("Success", `Product "${product.productName}" added`, "success");
              } else {
                openBatchDialog(response.data);
              }
            } else {
              appendProduct(response.data);
              showAlert("Success", `Product "${product.productName}" added`, "success");
            }
          } else {
            showAlert("Error", response.errorMessage || "Product not added", "warning");
          }

          setSelectedProduct(null);
          setProductSearchTerm("");
        } catch (error) {
          showAlert("Error", "Failed to fetch product batches", "error");
        }
      } else if (!isDepartmentSelected) {
        showAlert("Warning", "Please select a department first", "warning");
        openDepartmentDialog();
      }
    },
    [appendProduct, showAlert, isDepartmentSelected, selectedDeptId, openDepartmentDialog, openBatchDialog]
  );

  const handleBatchSelect = useCallback(
    (batch: ProductBatchDto) => {
      const selectedProduct: BillProductsDto = {
        billDetID: 0,
        billID: 0,
        productID: batch.productID,
        batchNo: batch.batchNo,
        expiryDate: batch.expiryDate,
        grnDetID: batch.grnDetID,
        deptID: batch.deptID,
        deptName: batch.deptName,
        cHValue: 0,
        chUnits: batch.productQOH,
        chDisc: 0,
        actualDDValue: 0,
        actualHCValue: 0,
        dCValue: 0,
        drPercShare: 0,
        dValDisc: 0,
        hCValue: batch.sellingPrice,
        hospPercShare: 0,
        hValDisc: 0,
        packID: 0,
        packName: "",
        opipNo: 0,
        physicianYN: "N",
        actualAmt: 0,
        rActiveYN: "Y",
        transferYN: "N",
        rNotes: "",
      };
      appendProduct(selectedProduct);
      showAlert("Success", `Batch "${batch.batchNo}" added`, "success");
      closeBatchDialog();
    },
    [appendProduct, showAlert, closeBatchDialog]
  );

  // Handle field changes with automatic calculations
  const handleServiceFieldChange = useCallback(
    (index: number, field: string, value: any) => {
      const currentService = watchedBillServices[index];
      const updatedService = { ...currentService };

      // Update the changed field
      updatedService[field] = value;

      // Recalculate based on what changed
      const quantity = updatedService.chUnits || 1;
      const drAmt = updatedService.dCValue || 0;
      const hospAmt = updatedService.hCValue || 0;
      const drDiscPerc = updatedService.drPercShare || 0;
      const hospDiscPerc = updatedService.hospPercShare || 0;

      // Calculate discount amounts based on percentages
      if (field === "drPercShare" || field === "dCValue" || field === "chUnits") {
        updatedService.dValDisc = calculateDiscountFromPercent(drAmt * quantity, drDiscPerc);
      }

      if (field === "hospPercShare" || field === "hCValue" || field === "chUnits") {
        updatedService.hValDisc = calculateDiscountFromPercent(hospAmt * quantity, hospDiscPerc);
      }

      // Calculate gross amount
      updatedService.cHValue = drAmt + hospAmt;

      updateService(index, updatedService);
    },
    [watchedBillServices, updateService, calculateDiscountFromPercent]
  );

  // Handle product field changes with automatic calculations
  const handleProductFieldChange = useCallback(
    (index: number, field: string, value: any) => {
      const currentProduct = watchedBillProducts[index];
      const updatedProduct = { ...currentProduct };

      // Update the changed field
      updatedProduct[field] = value;

      // Recalculate based on what changed
      const quantity = updatedProduct.chUnits || 1;
      const drAmt = updatedProduct.dCValue || 0;
      const hospAmt = updatedProduct.hCValue || 0;
      const drDiscPerc = updatedProduct.drPercShare || 0;
      const hospDiscPerc = updatedProduct.hospPercShare || 0;

      // Calculate discount amounts based on percentages
      if (field === "drPercShare" || field === "dCValue" || field === "chUnits") {
        updatedProduct.dValDisc = calculateDiscountFromPercent(drAmt * quantity, drDiscPerc);
      }

      if (field === "hospPercShare" || field === "hCValue" || field === "chUnits") {
        updatedProduct.hValDisc = calculateDiscountFromPercent(hospAmt * quantity, hospDiscPerc);
      }

      // Calculate gross amount
      updatedProduct.cHValue = drAmt + hospAmt;

      updateProduct(index, updatedProduct);
    },
    [watchedBillProducts, updateProduct, calculateDiscountFromPercent]
  );

  // Handle cell value change for Service DataGrid
  const handleServiceCellValueChange = useCallback(
    (id: string | number, field: keyof z.infer<typeof BillServicesDtoSchema>, value: any) => {
      const index = watchedBillServices.findIndex((service, idx) => (service.billDetID || `temp-service-${idx}`) === id);
      if (index !== -1) {
        handleServiceFieldChange(index, field, value);
      }
    },
    [watchedBillServices, handleServiceFieldChange]
  );

  // Handle cell value change for Product DataGrid
  const handleProductCellValueChange = useCallback(
    (id: string | number, field: keyof z.infer<typeof BillProductsDtoSchema>, value: any) => {
      const index = watchedBillProducts.findIndex((product, idx) => (product.billDetID || `temp-product-${idx}`) === id);
      if (index !== -1) {
        handleProductFieldChange(index, field, value);
      }
    },
    [watchedBillProducts, handleProductFieldChange]
  );

  // Render functions for Service DataGrid cells
  const renderServiceNumberField = useCallback(
    (params: GridRenderCellParams, field: keyof z.infer<typeof BillServicesDtoSchema>) => (
      <TextField
        size="small"
        type="number"
        value={params.row[field] || ""}
        onChange={(e) => {
          const value = parseFloat(e.target.value) || 0;
          handleServiceCellValueChange(params.id, field, value);
        }}
        sx={{ width: "100%" }}
        inputProps={{ style: { textAlign: "right" } }}
        fullWidth
      />
    ),
    [handleServiceCellValueChange]
  );

  // Render functions for Product DataGrid cells
  const renderProductNumberField = useCallback(
    (params: GridRenderCellParams, field: keyof z.infer<typeof BillProductsDtoSchema>) => (
      <TextField
        size="small"
        type="number"
        value={params.row[field] || ""}
        onChange={(e) => {
          const value = parseFloat(e.target.value) || 0;
          handleProductCellValueChange(params.id, field, value);
        }}
        sx={{ width: "100%" }}
        inputProps={{ style: { textAlign: "right" } }}
        fullWidth
      />
    ),
    [handleProductCellValueChange]
  );

  const renderServiceDateField = useCallback(
    (params: GridRenderCellParams) => {
      const index = serviceRows.findIndex((row) => row.id === params.id);
      return <FormField name={`billServices.${index}.chargeDt`} control={control} type="datepicker" size="small" fullWidth />;
    },
    [control, serviceRows]
  );

  const renderPhysicianField = useCallback(
    (params: GridRenderCellParams) => {
      const index = serviceRows.findIndex((row) => row.id === params.id);
      return params.row.physicianYN === "Y" ? (
        <FormField
          name={`billServices.${index}.physicianID`}
          control={control}
          type="select"
          size="small"
          fullWidth
          options={physicians || []}
          defaultText="Select"
          onChange={(data: any) => {
            if (data && typeof data === "object" && "value" in data) {
              setValue(`billServices.${index}.PhysicianName`, data.label || "", { shouldDirty: true });
            }
          }}
        />
      ) : (
        <Typography variant="body2" color="text.secondary">
          N/A
        </Typography>
      );
    },
    [control, physicians, setValue, serviceRows]
  );

  // Define columns for Service DataGrid
  const serviceColumns: GridColDef[] = useMemo(
    () => [
      {
        field: "chargeDesc",
        headerName: "Service Name",
        width: 200,
        sortable: false,
      },
      {
        field: "physicianID",
        headerName: "Physician",
        width: 150,
        sortable: false,
        renderCell: renderPhysicianField,
      },
      {
        field: "chargeDt",
        headerName: "Effective Date",
        width: 130,
        sortable: false,
        renderCell: renderServiceDateField,
      },
      {
        field: "chUnits",
        headerName: "Quantity",
        width: 80,
        sortable: false,
        type: "number",
        renderCell: (params) => renderServiceNumberField(params, "chUnits"),
      },
      {
        field: "dCValue",
        headerName: "Dr Amt (₹)",
        width: 90,
        sortable: false,
        type: "number",
        renderCell: (params) => renderServiceNumberField(params, "dCValue"),
      },
      {
        field: "drPercShare",
        headerName: "Dr Disc %",
        width: 90,
        sortable: false,
        type: "number",
        renderCell: (params) => renderServiceNumberField(params, "drPercShare"),
      },
      {
        field: "dValDisc",
        headerName: "Dr Disc ₹",
        width: 90,
        sortable: false,
        type: "number",
        align: "right",
        headerAlign: "right",
        renderCell: (params) => (
          <TextField value={params.row.dValDisc?.toFixed(2) || "0.00"} size="small" fullWidth disabled InputProps={{ readOnly: true, style: { textAlign: "right" } }} />
        ),
      },
      {
        field: "hCValue",
        headerName: "Hosp Amt (₹)",
        width: 100,
        sortable: false,
        type: "number",
        renderCell: (params) => renderServiceNumberField(params, "hCValue"),
      },
      {
        field: "hospPercShare",
        headerName: "Hosp Disc %",
        width: 100,
        sortable: false,
        type: "number",
        renderCell: (params) => renderServiceNumberField(params, "hospPercShare"),
      },
      {
        field: "hValDisc",
        headerName: "Hosp Disc ₹",
        width: 100,
        sortable: false,
        type: "number",
        align: "right",
        headerAlign: "right",
        renderCell: (params) => (
          <TextField value={params.row.hValDisc?.toFixed(2) || "0.00"} size="small" fullWidth disabled InputProps={{ readOnly: true, style: { textAlign: "right" } }} />
        ),
      },
      {
        field: "grossAmt",
        headerName: "Gross Amt",
        width: 100,
        sortable: false,
        type: "number",
        align: "right",
        headerAlign: "right",
        renderCell: (params) => {
          const quantity = params.row.chUnits || 1;
          const drAmt = params.row.dCValue || 0;
          const hospAmt = params.row.hCValue || 0;
          const grossAmt = quantity * (drAmt + hospAmt);
          return (
            <Typography variant="body2" fontWeight="medium">
              ₹{grossAmt.toFixed(2)}
            </Typography>
          );
        },
      },
      {
        field: "discAmt",
        headerName: "Disc Amt",
        width: 90,
        sortable: false,
        type: "number",
        align: "right",
        headerAlign: "right",
        renderCell: (params) => {
          const totalDiscAmt = (params.row.dValDisc || 0) + (params.row.hValDisc || 0);
          return (
            <Typography variant="body2" color="error">
              ₹{totalDiscAmt.toFixed(2)}
            </Typography>
          );
        },
      },
      {
        field: "netAmt",
        headerName: "Net Amt",
        width: 90,
        sortable: false,
        type: "number",
        align: "right",
        headerAlign: "right",
        renderCell: (params) => {
          const quantity = params.row.chUnits || 1;
          const drAmt = params.row.dCValue || 0;
          const hospAmt = params.row.hCValue || 0;
          const grossAmt = quantity * (drAmt + hospAmt);
          const totalDiscAmt = (params.row.dValDisc || 0) + (params.row.hValDisc || 0);
          const netAmt = grossAmt - totalDiscAmt;
          return (
            <Typography variant="body2" fontWeight="bold" color="primary">
              ₹{netAmt.toFixed(2)}
            </Typography>
          );
        },
      },
      {
        field: "sGRPName",
        headerName: "Service Group",
        width: 120,
        sortable: false,
        renderCell: (params) => (
          <Typography variant="body2" noWrap>
            {params.row.sGRPName || "-"}
          </Typography>
        ),
      },
      {
        field: "packName",
        headerName: "Pack Name",
        width: 120,
        sortable: false,
        renderCell: (params) => (
          <Typography variant="body2" noWrap>
            {params.row.packName || "-"}
          </Typography>
        ),
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Delete",
        width: 60,
        getActions: (params) => {
          const index = serviceRows.findIndex((row) => row.id === params.id);
          return [
            <GridActionsCellItem
              icon={
                <Tooltip title="Remove Service">
                  <DeleteIcon color="error" />
                </Tooltip>
              }
              label="Remove"
              onClick={() => removeService(index)}
              showInMenu={false}
            />,
          ];
        },
      },
    ],
    [renderServiceNumberField, renderServiceDateField, renderPhysicianField, removeService, serviceRows]
  );

  // Define columns for Product DataGrid
  const productColumns: GridColDef[] = useMemo(
    () => [
      {
        field: "productName",
        headerName: "Product Name",
        width: 200,
        sortable: false,
      },
      {
        field: "batchNo",
        headerName: "Batch No",
        width: 120,
        sortable: false,
      },
      {
        field: "expiryDate",
        headerName: "Expiry Date",
        width: 130,
        sortable: false,
        renderCell: (params) => {
          const date = params.row.expiryDate;
          if (!date) return "-";
          const formattedDate = new Date(date).toLocaleDateString();
          return formattedDate;
        },
      },
      {
        field: "chUnits",
        headerName: "Quantity",
        width: 80,
        sortable: false,
        type: "number",
        renderCell: (params) => renderProductNumberField(params, "chUnits"),
      },
      {
        field: "dCValue",
        headerName: "Dr Amt (₹)",
        width: 90,
        sortable: false,
        type: "number",
        renderCell: (params) => renderProductNumberField(params, "dCValue"),
      },
      {
        field: "drPercShare",
        headerName: "Dr Disc %",
        width: 90,
        sortable: false,
        type: "number",
        renderCell: (params) => renderProductNumberField(params, "drPercShare"),
      },
      {
        field: "dValDisc",
        headerName: "Dr Disc ₹",
        width: 90,
        sortable: false,
        type: "number",
        align: "right",
        headerAlign: "right",
        renderCell: (params) => (
          <TextField value={params.row.dValDisc?.toFixed(2) || "0.00"} size="small" fullWidth disabled InputProps={{ readOnly: true, style: { textAlign: "right" } }} />
        ),
      },
      {
        field: "hCValue",
        headerName: "Hosp Amt (₹)",
        width: 100,
        sortable: false,
        type: "number",
        renderCell: (params) => renderProductNumberField(params, "hCValue"),
      },
      {
        field: "hospPercShare",
        headerName: "Hosp Disc %",
        width: 100,
        sortable: false,
        type: "number",
        renderCell: (params) => renderProductNumberField(params, "hospPercShare"),
      },
      {
        field: "hValDisc",
        headerName: "Hosp Disc ₹",
        width: 100,
        sortable: false,
        type: "number",
        align: "right",
        headerAlign: "right",
        renderCell: (params) => (
          <TextField value={params.row.hValDisc?.toFixed(2) || "0.00"} size="small" fullWidth disabled InputProps={{ readOnly: true, style: { textAlign: "right" } }} />
        ),
      },
      {
        field: "grossAmt",
        headerName: "Gross Amt",
        width: 100,
        sortable: false,
        type: "number",
        align: "right",
        headerAlign: "right",
        renderCell: (params) => {
          const quantity = params.row.chUnits || 1;
          const drAmt = params.row.dCValue || 0;
          const hospAmt = params.row.hCValue || 0;
          const grossAmt = quantity * (drAmt + hospAmt);
          return (
            <Typography variant="body2" fontWeight="medium">
              ₹{grossAmt.toFixed(2)}
            </Typography>
          );
        },
      },
      {
        field: "discAmt",
        headerName: "Disc Amt",
        width: 90,
        sortable: false,
        type: "number",
        align: "right",
        headerAlign: "right",
        renderCell: (params) => {
          const totalDiscAmt = (params.row.dValDisc || 0) + (params.row.hValDisc || 0);
          return (
            <Typography variant="body2" color="error">
              ₹{totalDiscAmt.toFixed(2)}
            </Typography>
          );
        },
      },
      {
        field: "netAmt",
        headerName: "Net Amt",
        width: 90,
        sortable: false,
        type: "number",
        align: "right",
        headerAlign: "right",
        renderCell: (params) => {
          const quantity = params.row.chUnits || 1;
          const drAmt = params.row.dCValue || 0;
          const hospAmt = params.row.hCValue || 0;
          const grossAmt = quantity * (drAmt + hospAmt);
          const totalDiscAmt = (params.row.dValDisc || 0) + (params.row.hValDisc || 0);
          const netAmt = grossAmt - totalDiscAmt;
          return (
            <Typography variant="body2" fontWeight="bold" color="primary">
              ₹{netAmt.toFixed(2)}
            </Typography>
          );
        },
      },
      {
        field: "deptName",
        headerName: "Department",
        width: 150,
        sortable: false,
        renderCell: (params) => (
          <Typography variant="body2" noWrap>
            {params.row.deptName || "-"}
          </Typography>
        ),
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Delete",
        width: 60,
        getActions: (params) => {
          const index = productRows.findIndex((row) => row.id === params.id);
          return [
            <GridActionsCellItem
              icon={
                <Tooltip title="Remove Product">
                  <DeleteIcon color="error" />
                </Tooltip>
              }
              label="Remove"
              onClick={() => removeProduct(index)}
              showInMenu={false}
            />,
          ];
        },
      },
    ],
    [renderProductNumberField, removeProduct, productRows]
  );

  const onSubmit = async (data: BillingFormData) => {
    try {
      setLoading(true);

      // Prepare bill save request
      const billSaveRequest = {
        bill: {
          billID: data.billID,
          billCode: data.billCode,
          billDate: data.billDate,
          pChartID: data.pChartID,
          pTypeID: data.pTypeID,
          pTypeCode: data.pTypeCode,
          pTitle: data.pTitle,
          patOPIP: data.patOPIP,
          pTypeName: data.pTypeName,
          billGrossAmt: data.billGrossAmt,
          billDiscAmt: data.billDiscAmt,
          billStatus: data.billStatus,
          physicianID: data.physicianID,
          physicianName: data.physicianName,
          referralID: data.referralID,
          referralName: data.referralName,
          referral2ID: data.referral2ID,
          referralName2: data.referralName2,
          billMisc: data.billMisc,
          admitID: data.admitID,
          opipCaseNo: data.opipCaseNo,
          opIPNo: data.opIPNo,
          groupDisc: data.groupDisc,
          pckAmount: data.pckAmount,
          pckCode: data.pckCode,
          pckID: data.pckID,
          pckName: data.pckName,
          sourceID: data.sourceID,
          source: data.source,
          pFName: data.pFName,
          pLName: data.pLName,
          pMName: data.pMName,
          oldPChartID: data.oldPChartID,
          drBillID: data.drBillID,
          rActiveYN: data.rActiveYN,
          transferYN: data.transferYN,
          rNotes: data.rNotes,
        },
        billServices: data.billServices,
        billProducts: data.billProducts,
      };

      // TODO: Call your billing service here
      console.log("Bill Save Request:", billSaveRequest);
      const saveBillResponse = await billingGenericService.save(billSaveRequest as BillSaveRequest);
      if (saveBillResponse.success) {
        showAlert("Success", "Bill saved successfully", "success");
      } else {
        showAlert("Warning", "Bill not saved", "warning");
      }
      performReset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save bill";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const performReset = () => {
    reset(defaultValues);
    setFormError(null);
    setSelectedPChartID(0);
    setSelectedPatient(null);
    setClearSearchTrigger((prev) => prev + 1);
    setServiceSearchTerm("");
    setProductSearchTerm("");
    setSelectedService(null);
    setSelectedProduct(null);
    setItemMode("service");
  };

  // Add this function in BillingPage
  const handleVisitSelect = useCallback(
    (visit: GetPatientAllVisitHistory) => {
      setValue("patOPIP", visit.patOPIP as "O" | "I", { shouldValidate: true });
      setValue("opIPNo", visit.opipNo, { shouldValidate: true });
      setValue("opipCaseNo", visit.opipCaseNo, { shouldValidate: true });
      setValue("visitReferenceCode", visit.opNumber || "", { shouldValidate: true });
      setValue("billMisc", `Visit Ref: ${visit.opNumber}`, { shouldValidate: true });
      trigger();
      showAlert("Success", `Visit ${visit.opNumber} selected`, "success");
      console.log("visit", visit);
    },
    [setValue, trigger, showAlert]
  );

  // New function to handle changing visit
  const handleChangeVisit = useCallback(() => {
    if (selectedPChartID > 0) {
      setIsChangingVisit(true);
      setIsHistoryDialogOpen(true);
    }
  }, [selectedPChartID]);

  // Calculate final bill amount
  const calculateFinalBillAmount = useMemo(() => {
    const grossAmount = watch("billGrossAmt");
    const discountAmount = watch("billDiscAmt");
    const groupDiscountPerc = watchedGroupDisc || 0;

    // Apply group discount on the net amount after individual discounts
    const netAfterDiscount = grossAmount - discountAmount;
    const groupDiscountAmount = calculateDiscountFromPercent(netAfterDiscount, groupDiscountPerc);

    return netAfterDiscount - groupDiscountAmount;
  }, [watch("billGrossAmt"), watch("billDiscAmt"), watchedGroupDisc, calculateDiscountFromPercent]);

  return (
    <Box sx={{ p: 2 }}>
      {/* Main Form */}
      <Paper sx={{ p: 2 }}>
        <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>
              {formError}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Patient Information Section */}
            <Grid size={{ sm: 8 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Patient Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <PatientSearch
                        onPatientSelect={handlePatientSelect}
                        clearTrigger={clearSearchTrigger}
                        placeholder="Enter name, UHID or phone number"
                        disabled={selectedPChartID > 0}
                      />
                    </Grid>
                  </Grid>

                  {selectedPChartID > 0 && (
                    <Box mt={2}>
                      <PatientDemographics pChartID={selectedPChartID} />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Visit Reference Section - New */}
            <Grid size={{ sm: 4 }}>
              {watchedVisitReference && (
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box display="flex" alignItems="center" gap={2}>
                        <HistoryIcon color="primary" />
                        <Typography variant="h6">Selected Visit</Typography>
                      </Box>
                      <Tooltip title="Change Visit">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={handleChangeVisit}
                          sx={{
                            bgcolor: "rgba(25, 118, 210, 0.08)",
                            "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="body2" color="text.secondary">
                        Reference Code:
                      </Typography>
                      <Chip label={watchedVisitReference} color="primary" variant="outlined" size="medium" />
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Grid>

            {/* Bill Details Section */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Bill Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField
                        name="pTypeID"
                        control={control}
                        label="Payment Source [PIC]"
                        type="select"
                        required
                        size="small"
                        fullWidth
                        options={dropdownValues.pic || []}
                        defaultText="Select Payment Source"
                        onChange={(data: any) => {
                          // Handle the enhanced onChange that returns {label, value, originalEvent}
                          if (data && typeof data === "object" && "value" in data) {
                            setValue("pTypeName", data.label || "", { shouldDirty: true });
                            setValue("pTypeCode", data.value?.toString() || "", { shouldDirty: true });
                          }
                        }}
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField
                        name="referralID"
                        control={control}
                        label="Primary Introducing Source"
                        type="select"
                        size="small"
                        fullWidth
                        options={referals || []}
                        defaultText="Select Primary Introducing Source"
                        onChange={(data: any) => {
                          if (data && typeof data === "object" && "value" in data) {
                            setValue("referralName", data.label || "", { shouldDirty: true });
                          }
                        }}
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField
                        name="referral2ID"
                        control={control}
                        label="Secondary Introducing Source"
                        type="select"
                        size="small"
                        fullWidth
                        options={referals || []}
                        defaultText="Select Secondary Introducing Source"
                        onChange={(data: any) => {
                          if (data && typeof data === "object" && "value" in data) {
                            setValue("referralName2", data.label || "", { shouldDirty: true });
                          }
                        }}
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField
                        name="physicianID"
                        control={control}
                        label="Attending Physician"
                        type="select"
                        size="small"
                        fullWidth
                        options={physicians || []}
                        defaultText="Select Attending Physician"
                        onChange={(data: any) => {
                          if (data && typeof data === "object" && "value" in data) {
                            setValue("physicianName", data.label || "", { shouldDirty: true });
                          }
                        }}
                      />
                    </Grid>

                    <Grid size={{ sm: 12 }}>
                      <FormField name="rNotes" control={control} label="Notes" type="textarea" size="small" fullWidth rows={2} placeholder="Enter bill remarks" />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Services/Products Section with DataGrid */}
            <Grid size={{ sm: 12 }}>
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
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <ToggleButtonGroup
                      value={itemMode}
                      exclusive
                      onChange={(event, newMode) => {
                        if (newMode !== null) {
                          if (newMode === "product" && !isDepartmentSelected) {
                            openDepartmentDialog();
                          }
                          setItemMode(newMode);
                        }
                      }}
                      size="small"
                      sx={{
                        "& .MuiToggleButton-root": {
                          px: 2,
                          py: 0.5,
                        },
                      }}
                    >
                      <ToggleButton value="service">
                        <MedicalServicesIcon sx={{ mr: 1, fontSize: 18 }} />
                        Services
                      </ToggleButton>
                      <ToggleButton value="product">
                        <ShoppingCartIcon sx={{ mr: 1, fontSize: 18 }} />
                        Products
                      </ToggleButton>
                    </ToggleButtonGroup>

                    {itemMode === "product" && isDepartmentSelected && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" color="text.secondary">
                          Department:
                        </Typography>
                        <Chip label={selectedDeptName} size="small" color="primary" variant="outlined" onDelete={openDepartmentDialog} deleteIcon={<EditIcon fontSize="small" />} />
                      </Box>
                    )}

                    <Typography variant="body2" color="text.secondary">
                      Add and manage billing {itemMode === "service" ? "services" : "products"}
                    </Typography>
                  </Box>
                  <Box display="flex" gap={2} alignItems="center">
                    {itemMode === "service" && serviceRows.length > 0 && (
                      <Chip
                        label={`${serviceRows.length} ${serviceRows.length === 1 ? "Service" : "Services"}`}
                        variant="outlined"
                        color="primary"
                        size="small"
                        sx={{ fontWeight: "600", borderWidth: 2 }}
                      />
                    )}
                    {itemMode === "product" && productRows.length > 0 && (
                      <Chip
                        label={`${productRows.length} ${productRows.length === 1 ? "Product" : "Products"}`}
                        variant="outlined"
                        color="primary"
                        size="small"
                        sx={{ fontWeight: "600", borderWidth: 2 }}
                      />
                    )}
                    {/* Service Search Autocomplete */}
                    {itemMode === "service" && (
                      <Autocomplete
                        value={selectedService}
                        onChange={(event, newValue) => {
                          if (newValue) {
                            handleServiceSelect(newValue);
                          }
                        }}
                        inputValue={serviceSearchTerm}
                        onInputChange={(event, newInputValue) => {
                          setServiceSearchTerm(newInputValue);
                        }}
                        options={filteredServices}
                        getOptionLabel={(option) => `${option.chargeCode} - ${option.chargeDesc}`}
                        loading={loadingServices}
                        sx={{ width: 400 }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Search and add service"
                            size="small"
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {loadingServices ? <CircularProgress color="inherit" size={20} /> : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        renderOption={(props, option) => (
                          <Box component="li" {...props}>
                            <Box>
                              <Typography variant="body1">
                                {option.chargeCode} - {option.chargeDesc}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.cShortName && `Short: ${option.cShortName} | `}
                                Type: {option.chargeType} | Status: {option.chargeStatus}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                        noOptionsText="No services found"
                      />
                    )}
                    {/* Product Search Autocomplete */}
                    {itemMode === "product" && (
                      <Autocomplete
                        value={selectedProduct}
                        onChange={(event, newValue) => {
                          if (newValue) {
                            handleProductSelect(newValue);
                          }
                        }}
                        inputValue={productSearchTerm}
                        onInputChange={(event, newInputValue) => {
                          setProductSearchTerm(newInputValue);
                        }}
                        options={filteredProducts}
                        getOptionLabel={(option) => `${option.productCode} - ${option.productName}`}
                        loading={loadingProducts}
                        sx={{ width: 400 }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Search and add product"
                            size="small"
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {loadingProducts ? <CircularProgress color="inherit" size={20} /> : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        renderOption={(props, option) => (
                          <Box component="li" {...props}>
                            <Box>
                              <Typography variant="body1">
                                {option.productCode} - {option.productName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Price: ₹{option.unitPrice} |{option.availableQuantity && ` Available: ${option.availableQuantity}`}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                        noOptionsText="No products found"
                      />
                    )}
                  </Box>
                </Box>

                <CardContent sx={{ p: 0 }}>
                  {itemMode === "service" ? (
                    serviceRows.length > 0 ? (
                      <Box sx={{ height: 400, width: "100%" }}>
                        <DataGrid
                          rows={serviceRows}
                          columns={serviceColumns}
                          density="compact"
                          disableRowSelectionOnClick
                          hideFooterSelectedRowCount
                          pageSizeOptions={[5, 10, 25, 50]}
                          initialState={{
                            pagination: {
                              paginationModel: { pageSize: 10 },
                            },
                          }}
                          sx={{
                            border: "none",
                            "& .MuiDataGrid-cell:focus": {
                              outline: "none",
                            },
                            "& .MuiDataGrid-row:hover": {
                              backgroundColor: alpha(theme.palette.primary.main, 0.04),
                            },
                            "& .MuiDataGrid-columnHeaders": {
                              backgroundColor: alpha(theme.palette.primary.main, 0.06),
                              borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
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
                      <Box sx={{ p: 6, textAlign: "center" }}>
                        <Typography color="text.secondary">No services added. Use the search box above to add services.</Typography>
                      </Box>
                    )
                  ) : productRows.length > 0 ? (
                    <Box sx={{ height: 400, width: "100%" }}>
                      <DataGrid
                        rows={productRows}
                        columns={productColumns}
                        density="compact"
                        disableRowSelectionOnClick
                        hideFooterSelectedRowCount
                        pageSizeOptions={[5, 10, 25, 50]}
                        initialState={{
                          pagination: {
                            paginationModel: { pageSize: 10 },
                          },
                        }}
                        sx={{
                          border: "none",
                          "& .MuiDataGrid-cell:focus": {
                            outline: "none",
                          },
                          "& .MuiDataGrid-row:hover": {
                            backgroundColor: alpha(theme.palette.primary.main, 0.04),
                          },
                          "& .MuiDataGrid-columnHeaders": {
                            backgroundColor: alpha(theme.palette.primary.main, 0.06),
                            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
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
                    <Box sx={{ p: 6, textAlign: "center" }}>
                      <Typography color="text.secondary">No products added. Use the search box above to add products.</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Bill Summary */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Bill Summary
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <Stack spacing={1}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography>Gross Amount:</Typography>
                          <Typography fontWeight="bold">₹{watch("billGrossAmt").toFixed(2)}</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography>Item Discounts:</Typography>
                          <Typography color="error">-₹{watch("billDiscAmt").toFixed(2)}</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography>Group Discount %:</Typography>
                          <Box sx={{ width: 120 }}>
                            <FormField name="groupDisc" control={control} type="number" size="small" min={0} max={100} step={0.01} fullWidth />
                          </Box>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography>Group Discount Amount:</Typography>
                          <Typography color="error">-₹{calculateDiscountFromPercent(watch("billGrossAmt") - watch("billDiscAmt"), watchedGroupDisc || 0).toFixed(2)}</Typography>
                        </Box>
                        <Divider />
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="h6">Net Amount Payable:</Typography>
                          <Typography variant="h6" color="primary">
                            ₹{calculateFinalBillAmount.toFixed(2)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Summary Breakdown:
                        </Typography>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Total Services:</Typography>
                          <Typography variant="body2">{serviceRows.length}</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Total Products:</Typography>
                          <Typography variant="body2">{productRows.length}</Typography>
                        </Box>
                        <Divider />
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" fontWeight="medium">
                            Total Items:
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {serviceRows.length + productRows.length}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Action Buttons */}
            <Grid size={{ sm: 12 }}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <SmartButton text="Reset" onClick={performReset} variant="outlined" color="error" icon={CancelIcon} disabled={!isDirty} />
                <SmartButton
                  text="Save Bill"
                  variant="contained"
                  color="primary"
                  icon={SaveIcon}
                  onClick={handleSubmit(onSubmit)}
                  disabled={!isDirty || !isValid}
                  asynchronous={true}
                  showLoadingIndicator={true}
                  loadingText="Saving..."
                  successText="Saved!"
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      {/* Patient Visit History Dialog */}
      <PatientVisitDialog
        open={isHistoryDialogOpen}
        onClose={handleCloseHistoryDialog}
        pChartID={selectedPChartID}
        pChartCode={selectedPatient?.pChartCode}
        onVisitSelect={handleVisitSelect}
      />
      {/* Product Department Selection Dialog */}
      <DepartmentSelectionDialog
        open={isDepartmentDialogOpen}
        onClose={closeDepartmentDialog}
        onSelectDepartment={handleDeptSelect}
        initialDeptId={selectedDeptId}
        requireSelection={true}
      />
      {/* Batch Selection Dialog */}
      <BatchSelectionDialog open={isBatchSelectionDialogOpen} onClose={closeBatchDialog} onSelect={handleBatchSelect} data={availableBatches} />
    </Box>
  );
};

export default BillingPage;
