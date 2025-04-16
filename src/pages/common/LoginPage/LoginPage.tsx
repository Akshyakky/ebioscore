// src/pages/common/LoginPage/LoginPage.tsx
import { Company } from "@/types/Common/Company.type";
import { useAppDispatch } from "@/store/hooks";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useTheme } from "@/context/Common/ThemeContext";
import { ClientParameterService } from "@/services/CommonServices/ClientParameterService";
import { CompanyService } from "@/services/CommonServices/CompanyService";
import AuthService from "@/services/AuthService/AuthService";
import { setUserDetails } from "@/store/features/auth/authSlice";
import { notifySuccess } from "@/utils/Common/toastManager";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import FloatingLabelTextBox from "@/components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import { Link, Visibility, VisibilityOff } from "@mui/icons-material";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { Alert, alpha, Box, Button, Card, CardContent, CircularProgress, Container, Grid, IconButton, InputAdornment, styled, Typography, useMediaQuery } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import logo from "../../../assets/images/eBios.png";
import backgroundImage from "/src/assets/images/LoginCoverImage.jpg";

// Styled Components

const AnimatedBox = styled(Box)`
  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
    100% {
      transform: translateY(0px);
    }
  }
`;

const StyledContainer = styled(Container)(({ theme }) => ({
  "@keyframes gradientBG": {
    "0%": { backgroundPosition: "0% 50%" },
    "50%": { backgroundPosition: "100% 50%" },
    "100%": { backgroundPosition: "0% 50%" },
  },
  background:
    theme.palette.mode === "light"
      ? "linear-gradient(-45deg, #f0f8ff, #e6f3ff, #f5f5f5, #ffffff)"
      : `linear-gradient(-45deg, ${alpha(theme.palette.background.default, 0.9)}, 
        ${alpha(theme.palette.background.paper, 0.8)})`,
  backgroundSize: "400% 400%",
  animation: "gradientBG 15s ease infinite",
}));

const StyledCard = styled(Card)(({ theme }) => ({
  width: "100%",
  maxWidth: "400px",
  background: theme.palette.mode === "light" ? "rgba(255, 255, 255, 0.95)" : "rgba(24, 26, 32, 0.95)", // Darker background for dark mode
  backdropFilter: "blur(20px)",
  borderRadius: "16px",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
  border: theme.palette.mode === "light" ? "1px solid rgba(255, 255, 255, 0.18)" : "1px solid rgba(255, 255, 255, 0.08)",
  transition: "all 0.3s ease-in-out",
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 12px 40px 0 rgba(31, 38, 135, 0.25)",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "4px",
    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  height: "48px",
  fontSize: "16px",
  fontWeight: 600,
  textTransform: "none",
  borderRadius: "8px",
  backgroundColor: theme.palette.primary.main,
  color: "#ffffff",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
  borderRadius: "10px",
  marginBottom: theme.spacing(2),
  animation: "slideIn 0.3s ease-out",
  "@keyframes slideIn": {
    from: { transform: "translateY(-10px)", opacity: 0 },
    to: { transform: "translateY(0)", opacity: 1 },
  },
}));

