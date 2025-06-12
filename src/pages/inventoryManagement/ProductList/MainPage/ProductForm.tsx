import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import { useAlert } from "@/providers/AlertProvider";
import { ProductListService } from "@/services/InventoryManagementService/ProductListService/ProductListService";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cancel as CancelIcon, Refresh as RefreshIcon, Save as SaveIcon } from "@mui/icons-material";
import { Alert, Box, Card, CardContent, Divider, Grid, Typography } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

interface ProductFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  product: ProductListDto | null;
  viewOnly?: boolean;
}

// Enhanced validation schema with conditional tax validation
const productSchema = z
  .object({
    productID: z.coerce.number().optional(),
    productCode: z
      .string()
      .min(1, "Product code is required")
      .max(50, "Product code must be less than 50 characters")
      .regex(/^[A-Za-z0-9-_]+$/, "Product code can only contain letters, numbers, hyphens, and underscores"),
    productName: z.string().min(1, "Product name is required").max(200, "Product name must be less than 200 characters"),
    catValue: z.string().min(1, "Category is required"),
    pGrpID: z.coerce.number().min(1, "Product group is required"),
    pUnitID: z.coerce.number().min(1, "Product unit is required"),
    defaultPrice: z.coerce
      .number()
      .min(0, "Price cannot be negative")
      .refine((val) => val > 0, "Price must be greater than 0"),
    taxID: z.coerce.number().optional(),
    prescription: z.string(),
    expiry: z.string(),
    sellable: z.string(),
    taxable: z.string(),
    mFID: z.coerce.number().optional(),
    mGenID: z.coerce.number().optional(),
    leadTime: z.coerce.number().min(0, "Lead time cannot be negative").optional(),
    psGrpID: z.coerce.number().optional(),
    rOL: z.coerce.number().min(0, "Reorder level cannot be negative").optional(),
    manufacturerID: z.coerce.number().optional(),
    pLocationID: z.coerce.number().optional(),
    rActiveYN: z.string(),
    productNotes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
    vedCode: z.string().optional(),
    abcCode: z.string().optional(),
    hsnCODE: z.string().optional(),
    barcode: z.string().optional(),
    chargableYN: z.string(),
    chargePercentage: z.coerce.number().min(0, "Charge percentage cannot be negative").max(100, "Charge percentage cannot exceed 100%").optional(),
    isAssetYN: z.string(),
    transferYN: z.string(),
    unitPack: z.coerce.number().min(0, "Unit pack cannot be negative").optional(),
    baseUnit: z.coerce.number().min(0, "Base unit cannot be negative").optional(),
    pPackageID: z.coerce.number().optional(),
    issueUnit: z.coerce.number().min(0, "Issue unit cannot be negative").optional(),
    serialNumber: z.string().max(100, "Serial number must be less than 100 characters").optional(),
    gstPerValue: z.coerce.number().min(0, "GST percentage cannot be negative").max(100).optional(),
    cgstPerValue: z.coerce.number().min(0, "CGST percentage cannot be negative").max(100).optional(),
    sgstPerValue: z.coerce.number().min(0, "SGST percentage cannot be negative").max(100).optional(),
    universalCode: z.coerce.number().optional(),
    rNotes: z.string().max(500, "Additional notes must be less than 500 characters").optional(),
    supplierStatus: z.string(),
  })
  .refine(
    (data) => {
      // If taxable is Y, then taxID is required
      if (data.taxable === "Y" && (!data.taxID || data.taxID === 0)) {
        return false;
      }
      return true;
    },
    {
      message: "Tax selection is required when product is taxable",
      path: ["taxID"],
    }
  );

type ProductFormData = z.infer<typeof productSchema>;

const productService = new ProductListService();

