import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Link,
} from "@mui/material";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import logo from "../../../assets/images/eBios.png";
import { CompanyService } from "../../../services/CommonServices/CompanyService";
import { ClientParameterService } from "../../../services/CommonServices/ClientParameterService";
import { useNavigate } from "react-router-dom";
import AuthService from "../../../services/AuthService/AuthService";
import axios from "axios";
import { useDispatch } from "react-redux";
import { SET_USER_DETAILS } from "../../../store/userTypes";
import DropdownSelect from "../../../components/DropDown/DropdownSelect";
import FloatingLabelTextBox from "../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import { notifySuccess } from "../../../utils/Common/toastManager";
import { Company } from "../../../types/Common/Company.type";
import "../../../../src/assets/styles/Common.css";

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

  const checkDateValidity = (dateString: string): number => {
    const [day, month, year] = dateString.split("/").map(Number);
    const today = new Date();
    const targetDate = new Date(year, month - 1, day);
    const differenceInTime = targetDate.getTime() - today.getTime();
    return differenceInTime / (1000 * 3600 * 24);
  };

  const checkExpiryDates = async () => {
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
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      if (tokenResponse.token) {
        const jwtToken = JSON.parse(atob(tokenResponse.token.split(".")[1]));
        const tokenExpiryTime = new Date(jwtToken.exp * 1000);
        dispatch({
          type: SET_USER_DETAILS,
          payload: {
            userID: tokenResponse.user.userID,
            token: tokenResponse.token,
            adminYN: tokenResponse.user.adminYN,
            userName: tokenResponse.user.userName,
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
          tokenResponse.user.ErrorMessage || "Invalid credentials"
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          setErrorMessage(
            error.response.data.errorMessage ||
              "An error occurred during login."
          );
        } else {
          setErrorMessage("No response received from the server.");
        }
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unexpected error occurred");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSelectCompany = (CompIDCompCode: string, compName: string) => {
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
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f0f0f0",
      }}
    >
      <Card sx={{ minWidth: 350 }}>
        <CardContent>
          <Box textAlign="center" mb={4} mt={2}>
            <img src={logo} alt="Company Logo" style={{ maxWidth: "150px" }} />
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

            <Box textAlign="right">
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
    </Container>
  );
};

export default LoginPage;
