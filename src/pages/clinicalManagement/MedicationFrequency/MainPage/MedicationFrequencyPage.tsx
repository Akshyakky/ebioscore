// src/pages/clinicalManagement/MedicationFrequency/MainPage/MedicationFrequencyPage.tsx
import React from "react";
import { MedicalEntityPage } from "../../Components/MedicalEntityPage/MedicalEntityPage";
import MedicationFrequencyDetails from "../SubPage/MedicationFrequencyDetails";
import MedicationFrequencySearch from "../SubPage/MedicationFrequencySearch";
import { MedicationFrequencyDto } from "@/interfaces/ClinicalManagement/MedicationFrequencyDto";

const MedicationFrequencyPage: React.FC = () => {
  return (
    <MedicalEntityPage<MedicationFrequencyDto>
      title="Medication Frequency"
      DetailComponent={MedicationFrequencyDetails}
      SearchComponent={MedicationFrequencySearch}
      additionalButtons={
        [
          // You can add additional action buttons here if needed
        ]
      }
    />
  );
};

export default MedicationFrequencyPage;
