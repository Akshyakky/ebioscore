import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@mui/material';
import { DropdownOption } from '../../../../interfaces/Common/DropdownOption';
import FormField from '../../../../components/FormField/FormField';
import { AppointBookingDto } from '../../../../interfaces/FrontOffice/AppointBookingDto';
import { ConstantValues } from '../../../../services/CommonServices/ConstantValuesService';
import { AppModifyListService } from '../../../../services/CommonServices/AppModifyListService';
import { useServerDate } from '../../../../hooks/Common/useServerDate';
import useDayjs from '../../../../hooks/Common/useDateTime';

interface AppointmentBookingFormProps {
    onChange: (name: keyof AppointBookingDto, value: any) => void;
    formData: AppointBookingDto;
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
    const { date: serverDate, formatDate, formatDateTime, formatTime, add } = useDayjs(useServerDate());
    const registrationOptions = [
        { value: 'Y', label: 'Registered' },
        { value: 'N', label: 'Non Registered' }
    ];
    const [cityOptions, setCityOptions] = useState<DropdownOption[]>([]);
    const [titleOptions, setTitleOptions] = useState<DropdownOption[]>([]);

    useEffect(() => {
        const loadDropdownValues = async () => {
            try {
                const [titleValues, cityValues] = await Promise.all([
                    ConstantValues.fetchConstantValues("GetConstantValues", "PTIT"),
                    AppModifyListService.fetchAppModifyList(
                        "GetActiveAppModifyFieldsAsync",
                        "CITY"
                    ),
                ]);

                setTitleOptions(titleValues.map((item) => ({
                    value: item.value,
                    label: item.label,
                })));

                setCityOptions(cityValues.map((item) => ({
                    value: item.value,
                    label: item.label,
                })));
            } catch (error) {
                console.error("Error loading dropdown values:", error);
            }
        };

        loadDropdownValues();
    }, []);

