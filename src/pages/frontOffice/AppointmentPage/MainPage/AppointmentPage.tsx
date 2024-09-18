import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Box, Paper, Container } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import SaveIcon from '@mui/icons-material/Save'
import SchedulerComponent from '../SubPage/SchedulerComponent';
import SchedulerHeader from '../SubPage/SchedulerHeader';
import SchedulerFooter from '../SubPage/SchedulerFooter';
import AppointmentBookingForm from '../SubPage/AppointmentBookingForm';
import GenericDialog from '../../../../components/GenericDialog/GenericDialog';
import CustomButton from '../../../../components/Button/CustomButton';
import { ReasonListService } from '../../../../services/FrontOfficeServices/ReasonListServices/ReasonListService';
import { ResourceListService } from '../../../../services/FrontOfficeServices/ResourceListServices/ResourceListServices';
import { AppointmentService } from '../../../../services/FrontOfficeServices/AppointmentServices/AppointmentService';
import { DropdownOption } from '../../../../interfaces/Common/DropdownOption';
import { AppointBookingDto } from '../../../../interfaces/FrontOffice/AppointBookingDto';
import { showAlert } from '../../../../utils/Common/showAlert';
import { useServerDate } from '../../../../hooks/Common/useServerDate';
import useDayjs from '../../../../hooks/Common/useDateTime';
import { store } from '../../../../store/store';

const getDefaultAppointBookingDto = (formatDate: () => string, formatDateTime: () => string, formateDateYMD: () => string, formateDateYMDHHmm: () => string): AppointBookingDto => ({
    abID: 0,
    abFName: 'Akshay',
    abLName: '',
    hplID: 0,
    providerName: '',
    rlID: 0,
    rlName: '',
    arlID: 0,
    arlName: '',
    abDuration: 15,
    abDurDesc: '15 minutes',
    abDate: formateDateYMD(),
    abTime: formateDateYMDHHmm(),
    pChartID: 0,
    abPType: 'R',
    abStatus: 'Booked',
    patRegisterYN: 'Y',
    dob: formateDateYMD(),
    oTBookNo: 0,
    patOPIP: 'O',
    rActiveYN: 'Y',
    abEndTime: formateDateYMDHHmm(),
    transferYN: 'N',
    pChartCode: '',
    appPhone1: '',
    arlInstructions: '',
    city: '',
    email: '',
    pssnId: '',
    intIdPsprt: '',
    rNotes: '',
    compID: store.getState().userDetails.compID ?? 0,
    compCode: store.getState().userDetails.compCode ?? "",
    compName: store.getState().userDetails.compName ?? ""
});

