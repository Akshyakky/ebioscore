import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { useLoading } from "../LoadingContext";
import { useSelector } from "react-redux";
import { RootState } from "../../store/reducers";
import { notifyError, notifySuccess } from "../../utils/Common/toastManager";
import { UserListData } from "../../interfaces/SecurityManagement/UserListData";
import { UserListService } from "../../services/SecurityManagementServices/UserListService";


interface UserListSearchContextProps {
    searchResults: UserListData[];
    performSearch: (searchTerm: string) => Promise<void>;
    fetchAllUsers: () => Promise<void>;
    updateUserStatus: (appID: number, status: boolean) => void;
}

export const UserListSearchContext = createContext<UserListSearchContextProps>({
    searchResults: [],
    performSearch: async () => {},
    fetchAllUsers: async () => {},
    updateUserStatus: () => {},
});

interface UserListSearchProviderProps {
    children: React.ReactNode;
}

export const UserListSearchProvider = ({ children }: UserListSearchProviderProps) => {
    const [allUsers, setAllUsers] = useState<UserListData[]>([]);
    const [searchResults, setSearchResults] = useState<UserListData[]>([]);
    const { setLoading } = useLoading();
    const userInfo = useSelector((state: RootState) => state.userDetails);
    const token = userInfo?.token;

    const fetchAllUsers = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const result = await UserListService.getAllUsers(token);
            if (result.success && result.data) {
                setAllUsers(result.data);
                setSearchResults(result.data);
            } else {
                console.error("Failed to fetch users: no data found");
                notifyError("Failed to fetch users. Please try again.");
            }
        } catch (error) {
            console.error("Error fetching users", error);
            notifyError("An error occurred while fetching users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllUsers();
    }, [token]);

    const performSearch = async (searchTerm: string): Promise<void> => {
        if (searchTerm.trim() === "") {
            setSearchResults(allUsers);
        } else {
            const filteredResults = allUsers.filter(
                (user) =>
                    (user.appUserName && user.appUserName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (user.appGeneralCode && user.appGeneralCode.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setSearchResults(filteredResults);
        }
    };

    const updateUserStatus = (appID: number, status: boolean) => {
        const updatedUsers = allUsers.map((user) =>
            user.appID === appID ? { ...user, rActiveYN: status ? "Y" : "N" } : user
        );
        setAllUsers(updatedUsers);
        setSearchResults(updatedUsers);
    };

    return (
        <UserListSearchContext.Provider
            value={{
                searchResults,
                performSearch,
                fetchAllUsers,
                updateUserStatus,
            }}
        >
            {children}
        </UserListSearchContext.Provider>
    );
};