// src/pages/common/LoginPage/LoginPage.tsx
import React, { useEffect, useMemo, useCallback } from "react";
import { Container, Box, Card, CardContent, Button, Alert, CircularProgress, Link, Typography, Grid, useMediaQuery, alpha } from "@mui/material";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../store/hooks";
import { setUserDetails } from "../../../store/features/auth/authSlice";
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

interface LoginFormState {
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
}

const initialFormState: LoginFormState = {
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

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [formState, setFormState] = React.useState<LoginFormState>(initialFormState);

  // Responsive breakpoints
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const selectedCompanyName = useMemo(() => {
    const selectedCompany = formState.companies.find((c) => c.compIDCompCode === `${formState.companyID},${formState.companyCode}`);
    return selectedCompany?.compName || "Select Company";
  }, [formState.companyID, formState.companyCode, formState.companies]);

  const checkDateValidity = useCallback((dateString: string): number => {
    const [day, month, year] = dateString.split("/").map(Number);
    const today = new Date();
    const targetDate = new Date(year, month - 1, day);
    const differenceInTime = targetDate.getTime() - today.getTime();
    return differenceInTime / (1000 * 3600 * 24);
  }, []);

  const checkExpiryDates = useCallback(async () => {
    try {
      const [amcDetails, licenseDetails] = await Promise.all([ClientParameterService.getClientParameter("AMCSUP"), ClientParameterService.getClientParameter("CINLIC")]);

      const amcDaysRemaining = checkDateValidity(amcDetails[0].clParValue);
      const licenseDaysRemaining = checkDateValidity(licenseDetails[0].clParValue);

      setFormState((prev) => ({
        ...prev,
        licenseDaysRemaining,
        amcExpiryMessage: amcDaysRemaining <= 30 ? `Your AMC support will expire in ${Math.ceil(amcDaysRemaining)} day(s)` : "",
        licenseExpiryMessage:
          licenseDaysRemaining < 0
            ? "Cannot log in. Your License has expired"
            : licenseDaysRemaining <= 30
              ? `Your License will expire in ${Math.ceil(licenseDaysRemaining)} day(s)`
              : "",
      }));
    } catch (error) {
      console.error("Failed to fetch client parameters:", error);
    }
  }, [checkDateValidity]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companyData = await CompanyService.getCompanies();
        setFormState((prev) => ({ ...prev, companies: companyData }));
        if (companyData.length === 1) {
          handleSelectCompany(companyData[0].compIDCompCode, companyData[0].compName);
        }
      } catch (error) {
        console.error("Fetching companies failed: ", error);
        setFormState((prev) => ({
          ...prev,
          errorMessage: "Failed to load companies.",
        }));
      }
    };

    fetchCompanies();
    checkExpiryDates();
  }, [checkExpiryDates]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (formState.licenseExpiryMessage === "Cannot log in. Your License has expired") {
        setFormState((prev) => ({
          ...prev,
          errorMessage: formState.licenseExpiryMessage,
        }));
        return;
      }

      if (!formState.companyID || !formState.userName || !formState.password) {
        setFormState((prev) => ({
          ...prev,
          errorMessage: !formState.companyID ? "Please select a company." : !formState.userName ? "Username is required." : "Password is required.",
        }));
        return;
      }

      setFormState((prev) => ({ ...prev, isLoggingIn: true, errorMessage: "" }));

      try {
        const tokenResponse = await AuthService.generateToken({
          UserName: formState.userName,
          Password: formState.password,
        });

        if (tokenResponse.data?.token) {
          const jwtToken = JSON.parse(atob(tokenResponse.data.token.split(".")[1]));
          const tokenExpiry = new Date(jwtToken.exp * 1000).getTime();

          dispatch(
            setUserDetails({
              userID: tokenResponse.data.user.userID,
              token: tokenResponse.data.token,
              adminYN: tokenResponse.data.user.adminYN,
              userName: tokenResponse.data.user.userName,
              compID: parseInt(formState.companyID),
              compCode: formState.companyCode,
              compName: selectedCompanyName,
              tokenExpiry,
            })
          );

          notifySuccess("Login successful!");
          navigate("/dashboard");
        } else {
          setFormState((prev) => ({
            ...prev,
            errorMessage: tokenResponse.data?.user.ErrorMessage || "Invalid credentials",
            isLoggingIn: false,
          }));
        }
      } catch (error) {
        console.error("Login failed:", error);
        setFormState((prev) => ({
          ...prev,
          errorMessage: "An error occurred during login. Please try again.",
          isLoggingIn: false,
        }));
      }
    },
    [formState, selectedCompanyName, dispatch, navigate]
  );

  const handleSelectCompany = useCallback((CompIDCompCode: string, compName: string) => {
    const [compID, compCode] = CompIDCompCode.split(",");
    setFormState((prev) => ({
      ...prev,
      companyID: compID || "0",
      companyCode: compCode || "",
      errorMessage: !compID || !compCode ? "Please select a company" : "",
    }));
  }, []);

  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    padding: isSmallScreen ? "10px" : isMediumScreen ? "20px" : "0",
    backgroundColor: theme.palette.background.default,
  };

  const backgroundStyle = {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    clipPath: isSmallScreen ? "none" : "polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%)",
    position: "relative" as const,
    minHeight: isSmallScreen ? "30vh" : "auto",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: isSmallScreen ? alpha(theme.palette.background.paper, 0.5) : alpha(theme.palette.background.paper, 0.2),
      clipPath: isSmallScreen ? "none" : "inherit",
      background: isSmallScreen ? "none" : `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0)} 100%)`,
    },
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: 0,
      right: 0,
      width: "20%",
      height: "40%",
      backgroundColor: alpha(theme.palette.background.paper, 0.2),
      borderRadius: "50%",
      display: isSmallScreen ? "none" : "block",
    },
  };

  const formContainerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: isSmallScreen ? "20px 10px" : "20px",
  };

  const cardStyle = {
    width: "100%",
    maxWidth: isSmallScreen ? "none" : "400px",
    boxShadow: theme.shadows[6],
    borderRadius: 3,
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
    padding: isSmallScreen ? "1rem" : "2rem",
  };

  return (
    <Container maxWidth={false} disableGutters sx={containerStyle}>
      <Grid container sx={{ minHeight: "100%" }}>
        <Grid item xs={12} md={8} sx={backgroundStyle} />
        <Grid item xs={12} md={4} sx={formContainerStyle}>
          <Card sx={cardStyle}>
            <CardContent>
              <Box textAlign="center" mb={3} mt={1}>
                <img src={logo} alt="Company Logo" style={{ maxWidth: "120px" }} />
                <Typography
                  variant={isSmallScreen ? "h6" : "h5"}
                  component="h1"
                  sx={{
                    mt: 2,
                    mb: 2,
                    fontWeight: "bold",
                    color: theme.palette.primary.main,
                  }}
                >
                  Welcome to e-Bios
                </Typography>
              </Box>

              {formState.amcExpiryMessage && <Alert severity="warning">{formState.amcExpiryMessage}</Alert>}
              {formState.licenseExpiryMessage && <Alert severity={formState.licenseDaysRemaining <= 0 ? "error" : "warning"}>{formState.licenseExpiryMessage}</Alert>}

              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                <DropdownSelect
                  label="Select Company"
                  name="companyID"
                  value={formState.companyID && formState.companyCode ? `${formState.companyID},${formState.companyCode}` : ""}
                  options={formState.companies.map((c) => ({
                    value: c.compIDCompCode,
                    label: c.compName,
                  }))}
                  onChange={(event) => {
                    const compIDCompCode = event.target.value as string;
                    const selectedCompany = formState.companies.find((c) => c.compIDCompCode === compIDCompCode);
                    handleSelectCompany(compIDCompCode, selectedCompany?.compName || "");
                  }}
                  size="small"
                />

                <FloatingLabelTextBox
                  ControlID="username"
                  title="Username"
                  value={formState.userName}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      userName: e.target.value,
                    }))
                  }
                  size="small"
                  isMandatory
                />

                <FloatingLabelTextBox
                  ControlID="password"
                  title="Password"
                  type="password"
                  value={formState.password}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
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
                  disabled={formState.isLoggingIn}
                  startIcon={formState.isLoggingIn ? <CircularProgress size={20} /> : <LockOpenIcon />}
                >
                  {formState.isLoggingIn ? "Signing In..." : "Sign In"}
                </Button>

                {formState.errorMessage && <Alert severity="error">{formState.errorMessage}</Alert>}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LoginPage;
