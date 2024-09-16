import React, { useMemo } from 'react';
import { Box, Chip, Typography, useTheme } from '@mui/material';

interface Legend {
    color: string;
    label: string;
}

const legends: Legend[] = [
    { color: 'success.main', label: 'Out Patient' },
    { color: 'error.main', label: 'In Patient' },
    { color: 'warning.main', label: 'Visited Patient' },
    { color: 'primary.main', label: 'Seen Patient' },
    { color: 'orange', label: 'Breaks' },
    { color: 'rgba(0, 0, 0, 0.1)', label: 'Non Working Hour' },
    { color: 'secondary.main', label: 'Non Registered Patients' },
    { color: 'rgba(255, 0, 0, 0.1)', label: 'Elapsed Slots' },
    { color: 'rgba(0, 255, 0, 0.1)', label: 'Working Hour' },
];

interface LegendChipProps {
    color: string;
    label: string;
}

const LegendChip: React.FC<LegendChipProps> = React.memo(({ color, label }) => {
    const theme = useTheme();
    return (
        <Chip
            icon={
                <Box
                    sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: color,
                        mr: -0.5,
                    }}
                />
            }
            label={
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                    {label}
                </Typography>
            }
            sx={{
                border: `1px solid ${theme.palette.divider}`,
                '& .MuiChip-icon': { color: 'transparent' },
            }}
        />
    );
});

const SchedulerFooter: React.FC = React.memo(() => {
    const theme = useTheme();
    const memoizedLegends = useMemo(() =>
        legends.map((legend, index) => (
            <LegendChip key={index} color={legend.color} label={legend.label} />
        )),
        []);

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
            {memoizedLegends}
        </Box>
    );
});

export default SchedulerFooter;