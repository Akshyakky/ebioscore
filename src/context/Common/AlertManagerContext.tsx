// src/context/AlertManagerContext.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from "react";
import { AlertDto } from "@/interfaces/Common/AlertManager";
import { alertService } from "@/services/CommonServices/CommonModelServices";
import { useAppSelector } from "@/store/hooks";
import { showAlert } from "@/utils/Common/showAlert";
import useDayjs from "@/hooks/Common/useDateTime";
import { useServerDate } from "@/hooks/Common/useServerDate";
import { AlertManagerServices } from "@/services/CommonServices/AlertManagerServices";

interface AlertManagerContextType {
  alerts: AlertDto[];
  selectedPChartID: number;
  setSelectedPChartID: (id: number) => void;
  isLoading: boolean;
  fetchAlertsByPChartID: (pChartID: number) => Promise<void>;
  addAlert: (alert: AlertDto) => void;
  updateAlert: (alert: AlertDto, index: number) => void;
  deleteAlert: (alertId: number) => Promise<boolean>;
  saveAllAlerts: () => Promise<boolean>;
  clearAlerts: () => void;
  createNewAlertDto: (description: string, pChartID: number, pChartCode: string) => AlertDto;
}

const AlertManagerContext = createContext<AlertManagerContextType | undefined>(undefined);

export const AlertManagerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertDto[]>([]);
  const [selectedPChartID, setSelectedPChartID] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { userID, userName } = useAppSelector((state) => state.auth);
  const { date: serverDate, formatDate, formatISO } = useDayjs(useServerDate());

  // Fetch alerts for a patient
  const fetchAlertsByPChartID = useCallback(async (pChartID: number) => {
    if (!pChartID) return;

    setIsLoading(true);
    try {
      const result = await alertService.GetAlertBypChartID(pChartID);

      if (result.success && result.data) {
        const activeAlerts = result.data.filter((alert: AlertDto) => alert.rActiveYN === "Y");
        setAlerts(activeAlerts);
      } else {
        setAlerts([]);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
      //   showAlert("Error", "Failed to fetch alerts. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new alert DTO
  const createNewAlertDto = useCallback(
    (description: string, pChartID: number, pChartCode: string): AlertDto => {
      return {
        oPIPAlertID: 0,
        pChartID,
        oPIPNo: 0,
        oPIPCaseNo: 0,
        patOPIPYN: "Y",
        alertDescription: description,
        oPIPDate: formatISO(new Date()),
        category: "",
        oldPChartID: 0,
        rActiveYN: "Y",
        oPVID: 0,
        pChartCode,
        payID: 0,
      };
    },
    [userID, userName, formatISO]
  );

  // Add a new alert to the list
  const addAlert = useCallback((alert: AlertDto) => {
    setAlerts((prevAlerts) => [...prevAlerts, alert]);
  }, []);

  // Update an existing alert
  const updateAlert = useCallback((updatedAlert: AlertDto, index: number) => {
    setAlerts((prevAlerts) => prevAlerts.map((alert, i) => (i === index ? updatedAlert : alert)));
  }, []);

  // Delete an alert
  const deleteAlert = useCallback(async (alertId: number) => {
    setIsLoading(true);
    try {
      const isSuccess = await alertService.updateActiveStatus(alertId, false);

      if (isSuccess) {
        setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.oPIPAlertID !== alertId));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting alert:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save all alerts
  const saveAllAlerts = useCallback(async () => {
    if (alerts.length === 0) {
      showAlert("Error", "No alerts to save. Please add at least one alert.", "error");
      return false;
    }

    setIsLoading(true);
    try {
      for (const alert of alerts) {
        const result = await alertService.save(alert);
        if (!result.success) {
          throw new Error(result.errorMessage || "Failed to save Alert.");
        }
      }
      return true;
    } catch (error) {
      console.error("Error saving alerts:", error);
      showAlert("Error", "Failed to save alerts. Please try again.", "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [alerts]);

  // Clear all alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
    setSelectedPChartID(0);
  }, []);

  const value = useMemo(
    () => ({
      alerts,
      selectedPChartID,
      setSelectedPChartID,
      isLoading,
      fetchAlertsByPChartID,
      addAlert,
      updateAlert,
      deleteAlert,
      saveAllAlerts,
      clearAlerts,
      createNewAlertDto,
    }),
    [alerts, selectedPChartID, isLoading, fetchAlertsByPChartID, addAlert, updateAlert, deleteAlert, saveAllAlerts, clearAlerts, createNewAlertDto]
  );

  return <AlertManagerContext.Provider value={value}>{children}</AlertManagerContext.Provider>;
};

export const useAlertManager = () => {
  const context = useContext(AlertManagerContext);
  if (context === undefined) {
    throw new Error("useAlertManager must be used within an AlertManagerProvider");
  }
  return context;
};
