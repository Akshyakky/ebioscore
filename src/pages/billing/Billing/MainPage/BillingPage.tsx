// src/pages/billing/Billing/MainPage/BillingPage.tsx
import SmartButton from "@/components/Button/SmartButton";
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
import PatientVisitDialog from "@/pages/patientAdministration/RevisitPage/SubPage/PatientVisitDialog";
import { useAlert } from "@/providers/AlertProvider";
import { bChargeService, billingGenericService, billingService } from "@/services/BillingServices/BillingService";
import { productListService } from "@/services/InventoryManagementService/inventoryManagementService";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cancel as CancelIcon, Save as SaveIcon } from "@mui/icons-material";
import { Alert, Box, Grid, Paper } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

// Import new components and utilities
import { useBilling } from "../hooks/useBilling";
import { BillDetailsSection, BillSummarySection, ItemsSection, PatientSection, VisitReferenceCard } from "./components";
import { DEFAULT_FORM_VALUES } from "./constants";
import { BillingFormData, billingSchema } from "./types";
import { calculateBillTotals, prepareBillSaveRequest } from "./utils/billingUtils";

const BillingPage: React.FC = () => {
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();

  // State management
  const [selectedPChartID, setSelectedPChartID] = useState<number>(0);
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);
  const [clearSearchTrigger, setClearSearchTrigger] = useState(0);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isChangingVisit, setIsChangingVisit] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [services, setServices] = useState<BChargeDto[]>([]);
  const [products, setProducts] = useState<ProductListDto[]>([]);
  const [itemMode, setItemMode] = useState<"service" | "product">("service");

  // Loading states
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Custom hooks
  const dropdownValues = useDropdownValues(["pic"]);
  const { calculateServiceDiscountAmount, calculateServiceNetAmount, calculateDiscountFromPercent } = useBilling();
  const {
    deptId: selectedDeptId,
    deptName: selectedDeptName,
    isDialogOpen: isDepartmentDialogOpen,
    isDepartmentSelected,
    openDialog: openDepartmentDialog,
    closeDialog: closeDepartmentDialog,
    handleDepartmentSelect: handleDeptSelect,
  } = useDepartmentSelection();
  const { isDialogOpen: isBatchSelectionDialogOpen, availableBatches, openDialog: openBatchDialog, closeDialog: closeBatchDialog } = useBatchSelection();

  // Mock data - should be replaced with actual API data
  const physicians = [
    { value: 1, label: "Dr. Ajeesh" },
    { value: 2, label: "Dr. Akash" },
  ];
  const referals = [
    { value: 1, label: "Dr. Ajeesh" },
    { value: 2, label: "Dr. Akash" },
  ];

  // React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
    formState: { isDirty, isValid },
  } = useForm<BillingFormData>({
    defaultValues: DEFAULT_FORM_VALUES,
    resolver: zodResolver(billingSchema),
    mode: "onChange",
  });

  const watchedBillServices = watch("billServices");
  const watchedBillProducts = watch("billProducts");
  const watchedVisitReference = watch("visitReferenceCode");
  const watchedGroupDisc = watch("groupDisc");

  // Calculate totals whenever services or products change
  useEffect(() => {
    const { totalGrossAmount, totalDiscountAmount } = calculateBillTotals(watchedBillServices, watchedBillProducts);
    setValue("billGrossAmt", totalGrossAmount);
    setValue("billDiscAmt", totalDiscountAmount);
  }, [watchedBillServices, watchedBillProducts, setValue]);

  // Fetch services on mount
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

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
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

  const handleVisitSelect = useCallback(
    (visit: GetPatientAllVisitHistory) => {
      setValue("patOPIP", visit.patOPIP as "O" | "I", { shouldValidate: true });
      setValue("opIPNo", visit.opipNo, { shouldValidate: true });
      setValue("opipCaseNo", visit.opipCaseNo, { shouldValidate: true });
      setValue("visitReferenceCode", visit.opNumber || "", { shouldValidate: true });
      setValue("billMisc", `Visit Ref: ${visit.opNumber}`, { shouldValidate: true });
      trigger();
      showAlert("Success", `Visit ${visit.opNumber} selected`, "success");
    },
    [setValue, trigger, showAlert]
  );

  const handleChangeVisit = useCallback(() => {
    if (selectedPChartID > 0) {
      setIsChangingVisit(true);
      setIsHistoryDialogOpen(true);
    }
  }, [selectedPChartID]);

  const handleBatchSelect = useCallback(
    (batch: ProductBatchDto) => {
      const selectedProduct: BillProductsDto = {
        productID: batch.productID,
        productName: batch.productName,
        batchNo: batch.batchNo,
        expiryDate: batch.expiryDate,
        grnDetID: batch.grnDetID,
        deptID: batch.deptID,
        deptName: batch.deptName,
        selectedQuantity: 1,
        hValue: batch.sellingPrice,
        hospPercShare: 0,
        hValDisc: 0,
        packID: 0,
        packName: "",
        rActiveYN: "Y",
      };
      // This will be passed to ItemsSection which will handle appending
      showAlert("Success", `Batch "${batch.batchNo}" added`, "success");
      closeBatchDialog();
      return selectedProduct;
    },
    [showAlert, closeBatchDialog]
  );

  const onSubmit = async (data: BillingFormData) => {
    try {
      setLoading(true);
      const billSaveRequest = prepareBillSaveRequest(data);

      const saveBillResponse = await billingGenericService.save(billSaveRequest as BillSaveRequest);
      if (saveBillResponse.success) {
        showAlert("Success", "Bill saved successfully", "success");
        performReset();
      } else {
        showAlert("Warning", "Bill not saved", "warning");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save bill";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const performReset = () => {
    reset(DEFAULT_FORM_VALUES);
    setFormError(null);
    setSelectedPChartID(0);
    setSelectedPatient(null);
    setClearSearchTrigger((prev) => prev + 1);
    setItemMode("service");
  };

  // Calculate final bill amount
  const finalBillAmount = useMemo(() => {
    const grossAmount = watch("billGrossAmt");
    const discountAmount = watch("billDiscAmt");
    const groupDiscountPerc = watchedGroupDisc || 0;

    const netAfterDiscount = grossAmount - discountAmount;
    const groupDiscountAmount = calculateDiscountFromPercent(netAfterDiscount, groupDiscountPerc);

    return netAfterDiscount - groupDiscountAmount;
  }, [watch("billGrossAmt"), watch("billDiscAmt"), watchedGroupDisc, calculateDiscountFromPercent]);

  return (
    <Box sx={{ p: 2 }}>
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
              <PatientSection selectedPChartID={selectedPChartID} clearSearchTrigger={clearSearchTrigger} onPatientSelect={handlePatientSelect} />
            </Grid>
            {/* Visit Reference Section */}
            <Grid size={{ sm: 4 }}>{watchedVisitReference && <VisitReferenceCard visitReference={watchedVisitReference} onChangeVisit={handleChangeVisit} />}</Grid>
            {/* Bill Details Section */}
            <Grid size={{ sm: 12 }}>
              <BillDetailsSection control={control} dropdownValues={dropdownValues} physicians={physicians} referals={referals} setValue={setValue} />
            </Grid>

            {/* Services/Products Section */}
            <Grid size={{ sm: 12 }}>
              <ItemsSection
                control={control}
                itemMode={itemMode}
                setItemMode={setItemMode}
                services={services}
                products={products}
                loadingServices={loadingServices}
                loadingProducts={loadingProducts}
                isDepartmentSelected={isDepartmentSelected}
                selectedDeptId={selectedDeptId}
                selectedDeptName={selectedDeptName}
                openDepartmentDialog={openDepartmentDialog}
                showAlert={showAlert}
                watchedBillServices={watchedBillServices}
                watchedBillProducts={watchedBillProducts}
                calculateDiscountFromPercent={calculateDiscountFromPercent}
                billingService={billingService}
                openBatchDialog={openBatchDialog}
                physicians={physicians}
                setValue={setValue}
              />
            </Grid>

            {/* Bill Summary */}
            <Grid size={{ sm: 12 }}>
              <BillSummarySection
                control={control}
                billGrossAmt={watch("billGrossAmt")}
                billDiscAmt={watch("billDiscAmt")}
                groupDisc={watchedGroupDisc}
                finalBillAmount={finalBillAmount}
                serviceCount={watchedBillServices.length}
                productCount={watchedBillProducts.length}
                calculateDiscountFromPercent={calculateDiscountFromPercent}
              />
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

      {/* Dialogs */}
      <PatientVisitDialog
        open={isHistoryDialogOpen}
        onClose={handleCloseHistoryDialog}
        pChartID={selectedPChartID}
        pChartCode={selectedPatient?.pChartCode}
        onVisitSelect={handleVisitSelect}
      />

      <DepartmentSelectionDialog
        open={isDepartmentDialogOpen}
        onClose={closeDepartmentDialog}
        onSelectDepartment={handleDeptSelect}
        initialDeptId={selectedDeptId}
        requireSelection={true}
      />

      <BatchSelectionDialog open={isBatchSelectionDialogOpen} onClose={closeBatchDialog} onSelect={handleBatchSelect} data={availableBatches} />
    </Box>
  );
};

export default BillingPage;
