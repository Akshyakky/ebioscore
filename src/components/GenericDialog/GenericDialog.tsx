import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Typography,
    Box,
    SxProps,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Theme } from "@mui/material/styles";
import { styled } from '@mui/system';

interface GenericDialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
    fullWidth?: boolean;
    showCloseButton?: boolean;
    actions?: React.ReactNode;
    disableEscapeKeyDown?: boolean;
    disableBackdropClick?: boolean;
    dialogContentSx?: SxProps<Theme>;
    titleSx?: SxProps<Theme>;
    actionsSx?: SxProps<Theme>;
    closeButtonSx?: SxProps<Theme>;
    fullScreen?: boolean;
    titleVariant?: 'h4' | 'h5' | 'h6';
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.palette.background.paper,
    },
    zIndex: 1300,
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    padding: theme.spacing(1, 3),
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.mode === 'dark'
        ? theme.palette.background.paper
        : theme.palette.primary.main, // Blue color in light mode
    color: theme.palette.mode === 'dark'
        ? theme.palette.text.primary
        : theme.palette.primary.contrastText, // Contrasting text color for light mode
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
    padding: theme.spacing(1, 3),
    overflowX: 'hidden',
    backgroundColor: theme.palette.background.paper,
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
    padding: theme.spacing(1, 3),
    borderTop: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
}));

const GenericDialog: React.FC<GenericDialogProps> = ({
    open,
    onClose,
    title,
    children,
    maxWidth = 'sm',
    fullWidth = true,
    showCloseButton = true,
    actions,
    disableEscapeKeyDown = false,
    disableBackdropClick = false,
    dialogContentSx,
    titleSx,
    actionsSx,
    closeButtonSx,
    fullScreen,
    titleVariant = 'h6',
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleClose = (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => {
        if (disableBackdropClick && reason === 'backdropClick') {
            return;
        }
        onClose();
    };

    return (
        <StyledDialog
            open={open}
            onClose={handleClose}
            maxWidth={maxWidth}
            fullWidth={fullWidth}
            disableEscapeKeyDown={disableEscapeKeyDown}
            aria-labelledby="dialog-title"
            fullScreen={fullScreen || isMobile}
        >
            <StyledDialogTitle sx={titleSx}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant={titleVariant} component="h2" id="dialog-title"
                        color={theme.palette.mode === 'dark' ? 'text.primary' : 'inherit'}>
                        {title}
                    </Typography>
                    {showCloseButton && (
                        <IconButton
                            edge="end"
                            onClick={onClose}
                            aria-label="close dialog"
                            sx={{
                                color: theme.palette.mode === 'dark'
                                    ? theme.palette.text.secondary
                                    : theme.palette.primary.contrastText,
                                '&:hover': {
                                    color: theme.palette.mode === 'dark'
                                        ? theme.palette.text.primary
                                        : theme.palette.primary.light,
                                },
                                ...closeButtonSx
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    )}
                </Box>
            </StyledDialogTitle>
            <StyledDialogContent
                dividers
                sx={{
                    ...dialogContentSx,
                    overflowY: 'auto',
                    maxHeight: isMobile ? 'calc(100vh - 56px)' : '70vh',
                }}
            >
                {children}
            </StyledDialogContent>
            {actions && (
                <StyledDialogActions sx={actionsSx}>
                    {Array.isArray(actions) ? actions : [actions]}
                </StyledDialogActions>
            )}
        </StyledDialog>
    );
};

export default GenericDialog;