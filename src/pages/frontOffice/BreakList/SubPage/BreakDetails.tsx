import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useLoading } from "../../../../context/LoadingContext";
import { useServerDate } from "../../../../hooks/Common/useServerDate";
import { useSelector } from "react-redux";
import { Grid, Paper, Typography } from "@mui/material";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
import CustomCheckbox from "../../../../components/Checkbox/Checkbox";
import CustomButton from "../../../../components/Button/CustomButton";
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import Save from "@mui/icons-material/Save";
import Delete from "@mui/icons-material/Delete";
import { ResourceListService } from "../../../../services/FrontOfficeServices/ResourceListServices/ResourceListServices";
import { AppointmentService } from "../../../../services/FrontOfficeServices/AppointmentServices/AppointmentService";
import BreakFrequencyDetails, { FrequencyData } from './BreakFrequencyDetails';
import { formatDate } from "../../../../utils/Common/dateUtils";
import { BreakListService } from "../../../../services/FrontOfficeServices/BreakListServices/BreakListService";
import { BreakListConDetailsService } from "../../../../services/FrontOfficeServices/BreakListServices/BreakListConDetailService";
import { showAlert } from "../../../../utils/Common/showAlert";
import { BreakConDetailData, BreakListData, BreakListDto } from "../../../../interfaces/FrontOffice/BreakListData";
import FormField from "../../../../components/FormField/FormField";

const frequencyCodeMap = {
    none: "FO70",
    daily: "FO71",
    weekly: "FO72",
    monthly: "FO73",
    yearly: "FO74",
};

