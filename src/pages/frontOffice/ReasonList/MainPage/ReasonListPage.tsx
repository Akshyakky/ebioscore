import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import { ReasonListData } from "../../../../interfaces/FrontOffice/ReasonListData";
import MainLayout from "../../../../layouts/MainLayout/MainLayout";
import GlobalSpinner from "../../../../components/GlobalSpinner/GlobalSpinner";
import ActionButtonGroup from "../../../../components/Button/ActionButtonGroup";
import SearchIcon from "@mui/icons-material/Search";
import { notifyError } from "../../../../utils/Common/toastManager";
import { Box, Container } from "@mui/material";
import ReasonDetails from "../../ReasonList/SubPage/ReasonDetails";
import { ReasonListService } from "../../../../services/FrontOfficeServices/ReasonListService";
import ReasonListSearch from "../SubPage/ReasonListSearch";

const ReasonListPage: React.FC = () => {
    const { token } = useSelector((state: RootState) => state.userDetails);
    const [reasonList, setReasonList] = useState<ReasonListData[]>([]);
    const [selectedReason, setSelectedReason] = useState<ReasonListData | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);

    // Fetch Reason List Function
    const fetchReasonList = async () => {
        setLoading(true);
        try {
            const result = await ReasonListService.getAllReasonLists(token!);
            if (result.success) {
                setReasonList(result.data || []);
            } else {
                notifyError(result.errorMessage || "Failed to fetch reason list.");
            }
        } catch (error) {
            notifyError("An error occurred while fetching the reason list.");
        }
        setLoading(false);
    };

    // Handle Save Operation
    const handleSave = (savedReason: ReasonListData) => {
        if (isEditMode) {
            setReasonList((prev) =>
                prev.map((reason) => (reason.arlID === savedReason.arlID ? savedReason : reason))
            );
        } else {
            setReasonList((prev) => [...prev, savedReason]);
        }
        setIsEditMode(false);
        setSelectedReason(null);
    };

    // Handle Clear Operation
    const handleClear = () => {
        setSelectedReason(null);
        setIsEditMode(false);
    };

    // Handle Edit Operation
    const handleEdit = (reason: ReasonListData) => {
        setSelectedReason(reason);
        setIsEditMode(true);
    };

    const handleAdvancedSearch = () => {
        setIsSearchDialogOpen(true);
        fetchReasonList();
    };

    const handleCloseSearchDialog = () => {
        setIsSearchDialogOpen(false);
    };

    return (
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
            {loading && <GlobalSpinner />}
            <ReasonDetails
                reason={selectedReason}
                onSave={handleSave}
                onClear={handleClear}
                isEditMode={isEditMode}
            />
            <ReasonListSearch
                show={isSearchDialogOpen}
                handleClose={handleCloseSearchDialog}
                onEditProfile={handleEdit}
                selectedReason={selectedReason}
            />
        </Container>
    );
};

export default ReasonListPage;
