import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { UserListDto } from "@/interfaces/SecurityManagement/UserListData";
import { userListServices } from "@/services/SecurityManagementServices/UserListServices";

const useGenericUserList = createEntityHook<UserListDto>(userListServices, "appID");

export const useUserList = () => {
  const hook = useGenericUserList();

  const getUsersWithoutCredentials = async () => {
    try {
      return await userListServices.getUsersWithoutCredentials();
    } catch (error) {
      console.error("Error fetching users without credentials:", error);
      throw error;
    }
  };

  const getAllAppUsers = async () => {
    try {
      return await userListServices.getAllAppUsers();
    } catch (error) {
      console.error("Error fetching all app users:", error);
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

  return {
    userList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchUserList: hook.fetchEntityList,
    getUserById: hook.getEntityById,
    saveUser: hook.saveEntity,
    deleteUser: hook.deleteEntity,
    updateUserStatus: hook.updateEntityStatus,
    getNextCode: hook.getNextCode,
    getUsersWithoutCredentials,
    getAllAppUsers,
    getUserListPermissionsByType,
    saveUserListPermissionsByType,
  };
};
