import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import { ProductTaxListDto } from "@/interfaces/InventoryManagement/ProductTaxListDto";
import { useAlert } from "@/providers/AlertProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cancel, Refresh, Save } from "@mui/icons-material";
import { Alert, Box, Card, CardContent, CircularProgress, Divider, Grid, InputAdornment, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { useProductTaxList } from "../hooks/useProductTaxListPage";

interface ProductTaxListFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: ProductTaxListDto | null;
  viewOnly?: boolean;
}

const schema = z.object({
  pTaxID: z.number(),
  pTaxCode: z.string().nonempty("Tax code is required"),
  pTaxName: z.string().nonempty("Tax name is required"),
  pTaxAmt: z.number().min(0, "Tax amount must be non-negative").max(100, "Tax amount cannot exceed 100%").optional(),
  pTaxDescription: z.string().optional(),
  rActiveYN: z.string(),
  rNotes: z.string().nullable().optional(),
  transferYN: z.string(),
});

type ProductTaxListFormData = z.infer<typeof schema>;

const ProductTaxListForm: React.FC<ProductTaxListFormProps> = ({ open, onClose, initialData, viewOnly = false }) => {
  const { setLoading } = useLoading();
  const { getNextCode, saveProductTax } = useProductTaxList();
  const { showAlert } = useAlert();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const isAddMode = !initialData;

  const defaultValues: ProductTaxListFormData = {
    pTaxID: 0,
    pTaxCode: "",
    pTaxName: "",
    pTaxAmt: 0,
    pTaxDescription: "",
    rActiveYN: "Y",
    rNotes: "",
    transferYN: "N",
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isDirty, isValid },
  } = useForm<ProductTaxListFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const rActiveYN = useWatch({ control, name: "rActiveYN" });
  const pTaxAmt = useWatch({ control, name: "pTaxAmt" });

  const generateTaxCode = async () => {
    if (!isAddMode) return;

    try {
      setIsGeneratingCode(true);
      const nextCode = await getNextCode("TAX", 5);
      if (nextCode) {
        setValue("pTaxCode", nextCode, { shouldValidate: true, shouldDirty: true });
      } else {
        showAlert("Warning", "Failed to generate tax code", "warning");
      }
    } catch (error) {
      console.error("Error generating tax code:", error);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      reset({
        pTaxID: initialData.pTaxID,
        pTaxCode: initialData.pTaxCode || "",
        pTaxName: initialData.pTaxName || "",
        pTaxAmt: initialData.pTaxAmt || 0,
        pTaxDescription: initialData.pTaxDescription || "",
        rActiveYN: initialData.rActiveYN || "Y",
        rNotes: initialData.rNotes || "",
        transferYN: initialData.transferYN || "N",
      });
    } else {
      reset(defaultValues);
      generateTaxCode();
    }
  }, [initialData, reset]);

  const onSubmit = async (data: ProductTaxListFormData) => {
    if (viewOnly) return;

    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      const productTaxData: ProductTaxListDto = {
        pTaxID: data.pTaxID,
        pTaxCode: data.pTaxCode,
        pTaxName: data.pTaxName,
        pTaxAmt: data.pTaxAmt || 0,
        pTaxDescription: data.pTaxDescription || "",
        rActiveYN: data.rActiveYN || "Y",
        rNotes: data.rNotes || "",
        transferYN: data.transferYN || "N",
      };

      const response = await saveProductTax(productTaxData);

      if (response.success) {
        showAlert("Success", isAddMode ? "Product tax created successfully" : "Product tax updated successfully", "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save product tax");
      }
    } catch (error) {
      console.error("Error saving product tax:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save product tax";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const performReset = () => {
    reset(
      initialData
        ? {
            pTaxID: initialData.pTaxID,
            pTaxCode: initialData.pTaxCode || "",
            pTaxName: initialData.pTaxName || "",
            pTaxAmt: initialData.pTaxAmt || 0,
            pTaxDescription: initialData.pTaxDescription || "",
            rActiveYN: initialData.rActiveYN || "Y",
            rNotes: initialData.rNotes || "",
            transferYN: initialData.transferYN || "N",
          }
        : defaultValues
    );
    setFormError(null);

    if (isAddMode) {
      generateTaxCode();
    }
  };

  const handleReset = () => {
    if (isDirty) {
      setShowResetConfirmation(true);
    } else {
      performReset();
    }
  };

  const handleResetConfirm = () => {
    performReset();
    setShowResetConfirmation(false);
  };

  const handleResetCancel = () => {
    setShowResetConfirmation(false);
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowCancelConfirmation(true);
    } else {
      onClose();
    }
  };

  const handleCancelConfirm = () => {
    setShowCancelConfirmation(false);
    onClose();
  };

  const handleCancelCancel = () => {
    setShowCancelConfirmation(false);
  };

  const dialogTitle = viewOnly ? "View Product Tax Details" : isAddMode ? "Create New Product Tax" : `Edit Product Tax - ${initialData?.pTaxName}`;

  const dialogActions = viewOnly ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton text="Cancel" onClick={handleCancel} variant="outlined" color="inherit" disabled={isSaving} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={Cancel} disabled={isSaving || (!isDirty && !formError)} />
        <SmartButton
          text={isAddMode ? "Create Product Tax" : "Update Product Tax"}
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          color="primary"
          icon={Save}
          asynchronous={true}
          showLoadingIndicator={true}
          loadingText={isAddMode ? "Creating..." : "Updating..."}
          successText={isAddMode ? "Created!" : "Updated!"}
          disabled={isSaving || !isValid}
        />
      </Box>
    </Box>
  );

  const handleRefreshCode = () => {
    if (isAddMode) {
      generateTaxCode();
    }
  };

  return (
    <>
      <GenericDialog
        open={open}
        onClose={() => onClose()}
        title={dialogTitle}
        maxWidth="md"
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
            <Grid size={{ sm: 12 }}>
              <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
                <Typography variant="body2" color="text.secondary">
                  Status:
                </Typography>
                <FormField name="rActiveYN" control={control} label="Active" type="switch" disabled={viewOnly} size="small" />
              </Box>
            </Grid>

            {/* Basic Information Section */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField
                        name="pTaxCode"
                        control={control}
                        label="Tax Code"
                        type="text"
                        required
                        disabled={viewOnly || !isAddMode}
                        size="small"
                        fullWidth
                        InputProps={{
                          endAdornment:
                            isAddMode && !viewOnly ? (
                              <InputAdornment position="end">
                                {isGeneratingCode ? (
                                  <CircularProgress size={20} />
                                ) : (
                                  <SmartButton icon={Refresh} variant="text" size="small" onClick={handleRefreshCode} tooltip="Generate new code" sx={{ minWidth: "unset" }} />
                                )}
                              </InputAdornment>
                            ) : null,
                        }}
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="pTaxName" control={control} label="Tax Name" type="text" required disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12 }}>
                      <FormField
                        name="pTaxDescription"
                        control={control}
                        label="Tax Description"
                        type="text"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        placeholder="Brief description of the tax"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Tax Details Section */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tax Settings
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField
                        name="pTaxAmt"
                        control={control}
                        label="Tax Rate (%)"
                        type="number"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        inputProps={{ min: 0, max: 100, step: 0.01 }}
                        placeholder="Enter tax percentage (0-100)"
                      />
                      {pTaxAmt !== undefined && pTaxAmt > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                          Tax rate: {pTaxAmt}%
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Notes Section */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Additional Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12 }}>
                      <FormField
                        name="rNotes"
                        control={control}
                        label="Notes"
                        type="textarea"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        rows={4}
                        placeholder="Enter any additional information about this product tax"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </GenericDialog>

      <ConfirmationDialog
        open={showResetConfirmation}
        onClose={handleResetCancel}
        onConfirm={handleResetConfirm}
        title="Reset Form"
        message="Are you sure you want to reset the form? All unsaved changes will be lost."
        confirmText="Reset"
        cancelText="Cancel"
        type="warning"
        maxWidth="sm"
      />

      <ConfirmationDialog
        open={showCancelConfirmation}
        onClose={handleCancelCancel}
        onConfirm={handleCancelConfirm}
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

export default ProductTaxListForm;
