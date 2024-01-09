import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Alert,
  Card,
  Container,
  Row,
  Col,
  Dropdown,
} from "react-bootstrap";
import logo from "../../../assets/images/eBios.png";
import { CompanyService } from "../../../services/CommonService/CompanyService";
import { Link } from "react-router-dom";
import { ClientParameterService } from "../../../services/CommonService/ClientParameterService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignInAlt, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "../../../../src/assets/styles/Common.css";
import AuthService from "../../../services/AuthService/AuthService";
import axios from "axios";
import { useDispatch } from "react-redux";
import { SET_USER_DETAILS } from "../../../store/userTypes";

type Company = {
  compIDCompCode: string;
  compName: string;
};

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
    debugger;
    // Check if CompIDCompCode is a string and not undefined
    if (typeof CompIDCompCode === "string") {
      const parts = CompIDCompCode.split(",");
      if (parts.length >= 2) {
        setCompanyID(parts[0].toString());
        setCompanyCode(parts[1].toString());
        setSelectedCompanyName(compName);
        if (errorMessage === "Please select a company.") {
          setErrorMessage("");
        }
      } else {
        console.error(
          "CompIDCompCode does not contain a comma: ",
          CompIDCompCode
        );
        // Handle the error case here, such as setting an error message
      }
    } else {
      console.error(
        "CompIDCompCode is undefined or not a string: ",
        CompIDCompCode
      );
      // Handle the error case here, such as setting an error message
    }
  };

  return (
    <Container
      fluid
      className="vh-100 d-flex justify-content-center align-items-center"
      style={{
        background: "linear-gradient(to right, #285E6A, #134450)",
      }}
    >
      <Row className="justify-content-center">
        <Col
          xs={12}
          sm={12}
          md={12}
          lg={12}
          style={{ maxWidth: "400px", minWidth: "400px" }}
        >
          <Card className="shadow-sm p-4 mb-5 bg-white rounded">
            <div className="text-center">
              {" "}
              {/* This div will center its contents horizontally */}
              <img
                src={logo}
                alt="Company Logo"
                className="img-fluid" // responsive image size
                style={{ maxWidth: "150px" }} // limit the size of the logo
              />
            </div>
            <Card.Body>
              {/* <h1 className="h3 mb-3 font-weight-normal">e-Bios</h1> */}
              {/* <h2 className="h5 mb-3 font-weight-normal">
                Hospital Information System
              </h2> */}
              {amcExpiryMessage && (
                <Alert variant="warning" className="text-break">
                  {amcExpiryMessage}
                </Alert>
              )}
              {licenseExpiryMessage && (
                <Alert
                  variant={licenseDaysRemaining <= 0 ? "danger" : "warning"}
                  className="text-break"
                >
                  {licenseExpiryMessage}
                </Alert>
              )}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Dropdown>
                    <Dropdown.Toggle
                      variant="outline-secondary"
                      id="dropdown-company"
                      className="w-100 DrpDown"
                    >
                      {selectedCompanyName}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="w-100">
                      {companies.map((c) => (
                        <Dropdown.Item
                          key={c.compIDCompCode}
                          onClick={() =>
                            handleSelectCompany(c.compIDCompCode, c.compName)
                          }
                        >
                          {c.compName}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </Form.Group>

                <Form.Floating className="mb-3">
                  <Form.Control
                    id="floatingInputCustom"
                    type="text"
                    placeholder="Username"
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <label htmlFor="floatingInputCustom">Enter Username</label>
                </Form.Floating>

                <Form.Floating className="mb-2">
                  <Form.Control
                    type="password"
                    placeholder="Enter Password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <label htmlFor="floatingPasswordCustom">Enter Password</label>
                </Form.Floating>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Form.Text className="text-muted">
                    Forgot your password?
                  </Form.Text>
                  <Link
                    to="/ForgotPasswordPage"
                    className="text-decoration-none"
                  >
                    Reset it
                  </Link>
                </div>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 btn btn-lg btn-primary"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      {" Signing In..."}
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSignInAlt} />
                      {" Sign In"}
                    </>
                  )}
                </Button>

                {errorMessage && (
                  <Alert variant="danger" className="mt-3 text-break">
                    {errorMessage}
                  </Alert>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
