import React, { useEffect, useState } from "react";
import { BServiceGrpDto } from "../../../../interfaces/Billing/BServiceGrpDto";
import { ServiceGroupListCodeService } from "../../../../services/BillingServices/ServiceGroupsListService";
import { Edit } from "@mui/icons-material";
import CustomButton from "../../../../components/Button/CustomButton";
import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography } from "@mui/material";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
import Close from "@mui/icons-material/Close";
import CustomSwitch from "../../../../components/Checkbox/ColorSwitch";
import { Box } from "@mui/material";

interface ServiceGroupsListSearchProps {
    open: boolean;
    onClose: () => void;
    onSelect: (SGRP: BServiceGrpDto) => void;
}

const ServiceGroupsListSearch: React.FC<ServiceGroupsListSearchProps> = ({ open, onClose, onSelect }) => {
    const [switchStatus, setSwitchStatus] = useState<{ [key: number]: boolean }>({});
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<BServiceGrpDto[]>([]);
    useEffect(() => {
        if (open) {
            fetchAllServiceGroupsList();
        }
    }, [open]);

    const fetchAllServiceGroupsList = async () => {
        const result = await ServiceGroupListCodeService.getAllBServiceGrps();
        if (result.success && result.data) {
            const initialSwitchStatus = result.data.reduce((statusMap, item) => {
                statusMap[item.sGrpID] = item.rActiveYN === "Y";
                return statusMap;
            }, {} as { [key: number]: boolean });
            setSwitchStatus(initialSwitchStatus);
            setSearchResults(result.data);
        } else {
            setSearchResults([]);
        }
    };

    const handleEditAndClose = (SGRP: BServiceGrpDto) => {
        onClose();
        onSelect(SGRP);
    };

    const handleSwitchChange = async (SGRP: BServiceGrpDto, checked: boolean) => {
        const result = await ServiceGroupListCodeService.updateBServiceGrpActiveStatus(SGRP.sGrpID, checked);
        if (result.success) {
            setSwitchStatus((prev) => ({ ...prev, [SGRP.sGrpID]: checked }));
        }
    };

    const dataWithIndex = searchResults.map((item, index) => ({
        ...item,
        serialNumber: index + 1,
        Status: switchStatus[item.sGrpID] ? "Active" : "Hidden",
    }));

    const columns = [
        {
            key: "SGrpEdit",
            header: "Edit",
            visible: true,
            render: (row: BServiceGrpDto) => (
                <CustomButton
                    text="Edit"
                    onClick={() => handleEditAndClose(row)}
                    icon={Edit}
                />
            )
        },
        { key: "serialNumber", header: "Sl No", visible: true },
        { key: "sGrpCode", header: "Service Group Code", visible: true },
        { key: "sGrpName", header: "Service Group Name", visible: true },
        { key: "rNotes", header: "Remarks", visible: true },
        {
            key: "status", header: "Status", visible: true, render: (row: BServiceGrpDto) => (
                <Typography variant="body2">
                    {switchStatus[row.sGrpID] ? "Active" : "Hidden"}
                </Typography>
            ),
        },
        {
            key: "SGRPStatus", header: "Action", visible: true, render: (row: BServiceGrpDto) => (
                <CustomSwitch
                    size="medium"
                    color="secondary"
                    checked={switchStatus[row.sGrpID]}
                    onChange={(event) => handleSwitchChange(row, event.target.checked)}
                />
            ),
        }
    ];

    const handleDialogClose = () => {
        setSearchTerm("");
        onClose();
    };

    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    return (
        <Dialog
            open={open}
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
                    <Typography variant="h6" id="serviceGroup-list-header">
                        SERVICE GROUPS LIST
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ minHeight: "600px", maxHeight: "600px", overflowY: "auto" }} >
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
            </DialogContent>
            <DialogActions>
                <CustomButton
                    variant="contained"
                    text="Close"
                    icon={Close}
                    size="medium"
                    onClick={handleDialogClose}
                    color="secondary"
                />
            </DialogActions>
        </Dialog>
    );
}
export default ServiceGroupsListSearch;