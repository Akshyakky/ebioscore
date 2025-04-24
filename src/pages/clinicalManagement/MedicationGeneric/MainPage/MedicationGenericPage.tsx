// src/pages/clinicalManagement/MedicationGeneric/MainPage/MedicationGenericPage.tsx
import React from "react";
import { MedicalEntityPage } from "../../Components/MedicalEntityPage/MedicalEntityPage";
import MedicationGenericDetails from "../SubPage/MedicationGenericDetails";
import MedicationGenericSearch from "../SubPage/MedicationGenericSearch";
import { MedicationGenericDto } from "@/interfaces/ClinicalManagement/MedicationGenericDto";

const MedicationGenericPage: React.FC = () => {
  return (
    <MedicalEntityPage<MedicationGenericDto>
      title="Medication Generic"
      DetailComponent={MedicationGenericDetails}
      SearchComponent={MedicationGenericSearch}
      additionalButtons={
        [
          // You can add additional action buttons here if needed
        ]
      }
    />
  );
};

export default React.memo(MedicationGenericPage);
