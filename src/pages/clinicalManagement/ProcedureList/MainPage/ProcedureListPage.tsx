// src/pages/clinicalManagement/ProcedureList/MainPage/ProcedureListPage.tsx
import React from "react";
import { MedicalEntityPage } from "../../Components/MedicalEntityPage/MedicalEntityPage";
import ProcedureListDetails from "../SubPage/ProcedureListDetails";
import ProcedureSearch from "../SubPage/ProcedureListSearch";
import { OTProcedureListDto } from "@/interfaces/ClinicalManagement/ProcedureListDto";

const ProcedureListPage: React.FC = () => {
  return (
    <MedicalEntityPage<OTProcedureListDto>
      title="Procedure List"
      DetailComponent={ProcedureListDetails}
      SearchComponent={ProcedureSearch}
      additionalButtons={
        [
          // You can add additional action buttons here if needed
        ]
      }
    />
  );
};

export default React.memo(ProcedureListPage);
