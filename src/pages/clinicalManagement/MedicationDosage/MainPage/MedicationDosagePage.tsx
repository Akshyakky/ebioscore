// src/pages/clinicalManagement/MedicationDosage/MainPage/MedicationDosagePage.tsx
import React from "react";
import { MedicalEntityPage } from "../../Components/MedicalEntityPage/MedicalEntityPage";
import MedicationDosageDetailsNew from "../SubPage/MedicationDosageDetails";
import MedicationDosageSearchNew from "../SubPage/MedicationDosageSearch";
import { MedicationDosageDto } from "@/interfaces/ClinicalManagement/MedicationDosageDto";

const MedicationDosagePage: React.FC = () => {
  return <MedicalEntityPage<MedicationDosageDto> title="Medication Dosage" DetailComponent={MedicationDosageDetailsNew} SearchComponent={MedicationDosageSearchNew} />;
};

export default MedicationDosagePage;
