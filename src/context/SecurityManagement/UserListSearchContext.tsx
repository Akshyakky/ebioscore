import { UserListData } from "@/interfaces/SecurityManagement/UserListData";
import React, { createContext, useEffect, useCallback } from "react";
import { useLoading } from "@/hooks/Common/useLoading";
import { userListServices } from "@/services/SecurityManagementServices/UserListServices";

interface UserListSearchContextProps {
  fetchAllUsers: () => Promise<UserListData[]>;
}

export const UserListSearchContext = createContext<UserListSearchContextProps>({
  fetchAllUsers: async () => [],
});

interface UserListSearchProviderProps {
  children: React.ReactNode;
}

export const UserListSearchProvider = ({ children }: UserListSearchProviderProps) => {
  const { setLoading } = useLoading();

  const fetchAllUsers = useCallback(async (): Promise<any[]> => {
    setLoading(true);
    try {
      const result = await userListServices.getAllAppUsers();
      console.log("The users is ", result);
      if (result.success && result.data) {
        return [];
      } else {
        return [];
      }
    } catch (error) {
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  return (
    <UserListSearchContext.Provider
      value={{
        fetchAllUsers,
      }}
    >
      {children}
    </UserListSearchContext.Provider>
  );
};
