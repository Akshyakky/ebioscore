// src/pages/clinicalManagement/DiagnosisList/MainPage/DiagnosisListPage.tsx
import React from "react";
import { IcdDetailDto } from "@/interfaces/ClinicalManagement/IcdDetailDto";
import DiagnosisDetails from "../SubPage/DiagnosisDetails";
import DiagnosisSearch from "../SubPage/DiagnosisSearch";
import MedicalEntityPage from "../../Components/MedicalEntityPage/MedicalEntityPage";

const DiagnosisListPage: React.FC = () => {
  return <MedicalEntityPage<IcdDetailDto> title="Diagnosis List" DetailComponent={DiagnosisDetails} SearchComponent={DiagnosisSearch} />;
};

export default React.memo(DiagnosisListPage);
