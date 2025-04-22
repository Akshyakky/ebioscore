// src/pages/clinicalManagement/medicationForm/MainPage/MedicationFormPage.tsx
import React from "react";
import { MedicalEntityPage } from "../../Components/MedicalEntityPage/MedicalEntityPage";
import MedicationFormDetails from "../SubPage/MedicationFormDetails";
import MedicationFormSearch from "../SubPage/MedicationFormSearch";
import { MedicationFormDto } from "@/interfaces/ClinicalManagement/MedicationFormDto";

const MedicationFormPage: React.FC = () => {
  return (
    <MedicalEntityPage<MedicationFormDto>
      title="Medication Form"
      DetailComponent={MedicationFormDetails}
      SearchComponent={MedicationFormSearch}
      additionalButtons={
        [
          // You can add additional action buttons here if needed
        ]
      }
    />
  );
};

export default MedicationFormPage;
