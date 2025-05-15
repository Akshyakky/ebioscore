import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Container, Typography, Box, Paper, styled } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HomeIcon from "@mui/icons-material/Home";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAppSelector } from "@/store/hooks";
import { RootState } from "@/store"; // Adjust the path based on your project structure

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  borderRadius: "16px",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
}));

const ErrorIcon = styled(ErrorOutlineIcon)(({ theme }) => ({
  fontSize: "64px",
  color: theme.palette.error.main,
  marginBottom: theme.spacing(2),
}));

interface RouteNotFoundBoundaryProps {
  children: React.ReactNode;
}

const RouteNotFoundBoundary: React.FC<RouteNotFoundBoundaryProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state: RootState) => !!state.auth.token);

  // Check if the current path exists in the available routes
  const isKnownRoute = React.useMemo(() => {
    // This is a simplified check - in a real app, you might want to check against your actual routes
    const knownRoutes = [
      "/login",
      "/dashboard",
      "/registrationpage",
      "/revisitpage",
      "/routinereportspa",
      "/listofreportspage",
      "/contactlistpage",
      "/userlistpage",
      "/profilelistpage",
      "/admissionpage",
      "/ResourceListPage",
      "/ReasonListPage",
      "/BreakListPage",
      "/Appointmentpage",
      "/PatientInvoiceCodePage",
      "/DepartmentListPage",
      "/ServiceGroupsListPage",
      "/PaymentTypesPage",
      "/AlertPage",
      "/WardCategoryPage",
      "/BedSetUpPage",
      "/DeptUnitListPage",
      "/InsuranceListPage",
      "/ProductListPage",
      "/ProductTaxListPage",
      "/ProductOverviewPage",
      "/ManageBedPage",
      "/DiagnosisListPage",
      "/MedicationListPage",
      "/MedicationFormPage",
      "/AppModifiedListPage",
      "/ChargeDetailsPage",
      "/DischargePage",
      "/WardBedTransferPage",
      "/MedicationFrequencyPage",
      "/MedicationDosagePage",
      "/ProcedureListPage",
      "/MedicationGenericPage",
      "/InvestigationListPage",
      "/ComponentEntryTypePage",
      "/PurchaseOrderPage",
      "/ForgotPasswordPage",
      "/EmployeeRegistrationForm",
      "/IndentProductPage",
      "/LogModulePage",
      "/GRNPage",
      "/ProductTransaction",
      "/",
    ];

    return knownRoutes.some((route) => route.toLowerCase() === location.pathname.toLowerCase());
  }, [location.pathname]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate(isAuthenticated ? "/dashboard" : "/login");
  };

  if (!isKnownRoute) {
    return (
      <Container maxWidth="md">
        <StyledPaper elevation={3}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <ErrorIcon />
            <Typography variant="h4" component="h1" color="error" gutterBottom>
              Page Not Found
            </Typography>
            <Typography variant="body1" paragraph>
              The page <strong>{location.pathname}</strong> does not exist or has been moved.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please check the URL or navigate back to a known location.
            </Typography>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleGoBack}>
                Go Back
              </Button>
              <Button variant="contained" startIcon={<HomeIcon />} onClick={handleGoHome} color="primary">
                {isAuthenticated ? "Go to Dashboard" : "Go to Login"}
              </Button>
            </Box>
          </Box>
        </StyledPaper>
      </Container>
    );
  }

  return <>{children}</>;
};

export default RouteNotFoundBoundary;
