import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Link,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import logo from "../../../assets/images/eBios.png";
import { CompanyService } from "../../../services/CommonService/CompanyService";
import { ClientParameterService } from "../../../services/CommonService/ClientParameterService";
import { useNavigate } from "react-router-dom";
import "../../../../src/assets/styles/Common.css";
import AuthService from "../../../services/AuthService/AuthService";
import axios from "axios";
import { useDispatch } from "react-redux";
import { SET_USER_DETAILS } from "../../../store/userTypes";
import DropdownSelect from "../../../components/DropDown/DropdownSelect";
import FloatingLabelTextBox from "../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import { notifySuccess } from "../../../utils/Common/toastManager";
import { Company } from "../../../types/Common/Company.type";

const LoginPage = () => {
  const [UserName, setUsername] = useState("");
  const [Password, setPassword] = useState("");
  const [companyID, setCompanyID] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [selectedCompanyName, setSelectedCompanyName] =
    useState("Select Company");

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companyData = await CompanyService.getCompanies();
        setCompanies(companyData);
        if (companyData.length === 1) {
          // Automatically select the only company
          const singleCompany = companyData[0];
          const compIDCompCode = singleCompany.compIDCompCode;
          const parts = compIDCompCode.split(",");
          if (parts.length >= 2) {
            setCompanyID(parts[0]);
            setCompanyCode(parts[1]);
            setSelectedCompanyName(singleCompany.compName);
            setErrorMessage("");
          }
        }
      } catch (error) {
        console.error("Fetching companies failed: ", error);
        setErrorMessage("Failed to load companies.");
      }
    };

    fetchCompanies();
  }, []);

  const [amcExpiryMessage, setAmcExpiryMessage] = useState("");
  const [licenseExpiryMessage, setLicenseExpiryMessage] = useState("");
  const [licenseDaysRemaining, setLicenseDaysRemaining] = useState(0);

  const checkDateValidity = (dateString: string) => {
    // Split the string into parts
    const parts = dateString.split("/");
    // Assuming the format is DD/MM/YYYY, construct a new Date object
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JavaScript Date
    const year = parseInt(parts[2], 10);

    const today = new Date();
    const targetDate = new Date(year, month, day);
    const differenceInTime = targetDate.getTime() - today.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);

    return differenceInDays;
  };

  const checkExpiryDates = async () => {
    try {
      const amcDetails = await ClientParameterService.getClientParameter(
        "AMCSUP"
      );
      const licenseDetails = await ClientParameterService.getClientParameter(
        "CINLIC"
      );

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
        // Optionally, you can also handle the logic here to prevent login
        // e.g., disable the login form, redirect to a different page, etc.
      } else if (licenseDaysRemaining <= 30) {
        setLicenseExpiryMessage(
          `Your License will expire in ${Math.ceil(
            licenseDaysRemaining
          )} day(s)`
        );
      }
    } catch (error) {
      console.error("Failed to fetch client parameters:", error);
      // Handle error messages as well
    }
  };

  useEffect(() => {
    checkExpiryDates();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (licenseExpiryMessage === "Cannot log in. Your License has expired") {
      setErrorMessage(licenseExpiryMessage);
      return;
    }

    if (!companyID || companyID === "") {
      setErrorMessage("Please select a company.");
      return; // Exit the function if no company is selected
    }

    if (!UserName) {
      setErrorMessage("Username is required.");
      return; // Exit the function if the username is not filled out
   }
   if (!Password) {
      setErrorMessage("Password is required.");
      return; // Exit the function if the password is not filled out
   }
   
    // Start the login process
    setIsLoggingIn(true);
    try {
      const tokenResponse = await AuthService.generateToken({
        UserName: UserName,
        Password: Password,
      });
      if (tokenResponse.token) {
        const jwtToken = JSON.parse(atob(tokenResponse.token.split(".")[1]));
        const tokenExpiryTime = new Date(jwtToken.exp * 1000);
        dispatch({
          type: SET_USER_DETAILS,
          payload: {
            userID: tokenResponse.user.userID, // should be number | null
            token: tokenResponse.token,
            adminYN: tokenResponse.user.adminYN, // should be string | null
            userName: tokenResponse.user.userName,
            compID: parseInt(companyID),
            compCode: companyCode,
            compName: selectedCompanyName,
            tokenExpiry: tokenExpiryTime,
          },
        });
        console.log(
          "Token:",
          tokenResponse.token,
          tokenResponse.user.userName,
          tokenResponse.user.userID,
          tokenResponse.user.conID,
          tokenResponse.user.adminYN,
          tokenResponse.user.physicianYN,
          parseInt(companyID),
          companyCode,
          selectedCompanyName
        );
        notifySuccess("Login successful!");
        navigate("/dashboard");
        // Save the token in local storage or context, handle user redirection, etc.
        // localStorage.setItem('token', tokenResponse.token);
        // Redirect to another page or update state as needed
      } else {
        // Handle failed login attempt
        setErrorMessage(
          tokenResponse.user.ErrorMessage || "Invalid credentials"
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // We can now safely access error.response because we know it's an AxiosError
        if (error.response) {
          // If the request was made and the server responded with a status code
          // that falls out of the range of 2xx, the error message is available here
          setErrorMessage(
            error.response.data.errorMessage ||
              "An error occurred during login."
          );
        } else {
          // The request was made but no response was received, `error.request` is an instance of XMLHttpRequest
          setErrorMessage("No response received from the server.");
        }
      } else if (error instanceof Error) {
        // If it's a different type of error
        setErrorMessage(error.message);
      } else {
        // If the error is not an Error object or an AxiosError
        setErrorMessage("An unexpected error occurred");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSelectCompany = (CompIDCompCode: string, compName: string) => {
    const parts = CompIDCompCode.split(",");
    if (parts.length >= 2) {
      setCompanyID(parts[0]);
      setCompanyCode(parts[1]);
      setSelectedCompanyName(compName);
      // If there was an error message about company selection, clear it
      if (errorMessage.includes("Please select a company.")) {
        setErrorMessage("");
      }
    } else {
      setCompanyID("0");
      setCompanyCode("");
      setSelectedCompanyName("");
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
              isMandatory={true}
            />

            <FloatingLabelTextBox
              ControlID="password"
              title="Password"
              type="password"
              value={Password}
              onChange={(e) => setPassword(e.target.value)}
              size="small"
              isMandatory={true}
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
