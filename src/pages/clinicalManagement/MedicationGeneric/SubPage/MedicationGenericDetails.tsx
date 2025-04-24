// src/pages/clinicalManagement/MedicationGeneric/SubPage/MedicationGenericDetails.tsx
import React from "react";
import { MedicalEntityForm } from "../../Components/MedicalEntityForm/MedicalEntityForm";
import { MedicationGenericDto } from "@/interfaces/ClinicalManagement/MedicationGenericDto";

interface MedicationGenericDetailsProps {
  selectedData?: MedicationGenericDto;
}

const MedicationGenericDetails: React.FC<MedicationGenericDetailsProps> = ({ selectedData }) => {
  const initialFormState: MedicationGenericDto = {
    mGenID: 0,
    mGenCode: "",
    mGenName: "",
    modifyYN: "Y",
    defaultYN: "N",
    rActiveYN: "Y",
    compID: 0,
    compCode: "",
    compName: "",
    transferYN: "N",
    rNotes: "",
    mSnomedCode: "",
  };

  const formFields = [
    {
      name: "mGenCode",
      label: "Medication Generic Code",
      type: "text" as const,
      placeholder: "Enter Medication Generic code",
      isMandatory: true,
      gridWidth: 4,
    },
    {
      name: "mGenName",
      label: "Medication Generic Name",
      type: "text" as const,
      placeholder: "Enter Medication Generic name",
      isMandatory: true,
      gridWidth: 4,
    },
    {
      name: "mSnomedCode",
      label: "Snomed Code",
      type: "text" as const,
      placeholder: "Enter Snomed code",
      isMandatory: false,
      gridWidth: 4,
    },
    {
      name: "rNotes",
      label: "Notes",
      type: "textarea" as const,
      placeholder: "Notes",
      maxLength: 4000,
      gridWidth: 12,
    },
    {
      name: "defaultYN",
      label: "Default",
      type: "radio" as const,
      options: [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" },
      ],
      gridWidth: 4,
    },
    {
      name: "modifyYN",
      label: "Modify",
      type: "radio" as const,
      options: [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" },
      ],
      gridWidth: 4,
    },
    {
      name: "rActiveYN",
      label: "Active",
      type: "switch" as const,
      gridWidth: 4,
    },
  ];

  const validateForm = (formData: MedicationGenericDto): string | null => {
    if (!formData.mGenCode || !formData.mGenCode.trim() || !formData.mGenName) {
      return "Medication Generic Code and Name are mandatory.";
    }
    return null;
  };

  return (
    <MedicalEntityForm
      title="MEDICATION GENERIC DETAILS"
      entityName="MedicationGeneric"
      codePrefix="MEDG"
      codeLength={5}
      selectedData={selectedData}
      initialFormState={initialFormState}
      formFields={formFields}
      serviceUrl="clinicalManagementURL"
      validateForm={validateForm}
    />
  );
};

export default React.memo(MedicationGenericDetails);
