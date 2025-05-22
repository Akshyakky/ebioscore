import React, { useState, useCallback, useMemo } from "react";
import { Grid, Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import GenericDialog from "../GenericDialog/GenericDialog";
import SmartButton from "../Button/SmartButton";
import EnhancedFormField from "../EnhancedFormField/EnhancedFormField";
import ConfirmationDialog from "../Dialog/ConfirmationDialog";
import { appModifiedListService } from "../../services/HospitalAdministrationServices/hospitalAdministrationService";
import { showAlert } from "../../utils/Common/showAlert";
import { AppModifyFieldDto } from "@/interfaces/HospitalAdministration/AppModifiedListDto";

interface ModifiedFieldDialogProps {
  open: boolean;
  onClose: (saved?: boolean) => void;
  selectedCategoryCode: string;
  isFieldCodeDisabled?: boolean;
  initialFormData?: Partial<AppModifyFieldDto>;
  onFieldAddedOrUpdated?: () => void;
}

// Zod validation schema
const formSchema = z.object({
  amlCode: z
    .string()
    .min(1, "Field Code is required")
    .min(3, "Field Code must be at least 3 characters")
    .max(10, "Field Code cannot exceed 10 characters")
    .regex(/^[A-Z0-9]+$/, "Field Code must contain only uppercase letters and numbers"),
  amlName: z.string().min(1, "Field Name is required").min(2, "Field Name must be at least 2 characters").max(100, "Field Name cannot exceed 100 characters").trim(),
  amlField: z.string().min(1, "Field is required"),
  defaultYN: z.enum(["Y", "N"], {
    required_error: "Default selection is required",
  }),
  modifyYN: z.enum(["Y", "N"], {
    required_error: "Modifiable selection is required",
  }),
  rNotes: z.string().max(500, "Notes cannot exceed 500 characters").optional().or(z.literal("")),
  rActiveYN: z.enum(["Y", "N"]),
  transferYN: z.enum(["Y", "N"]),
});

// Type inference from Zod schema
type FormData = z.infer<typeof formSchema>;

const ModifiedFieldDialog: React.FC<ModifiedFieldDialogProps> = ({
  open,
  onClose,
  selectedCategoryCode,
  isFieldCodeDisabled = true,
  initialFormData = {},
  onFieldAddedOrUpdated,
}) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Memoized default values based on props
  const defaultValues = useMemo(
    (): FormData => ({
      amlCode: initialFormData.amlCode || "",
      amlName: initialFormData.amlName || "",
      amlField: selectedCategoryCode,
      defaultYN: initialFormData.defaultYN || "N",
      modifyYN: initialFormData.modifyYN || "N",
      rNotes: initialFormData.rNotes || "",
      rActiveYN: initialFormData.rActiveYN || "Y",
      transferYN: initialFormData.transferYN || "Y",
    }),
    [initialFormData, selectedCategoryCode]
  );

  // React Hook Form setup with Zod resolver
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues,
  });

  const generateFieldCode = useCallback(
    async (prefix: string) => {
      try {
        const response: any = await appModifiedListService.count(`amlField == "${prefix}"`);
        const fieldsCount = response.data;
        const nextNumber = fieldsCount + 1;
        const formattedCounter = nextNumber.toString().padStart(2, "0");
        const newCode = `${prefix}${formattedCounter}`;

        setValue("amlCode", newCode);
        return newCode;
      } catch (error) {
        showAlert("Error", "An error occurred while generating the field code", "error");
        return null;
      }
    },
    [setValue]
  );

  // Handle dialog opening - replaces useEffect logic
  const handleDialogEntered = useCallback(async () => {
    if (!open) return;

    // Reset form with current default values
    reset(defaultValues);

    // Generate field code if not provided (for new entries)
    if (!initialFormData.amlCode && !initialFormData.amlID) {
      await generateFieldCode(selectedCategoryCode);
    }
  }, [open, defaultValues, reset, generateFieldCode, initialFormData.amlCode, initialFormData.amlID, selectedCategoryCode]);

  const handleFormSubmit = async (data: FormData): Promise<void> => {
    try {
      setIsSubmitted(true);

      // Check if defaultYN is being set to 'Y' and handle conflicts
      if (data.defaultYN === "Y") {
        const existingFieldsResponse: any = await appModifiedListService.getAll();
        const fieldsData = existingFieldsResponse.data || existingFieldsResponse;
        const fieldsToUpdate = fieldsData.filter(
          (field: AppModifyFieldDto) => field.defaultYN === "Y" && field.amlField === selectedCategoryCode && field.amlID !== (initialFormData.amlID || 0)
        );

        if (fieldsToUpdate.length > 0) {
          // Show confirmation dialog
          setConfirmDialogConfig({
            title: "Confirmation Required",
            message: `There are other entries set as default. Setting '${data.amlName}' as the new default will remove default status from other entries. Continue?`,
            onConfirm: async () => {
              setShowConfirmDialog(false);
              await saveFieldWithDefaults(data, fieldsToUpdate);
            },
          });
          setShowConfirmDialog(true);
          return;
        }
      }

      // Save without default conflicts
      await saveField(data);
    } catch (error) {
      console.error("Error saving:", error);
      showAlert("Error", "An error occurred while saving the field", "error");
    } finally {
      setIsSubmitted(false);
    }
  };

  const saveFieldWithDefaults = async (data: FormData, fieldsToUpdate: AppModifyFieldDto[]) => {
    try {
      // Update existing default fields to 'N'
      for (const field of fieldsToUpdate) {
        const updatedField = { ...field, defaultYN: "N" as const };
        await appModifiedListService.save(updatedField);
      }

      // Save the new field
      await saveField(data);
    } catch (error) {
      console.error("Error updating default fields:", error);
      showAlert("Error", "An error occurred while updating default settings", "error");
    }
  };

  const saveField = async (data: FormData) => {
    try {
      const fieldData: AppModifyFieldDto = {
        amlID: initialFormData.amlID || 0,
        ...(data as AppModifyFieldDto),
      };

      const response = await appModifiedListService.save(fieldData);

      if (response) {
        showAlert("Success", "Field saved successfully", "success");

        if (onFieldAddedOrUpdated) {
          onFieldAddedOrUpdated();
        }

        handleClose(true);
      } else {
        showAlert("Error", "Failed to save field", "error");
        handleClose(false);
      }
    } catch (error) {
      console.error("Error saving field:", error);
      showAlert("Error", "Failed to save field", "error");
      handleClose(false);
    }
  };

  const handleClose = useCallback(
    (saved: boolean = false) => {
      onClose(saved);
      setIsSubmitted(false);
      setShowConfirmDialog(false);
    },
    [onClose]
  );

  const handleCancel = useCallback(() => {
    handleClose(false);
  }, [handleClose]);

  // Handle dialog opening with proper form initialization
  const handleDialogOpen = useCallback(() => {
    if (open) {
      handleDialogEntered();
    }
  }, [open, handleDialogEntered]);

  return (
    <>
      <GenericDialog
        open={open}
        onClose={() => handleClose(false)}
        TransitionProps={{
          onEntered: handleDialogEntered,
        }}
        title={initialFormData.amlID ? "Edit Field" : "Add New Field"}
        maxWidth="sm"
        actions={
          <Box sx={{ display: "flex", gap: 2 }}>
            <SmartButton icon={DeleteIcon} text="Cancel" variant="contained" color="error" onClick={handleCancel} />
            <SmartButton
              icon={SaveIcon}
              text="Save"
              variant="contained"
              color="success"
              asynchronous
              onAsyncClick={() => handleSubmit(handleFormSubmit)()}
              loadingText="Saving..."
              successText="Saved!"
              showLoadingIndicator
              showSuccessState
              successDuration={1500}
            />
          </Box>
        }
      >
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <EnhancedFormField
                type="text"
                name="amlCode"
                control={control}
                label="Field Code"
                required
                disabled={isFieldCodeDisabled}
                isSubmitted={isSubmitted}
                helperText="Field code must be uppercase letters and numbers only"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <EnhancedFormField
                type="text"
                name="amlName"
                control={control}
                label="Field Name"
                required
                isSubmitted={isSubmitted}
                helperText="Enter a descriptive name for this field"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <EnhancedFormField
                type="text"
                name="amlField"
                control={control}
                label="Field"
                disabled
                required
                isSubmitted={isSubmitted}
                helperText="This field is automatically set based on the selected category"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <EnhancedFormField
                type="radio"
                name="defaultYN"
                control={control}
                label="Default"
                options={[
                  { value: "Y", label: "Yes" },
                  { value: "N", label: "No" },
                ]}
                row
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <EnhancedFormField
                type="radio"
                name="modifyYN"
                control={control}
                label="Modifiable"
                options={[
                  { value: "Y", label: "Yes" },
                  { value: "N", label: "No" },
                ]}
                row
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <EnhancedFormField type="textarea" name="rNotes" control={control} label="Notes" rows={3} helperText="Optional notes about this field" />
            </Grid>
          </Grid>
        </form>
      </GenericDialog>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={confirmDialogConfig.onConfirm}
        title={confirmDialogConfig.title}
        message={confirmDialogConfig.message}
        type="warning"
        confirmText="Yes, Continue"
        cancelText="Cancel"
      />
    </>
  );
};

export default ModifiedFieldDialog;
