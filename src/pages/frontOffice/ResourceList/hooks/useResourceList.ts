import { useState, useEffect, useCallback, useRef } from "react";
import { ResourceListData } from "@/interfaces/FrontOffice/ResourceListData";
import { resourceListService } from "@/services/FrontOfficeServices/FrontOfiiceApiServices";
import { useLoading } from "@/hooks/Common/useLoading";

export const useResourceList = () => {
  const [resourceList, setResourceList] = useState<ResourceListData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isLoading, setLoading } = useLoading();
  const initialFetchDone = useRef(false);

  const fetchResourceList = useCallback(async () => {
    if (setLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await resourceListService.getAll();
      if (result.success && result.data) {
        setResourceList(result.data);
      } else {
        setError(result.errorMessage || "Failed to fetch resources");
      }
    } catch (err) {
      console.error("Error fetching resources:", err);
      setError("An unexpected error occurred while fetching resources");
    } finally {
      if (setLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchResourceList();
      initialFetchDone.current = true;
    }
  }, [fetchResourceList]);

  const getResourceById = useCallback(
    async (id: number) => {
      try {
        setLoading(true);
        const result = await resourceListService.getById(id);
        if (result.success && result.data) {
          return result.data;
        } else {
          setError(result.errorMessage || "Failed to fetch resource");
          return null;
        }
      } catch (err) {
        console.error("Error fetching resource:", err);
        setError("An unexpected error occurred while fetching resource");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  const createResource = useCallback(
    async (resource: ResourceListData) => {
      try {
        setLoading(true);
        const result = await resourceListService.save(resource);
        if (result.success) {
          // Fetch the updated list after creating a resource
          await fetchResourceList();
          return true;
        } else {
          setError(result.errorMessage || "Failed to create resource");
          return false;
        }
      } catch (err) {
        console.error("Error creating resource:", err);
        setError("An unexpected error occurred while creating resource");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchResourceList, setLoading]
  );

  const updateResource = useCallback(
    async (resource: ResourceListData) => {
      try {
        setLoading(true);
        const result = await resourceListService.save(resource);
        if (result.success) {
          // Fetch the updated list after updating a resource
          await fetchResourceList();
          return true;
        } else {
          setError(result.errorMessage || "Failed to update resource");
          return false;
        }
      } catch (err) {
        console.error("Error updating resource:", err);
        setError("An unexpected error occurred while updating resource");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchResourceList, setLoading]
  );

  const deleteResource = useCallback(
    async (id: number) => {
      try {
        setLoading(true);
        const result = await resourceListService.delete(id);
        if (result.success) {
          // Fetch the updated list after deleting a resource
          await fetchResourceList();
          return true;
        } else {
          setError(result.errorMessage || "Failed to delete resource");
          return false;
        }
      } catch (err) {
        console.error("Error deleting resource:", err);
        setError("An unexpected error occurred while deleting resource");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchResourceList, setLoading]
  );

  const updateResourceStatus = useCallback(
    async (id: number, active: boolean) => {
      try {
        setLoading(true);
        const result = await resourceListService.updateActiveStatus(id, active);
        if (result.success) {
          // Fetch the updated list after updating resource status
          await fetchResourceList();
          return true;
        } else {
          setError(result.errorMessage || "Failed to update resource status");
          return false;
        }
      } catch (err) {
        console.error("Error updating resource status:", err);
        setError("An unexpected error occurred while updating resource status");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchResourceList, setLoading]
  );

  const getNextCode = useCallback(
    async (prefix: string = "RES", padLength: number = 3) => {
      try {
        setLoading(true);
        const result = await resourceListService.getNextCode(prefix, padLength);
        if (result.success && result.data) {
          return result.data;
        } else {
          setError(result.errorMessage || "Failed to generate next resource code");
          return null;
        }
      } catch (err) {
        console.error("Error generating next resource code:", err);
        setError("An unexpected error occurred while generating resource code");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  return {
    resourceList,
    isLoading,
    error,
    fetchResourceList,
    getResourceById,
    createResource,
    updateResource,
    deleteResource,
    updateResourceStatus,
    getNextCode,
  };
};
