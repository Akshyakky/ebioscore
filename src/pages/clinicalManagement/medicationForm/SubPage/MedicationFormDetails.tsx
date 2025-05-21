// src/pages/clinicalManagement/medicationForm/SubPage/MedicationFormDetails.tsx
import React from "react";
import { MedicalEntityForm } from "../../Components/MedicalEntityForm/MedicalEntityForm";
import { MedicationFormDto } from "@/interfaces/ClinicalManagement/MedicationFormDto";

interface MedicationFormDetailsProps {
  selectedData?: MedicationFormDto;
}

const MedicationFormDetails: React.FC<MedicationFormDetailsProps> = ({ selectedData }) => {
  const initialFormState: MedicationFormDto = {
    mFID: 0,
    mFCode: "",
    mFName: "",
    modifyYN: "N",
    defaultYN: "N",
    rActiveYN: "Y",
    transferYN: "N",
    rNotes: "",
    mFSnomedCode: "",
  };

  const formFields = [
    {
      name: "mFCode",
      label: "Medication Form Code",
      type: "text" as const,
      placeholder: "Enter medication form code",
      isMandatory: true,
      gridWidth: 4,
    },
    {
      name: "mFSnomedCode",
      label: "Medication Form Snomed Code",
      type: "text" as const,
      placeholder: "Enter medication form snomed code",
      isMandatory: true,
      gridWidth: 4,
    },
    {
      name: "mFName",
      label: "Medication Form Name",
      type: "text" as const,
      placeholder: "Enter medication form name",
      isMandatory: true,
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

  const validateForm = (formData: MedicationFormDto): string | null => {
    if (!formData.mFCode || !formData.mFName || !formData.mFSnomedCode) {
      return "Medication Form Code, Name, and Snomed Code are mandatory.";
    }
    return null;
  };

  return (
    <MedicalEntityForm
      title="MEDICATION FORM DETAILS"
      entityName="MedicationForm"
      codePrefix="MF"
      codeLength={3}
      selectedData={selectedData}
      initialFormState={initialFormState}
      formFields={formFields}
      serviceUrl="clinicalManagementURL"
      validateForm={validateForm}
    />
  );
};

export default MedicationFormDetails;