const weekDayCodeMap = {
    Sunday: "FO75",
    Monday: "FO76",
    Tuesday: "FO77",
    Wednesday: "FO78",
    Thursday: "FO79",
    Friday: "FO80",
    Saturday: "FO81",
};
const BreakDetails: React.FC<{ editData?: BreakListDto }> = ({ editData }) => {
    const { setLoading } = useLoading();
    const serverDate = useServerDate();
    const { compID, compCode, compName } = useSelector((state: any) => state.userDetails);

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isOneDay, setIsOneDay] = useState(false);
    const [openFrequencyDialog, setOpenFrequencyDialog] = useState(false);
    const [formState, setFormState] = useState<BreakListData>(() => initializeFormState(serverDate, compID, compCode, compName));
    const [breakConDetails, setBreakConDetails] = useState<BreakConDetailData[]>([]);
    const [selectedOption, setSelectedOption] = useState("physician");
    const [resourceData, setResourceData] = useState<any[]>([]);
    const [consultantData, setConsultantData] = useState<any[]>([]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [frequencyData, setFrequencyData] = useState<FrequencyData>({
        frequency: 'none',
        endDate: formState.bLEndDate.toISOString().split('T')[0],
        interval: 1,
        weekDays: [],
    });

    useEffect(() => {
        if (editData) {
            loadEditData(editData);
        } else {
            handleClear();
        }
    }, [editData, serverDate]);

    useEffect(() => {
        fetchData();
    }, [selectedOption]);

    const loadEditData = async (data: any) => {
        setLoading(true);
        try {
            const { blID } = data;

            // Fetch BreakList data by blID
            const breakListResult = await BreakListService.getBreakListById(blID);

            // Fetch BreakConDetail data by blID
            const breakConDetailResult = await BreakListConDetailsService.getBreakConDetailById(blID);

            if (breakListResult.success && breakListResult.data) {
                const breakListData = breakListResult.data;

                setFormState(prev => ({
                    ...prev,
                    ...breakListData,
                    bLStartDate: new Date(breakListData.bLStartDate),
                    bLEndDate: new Date(breakListData.bLEndDate),
                    bLStartTime: new Date(breakListData.bLStartTime),
                    bLEndTime: new Date(breakListData.bLEndTime),
                }));
                setSelectedOption(breakListData.isPhyResYN === "Y" ? "physician" : "resource");
            }

            if (breakConDetailResult.success && breakConDetailResult.data) {
                const breakConDetailsData = breakConDetailResult.data;
                setBreakConDetails(breakConDetailsData);

                // Set the selected option based on the fetched data

                setSelectedItems(breakConDetailsData.map((detail: BreakConDetailData) => detail.hPLID));
            }
        } catch (error) {
            showAlert('Error', 'An error occurred while loading data. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };


    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (selectedOption === "resource") {
                const result = await ResourceListService.getAllResourceLists();
                if (result.success && result.data) setResourceData(result.data);
            } else {
                const result = await AppointmentService.fetchAppointmentConsultants();
                if (result.success && result.data) setConsultantData(result.data);
            }
        } catch (error) {
            console.error(`Failed to fetch ${selectedOption} data`, error);
        } finally {
            setLoading(false);
        }
    }, [selectedOption]);

    const handleRadioChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, value: string) => {
        setSelectedOption(value);
        setFormState(prevState => ({
            ...prevState,
            isPhyResYN: value === "physician" ? "Y" : "N",
        }));
        setSelectedItems([]);
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        let updatedState = { ...formState };

        if (type === 'time' && (name === 'bLStartTime' || name === 'bLEndTime')) {
            const [hours, minutes] = value.split(':').map(Number);
            const newTime = new Date(
                updatedState.bLStartDate.getFullYear(),
                updatedState.bLStartDate.getMonth(),
                updatedState.bLStartDate.getDate(),
                hours,
                minutes
            );

            if (name === 'bLStartTime' && newTime >= updatedState.bLEndTime) {
                updatedState.bLEndTime = new Date(newTime.getTime() + 15 * 60000);
            } else if (name === 'bLEndTime' && newTime <= updatedState.bLStartTime) {
                updatedState.bLStartTime = new Date(newTime.getTime() - 15 * 60000);
            }

            updatedState[name as keyof Pick<BreakListData, 'bLStartTime' | 'bLEndTime'>] = newTime;
        } else if (type === 'date' && (name === 'bLStartDate' || name === 'bLEndDate')) {
            const newDate = new Date(value);
            if (name === 'bLStartDate' && newDate > updatedState.bLEndDate) {
                updatedState.bLEndDate = newDate;
            } else if (name === 'bLEndDate' && newDate < updatedState.bLStartDate) {
                updatedState.bLStartDate = newDate;
            }
            updatedState[name as keyof Pick<BreakListData, 'bLStartDate' | 'bLEndDate'>] = newDate;
        } else {
            (updatedState as any)[name] = value;
        }

        setFormState(updatedState);
    }, [formState]);


    const handleCheckboxChange = useCallback((id: number, isChecked: boolean) => {
        setSelectedItems(prevItems => isChecked ? [...prevItems, id] : prevItems.filter(item => item !== id));
    }, []);

    const renderCheckbox = useCallback((item: any) => {
        const id = selectedOption === "resource" ? item.rLID : item.conID;
        return (
            <CustomCheckbox
                label=""
                name={`select-${id}`}
                checked={selectedItems.includes(id)}
                onChange={(e: any) => handleCheckboxChange(id, e.target.checked)}
                size='small'
            />
        );
    }, [selectedOption, selectedItems, handleCheckboxChange]);

    const renderConsultantName = useCallback((item: any) => {
        const { conTitle, conFName, conMName, conLName } = item;
        return `${conTitle || ""} ${conFName || ""} ${conMName || ""} ${conLName || ""}`.trim();
    }, []);

    const columns = useMemo(() => [
        { key: "checkbox", header: "Action", visible: true, render: renderCheckbox },
        selectedOption === "resource"
            ? { key: "rLName", header: "Resource Name", visible: true }
            : { key: "consultantName", header: "Consultant Name", visible: true, render: renderConsultantName },
    ], [selectedOption, renderCheckbox, renderConsultantName]);

    const handleSwitchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setIsOneDay(isChecked);

        if (isChecked) {
            setFormState(prev => ({
                ...prev,
                bLStartTime: new Date(prev.bLStartDate.setHours(0, 0, 0, 0)),
                bLEndTime: new Date(prev.bLStartDate.setHours(23, 59, 0, 0)),
            }));
        } else {
            setFormState(prev => ({
                ...prev,
                bLStartTime: new Date(prev.bLStartDate.setHours(9, 0, 0, 0)),
                bLEndTime: new Date(prev.bLStartDate.setHours(9, 45, 0, 0)),
            }));
        }
    }, []);


    const handleActiveToggle = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setFormState(prev => ({ ...prev, rActiveYN: event.target.checked ? "Y" : "N" }));
    }, []);

    const handleSave = useCallback(async () => {
        setLoading(true);
        try {

            const frequencyKey = frequencyData.frequency as keyof typeof frequencyCodeMap;
            formState.bLFrqDesc = frequencyCodeMap[frequencyKey] || "FO70";
            formState.bLFrqNo = frequencyData.interval || 0;

            if (frequencyData.frequency === "weekly") {
                formState.bLFrqWkDesc = frequencyData.weekDays
                    .map((day) => {
                        const dayKey = day as keyof typeof weekDayCodeMap;
                        return weekDayCodeMap[dayKey];
                    })
                    .join(",");
            } else {
                formState.bLFrqWkDesc = "";
            }
            debugger
            const saveBreakListResult = await BreakListService.saveBreakList(formState);

            if (saveBreakListResult.success && saveBreakListResult.data) {
                const savedBreakListData = saveBreakListResult.data;
                const blID = savedBreakListData.bLID;

                const breakConDetailPromises = selectedItems.map((itemID) => {
                    const breakConDetailData: BreakConDetailData = {
                        bCDID: 0,
                        blID,
                        hPLID: itemID,
                        rActiveYN: "Y",
                        rNotes: "",
                        compID: compID,
                        compCode: compCode,
                        compName: compName,
                        transferYN: "N"
                    };

                    return BreakListConDetailsService.saveBreakConDetail(breakConDetailData);
                });

                const breakConDetailResults = await Promise.all(breakConDetailPromises);

                const allBreakConDetailsSaved = breakConDetailResults.every(
                    (result) => result.success
                );

                if (allBreakConDetailsSaved) {
                    showAlert('Success', 'Save Successful', 'success');
                    handleClear();
                } else {
                    showAlert('Warning', 'BreakList saved, but some BreakConDetails failed to save.', 'warning');
                }
            } else {
                showAlert('Error', 'Failed to save BreakList.', 'error');
            }
        } catch (error) {
            showAlert('Error', 'An error occurred while saving. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    }, [formState, selectedItems, frequencyData, selectedOption]);

    const handleClear = useCallback(() => {
        setFormState(initializeFormState(serverDate, compID, compCode, compName));
        setBreakConDetails([]);
        setSelectedItems([]);
        setIsOneDay(false);
    }, [serverDate, compID, compCode, compName]);

    const handleSaveFrequency = useCallback((data: FrequencyData) => {
        setFrequencyData(data);
        setFormState(prev => ({
            ...prev,
            bLEndDate: new Date(data.endDate),
            bLFrqDesc: generateFrequencyDescription(data),
        }));
        setOpenFrequencyDialog(false);
    }, []);

    const generateFrequencyDescription = (data: FrequencyData): string => {
        const formattedEndDate = formatDate(data.endDate);
        switch (data.frequency) {
            case 'daily':
                return `Every ${data.interval} Day${data.interval > 1 ? 's' : ''} Till ${formattedEndDate}`;
            case 'weekly':
                const selectedDays = data.weekDays.map(day => day.slice(0, 3)).join('-');
                return `Every ${data.interval} Week${data.interval > 1 ? 's' : ''} On ${selectedDays} Till ${formattedEndDate}`;
            case 'monthly':
                return `Every ${data.interval} Month${data.interval > 1 ? 's' : ''} Till ${formattedEndDate}`;
            case 'yearly':
                return `Every ${data.interval} Year${data.interval > 1 ? 's' : ''} Till ${formattedEndDate}`;
            default:
                return `No Repeat End Date: ${formattedEndDate}`;
        }
    };

    return (
        <>
            <Paper variant="elevation" sx={{ padding: 2 }}>
                <Typography variant="h6" id="Break-Details-header">
                    Break Details
                </Typography>
                <Grid container spacing={2}>
                    <FormField
                        type="text"
                        label="Break Name"
                        name="bLName"
                        value={formState.bLName}
                        onChange={handleInputChange}
                        ControlID="Breakname"
                        isMandatory
                        isSubmitted={isSubmitted}
                        placeholder="Break name"
                    />
                    <FormField
                        type="time"
                        label="Start Time"
                        name="bLStartTime"
                        value={formatTime(formState.bLStartTime)}
                        onChange={handleInputChange}
                        ControlID="StartTime"
                        isMandatory
                        isSubmitted={isSubmitted}
                        disabled={isOneDay}
                        max={formState.bLStartDate.getTime() === formState.bLEndDate.getTime() ? formatTime(formState.bLEndTime) : undefined}
                    />
                    <FormField
                        type="time"
                        label="End Time"
                        name="bLEndTime"
                        value={formatTime(formState.bLEndTime)}
                        onChange={handleInputChange}
                        ControlID="EndTime"
                        isMandatory
                        isSubmitted={isSubmitted}
                        disabled={isOneDay}
                        min={formState.bLStartDate.getTime() === formState.bLEndDate.getTime() ? formatTime(formState.bLStartTime) : undefined}
                    />
                    <FormField
                        type="switch"
                        label="One Day"
                        name="isOneDay"
                        checked={isOneDay}
                        value={isOneDay}
                        onChange={handleSwitchChange}
                        ControlID="OneDay"
                        gridProps={{ mt: 2 }}
                    />
                </Grid>
                <Grid container spacing={2}>
                    <FormField
                        type="date"
                        label="Start Date"
                        name="bLStartDate"
                        value={formState.bLStartDate.toISOString().split('T')[0]}
                        onChange={handleInputChange}
                        ControlID="StartDate"
                        min={formState.bLEndDate.toISOString().split('T')[0]}
                    />
                    <FormField
                        type="date"
                        label="End Date"
                        name="bLEndDate"
                        value={formState.bLEndDate.toISOString().split('T')[0]}
                        onChange={handleInputChange}
                        ControlID="EndDate"
                        min={formState.bLStartDate.toISOString().split('T')[0]}
                    />
                    <FormField
                        type="textarea"
                        label="Repeat"
                        name="bLFrqDesc"
                        value={formState.bLFrqDesc}
                        onChange={handleInputChange}
                        ControlID="Repeat"
                        readOnly={true}
                    />
                    <Grid item xs={12} sm={6} md={3} mt={2}>
                        <CustomButton
                            variant="contained"
                            text="Change"
                            icon={ChangeCircleIcon}
                            size="small"
                            color="secondary"
                            onClick={() => setOpenFrequencyDialog(true)}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <FormField
                        type="radio"
                        label="Choose Option"
                        name="resourceOrPhysician"
                        value={selectedOption}
                        onChange={(e) => handleRadioChange(e, e.target.value)}
                        ControlID="ChooseOption"
                        options={[
                            { value: "physician", label: "Physician" },
                            { value: "resource", label: "Resource" }
                        ]}
                        isMandatory={true}
                        inline={true}
                    />
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                        {(selectedOption === "resource" || selectedOption === "physician") && (
                            <CustomGrid
                                columns={columns}
                                data={selectedOption === "resource" ? resourceData : consultantData}
                                maxHeight="300px"
                                minHeight="300px"
                                searchTerm=""
                            />
                        )}
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <FormField
                        type="textarea"
                        label="Description"
                        name="rNotes"
                        value={formState.rNotes}
                        onChange={handleInputChange}
                        ControlID="Description"
                        placeholder="Enter description"
                        maxLength={4000}
                    />
                </Grid>
                <Grid container spacing={2}>
                    <FormField
                        type="switch"
                        label={formState.rActiveYN === 'Y' ? 'Active' : 'Hidden'}
                        name="rActiveYN"
                        checked={formState.rActiveYN === 'Y'}
                        value={formState.rActiveYN}
                        onChange={handleActiveToggle}
                        ControlID="ActiveStatus"
                    />
                </Grid>
                <FormSaveClearButton
                    onSave={handleSave}
                    onClear={handleClear}
                    clearText="Clear"
                    saveText="Save"
                    saveIcon={Save}
                    clearIcon={Delete}
                />
            </Paper>

            {openFrequencyDialog && (
                <BreakFrequencyDetails
                    open={openFrequencyDialog}
                    onClose={() => setOpenFrequencyDialog(false)}
                    endDateFromBreakDetails={frequencyData.endDate}
                    onSave={handleSaveFrequency}
                    initialFrequencyData={frequencyData}
                />
            )}
        </>
    );
};

const initializeFormState = (serverDate: Date, compID: number, compCode: string, compName: string): BreakListData => ({
    bLID: 0,
    bLName: "",
    bLStartTime: serverDate || new Date(),
    bLEndTime: serverDate || new Date(),
    bLStartDate: serverDate || new Date(),
    bLEndDate: serverDate || new Date(),
    bLFrqNo: 0,
    bLFrqDesc: "",
    bLFrqWkDesc: "",
    bColor: "",
    rActiveYN: "Y",
    rNotes: "",
    isPhyResYN: "Y",
    compID: compID || 0,
    compCode: compCode || "",
    compName: compName || "",
    transferYN: "N",
});

const formatTime = (time: string | Date) => {
    if (typeof time === 'string') {
        return time;
    }
    debugger
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

export default BreakDetails;
