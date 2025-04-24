// src/pages/clinicalManagement/MedicationFrequency/SubPage/MedicationFrequencyDetails.tsx
import React from "react";
import { MedicalEntityForm } from "../../Components/MedicalEntityForm/MedicalEntityForm";
import { MedicationFrequencyDto } from "@/interfaces/ClinicalManagement/MedicationFrequencyDto";

interface MedicationFrequencyDetailsProps {
  selectedData?: MedicationFrequencyDto;
}

const MedicationFrequencyDetails: React.FC<MedicationFrequencyDetailsProps> = ({ selectedData }) => {
  const initialFormState: MedicationFrequencyDto = {
    mFrqId: 0,
    mFrqCode: "",
    mFrqName: "",
    modifyYN: "N",
    defaultYN: "N",
    rActiveYN: "Y",
    compID: 0,
    compCode: "",
    compName: "",
    transferYN: "Y",
    rNotes: "",
    mFrqSnomedCode: "",
  };

  const formFields = [
    {
      name: "mFrqCode",
      label: "Medication Frequency Code",
      type: "text" as const,
      placeholder: "Enter medication frequency code",
      isMandatory: true,
      gridWidth: 4,
    },
    {
      name: "mFrqSnomedCode",
      label: "Medication Frequency Snomed Code",
      type: "text" as const,
      placeholder: "Enter medication frequency snomed code",
      isMandatory: true,
      gridWidth: 4,
    },
    {
      name: "mFrqName",
      label: "Medication Frequency Name",
      type: "text" as const,
      placeholder: "Enter medication frequency name",
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

  const validateForm = (formData: MedicationFrequencyDto): string | null => {
    if (!formData.mFrqCode || !formData.mFrqName || !formData.mFrqSnomedCode) {
      return "Medication Frequency Code, Name, and Snomed Code are mandatory.";
    }
    return null;
  };

  return (
    <MedicalEntityForm
      title="MEDICATION FREQUENCY DETAILS"
      entityName="MedicationFrequency"
      codePrefix="MFRQ"
      codeLength={5}
      selectedData={selectedData}
      initialFormState={initialFormState}
      formFields={formFields}
      serviceUrl="clinicalManagementURL"
      validateForm={validateForm}
    />
  );
};

export default MedicationFrequencyDetails;
