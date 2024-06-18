import { useState } from "react";
import { InsuranceFormState } from "../../interfaces/PatientAdministration/InsuranceDetails";

const useInsuranceData = (initialData: InsuranceFormState[] = []) => {
  const [insuranceData, setInsuranceData] =
    useState<InsuranceFormState[]>(initialData);

  const addInsurance = (newInsurance: InsuranceFormState) => {
    setInsuranceData((prev) => [...prev, newInsurance]);
  };

  const updateInsurance = (updatedInsurance: InsuranceFormState) => {
    setInsuranceData((prev) =>
      prev.map((ins) =>
        ins.ID === updatedInsurance.ID ? updatedInsurance : ins
      )
    );
  };

  const deleteInsurance = (id: number) => {
    setInsuranceData((prev) => prev.filter((ins) => ins.ID !== id));
  };

  return {
    insuranceData,
    addInsurance,
    updateInsurance,
    deleteInsurance,
  };
};

export default useInsuranceData;
