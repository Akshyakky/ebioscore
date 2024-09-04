import React, { useState } from 'react';
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
    const [cityOptions, setCityOptions] = useState<DropdownOption[]>([]);
    const [titleOptions, setTitleOptions] = useState<DropdownOption[]>([]);

    const handleDurationBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (e.target instanceof HTMLInputElement) {
            const inputValue = e.target.value.trim();
            if (inputValue === '') {
                onChange('appointmentDuration', '15');
                return;
            }
            let numericValue = parseInt(inputValue, 10);
            if (isNaN(numericValue)) {
                onChange('appointmentDuration', '15');
                return;
            }
            let roundedValue = Math.round(numericValue / 15) * 15;
            roundedValue = Math.max(15, Math.min(roundedValue, 480));
            onChange('appointmentDuration', roundedValue.toString());
        }
    };

    const isNonRegistered = formData.registrationStatus === 'NonRegistered';

    return (
        <Box sx={{ backgroundColor: '#fff', borderRadius: '8px', width: '100%' }}>
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

            {isNonRegistered && (
                <>
                    <FormField
                        type="select"
                        label="Title"
                        name="title"
                        ControlID="title"
                        value={formData.title}
                        options={titleOptions}
                        onChange={(e) => onChange('title', e.target.value)}
                        isMandatory={true}
                        gridProps={{ xs: 12 }}
                    />
                    <FormField
                        type="text"
                        label="First Name"
                        ControlID="firstName"
                        value={formData.firstName}
                        name="firstName"
                        onChange={(e) => onChange('firstName', e.target.value)}
                        isMandatory={true}
                        gridProps={{ xs: 6 }}
                    />
                    <FormField
                        type="text"
                        label="Last Name"
                        ControlID="lastName"
                        value={formData.lastName}
                        name="lastName"
                        onChange={(e) => onChange('lastName', e.target.value)}
                        isMandatory={true}
                        gridProps={{ xs: 6 }}
                    />
                    <FormField
                        type="text"
                        label="Aadhaar No."
                        ControlID="aadhaarNo"
                        value={formData.aadhaarNo}
                        name="aadhaarNo"
                        onChange={(e) => onChange('aadhaarNo', e.target.value)}
                        gridProps={{ xs: 6 }}
                    />
                    <FormField
                        type="text"
                        label="Int. ID/Passport ID"
                        ControlID="passportId"
                        value={formData.passportId}
                        name="passportId"
                        onChange={(e) => onChange('passportId', e.target.value)}
                        gridProps={{ xs: 6 }}
                    />
                    <FormField
                        type="date"
                        label="DOB"
                        ControlID="dob"
                        value={formData.dob}
                        name="dob"
                        onChange={(e) => onChange('dob', e.target.value)}
                        gridProps={{ xs: 6 }}
                    />
                    <FormField
                        type="text"
                        label="Contact No."
                        ControlID="contactNo"
                        value={formData.contactNo}
                        name="contactNo"
                        onChange={(e) => onChange('contactNo', e.target.value)}
                        isMandatory={true}
                        gridProps={{ xs: 6 }}
                    />
                    <FormField
                        type="email"
                        label="Email"
                        ControlID="email"
                        value={formData.email}
                        name="email"
                        onChange={(e) => onChange('email', e.target.value)}
                        gridProps={{ xs: 6 }}
                    />
                    <FormField
                        type="select"
                        label="City"
                        name="city"
                        ControlID="city"
                        value={formData.city}
                        options={cityOptions}
                        onChange={(e) => onChange('city', e.target.value)}
                        gridProps={{ xs: 6 }}
                    />
                </>
            )}

            {!isNonRegistered && (
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
            )}

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
                type="number"
                label="Appointment Duration (minutes)"
                ControlID="appointmentDuration"
                value={formData.appointmentDuration}
                name="appointmentDuration"
                onChange={(e) => onChange('appointmentDuration', e.target.value)}
                onBlur={handleDurationBlur}
                isMandatory={true}
                min={15}
                max={480}
                step={15}
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
