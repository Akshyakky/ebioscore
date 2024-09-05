import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { AlertManagerServices } from "../../../../services/CommonServices/AlertManagerServices";
import { showAlert } from "../../../../utils/Common/showAlert";
import AutocompleteTextBox from "../../../../components/TextBox/AutocompleteTextBox/AutocompleteTextBox";
import { usePatientAutocomplete } from "../../../../hooks/PatientAdminstration/usePatientAutocomplete";
import CustomButton from "../../../../components/Button/CustomButton";
import extractNumbers from "../../../../utils/PatientAdministration/extractNumbers";
import { ContactMastService } from "../../../../services/CommonServices/ContactMastService";
import { RevisitService } from "../../../../services/PatientAdministrationServices/RevisitService/RevisitService";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import PatientDemographics from "../../../patientAdministration/CommonPage/Demograph/PatientDemographics";

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

    const [searchTerm] = useState("");
    const [alerts, setAlerts] = useState<AlertDto[]>([]);
    const { setLoading } = useLoading();
    const serverDate = useServerDate();
    const { userID, userName } = useSelector(
        (state: RootState) => state.userDetails
    );
    const uhidRef = useRef<HTMLInputElement>(null);
    const token = useSelector((state: RootState) => state.userDetails.token!);
    const { fetchPatientSuggestions } = usePatientAutocomplete();
    const [, setAvailableAttendingPhysicians] = useState<DropdownOption[]>([]);
    const [selectedPChartID, setSelectedPChartID] = useState<number | 0>(0);
    const [editMode, setEditMode] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [isUHIDDisabled, setIsUHIDDisabled] = useState(false);

    useEffect(() => {
        if (editData) {
            setFormState((prevState) => ({
                ...prevState,
                ...editData,
                oPIPDate: editData.oPIPDate || serverDate,
            }));
        } else {
            handleClear();
        }
    }, [editData]);

    const createAlertTypeDto = useCallback(
        (): AlertDto => ({
            ...formState,
            oPIPDate: serverDate || new Date(),
            rCreatedID: userID || 0,
            rCreatedOn: serverDate || new Date(),
            rCreatedBy: userName || "",
            rModifiedID: userID || 0,
            rModifiedOn: serverDate || new Date(),
            rModifiedBy: userName || "",
            payID: 0,
        }),
        [formState, userID, userName, serverDate]
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
        setLoading(true);

        try {
            const AlertData = createAlertTypeDto();
            const result = await AlertManagerServices.saveAlert(AlertData);
            if (result.success) {
                handleClear(); // Clear the form fields after successful save
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
            ...prevState,
            isSubmitted: false,
            alertDescription: "",
        }));
        setSelectedPChartID(0);
        setIsUHIDDisabled(false);
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

        if (editMode && editIndex !== null) {
            // Update the existing alert
            setAlerts((prevAlerts) =>
                prevAlerts.map((alert, index) =>
                    index === editIndex ? newAlert : alert
                )
            );
            setEditMode(false);
            setEditIndex(null);
            setIsUHIDDisabled(true);
        } else {
            setAlerts((prevAlerts) => [...prevAlerts, newAlert]);
        }
        handleClear();
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
                    await RevisitService.getLastVisitDetailsByPChartID(pChartID);
                if (lastVisitResult && lastVisitResult.success) {
                    setFormState((prevFormData) => ({
                        ...prevFormData,
                        pChartCode: selectedSuggestion.split("|")[0].trim(),
                        attndPhyID: availablePhysicians.some(
                            (physician) => physician.value === lastVisitResult.data.attndPhyID
                        )
                            ? lastVisitResult.data.attndPhyID
                            : 0,
                    }));
                }
            }
        } catch (error) {
            console.error("Error in handlePatientSelect:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item: AlertDto, index: number) => {
        setFormState({
            ...formState,
            ...item,
            pChartCode: item.pChartCode,
            isSubmitted: false,
        });
        setEditMode(true);
        setEditIndex(index);
        setIsUHIDDisabled(true);
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
                    color="secondary"
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
                            <AutocompleteTextBox
                                ref={uhidRef}
                                ControlID="UHID"
                                title="UHID"
                                type="text"
                                size="small"
                                placeholder="Search through UHID, Name, DOB, Phone No...."
                                value={formState.pChartCode || ""} // Maintain value in edit mode
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
                                disabled={isUHIDDisabled}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={9} lg={9} xl={9}>
                            <PatientDemographics pChartID={selectedPChartID} token={token} />
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
