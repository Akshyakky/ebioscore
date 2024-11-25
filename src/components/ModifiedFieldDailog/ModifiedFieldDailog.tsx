import React, { useState, useEffect, useCallback } from "react";
import { Grid } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import GenericDialog from "../GenericDialog/GenericDialog";
import CustomButton from "../Button/CustomButton";
import FormField from "../FormField/FormField";
import { appModifiedListService } from "../../services/HospitalAdministrationServices/hospitalAdministrationService";
import { showAlert } from "../../utils/Common/showAlert";
import { AppModifyFieldDto } from "@/interfaces/hospitalAdministration/AppModifiedlistDto";

interface ModifiedFieldDialogProps {
  open: boolean;
  onClose: () => void;
  selectedCategoryName: string;
  isFieldCodeDisabled?: boolean;
  initialFormData?: Partial<AppModifyFieldDto>;
  onFieldAddedOrUpdated?: () => void;
}

const ModifiedFieldDialog: React.FC<ModifiedFieldDialogProps> = ({
  open,
  onClose,
  selectedCategoryName,
  isFieldCodeDisabled = true,
  initialFormData = {},
  onFieldAddedOrUpdated,
}) => {
  const [formData, setFormData] = useState<AppModifyFieldDto>({
    amlID: 0,
    amlName: "",
    amlCode: "",
    amlField: selectedCategoryName,
    defaultYN: "N",
    modifyYN: "N",
    rNotes: "",
    rActiveYN: "Y",
    compID: 0,
    compCode: "",
    compName: "",
    transferYN: "Y",
    ...initialFormData,
  });

  useEffect(() => {
    if (open) {
      setFormData((prev) => {
        if (prev.amlField !== selectedCategoryName || JSON.stringify(prev) !== JSON.stringify({ ...prev, ...initialFormData })) {
          return {
            ...prev,
            amlField: selectedCategoryName,
            ...initialFormData,
          };
        }
        return prev;
      });

      if (!formData.amlCode) {
        generateFieldCode(selectedCategoryName);
      }
    }
  }, [open, selectedCategoryName, initialFormData]);

  const generateFieldCode = useCallback(async (prefix: string) => {
    try {
      const response: any = await appModifiedListService.getAll();
      const fieldsData = response.data || response;
      const highestNumber = getHighestExistingCode(prefix, fieldsData);
      const nextNumber = highestNumber + 1;
      const formattedCounter = nextNumber.toString().padStart(2, "0");
      const newCode = `${prefix}${formattedCounter}`;

      setFormData((prev) => ({
        ...prev,
        amlCode: newCode,
      }));
      return newCode;
    } catch (error) {
      showAlert("Error", "An error occurred while generating the field code", "error");
      return null;
    }
  }, []);

  const getHighestExistingCode = (categoryName: string, fields: AppModifyFieldDto[]): number => {
    const categoryFields = fields.filter((field) => field.amlField === categoryName);
    let highestNumber = 0;

    categoryFields.forEach((field) => {
      const codeMatch = field.amlCode.match(/\d+$/);
      if (codeMatch) {
        const number = parseInt(codeMatch[0]);
        highestNumber = Math.max(highestNumber, number);
      }
    });
    return highestNumber;
  };

  const handleFormSubmit = async () => {
    try {
      if (!formData.amlName || !formData.amlCode) {
        showAlert("Error", "Field Name and Field Code cannot be empty", "error");
        return;
      }
      if (formData.defaultYN === "Y") {
        const existingFieldsResponse: any = await appModifiedListService.getAll();
        const fieldsData = existingFieldsResponse.data || existingFieldsResponse;
        const fieldsToUpdate = fieldsData.filter(
          (field: AppModifyFieldDto) => field.defaultYN === "Y" && field.amlField === selectedCategoryName && field.amlID !== formData.amlID
        );
        if (fieldsToUpdate.length > 0) {
          const confirmed = await new Promise<boolean>((resolve) => {
            showAlert(
              "Confirmation",
              `There are other entries set as default. Setting '${formData.amlName}' as the new default will remove default status from other entries. Continue?`,
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
          for (const field of fieldsToUpdate) {
            const updatedField = { ...field, defaultYN: "N" };
            await appModifiedListService.save(updatedField);
          }
        }
      }

      const response = await appModifiedListService.save(formData);
      if (response) {
        showAlert("Success", "Field saved successfully", "success");
        if (onFieldAddedOrUpdated) {
          onFieldAddedOrUpdated();
        }
        setFormData((prev) => ({
          ...prev,
          amlName: "",
          amlCode: "",
        }));
        onClose();
      } else {
        showAlert("Error", "Failed to save field", "error");
      }
    } catch (error) {
      showAlert("Error", "An error occurred while saving the field", "error");
    }
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title={formData.amlID ? "Edit Field" : "Add New Field"}
      actions={
        <>
          <CustomButton onClick={onClose} icon={DeleteIcon} text="Cancel" variant="contained" color="error" sx={{ marginRight: 2 }} />
          <CustomButton icon={SaveIcon} text="Save" onClick={handleFormSubmit} variant="contained" color="success" />
        </>
      }
    >
      <Grid container spacing={2}>
        <FormField
          type="text"
          label="Field Code"
          name="amlCode"
          value={formData.amlCode}
          onChange={(e) => setFormData((prev) => ({ ...prev, amlCode: e.target.value }))}
          ControlID="amlCode"
          isMandatory={true}
          gridProps={{ xs: 12 }}
          fullWidth
          disabled={isFieldCodeDisabled}
        />
        <FormField
          type="text"
          label="Field Name"
          name="amlName"
          value={formData.amlName}
          onChange={(e) => setFormData((prev) => ({ ...prev, amlName: e.target.value }))}
          ControlID="amlName"
          isMandatory={true}
          gridProps={{ xs: 12 }}
          fullWidth
        />
        <FormField
          type="text"
          label="Field"
          name="amlField"
          value={selectedCategoryName}
          onChange={() => {}}
          disabled={true}
          ControlID="amlField"
          isMandatory={true}
          gridProps={{ xs: 12 }}
          fullWidth
        />
      </Grid>
      <Grid>
        <FormField
          type="radio"
          label="Default"
          name="defaultYN"
          value={formData.defaultYN}
          onChange={handleFieldChange}
          options={[
            { value: "Y", label: "Yes" },
            { value: "N", label: "No" },
          ]}
          ControlID="defaultYN"
          gridProps={{ xs: 12 }}
          inline={true}
        />
        <FormField
          type="radio"
          label="Modifiable"
          name="modifyYN"
          value={formData.modifyYN}
          onChange={handleFieldChange}
          options={[
            { value: "Y", label: "Yes" },
            { value: "N", label: "No" },
          ]}
          ControlID="modifyYN"
          gridProps={{ xs: 12 }}
          inline={true}
        />
      </Grid>
    </GenericDialog>
  );
};

export default ModifiedFieldDialog;