const StyledRouterLink = styled(RouterLink)(({ theme }) => ({
  color: theme.palette.primary.main,
  textDecoration: "none",
  fontWeight: 500,
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    width: 0,
    height: "2px",
    bottom: "-2px",
    left: 0,
    background: theme.palette.primary.main,
    transition: "width 0.3s ease",
  },
  "&:hover::after": {
    width: "100%",
  },
}));

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
  const [showPassword, setShowPassword] = useState(false);

  const companySelectRef = useRef<HTMLSelectElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const [loginAttempts, setLoginAttempts] = useState({
    count: 0,
    lastAttempt: null as Date | null,
    isLocked: false,
    lockoutEndTime: null as Date | null,
  });

  const [fieldLoading, setFieldLoading] = useState({
    company: false,
    username: false,
    password: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        const focusableElements = [companySelectRef.current, usernameInputRef.current, passwordInputRef.current, submitButtonRef.current].filter(Boolean);

        // Cast the document.activeElement to HTMLElement
        const activeElement = document.activeElement as HTMLElement | null;

        if (!activeElement) return;

        const currentIndex = focusableElements.findIndex((el) => el instanceof HTMLElement && el.isEqualNode(activeElement));

        if (currentIndex > -1) {
          const nextIndex = e.shiftKey ? (currentIndex - 1 + focusableElements.length) % focusableElements.length : (currentIndex + 1) % focusableElements.length;

          const nextElement = focusableElements[nextIndex];
          if (nextElement instanceof HTMLElement) {
            nextElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const checkRateLimit = useCallback(() => {
    const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes
    const MAX_ATTEMPTS = 3;

    if (loginAttempts.isLocked && loginAttempts.lockoutEndTime) {
      const now = new Date();
      if (now < loginAttempts.lockoutEndTime) {
        const remainingTime = Math.ceil((loginAttempts.lockoutEndTime.getTime() - now.getTime()) / 1000);
        return `Account locked. Try again in ${remainingTime} seconds.`;
      }
      setLoginAttempts((prev) => ({ ...prev, isLocked: false, count: 0 }));
    }
    return null;
  }, [loginAttempts]);

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

      const lockoutMessage = checkRateLimit();
      if (lockoutMessage) {
        setFormState((prev) => ({ ...prev, errorMessage: lockoutMessage }));
        return;
      }

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

      setFieldLoading({ company: true, username: true, password: true });
      setFormState((prev) => ({ ...prev, isLoggingIn: true, errorMessage: "" }));

      try {
        const tokenResponse = await AuthService.generateToken({
          UserName: formState.userName,
          Password: formState.password,
          CompanyID: parseInt(formState.companyID),
          CompanyCode: formState.companyCode,
          CompanyName: selectedCompanyName,
        });

        if (tokenResponse.token) {
          const jwtToken = JSON.parse(atob(tokenResponse.token.split(".")[1]));
          const tokenExpiry = new Date(jwtToken.exp * 1000).getTime();

          dispatch(
            setUserDetails({
              userID: tokenResponse.user.userID,
              token: tokenResponse.token,
              adminYN: tokenResponse.user.adminYN,
              userName: tokenResponse.user.userName,
              compID: parseInt(formState.companyID),
              compCode: formState.companyCode,
              compName: selectedCompanyName,
              tokenExpiry,
            })
          );

          notifySuccess("Login successful!");
          navigate("/dashboard");
        } else {
          setLoginAttempts((prev) => {
            const newCount = prev.count + 1;
            return {
              count: newCount,
              lastAttempt: new Date(),
              isLocked: newCount >= 3,
              lockoutEndTime: newCount >= 3 ? new Date(Date.now() + 5 * 60 * 1000) : null,
            };
          });
          setFormState((prev) => ({
            ...prev,
            errorMessage: tokenResponse.user.ErrorMessage || "Invalid credentials",
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
    [formState, checkRateLimit, selectedCompanyName, dispatch, navigate]
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
    background:
      theme.palette.mode === "light"
        ? `linear-gradient(135deg, 
            rgba(255, 255, 255, 0.95) 0%,
            rgba(240, 248, 255, 0.95) 100%)`
        : `linear-gradient(135deg,
            rgba(18, 18, 18, 0.95) 0%,
            rgba(28, 28, 28, 0.95) 100%)`,
  };

  const backgroundStyle = {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative" as const,
    minHeight: isSmallScreen ? "30vh" : "auto",
    clipPath: isSmallScreen ? "none" : "polygon(0% 0%, 85% 0%, 100% 100%, 0% 100%)",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background:
        theme.palette.mode === "light"
          ? "linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)" // Darker overlay for light mode
          : "linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%)", // Darker overlay for dark mode
    },
  };

  const typographyStyles = {
    color: theme.palette.mode === "light" ? "inherit" : theme.palette.primary.light,
    textShadow: theme.palette.mode === "light" ? "2px 2px 4px rgba(0,0,0,0.2)" : "2px 2px 4px rgba(0,0,0,0.4)",
  };

  const linkStyles = {
    color: theme.palette.mode === "light" ? theme.palette.primary.main : theme.palette.primary.light,
    textDecoration: "none",
    fontWeight: 500,
    position: "relative",
    "&::after": {
      content: '""',
      position: "absolute",
      width: "0",
      height: "2px",
      bottom: "-2px",
      left: "0",
      background: theme.palette.mode === "light" ? theme.palette.primary.main : theme.palette.primary.light,
      transition: "width 0.3s ease",
    },
    "&:hover::after": {
      width: "100%",
    },
  };

  const formContainerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: isSmallScreen ? "20px 10px" : "20px",
    backgroundColor: "transparent",
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: theme.palette.mode === "light" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.2)",
      backdropFilter: "blur(10px)",
    },
  };

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      backgroundColor: theme.palette.mode === "light" ? "#ffffff" : "rgba(255, 255, 255, 0.05)",
      border: theme.palette.mode === "light" ? "1px solid rgba(0, 0, 0, 0.1)" : "1px solid rgba(255, 255, 255, 0.1)",
      "&:hover": {
        backgroundColor: theme.palette.mode === "light" ? "#ffffff" : "rgba(255, 255, 255, 0.08)",
      },
      "&.Mui-focused": {
        backgroundColor: theme.palette.mode === "light" ? "#ffffff" : "rgba(255, 255, 255, 0.1)",
      },
    },
  };

  return (
    <StyledContainer maxWidth={false} disableGutters sx={containerStyle}>
      <Grid
        container
        sx={{
          minHeight: "100vh",
          overflow: "hidden",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              theme.palette.mode === "light"
                ? "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)"
                : "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          },
        }}
      >
        <Grid item xs={12} md={8} sx={backgroundStyle}>
          {!isSmallScreen && (
            <AnimatedBox
              sx={{
                position: "absolute",
                top: "40%",
                left: "30%",
                transform: "translate(-50%, -50%)",
                color: "white",
                textAlign: "center",
                zIndex: 1,
                animation: "float 3s ease-in-out infinite",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)", // Enhanced text shadow for better visibility
              }}
            >
              <Typography
                variant="h3"
                fontWeight="bold"
                sx={{
                  mb: 2,
                  color: "#ffffff", // Explicit white color
                  opacity: 0,
                  animation: "fadeIn 0.8s ease-out forwards",
                  "@keyframes fadeIn": {
                    from: { opacity: 0, transform: "translateY(20px)" },
                    to: { opacity: 1, transform: "translateY(0)" },
                  },
                }}
              >
                Healthcare Innovation
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "#ffffff", // Explicit white color
                  opacity: 0,
                  animation: "fadeIn 0.8s ease-out 0.3s forwards",
                  textShadow: "1px 1px 3px rgba(0,0,0,0.5)", // Enhanced text shadow
                }}
              >
                Empowering better patient care through technology
              </Typography>
            </AnimatedBox>
          )}
        </Grid>
        <Grid item xs={12} md={4} sx={formContainerStyle}>
          <StyledCard>
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  textAlign: "center",
                  mb: 4,
                  position: "relative",
                }}
              >
                <Box
                  component="img"
                  src={logo}
                  alt="Company Logo"
                  sx={{
                    maxWidth: "120px",
                    transition: "transform 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                />
                <Typography
                  variant={isSmallScreen ? "h6" : "h5"}
                  component="h1"
                  sx={{
                    mt: 2,
                    fontWeight: "bold",
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    textShadow: `1px 1px 2px ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                >
                  Welcome to e-Bios
                </Typography>
              </Box>

              {formState.amcExpiryMessage && <StyledAlert severity="warning">{formState.amcExpiryMessage}</StyledAlert>}
              {formState.licenseExpiryMessage && <StyledAlert severity={formState.licenseDaysRemaining <= 0 ? "error" : "warning"}>{formState.licenseExpiryMessage}</StyledAlert>}

              <Box
                component="form"
                onSubmit={handleSubmit}
                aria-label="Login form"
                sx={{
                  mt: 1,
                  "& .MuiTextField-root, & .MuiSelect-root": {
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      transition: "transform 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                      },
                    },
                  },
                }}
              >
                {/* Existing form fields with enhanced styling */}
                <DropdownSelect
                  ref={companySelectRef}
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
                  loading={fieldLoading.company}
                  aria-label="Company selection"
                  aria-required="true"
                />

                <FloatingLabelTextBox
                  ref={usernameInputRef}
                  ControlID="username"
                  title="Username"
                  value={formState.userName}
                  onChange={(e) => setFormState((prev) => ({ ...prev, userName: e.target.value }))}
                  size="small"
                  isMandatory
                  loading={fieldLoading.username}
                  aria-label="Username input"
                  aria-required="true"
                  sx={inputStyles}
                />

                <FloatingLabelTextBox
                  ref={passwordInputRef}
                  ControlID="password"
                  title="Password"
                  type={showPassword ? "text" : "password"}
                  value={formState.password}
                  onChange={(e) => setFormState((prev) => ({ ...prev, password: e.target.value }))}
                  size="small"
                  isMandatory
                  loading={fieldLoading.password}
                  aria-label="Password input"
                  aria-required="true"
                  sx={inputStyles}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword((prev) => !prev)} edge="end" size="small">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box sx={{ textAlign: "right", mb: 2 }}>
                  <StyledRouterLink to="/ForgotPasswordPage">Forgot password?</StyledRouterLink>
                </Box>

                <StyledButton
                  ref={submitButtonRef}
                  type="submit"
                  fullWidth
                  disabled={formState.isLoggingIn || loginAttempts.isLocked}
                  startIcon={formState.isLoggingIn ? <CircularProgress size={20} /> : <LockOpenIcon />}
                  aria-label="Sign in button"
                >
                  {formState.isLoggingIn ? "Signing In..." : "Sign In"}
                </StyledButton>

                {formState.errorMessage && (
                  <StyledAlert severity="error" role="alert" aria-live="polite" sx={{ mt: 2 }}>
                    {formState.errorMessage}
                  </StyledAlert>
                )}
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </StyledContainer>
  );
};

export default LoginPage;
