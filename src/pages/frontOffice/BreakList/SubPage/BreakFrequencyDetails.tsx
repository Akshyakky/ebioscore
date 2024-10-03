import React, { useState, useEffect } from 'react';
import CustomButton from '../../../../components/Button/CustomButton';
import { FormControlLabel, Checkbox, FormGroup, Typography } from '@mui/material';
import GenericDialog from '../../../../components/GenericDialog/GenericDialog';
import { useServerDate } from '../../../../hooks/Common/useServerDate';
import RepeatIcon from '@mui/icons-material/Repeat';
import { formatDate } from '../../../../utils/Common/dateUtils';
import Close from '@mui/icons-material/Close';
import Save from '@mui/icons-material/Save';
import FormField from '../../../../components/FormField/FormField';
import { showAlert } from '../../../../utils/Common/showAlert';

interface BreakFrequencyDetailsProps {
    open: boolean;
    onClose: () => void;
    endDateFromBreakDetails: string;
    onSave: (frequencyData: FrequencyData) => void;
    initialFrequencyData: FrequencyData;
}

export interface FrequencyData {
    frequency: string;
    endDate: string;
    interval: number;
    weekDays: string[];
}

const BreakFrequencyDetails: React.FC<BreakFrequencyDetailsProps> = ({
    open,
    onClose,
    endDateFromBreakDetails,
    onSave,
    initialFrequencyData

}) => {
    const serverDate = useServerDate();
    const [frequencyData, setFrequencyData] = useState<FrequencyData>(initialFrequencyData);

    useEffect(() => {
        setFrequencyData(prev => ({ ...prev, endDate: endDateFromBreakDetails }));
    }, [endDateFromBreakDetails]);

    useEffect(() => {
        setFrequencyData(initialFrequencyData);
    }, [initialFrequencyData]);

    const handleChange = (field: keyof FrequencyData, value: string | number | string[]) => {
        setFrequencyData(prev => ({ ...prev, [field]: value }));
    };

    const handleWeekDaysChange = (day: string, checked: boolean) => {
        setFrequencyData(prev => ({
            ...prev,
            weekDays: checked
                ? [...prev.weekDays, day]
                : prev.weekDays.filter(d => d !== day),
        }));
    };

    const validateFrequency = (): boolean => {
        const { frequency, interval, endDate } = frequencyData;
        const startDate = new Date(initialFrequencyData.endDate);
        const endDateObj = new Date(endDate);

        let validEndDate: Date;

        switch (frequency) {
            case 'daily':
                validEndDate = new Date(startDate.setDate(startDate.getDate() + interval));
                if (endDateObj < validEndDate) {
                    showAlert('Error', 'Invalid date range, End Date does not match with the Start Date for daily frequency', 'error');
                    return false;
                }
                break;
            case 'weekly':
                validEndDate = new Date(startDate.setDate(startDate.getDate() + (interval * 7)));
                if (endDateObj < validEndDate) {
                    showAlert('Error', 'Invalid date range, End Date does not match with the Start Date for weekly frequency', 'error');
                    return false;
                }
                break;
            case 'monthly':
                validEndDate = new Date(startDate.setMonth(startDate.getMonth() + interval));
                if (endDateObj < validEndDate) {
                    showAlert('Error', 'Invalid date range, End Date does not match with the Start Date for monthly frequency', 'error');
                    return false;
                }
                break;
            case 'yearly':
                validEndDate = new Date(startDate.setFullYear(startDate.getFullYear() + interval));
                if (endDateObj < validEndDate) {
                    showAlert('Error', 'Invalid date range, End Date does not match with the Start Date for yearly frequency', 'error');
                    return false;
                }
                break;
        }

        return true;
    };

    const renderSummaryText = () => {
        const { frequency, interval, weekDays, endDate } = frequencyData;
        const formattedEndDate = formatDate(endDate);

        switch (frequency) {
            case 'daily':
                return `Every ${interval} Day${interval > 1 ? 's' : ''} Till ${formattedEndDate}`;
            case 'weekly':
                const selectedDays = weekDays.map(day => day.slice(0, 3)).join('-');
                return `Every ${interval} Week${interval > 1 ? 's' : ''} On ${selectedDays} Till ${formattedEndDate}`;
            case 'monthly':
                return `Every ${interval} Month${interval > 1 ? 's' : ''} Till ${formattedEndDate}`;
            case 'yearly':
                return `Every ${interval} Year${interval > 1 ? 's' : ''} Till ${formattedEndDate}`;
            default:
                return `No Repeat End Date: ${formattedEndDate}`;
        }
    };

    const renderFrequencyDetails = () => {
        const { frequency, interval, endDate } = frequencyData;

        const commonInputs = (
            <>
                <FormField
                    type="number"
                    label="Every"
                    name="interval"
                    value={interval}
                    onChange={(e) => {
                        let value = e.target.value;
                        if (value === '') {
                            handleChange('interval', '');
                        } else {
                            const parsedValue = parseInt(value, 10);
                            if (!isNaN(parsedValue) && parsedValue >= 0) {
                                handleChange('interval', parsedValue);
                            }
                        }
                    }}
                    placeholder={`${frequency.charAt(0).toUpperCase() + frequency.slice(1)}s`}
                    isMandatory
                    ControlID="interval"
                />

                <FormField
                    type="datepicker"
                    label="End on"
                    name="endDate"
                    value={endDate}
                    onChange={(newDate) => handleChange('endDate', newDate?.toISOString().split('T')[0] || '')}
                    ControlID="EndDate"
                    minDate={serverDate}
                />


            </>
        );

        switch (frequency) {
            case 'daily':
                return commonInputs;
            case 'weekly':
                return (
                    <>
                        {commonInputs}
                        <FormGroup row>
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                                <FormControlLabel
                                    key={day}
                                    control={
                                        <Checkbox
                                            checked={frequencyData.weekDays.includes(day)}
                                            onChange={(e) => handleWeekDaysChange(day, e.target.checked)}
                                            value={day}
                                        />
                                    }
                                    label={day}
                                />
                            ))}
                        </FormGroup>
                    </>
                );
            case 'monthly':
            case 'yearly':
                return commonInputs;
            default:
                return null;
        }
    };

    const handleSave = () => {
        if (validateFrequency()) {
            onSave(frequencyData);
            onClose();
        }
    };

    return (
        <GenericDialog
            open={open}
            onClose={onClose}
            title="Break Frequency Details"
            maxWidth="sm"
            fullWidth
            actions={
                <>
                    <CustomButton
                        variant="contained"
                        text="Save"
                        onClick={handleSave}
                        size="small"
                        icon={Save}
                    />
                    <CustomButton
                        variant="outlined"
                        text="CLOSE"
                        onClick={onClose}
                        icon={Close}
                        size="small"
                    />
                </>
            }
        >
            <FormField
                type="radio"
                label="Frequency"
                name="frequency"
                value={frequencyData.frequency}
                onChange={(e) => handleChange('frequency', e.target.value)}
                options={[
                    { label: 'None', value: 'none' },
                    { label: 'Daily', value: 'daily' },
                    { label: 'Weekly', value: 'weekly' },
                    { label: 'Monthly', value: 'monthly' },
                    { label: 'Yearly', value: 'yearly' },
                ]}
                ControlID="frequency"
            />
            {renderFrequencyDetails()}
            <Typography style={{ color: '#3f51b5', display: 'flex', alignItems: 'center', marginTop: '16px' }}>
                <RepeatIcon style={{ marginRight: 4 }} />
                {renderSummaryText()}
            </Typography>
        </GenericDialog>
    );
};

export default BreakFrequencyDetails;