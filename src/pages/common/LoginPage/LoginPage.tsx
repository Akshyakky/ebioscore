import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Container,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Link,
  Typography,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import logo from "../../../assets/images/eBios.png";
import { CompanyService } from "../../../services/CommonServices/CompanyService";
import { ClientParameterService } from "../../../services/CommonServices/ClientParameterService";
import { useNavigate } from "react-router-dom";
import AuthService from "../../../services/AuthService/AuthService";
import { useDispatch } from "react-redux";
import { SET_USER_DETAILS } from "../../../store/userTypes";
import DropdownSelect from "../../../components/DropDown/DropdownSelect";
import FloatingLabelTextBox from "../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import { notifySuccess } from "../../../utils/Common/toastManager";
import { Company } from "../../../types/Common/Company.type";
import "../../../../src/assets/styles/Common.css";
import backgroundImage from "/src/assets/images/LoginCoverImage.jpg";

const LoginPage: React.FC = () => {
  const [UserName, setUsername] = useState("");
  const [Password, setPassword] = useState("");
  const [companyID, setCompanyID] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [amcExpiryMessage, setAmcExpiryMessage] = useState("");
  const [licenseExpiryMessage, setLicenseExpiryMessage] = useState("");
  const [licenseDaysRemaining, setLicenseDaysRemaining] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const selectedCompanyName = useMemo(() => {
    const selectedCompany = companies.find(
      (c) => c.compIDCompCode === `${companyID},${companyCode}`
    );
    return selectedCompany?.compName || "Select Company";
  }, [companyID, companyCode, companies]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companyData = await CompanyService.getCompanies();
        setCompanies(companyData);
        if (companyData.length === 1) {
          handleSelectCompany(
            companyData[0].compIDCompCode,
            companyData[0].compName
          );
        }
      } catch (error) {
        console.error("Fetching companies failed: ", error);
        setErrorMessage("Failed to load companies.");
      }
    };

    fetchCompanies();
    checkExpiryDates();
  }, []);

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
      const licenseDaysRemaining = checkDateValidity(
        licenseDetails[0].clParValue
      );
      setLicenseDaysRemaining(licenseDaysRemaining);

      if (amcDaysRemaining <= 30) {
        setAmcExpiryMessage(
          `Your AMC support will expire in ${Math.ceil(
            amcDaysRemaining
          )} day(s)`
        );
      }
      if (licenseDaysRemaining < 0) {
        setLicenseExpiryMessage("Cannot log in. Your License has expired");
      } else if (licenseDaysRemaining <= 30) {
        setLicenseExpiryMessage(
          `Your License will expire in ${Math.ceil(
            licenseDaysRemaining
          )} day(s)`
        );
      }
    } catch (error) {
      console.error("Failed to fetch client parameters:", error);
    }
  }, [checkDateValidity]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (licenseExpiryMessage === "Cannot log in. Your License has expired") {
      setErrorMessage(licenseExpiryMessage);
      return;
    }
    if (!companyID) {
      setErrorMessage("Please select a company.");
      return;
    }
    if (!UserName) {
      setErrorMessage("Username is required.");
      return;
    }
    if (!Password) {
      setErrorMessage("Password is required.");
      return;
    }

    setIsLoggingIn(true);
    try {
      const tokenResponse = await AuthService.generateToken({
        UserName,
        Password,
      });
      if (tokenResponse.data?.token) {
        const jwtToken = JSON.parse(atob(tokenResponse.data.token.split(".")[1]));
        const tokenExpiryTime = new Date(jwtToken.exp * 1000);
        dispatch({
          type: SET_USER_DETAILS,
          payload: {
            userID: tokenResponse.data.user.userID,
            token: tokenResponse.data.token,
            adminYN: tokenResponse.data.user.adminYN,
            userName: tokenResponse.data.user.userName,
            compID: parseInt(companyID),
            compCode: companyCode,
            compName: selectedCompanyName,
            tokenExpiry: tokenExpiryTime,
          },
        });
        notifySuccess("Login successful!");
        navigate("/dashboard");
      } else {
        setErrorMessage(
          tokenResponse.data?.user.ErrorMessage || "Invalid credentials"
        );
      }
    } catch (error) {
      setIsLoggingIn(false);
    } finally {
      setIsLoggingIn(false);
    }
  }, [UserName, Password, companyID, companyCode, licenseExpiryMessage, selectedCompanyName, dispatch, navigate]);

  const handleSelectCompany = useCallback((CompIDCompCode: string, compName: string) => {
    const [compID, compCode] = CompIDCompCode.split(",");
    if (compID && compCode) {
      setCompanyID(compID);
      setCompanyCode(compCode);
      setErrorMessage("");
    } else {
      setCompanyID("0");
      setCompanyCode("");
      setErrorMessage("Please select a company");
    }
  }, []);

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Container maxWidth={false} disableGutters sx={{ height: '100vh', display: 'flex' }}>
      <Grid container sx={{ height: '100%' }}>
        <Grid item xs={12} md={matches ? 12 : 8.4} sx={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          clipPath: matches ? 'none' : 'polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%)',
          position: "relative",
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.20)',
            clipPath: matches ? 'none' : 'inherit',
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 100%)"
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '20%',
            height: '40%',
            backgroundColor: 'rgba(255, 255, 255, 0.20)',
            borderRadius: '50%',
          },
        }}>
        </Grid>

        <Grid item xs={12} md={matches ? 12 : 3.6} sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}>
          <Card sx={{
            minWidth: 350,
            maxWidth: 400,
            boxShadow: 6,
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '2rem',
          }}>
            <CardContent>
              <Box textAlign="center" mb={4} mt={2}>
                <img src={logo} alt="Company Logo" style={{ maxWidth: "150px" }} />
                <Typography variant="h5" component="h1" sx={{ mt: 2, mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
                  Welcome to e-Bios
                </Typography>
              </Box>

              {amcExpiryMessage && (
                <Alert severity="warning">{amcExpiryMessage}</Alert>
              )}
              {licenseExpiryMessage && (
                <Alert severity={licenseDaysRemaining <= 0 ? "error" : "warning"}>
                  {licenseExpiryMessage}
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
                    companyID && companyCode ? `${companyID},${companyCode}` : ""
                  }
                  options={companies.map((c) => ({
                    value: c.compIDCompCode,
                    label: c.compName,
                  }))}
                  onChange={(event) => {
                    const compIDCompCode = event.target.value as string;
                    const selectedCompany = companies.find(
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
                  value={UserName}
                  onChange={(e) => setUsername(e.target.value)}
                  size="small"
                  isMandatory
                />

                <FloatingLabelTextBox
                  ControlID="password"
                  title="Password"
                  type="password"
                  value={Password}
                  onChange={(e) => setPassword(e.target.value)}
                  size="small"
                  isMandatory
                />

                <Box textAlign="right" sx={{ mb: 2 }}>
                  <Link href="/ForgotPasswordPage" variant="body2">
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
                  disabled={isLoggingIn}
                  startIcon={
                    isLoggingIn ? <CircularProgress size={20} /> : <LockOpenIcon />
                  }
                >
                  {isLoggingIn ? "Signing In..." : "Sign In"}
                </Button>

                {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LoginPage;
