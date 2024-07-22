import React, { useContext, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import MainLayout from "../../../../layouts/MainLayout/MainLayout";
import { Box, Container } from "@mui/material";
import ActionButtonGroup from "../../../../components/Button/ActionButtonGroup";
import SearchIcon from "@mui/icons-material/Search";
import ResourceDetails from "../SubPage/ResourceDeatails";
import ResourceListSearch from "../SubPage/ResourceListSearch";
import { ResourceListData } from "../../../../interfaces/frontOffice/ResourceListData";
import { ResourceListContext } from "../../../../context/frontOffice/ResourceListContext";

interface OperationPermissionProps {
    profileID: number;
    appUserName: string;
}

const ResourceListPage: React.FC<OperationPermissionProps> = () => {
    const [isSaved, setIsSaved] = useState(false);
    const [selectedResource, setSelectedResource] = useState<ResourceListData | null>(null);
    const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
    const { token } = useSelector((state: RootState) => state.userDetails);
    const { fetchAllResources, updateResourceStatus } = useContext(ResourceListContext);

    const handleAdvancedSearch = async () => {
        setIsSearchDialogOpen(true);
        await fetchAllResources();
    };

    const handleCloseSearchDialog = () => {
        setIsSearchDialogOpen(false);
    };

    const handleSave = async (resource: ResourceListData) => {
        setIsSaved(true);
        setSelectedResource(resource);
    };

    const handleClear = () => {
        setIsSaved(false);
        setSelectedResource(null);
    };

    const handleEditUser = (resource: ResourceListData) => {
        debugger 
        setSelectedResource(resource);
        setIsSaved(true);
        handleCloseSearchDialog();
    };

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
                    onClear={handleClear}
                    resource={selectedResource}
                    isEditMode={!!selectedResource}
                    // updateResourceStatus={updateResourceStatus}
                />
                <ResourceListSearch
                    show={isSearchDialogOpen}
                    handleClose={handleCloseSearchDialog}
                    onEditProfile={handleEditUser}
                    selectedResource={selectedResource}
                />
            </Container>
        </MainLayout>
    );
};

export default ResourceListPage;