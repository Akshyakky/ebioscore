import React, { useReducer, useEffect, useMemo, useCallback } from "react";
import {
  Container, Box, Card, CardContent, Button, Alert, CircularProgress, Link, Typography, Grid, useMediaQuery, alpha
} from "@mui/material";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { SET_USER_DETAILS } from "../../../store/userTypes";
import DropdownSelect from "../../../components/DropDown/DropdownSelect";
import FloatingLabelTextBox from "../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import { notifySuccess } from "../../../utils/Common/toastManager";
import { Company } from "../../../types/Common/Company.type";
import { CompanyService } from "../../../services/CommonServices/CompanyService";
import { ClientParameterService } from "../../../services/CommonServices/ClientParameterService";
import AuthService from "../../../services/AuthService/AuthService";
import { useTheme } from "../../../context/Common/ThemeContext";

// Import images
import logo from "../../../assets/images/eBios.png";
import backgroundImage from "/src/assets/images/LoginCoverImage.jpg";

// Define action types
type Action =
  | { type: 'SET_USERNAME'; payload: string }
  | { type: 'SET_PASSWORD'; payload: string }
  | { type: 'SET_COMPANY_ID'; payload: string }
  | { type: 'SET_COMPANY_CODE'; payload: string }
  | { type: 'SET_COMPANIES'; payload: Company[] }
  | { type: 'SET_ERROR_MESSAGE'; payload: string }
  | { type: 'SET_IS_LOGGING_IN'; payload: boolean }
  | { type: 'SET_AMC_EXPIRY_MESSAGE'; payload: string }
  | { type: 'SET_LICENSE_EXPIRY_MESSAGE'; payload: string }
  | { type: 'SET_LICENSE_DAYS_REMAINING'; payload: number };

// Define state type
type State = {
  userName: string;
  password: string;
  companyID: string;
  companyCode: string;
  companies: Company[];
  errorMessage: string;
  isLoggingIn: boolean;
  amcExpiryMessage: string;
  licenseExpiryMessage: string;
  licenseDaysRemaining: number;
};

// Initial state
const initialState: State = {
  userName: "",
  password: "",
  companyID: "",
  companyCode: "",
  companies: [],
  errorMessage: "",
  isLoggingIn: false,
  amcExpiryMessage: "",
  licenseExpiryMessage: "",
  licenseDaysRemaining: 0,
};

// Reducer function
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_USERNAME':
      return { ...state, userName: action.payload };
    case 'SET_PASSWORD':
      return { ...state, password: action.payload };
    case 'SET_COMPANY_ID':
      return { ...state, companyID: action.payload };
    case 'SET_COMPANY_CODE':
      return { ...state, companyCode: action.payload };
    case 'SET_COMPANIES':
      return { ...state, companies: action.payload };
    case 'SET_ERROR_MESSAGE':
      return { ...state, errorMessage: action.payload };
    case 'SET_IS_LOGGING_IN':
      return { ...state, isLoggingIn: action.payload };
    case 'SET_AMC_EXPIRY_MESSAGE':
      return { ...state, amcExpiryMessage: action.payload };
    case 'SET_LICENSE_EXPIRY_MESSAGE':
      return { ...state, licenseExpiryMessage: action.payload };
    case 'SET_LICENSE_DAYS_REMAINING':
      return { ...state, licenseDaysRemaining: action.payload };
    default:
      return state;
  }
}

