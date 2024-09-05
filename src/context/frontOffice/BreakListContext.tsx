import React, { createContext, useState, useContext } from "react";
import { useLoading } from "../LoadingContext";
import { useSelector } from "react-redux";
import { RootState } from "../../store/reducers";
import { notifyError, notifySuccess } from "../../utils/Common/toastManager";
import { BreakListService } from "../../services/FrontOfficeServices/BreakListServices/BreakListService";
import { BreakListData } from "../../interfaces/frontOffice/BreakListData";

interface BreakListContextProps {
  breakLists: BreakListData[];
  breakList: BreakListData | null;
  fetchAllBreakLists: () => Promise<void>;
  getBreakListById: (id: number) => Promise<void>;
  saveBreakList: (breakListData: BreakListData) => Promise<void>;
  updateBreakListActiveStatus: (breakListId: number, isActive: boolean) => Promise<void>;
}

export const BreakListContext = createContext<BreakListContextProps>({
  breakLists: [],
  breakList: null,
  fetchAllBreakLists: async () => { },
  getBreakListById: async () => { },
  saveBreakList: async () => { },
  updateBreakListActiveStatus: async () => { },
});

interface BreakListProviderProps {
  children: React.ReactNode;
}

export const BreakListProvider = ({ children }: BreakListProviderProps) => {
  const [breakLists, setBreakLists] = useState<BreakListData[]>([]);
  const [breakList, setBreakList] = useState<BreakListData | null>(null);
  const { setLoading } = useLoading();
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const token = userInfo?.token;

  const fetchAllBreakLists = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const result = await BreakListService.getAllBreakLists(token);
      if (result.success && result.data) {
        setBreakLists(result.data);
      } else {
        console.error("Failed to fetch break lists: no data found");
        notifyError("Failed to fetch break lists. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching break lists", error);
      notifyError("An error occurred while fetching break lists.");
    } finally {
      setLoading(false);
    }
  };

  const getBreakListById = async (id: number) => {
    if (!token) return;
    setLoading(true);
    try {
      const result = await BreakListService.getBreakListById(token, id);
      if (result.success && result.data) {
        setBreakList(result.data);
      } else {
        console.error("Failed to fetch break list: no data found");
        notifyError("Failed to fetch break list. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching break list", error);
      notifyError("An error occurred while fetching break list.");
    } finally {
      setLoading(false);
    }
  };

  const saveBreakList = async (breakListData: BreakListData) => {
    if (!token) return;
    setLoading(true);
    try {
      const result = await BreakListService.saveBreakList(token, breakListData);
      if (result.success) {
        notifySuccess("Break list saved successfully.");
        fetchAllBreakLists(); // Refresh the list
      } else {
        notifyError(result.errorMessage || "Failed to save break list.");
      }
    } catch (error) {
      notifyError("An error occurred while saving break list.");
    } finally {
      setLoading(false);
    }
  };

  const updateBreakListActiveStatus = async (breakListId: number, isActive: boolean) => {
    if (!token) return;
    setLoading(true);
    try {
      const result = await BreakListService.updateBreakListActiveStatus(token, breakListId, isActive);
      if (result.success) {
        notifySuccess("Break list status updated successfully.");
        fetchAllBreakLists(); // Refresh the list
      } else {
        notifyError(result.errorMessage || "Failed to update break list status.");
      }
    } catch (error) {
      notifyError("An error occurred while updating break list status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BreakListContext.Provider
      value={{
        breakLists,
        breakList,
        fetchAllBreakLists,
        getBreakListById,
        saveBreakList,
        updateBreakListActiveStatus,
      }}
    >
      {children}
    </BreakListContext.Provider>
  );
};
