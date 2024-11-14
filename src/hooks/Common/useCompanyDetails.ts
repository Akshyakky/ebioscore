// Create a proper custom hook for Redux
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export const useCompanyDetails = () => {
  const { compID, compCode, compName } = useSelector((state: RootState) => state.auth);
  return {
    compID: compID || 0,
    compCode: compCode || "",
    compName: compName || "",
    rActiveYN: "Y" as const,
    transferYN: "N" as const,
  };
};
