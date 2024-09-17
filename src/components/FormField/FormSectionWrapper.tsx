import React from 'react';
import { Grid, Typography, Box, styled } from '@mui/material';

const StyledGrid = styled(Grid)(({ theme }) => ({
    '& > .MuiGrid-item': {
        paddingTop: theme.spacing(0),
        paddingBottom: theme.spacing(0),
    },
}));

interface FormSectionWrapperProps {
    title: string;
    children: React.ReactNode;
    spacing?: number;
    actionButton?: React.ReactNode;
}

const FormSectionWrapper: React.FC<FormSectionWrapperProps> = ({ title, children, spacing = 1, actionButton }) => {
    return (
        <Box mb={1}>
            <Typography variant="h6" sx={{ borderBottom: '1px solid #000', mb: 1 }}>
                {title}
            </Typography>
            <StyledGrid container spacing={spacing}>
                {children}
            </StyledGrid>
        </Box>
    );
};

export default FormSectionWrapper;