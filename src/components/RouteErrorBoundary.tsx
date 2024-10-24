import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Paper } from '@mui/material';
import { ArrowBack, Refresh } from '@mui/icons-material';

interface RouteErrorBoundaryProps {
    children: React.ReactNode;
    routePath: string;
}

const RouteErrorBoundary: React.FC<RouteErrorBoundaryProps> = ({ children, routePath }) => {
    const navigate = useNavigate();

    const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
        // Log the error with route context
        console.error(`Error in route ${routePath}:`, error);
        console.error('Error Info:', errorInfo);

        // Add your error logging service integration here
        // Example: logErrorToService({ error, errorInfo, routePath });
    };

    return (
        <ErrorBoundary
            onError={handleError}
            fallback={
                <Box
                    sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2
                    }}
                >
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            width: '100%',
                            maxWidth: 600,
                            textAlign: 'center'
                        }}
                    >
                        <Typography variant="h5" color="error" gutterBottom>
                            Error in {routePath.replace('/', '')}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            An error occurred while displaying this page.
                            You can try going back or reloading the page.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button
                                variant="outlined"
                                startIcon={<ArrowBack />}
                                onClick={() => navigate(-1)}
                            >
                                Go Back
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<Refresh />}
                                onClick={() => window.location.reload()}
                            >
                                Reload Page
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            }
        >
            {children}
        </ErrorBoundary>
    );
};

export default RouteErrorBoundary;