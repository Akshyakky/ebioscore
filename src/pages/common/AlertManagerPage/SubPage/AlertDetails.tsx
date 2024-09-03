import React, { useCallback, useEffect, useRef, useState } from "react";
import { AlertDto } from "../../../../interfaces/Common/AlertManager";
import { Grid, Paper, Typography } from "@mui/material";
import FormField from "../../../../components/FormField/FormField";
import { useLoading } from "../../../../context/LoadingContext";
import { useServerDate } from "../../../../hooks/Common/useServerDate";
import { useSelector } from "react-redux";
import { store } from "../../../../store/store";
import { RootState } from "../../../../store/reducers";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import CustomGrid, {
    Column,
} from "../../../../components/CustomGrid/CustomGrid";
import EditIcon from "@mui/icons-material/Edit";
import { AlertManagerServices } from "../../../../services/CommonServices/AlertManagerServices";
import { showAlert } from "../../../../utils/Common/showAlert";
import AutocompleteTextBox from "../../../../components/TextBox/AutocompleteTextBox/AutocompleteTextBox";
import { usePatientAutocomplete } from "../../../../hooks/PatientAdminstration/usePatientAutocomplete";
import CustomButton from "../../../../components/Button/CustomButton";
import extractNumbers from "../../../../utils/PatientAdministration/extractNumbers";
import { ContactMastService } from "../../../../services/CommonServices/ContactMastService";
import { RevisitService } from "../../../../services/PatientAdministrationServices/RevisitService/RevisitService";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";

