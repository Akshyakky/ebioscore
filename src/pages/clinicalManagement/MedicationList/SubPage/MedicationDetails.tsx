// src/pages/clinicalManagement/MedicationList/SubPage/MedicationDetails.tsx
import React, { useEffect, useState } from "react";
import { MedicalEntityForm } from "../../Components/MedicalEntityForm/MedicalEntityForm";
import { MedicationListDto } from "@/interfaces/ClinicalManagement/MedicationListDto";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";

interface MedicationListDetailsProps {
  selectedData?: MedicationListDto;
}

const MedicationListDetails: React.FC<MedicationListDetailsProps> = ({ selectedData }) => {
  // Fetch dropdown values for medication forms and generics
  const dropdownValues = useDropdownValues(["medicationForm", "medicationGeneric"]);

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
    productID: 0,
    calcQtyYN: "N",
    rActiveYN: "Y",
    compID: 0,
    compCode: "",
    compName: "",
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
      options: dropdownValues.medicationForm,
      gridWidth: 4,
    },
    {
      name: "mGenID",
      label: "Generic Name",
      type: "select" as const,
      options: dropdownValues.medicationGeneric,
      gridWidth: 4,
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
    return null;
  };

  // Handle special dropdown behavior for medication form and generic
  const onSaved = () => {
    // Any additional actions needed after saving
  };

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
    />
  );
};

export default MedicationListDetails;
