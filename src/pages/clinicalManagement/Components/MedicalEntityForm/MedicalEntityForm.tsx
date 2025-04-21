// src/components/MedicalEntityForm/MedicalEntityForm.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Grid, Paper, Typography, SelectChangeEvent } from "@mui/material";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import FormField from "@/components/FormField/FormField";
import { useLoading } from "@/context/LoadingContext";
import { useAppSelector } from "@/store/hooks";
import { showAlert } from "@/utils/Common/showAlert";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";
import { createEntityService } from "@/utils/Common/serviceFactory";

interface MedicalEntityFormProps<T extends BaseDto> {
  title: string;
  entityName: string;
  codePrefix: string;
  codeLength: number;
  selectedData?: T;
  initialFormState: T;
  formFields: FormFieldConfig[];
  serviceUrl: string;
  onSaved?: () => void;
  validateForm?: (formData: T) => string | null;
}

interface FormFieldConfig {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "switch" | "radio";
  placeholder?: string;
  isMandatory?: boolean;
  options?: { label: string; value: string }[];
  gridWidth?: number;
  maxLength?: number;
}

export function MedicalEntityForm<T extends BaseDto>({
  title,
  entityName,
  codePrefix,
  codeLength,
  selectedData,
  initialFormState,
  formFields,
  serviceUrl,
  onSaved,
  validateForm,
}: MedicalEntityFormProps<T>) {
  const [formState, setFormState] = useState<T>(initialFormState);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { setLoading } = useLoading();

  // Create service instance
  const entityService = React.useMemo(() => createEntityService<T>(entityName, serviceUrl), [entityName, serviceUrl]);

  const handleClear = useCallback(async () => {
    setLoading(true);
    try {
      const nextCode = await entityService.getNextCode(codePrefix, codeLength);

      // Set the code field based on the entity type
      // This handles the different naming conventions across entities
      if ("icddCode" in initialFormState) (initialFormState as any).icddCode = nextCode.data;
      if ("mFCode" in initialFormState) (initialFormState as any).mFCode = nextCode.data;
      if ("mGenCode" in initialFormState) (initialFormState as any).mGenCode = nextCode.data;
      if ("mFrqCode" in initialFormState) (initialFormState as any).mFrqCode = nextCode.data;
      if ("mDCode" in initialFormState) (initialFormState as any).mDCode = nextCode.data;
      if ("mlCode" in initialFormState) (initialFormState as any).mlCode = nextCode.data;

      setFormState(initialFormState);
      setIsSubmitted(false);
      setIsEditing(false);
    } catch (error) {
      showAlert("Error", `Failed to fetch the next ${entityName} Code.`, "error");
    } finally {
      setLoading(false);
    }
  }, [codePrefix, codeLength, entityService, initialFormState]);

  useEffect(() => {
    if (selectedData) {
      setFormState(selectedData);
      setIsEditing(true);
    } else {
      handleClear();
    }
  }, [selectedData, handleClear]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Add a specific handler for select changes
  const handleSelectChange = useCallback((e: SelectChangeEvent<string>, child: React.ReactNode) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSwitchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormState((prev) => ({ ...prev, [name]: checked ? "Y" : "N" }));
  }, []);

  const handleDefaultChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      if (value === "Y") {
        try {
          const existingDefault = await entityService.find("defaultYN='Y'");

          if (existingDefault.data.length > 0) {
            const entityNameField =
              "mFName" in formState
                ? formState.mFName
                : "mGenName" in formState
                ? formState.mGenName
                : "mDName" in formState
                ? formState.mDName
                : "mFrqName" in formState
                ? formState.mFrqName
                : "icddName" in formState
                ? formState.icddName
                : "this item";

            const confirmed = await new Promise<boolean>((resolve) => {
              showAlert(
                "Confirmation",
                `There are other entries set as default. Setting '${entityNameField}' as the new default will remove default status from other entries. Continue?`,
                "warning",
                {
                  showConfirmButton: true,
                  showCancelButton: true,
                  confirmButtonText: "Yes",
                  cancelButtonText: "No",
                  onConfirm: () => resolve(true),
                  onCancel: () => resolve(false),
                }
              );
            });

            if (!confirmed) {
              return;
            }
            const updatedRecords = existingDefault.data.map((record: T) => ({
              ...record,
              defaultYN: "N",
            }));

            await Promise.all(updatedRecords.map((record: T) => entityService.save(record)));
          }
        } catch (error) {
          showAlert("Error", "Failed to update default status.", "error");
          return;
        }
      }

      setFormState((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    [formState, entityService]
  );

  const handleSave = useCallback(async () => {
    setIsSubmitted(true);

    // Custom validation if provided
    if (validateForm) {
      const validationMessage = validateForm(formState);
      if (validationMessage) {
        showAlert("Error", validationMessage, "error");
        return;
      }
    }

    // Default validation for empty required fields
    let hasError = false;
    formFields.forEach((field) => {
      if (field.isMandatory) {
        const value = formState[field.name as keyof T];
        if (value === undefined || value === null || value === "") {
          hasError = true;
          showAlert("Error", `${field.label} is required.`, "error");
        }
      }
    });

    if (hasError) return;

    setLoading(true);

    try {
      await entityService.save(formState);
      showAlert("Success", `${entityName} ${isEditing ? "updated" : "saved"} successfully!`, "success", {
        onConfirm: () => {
          handleClear();
          if (onSaved) onSaved();
        },
      });
    } catch (error) {
      showAlert("Error", `An unexpected error occurred while ${isEditing ? "updating" : "saving"}.`, "error");
    } finally {
      setLoading(false);
    }
  }, [formState, formFields, entityName, entityService, isEditing, handleClear, onSaved, validateForm]);

  // Helper function to render the appropriate field based on configuration
  const renderField = (field: FormFieldConfig) => {
    const commonProps = {
      label: field.label,
      name: field.name,
      ControlID: field.name,
      isSubmitted,
      size: "small" as const,
      placeholder: field.placeholder || `Enter ${field.label.toLowerCase()}`,
      isMandatory: field.isMandatory,
    };

    switch (field.type) {
      case "text":
        return <FormField {...commonProps} type="text" value={formState[field.name as keyof T] || ""} onChange={handleInputChange} />;
      case "textarea":
        return <FormField {...commonProps} type="textarea" value={formState[field.name as keyof T] || ""} onChange={handleInputChange} maxLength={field.maxLength || 4000} />;
      case "switch":
        const switchValue = formState[field.name as keyof T] as unknown as string;
        return (
          <FormField
            {...commonProps}
            type="switch"
            value={switchValue}
            checked={switchValue === "Y"}
            onChange={handleSwitchChange}
            label={switchValue === "Y" ? `${field.label} (Active)` : `${field.label} (Inactive)`}
          />
        );
      case "radio":
        return (
          <FormField
            {...commonProps}
            type="radio"
            value={formState[field.name as keyof T] as unknown as string}
            onChange={field.name === "defaultYN" ? handleDefaultChange : handleInputChange}
            options={field.options || []}
            inline
          />
        );
      case "select":
        return (
          <FormField {...commonProps} type="select" value={formState[field.name as keyof T] as unknown as string} onChange={handleSelectChange} options={field.options || []} />
        );
      default:
        return null;
    }
  };

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Typography variant="h6" id={`${entityName.toLowerCase()}-details-header`}>
        {title}
      </Typography>
      <Grid container spacing={2}>
        {formFields.map((field) =>
          renderField({
            ...field,
          })
        )}
      </Grid>

      <FormSaveClearButton clearText="Clear" saveText={isEditing ? "Update" : "Save"} onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
    </Paper>
  );
}

export default MedicalEntityForm;
