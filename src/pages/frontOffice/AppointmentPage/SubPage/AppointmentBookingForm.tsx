import React from 'react';
import { Box, Grid } from '@mui/material';
import FloatingLabelTextBox from '../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox';
import DropdownSelect from '../../../../components/DropDown/DropdownSelect';
import RadioGroup from '../../../../components/RadioGroup/RadioGroup';
import { DropdownOption } from '../../../../interfaces/Common/DropdownOption';

interface AppointmentBookingFormProps {
    onChange: (name: string, value: any) => void;
    formData: any;
    reasonOptions: DropdownOption[];
    resourceOptions: DropdownOption[];
}


const AppointmentBookingForm: React.FC<AppointmentBookingFormProps> = ({
    onChange,
    formData,
    reasonOptions,
    resourceOptions
}) => {

    const registrationOptions = [
        { value: 'Registered', label: 'Registered' },
        { value: 'NonRegistered', label: 'Non Registered' }
    ];

    return (
        <Box sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', width: '100%' }}>
            <RadioGroup
                name="registrationStatus"
                options={registrationOptions}
                selectedValue={formData.registrationStatus}
                onChange={(e, value) => onChange('registrationStatus', value)}
                isMandatory={true}
                inline={true}
                label="Registration Status"
            />

            <FloatingLabelTextBox
                ControlID="uhid"
                title="UHID No."
                value={formData.uhid}
                onChange={(e) => onChange('uhid', e.target.value)}
                placeholder="UHID, Name, DOB, Phone No"
                isMandatory={true}
                size='small'
            />


            <DropdownSelect
                label="Reason"
                name="reasonID"
                value={formData.reasonID}
                options={reasonOptions}
                onChange={(e) => {
                    const selectedOption = reasonOptions.find(option => option.value === e.target.value);
                    onChange('reasonID', selectedOption?.value);
                    onChange('reasonName', selectedOption?.label);
                }}
                isMandatory={true}
                size='small'
            />

            <DropdownSelect
                label="Resource"
                name="resourceID"
                value={formData.resourceID}
                options={resourceOptions}
                onChange={(e) => {
                    const selectedOption = resourceOptions.find(option => option.value === e.target.value);
                    onChange('resourceID', selectedOption?.value);
                    onChange('resourceName', selectedOption?.label);
                }}
                isMandatory={true}
                size='small'
            />

            <FloatingLabelTextBox
                ControlID="instruction"
                title="Instruction"
                value={formData.instruction}
                onChange={(e) => onChange('instruction', e.target.value)}
                size='small'
            />

            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <FloatingLabelTextBox
                        ControlID="appointmentDate"
                        title="Appointment Date"
                        type="date"
                        value={formData.appointmentDate}
                        onChange={(e) => onChange('appointmentDate', e.target.value)}
                        isMandatory={true}
                        size='small'
                        disabled={true}
                    />
                </Grid>
                <Grid item xs={6}>
                    <FloatingLabelTextBox
                        ControlID="appointmentTime"
                        title="Appointment Time"
                        type="time"
                        value={formData.appointmentTime}
                        onChange={(e) => onChange('appointmentTime', e.target.value)}
                        isMandatory={true}
                        size='small'
                        disabled={true}
                    />
                </Grid>
            </Grid>

            <FloatingLabelTextBox
                ControlID="appointmentDuration"
                title="Appointment Duration (minutes)"
                type='text'
                value={formData.appointmentDuration || 15}
                onChange={(e) => onChange('appointmentDuration', e.target.value)}
                isMandatory={true}
                size='small'
            />

            <FloatingLabelTextBox
                ControlID="remarks"
                title="Remarks"
                value={formData.remarks}
                onChange={(e) => onChange('remarks', e.target.value)}
                multiline={true}
                rows={3}
                size='small'
            />
        </Box>
    );
};

export default AppointmentBookingForm;
