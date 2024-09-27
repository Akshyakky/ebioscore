import React, { createContext, useEffect, useCallback } from "react";
import { useLoading } from "../LoadingContext";
import { UserListData } from "../../interfaces/SecurityManagement/UserListData";
import { UserListService } from "../../services/SecurityManagementServices/UserListService";

interface UserListSearchContextProps {
    fetchAllUsers: () => Promise<UserListData[]>;
}

export const UserListSearchContext = createContext<UserListSearchContextProps>({
    fetchAllUsers: async () => []
});

interface UserListSearchProviderProps {
    children: React.ReactNode;
}

export const UserListSearchProvider = ({ children }: UserListSearchProviderProps) => {
    const { setLoading } = useLoading();

    const fetchAllUsers = useCallback(async (): Promise<UserListData[]> => {
        setLoading(true);
        try {
            const result = await UserListService.getAllUsers();
            console.log("The users is ", result)
            if (result.success && result.data) {
                return result.data;


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