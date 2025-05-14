import React, { useState, useEffect } from "react";
import { Box, Grid, Typography, Divider } from "@mui/material";
import { Save as SaveIcon, Cancel as CancelIcon } from "@mui/icons-material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLoading } from "@/context/LoadingContext";
import { showAlert } from "@/utils/Common/showAlert";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import { ProductListService } from "@/services/InventoryManagementService/ProductListService/ProductListService";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";

interface ProductFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  product: ProductListDto | null;
  viewOnly?: boolean;
}

// Define the validation schema
const productSchema = z.object({
  productID: z.coerce.number().optional(),
  productCode: z.string().min(1, "Product code is required"),
  productName: z.string().min(1, "Product name is required"),
  catValue: z.string().min(1, "Category is required"),
  pGrpID: z.coerce.number().min(1, "Product group is required"),
  pUnitID: z.coerce.number().min(1, "Product unit is required"),
  defaultPrice: z.coerce.number().min(0, "Price cannot be negative"),
  taxID: z.coerce.number().optional(),
  prescription: z.string().optional(),
  expiry: z.string().optional(),
  sellable: z.string().optional(),
  taxable: z.string().optional(),
  mFID: z.coerce.number().optional(),
  mGenID: z.coerce.number().optional(),
  leadTime: z.coerce.number().optional(),
  psGrpID: z.coerce.number().optional(),
  rOL: z.coerce.number().optional(),
  manufacturerID: z.coerce.number().optional(),
  pLocationID: z.coerce.number().optional(),
  rActiveYN: z.string().optional(),
  productNotes: z.string().optional(),
  vedCode: z.string().optional(),
  abcCode: z.string().optional(),
  hsnCODE: z.string().optional(),
  barcode: z.string().optional(),
  chargableYN: z.string().optional(),
  chargePercentage: z.coerce.number().optional(),
  isAssetYN: z.string().optional(),
  transferYN: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

const productService = new ProductListService();

const ProductForm: React.FC<ProductFormProps> = ({ open, onClose, product, viewOnly = false }) => {
  const { setLoading } = useLoading();
  const [isSaving, setIsSaving] = useState(false);

  // Load dropdown values
  const { productCategory, productGroup, productUnit, taxType, medicationForm, medicationGeneric, productSubGroup, manufacturer } = useDropdownValues([
    "productCategory",
    "productGroup",
    "productUnit",
    "taxType",
    "medicationForm",
    "medicationGeneric",
    "productSubGroup",
    "manufacturer",
  ]);

  // Initialize form with default values or product values
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
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
      taxable: product?.taxable || "Y",
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
    },
  });

  // Generate product code for new products
  useEffect(() => {
    if (!product && open) {
      generateProductCode();
    }
  }, [product, open]);

  // Generate next product code
  const generateProductCode = async () => {
    try {
      setLoading(true);
      const response = await productService.getNextProductCode();
      if (response.success && response.data) {
        setValue("productCode", response.data);
      }
    } catch (error) {
      console.error("Error generating product code:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data: ProductFormData) => {
    if (viewOnly) return;

    try {
      setIsSaving(true);
      setLoading(true);

      // Convert form data to ProductListDto
      const productData: ProductListDto = {
        ...data,
        productID: data.productID || 0,
        prescription: data.prescription || "N",
        expiry: data.expiry || "N",
        sellable: data.sellable || "Y",
        taxable: data.taxable || "Y",
        chargableYN: data.chargableYN || "N",
        isAssetYN: data.isAssetYN || "N",
        transferYN: data.transferYN || "N",
        pGrpID: data.pGrpID || 0,
        pUnitID: data.pUnitID || 0,
        defaultPrice: data.defaultPrice || 0,
        taxID: data.taxID || 0,
        mFID: data.mFID || 0,
        mGenID: data.mGenID || 0,
        leadTime: data.leadTime || 0,
        psGrpID: data.psGrpID || 0,
        rOL: data.rOL || 0,
        manufacturerID: data.manufacturerID || 0,
        pLocationID: data.pLocationID || 0,
        chargePercentage: data.chargePercentage || 0,
        vedCode: data.vedCode || "",
        abcCode: data.abcCode || "",
        rActiveYN: data.rActiveYN || "N",
        supplierStatus: product?.supplierStatus || "A",
      };

      const response = await productService.save(productData);

      if (response.success && response.data) {
        showAlert("Success", "Product saved successfully", "success");
        onClose(true); // Close form and refresh data
      } else {
        showAlert("Error", response.errorMessage || "Failed to save product", "error");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      showAlert("Error", "Failed to save product", "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  // Handle form reset/clear
  const handleClear = () => {
    if (product) {
      // If editing, reset to original values
      reset({
        productID: product.productID,
        productCode: product.productCode || "",
        productName: product.productName || "",
        catValue: product.catValue || "",
        pGrpID: product.pGrpID || 0,
        pUnitID: product.pUnitID || 0,
        defaultPrice: product.defaultPrice || 0,
        taxID: product.taxID || 0,
        prescription: product.prescription || "N",
        expiry: product.expiry || "N",
        sellable: product.sellable || "Y",
        taxable: product.taxable || "Y",
        mFID: product.mFID || 0,
        mGenID: product.mGenID || 0,
        leadTime: product.leadTime || 0,
        psGrpID: product.psGrpID || 0,
        rOL: product.rOL || 0,
        manufacturerID: product.manufacturerID || 0,
        pLocationID: product.pLocationID || 0,
        rActiveYN: product.rActiveYN || "Y",
        productNotes: product.productNotes || "",
        vedCode: product.vedCode || "",
        abcCode: product.abcCode || "",
        hsnCODE: product.hsnCODE || "",
        barcode: product.barcode || "",
        chargableYN: product.chargableYN || "N",
        chargePercentage: product.chargePercentage || 0,
        isAssetYN: product.isAssetYN || "N",
        transferYN: product.transferYN || "N",
      });
    } else {
      // If adding new, reset to defaults
      reset({
        productID: 0,
        productCode: "",
        productName: "",
        catValue: "",
        pGrpID: 0,
        pUnitID: 0,
        defaultPrice: 0,
        taxID: 0,
        prescription: "N",
        expiry: "N",
        sellable: "Y",
        taxable: "Y",
        mFID: 0,
        mGenID: 0,
        leadTime: 0,
        psGrpID: 0,
        rOL: 0,
        manufacturerID: 0,
        pLocationID: 0,
        rActiveYN: "Y",
        productNotes: "",
        vedCode: "",
        abcCode: "",
        hsnCODE: "",
        barcode: "",
        chargableYN: "N",
        chargePercentage: 0,
        isAssetYN: "N",
        transferYN: "N",
      });
      generateProductCode();
    }
  };

  // Dialog title based on mode
  const dialogTitle = viewOnly ? "View Product" : product ? "Edit Product" : "Add Product";

  // Define dialog action buttons based on mode
  const dialogActions = viewOnly ? (
    <CustomButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <CustomButton text="Cancel" onClick={() => onClose()} variant="outlined" color="inherit" sx={{ mr: 1 }} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <CustomButton text="Reset" onClick={handleClear} variant="outlined" color="error" icon={CancelIcon} />
        <SmartButton
          text="Save Product"
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          color="primary"
          icon={SaveIcon}
          asynchronous={true}
          showLoadingIndicator={true}
          loadingText="Saving..."
          successText="Saved!"
          disabled={isSaving}
        />
      </Box>
    </Box>
  );

  return (
    <GenericDialog
      open={open}
      onClose={() => onClose()}
      title={dialogTitle}
      maxWidth="lg"
      fullWidth
      showCloseButton
      disableBackdropClick={!viewOnly}
      disableEscapeKeyDown={!viewOnly}
      actions={dialogActions}
    >
      <Box component="form" noValidate sx={{ p: 1 }}>
        <Grid container spacing={3}>
          {/* Product Status */}
          <Grid size={{ xs: 12 }} display="flex" justifyContent="flex-end">
            <FormField name="rActiveYN" control={control} label="Status" type="switch" disabled={viewOnly} size="small" fullWidth />
          </Grid>

          {/* Basic Information Section */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Divider />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormField name="productCode" control={control} label="Product Code" type="text" required disabled={viewOnly || !!product} size="small" fullWidth />
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
              options={
                productCategory?.map((cat) => ({
                  value: cat.value.toString(),
                  label: cat.label,
                })) || []
              }
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
              options={
                productGroup?.map((group) => ({
                  value: group.value,
                  label: group.label,
                })) || []
              }
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
              options={
                productSubGroup?.map((group) => ({
                  value: group.value,
                  label: group.label,
                })) || []
              }
              size="small"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormField
              name="pUnitID"
              control={control}
              label="Unit"
              type="select"
              required
              disabled={viewOnly}
              placeholder="Select a unit"
              options={
                productUnit?.map((unit) => ({
                  value: unit.value,
                  label: unit.label,
                })) || []
              }
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
              options={
                manufacturer?.map((mfr) => ({
                  value: mfr.value,
                  label: mfr.label,
                })) || []
              }
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

          {/* Price and Tax Section */}
          <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Price & Tax Information
            </Typography>
            <Divider />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormField name="defaultPrice" control={control} label="Price" type="number" required disabled={viewOnly} size="small" placeholder="Enter price" />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormField
              name="taxID"
              control={control}
              label="Tax"
              type="select"
              disabled={viewOnly}
              placeholder="Select Tax"
              options={
                taxType?.map((tax) => ({
                  value: tax.value,
                  label: tax.label,
                })) || []
              }
              size="small"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormField name="taxable" control={control} label="Taxable" type="switch" disabled={viewOnly} size="small" />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormField name="chargableYN" control={control} label="Chargeable" type="switch" disabled={viewOnly} size="small" />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormField name="chargePercentage" control={control} label="Charge Percentage" type="number" disabled={viewOnly} size="small" placeholder="Enter percentage" />
          </Grid>

          {/* Inventory Settings Section */}
          <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Inventory Settings
            </Typography>
            <Divider />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormField name="sellable" control={control} label="Sellable" type="switch" disabled={viewOnly} size="small" />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormField name="isAssetYN" control={control} label="Is Asset" type="switch" disabled={viewOnly} size="small" />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormField name="rOL" control={control} label="Reorder Level" type="number" disabled={viewOnly} size="small" placeholder="Enter reorder level" />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormField name="leadTime" control={control} label="Lead Time (Days)" type="number" disabled={viewOnly} size="small" placeholder="Enter lead time" />
          </Grid>

          {/* Medication Information Section */}
          <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Medication Information
            </Typography>
            <Divider />
          </Grid>

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
              placeholder="Select Medication Form"
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
              placeholder="Select Medication Generic"
              options={
                medicationGeneric?.map((generic) => ({
                  value: generic.value,
                  label: generic.label,
                })) || []
              }
              size="small"
            />
          </Grid>

          {/* Classification Section */}
          <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Classification
            </Typography>
            <Divider />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormField
              name="vedCode"
              control={control}
              label="VED Code"
              type="select"
              disabled={viewOnly}
              placeholder="Select VED Code"
              options={[
                { value: "V", label: "Vital" },
                { value: "E", label: "Essential" },
                { value: "D", label: "Desirable" },
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
                { value: "A", label: "A Class" },
                { value: "B", label: "B Class" },
                { value: "C", label: "C Class" },
              ]}
              size="small"
            />
          </Grid>

          {/* Notes Section */}
          <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Additional Information
            </Typography>
            <Divider />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormField
              name="productNotes"
              control={control}
              label="Notes"
              type="textarea"
              disabled={viewOnly}
              rows={4}
              size="small"
              placeholder="Enter any additional notes about the product"
            />
          </Grid>
        </Grid>
      </Box>
    </GenericDialog>
  );
};

export default ProductForm;
