import React, { createContext, useState, useEffect } from "react";
import { useLoading } from "../LoadingContext";
import { useSelector } from "react-redux";
import { RootState } from "../../store/reducers";
import { notifyError } from "../../utils/Common/toastManager";
import { ResourceListData } from "../../interfaces/frontOffice/ResourceListData";
import { ResourceListService } from "../../services/frontOffice/ResourceListServices";

interface ResourceListContextProps {
  resourceList: ResourceListData[];
  searchResults: ResourceListData[];
  performSearch: (searchTerm: string) => Promise<void>;
  fetchAllResources: () => Promise<void>;
  updateResourceStatus: (resourceID: number, status: string) => void;
}

export const ResourceListContext = createContext<ResourceListContextProps>({
  resourceList: [],
  searchResults: [],
  performSearch: async () => {},
  fetchAllResources: async () => {},
  updateResourceStatus: () => {},
});

interface ResourceListProviderProps {
  children: React.ReactNode;
}

export const ResourceListProvider = ({
  children,
}: ResourceListProviderProps) => {
  const [resourceList, setResourceList] = useState<ResourceListData[]>([]);
  const [searchResults, setSearchResults] = useState<ResourceListData[]>([]);
  const { setLoading } = useLoading();
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const token = userInfo?.token;

  const fetchAllResources = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await ResourceListService.getAllResourceLists(token);
      if (response.success && response.data) {
        setResourceList(response.data);
        setSearchResults(response.data);
      } else {
        console.error("Failed to fetch resource lists: no data found");
        notifyError("Failed to fetch resource lists. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching resource lists", error);
      notifyError("An error occurred while fetching resource lists.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllResources();
  }, [token]);

  const performSearch = async (searchTerm: string): Promise<void> => {
    if (searchTerm.trim() === "") {
      setSearchResults(resourceList);
    } else {
      const filteredResults = resourceList.filter(
        (resource) =>
          resource.rLName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          resource.rLCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filteredResults);
    }
  };

  const updateResourceStatus = (resourceID: number, status: string) => {
    const updatedResources = resourceList.map((resource) =>
      resource.rLID === resourceID ? { ...resource, status } : resource
    );
    setResourceList(updatedResources);
    setSearchResults(updatedResources);
  };

  return (
    <ResourceListContext.Provider
      value={{
        resourceList,
        searchResults,
        performSearch,
        fetchAllResources,
        updateResourceStatus,
      }}
    >
      {children}
    </ResourceListContext.Provider>
  );
};