const ProductForm: React.FC<ProductFormProps> = ({ open, onClose, product, viewOnly = false }) => {
  const { setLoading } = useLoading();
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  // Load dropdown values with comprehensive list
  const { productCategory, productGroup, productUnit, taxType, medicationForm, medicationGeneric, productSubGroup, manufacturer, productLocation, productBaseUnit } =
    useDropdownValues([
      "productCategory",
      "productGroup",
      "productUnit",
      "taxType",
      "medicationForm",
      "medicationGeneric",
      "productSubGroup",
      "manufacturer",
      "productLocation",
      "productBaseUnit",
    ]);

  // Initialize form with enhanced default values
  const defaultValues: ProductFormData = useMemo(
    () => ({
      productID: product?.productID || 0,
      productCode: product?.productCode || "",
      productName: product?.productName || "",
      catValue: product?.catValue || "",
      pGrpID: product?.pGrpID || 0,
      pUnitID: product?.pUnitID || 0,
      defaultPrice: product?.defaultPrice || 0,
      taxID: product?.taxID || 0,
      prescription: product?.prescription || "N",
      expiry: product?.expiry || "N",
      sellable: product?.sellable || "Y",
      taxable: product?.taxable || "N",
      mFID: product?.mFID || 0,
      mGenID: product?.mGenID || 0,
      leadTime: product?.leadTime || 0,
      psGrpID: product?.psGrpID || 0,
      rOL: product?.rOL || 0,
      manufacturerID: product?.manufacturerID || 0,
      pLocationID: product?.pLocationID || 0,
      rActiveYN: product?.rActiveYN || "Y",
      productNotes: product?.productNotes || "",
      vedCode: product?.vedCode || "",
      abcCode: product?.abcCode || "",
      hsnCODE: product?.hsnCODE || "",
      barcode: product?.barcode || "",
      chargableYN: product?.chargableYN || "N",
      chargePercentage: product?.chargePercentage || 0,
      isAssetYN: product?.isAssetYN || "N",
      transferYN: product?.transferYN || "N",
      unitPack: product?.unitPack || 0,
      baseUnit: product?.baseUnit || 0,
      pPackageID: product?.pPackageID || 0,
      issueUnit: product?.issueUnit || 0,
      serialNumber: product?.serialNumber || "",
      gstPerValue: product?.gstPerValue || 0,
      cgstPerValue: product?.cgstPerValue || 0,
      sgstPerValue: product?.sgstPerValue || 0,
      universalCode: product?.universalCode || 0,
      rNotes: product?.rNotes || "",
      supplierStatus: product?.supplierStatus || "A",
    }),
    [product]
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isValid, isDirty, isSubmitted },
    trigger,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues,
    mode: "onChange", // Enable real-time validation
  });

  // Watch for changes in relevant fields
  const chargableYN = useWatch({ control, name: "chargableYN" });
  const chargePercentage = useWatch({ control, name: "chargePercentage" });
  const taxable = useWatch({ control, name: "taxable" });
  const taxID = useWatch({ control, name: "taxID" });

  // Auto-calculate GST percentages when tax is selected
  useEffect(() => {
    if (taxable === "Y" && taxID && taxType && taxType.length > 0) {
      const selectedTax = taxType.find((tax) => Number(tax.value) === Number(taxID));
      if (selectedTax) {
        // Extract tax percentage from selected tax
        // Assuming the tax percentage is available in the tax object
        const taxPercentage = Number(selectedTax.label) || 0;

        if (taxPercentage > 0) {
          // For Indian GST system, typically split equally between CGST and SGST
          const halfTaxRate = taxPercentage / 2;

          setValue("gstPerValue", taxPercentage);
          setValue("cgstPerValue", halfTaxRate);
          setValue("sgstPerValue", halfTaxRate);
        }
      }
    } else if (taxable === "N") {
      // Clear tax percentages when not taxable
      setValue("gstPerValue", 0);
      setValue("cgstPerValue", 0);
      setValue("sgstPerValue", 0);
      setValue("taxID", 0);
    }
  }, [taxable, taxID, taxType, setValue]);

  // Enhanced product code generation with error handling
  useEffect(() => {
    if (!product && open && !getValues("productCode")) {
      generateProductCode();
    }
  }, [product, open, getValues]);

  // Generate next product code with better error handling
  const generateProductCode = async () => {
    try {
      setIsGeneratingCode(true);
      const response = await productService.getNextProductCode();
      if (response.success && response.data) {
        setValue("productCode", response.data);
        await trigger("productCode"); // Validate the new code
      } else {
        showAlert("Warning", "Could not generate product code. Please enter manually.", "warning");
      }
    } catch (error) {
      console.error("Error generating product code:", error);
      showAlert("Warning", "Error generating product code. Please enter manually.", "warning");
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // Enhanced form submission with better error handling
  const onSubmit = async (data: ProductFormData) => {
    if (viewOnly) return;

    // Clear any previous form errors
    setFormError(null);

    // Additional validation
    if (chargableYN === "Y" && (!chargePercentage || chargePercentage === 0)) {
      setFormError("Charge percentage is required when product is chargeable");
      return;
    }

    try {
      setIsSaving(true);
      setLoading(true);

      // Get selected dropdown items' labels for better data integrity
      const selectedUnit = productUnit?.find((unit) => Number(unit.value) === data.pUnitID);
      const selectedTax = taxType?.find((tax) => Number(tax.value) === data.taxID);
      const selectedManufacturer = manufacturer?.find((mfr) => Number(mfr.value) === data.manufacturerID);
      const selectedProductGroup = productGroup?.find((group) => Number(group.value) === data.pGrpID);
      const selectedProductSubGroup = productSubGroup?.find((group) => Number(group.value) === data.psGrpID);
      const selectedMedicationForm = medicationForm?.find((form) => Number(form.value) === data.mFID);
      const selectedMedicationGeneric = medicationGeneric?.find((generic) => Number(generic.value) === data.mGenID);
      const selectedCatDescription = productCategory?.find((category) => category.value === data.catValue);
      const selectedPLocation = productLocation?.find((location) => Number(location.value) === data.pLocationID);

      // Enhanced data preparation with proper type handling
      const productData: ProductListDto = {
        ...data,
        productID: data.productID || 0,
        catValue: data.catValue || "",
        supplierStatus: data.supplierStatus || "A",
        vedCode: data.vedCode || "",
        abcCode: data.abcCode || "",
        // Normalize Y/N values
        prescription: data.prescription === "Y" ? "Y" : "N",
        expiry: data.expiry === "Y" ? "Y" : "N",
        sellable: data.sellable === "Y" ? "Y" : "N",
        taxable: data.taxable === "Y" ? "Y" : "N",
        chargableYN: data.chargableYN === "Y" ? "Y" : "N",
        isAssetYN: data.isAssetYN === "Y" ? "Y" : "N",
        transferYN: data.transferYN === "Y" ? "Y" : "N",
        rActiveYN: data.rActiveYN === "Y" ? "Y" : "N",
        // Ensure numeric values are properly set
        pGrpID: data.pGrpID || undefined,
        pUnitID: data.pUnitID || undefined,
        taxID: data.taxable === "Y" ? data.taxID || undefined : undefined,
        mFID: data.mFID || undefined,
        mGenID: data.mGenID || undefined,
        psGrpID: data.psGrpID || undefined,
        manufacturerID: data.manufacturerID || undefined,
        pLocationID: data.pLocationID || undefined,
        pPackageID: data.pPackageID || undefined,
        // Add dropdown text values for better data integrity
        pUnitName: selectedUnit?.label || "",
        taxName: selectedTax?.label?.toString() || "",
        taxCode: selectedTax?.code || "",
        manufacturerName: selectedManufacturer?.label || "",
        manufacturerCode: selectedManufacturer?.code || "",
        productGroupName: selectedProductGroup?.label || "",
        psGroupName: selectedProductSubGroup?.label || "",
        MFName: selectedMedicationForm?.label || "",
        medicationGenericName: selectedMedicationGeneric?.label || "",
        catDescription: selectedCatDescription?.label || "",
        pLocationName: selectedPLocation?.label || "",
        pLocationCode: selectedPLocation?.code || "",
      };

      const response = await productService.save(productData);

      if (response.success && response.data) {
        showAlert("Success", product ? "Product updated successfully" : "Product created successfully", "success");
        onClose(true); // Close form and refresh data
      } else {
        const errorMessage = response.errorMessage || "Failed to save product";
        setFormError(errorMessage);
        showAlert("Error", errorMessage, "error");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save product";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  // Enhanced form reset with confirmation
  const handleReset = () => {
    if (isDirty) {
      if (window.confirm("Are you sure you want to reset the form? All unsaved changes will be lost.")) {
        reset(defaultValues);
        setFormError(null);
        if (!product) {
          generateProductCode();
        }
      }
    } else {
      reset(defaultValues);
      setFormError(null);
    }
  };

  // Enhanced dialog title with status indication
  const dialogTitle = useMemo(() => {
    if (viewOnly) return "View Product Details";
    if (product) return `Edit Product - ${product.productName}`;
    return "Create New Product";
  }, [viewOnly, product]);

  // Enhanced action buttons with better states
  const dialogActions = useMemo(() => {
    if (viewOnly) {
      return <CustomButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />;
    }

    return (
      <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
        <CustomButton text="Cancel" onClick={() => onClose()} variant="outlined" color="inherit" disabled={isSaving} />
        <Box sx={{ display: "flex", gap: 1 }}>
          <CustomButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={CancelIcon} disabled={isSaving || (!isDirty && !formError)} />
          <SmartButton
            text={product ? "Update Product" : "Create Product"}
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            color="primary"
            icon={SaveIcon}
            asynchronous={true}
            showLoadingIndicator={true}
            loadingText={product ? "Updating..." : "Creating..."}
            successText={product ? "Updated!" : "Created!"}
            disabled={isSaving || !isValid}
          />
        </Box>
      </Box>
    );
  }, [viewOnly, isSaving, isDirty, isValid, product, formError, handleSubmit, onSubmit, onClose, handleReset]);

  return (
    <GenericDialog
      open={open}
      onClose={() => onClose()}
      title={dialogTitle}
      maxWidth="lg"
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
          {/* Status Toggle - Prominent Position */}
          <Grid size={{ xs: 12 }}>
            <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
              <Typography variant="body2" color="text.secondary">
                Status:
              </Typography>
              <FormField name="rActiveYN" control={control} label="Active" type="switch" disabled={viewOnly} size="small" />
            </Box>
          </Grid>

          {/* Basic Information Section */}
          <Grid size={{ xs: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <FormField name="productCode" control={control} label="Product Code" type="text" required disabled={viewOnly || !!product} size="small" fullWidth />
                      {!product && !viewOnly && (
                        <SmartButton
                          text="Generate"
                          onClick={generateProductCode}
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

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField name="productName" control={control} label="Product Name" type="text" required disabled={viewOnly} size="small" fullWidth />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField
                      name="catValue"
                      control={control}
                      label="Category"
                      type="select"
                      required
                      disabled={viewOnly}
                      placeholder="Select a category"
                      options={productCategory || []}
                      size="small"
                      clearable={true}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField
                      name="pGrpID"
                      control={control}
                      label="Product Group"
                      type="select"
                      required
                      disabled={viewOnly}
                      placeholder="Select a product group"
                      options={productGroup || []}
                      size="small"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField
                      name="psGrpID"
                      control={control}
                      label="Product Sub Group"
                      type="select"
                      disabled={viewOnly}
                      placeholder="Select a sub group"
                      options={productSubGroup || []}
                      size="small"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField
                      name="manufacturerID"
                      control={control}
                      label="Manufacturer"
                      type="select"
                      disabled={viewOnly}
                      placeholder="Select a manufacturer"
                      options={manufacturer || []}
                      size="small"
                      clearable={true}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField name="barcode" control={control} label="Barcode" type="text" disabled={viewOnly} size="small" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField name="hsnCODE" control={control} label="HSN Code" type="text" disabled={viewOnly} size="small" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField name="serialNumber" control={control} label="Serial Number" type="text" disabled={viewOnly} size="small" />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Price and Tax Section */}
          <Grid size={{ xs: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Pricing & Tax Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  {/* Pricing Row */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField name="defaultPrice" control={control} label="Price (₹)" type="number" required disabled={viewOnly} size="small" placeholder="Enter price" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <FormField name="taxable" control={control} label="Taxable" type="switch" disabled={viewOnly} size="small" />
                      <FormField name="chargableYN" control={control} label="Chargeable" type="switch" disabled={viewOnly} size="small" />
                    </Box>
                  </Grid>

                  {/* Tax Section - Only show when taxable is Y */}
                  {taxable === "Y" && (
                    <>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
                          Tax Configuration
                        </Typography>
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <FormField
                          name="taxID"
                          control={control}
                          label="Tax Type"
                          type="select"
                          required={taxable === "Y"}
                          disabled={viewOnly}
                          placeholder="Select Tax Type"
                          options={taxType || []}
                          size="small"
                        />
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <FormField name="gstPerValue" control={control} label="GST Total (%)" type="number" disabled={true} size="small" placeholder="Auto-calculated" />
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <FormField name="cgstPerValue" control={control} label="CGST (%)" type="number" disabled={true} size="small" placeholder="Auto-calculated" />
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <FormField name="sgstPerValue" control={control} label="SGST (%)" type="number" disabled={true} size="small" placeholder="Auto-calculated" />
                      </Grid>
                    </>
                  )}

                  {/* Charge Section - Only show when chargeable is Y */}
                  {chargableYN === "Y" && (
                    <>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
                          Charge Configuration
                        </Typography>
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <FormField
                          name="chargePercentage"
                          control={control}
                          label="Charge Percentage (%)"
                          type="number"
                          disabled={viewOnly}
                          size="small"
                          placeholder="Enter charge percentage"
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Inventory Settings Section */}
          <Grid size={{ xs: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Inventory Settings
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField name="sellable" control={control} label="Sellable" type="switch" disabled={viewOnly} size="small" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField name="isAssetYN" control={control} label="Is Asset" type="switch" disabled={viewOnly} size="small" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField name="unitPack" control={control} label="Unit Pack" type="number" disabled={viewOnly} size="small" placeholder="Enter unit pack" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField
                      name="pUnitID"
                      control={control}
                      label="Issue Unit (UOM)"
                      type="select"
                      required
                      disabled={viewOnly}
                      placeholder="Select issue unit"
                      options={productUnit || []}
                      size="small"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField name="baseUnit" control={control} label="Base Unit" type="number" disabled={viewOnly} size="small" placeholder="Enter base unit" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField
                      name="pPackageID"
                      control={control}
                      label="Base Unit (UOM)"
                      type="select"
                      disabled={viewOnly}
                      placeholder="Select base unit"
                      options={productBaseUnit || []}
                      size="small"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField name="rOL" control={control} label="Reorder Level" type="number" disabled={viewOnly} size="small" placeholder="Enter reorder level" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField name="leadTime" control={control} label="Lead Time (Days)" type="number" disabled={viewOnly} size="small" placeholder="Enter lead time" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField name="issueUnit" control={control} label="Issue Unit" type="number" disabled={viewOnly} size="small" placeholder="Enter issue unit" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField
                      name="pLocationID"
                      control={control}
                      label="Product Location"
                      type="select"
                      disabled={viewOnly}
                      placeholder="Select location"
                      options={productLocation || []}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Medication Information Section */}
          <Grid size={{ xs: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Medication Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField name="prescription" control={control} label="Requires Prescription" type="switch" disabled={viewOnly} size="small" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField name="expiry" control={control} label="Has Expiry" type="switch" disabled={viewOnly} size="small" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField
                      name="mFID"
                      control={control}
                      label="Medication Form"
                      type="select"
                      disabled={viewOnly}
                      placeholder="Select medication form"
                      options={
                        medicationForm?.map((form) => ({
                          value: form.value,
                          label: form.label,
                        })) || []
                      }
                      size="small"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField
                      name="mGenID"
                      control={control}
                      label="Medication Generic"
                      type="select"
                      disabled={viewOnly}
                      placeholder="Select medication generic"
                      options={
                        medicationGeneric?.map((generic) => ({
                          value: generic.value,
                          label: generic.label,
                        })) || []
                      }
                      size="small"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Classification Section */}
          <Grid size={{ xs: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Classification
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField
                      name="vedCode"
                      control={control}
                      label="VED Code"
                      type="select"
                      disabled={viewOnly}
                      placeholder="Select VED Code"
                      options={[
                        { value: "V", label: "V - Vital" },
                        { value: "E", label: "E - Essential" },
                        { value: "D", label: "D - Desirable" },
                      ]}
                      size="small"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField
                      name="abcCode"
                      control={control}
                      label="ABC Code"
                      type="select"
                      disabled={viewOnly}
                      placeholder="Select ABC Code"
                      options={[
                        { value: "A", label: "A - High Value" },
                        { value: "B", label: "B - Medium Value" },
                        { value: "C", label: "C - Low Value" },
                      ]}
                      size="small"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField name="universalCode" control={control} label="Universal Code" type="number" disabled={viewOnly} size="small" placeholder="Enter universal code" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField
                      name="supplierStatus"
                      control={control}
                      label="Supplier Status"
                      type="select"
                      disabled={viewOnly}
                      placeholder="Select supplier status"
                      options={[
                        { value: "A", label: "Active" },
                        { value: "I", label: "Inactive" },
                        { value: "P", label: "Pending" },
                      ]}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Notes Section */}
          <Grid size={{ xs: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Additional Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField
                      name="productNotes"
                      control={control}
                      label="Product Notes"
                      type="textarea"
                      disabled={viewOnly}
                      rows={4}
                      size="small"
                      placeholder="Enter notes about the product"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField
                      name="rNotes"
                      control={control}
                      label="Additional Notes"
                      type="textarea"
                      disabled={viewOnly}
                      rows={4}
                      size="small"
                      placeholder="Enter any additional remarks"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </GenericDialog>
  );
};

export default ProductForm;
