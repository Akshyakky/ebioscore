// src/pages/clinicalManagement/ProcedureList/SubPage/ProcedureListDetails.tsx
import React, { useMemo } from "react";
import { MedicalEntityForm } from "../../Components/MedicalEntityForm/MedicalEntityForm";
import { OTProcedureListDto } from "@/interfaces/ClinicalManagement/ProcedureListDto";

interface ProcedureListDetailsProps {
  selectedData?: OTProcedureListDto;
}

const ProcedureListDetails: React.FC<ProcedureListDetailsProps> = ({ selectedData }) => {
  // Procedure type options
  const procedureTypeOptions = useMemo(
    () => [
      { value: "HOSP", label: "Hospital" },
      { value: "DR", label: "Doctor" },
    ],
    []
  );

  const initialFormState: OTProcedureListDto = {
    procedureID: 0,
    procedureName: "",
    procedureNameLong: "",
    procedureCode: "",
    chargeID: 0,
    procType: "",
    rActiveYN: "Y",
    compID: 0,
    compCode: "",
    compName: "",
    rNotes: "",
    transferYN: "N",
  };

  const formFields = [
    {
      name: "procedureCode",
      label: "Procedure Code",
      type: "text" as const,
      placeholder: "Enter Procedure code",
      isMandatory: true,
      gridWidth: 4,
    },
    {
      name: "procedureName",
      label: "Procedure Name",
      type: "text" as const,
      placeholder: "Enter Procedure name",
      isMandatory: true,
      gridWidth: 4,
    },
    {
      name: "procedureNameLong",
      label: "Procedure Long Name",
      type: "text" as const,
      placeholder: "Enter Procedure Long Name",
      gridWidth: 4,
    },
    {
      name: "procType",
      label: "Procedure Type",
      type: "select" as const,
      options: procedureTypeOptions,
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
      name: "rActiveYN",
      label: "Active",
      type: "switch" as const,
      gridWidth: 4,
    },
  ];

  const validateForm = (formData: OTProcedureListDto): string | null => {
    if (!formData.procedureCode || !formData.procedureName) {
      return "Procedure Code and Name are mandatory.";
    }
    return null;
  };

  return (
    <MedicalEntityForm
      title="PROCEDURE DETAILS"
      entityName="ProcedureList"
      codePrefix="PROC"
      codeLength={5}
      selectedData={selectedData}
      initialFormState={initialFormState}
      formFields={formFields}
      serviceUrl="clinicalManagementURL"
      validateForm={validateForm}
    />
  );
};

export default React.memo(ProcedureListDetails);
