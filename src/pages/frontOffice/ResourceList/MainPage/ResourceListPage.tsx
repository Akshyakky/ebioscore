import { useContext, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import MainLayout from "../../../../layouts/MainLayout/MainLayout";
import { Box, Container } from "@mui/material";
import ActionButtonGroup from "../../../../components/Button/ActionButtonGroup";
import SearchIcon from "@mui/icons-material/Search";
import ResourceDetails from "../SubPage/ResourceDeatails";
import ResourceListSearch from "../SubPage/ResourceListSearch";

interface OperationPermissionProps {
    profileID: number;
    appUserName: string;
}

const ResourceListPage: React.FC<OperationPermissionProps> = () => {
    const [isSaved, setIsSaved] = useState(false);
    const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
    //   const { fetchAllUsers, updateUserStatus } = useContext(UserListSearchContext);
    const { token, } = useSelector((state: RootState) => state.userDetails);

    //   const [selectedUser, setSelectedUser] = useState<UserListData | null>(null);
    const [isSuperUser, setIsSuperUser] = useState<boolean>(false);
    //   const [permissions, setPermissions] = useState<ModuleOperation[]>([]);
    //   const [reportPermissions, setReportPermissions] = useState<ModuleOperation[]>([]);



    const handleAdvancedSearch = async () => {
        setIsSearchDialogOpen(true);

    };

    const handleCloseSearchDialog = () => {
        setIsSearchDialogOpen(false);
    };
    const handleSave = async () => {
        setIsSaved(true);
        // setSelectedUser(profile);
    };

    const handleClear = () => {
        setIsSaved(false);
        // setSelectedUser(null);
    };

   const  handleEditUser=()=>{
    console.log("edited ")
   }

    return (
        <MainLayout>
            <Container maxWidth={false}>
                <Box sx={{ marginBottom: 2 }}>
                    <ActionButtonGroup
                        buttons={[
                            {
                                variant: "contained",
                                size: "medium",
                                icon: SearchIcon,
                                text: "Advanced Search",
                                onClick: handleAdvancedSearch,
                            },
                        ]}
                    />
                </Box>

                <ResourceDetails
                    onSave={handleSave}
                    onClear={handleClear} resource={null} isEditMode={false}                
                //   refreshUsers={refreshUsers}
                //   updateUserStatus={updateUserStatus}
                //   onSuperUserChange={handleSuperUserChange}
                />



                <ResourceListSearch
                    show={isSearchDialogOpen}
                    handleClose={handleCloseSearchDialog}
                    onEditProfile={handleEditUser} selectedUser={null}                   
                />
            </Container>
        </MainLayout>
    );
};

export default ResourceListPage;
