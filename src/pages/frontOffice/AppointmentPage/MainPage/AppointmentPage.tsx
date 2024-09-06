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

const AppointmentPage: React.FC = () => {
    const { date: serverDate, formatDate, formatDateTime, formatTime, add, formatISO, format } = useDayjs(useServerDate());
    const schedulerRef = useRef<{ refresh: () => void } | null>(null);
    const [selectedConID, setSelectedConID] = useState<number | undefined>(undefined);
    const [selectedRlID, setSelectedRlID] = useState<number | undefined>(undefined);
    const [rLotYN, setRLotYN] = useState<string | undefined>(undefined);
    const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
    const [reasonOptions, setReasonOptions] = useState<DropdownOption[]>([]);
    const [resourceOptions, setResourceOptions] = useState<DropdownOption[]>([]);
    const [selectedProviderName, setSelectedProviderName] = useState<string>('');
    const [selectedRlName, setSelectedRlName] = useState<string>('');

    const [formData, setFormData] = useState<AppointBookingDto>({
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
        abDate: formatDate(),
        abTime: formatDateTime(),
        abPType: 'R',
        abStatus: 'Booked',
        patRegisterYN: 'Y',
        dob: formatDate(),
        oTBookNo: 0,
        patOPIP: 'O',
        rActiveYN: 'Y',
        rCreatedID: 0,
        rCreatedBy: '',
        rCreatedOn: formatDateTime(),
        rModifiedID: 0,
        rModifiedBy: '',
        rModifiedOn: formatDateTime(),
        abEndTime: formatDateTime(),
        transferYN: 'N',
        status: 'Active'
    });

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

    const handleAppointmentFormOpen = useCallback((date?: Date, time?: Date) => {
        if (!selectedConID && !selectedRlID) {
            showAlert('Warning', 'Please select a consultant or resource before booking an appointment.', 'warning');
            return;
        }

        if (date && time) {
            setFormData(prevData => ({
                ...prevData,
                abDate: format('YYYY-MM-DD', date),
                abTime: formatDateTime(date),
                abEndTime: formatDateTime(calculateEndTime(date, prevData.abDuration)),
                hplID: selectedConID || 0,
                providerName: selectedProviderName,
                rlID: selectedRlID || 0,
                rlName: selectedRlName
            }));
        }
        setIsBookingFormOpen(true);
    }, [selectedConID, selectedRlID, selectedProviderName, selectedRlName]);

    const handleAppointmentFormClose = useCallback(() => {
        setIsBookingFormOpen(false);
    }, []);

    const handleSaveBooking = useCallback(async () => {
        try {
            const result = await AppointmentService.saveAppointBooking(formData);
            if (result.success) {
                showAlert('Notification', 'Appointment booked successfully', 'success', {
                    onConfirm: () => {
                        handleRefresh();
                        handleAppointmentFormClose();
                    }
                });
            } else {
                showAlert('Error', result.errorMessage || 'Failed to book appointment', 'error');
            }
        } catch (error) {
            console.error('Error saving appointment:', error);
            showAlert('Error', 'An error occurred while booking the appointment', 'error');
        }
    }, [formData, handleAppointmentFormClose, handleRefresh]);

    const handleChange = useCallback((name: keyof AppointBookingDto, value: any) => {
        setFormData(prevData => {
            const newData = { ...prevData, [name]: value };

            if (name === 'abDuration') {
                newData.abDurDesc = `${value} minutes`;
                newData.abEndTime = calculateEndTime(new Date(newData.abTime), value);
            } else if (name === 'abTime') {
                newData.abEndTime = calculateEndTime(new Date(value), newData.abDuration);
            }

            return newData;
        });
    }, []);

    const handleClearForm = useCallback(() => {
        setFormData(prevData => ({
            ...prevData,
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
            abPType: 'R',
            patRegisterYN: 'Y',
            pChartID: undefined,
            pChartCode: undefined,
            appPhone1: undefined,
            arlInstructions: undefined,
            city: undefined,
            dob: undefined,
            email: undefined,
            pssnId: undefined,
            intIdPsprt: undefined,
            rNotes: undefined,
            oTBookNo: 0
        }));
    }, []);

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

    const calculateEndTime = (startTime: Date | string, durationMinutes: number): string => {
        return add(durationMinutes, 'minute', startTime).toISOString();
    };

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
                        <SchedulerComponent ref={schedulerRef} hpID={selectedConID} rlID={selectedRlID} onAppointmentFormOpening={handleAppointmentFormOpen} />
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
                        <CustomButton key="clear" text="Clear" onClick={handleClearForm} color="error" sx={{ ml: 2 }} icon={ClearAllIcon} />,
                        <CustomButton key="save" text="Save" onClick={handleSaveBooking} color="primary" variant="contained" sx={{ ml: 2 }} icon={SaveIcon} />,
                    ]}
                >
                    <AppointmentBookingForm onChange={handleChange} formData={formData} reasonOptions={reasonOptions} resourceOptions={resourceOptions} rLotYN={rLotYN} />
                </GenericDialog>
            </Box>
        </Container>
    );
};

export default AppointmentPage;