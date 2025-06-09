import { useState, useEffect, useCallback, useRef } from "react";
import { useLoading } from "@/hooks/Common/useLoading";
import { SaveUserPermissionsRequest, UserListDto } from "@/interfaces/SecurityManagement/UserListData";
import { userListServices } from "@/services/SecurityManagementServices/UserListServices";
import { appUserService } from "@/services/SecurityManagementServices/securityManagementServices";

export const useUserList = () => {
  const [userList, setUserList] = useState<UserListDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isLoading, setLoading } = useLoading();

  const initialFetchDone = useRef(false);

  const fetchUsersList = useCallback(async () => {
    setLoading(true);

    setError(null);

    try {
      const result = await userListServices.getAllAppUsers();

      if (result.success && result.data) {
        setUserList(result.data);
      } else {
        setError(result.errorMessage || "Failed to fetch User List");
      }
    } catch (err) {
      console.error("Error fetching User List", err);
      setError("An unexpected error occurred while fetching User List");
    } finally {
      setLoading(false);
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

  const saveUserListPermissionsByType = async (userListPermissionsDto: SaveUserPermissionsRequest) => {
    try {
      return await userListServices.saveUserListPermissionsByType(userListPermissionsDto);
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

  const getUserListById = useCallback(async (id: number) => {
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
  }, []);

  const saveUserList = useCallback(
    async (user: UserListDto) => {
      try {
        setLoading(true);
        return await appUserService.save(user);
      } catch (err) {
        console.error("Error creating user:", err);
        setError("An unexpected error occurred while creating user");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [fetchUsersList]
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
    [fetchUsersList]
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
    [fetchUsersList]
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