const LoginPage: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();
  const reduxDispatch = useDispatch();
  const { theme, isDarkMode } = useTheme();

  // Responsive breakpoints
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const selectedCompanyName = useMemo(() => {
    const selectedCompany = state.companies.find(
      (c) => c.compIDCompCode === `${state.companyID},${state.companyCode}`
    );
    return selectedCompany?.compName || "Select Company";
  }, [state.companyID, state.companyCode, state.companies]);

  const checkDateValidity = useCallback((dateString: string): number => {
    const [day, month, year] = dateString.split("/").map(Number);
    const today = new Date();
    const targetDate = new Date(year, month - 1, day);
    const differenceInTime = targetDate.getTime() - today.getTime();
    return differenceInTime / (1000 * 3600 * 24);
  }, []);

  const checkExpiryDates = useCallback(async () => {
    try {
      const [amcDetails, licenseDetails] = await Promise.all([
        ClientParameterService.getClientParameter("AMCSUP"),
        ClientParameterService.getClientParameter("CINLIC"),
      ]);

      const amcDaysRemaining = checkDateValidity(amcDetails[0].clParValue);
      const licenseDaysRemaining = checkDateValidity(licenseDetails[0].clParValue);

      dispatch({ type: 'SET_LICENSE_DAYS_REMAINING', payload: licenseDaysRemaining });

      if (amcDaysRemaining <= 30) {
        dispatch({ type: 'SET_AMC_EXPIRY_MESSAGE', payload: `Your AMC support will expire in ${Math.ceil(amcDaysRemaining)} day(s)` });
      }
      if (licenseDaysRemaining < 0) {
        dispatch({ type: 'SET_LICENSE_EXPIRY_MESSAGE', payload: "Cannot log in. Your License has expired" });
      } else if (licenseDaysRemaining <= 30) {
        dispatch({ type: 'SET_LICENSE_EXPIRY_MESSAGE', payload: `Your License will expire in ${Math.ceil(licenseDaysRemaining)} day(s)` });
      }
    } catch (error) {
      console.error("Failed to fetch client parameters:", error);
    }
  }, [checkDateValidity]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companyData = await CompanyService.getCompanies();
        dispatch({ type: 'SET_COMPANIES', payload: companyData });
        if (companyData.length === 1) {
          handleSelectCompany(
            companyData[0].compIDCompCode,
            companyData[0].compName
          );
        }
      } catch (error) {
        console.error("Fetching companies failed: ", error);
        dispatch({ type: 'SET_ERROR_MESSAGE', payload: "Failed to load companies." });
      }
    };

    fetchCompanies();
    checkExpiryDates();
  }, [checkExpiryDates]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state.licenseExpiryMessage === "Cannot log in. Your License has expired") {
      dispatch({ type: 'SET_ERROR_MESSAGE', payload: state.licenseExpiryMessage });
      return;
    }
    if (!state.companyID) {
      dispatch({ type: 'SET_ERROR_MESSAGE', payload: "Please select a company." });
      return;
    }
    if (!state.userName) {
      dispatch({ type: 'SET_ERROR_MESSAGE', payload: "Username is required." });
      return;
    }
    if (!state.password) {
      dispatch({ type: 'SET_ERROR_MESSAGE', payload: "Password is required." });
      return;
    }

    dispatch({ type: 'SET_IS_LOGGING_IN', payload: true });
    try {
      const tokenResponse = await AuthService.generateToken({
        UserName: state.userName,
        Password: state.password,
      });
      if (tokenResponse.data?.token) {
        const jwtToken = JSON.parse(atob(tokenResponse.data.token.split(".")[1]));
        const tokenExpiryTime = new Date(jwtToken.exp * 1000);
        reduxDispatch({
          type: SET_USER_DETAILS,
          payload: {
            userID: tokenResponse.data.user.userID,
            token: tokenResponse.data.token,
            adminYN: tokenResponse.data.user.adminYN,
            userName: tokenResponse.data.user.userName,
            compID: parseInt(state.companyID),
            compCode: state.companyCode,
            compName: selectedCompanyName,
            tokenExpiry: tokenExpiryTime,
          },
        });
        notifySuccess("Login successful!");
        navigate("/dashboard");
      } else {
        dispatch({ type: 'SET_ERROR_MESSAGE', payload: tokenResponse.data?.user.ErrorMessage || "Invalid credentials" });
      }
    } catch (error) {
      console.error("Login failed:", error);
      dispatch({ type: 'SET_ERROR_MESSAGE', payload: "An error occurred during login. Please try again." });
    } finally {
      dispatch({ type: 'SET_IS_LOGGING_IN', payload: false });
    }
  }, [state.userName, state.password, state.companyID, state.companyCode, state.licenseExpiryMessage, selectedCompanyName, reduxDispatch, navigate]);

  const handleSelectCompany = useCallback((CompIDCompCode: string, compName: string) => {
    const [compID, compCode] = CompIDCompCode.split(",");
    if (compID && compCode) {
      dispatch({ type: 'SET_COMPANY_ID', payload: compID });
      dispatch({ type: 'SET_COMPANY_CODE', payload: compCode });
      dispatch({ type: 'SET_ERROR_MESSAGE', payload: "" });
    } else {
      dispatch({ type: 'SET_COMPANY_ID', payload: "0" });
      dispatch({ type: 'SET_COMPANY_CODE', payload: "" });
      dispatch({ type: 'SET_ERROR_MESSAGE', payload: "Please select a company" });
    }
  }, []);

  // Responsive styles
  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    padding: isSmallScreen ? '10px' : isMediumScreen ? '20px' : '0',
    backgroundColor: theme.palette.background.default,
  };

  const backgroundStyle = {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    clipPath: isSmallScreen ? 'none' : 'polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%)',
    position: "relative" as const,
    minHeight: isSmallScreen ? '30vh' : 'auto',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: isSmallScreen
        ? alpha(theme.palette.background.paper, 0.5)
        : alpha(theme.palette.background.paper, 0.2),
      clipPath: isSmallScreen ? 'none' : 'inherit',
      background: isSmallScreen
        ? 'none'
        : `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0)} 100%)`,
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: '20%',
      height: '40%',
      backgroundColor: alpha(theme.palette.background.paper, 0.2),
      borderRadius: '50%',
      display: isSmallScreen ? 'none' : 'block',
    },
  };

  const formContainerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: isSmallScreen ? "20px 10px" : "20px",
  };

  const cardStyle = {
    width: '100%',
    maxWidth: isSmallScreen ? 'none' : '400px',
    boxShadow: theme.shadows[6],
    borderRadius: 3,
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
    padding: isSmallScreen ? '1rem' : '2rem',
  };

  return (
    <Container maxWidth={false} disableGutters sx={containerStyle}>
      <Grid container sx={{ minHeight: '100%' }}>
        <Grid item xs={12} md={8} sx={backgroundStyle} />
        <Grid item xs={12} md={4} sx={formContainerStyle}>
          <Card sx={cardStyle}>
            <CardContent>
              <Box textAlign="center" mb={3} mt={1}>
                <img src={logo} alt="Company Logo" style={{ maxWidth: "120px" }} />
                <Typography variant={isSmallScreen ? "h6" : "h5"} component="h1" sx={{ mt: 2, mb: 2, fontWeight: 'bold', color: theme.palette.primary.main }}>
                  Welcome to e-Bios
                </Typography>
              </Box>

              {state.amcExpiryMessage && (
                <Alert severity="warning">{state.amcExpiryMessage}</Alert>
              )}
              {state.licenseExpiryMessage && (
                <Alert severity={state.licenseDaysRemaining <= 0 ? "error" : "warning"}>
                  {state.licenseExpiryMessage}
                </Alert>
              )}

              <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{ mt: 1 }}
              >
                <DropdownSelect
                  label="Select Company"
                  name="companyID"
                  value={
                    state.companyID && state.companyCode ? `${state.companyID},${state.companyCode}` : ""
                  }
                  options={state.companies.map((c) => ({
                    value: c.compIDCompCode,
                    label: c.compName,
                  }))}
                  onChange={(event) => {
                    const compIDCompCode = event.target.value as string;
                    const selectedCompany = state.companies.find(
                      (c) => c.compIDCompCode === compIDCompCode
                    );
                    handleSelectCompany(
                      compIDCompCode,
                      selectedCompany?.compName || ""
                    );
                  }}
                  size="small"
                />

                <FloatingLabelTextBox
                  ControlID="username"
                  title="Username"
                  value={state.userName}
                  onChange={(e) => dispatch({ type: 'SET_USERNAME', payload: e.target.value })}
                  size="small"
                  isMandatory
                />

                <FloatingLabelTextBox
                  ControlID="password"
                  title="Password"
                  type="password"
                  value={state.password}
                  onChange={(e) => dispatch({ type: 'SET_PASSWORD', payload: e.target.value })}
                  size="small"
                  isMandatory
                />

                <Box textAlign="right" sx={{ mb: 2 }}>
                  <Link href="/ForgotPasswordPage" variant="body2" color="primary">
                    Forgot password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{
                    mt: 3,
                    mb: 2,
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
                  }}
                  disabled={state.isLoggingIn}
                  startIcon={
                    state.isLoggingIn ? <CircularProgress size={20} /> : <LockOpenIcon />
                  }
                >
                  {state.isLoggingIn ? "Signing In..." : "Sign In"}
                </Button>

                {state.errorMessage && <Alert severity="error">{state.errorMessage}</Alert>}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LoginPage;