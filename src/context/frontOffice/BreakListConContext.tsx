import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { useLoading } from "../LoadingContext";
import { useSelector } from "react-redux";
import { RootState } from "../../store/reducers";
import { notifyError, notifySuccess } from "../../utils/Common/toastManager";
import { BreakConDetailData } from "../../interfaces/FrontOffice/BreakConDetailsData";
import { BreakListConDetailsService } from "../../services/FrontOfficeServices/BreakListConDetailService";

interface BreakConDetailsContextProps {
  breakConDetails: BreakConDetailData[];
  breakConDetail: BreakConDetailData | null;
  fetchAllBreakConDetails: () => Promise<void>;
  getBreakConDetailById: (bCDID: number) => Promise<void>;
  saveBreakConDetail: (detail: BreakConDetailData) => Promise<void>;
  updateBreakConDetailActiveStatus: (bCDID: number, isActive: boolean) => Promise<void>;
}

export const BreakConDetailsContext = createContext<BreakConDetailsContextProps>({
  breakConDetails: [],
  breakConDetail: null,
  fetchAllBreakConDetails: async () => {},
  getBreakConDetailById: async () => {},
  saveBreakConDetail: async () => {},
  updateBreakConDetailActiveStatus: async () => {},
  
});

interface BreakConDetailsProviderProps {
  children: React.ReactNode;
}

export const BreakConDetailsProvider = ({ children }: BreakConDetailsProviderProps) => {
  const [breakConDetails, setBreakConDetails] = useState<BreakConDetailData[]>([]);
  const [breakConDetail, setBreakConDetail] = useState<BreakConDetailData | null>(null);
  const { setLoading } = useLoading();
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const token = userInfo?.token;

  const fetchAllBreakConDetails = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const result = await BreakListConDetailsService.getAllBreakConDetails(token);
      if (result.success && result.data) {
        setBreakConDetails(result.data);
      } else {
        console.error("Failed to fetch break condition details: no data found");
        notifyError("Failed to fetch break condition details. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching break condition details", error);
      notifyError("An error occurred while fetching break condition details.");
    } finally {
      setLoading(false);
    }
  };

  const getBreakConDetailById = async (bCDID: number) => {
    if (!token) return;
    setLoading(true);
    try {
      const result = await BreakListConDetailsService.getBreakConDetailById(token, bCDID);
      if (result.success && result.data) {
        setBreakConDetail(result.data);
      } else {
        console.error("Failed to fetch break condition detail: no data found");
        notifyError("Failed to fetch break condition detail. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching break condition detail", error);
      notifyError("An error occurred while fetching break condition detail.");
    } finally {
      setLoading(false);
    }
  };

  const saveBreakConDetail = async (detail: BreakConDetailData) => {
    if (!token) return;
    setLoading(true);
    try {
      const result = await BreakListConDetailsService.saveBreakConDetail(token, detail);
      if (result.success) {
        notifySuccess("Break condition detail saved successfully.");
        fetchAllBreakConDetails(); // Refresh the list
      } else {
        notifyError(result.errorMessage || "Failed to save break condition detail.");
      }
    } catch (error) {
      notifyError("An error occurred while saving break condition detail.");
    } finally {
      setLoading(false);
    }
  };

  const updateBreakConDetailActiveStatus = async (bCDID: number, isActive: boolean) => {
    if (!token) return;
    setLoading(true);
    try {
      const result = await BreakListConDetailsService.updateBreakConDetailActiveStatus(token, bCDID, isActive);
      if (result.success) {
        notifySuccess("Break condition detail status updated successfully.");
        fetchAllBreakConDetails(); // Refresh the list
      } else {
        notifyError(result.errorMessage || "Failed to update break condition detail status.");
      }
    } catch (error) {
      notifyError("An error occurred while updating break condition detail status.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <BreakConDetailsContext.Provider
      value={{
        breakConDetails,
        breakConDetail,
        fetchAllBreakConDetails,
        getBreakConDetailById,
        saveBreakConDetail,
        updateBreakConDetailActiveStatus,
      }}
    >
      {children}
    </BreakConDetailsContext.Provider>
  );
};
