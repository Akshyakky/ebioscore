import React, { useState, useEffect } from 'react';
import CustomButton from '../../../../components/Button/CustomButton';
import RadioGroup from '../../../../components/RadioGroup/RadioGroup';
import { FormControlLabel, Checkbox, FormGroup, Typography } from '@mui/material';
import FloatingLabelTextBox from '../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox';
import GenericDialog from '../../../../components/GenericDialog/GenericDialog';
import { useServerDate } from '../../../../hooks/Common/useServerDate';
import RepeatIcon from '@mui/icons-material/Repeat';
import { formatDate } from '../../../../utils/Common/dateUtils';
import Close from '@mui/icons-material/Close';
import Save from '@mui/icons-material/Save';

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
                <FloatingLabelTextBox
                    title="Every"
                    value={interval.toString()}
                    onChange={(e) => {
                        let value = parseInt(e.target.value, 10);
                        if (isNaN(value) || value < 0) {
                            value = 0;
                        }
                        handleChange('interval', value);
                    }}
                    placeholder={`${frequency.charAt(0).toUpperCase() + frequency.slice(1)}s`}
                    isMandatory
                    size="small"
                    name="interval"
                    ControlID=""
                    type="number"
                />
                <FloatingLabelTextBox
                    title="End On"
                    value={endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    type="date"
                    size="small"
                    name="endDate"
                    ControlID=""
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
        onSave(frequencyData);
        onClose();
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
            <RadioGroup
                name="frequency"
                selectedValue={frequencyData.frequency}
                onChange={(e) => handleChange('frequency', e.target.value)}
                options={[
                    { label: 'None', value: 'none' },
                    { label: 'Daily', value: 'daily' },
                    { label: 'Weekly', value: 'weekly' },
                    { label: 'Monthly', value: 'monthly' },
                    { label: 'Yearly', value: 'yearly' },
                ]}
                label="Frequency"
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