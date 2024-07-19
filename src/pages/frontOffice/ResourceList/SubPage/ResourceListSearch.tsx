import React, { useState, useEffect, useCallback } from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Typography,
    Box,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import CustomButton from "../../../../components/Button/CustomButton";
import GlobalSpinner from "../../../../components/GlobalSpinner/GlobalSpinner";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import CustomSwitch from "../../../../components/Checkbox/ColorSwitch";
import { ResourceListData } from "../../../../interfaces/frontOffice/ResourceListData";
import { ResourceListService } from "../../../../services/frontOffice/ResourceListServices";
import { debounce } from "../../../../utils/Common/debounceUtils";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";

interface ResourceListSearchProps {
    show: boolean;
    handleClose: () => void;
    onEditProfile: (resource: ResourceListData) => void;
    selectedResource: ResourceListData | null;
}

const ResourceListSearch: React.FC<ResourceListSearchProps> = ({
    show,
    handleClose,
    onEditProfile,
    selectedResource,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<ResourceListData[]>([]);
    const { token } = useSelector((state: RootState) => state.userDetails);
    const [switchStatus, setSwitchStatus] = useState<{ [key: number]: boolean }>({});

    const performSearch = async (searchQuery: string) => {
        setIsLoading(true);
        try {
            const result = await ResourceListService.getAllResourceLists(token!);
            if (result.success && result.data) {
                const filteredResults = result.data.filter((resource) =>
                    resource.rLName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    resource.rLCode?.toLowerCase().includes(searchQuery.toLowerCase())
                );
                setSearchResults(filteredResults);
            } else {
                console.error("Failed to fetch search results.");
                setSearchResults([]);
            }
        } catch (error) {
            console.error("Error fetching search results:", error);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const debouncedSearch = useCallback(
        debounce((searchQuery: string) => {
            performSearch(searchQuery);
        }, 300),
        [token]
    );

    useEffect(() => {
        if (searchTerm) {
            debouncedSearch(searchTerm);
        } else {
            setSearchResults([]);
        }
    }, [searchTerm, debouncedSearch]);

    const handleEditAndClose = (resource: ResourceListData) => {
        onEditProfile(resource);
    };

    const dataWithIndex = searchResults.map((item, index) => ({
        ...item,
        serialNumber: index + 1,
        Status: item.rActiveYN === "Y" ? "Active" : "Hidden",
      }));
    

    const handleSwitchChange = async (resource: ResourceListData, checked: boolean) => {
        try {
            // Handle switch change (if needed)
            setSwitchStatus((prevState) => ({
                ...prevState,
                [resource.rLID]: checked,
            }));
        } catch (error) {
            console.error("Error updating resource status:", error);
        }
    };

    const columns = [
        { key: "serialNumber", header: "Sl.No", visible: true },
        { key: "rLCode", header: "Resource Code", visible: true },
        { key: "rLName", header: "Resource Name", visible: true },
        { key: "rLOtYN", header: "Is Operation Theatre", visible: true },
        { key: "rLValidateYN", header: "Is Validate", visible: true },
        { key: "Status", header: "Record Status", visible: true },
        {
            key: "userStatus",
            header: "User Status",
            visible: true,
            render: (row: ResourceListData) => (
                <CustomSwitch
                    size="medium"
                    color="secondary"
                    onChange={(e) => handleSwitchChange(row, e.target.checked)}
                    checked={switchStatus[row.rLID] || false}
                />
            ),
        },
        {
            key: "rLID",
            header: "Resource ID",
            visible: false,
        },
    ];

    const handleDialogClose = () => {
        setSearchTerm("");
        handleClose();
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            setSearchTerm(searchTerm.trim());
        }
    };

    return (
        <Dialog
            open={show}
            onClose={(event, reason) => {
                if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
                    handleDialogClose();
                }
            }}
            maxWidth="lg"
            fullWidth
        >
            <DialogTitle>
                <Box>
                    <Typography variant="h6" id="resource-list-header">
                        RESOURCE SEARCH LIST
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent
                sx={{ minHeight: "600px", maxHeight: "600px", overflowY: "auto" }}
            >
                <Box>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6} lg={4}>
                            <FloatingLabelTextBox
                                ControlID="SearchTerm"
                                title="Search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Enter resource name or code"
                                size="small"
                                autoComplete="off"
                                onKeyPress={handleKeyPress}
                            />
                        </Grid>
                    </Grid>
                </Box>
                {isLoading ? (
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        minHeight="500px"
                    >
                        <GlobalSpinner />
                    </Box>
                ) : (
                    <CustomGrid columns={columns} data={dataWithIndex}
                />
                )}
            </DialogContent>
            <DialogActions>
                <CustomButton
                    text="Close"
                    onClick={handleDialogClose}
                    icon={CloseIcon}
                />
            </DialogActions>
        </Dialog>
    );
};

export default ResourceListSearch;
