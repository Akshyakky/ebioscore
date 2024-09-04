import React, { useState } from "react";
import { BreakListConDetailsService } from "../../../../services/FrontOfficeServices/BreakListServices/BreakListConDetailService";
import { BreakListService } from "../../../../services/FrontOfficeServices/BreakListServices/BreakListService";
import { formatDate } from "../../../../utils/Common/dateUtils";
import BreakSuspendDetails from "./BreakSuspendDetails";
import { useServerDate } from "../../../../hooks/Common/useServerDate";
import PauseCircleOutline from "@mui/icons-material/PauseCircleOutline";
import PlayCircleOutline from "@mui/icons-material/PlayCircleOutline";
import { BreakConSuspendService } from "../../../../services/FrontOfficeServices/BreakConSuspendService";
import GenericAdvanceSearch from "../../../../components/GenericDialog/GenericAdvanceSearch";
import CustomButton from "../../../../components/Button/CustomButton";

interface BreakListSearchProps {
    open: boolean;
    onClose: () => void;
    onSelect: (BreakList: any) => void;
}

const BreakListSearch: React.FC<BreakListSearchProps> = ({ open, onClose, onSelect }) => {
    const serverDate = useServerDate();
    const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
    const [selectedBreak, setSelectedBreak] = useState<any>(null);

    const fetchItems = async () => {
        const result = await BreakListConDetailsService.getAllBreakConDetails();
        return result.success && result.data ? result.data : [];
    };

    const updateActiveStatus = async (blID: number, status: boolean) => {
        const result = await BreakListService.updateBreakListActiveStatus(blID, status);
        return result.success;
    };

    const handleSuspendResume = (breakData: any, isSuspend: boolean) => {
        if (isSuspend) {
            handleSuspend(breakData);
        } else {
            handleResume(breakData);
        }
    };

    const handleResume = async (breakData: any) => {
        try {
            const result = await BreakConSuspendService.updateBreakConSuspendActiveStatus(breakData.bcsID, false);
            if (result.success) {
            } else {
                console.error("Failed to resume the break:", result.errorMessage);
            }
        } catch (error) {
            console.error("Error resuming the break:", error);
        }
    };

    const handleSuspend = (breakData: any) => {
        setSelectedBreak({
            ...breakData,
            blStartDate: formatDate(breakData.blStartDate),
            blEndDate: formatDate(breakData.blEndDate)
        });
        setSuspendDialogOpen(true);
    };

    const handleSuspendDialogClose = () => {
        setSuspendDialogOpen(false);
        setSelectedBreak(null);
    };

    const columns = [
        { key: "serialNumber", header: "Sl No", visible: true },
        { key: "breakName", header: "Break Name", visible: true },
        { key: "conResName", header: "Consultant/Resource Name", visible: true },
        { key: "rNotes", header: "Remarks", visible: true },
        { key: "hPLID", header: "hPLID", visible: false },
        {
            key: "blStartDate",
            header: "Break Start Date",
            visible: true,
            render: (row: any) => formatDate(row.blStartDate),
        },
        {
            key: "blEndDate",
            header: "Break End Date",
            visible: true,
            render: (row: any) => formatDate(row.blEndDate),
        },
        {
            key: "SuspendStatus",
            header: "Suspend/Resume",
            visible: true,
            render: (row: any) => {
                const isSuspend = row.suspendStatus === "Suspend";
                return (
                    <CustomButton
                        text={isSuspend ? "Suspend" : "Resume"}
                        onClick={() => handleSuspendResume(row, isSuspend)}
                        icon={isSuspend ? PauseCircleOutline : PlayCircleOutline}
                        color={isSuspend ? "error" : "success"}
                        size="small"
                    />
                );
            }
        },
    ];

    return (
        <>
            <GenericAdvanceSearch
                open={open}
                onClose={onClose}
                onSelect={onSelect}
                title="Break Frequency Details"
                fetchItems={fetchItems}
                updateActiveStatus={updateActiveStatus}
                columns={columns}
                getItemId={(item: any) => item.blID}
                getItemActiveStatus={(item: any) => item.rActiveYN === "Y"}
                searchPlaceholder="Enter resource name or code"
                dialogProps={{
                    maxWidth: "xl",
                    fullWidth: true,
                    dialogContentSx: { maxHeight: '400px' }
                }}
            />
            <BreakSuspendDetails
                open={suspendDialogOpen}
                onClose={handleSuspendDialogClose}
                breakData={selectedBreak}
            />
        </>
    );
};

export default BreakListSearch;