const AppointmentPage: React.FC = () => {
    const { date: serverDate, formatDate, formatDateTime, formatTime, add, formatISO, format, formatDateYMD, formatDateYMDHHmm } = useDayjs(useServerDate());
    const schedulerRef = useRef<{ refresh: () => void } | null>(null);
    const [selectedConID, setSelectedConID] = useState<number | undefined>(undefined);
    const [selectedRlID, setSelectedRlID] = useState<number | undefined>(undefined);
    const [rLotYN, setRLotYN] = useState<string | undefined>(undefined);
    const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
    const [reasonOptions, setReasonOptions] = useState<DropdownOption[]>([]);
    const [resourceOptions, setResourceOptions] = useState<DropdownOption[]>([]);
    const [selectedProviderName, setSelectedProviderName] = useState<string>('');
    const [selectedRlName, setSelectedRlName] = useState<string>('');
    const [isUpdating, setIsUpdating] = useState(false);

    const [formData, setFormData] = useState<AppointBookingDto>(() => getDefaultAppointBookingDto(formatDate, formatDateTime, formatDateYMD, formatDateYMDHHmm));

    const handleRefresh = useCallback(() => {
        if (schedulerRef.current) {
            schedulerRef.current.refresh();
        }
    }, []);

    const handleSearchSelection = useCallback((conID?: number, rlID?: number, rLotYN?: string, providerName?: string, rlName?: string) => {
        setSelectedConID(conID);
        setSelectedRlID(rlID);
        setRLotYN(rLotYN);
        setSelectedProviderName(providerName || '');
        setSelectedRlName(rlName || '');
        handleRefresh();
    }, [handleRefresh]);

    const handleAppointmentClick = useCallback(async (abID: number) => {
        try {
            const result = await AppointmentService.getAppointBookingById(abID);
            if (result.success && result.data) {
                setFormData({
                    ...result.data,
                    abDate: formatDateYMD(result.data.abDate),
                    abTime: formatDateYMDHHmm(result.data.abTime),
                    abEndTime: formatDateYMDHHmm(result.data.abEndTime),
                });
                setIsUpdating(true);
                setIsBookingFormOpen(true);
            } else {
                showAlert('Error', 'Failed to fetch appointment details', 'error');
            }
        } catch (error) {
            console.error('Error fetching appointment details:', error);
            showAlert('Error', 'An error occurred while fetching appointment details', 'error');
        }
    }, [formatDateYMD, formatDateYMDHHmm]);

    const handleAppointmentFormOpen = useCallback((date?: Date, time?: Date) => {
        if (!selectedConID && !selectedRlID) {
            showAlert('Warning', 'Please select a consultant or resource before booking an appointment.', 'warning');
            return;
        }

        setIsUpdating(false); // Reset updating state for new appointments
        if (date && time) {
            setFormData(prevData => ({
                ...getDefaultAppointBookingDto(formatDate, formatDateTime, formatDateYMD, formatDateYMDHHmm),
                abDate: formatDateYMD(date),
                abTime: formatDateYMDHHmm(date),
                abEndTime: formatDateYMDHHmm(calculateEndTime(date, prevData.abDuration)),
                hplID: selectedConID || 0,
                providerName: selectedProviderName,
                rlID: selectedRlID || 0,
                rlName: selectedRlName
            }));
        }
        setIsBookingFormOpen(true);
    }, [selectedConID, selectedRlID, selectedProviderName, selectedRlName, formatDateYMDHHmm, formatDateYMD, formatDate, formatDateTime]);

    const handleAppointmentFormClose = useCallback(() => {
        setIsBookingFormOpen(false);
    }, []);

    const handleSaveBooking = useCallback(async () => {
        try {
            const result = await AppointmentService.saveAppointBooking(formData);
            if (result.success) {
                showAlert('Notification', `Appointment ${isUpdating ? 'updated' : 'booked'} successfully`, 'success', {
                    onConfirm: () => {
                        handleRefresh();
                        handleAppointmentFormClose();
                    }
                });
            } else {
                showAlert('Error', result.errorMessage || `Failed to ${isUpdating ? 'update' : 'book'} appointment`, 'error');
            }
        } catch (error) {
            console.error('Error saving appointment:', error);
            showAlert('Error', `An error occurred while ${isUpdating ? 'updating' : 'booking'} the appointment`, 'error');
        }
    }, [formData, handleAppointmentFormClose, handleRefresh, isUpdating]);

    const handleChange = useCallback((name: keyof AppointBookingDto, value: any) => {
        setFormData(prevData => {
            const newData = { ...prevData, [name]: value };

            if (name === 'abDuration') {
                newData.abDurDesc = `${value} minutes`;
                newData.abEndTime = calculateEndTime(newData.abTime, value);
            } else if (name === 'abTime') {
                newData.abEndTime = calculateEndTime(value, newData.abDuration);
            }

            return newData;
        });
    }, []);

    const calculateEndTime = (startTime: Date | string, durationMinutes: number): string => {
        return formatDateYMDHHmm(add(durationMinutes, 'minute', startTime));
    };

    const handleClearForm = useCallback(() => {
        if (isUpdating) {
            // If updating, reset to the original appointment data
            handleAppointmentClick(formData.abID);
        } else {
            // If creating new, reset to default values
            setFormData(prevData => {
                const defaultData = getDefaultAppointBookingDto(formatDate, formatDateTime, formatDateYMD, formatDateYMDHHmm);
                return {
                    ...defaultData,
                    // Preserve the appointment slot details
                    abDate: prevData.abDate,
                    abTime: prevData.abTime,
                    abEndTime: prevData.abEndTime,
                    abDuration: prevData.abDuration,
                    abDurDesc: prevData.abDurDesc,
                    // Preserve the selected consultant/resource
                    hplID: prevData.hplID,
                    providerName: prevData.providerName,
                    rlID: prevData.rlID,
                    rlName: prevData.rlName
                };
            });
        }
    }, [isUpdating, formData.abID, handleAppointmentClick, formatDate, formatDateTime, formatDateYMD, formatDateYMDHHmm]);

    useEffect(() => {
        const fetchReasonOptions = async () => {
            const result = await ReasonListService.getAllReasonLists();
            if (result.success && result.data) {
                const activeReasons = result.data.filter(reason => reason.rActiveYN === 'Y');
                setReasonOptions(activeReasons.map(reason => ({
                    value: reason.arlID.toString(),
                    label: reason.arlName
                })));
            }
        };

        const fetchResourceOptions = async () => {
            const result = await ResourceListService.getAllResourceLists();
            if (result.success && result.data) {
                const activeResources = result.data.filter(resource => resource.rActiveYN === 'Y');
                setResourceOptions(activeResources.map(resource => ({
                    value: resource.rLID.toString(),
                    label: resource.rLName
                })));
            }
        };

        fetchReasonOptions();
        fetchResourceOptions();
    }, []);

    return (
        <Container maxWidth={false}>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '90vh',
                overflow: 'hidden'
            }}>
                <Paper elevation={3} sx={{ flexShrink: 0, zIndex: 1 }}>
                    <SchedulerHeader onRefresh={handleRefresh} onSearchSelection={handleSearchSelection} />
                </Paper>

                <Box sx={{
                    flexGrow: 1,
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <Box sx={{ flexShrink: 0, bgcolor: 'background.paper', p: 1 }}></Box>
                    <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                        <SchedulerComponent ref={schedulerRef} hpID={selectedConID} rlID={selectedRlID} onAppointmentFormOpening={handleAppointmentFormOpen} onAppointmentClick={handleAppointmentClick} />
                    </Box>
                </Box>

                <Paper elevation={3} sx={{ flexShrink: 0, zIndex: 1 }}>
                    <SchedulerFooter />
                </Paper>

                <GenericDialog
                    open={isBookingFormOpen}
                    onClose={handleAppointmentFormClose}
                    title="Book Appointment"
                    maxWidth="sm"
                    disableEscapeKeyDown={true}
                    disableBackdropClick={true}
                    dialogContentSx={{ maxHeight: '400px' }}
                    actions={[
                        <CustomButton key="close" text="Close" onClick={handleAppointmentFormClose} color="inherit" icon={CloseIcon} />,
                        <CustomButton key="clear" text="Reset" onClick={handleClearForm} color="error" sx={{ ml: 2 }} icon={ClearAllIcon} />,
                        <CustomButton key="save" text={isUpdating ? "Update" : "Save"} onClick={handleSaveBooking} color="primary" variant="contained" sx={{ ml: 2 }} icon={SaveIcon} />,
                    ]}
                >
                    <AppointmentBookingForm onChange={handleChange} formData={formData} reasonOptions={reasonOptions} resourceOptions={resourceOptions} rLotYN={rLotYN} />
                </GenericDialog>
            </Box>
        </Container>
    );
};

export default AppointmentPage;