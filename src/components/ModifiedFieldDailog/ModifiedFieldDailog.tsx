import React, { useState, useEffect, useCallback } from "react";
import { Grid } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import GenericDialog from "../GenericDialog/GenericDialog";
import CustomButton from "../Button/CustomButton";
import FormField from "../FormField/FormField";
import { appModifiedListService } from "../../services/HospitalAdministrationServices/hospitalAdministrationService";
import { showAlert } from "../../utils/Common/showAlert";
import { AppModifyFieldDto } from "@/interfaces/HospitalAdministration/AppModifiedlistDto";
import { useAppSelector } from "@/store/hooks";

interface ModifiedFieldDialogProps {
  open: boolean;
  onClose: (saved?: boolean) => void;
  selectedCategoryCode: string;
  isFieldCodeDisabled?: boolean;
  initialFormData?: Partial<AppModifyFieldDto>;
  onFieldAddedOrUpdated?: () => void;
}

const ModifiedFieldDialog: React.FC<ModifiedFieldDialogProps> = ({
  open,
  onClose,
  selectedCategoryCode,
  isFieldCodeDisabled = true,
  initialFormData = {},
  onFieldAddedOrUpdated,
}) => {
  const [formData, setFormData] = useState<AppModifyFieldDto>({
    amlID: 0,
    amlName: "",
    amlCode: "",
    amlField: selectedCategoryCode,
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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { compID, compCode, compName } = useAppSelector((state) => state.auth);
  useEffect(() => {
    if (open) {
      setFormData((prev) => {
        if (prev.amlField !== selectedCategoryCode || JSON.stringify(prev) !== JSON.stringify({ ...prev, ...initialFormData })) {
          return {
            ...prev,
            amlField: selectedCategoryCode,
            ...initialFormData,
            compID: compID || 0,
            compCode: compCode || "",
            compName: compName || "",
          };
        }
        return prev;
      });

      if (!formData.amlCode) {
        generateFieldCode(selectedCategoryCode);
      }
    }
  }, [open, selectedCategoryCode, initialFormData]);

  const generateFieldCode = useCallback(async (prefix: string) => {
    try {
      const response: any = await appModifiedListService.count(`amlField == "${prefix}"`);
      const fieldsCount = response.data;
      const nextNumber = fieldsCount + 1;
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

  const handleFormSubmit = async () => {
    try {
      setIsSubmitted(true);

      if (!formData.amlName || !formData.amlCode) {
        return;
      }
      if (formData.defaultYN === "Y") {
        const existingFieldsResponse: any = await appModifiedListService.getAll();
        const fieldsData = existingFieldsResponse.data || existingFieldsResponse;
        const fieldsToUpdate = fieldsData.filter(
          (field: AppModifyFieldDto) => field.defaultYN === "Y" && field.amlField === selectedCategoryCode && field.amlID !== formData.amlID
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
        onClose(true);
      } else {
        showAlert("Error", "Failed to save field", "error");
        onClose(false);
      }
    } catch (error) {
      console.error("Error saving:", error);
      onClose(false);
    }
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    onClose(false);
    setIsSubmitted(false);
  };

  return (
    <GenericDialog
      open={open}
      onClose={handleClose}
      title={formData.amlID ? "Edit Field" : "Add New Field"}
      actions={
        <>
          <CustomButton onClick={handleClose} icon={DeleteIcon} text="Cancel" variant="contained" color="error" sx={{ marginRight: 2 }} />
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
          // disabled={isFieldCodeDisabled}
        />
        <FormField
          type="text"
          label="Field Name"
          name="amlName"
          value={formData.amlName}
          onChange={(e) => setFormData((prev) => ({ ...prev, amlName: e.target.value }))}
          ControlID="amlName"
          isMandatory={true}
          isSubmitted={isSubmitted}
          gridProps={{ xs: 12 }}
          fullWidth
        />
        <FormField
          type="text"
          label="Field"
          name="amlField"
          value={selectedCategoryCode}
          onChange={() => {}}
          disabled={true}
          ControlID="amlField"
          isSubmitted={isSubmitted}
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
