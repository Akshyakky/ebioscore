// src/pages/clinicalManagement/MedicationDosage/SubPage/MedicationDosageDetails.tsx
import React from "react";
import { MedicalEntityForm } from "../../Components/MedicalEntityForm/MedicalEntityForm";
import { MedicationDosageDto } from "@/interfaces/ClinicalManagement/MedicationDosageDto";

interface MedicationDosageDetailsProps {
  selectedData?: MedicationDosageDto;
}

const MedicationDosageDetails: React.FC<MedicationDosageDetailsProps> = ({ selectedData }) => {
  const initialFormState: MedicationDosageDto = {
    mDId: 0,
    mDCode: "",
    mDName: "",
    modifyYN: "N",
    defaultYN: "N",
    rActiveYN: "Y",
    compID: 0,
    compCode: "",
    compName: "",
    transferYN: "Y",
    rNotes: "",
    mDSnomedCode: "",
  };

  const formFields = [
    {
      name: "mDCode",
      label: "Medication Dosage Code",
      type: "text" as const,
      placeholder: "Enter medication dosage code",
      isMandatory: true,
      gridWidth: 4,
    },
    {
      name: "mDSnomedCode",
      label: "Medication Dosage Snomed Code",
      type: "text" as const,
      placeholder: "Enter medication dosage snomed code",
      isMandatory: true,
      gridWidth: 4,
    },
    {
      name: "mDName",
      label: "Medication Dosage Name",
      type: "text" as const,
      placeholder: "Enter medication dosage name",
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

  const validateForm = (formData: MedicationDosageDto): string | null => {
    if (!formData.mDCode || !formData.mDName || !formData.mDSnomedCode) {
      return "Medication Dosage Code, Name, and Snomed Code are mandatory.";
    }
    return null;
  };

  return (
    <MedicalEntityForm
      title="MEDICATION DOSAGE DETAILS"
      entityName="MedicationDosage"
      codePrefix="MD"
      codeLength={5}
      selectedData={selectedData}
      initialFormState={initialFormState}
      formFields={formFields}
      serviceUrl="clinicalManagementURL"
      validateForm={validateForm}
    />
  );
};

export default MedicationDosageDetails;
