import React from 'react';
import { Box, Grid } from '@mui/material';
import { DropdownOption } from '../../../../interfaces/Common/DropdownOption';
import FormField from '../../../../components/FormField/FormField';

interface AppointmentBookingFormProps {
    onChange: (name: string, value: any) => void;
    formData: any;
    reasonOptions: DropdownOption[];
    resourceOptions: DropdownOption[];
    rLotYN?: string;
}

const AppointmentBookingForm: React.FC<AppointmentBookingFormProps> = ({
    onChange,
    formData,
    reasonOptions,
    resourceOptions,
    rLotYN
}) => {
    const registrationOptions = [
        { value: 'Registered', label: 'Registered' },
        { value: 'NonRegistered', label: 'Non Registered' }
    ];

    return (
        <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', width: '100%' }}>
            <FormField
                type="radio"
                label="Registration Status"
                name="registrationStatus"
                ControlID="registrationStatus"
                value={formData.registrationStatus}
                options={registrationOptions}
                onChange={(e, value) => onChange('registrationStatus', value)}
                isMandatory={true}
                gridProps={{ xs: 12 }}
                inline={true}
            />

            <FormField
                type="text"
                label="UHID No."
                ControlID="uhid"
                value={formData.uhid}
                name="uhid"
                placeholder="UHID, Name, DOB, Phone No"
                isMandatory={true}
                onChange={(e) => onChange('uhid', e.target.value)}
                gridProps={{ xs: 12 }}
            />

            {rLotYN === 'N' && (
                <FormField
                    type="select"
                    label="Consultant"
                    name="consultantID"
                    ControlID="consultantID"
                    value={formData.consultantID}
                    options={reasonOptions}
                    onChange={(e) => {
                        const selectedOption = reasonOptions.find(option => option.value === e.target.value);
                        onChange('consultantID', selectedOption?.value);
                        onChange('consultantName', selectedOption?.label);
                    }}
                    isMandatory={true}
                    gridProps={{ xs: 12 }}
                />
            )}

            {rLotYN !== 'Y' && (
                <FormField
                    type="select"
                    label="Resource"
                    name="resourceID"
                    ControlID="resourceID"
                    value={formData.resourceID}
                    options={resourceOptions}
                    onChange={(e) => {
                        const selectedOption = resourceOptions.find(option => option.value === e.target.value);
                        onChange('resourceID', selectedOption?.value);
                        onChange('resourceName', selectedOption?.label);
                    }}
                    isMandatory={true}
                    gridProps={{ xs: 12 }}
                />
            )}

            <FormField
                type="select"
                label="Reason"
                name="reasonID"
                ControlID="reasonID"
                value={formData.reasonID}
                options={reasonOptions}
                onChange={(e) => {
                    const selectedOption = reasonOptions.find(option => option.value === e.target.value);
                    onChange('reasonID', selectedOption?.value);
                    onChange('reasonName', selectedOption?.label);
                }}
                isMandatory={true}
                gridProps={{ xs: 12 }}
            />

            <FormField
                type="text"
                label="Instruction"
                ControlID="instruction"
                value={formData.instruction}
                name="instruction"
                onChange={(e) => onChange('instruction', e.target.value)}
                gridProps={{ xs: 12 }}
            />

            <Grid container spacing={2}>
                <FormField
                    type="date"
                    label="Appointment Date"
                    ControlID="appointmentDate"
                    value={formData.appointmentDate}
                    name="appointmentDate"
                    onChange={(e) => onChange('appointmentDate', e.target.value)}
                    isMandatory={true}
                    disabled={true}
                    gridProps={{ xs: 6 }}
                />

                <FormField
                    type="text"
                    label="Appointment Time"
                    ControlID="appointmentTime"
                    value={formData.appointmentTime}
                    name="appointmentTime"
                    onChange={(e) => onChange('appointmentTime', e.target.value)}
                    isMandatory={true}
                    disabled={true}
                    gridProps={{ xs: 6 }}
                />
            </Grid>

            <FormField
                type="text"
                label="Appointment Duration (minutes)"
                ControlID="appointmentDuration"
                value={formData.appointmentDuration || '15'}
                name="appointmentDuration"
                onChange={(e) => onChange('appointmentDuration', e.target.value)}
                isMandatory={true}
                gridProps={{ xs: 12 }}
            />

            <FormField
                type="textarea"
                label="Remarks"
                ControlID="remarks"
                value={formData.remarks}
                name="remarks"
                onChange={(e) => onChange('remarks', e.target.value)}
                gridProps={{ xs: 12 }}
                maxLength={250}
            />
        </Box>
    );
};

export default AppointmentBookingForm;