    const handleDurationBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (e.target instanceof HTMLInputElement) {
            const inputValue = e.target.value.trim();
            if (inputValue === '') {
                onChange('abDuration', 15);
                return;
            }
            let numericValue = parseInt(inputValue, 10);
            if (isNaN(numericValue)) {
                onChange('abDuration', 15);
                return;
            }
            let roundedValue = Math.round(numericValue / 15) * 15;
            roundedValue = Math.max(15, Math.min(roundedValue, 480));
            onChange('abDuration', roundedValue);
        }
    };

    const isNonRegistered = formData.patRegisterYN === 'N';

    return (
        <Box sx={{ backgroundColor: '#fff', borderRadius: '8px', width: '100%' }}>
            <FormField
                type="radio"
                label="Registration Status"
                name="patRegisterYN"
                ControlID="patRegisterYN"
                value={formData.patRegisterYN}
                options={registrationOptions}
                onChange={(e, value) => onChange('patRegisterYN', value)}
                isMandatory={true}
                gridProps={{ xs: 12 }}
                inline={true}
            />

            {isNonRegistered && (
                <>
                    <FormField
                        type="select"
                        label="Title"
                        name="atName"
                        ControlID="atName"
                        value={formData.atName}
                        options={titleOptions}
                        onChange={(e) => onChange('atName', e.target.value)}
                        isMandatory={true}
                        gridProps={{ xs: 12 }}
                    />
                    <FormField
                        type="text"
                        label="First Name"
                        ControlID="abFName"
                        value={formData.abFName}
                        name="abFName"
                        onChange={(e) => onChange('abFName', e.target.value)}
                        isMandatory={true}
                        gridProps={{ xs: 6 }}
                    />
                    <FormField
                        type="text"
                        label="Last Name"
                        ControlID="abLName"
                        value={formData.abLName}
                        name="abLName"
                        onChange={(e) => onChange('abLName', e.target.value)}
                        isMandatory={true}
                        gridProps={{ xs: 6 }}
                    />
                    <FormField
                        type="text"
                        label="Aadhaar No."
                        ControlID="pssnId"
                        value={formData.pssnId}
                        name="pssnId"
                        onChange={(e) => onChange('pssnId', e.target.value)}
                        gridProps={{ xs: 6 }}
                    />
                    <FormField
                        type="text"
                        label="Int. ID/Passport ID"
                        ControlID="intIdPsprt"
                        value={formData.intIdPsprt}
                        name="intIdPsprt"
                        onChange={(e) => onChange('intIdPsprt', e.target.value)}
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
                        ControlID="appPhone1"
                        value={formData.appPhone1}
                        name="appPhone1"
                        onChange={(e) => onChange('appPhone1', e.target.value)}
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
                    ControlID="pChartCode"
                    value={formData.pChartCode}
                    name="pChartCode"
                    placeholder="UHID, Name, DOB, Phone No"
                    isMandatory={true}
                    onChange={(e) => onChange('pChartCode', e.target.value)}
                    gridProps={{ xs: 12 }}
                />
            )}

            {rLotYN === 'N' && (
                <FormField
                    type="select"
                    label="Consultant"
                    name="hplID"
                    ControlID="hplID"
                    value={formData.hplID.toString()}
                    options={reasonOptions}
                    onChange={(e) => {
                        const selectedOption = reasonOptions.find(option => option.value === e.target.value);
                        onChange('hplID', parseInt(selectedOption?.value || '0', 10));
                        onChange('providerName', selectedOption?.label || '');
                    }}
                    isMandatory={true}
                    gridProps={{ xs: 12 }}
                />
            )}

            {rLotYN !== 'Y' && (
                <FormField
                    type="select"
                    label="Resource"
                    name="rlID"
                    ControlID="rlID"
                    value={formData.rlID.toString()}
                    options={resourceOptions}
                    onChange={(e) => {
                        const selectedOption = resourceOptions.find(option => option.value === e.target.value);
                        onChange('rlID', parseInt(selectedOption?.value || '0', 10));
                        onChange('rlName', selectedOption?.label || '');
                    }}
                    isMandatory={true}
                    gridProps={{ xs: 12 }}
                />
            )}

            <FormField
                type="select"
                label="Reason"
                name="arlID"
                ControlID="arlID"
                value={formData.arlID?.toString()}
                options={reasonOptions}
                onChange={(e) => {
                    const selectedOption = reasonOptions.find(option => option.value === e.target.value);
                    onChange('arlID', parseInt(selectedOption?.value || '0', 10));
                    onChange('arlName', selectedOption?.label || '');
                }}
                isMandatory={true}
                gridProps={{ xs: 12 }}
            />

            <FormField
                type="text"
                label="Instruction"
                ControlID="arlInstructions"
                value={formData.arlInstructions}
                name="arlInstructions"
                onChange={(e) => onChange('arlInstructions', e.target.value)}
                gridProps={{ xs: 12 }}
            />

            <Grid container spacing={2}>
                <FormField
                    type="date"
                    label="Appointment Date"
                    ControlID="abDate"
                    value={formData.abDate}
                    name="abDate"
                    onChange={(e) => onChange('abDate', e.target.value)}
                    isMandatory={true}
                    disabled={true}
                    gridProps={{ xs: 6 }}
                />

                <FormField
                    type="text"
                    label="Appointment Time"
                    ControlID="abTime"
                    value={formatTime(formData.abTime)}
                    name="abTime"
                    onChange={(e) => onChange('abTime', e.target.value)}
                    isMandatory={true}
                    disabled={true}
                    gridProps={{ xs: 6 }}
                />
            </Grid>

            <FormField
                type="number"
                label="Appointment Duration (minutes)"
                ControlID="abDuration"
                value={formData.abDuration}
                name="abDuration"
                onChange={(e) => onChange('abDuration', parseInt(e.target.value, 10))}
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
                ControlID="rNotes"
                value={formData.rNotes || ''}
                name="rNotes"
                onChange={(e) => onChange('rNotes', e.target.value)}
                gridProps={{ xs: 12 }}
                maxLength={250}
            />

        </Box>
    );
};

export default AppointmentBookingForm;