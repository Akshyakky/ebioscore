import { useState, useEffect, useCallback, useRef } from "react";
import { useLoading } from "@/hooks/Common/useLoading";
import { BPatTypeDto } from "@/interfaces/Billing/BPatTypeDto";
import { patientInvioceService } from "@/services/BillingServices/BillingGenericService";

export const usePatientInvoiceCode = () => {
  const [patientInvoiceList, setPatientInvoiceList] = useState<BPatTypeDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isLoading, setLoading } = useLoading();
  const initialFetchDone = useRef(false);

  const fetchPatientInvoiceList = useCallback(async () => {
    if (setLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await patientInvioceService.getAll();
      if (result.success && result.data) {
        setPatientInvoiceList(result.data);
      } else {
        setError(result.errorMessage || "Failed to fetch patient invoice codes");
      }
    } catch (err) {
      console.error("Error fetching patient invoice codes:", err);
      setError("An unexpected error occurred while fetching patient invoice codes");
    } finally {
      if (setLoading) {
        setLoading(false);
      }
    }
  }, [setLoading]);

  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchPatientInvoiceList();
      initialFetchDone.current = true;
    }
  }, [fetchPatientInvoiceList]);

  const getPatientInvoiceById = useCallback(
    async (id: number) => {
      try {
        setLoading(true);
        const result = await patientInvioceService.getById(id);
        if (result.success && result.data) {
          return result.data;
        } else {
          setError(result.errorMessage || "Failed to fetch patient invoice code");
          return null;
        }
      } catch (err) {
        console.error("Error fetching patient invoice code:", err);
        setError("An unexpected error occurred while fetching patient invoice code");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  const createPatientInvoice = useCallback(
    async (patientInvoice: BPatTypeDto) => {
      try {
        setLoading(true);
        const result = await patientInvioceService.save(patientInvoice);
        if (result.success) {
          await fetchPatientInvoiceList();
          return true;
        } else {
          setError(result.errorMessage || "Failed to create patient invoice code");
          return false;
        }
      } catch (err) {
        console.error("Error creating patient invoice code:", err);
        setError("An unexpected error occurred while creating patient invoice code");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchPatientInvoiceList, setLoading]
  );

  const updatePatientInvoice = useCallback(
    async (patientInvoice: BPatTypeDto) => {
      try {
        setLoading(true);
        const result = await patientInvioceService.save(patientInvoice);
        if (result.success) {
          await fetchPatientInvoiceList();
          return true;
        } else {
          setError(result.errorMessage || "Failed to update patient invoice code");
          return false;
        }
      } catch (err) {
        console.error("Error updating patient invoice code:", err);
        setError("An unexpected error occurred while updating patient invoice code");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchPatientInvoiceList, setLoading]
  );

  const deletePatientInvoice = useCallback(
    async (id: number) => {
      try {
        setLoading(true);
        const result = await patientInvioceService.delete(id);
        if (result.success) {
          await fetchPatientInvoiceList();
          return true;
        } else {
          setError(result.errorMessage || "Failed to delete patient invoice code");
          return false;
        }
      } catch (err) {
        console.error("Error deleting patient invoice code:", err);
        setError("An unexpected error occurred while deleting patient invoice code");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchPatientInvoiceList, setLoading]
  );

  const updatePatientInvoiceStatus = useCallback(
    async (id: number, active: boolean) => {
      try {
        setLoading(true);
        const result = await patientInvioceService.updateActiveStatus(id, active);
        if (result.success) {
          await fetchPatientInvoiceList();
          return true;
        } else {
          setError(result.errorMessage || "Failed to update patient invoice code status");
          return false;
        }
      } catch (err) {
        console.error("Error updating patient invoice code status:", err);
        setError("An unexpected error occurred while updating patient invoice code status");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchPatientInvoiceList, setLoading]
  );

  const getNextCode = useCallback(
    async (prefix: string = "INV", padLength: number = 3) => {
      try {
        setLoading(true);
        const result = await patientInvioceService.getNextCode(prefix, padLength);
        if (result.success && result.data) {
          return result.data;
        } else {
          setError(result.errorMessage || "Failed to generate next patient invoice code");
          return null;
        }
      } catch (err) {
        console.error("Error generating next patient invoice code:", err);
        setError("An unexpected error occurred while generating patient invoice code");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  return {
    patientInvoiceList,
    isLoading,
    error,
    fetchPatientInvoiceList,
    getPatientInvoiceById,
    createPatientInvoice,
    updatePatientInvoice,
    deletePatientInvoice,
    updatePatientInvoiceStatus,
    getNextCode,
  };
};
