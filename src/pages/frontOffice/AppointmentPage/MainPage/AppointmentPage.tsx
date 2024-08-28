import React, { useRef, useState, useCallback } from 'react';
import SchedulerComponent from '../SubPage/SchedulerComponent';
import SchedulerHeader from '../SubPage/SchedulerHeader';
import SchedulerFooter from '../SubPage/SchedulerFooter';
import AppointmentBookingForm from '../SubPage/AppointmentBookingForm';
import GenericDialog from '../../../../components/GenericDialog/GenericDialog';
import CustomButton from '../../../../components/Button/CustomButton';
import styled from 'styled-components';
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;

const SchedulerContainer = styled.div`
  flex: 1;
  overflow: hidden;
`;
const AppointmentPage: React.FC = () => {
    const schedulerRef = useRef<{ refresh: () => void } | null>(null);
    const [selectedConID, setSelectedConID] = useState<number | undefined>(undefined);
    const [selectedRlID, setSelectedRlID] = useState<number | undefined>(undefined);
    const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);

    const [formData, setFormData] = useState({
        registrationStatus: 'Registered',
        uhid: '',
        reason: '',
        resource: '',
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

    const handleSearchSelection = useCallback((conID?: number, rlID?: number) => {
        setSelectedConID(conID);
        setSelectedRlID(rlID);
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
        // Save the booking data here, then close the form
        handleAppointmentFormClose();
        handleRefresh(); // Refresh the scheduler after saving
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
            reason: '',
            resource: '',
            instruction: '',
            remarks: '',
            appointmentDate: prevData.appointmentDate,
            appointmentTime: prevData.appointmentTime,
            appointmentDuration: '15',
        }));
    }, []);

    return (
        <PageContainer>

            <SchedulerHeader
                onRefresh={handleRefresh}
                onSearchSelection={handleSearchSelection}
            />
            <SchedulerContainer>
                <SchedulerComponent
                    ref={schedulerRef}
                    hpID={selectedConID}
                    rlID={selectedRlID}
                    onAppointmentFormOpening={handleAppointmentFormOpen}
                />
            </SchedulerContainer>

            <SchedulerFooter />
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
                <AppointmentBookingForm
                    onChange={handleChange}
                    formData={formData}
                />
            </GenericDialog>
        </PageContainer>
    );
};

export default AppointmentPage;
