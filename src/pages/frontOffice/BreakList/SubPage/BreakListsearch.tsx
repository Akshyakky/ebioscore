import { useEffect, useState } from "react";
import { BreakListConDetailsService } from "../../../../services/FrontOfficeServices/BreakListServices/BreakListConDetailService";
import { BreakListService } from "../../../../services/FrontOfficeServices/BreakListServices/BreakListService";
import CustomButton from "../../../../components/Button/CustomButton";
import Edit from "@mui/icons-material/Edit";
import { Box, Grid, Typography } from "@mui/material";
import CustomSwitch from "../../../../components/Checkbox/ColorSwitch";
import GenericDialog from "../../../../components/GenericDialog/GenericDialog";
import Close from "@mui/icons-material/Close";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import { formatDate } from "../../../../utils/Common/dateUtils";
import BreakSuspendDetails from "./BreakSuspendDetails";
import { useServerDate } from "../../../../hooks/Common/useServerDate";

interface BreakListSearchProps {
    open: boolean;
    onClose: () => void;
    onSelect: (BreakList: any) => void;
}
const BreakListSearch: React.FC<BreakListSearchProps> = ({ open, onClose, onSelect }) => {
    const serverDate = useServerDate();
    const [switchStatus, setSwitchStatus] = useState<{ [key: number]: boolean }>({});
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
    const [selectedBreak, setSelectedBreak] = useState<any>(null);
    useEffect(() => {
        if (open) {
            getAllBreakConDetails();
        }
    }, [open]);

    const getAllBreakConDetails = async () => {
        const result = await BreakListConDetailsService.getAllBreakConDetails();
        if (result.success && result.data) {
            const initialSwitchStatus = result.data.reduce((statusMap, item) => {
                statusMap[item.blID] = item.rActiveYN === "Y";
                return statusMap;
            }, {} as { [key: number]: boolean });
            setSwitchStatus(initialSwitchStatus);
            setSearchResults(result.data);
        } else {
            setSearchResults([]);
        }
    };

    const handleEditAndClose = (BreakList: any) => {
        onClose();
        onSelect(BreakList);
    };

    const handleSwitchChange = async (BreakList: any, checked: boolean) => {
        const result = await BreakListService.updateBreakListActiveStatus(BreakList.blID, checked);
        if (result.success) {
            setSwitchStatus((prev) => ({ ...prev, [BreakList.blID]: checked }));
        }
    };

    const dataWithIndex = searchResults.map((item, index) => ({
        ...item,
        serialNumber: index + 1,
        Status: switchStatus[item.blID] ? "Active" : "Hidden",
    }));

    const columns = [
        {
            key: "BreakListEdit",
            header: "Edit",
            visible: true,
            render: (row: any) => (
                <CustomButton
                    text="Edit"
                    onClick={() => handleEditAndClose(row)}
                    icon={Edit}
                />
            )
        },
        { key: "serialNumber", header: "Sl No", visible: true },
        { key: "breakName", header: "Break Name", visible: true },
        { key: "conResName", header: "Consultant/Resource Name", visible: true },
        { key: "rNotes", header: "Remarks", visible: true },
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
            key: "recordStatus", header: "Status", visible: true, render: (row: any) => (
                <Typography variant="body2">
                    {switchStatus[row.blID] ? "Active" : "Hidden"}
                </Typography>
            ),
        },
        {
            key: "BreakStatus", header: "Action", visible: true, render: (row: any) => (
                <CustomSwitch
                    size="medium"
                    color="secondary"
                    checked={switchStatus[row.blID]}
                    onChange={(event) => handleSwitchChange(row, event.target.checked)}
                />
            ),
        },
        {
            key: "BreakListSuspend",
            header: "Suspend",
            visible: true,
            render: (row: any) => (
                <CustomButton
                    text="Suspend"
                    onClick={() => handleSuspend(row)}
                    icon={Close}
                    color="secondary"
                />
            )
        },
    ];

    const handleSuspend = (breakData: any) => {
        setSelectedBreak({
            ...breakData,
            bCSStartDate: serverDate,
            bCSEndDate: serverDate
        });
        setSuspendDialogOpen(true);
    };

    const handleSuspendDialogClose = () => {
        setSuspendDialogOpen(false);
        setSelectedBreak(null);
    };

    const handleDialogClose = () => {
        setSearchTerm("");
        onClose();
    };

    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    return (<>
        <GenericDialog
            open={open}
            onClose={onClose}
            title="Break Frequency Details"
            maxWidth="xl"
            disableEscapeKeyDown={true}
            disableBackdropClick={true}
            dialogContentSx={{ maxHeight: '400px' }}
            fullWidth
            actions={
                <CustomButton
                    variant="contained"
                    text="Close"
                    onClick={handleDialogClose}
                    icon={Close}
                    size="small"
                    color="secondary"
                />
            }>
            <Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6} lg={4}>
                        <FloatingLabelTextBox
                            ControlID="SearchTerm"
                            title="Search"
                            value={searchTerm}
                            onChange={handleSearchInputChange}
                            placeholder="Enter resource name or code"
                            size="small"
                            autoComplete="off"
                        />
                    </Grid>
                </Grid>
            </Box>
            <CustomGrid columns={columns} data={dataWithIndex} searchTerm={searchTerm} />
        </GenericDialog>
        <BreakSuspendDetails
            open={suspendDialogOpen}
            onClose={handleSuspendDialogClose}
            breakData={selectedBreak}
        />
    </>)
}
export default BreakListSearch;