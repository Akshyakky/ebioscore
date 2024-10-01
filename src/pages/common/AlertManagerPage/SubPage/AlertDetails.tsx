import React, { useCallback, useEffect, useState } from "react";
import { AlertDto } from "../../../../interfaces/Common/AlertManager";
import { Grid, Paper, Typography } from "@mui/material";
import FormField from "../../../../components/FormField/FormField";
import { useLoading } from "../../../../context/LoadingContext";
import { useServerDate } from "../../../../hooks/Common/useServerDate";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import CustomGrid, {
    Column,
} from "../../../../components/CustomGrid/CustomGrid";
import EditIcon from "@mui/icons-material/Edit";
import { showAlert } from "../../../../utils/Common/showAlert";
import { usePatientAutocomplete } from "../../../../hooks/PatientAdminstration/usePatientAutocomplete";
import CustomButton from "../../../../components/Button/CustomButton";
import extractNumbers from "../../../../utils/PatientAdministration/extractNumbers";
import PatientDemographics from "../../../patientAdministration/CommonPage/Demograph/PatientDemographics";
import { showAlertPopUp } from "../../../../utils/Common/alertMessage";
import AddIcon from "@mui/icons-material/Add";
import useDayjs from "../../../../hooks/Common/useDateTime";
import { ErrorMessage } from 'formik';
import { alertService } from "../../../../services/CommonServices/CommonModelServices";

