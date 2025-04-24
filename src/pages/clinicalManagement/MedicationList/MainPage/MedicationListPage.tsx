// src/pages/clinicalManagement/MedicationList/MainPage/MedicationListPage.tsx
import React from "react";
import { MedicalEntityPage } from "../../Components/MedicalEntityPage/MedicalEntityPage";
import MedicationListDetails from "../SubPage/MedicationDetails";
import MedicationListSearch from "../SubPage/MedicationListSearch";
import { MedicationListDto } from "@/interfaces/ClinicalManagement/MedicationListDto";

const MedicationListPage: React.FC = () => {
  return (
    <MedicalEntityPage<MedicationListDto>
      title="Medication List"
      DetailComponent={MedicationListDetails}
      SearchComponent={MedicationListSearch}
      additionalButtons={
        [
          // You can add additional action buttons here if needed
        ]
      }
    />
  );
};

export default MedicationListPage;
