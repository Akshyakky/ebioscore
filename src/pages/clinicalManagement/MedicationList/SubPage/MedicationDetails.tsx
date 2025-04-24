// src/pages/clinicalManagement/MedicationList/SubPage/MedicationDetails.tsx
import React, { useEffect, useState } from "react";
import { MedicalEntityForm } from "../../Components/MedicalEntityForm/MedicalEntityForm";
import { MedicationListDto } from "@/interfaces/ClinicalManagement/MedicationListDto";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { SelectChangeEvent } from "@mui/material";

interface MedicationListDetailsProps {
  selectedData?: MedicationListDto;
}

const MedicationListDetails: React.FC<MedicationListDetailsProps> = ({ selectedData }) => {
  // Fetch dropdown values for medication forms and generics
  const dropdownValues = useDropdownValues(["medicationForm", "medicationGeneric"]);

  // Local state to track the dropdown values (needed to properly initialize the form)
  const [dropdownFormOptions, setDropdownFormOptions] = useState<{ label: string; value: string }[]>([]);
  const [dropdownGenericOptions, setDropdownGenericOptions] = useState<{ label: string; value: string }[]>([]);

  // State to store the current form values
  const [formState, setFormState] = useState<MedicationListDto>({
    mlID: 0,
    mlCode: "",
    mGrpID: 0,
    mfID: 0,
    mfName: "",
    medText: "",
    medText1: "",
    mGenID: 0,
    mGenCode: "",
    mGenName: "",
    productID: 0,
    calcQtyYN: "N",
    rActiveYN: "Y",
    compID: 0,
    compCode: "",
    compName: "",
  });

  // Process dropdown options after they're loaded
  useEffect(() => {
    if (dropdownValues.medicationForm && dropdownValues.medicationForm.length > 0) {
      setDropdownFormOptions(dropdownValues.medicationForm);
    }
    if (dropdownValues.medicationGeneric && dropdownValues.medicationGeneric.length > 0) {
      setDropdownGenericOptions(dropdownValues.medicationGeneric);
    }
  }, [dropdownValues.medicationForm, dropdownValues.medicationGeneric]);

  const initialFormState: MedicationListDto = {
    mlID: 0,
    mlCode: "",
    mGrpID: 0,
    mfID: 0,
    mfName: "",
    medText: "",
    medText1: "",
    mGenID: 0,
    mGenCode: "",
    mGenName: "",
    productID: null,
    calcQtyYN: "N",
    rActiveYN: "Y",
    compID: 0,
    compCode: "",
    compName: "",
  };

  // Custom handlers for select changes to update both ID and Name fields
  const handleMedicationFormChange = (e: SelectChangeEvent<string>) => {
    const selectedId = Number(e.target.value);
    // Find the selected form in the options to get the name
    const selectedForm = dropdownFormOptions.find((option) => Number(option.value) === selectedId);

    return {
      mfID: selectedId,
      mfName: selectedForm?.label || "",
    };
  };

  const handleGenericNameChange = (e: SelectChangeEvent<string>) => {
    const selectedId = Number(e.target.value);
    // Find the selected generic in the options to get the name
    const selectedGeneric = dropdownGenericOptions.find((option) => Number(option.value) === selectedId);

    return {
      mGenID: selectedId,
      mGenName: selectedGeneric?.label || "",
      mGenCode: "", // You might want to fetch this if available in your options
    };
  };

  const formFields = [
    {
      name: "mlCode",
      label: "Medication Code",
      type: "text" as const,
      placeholder: "Enter medication code",
      isMandatory: true,
      gridWidth: 4,
    },
    {
      name: "medText",
      label: "Medication Name",
      type: "text" as const,
      placeholder: "Enter medication Name",
      isMandatory: true,
      gridWidth: 4,
    },
    {
      name: "mfID",
      label: "Medication Form",
      type: "select" as const,
      options: dropdownFormOptions,
      gridWidth: 4,
      customHandler: handleMedicationFormChange,
    },
    {
      name: "mGenID",
      label: "Generic Name",
      type: "select" as const,
      options: dropdownGenericOptions,
      gridWidth: 4,
      customHandler: handleGenericNameChange,
    },
    {
      name: "calcQtyYN",
      label: "Calculate Quantity",
      type: "switch" as const,
      gridWidth: 4,
    },
    {
      name: "rActiveYN",
      label: "Active",
      type: "switch" as const,
      gridWidth: 4,
    },
  ];

  const validateForm = (formData: MedicationListDto): string | null => {
    if (!formData.mlCode.trim() || !formData.medText) {
      return "Medication Code and Name are mandatory.";
    }

    if (formData.mfID > 0 && !formData.mfName) {
      return "Medication Form Name must not be empty.";
    }

    if (formData.mGenID > 0 && !formData.mGenName) {
      return "Generic Name must not be empty.";
    }

    return null;
  };

  // Any additional actions needed after saving
  const onSaved = () => {};

  return (
    <MedicalEntityForm
      title="MEDICATION LIST DETAILS"
      entityName="MedicationList"
      codePrefix="MED"
      codeLength={3}
      selectedData={selectedData}
      initialFormState={initialFormState}
      formFields={formFields}
      serviceUrl="clinicalManagementURL"
      validateForm={validateForm}
      onSaved={onSaved}
    />
  );
};

export default MedicationListDetails;
