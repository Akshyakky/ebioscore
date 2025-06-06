import { useState, useEffect, useCallback, useRef } from "react";
import { useLoading } from "@/hooks/Common/useLoading";

export function createEntityHook<T extends { [key: string]: any }>(service: any, entityIdField: string = "id") {
  return () => {
    const [entityList, setEntityList] = useState<T[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { isLoading, setLoading } = useLoading();
    const initialFetchDone = useRef(false);

    const fetchEntityList = useCallback(async () => {
      if (setLoading) {
        setLoading(true);
      }
      setError(null);

      try {
        const result = await service.getAll();
        if (result.success && result.data) {
          setEntityList(result.data);
        } else {
          setError(result.errorMessage || `Failed to fetch data`);
        }
      } catch (err) {
        console.error(`Error fetching data:`, err);
        setError("An unexpected error occurred while fetching data");
      } finally {
        if (setLoading) {
          setLoading(false);
        }
      }
    }, [setLoading]);

    useEffect(() => {
      if (!initialFetchDone.current) {
        fetchEntityList();
        initialFetchDone.current = true;
      }
    }, [fetchEntityList]);

    const getEntityById = useCallback(
      async (id: number) => {
        try {
          setLoading(true);
          const result = await service.getById(id);
          if (result.success && result.data) {
            return result.data;
          } else {
            setError(result.errorMessage || "Failed to fetch item");
            return null;
          }
        } catch (err) {
          console.error("Error fetching item:", err);
          setError("An unexpected error occurred while fetching item");
          return null;
        } finally {
          setLoading(false);
        }
      },
      [setLoading]
    );

    const saveEntity = useCallback(
      async (entity: T) => {
        try {
          setLoading(true);
          return await service.save(entity);
        } catch (err) {
          console.error("Error creating item:", err);
          setError("An unexpected error occurred while creating item");
          return false;
        } finally {
          setLoading(false);
        }
      },
      [fetchEntityList, setLoading]
    );

    const deleteEntity = useCallback(
      async (id: number) => {
        try {
          setLoading(true);
          const result = await service.delete(id);
          if (result.success) {
            await fetchEntityList();
            return true;
          } else {
            setError(result.errorMessage || "Failed to delete item");
            return false;
          }
        } catch (err) {
          console.error("Error deleting item:", err);
          setError("An unexpected error occurred while deleting item");
          return false;
        } finally {
          setLoading(false);
        }
      },
      [fetchEntityList, setLoading]
    );

    const updateEntityStatus = useCallback(
      async (id: number, active: boolean) => {
        try {
          setLoading(true);
          const result = await service.updateActiveStatus(id, active);
          if (result.success) {
            await fetchEntityList();
            return true;
          } else {
            setError(result.errorMessage || "Failed to update status");
            return false;
          }
        } catch (err) {
          console.error("Error updating status:", err);
          setError("An unexpected error occurred while updating status");
          return false;
        } finally {
          setLoading(false);
        }
      },
      [fetchEntityList, setLoading]
    );

    const getNextCode = useCallback(
      async (prefix: string = "MEDG", padLength: number = 5) => {
        try {
          setLoading(true);
          const result = await service.getNextCode(prefix, padLength);
          if (result.success && result.data) {
            return result.data;
          } else {
            setError(result.errorMessage || "Failed to generate next code");
            return null;
          }
        } catch (err) {
          console.error("Error generating next code:", err);
          setError("An unexpected error occurred while generating code");
          return null;
        } finally {
          setLoading(false);
        }
      },
      [setLoading]
    );

    return {
      entityList,
      isLoading,
      error,
      fetchEntityList,
      getEntityById,
      saveEntity,
      deleteEntity,
      updateEntityStatus,
      getNextCode,
    };
  };
}
