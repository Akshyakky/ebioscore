import { useState, useEffect, useCallback, useRef } from "react";
import { useLoading } from "@/hooks/Common/useLoading";
import { BPayTypeDto } from "@/interfaces/Billing/BPayTypeDto";
import { paymentTypeService } from "@/services/BillingServices/BillingGenericService";

export const usePaymentTypes = () => {
  const [paymentTypesList, setPaymentTypesList] = useState<BPayTypeDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isLoading, setLoading } = useLoading();
  const initialFetchDone = useRef(false);

  const fetchPaymentTypesList = useCallback(async () => {
    if (setLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await paymentTypeService.getAll();
      if (result.success && result.data) {
        setPaymentTypesList(result.data);
      } else {
        setError(result.errorMessage || "Failed to fetch payment types");
      }
    } catch (err) {
      console.error("Error fetching payment types:", err);
      setError("An unexpected error occurred while fetching payment types");
    } finally {
      if (setLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchPaymentTypesList();
      initialFetchDone.current = true;
    }
  }, [fetchPaymentTypesList]);

  const getPaymentTypeById = useCallback(
    async (id: number) => {
      try {
        setLoading(true);
        const result = await paymentTypeService.getById(id);
        if (result.success && result.data) {
          return result.data;
        } else {
          setError(result.errorMessage || "Failed to fetch paymentType");
          return null;
        }
      } catch (err) {
        console.error("Error fetching paymentType:", err);
        setError("An unexpected error occurred while fetching paymentType");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  const createPaymentType = useCallback(
    async (paymentType: BPayTypeDto) => {
      try {
        setLoading(true);
        const result = await paymentTypeService.save(paymentType);
        if (result.success) {
          await fetchPaymentTypesList();
          return true;
        } else {
          setError(result.errorMessage || "Failed to create paymentType");
          return false;
        }
      } catch (err) {
        console.error("Error creating paymentType:", err);
        setError("An unexpected error occurred while creating paymentType");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchPaymentTypesList, setLoading]
  );

  const updatePaymentType = useCallback(
    async (paymentType: BPayTypeDto) => {
      try {
        setLoading(true);
        const result = await paymentTypeService.save(paymentType);
        if (result.success) {
          await fetchPaymentTypesList();
          return true;
        } else {
          setError(result.errorMessage || "Failed to update paymentType");
          return false;
        }
      } catch (err) {
        console.error("Error updating paymentType:", err);
        setError("An unexpected error occurred while updating paymentType");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchPaymentTypesList, setLoading]
  );

  const deletePaymentType = useCallback(
    async (id: number) => {
      try {
        setLoading(true);
        const result = await paymentTypeService.delete(id);
        if (result.success) {
          await fetchPaymentTypesList();
          return true;
        } else {
          setError(result.errorMessage || "Failed to delete paymentType");
          return false;
        }
      } catch (err) {
        console.error("Error deleting paymentType:", err);
        setError("An unexpected error occurred while deleting paymentType");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchPaymentTypesList, setLoading]
  );

  const updatePaymentTypeStatus = useCallback(
    async (id: number, active: boolean) => {
      try {
        setLoading(true);
        const result = await paymentTypeService.updateActiveStatus(id, active);
        if (result.success) {
          await fetchPaymentTypesList();
          return true;
        } else {
          setError(result.errorMessage || "Failed to update paymentType status");
          return false;
        }
      } catch (err) {
        console.error("Error updating paymentType status:", err);
        setError("An unexpected error occurred while updating paymentType status");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchPaymentTypesList, setLoading]
  );

  const getNextCode = useCallback(
    async (prefix: string = "RES", padLength: number = 3) => {
      try {
        setLoading(true);
        const result = await paymentTypeService.getNextCode(prefix, padLength);
        if (result.success && result.data) {
          return result.data;
        } else {
          setError(result.errorMessage || "Failed to generate next paymentType code");
          return null;
        }
      } catch (err) {
        console.error("Error generating next paymentType code:", err);
        setError("An unexpected error occurred while generating paymentType code");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );
  return {
    paymentTypesList,
    isLoading,
    error,
    fetchPaymentTypesList,
    getPaymentTypeById,
    createPaymentType,
    updatePaymentType,
    deletePaymentType,
    updatePaymentTypeStatus,
    getNextCode,
  };
};
