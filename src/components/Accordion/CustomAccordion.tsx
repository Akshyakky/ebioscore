import React from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    styled,
    Theme,
    alpha,
    useTheme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}`,
    borderRadius: '8px',
    '&:before': {
        display: 'none',
    },
    '&.Mui-expanded': {
        margin: theme.spacing(1, 0),
    },
    transition: theme.transitions.create(['box-shadow', 'margin'], {
        duration: theme.transitions.duration.short,
    }),
    '&:hover': {
        boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.12)}`,
    },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.1)})`,
    color: theme.palette.primary.main,
    minHeight: '42px !important',
    height: '42px',
    borderRadius: '8px 8px 0 0',
    '& .MuiAccordionSummary-content': {
        margin: '12px 0',
    },
    '&.Mui-expanded': {
        minHeight: '48px',
    },
    '&:hover': {
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.15)})`,
    },
    transition: theme.transitions.create('background', {
        duration: theme.transitions.duration.shortest,
    }),
}));

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
    padding: theme.spacing(2),
    borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    borderRadius: '0 0 8px 8px',
}));

const AccordionTitle = styled(Typography)(({ theme }) => ({
    fontSize: '1rem',
    fontWeight: 600,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    color: theme.palette.primary.main,
}));

const ExpandIcon = styled(ExpandMoreIcon)(({ theme }) => ({
    color: theme.palette.primary.main,
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
    '.Mui-expanded &': {
        transform: 'rotate(180deg)',
    },
}));

interface CustomAccordionProps {
    title: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
}

const CustomAccordion: React.FC<CustomAccordionProps> = ({ title, children, defaultExpanded = false }) => {
    const theme = useTheme();

    return (
        <StyledAccordion defaultExpanded={defaultExpanded}>
            <StyledAccordionSummary
                expandIcon={<ExpandIcon />}
                aria-controls={`${title}-content`}
                id={`${title}-header`}
            >
                <AccordionTitle>{title}</AccordionTitle>
            </StyledAccordionSummary>
            <StyledAccordionDetails>
                {children}
            </StyledAccordionDetails>
        </StyledAccordion>
    );
};

export default CustomAccordion;