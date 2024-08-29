//frontOffice/AppointmentPage/SubPage/SchedulerFooter.tsx
import React from 'react';
import { Box, Chip, Typography, useTheme } from '@mui/material';

const legends = [
    { color: 'success.main', label: 'Out Patient' },
    { color: 'error.main', label: 'In Patient' },
    { color: 'warning.main', label: 'Visited Patient' },
    { color: 'primary.main', label: 'Seen Patient' },
    { color: 'orange', label: 'Breaks' },
    { color: 'text.disabled', label: 'Non Working Hour' },
    { color: 'secondary.main', label: 'Non Registered Patients' },
    { color: 'error.light', label: 'Elapsed Slots' },
];

const SchedulerFooter: React.FC = () => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 1,
                p: 1,
                backgroundColor: theme.palette.background.paper,
                borderTop: `1px solid ${theme.palette.divider}`,
            }}
        >
            {legends.map((legend, index) => (
                <Chip
                    key={index}
                    icon={
                        <Box
                            sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: legend.color,
                                mr: -0.5,
                            }}
                        />
                    }
                    label={
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                            {legend.label}
                        </Typography>
                    }
                    sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        '& .MuiChip-icon': { color: 'transparent' },
                    }}
                />
            ))}
        </Box>
    );
};

export default SchedulerFooter;