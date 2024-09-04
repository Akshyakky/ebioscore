import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Box, Paper, Container } from '@mui/material';
import SchedulerComponent from '../SubPage/SchedulerComponent';
import SchedulerHeader from '../SubPage/SchedulerHeader';
import SchedulerFooter from '../SubPage/SchedulerFooter';
import AppointmentBookingForm from '../SubPage/AppointmentBookingForm';
import GenericDialog from '../../../../components/GenericDialog/GenericDialog';
import CustomButton from '../../../../components/Button/CustomButton';
import { ReasonListService } from '../../../../services/FrontOfficeServices/ReasonListServices/ReasonListService';
import { ResourceListService } from '../../../../services/FrontOfficeServices/ResourceListServices/ResourceListServices';
import { DropdownOption } from '../../../../interfaces/Common/DropdownOption';

interface FormData {
    registrationStatus: string;
    uhid: string;
    reasonID: string;
    reasonName: string;
    resourceID: string;
    resourceName: string;
    instruction: string;
    appointmentDate: string;
    appointmentTime: string;
    appointmentDuration: string;
    remarks: string;
}

const AppointmentPage: React.FC = () => {
    const schedulerRef = useRef<{ refresh: () => void } | null>(null);
    const [selectedConID, setSelectedConID] = useState<number | undefined>(undefined);
    const [selectedRlID, setSelectedRlID] = useState<number | undefined>(undefined);
    const [rLotYN, setRLotYN] = useState<string | undefined>(undefined);
    const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
    const [reasonOptions, setReasonOptions] = useState<DropdownOption[]>([]);
    const [resourceOptions, setResourceOptions] = useState<DropdownOption[]>([]);

    const [formData, setFormData] = useState<FormData>({
        registrationStatus: 'Registered',
        uhid: '',
        reasonID: '',
        reasonName: '',
        resourceID: '',
        resourceName: '',
        instruction: '',
        appointmentDate: '',
        appointmentTime: '',
        appointmentDuration: '15',
        remarks: '',
    });

    const handleRefresh = useCallback(() => {
        if (schedulerRef.current) {
            schedulerRef.current.refresh();
        }
    }, []);

    const handleSearchSelection = useCallback((conID?: number, rlID?: number, rLotYN?: string) => {
        setSelectedConID(conID);
        setSelectedRlID(rlID);
        setRLotYN(rLotYN);
        handleRefresh();
    }, [handleRefresh]);

    const handleAppointmentFormOpen = useCallback((date?: Date, time?: Date) => {
        if (date) {
            const formattedDate = date.toISOString().split('T')[0];
            const formattedTime = time?.toISOString().split('T')[1]?.substring(0, 5) || '';

            setFormData(prevData => ({
                ...prevData,
                appointmentDate: formattedDate,
                appointmentTime: formattedTime,
            }));
        }
        setIsBookingFormOpen(true);
    }, []);

    const handleAppointmentFormClose = useCallback(() => {
        setIsBookingFormOpen(false);
    }, []);

    const handleSaveBooking = useCallback(() => {
        console.log("Booking Data:", formData);
        handleAppointmentFormClose();
        handleRefresh();
    }, [formData, handleAppointmentFormClose, handleRefresh]);

    const handleChange = useCallback((name: string, value: any) => {
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    }, []);

    const handleClearForm = useCallback(() => {
        setFormData(prevData => ({
            ...prevData,
            registrationStatus: 'Registered',
            uhid: '',
            reasonID: '',
            reasonName: '',
            resourceID: '',
            resourceName: '',
            instruction: '',
            remarks: '',
            appointmentDate: prevData.appointmentDate,
            appointmentTime: prevData.appointmentTime,
            appointmentDuration: '15',
        }));
    }, []);

    useEffect(() => {
        const fetchReasonOptions = async () => {
            const result = await ReasonListService.getAllReasonLists();
            if (result.success && result.data) {
                const activeReasons = result.data.filter(reason => reason.rActiveYN === 'Y');
                setReasonOptions(activeReasons.map(reason => ({
                    value: reason.arlID,
                    label: reason.arlName
                })));
            }
        };

        const fetchResourceOptions = async () => {
            const result = await ResourceListService.getAllResourceLists();
            if (result.success && result.data) {
                const activeResources = result.data.filter(resource => resource.rActiveYN === 'Y');
                setResourceOptions(activeResources.map(resource => ({
                    value: resource.rLID,
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
                        <CustomButton key="close" text="Close" onClick={handleAppointmentFormClose} color="inherit" />,
                        <CustomButton key="clear" text="Clear" onClick={handleClearForm} color="error" sx={{ ml: 2 }} />,
                        <CustomButton key="save" text="Save" onClick={handleSaveBooking} color="primary" variant="contained" sx={{ ml: 2 }} />,
                    ]}
                >
                    <AppointmentBookingForm onChange={handleChange} formData={formData} reasonOptions={reasonOptions} resourceOptions={resourceOptions} rLotYN={rLotYN} />
                </GenericDialog>
            </Box>
        </Container>
    );
};

export default AppointmentPage;