const AlertDetails: React.FC<{ editData?: AlertDto }> = ({ editData }) => {
    const [formState, setFormState] = useState({
        isSubmitted: false,
        oPIPAlertID: 0,
        oPIPNo: 0,
        rActiveYN: "Y",
        pChartID: 0,
        oPIPCaseNo: 0,
        patOPIPYN: "Y",
        alertDescription: "",
        oPIPDate: new Date(),
        category: "",
        oldPChartID: 0,
        oPVID: 0,
        pChartCode: "",
    });

    const [alerts, setAlerts] = useState<AlertDto[]>([]);
    const [searchTerm] = useState("");
    const { setLoading } = useLoading();
    const serverDate = useServerDate();
    const { userID, userName } = store.getState().userDetails;
    const uhidRef = useRef<HTMLInputElement>(null);
    const userInfo = useSelector((state: RootState) => state.userDetails);
    const token = userInfo.token!;
    const { fetchPatientSuggestions } = usePatientAutocomplete(token);
    const [, setSelectedPChartID] = useState<number>(0);
    const [, setAvailableAttendingPhysicians] = useState<DropdownOption[]>([]);

    useEffect(() => {
        debugger
        if (editData) {
            setFormState({
                isSubmitted: false,
                oPIPAlertID: editData.oPIPAlertID || 0,
                oPIPNo: editData.oPIPNo || 0,
                pChartID: editData.pChartID || 0,
                oPIPCaseNo: editData.oPIPCaseNo || 0,
                patOPIPYN: editData.patOPIPYN || "Y",
                rActiveYN: editData.rActiveYN || "Y",
                alertDescription: editData.alertDescription || "",
                oPIPDate: editData.oPIPDate || serverDate,
                category: editData.category || "",
                oldPChartID: editData.oldPChartID || 0,
                oPVID: editData.oPVID || 0,
                pChartCode: editData.pChartCode || "",
            });
        } else {
            handleClear();
        }
    }, [editData]);

    const createAlertTypeDto = useCallback(
        (): AlertDto => ({
            oPIPAlertID: editData ? editData.oPIPAlertID : 0,
            oPIPNo: formState.oPIPNo,
            pChartID: formState.pChartID,
            oPIPCaseNo: formState.oPIPCaseNo,
            patOPIPYN: formState.patOPIPYN,
            alertDescription: formState.alertDescription,
            rActiveYN: formState.rActiveYN,
            oPIPDate: serverDate || new Date(),
            rCreatedID: userID || 0,
            rCreatedOn: serverDate || new Date(),
            rCreatedBy: userName || "",
            rModifiedID: userID || 0,
            rModifiedOn: serverDate || new Date(),
            rModifiedBy: userName || "",
            category: formState.category,
            oldPChartID: formState.oldPChartID,
            payID: 0,
            oPVID: formState.oPVID,
            pChartCode: formState.pChartCode || ""
        }),
        [formState, editData, userID, userName, serverDate]
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormState((prev) => ({
                ...prev,
                [name]: name === "pChartID" ? parseInt(value) || 0 : value,
            }));
        },
        []
    );

    const handleSave = async () => {
        debugger;
        setFormState((prev) => ({ ...prev, isSubmitted: true }));
        setLoading(true);

        try {
            debugger
            const AlertData = createAlertTypeDto();
            const result = await AlertManagerServices.saveAlert(AlertData);
            if (result.success) {
                showAlert("Success", "Resource List saved successfully!", "success", {
                    onConfirm: handleClear,
                });
            } else {
                showAlert(
                    "Error",
                    result.errorMessage || "Failed to save Resource List.",
                    "error"
                );
            }
        } catch (error) {
            console.error("Error saving Resource List:", error);
            showAlert("Error", "An unexpected error occurred while saving.", "error");
        } finally {
            setLoading(false);
        }
    };
    const handleClear = useCallback(() => {
        setFormState((prevState) => ({
            isSubmitted: false,
            oPIPAlertID: 0,
            oPIPNo: 0,
            rActiveYN: "Y",
            pChartID: 0,
            oPIPCaseNo: 0,
            patOPIPYN: "Y",
            alertDescription: "",
            oPIPDate: new Date(),
            category: "",
            oldPChartID: 0,
            oPVID: 0,
            pChartCode: prevState.pChartCode,  // Retain the UHID value
        }));
        setSelectedPChartID(0);
    }, []);

    const handleActiveToggle = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setFormState((prev) => ({
                ...prev,
                rActiveYN: event.target.checked ? "Y" : "N",
            }));
        },
        []
    );

    const handleAdd = () => {
        const newAlert = createAlertTypeDto();
        setAlerts((prevAlerts) => [...prevAlerts, newAlert]);

    };

    const handleEdit = (item: AlertDto) => {
        setFormState({
            ...formState,
            ...item,
            pChartCode: item.pChartCode,
            isSubmitted: false,
        });
    };



    const handleDelete = (item: AlertDto) => {
        setAlerts((prevAlerts) =>
            prevAlerts.filter((alert) => alert.oPIPAlertID !== item.oPIPAlertID)
        );
    };

    const handlePatientSelect = async (selectedSuggestion: string) => {
        setLoading(true);
        try {
            const numbersArray = extractNumbers(selectedSuggestion);
            const pChartID = numbersArray.length > 0 ? numbersArray[0] : null;
            if (pChartID) {
                setSelectedPChartID(pChartID);
                const availablePhysicians =
                    await ContactMastService.fetchAvailableAttendingPhysicians(
                        token,
                        pChartID
                    );
                setAvailableAttendingPhysicians(availablePhysicians);
                const lastVisitResult =
                    await RevisitService.getLastVisitDetailsByPChartID(token, pChartID);
                if (lastVisitResult && lastVisitResult.success) {
                    const isAttendingPhysicianAvailable = availablePhysicians.some(
                        (physician) => physician.value === lastVisitResult.data.attndPhyID
                    );

                    setFormState((prevFormData) => ({
                        ...prevFormData,
                        pChartCode: selectedSuggestion.split("|")[0].trim(),
                        pChartID: pChartID,
                        attndPhyID: isAttendingPhysicianAvailable
                            ? lastVisitResult.data.attndPhyID
                            : 0,
                    }));
                } else {
                    console.error(
                        "Failed to fetch last visit details or no details available"
                    );
                }
            }
        } catch (error) {
            console.error("Error in handlePatientSelect:", error);
        } finally {
            setLoading(false);
        }
    };

    const columns: Column<AlertDto>[] = [
        { key: "oPIPAlertID", header: "Sl No.", visible: true },
        {
            key: "oPIPDate",
            header: "Date",
            visible: true,
            formatter: (value: Date) => value.toLocaleDateString(),
        },
        { key: "alertDescription", header: "Description", visible: true },
        { key: "rCreatedBy", header: "Created By", visible: true },
        {
            key: "edit",
            header: "Edit",
            visible: true,
            render: (item: AlertDto) => (
                <EditIcon
                    onClick={() => handleEdit(item)}
                    style={{ cursor: "pointer" }}
                />
            ),
        },
        {
            key: "delete",
            header: "Delete",
            visible: true,
            render: (item: AlertDto) => (
                <DeleteIcon
                    onClick={() => handleDelete(item)}
                    style={{ cursor: "pointer" }}
                />
            ),
        },
    ];

    return (
        <Paper variant="elevation" sx={{ padding: 2 }}>
            <Typography variant="h6" id="resource-details-header">
                Alert Manager
            </Typography>

            <section>
                <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
                    <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
                        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
                            <AutocompleteTextBox
                                ref={uhidRef}
                                ControlID="UHID"
                                title="UHID"
                                type="text"
                                size="small"
                                placeholder="Search through UHID, Name, DOB, Phone No...."
                                value={editData ? formState.pChartCode : formState.pChartCode || ""}  // Maintain value in edit mode
                                onChange={(e) => {
                                    if (!editData) {
                                        setFormState({
                                            ...formState,
                                            pChartCode: e.target.value,
                                        });
                                    }
                                }}
                                fetchSuggestions={fetchPatientSuggestions}
                                isMandatory={true}
                                onSelectSuggestion={handlePatientSelect}
                                isSubmitted={formState.isSubmitted}
                                disabled={!!editData}
                            />

                        </Grid>

                    </Grid>
                </Grid>

                <Grid container spacing={2}>
                    <FormField
                        type="textarea"
                        label="Alert Message"
                        value={formState.alertDescription}
                        onChange={handleInputChange}
                        isSubmitted={formState.isSubmitted}
                        name="alertDescription"
                        ControlID="alertDescription"
                        placeholder="Alert Message"
                    />
                </Grid>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
                        <CustomButton
                            variant="contained"
                            color="primary"
                            text="Add Alert"
                            onClick={handleAdd}
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={2}>
                    <FormField
                        type="switch"
                        label={formState.rActiveYN === "Y" ? "Active" : "Hidden"}
                        value={formState.rActiveYN}
                        checked={formState.rActiveYN === "Y"}
                        onChange={handleActiveToggle}
                        name="rActiveYN"
                        ControlID="rActiveYN"
                        size="medium"
                    />
                </Grid>

                <FormSaveClearButton
                    clearText="Clear"
                    saveText="Save"
                    onClear={handleClear}
                    onSave={handleSave}
                    clearIcon={DeleteIcon}
                    saveIcon={SaveIcon}
                />

                <Grid container spacing={2} style={{ marginTop: "20px" }}>
                    <Grid item xs={12}>
                        <CustomGrid
                            columns={columns}
                            data={alerts}
                            maxHeight="400px"
                            minHeight="200px"
                            searchTerm={searchTerm}
                        />
                    </Grid>
                </Grid>
            </section>
        </Paper>
    );
};

export default AlertDetails;
