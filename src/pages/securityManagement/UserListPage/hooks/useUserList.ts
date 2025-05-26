import { useState, useEffect, useCallback, useRef } from "react";
import { useLoading } from "@/hooks/Common/useLoading";
import { UserListDto } from "@/interfaces/SecurityManagement/UserListData";
import { userListServices } from "@/services/SecurityManagementServices/UserListServices";

export const useUserList = () => {
  const [userList, setUserList] = useState<UserListDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isLoading, setLoading } = useLoading();

  const initialFetchDone = useRef(false);

  const fetchUsersList = useCallback(async () => {
    if (setLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await userListServices.getAllAppUsers();

      if (result.success && result.data) {
        setUserList(result.data);
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
  const getUsersWithoutCredentials = async () => {
    try {
      return await userListServices.getUsersWithoutCredentials();
    } catch (error) {
      console.error("Error fetching users without credentials:", error);
      throw error;
    }
  };

  const getUserListPermissionsByType = async (appID: number, mainID: number, subID: number, type: string) => {
    try {
      return await userListServices.getUserListPermissionsByType(appID, mainID, subID, type);
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      throw error;
    }
  };

  const saveUserListPermissionsByType = async (userListPermissionsDto: any[], permissionType: string) => {
    try {
      return await userListServices.saveUserListPermissionsByType(userListPermissionsDto, permissionType);
    } catch (error) {
      console.error("Error saving user permissions:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchUsersList();
      initialFetchDone.current = true;
    }
  }, [fetchUsersList]);

  const getUserListById = useCallback(
    async (id: number) => {
      try {
        setLoading(true);
        const result = await userListServices.getById(id);
        if (result.success && result.data) {
          return result.data;
        } else {
          setError(result.errorMessage || "Failed to fetch user");
          return null;
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("An unexpected error occurred while fetching user");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  const saveUserList = useCallback(
    async (user: UserListDto) => {
      try {
        setLoading(true);
        return await userListServices.save(user);
      } catch (err) {
        console.error("Error creating user:", err);
        setError("An unexpected error occurred while creating user");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [fetchUsersList, setLoading]
  );

  const deleteUserList = useCallback(
    async (id: number) => {
      try {
        setLoading(true);
        const result = await userListServices.delete(id);
        if (result.success) {
          await fetchUsersList();
          return true;
        } else {
          setError(result.errorMessage || "Failed to delete User");
          return false;
        }
      } catch (err) {
        console.error("Error deleting User:", err);
        setError("An unexpected error occurred while deleting User");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchUsersList, setLoading]
  );

  const updateUserListStatus = useCallback(
    async (id: number, active: boolean) => {
      try {
        setLoading(true);
        const result = await userListServices.updateActiveStatus(id, active);
        if (result.success) {
          await fetchUsersList();
          return true;
        } else {
          setError(result.errorMessage || "Failed to update User status");
          return false;
        }
      } catch (err) {
        console.error("Error updating User status:", err);
        setError("An unexpected error occurred while updating User status");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchUsersList, setLoading]
  );

  return {
    userList,
    isLoading,
    error,
    fetchUsersList,
    saveUserList,
    getUserListById,
    deleteUserList,
    updateUserListStatus,
    saveUserListPermissionsByType,
    getUserListPermissionsByType,
    getUsersWithoutCredentials,
  };
};
