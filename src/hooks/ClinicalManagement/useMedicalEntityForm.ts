// src/hooks/useMedicalEntityForm.ts
import { useState, useCallback, useEffect } from "react";
import { useLoading } from "@/hooks/Common/useLoading";
import { useAlert } from "@/providers/AlertProvider";
import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";
import { createEntityService } from "@/utils/Common/serviceFactory";

interface UseMedicalEntityFormParams<T extends BaseDto> {
  entityName: string;
  serviceUrl: string;
  initialState: T;
  codePrefix: string;
  codeLength: number;
  selectedData?: T;
  onSaved?: () => void;
  validateForm?: (data: T) => string | null;
}

export function useMedicalEntityForm<T extends BaseDto>({
  entityName,
  serviceUrl,
  initialState,
  codePrefix,
  codeLength,
  selectedData,
  onSaved,
  validateForm,
}: UseMedicalEntityFormParams<T>) {
  const [formState, setFormState] = useState<T>(initialState);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();

  const entityService = createEntityService<T>(entityName, serviceUrl);

  const handleClear = useCallback(async () => {
    setLoading(true);
    try {
      const nextCode = await entityService.getNextCode(codePrefix, codeLength);

      // Create a new state with next code
      const newState = {
        ...initialState,
      } as T;

      // Set code field based on entity
      const codeField = Object.keys(initialState).find((key) => key.toLowerCase().includes("code"));
      if (codeField) {
        (newState as any)[codeField] = nextCode.data;
      }

      setFormState(newState);
      setIsSubmitted(false);
      setIsEditing(false);
    } catch (error) {
      showAlert("Error", `Failed to fetch the next ${entityName} Code.`, "error");
    } finally {
      setLoading(false);
    }
  }, [entityService, initialState, codePrefix, codeLength]);

  // Initialize form or set from selected data
  useEffect(() => {
    if (selectedData) {
      setFormState(selectedData);
      setIsEditing(true);
    } else {
      handleClear();
    }
  }, [selectedData, handleClear]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Handle boolean switch change
  const handleSwitchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormState((prev) => ({ ...prev, [name]: checked ? "Y" : "N" }));
  }, []);

  // Handle default flag change with confirmation
  const handleDefaultChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      if (value === "Y") {
        try {
          const existingDefaults = await entityService.find("defaultYN='Y'");

          if ((existingDefaults.data ?? []).length > 0) {
            // Get display name based on entity type
            let displayName = "this item";
            if ("name" in formState) {
              displayName = (formState as any).name;
            } else if ("icddName" in formState) {
              displayName = (formState as any).icddName;
            } else {
              // Find any field with 'name' in it
              const nameField = Object.keys(formState).find((key) => key.toLowerCase().includes("name"));
              if (nameField) {
                displayName = (formState as any)[nameField];
              }
            }

            const confirmed = await new Promise<boolean>((resolve) => {
              showAlert(
                "Confirmation",
                `There are other entries set as default. Setting '${displayName}' as the new default will remove default status from other entries. Continue?`,
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

            if (!confirmed) return;

            // Update all existing defaults to non-default
            const updates = (existingDefaults.data ?? []).map((item: T) => ({
              ...item,
              defaultYN: "N",
            }));

            await Promise.all(updates.map((item: T) => entityService.save(item)));
          }

          setFormState((prev) => ({ ...prev, [name]: value }));
        } catch (error) {
          showAlert("Error", "Failed to update default settings.", "error");
        }
      } else {
        setFormState((prev) => ({ ...prev, [name]: value }));
      }
    },
    [entityService, formState]
  );

  // Save form data
  const handleSave = useCallback(async () => {
    setIsSubmitted(true);

    // Run custom validation if provided
    if (validateForm) {
      const validationError = validateForm(formState);
      if (validationError) {
        showAlert("Error", validationError, "error");
        return;
      }
    }

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
      showAlert("Error", `Failed to save ${entityName}.`, "error");
    } finally {
      setLoading(false);
    }
  }, [formState, entityService, isEditing, validateForm, handleClear, onSaved, entityName]);

  return {
    formState,
    setFormState,
    isSubmitted,
    isEditing,
    handleInputChange,
    handleSwitchChange,
    handleDefaultChange,
    handleSave,
    handleClear,
  };
}