const AlertDetails: React.FC<{ editData?: AlertDto; alerts?: AlertDto[] }> = ({
    editData,
    alerts,
}) => {
    const { date: serverDate, formatDate, formatISO } = useDayjs(useServerDate());
    const [formState, setFormState] = useState({
        isSubmitted: false,
        oPIPAlertID: 0,
        oPIPNo: 0,
        rActiveYN: "Y",
        pChartID: 0,
        oPIPCaseNo: 0,
        patOPIPYN: "Y",
        alertDescription: "",
        oPIPDate: formatDate(),
        category: "",
        oldPChartID: 0,
        rCreatedOn: formatDate(),
        rModifiedOn: formatDate(),
        oPVID: 0,
        pChartCode: "",
    });

    const [searchTerm] = useState("");
    const { setLoading } = useLoading();
    const { userID, userName } = useSelector(
        (state: RootState) => state.userDetails
    );
    const { fetchPatientSuggestions } = usePatientAutocomplete();
    const [selectedPChartID, setSelectedPChartID] = useState<number | 0>(0);
    const [editMode, setEditMode] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [isUHIDDisabled, setIsUHIDDisabled] = useState(false);
    const [alertsState, setAlerts] = useState<AlertDto[]>(alerts || []);

    useEffect(() => {
        if (editData) {
            setFormState((prevState) => ({
                ...prevState,
                ...editData,
                oPIPDate: editData.oPIPDate
                    ? formatISO(new Date(editData.oPIPDate))
                    : formatDate(),
            }));
        } else {
            handleClear();
        }
    }, [editData]);

    useEffect(() => {
        if (alerts) {
            setAlerts(alerts);
        }
    }, [alerts]);

    const createAlertTypeDto = useCallback(
        (): AlertDto => ({
            ...formState,
            oPIPAlertID:
                editMode && editIndex !== null ? alertsState[editIndex].oPIPAlertID : 0,
            pChartID: formState.pChartID,
            oPIPDate: formatISO(new Date()),
            rCreatedID: userID || 0,
            rCreatedOn: formatISO(new Date()),
            rCreatedBy: userName || "",
            rModifiedID: userID || 0,
            rModifiedOn: formatISO(new Date()),
            rModifiedBy: userName || "",
            payID: 0,
            patOPIPYN: "Y",
            rActiveYN: "Y",


        }),
        [formState, userID, userName, alertsState, editMode, editIndex]
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
        setFormState((prev) => ({ ...prev, isSubmitted: true }));

        if (!formState.pChartID || !formState.pChartCode) {
            showAlert(
                "Error",
                "Invalid UHID selected. Please select a valid patient.",
                "error"
            );
            return;
        }

        if (alertsState.length === 0) {
            showAlert(
                "Error",
                "No alert details to save. Please add at least one alert.",
                "error"
            );
            return;
        }

        setLoading(true);
        try {
            for (const alert of alertsState) {
                const result = await alertService.save(alert);

                if (!result.success) {
                    throw new Error(result.errorMessage || "Failed to save Alert.");
                }
            }
            showAlert("Success", "Alerts saved successfully!", "success", {
                onConfirm: () => {
                    handleClear();
                    setAlerts([]);
                },
            });
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false);
        }
    };

    const handleClear = useCallback(() => {
        setFormState((prevState) => ({
            ...prevState,
            isSubmitted: false,
            alertDescription: "",
            pChartCode: "",
            rActiveYN: "Y",
        }));
        setSelectedPChartID(0);
        setIsUHIDDisabled(false);
        setAlerts([]);
    }, []);

    const handleAdd = async () => {
        const newAlert = createAlertTypeDto();
        if (editMode && editIndex !== null) {
            setAlerts((prevAlerts) =>
                prevAlerts.map((alert, index) =>
                    index === editIndex ? { ...alert, ...newAlert } : alert
                )
            );
            setEditMode(false);
            setEditIndex(null);
            setIsUHIDDisabled(false);
        } else {
            setAlerts((prevAlerts) => [
                ...prevAlerts,
                { ...newAlert, oPIPAlertID: newAlert.oPIPAlertID || 0 },
            ]);
        }

        setFormState((prevState) => ({
            ...prevState,
            alertDescription: "",
        }));
    };

    const handleDelete = async (item: AlertDto) => {
        showAlert(
            "Delete",
            "Are you sure you want to delete this alert?",
            "success"
        );

        try {
            setLoading(true);
            const isSuccess = await alertService.updateActiveStatus(
                item.oPIPAlertID,
                false
            );

            if (isSuccess) {
                setAlerts((prevAlerts) =>
                    prevAlerts.filter((alert) => alert.oPIPAlertID !== item.oPIPAlertID)
                );
                showAlert("Success", "Alert deleted successfully.", "success");
            } else {
                showAlert(
                    "Error",
                    "Failed to delete the alert. Please try again.",
                    "error"
                );
            }
        } catch (error) {
            console.error("Error deleting alert:", error);
            showAlert(
                "Error",
                "An unexpected error occurred while deleting the alert.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };


    const filteredAlerts = alertsState.filter((alert) => alert.rActiveYN === "Y");

    const handlePatientSelect = async (selectedSuggestion: string) => {
        setLoading(true);
        try {
            debugger
            debugger
            const numbersArray = extractNumbers(selectedSuggestion);
            const pChartID = numbersArray.length > 0 ? numbersArray[0] : null;

            if (pChartID) {
                const pChartCode = selectedSuggestion.split("|")[0].trim();
                setSelectedPChartID(pChartID);
                setFormState((prevFormData) => ({
                    ...prevFormData,
                    pChartID,
                    pChartCode,
                }));
                const alertResult =
                    await alertService.getById(pChartID);

                if (alertResult.success && alertResult.data) {
                    const activeAlerts = alertResult.data.filter(
                        (alert: AlertDto) => alert.rActiveYN === "Y"
                    );

                    setAlerts(activeAlerts);

                    if (activeAlerts.length > 0) {
                        showAlertPopUp(activeAlerts);
                    } else {
                        console.info("No active alerts found.");
                    }
                } else {
                    console.error("Failed to fetch alert details.");
                    setAlerts([]);
                }
            } else {
                showAlert(
                    "Error",
                    "Unable to select patient. Please try again.",
                    "error"
                );
            }
        } catch (error) {
            console.error("Error in handlePatientSelect:", error);
            showAlert(
                "Error",
                "An unexpected error occurred while selecting the patient.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item: AlertDto, index: number) => {
        setFormState({
            ...formState,
            ...item,
            oPIPDate: item.oPIPDate ? formatDate(item.oPIPDate) : formatDate(),
            pChartCode: item.pChartCode || formState.pChartCode,
            isSubmitted: false,
            oPIPAlertID: item.oPIPAlertID,
        });
        setEditMode(true);
        setEditIndex(index);
        setIsUHIDDisabled(true);
    };

    const columns: Column<AlertDto>[] = [
        {
            key: "serialNo",
            header: "Sl No.",
            visible: true,
            render: (item: AlertDto, index: number) => <span>{index + 1}</span>,
        },
        {
            key: "oPIPDate",
            header: "Date",
            visible: true,
            formatter: (value: Date) => formatDate().toLocaleString(),
        },
        { key: "alertDescription", header: "Description", visible: true },
        { key: "rCreatedBy", header: "Created By", visible: true },
        {
            key: "edit",
            header: "Edit",
            visible: true,
            render: (item: AlertDto, index: number) => (
                <CustomButton
                    icon={EditIcon}
                    onClick={() => handleEdit(item, index)}
                    color="primary"
                />
            ),
        },
        {
            key: "delete",
            header: "Delete",
            visible: true,
            render: (item: AlertDto) => (
                <CustomButton
                    icon={DeleteIcon}
                    onClick={() => handleDelete(item)}
                    color="error"
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
                    <Grid container spacing={2} alignItems="flex-start">
                        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
                            <FormField
                                ControlID="UHID"
                                label="UHID No."
                                name="pChartCode"
                                type="autocomplete"
                                placeholder="Search through UHID, Name, DOB, Phone No...."
                                value={formState.pChartCode || ""}
                                onChange={(e) =>
                                    setFormState({ ...formState, pChartCode: e.target.value })
                                }
                                fetchSuggestions={fetchPatientSuggestions}
                                isMandatory
                                onSelectSuggestion={handlePatientSelect}
                                isSubmitted={formState.isSubmitted}
                                disabled={isUHIDDisabled}
                                gridProps={{ xs: 12 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={9} lg={9} xl={9}>
                            <PatientDemographics pChartID={selectedPChartID} />
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
                        maxLength={4000}
                    />
                </Grid>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
                        <CustomButton
                            variant="contained"
                            color={editMode ? "success" : "primary"}
                            text={editMode ? "Update List" : "Add Alert"}
                            onClick={handleAdd}
                            icon={AddIcon}
                        />
                    </Grid>
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
                            data={filteredAlerts}
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
