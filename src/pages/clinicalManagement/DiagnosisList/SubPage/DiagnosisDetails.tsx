import React from "react";
import { IcdDetailDto } from "@/interfaces/ClinicalManagement/IcdDetailDto";
import MedicalEntityForm from "../../Components/MedicalEntityForm/MedicalEntityForm";

interface DiagnosisDetailsProps {
  selectedData?: IcdDetailDto;
}

const DiagnosisDetails: React.FC<DiagnosisDetailsProps> = ({ selectedData }) => {
  const initialFormState: IcdDetailDto = {
    icddId: 0,
    icdmId: 0,
    icddCode: "",
    icddName: "",
    icddCustYN: "N",
    icddVer: "",
    icddNameGreek: "",
    rActiveYN: "Y",
    rNotes: "",
    transferYN: "N",
  };

  const formFields = [
    {
      name: "icddCode",
      label: "ICD Code",
      type: "text" as const,
      placeholder: "Enter ICD code",
      isMandatory: true,
    },
    {
      name: "icddName",
      label: "ICD Name",
      type: "text" as const,
      placeholder: "Enter ICD name",
      isMandatory: true,
    },
    {
      name: "icddVer",
      label: "Version",
      type: "text" as const,
      placeholder: "Enter version",
    },
    {
      name: "icddNameGreek",
      label: "Greek Name",
      type: "text" as const,
      placeholder: "Enter Greek name",
    },
    {
      name: "icddCustYN",
      label: "Custom",
      type: "switch" as const,
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
    },
  ];

  const validateForm = (formData: IcdDetailDto): string | null => {
    if (!formData.icddCode.trim()) return "ICD Code is required";
    if (!formData.icddName.trim()) return "ICD Name is required";
    return null;
  };

  return (
    <MedicalEntityForm<IcdDetailDto>
      title="DIAGNOSIS DETAILS"
      entityName="IcdDetail"
      codePrefix="ICD"
      codeLength={4}
      selectedData={selectedData}
      initialFormState={initialFormState}
      formFields={formFields}
      serviceUrl="clinicalManagementURL"
      validateForm={validateForm}
    />
  );
};

export default React.memo(DiagnosisDetails);
