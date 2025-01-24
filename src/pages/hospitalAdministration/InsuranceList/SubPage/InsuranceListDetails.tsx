import React, { useState, useCallback, useEffect } from "react";
import { Paper, Typography, Grid } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLoading } from "../../../../context/LoadingContext";
import { showAlert } from "../../../../utils/Common/showAlert";
import FormField from "../../../../components/FormField/FormField";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import useDropdownValues from "../../../../hooks/PatientAdminstration/useDropdownValues";
import { insuranceListService } from "../../../../services/HospitalAdministrationServices/hospitalAdministrationService";
import useFieldsList from "../../../../components/FieldsList/UseFieldsList";
import ModifiedFieldDialog from "../../../../components/ModifiedFieldDailog/ModifiedFieldDailog";
import { useAppSelector } from "@/store/hooks";
import { InsuranceListDto } from "@/interfaces/HospitalAdministration/InsuranceListDto";
import { AppModifyFieldDto } from "@/interfaces/HospitalAdministration/AppModifiedlistDto";

const InsuranceDetails: React.FC<{ editData?: InsuranceListDto }> = ({ editData }) => {
  const [formState, setFormState] = useState<InsuranceListDto>({
    insurID: 0,
    insurCode: "",
    insurName: "",
    insurStreet: "",
    insurStreet1: "",
    insurCity: "",
    insurState: "",
    insurCountry: "",
    insurPostCode: "",
    insurContact1: "",
    insurContact2: "",
    insurPh1: "",
    insurPh2: "",
    insurEmail: "",
    inCategory: "",
    rActiveYN: "Y",
    rNotes: "",
    compID: 0,
    compCode: "",
    compName: "",
    transferYN: "Y",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const { handleDropdownChange } = useDropdownChange<InsuranceListDto>(setFormState);
  const dropdownValues = useDropdownValues(["category", "city", "state", "nationality"]);
  const { fieldsList, defaultFields } = useFieldsList(["category", "city", "state", "nationality"]);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [dialogCategory, setDialogCategory] = useState<string>("");
  const { setLoading } = useLoading();
  const { compID, compCode, compName } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (editData) {
      setFormState(editData);
    } else {
      handleClear();
    }
  }, [editData]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "insurPh1" || name === "insurContact1" || name === "insurContact2") {
      const validatedValue = value.replace(/[^0-9+]/g, "");
      setFormState((prev) => ({ ...prev, [name]: validatedValue }));
    } else {
      setFormState((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleSave = async () => {
    setIsSubmitted(true);
    if (!formState.insurCode.trim() || !formState.insurName.trim()) {
      showAlert("Error", "Insurance Code and Name are mandatory.", "error");
      return;
    }
    setLoading(true);

    try {
      const result = await insuranceListService.save(formState);

      if (result.success) {
        showAlert("Success", "Insurance details saved successfully!", "success", {
          onConfirm: handleClear,
        });
      } else {
        showAlert("Error", result.errorMessage || "Failed to save Insurance details.", "error");
      }
    } catch (error) {
      console.error("Error saving Insurance details:", error);
      showAlert("Error", "An unexpected error occurred while saving Insurance List", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = useCallback(() => {
    setFormState({
      insurID: 0,
      insurCode: "",
      insurName: "",
      insurStreet: "",
      insurStreet1: "",
      insurCity: "",
      insurState: "",
      insurCountry: "",
      insurPostCode: "",
      insurContact1: "",
      insurContact2: "",
      insurPh1: "",
      insurPh2: "",
      insurEmail: "",
      inCategory: "",
      rActiveYN: "Y",
      rNotes: "",
      compID: compID || 0,
      compCode: compCode || "",
      compName: compName || "",
      transferYN: "Y",
    });
    setIsSubmitted(false);
  }, [compID, compCode, compName]);

  const handleActiveToggle = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({
      ...prev,
      rActiveYN: event.target.checked ? "Y" : "N",
    }));
  }, []);

  const [, setFormDataDialog] = useState<AppModifyFieldDto>({
    amlID: 0,
    amlName: "",
    amlCode: "",
    amlField: "",
    defaultYN: "N",
    modifyYN: "N",
    rNotes: "",
    rActiveYN: "Y",
    compID: 0,
    compCode: "",
    compName: "",
    transferYN: "Y",
  });

  const handleAddField = (categories: string) => {
    setDialogCategory(categories);
    setFormDataDialog({
      amlID: 0,
      amlName: "",
      amlCode: "",
      amlField: categories,
      defaultYN: "N",
      modifyYN: "N",
      rNotes: "",
      rActiveYN: "Y",
      compID: 0,
      compCode: "",
      compName: "",
      transferYN: "Y",
    });
    setIsFieldDialogOpen(true);
  };

  const handleFieldDialogClose = () => {
    setIsFieldDialogOpen(false);
  };

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Typography variant="h6" id="insurance-details-header">
        Insurance Details
      </Typography>
      <Grid container spacing={2}>
        <FormField
          type="text"
          label="Insurance Code"
          value={formState.insurCode}
          onChange={handleInputChange}
          name="insurCode"
          ControlID="insurCode"
          placeholder="Insurance Code"
          maxLength={25}
          isMandatory={true}
          isSubmitted={isSubmitted}
        />
        <FormField
          type="text"
          label="Insurance Name"
          value={formState.insurName}
          onChange={handleInputChange}
          name="insurName"
          ControlID="insurName"
          placeholder="Insurance Name"
          maxLength={50}
          isMandatory={true}
          isSubmitted={isSubmitted}
        />

        <FormField
          type="select"
          label="Category"
          name="inCategory"
          value={formState.inCategory || ""}
          onChange={handleDropdownChange([""], ["inCategory"], dropdownValues.category)}
          options={dropdownValues.category}
          ControlID="inCategory"
          placeholder="Category"
          maxLength={50}
        />

        <FormField type="text" label="Mobile" value={formState.insurPh1} onChange={handleInputChange} name="insurPh1" ControlID="insurPh1" placeholder="Phone 1" maxLength={20} />
        <FormField type="text" label="Fax" value={formState.insurPh2} onChange={handleInputChange} name="insurPh2" ControlID="insurPh2" placeholder="Phone 2" maxLength={20} />
        <FormField
          type="email"
          label="Email"
          value={formState.insurEmail}
          onChange={handleInputChange}
          name="insurEmail"
          ControlID="insurEmail"
          placeholder="Email"
          maxLength={100}
        />

        <FormField
          type="text"
          label="Contact 1"
          value={formState.insurContact1}
          onChange={handleInputChange}
          name="insurContact1"
          ControlID="insurContact1"
          placeholder="Contact 1"
          maxLength={50}
        />
        <FormField
          type="text"
          label="Contact 2"
          value={formState.insurContact2}
          onChange={handleInputChange}
          name="insurContact2"
          ControlID="insurContact2"
          placeholder="Contact 2"
          maxLength={50}
        />

        <FormField
          type="text"
          label="Postal Code"
          value={formState.insurPostCode}
          onChange={handleInputChange}
          name="insurPostCode"
          ControlID="insurPostCode"
          placeholder="Postal Code"
          maxLength={20}
        />

        <FormField
          type="select"
          label="City"
          value={formState.insurCity || defaultFields.city}
          onChange={handleDropdownChange([""], ["insurCity"], fieldsList.city)}
          options={fieldsList.city}
          name="insurCity"
          ControlID="insurCity"
          placeholder="City"
          maxLength={50}
          showAddButton={true}
          onAddClick={() => handleAddField("city")}
        />
        <FormField
          type="select"
          label="State"
          value={formState.insurState || defaultFields.state}
          onChange={handleDropdownChange([""], ["insurState"], fieldsList.state)}
          options={fieldsList.state}
          name="insurState"
          ControlID="insurState"
          placeholder="State"
          maxLength={50}
          showAddButton={true}
          onAddClick={() => handleAddField("state")}
        />

        <FormField
          type="select"
          label="Country"
          value={formState.insurCountry || defaultFields.nationality}
          onChange={handleDropdownChange([""], ["insurCountry"], fieldsList.nationality)}
          options={fieldsList.nationality}
          name="insurCountry"
          ControlID="insurCountry"
          placeholder="Country"
          maxLength={50}
          showAddButton={true}
          onAddClick={() => handleAddField("nationality")}
        />
      </Grid>

      <Grid container spacing={2}>
        <FormField
          type="textarea"
          label="Street"
          value={formState.insurStreet}
          onChange={handleInputChange}
          name="insurStreet"
          ControlID="insurStreet"
          placeholder="Street"
          maxLength={100}
        />
        <FormField type="textarea" label="Remarks" value={formState.rNotes} onChange={handleInputChange} name="rNotes" ControlID="rNotes" placeholder="Remarks" maxLength={4000} />
      </Grid>
      <Grid container spacing={2}>
        <FormField
          type="switch"
          label={formState.rActiveYN === "Y" ? "Active" : "Inactive"}
          value={formState.rActiveYN}
          checked={formState.rActiveYN === "Y"}
          onChange={handleActiveToggle}
          name="rActiveYN"
          ControlID="rActiveYN"
          size="medium"
        />
        <ModifiedFieldDialog open={isFieldDialogOpen} onClose={handleFieldDialogClose} selectedCategoryName={dialogCategory} isFieldCodeDisabled={true} />
      </Grid>
      <FormSaveClearButton clearText="Clear" saveText="Save" onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
    </Paper>
  );
};

export default InsuranceDetails;
