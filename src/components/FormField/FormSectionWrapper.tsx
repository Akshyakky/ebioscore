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
            <StyledGrid container spacing={spacing}>
                {children}
            </StyledGrid>
        </Box>
    );
};

export default FormSectionWrapper;