import DropdownSelect from "@/components/DropDown/DropdownSelect";
import { useLoading } from "@/hooks/Common/useLoading";
import AuthService from "@/services/AuthService/AuthService";
import { ClientParameterService } from "@/services/NotGenericPaternServices/ClientParameterService";
import { CompanyService } from "@/services/NotGenericPaternServices/CompanyService";
import { setUserDetails } from "@/store/features/auth/authSlice";
import { useAppDispatch } from "@/store/hooks";
import { Company } from "@/types/Common/Company.type";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import {
  Alert,
  alpha,
  Box,
  Button,
  CircularProgress,
  Container,
  Fade,
  Grow,
  IconButton,
  InputAdornment,
  Stack,
  styled,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import logo from "../../../assets/images/eBios.png";
import backgroundImage from "/src/assets/images/LoginCoverImage.jpg";

// Styled Components with enhanced animations and effects
const AnimatedBox = styled(Box)`
  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-15px);
    }
    100% {
      transform: translateY(0px);
    }
  }
`;

const HexagonShape = styled(Box)(({ theme }) => ({
  width: "60px",
  height: "60px",
  position: "absolute",
  backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.7)}, ${alpha(theme.palette.primary.light, 0.7)})`,
  clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  zIndex: 0,
  backdropFilter: "blur(8px)",
  transition: "all 0.3s ease",
  opacity: 0.9,
  "&:hover": {
    opacity: 1,
    transform: "scale(1.1)",
  },
}));

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
  minHeight: "100vh",
  overflow: "hidden",
}));

const FormWrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  zIndex: 1,
  width: "100%",
  maxWidth: "450px",
  background: theme.palette.mode === "light" ? "rgba(255, 255, 255, 0.7)" : "rgba(24, 26, 32, 0.7)",
  backdropFilter: "blur(15px)",
  borderRadius: "20px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  padding: theme.spacing(4),
  border: theme.palette.mode === "light" ? "1px solid rgba(255, 255, 255, 0.5)" : "1px solid rgba(255, 255, 255, 0.08)",
  overflow: "hidden",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "5px",
    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    zIndex: 2,
  },
}));

const GlowingOrb = styled(Box)(({ theme, color = "primary" }) => ({
  position: "absolute",
  width: "150px",
  height: "150px",
  borderRadius: "50%",
  background:
    color === "primary"
      ? `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.8)} 0%, ${alpha(theme.palette.primary.main, 0)} 70%)`
      : `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.8)} 0%, ${alpha(theme.palette.secondary.main, 0)} 70%)`,
  filter: "blur(35px)",
  opacity: 0.6,
  zIndex: 0,
}));

const FloatingIcon = styled(Box)(({ theme }) => ({
  position: "absolute",
  zIndex: 0,
  animation: "float 6s ease-in-out infinite",
  "& svg": {
    fontSize: "28px",
    color: alpha(theme.palette.mode === "light" ? theme.palette.primary.main : theme.palette.primary.light, 0.7),
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  height: "52px",
  fontSize: "16px",
  fontWeight: 600,
  textTransform: "none",
  borderRadius: "10px",
  backgroundImage: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  boxShadow: `0 5px 15px ${alpha(theme.palette.primary.main, 0.25)}`,
  color: "#ffffff",
  position: "relative",
  overflow: "hidden",
  transition: "all 0.3s ease",
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
    transform: "translateX(-100%)",
  },
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.35)}`,
    backgroundImage: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
    "&::after": {
      transform: "translateX(100%)",
      transition: "transform 0.8s ease",
    },
  },
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
  borderRadius: "10px",
  marginBottom: theme.spacing(2),
  animation: "slideIn 0.4s ease-out",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
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
  transition: "color 0.3s ease",
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
  "&:hover": {
    color: theme.palette.primary.dark,
  },
  "&:hover::after": {
    width: "100%",
  },
}));

// Enhanced input styles
const AnimatedInput = styled(Box)(({ theme }) => ({
  position: "relative",
  zIndex: 1,
  transition: "transform 0.3s ease",
  "&:focus-within": {
    transform: "scale(1.02)",
  },
  "& .MuiOutlinedInput-root": {
    transition: "all 0.3s ease",
    borderRadius: "10px",
    backgroundColor: theme.palette.mode === "light" ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(5px)",
    boxShadow: "0 3px 10px rgba(0, 0, 0, 0.05)",
    border: theme.palette.mode === "light" ? "1px solid rgba(0, 0, 0, 0.05)" : "1px solid rgba(255, 255, 255, 0.1)",
    "&:hover": {
      backgroundColor: theme.palette.mode === "light" ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.08)",
      boxShadow: "0 5px 15px rgba(0, 0, 0, 0.08)",
    },
    "&.Mui-focused": {
      boxShadow: `0 5px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
      backgroundColor: theme.palette.mode === "light" ? "#ffffff" : "rgba(255, 255, 255, 0.12)",
    },
  },
}));

const LogoAnimation = styled(Box)(({ theme }) => ({
  position: "relative",
  zIndex: 2,
  display: "inline-block",
  "&::after": {
    content: '""',
    position: "absolute",
    width: "150%",
    height: "150%",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 70%)`,
    borderRadius: "50%",
    opacity: 0,
    transition: "opacity 0.5s ease, transform 0.5s ease",
  },
  "&:hover::after": {
    opacity: 1,
    transform: "translate(-50%, -50%) scale(1.1)",
  },
}));

const BrandName = styled(Typography)(({ theme }) => ({
  fontWeight: "bold",
  background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  color: "transparent",
  position: "relative",
  display: "inline-block",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: "-5px",
    left: "0",
    width: "100%",
    height: "2px",
    background: `linear-gradient(to right, ${theme.palette.primary.main}, transparent)`,
    transform: "scaleX(0)",
    transformOrigin: "left",
    transition: "transform 0.5s ease",
  },
  "&:hover::after": {
    transform: "scaleX(1)",
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
  const { setLoading } = useLoading();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const [formState, setFormState] = useState<LoginFormState>(initialFormState);
  const [showPassword, setShowPassword] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

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

  // Animation timing effect - no dependencies that change
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard navigation - no state dependencies
  // useEffect(() => {
  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     if (e.key === "Tab") {
  //       const focusableElements = [companySelectRef.current, usernameInputRef.current, passwordInputRef.current, submitButtonRef.current].filter(Boolean);

  //       const activeElement = document.activeElement as HTMLElement | null;
  //       if (!activeElement) return;

  //       const currentIndex = focusableElements.findIndex((el) => el instanceof HTMLElement && el.isEqualNode(activeElement));

  //       if (currentIndex > -1) {
  //         const nextIndex = e.shiftKey ? (currentIndex - 1 + focusableElements.length) % focusableElements.length : (currentIndex + 1) % focusableElements.length;

  //         const nextElement = focusableElements[nextIndex];
  //         if (nextElement instanceof HTMLElement) {
  //           nextElement.focus();
  //           e.preventDefault();
  //         }
  //       }
  //     }
  //   };

  //   document.addEventListener("keydown", handleKeyDown);
  //   return () => document.removeEventListener("keydown", handleKeyDown);
  // }, []);

  // Check rate limit - no state updates inside
  const checkRateLimit = useCallback(() => {
    const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes
    const MAX_ATTEMPTS = 3;

    if (loginAttempts.isLocked && loginAttempts.lockoutEndTime) {
      const now = new Date();
      if (now < loginAttempts.lockoutEndTime) {
        const remainingTime = Math.ceil((loginAttempts.lockoutEndTime.getTime() - now.getTime()) / 1000);
        return `Account locked. Try again in ${remainingTime} seconds.`;
      }
      // We'll handle the reset outside this function
      return null;
    }
    return null;
  }, [loginAttempts.isLocked, loginAttempts.lockoutEndTime]);

  // Responsive breakpoints
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));

  // Simple computed value
  const selectedCompanyName = useMemo(() => {
    const selectedCompany = formState.companies.find((c) => c.compIDCompCode === `${formState.companyID},${formState.companyCode}`);
    return selectedCompany?.compName || "Select Company";
  }, [formState.companyID, formState.companyCode, formState.companies]);

  // Pure function, no dependencies
  const checkDateValidity = (dateString: string): number => {
    const [day, month, year] = dateString.split("/").map(Number);
    const today = new Date();
    const targetDate = new Date(year, month - 1, day);
    const differenceInTime = targetDate.getTime() - today.getTime();
    return differenceInTime / (1000 * 3600 * 24);
  };

  // Handle company selection - event handler
  const handleSelectCompany = (compIDCompCode: string, compName: string) => {
    const [compID, compCode] = compIDCompCode.split(",");
    setFormState((prev) => ({
      ...prev,
      companyID: compID || "0",
      companyCode: compCode || "",
      errorMessage: !compID || !compCode ? "Please select a company" : "",
    }));
  };

  // Fetch companies only once on mount
  useEffect(() => {
    let isMounted = true;

    const fetchCompanies = async () => {
      setLoading(true);

      try {
        const companyData = await CompanyService.getCompanies();

        if (isMounted) {
          setFormState((prev) => ({ ...prev, companies: companyData }));

          // Auto-select if only one company
          if (companyData.length === 1) {
            const [compID, compCode] = companyData[0].compIDCompCode.split(",");
            setFormState((prev) => ({
              ...prev,
              companyID: compID || "0",
              companyCode: compCode || "",
            }));
          }
        }
      } catch (error) {
        console.error("Fetching companies failed: ", error);
        if (isMounted) {
          setFormState((prev) => ({
            ...prev,
            errorMessage: "Failed to load companies.",
          }));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Execute once
    fetchCompanies();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Only depends on stable references

  // Check expiry dates in a separate effect
  useEffect(() => {
    let isMounted = true;

    const fetchExpiryDates = async () => {
      try {
        const [amcDetails, licenseDetails] = await Promise.all([ClientParameterService.getClientParameter("AMCSUP"), ClientParameterService.getClientParameter("CINLIC")]);

        if (isMounted) {
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
        }
      } catch (error) {
        console.error("Failed to fetch client parameters:", error);
      }
    };

    // Execute once
    fetchExpiryDates();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - run once on mount

  // Form submission - event handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const lockoutMessage = checkRateLimit();
    if (lockoutMessage) {
      setFormState((prev) => ({ ...prev, errorMessage: lockoutMessage }));
      return;
    }

    // Check if the lockout period has ended, reset if needed
    if (loginAttempts.isLocked && loginAttempts.lockoutEndTime) {
      const now = new Date();
      if (now >= loginAttempts.lockoutEndTime) {
        setLoginAttempts((prev) => ({ ...prev, isLocked: false, count: 0 }));
      }
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
    } finally {
      setFieldLoading({ company: false, username: false, password: false });
    }
  };

  // Render JSX (keeping the same rendering logic)
  return (
    <StyledContainer maxWidth={false} disableGutters>
      {/* Main Layout using Box instead of Grid */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          minHeight: "100vh",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Left side with background image */}
        <Box
          sx={{
            flex: { xs: "1", md: "0 0 66.666%" },
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
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
                  ? "linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)"
                  : "linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%)",
            },
          }}
        >
          {!isSmallScreen && (
            <Fade in={animationComplete} timeout={1000}>
              <AnimatedBox
                sx={{
                  position: "absolute",
                  top: "40%",
                  left: "30%",
                  transform: "translate(-50%, -50%)",
                  color: "white",
                  textAlign: "center",
                  zIndex: 1,
                  animation: "float 5s ease-in-out infinite",
                  textShadow: "2px 2px 8px rgba(0,0,0,0.6)",
                }}
              >
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  sx={{
                    mb: 3,
                    color: "#ffffff",
                    opacity: 0,
                    animation: "fadeIn 1s ease-out forwards 0.5s",
                    "@keyframes fadeIn": {
                      from: { opacity: 0, transform: "translateY(25px)" },
                      to: { opacity: 1, transform: "translateY(0)" },
                    },
                    letterSpacing: "0.5px",
                  }}
                >
                  Healthcare Innovation
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#ffffff",
                    opacity: 0,
                    animation: "fadeIn 1s ease-out 1s forwards",
                    textShadow: "1px 1px 4px rgba(0,0,0,0.7)",
                    maxWidth: "80%",
                    margin: "0 auto",
                    lineHeight: 1.6,
                  }}
                >
                  Empowering better patient care through technology
                </Typography>
              </AnimatedBox>
            </Fade>
          )}
        </Box>

        {/* Right side with login form */}
        <Box
          sx={{
            flex: { xs: "1", md: "0 0 33.333%" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: isSmallScreen ? "20px 10px" : "20px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Visual elements */}
          <GlowingOrb sx={{ top: "-20px", right: "40px" }} />
          <GlowingOrb color="primary" sx={{ bottom: "10%", left: "10%" }} />

          {/* Hexagon elements */}
          <Fade in={true} timeout={1000}>
            <HexagonShape sx={{ top: "19%", right: "15%" }}>
              <HealthAndSafetyIcon sx={{ fontSize: 30 }} />
            </HexagonShape>
          </Fade>

          <Fade in={true} timeout={1500}>
            <HexagonShape sx={{ bottom: "19%", right: "60%" }}>
              <LocalHospitalIcon sx={{ fontSize: 30 }} />
            </HexagonShape>
          </Fade>

          {/* Floating medical icons */}
          <Fade in={true} timeout={2000}>
            <FloatingIcon sx={{ top: "25%", left: "15%", animation: "float 4s ease-in-out infinite" }}>
              <MedicalServicesIcon />
            </FloatingIcon>
          </Fade>

          <Grow in={true} timeout={800}>
            <FormWrapper>
              <Box sx={{ position: "relative", zIndex: 2 }}>
                {/* Logo with enhanced animation */}
                <Box
                  sx={{
                    textAlign: "center",
                    mb: 3,
                    position: "relative",
                  }}
                >
                  <LogoAnimation
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mb: 2,
                    }}
                  >
                    <img src={logo} alt="e-Bios Logo" style={{ maxWidth: "100px" }} />
                  </LogoAnimation>

                  <BrandName variant={isSmallScreen ? "h5" : "h4"} sx={{ mb: 1 }}>
                    e-Bios
                  </BrandName>

                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      fontWeight: 500,
                      opacity: 0.9,
                      letterSpacing: "0.5px",
                    }}
                  >
                    Hospital Information System
                  </Typography>
                </Box>

                {formState.amcExpiryMessage && (
                  <StyledAlert severity="warning" icon={false} sx={{ mb: 3 }}>
                    {formState.amcExpiryMessage}
                  </StyledAlert>
                )}

                {formState.licenseExpiryMessage && (
                  <StyledAlert severity={formState.licenseDaysRemaining <= 0 ? "error" : "warning"} icon={false} sx={{ mb: 3 }}>
                    {formState.licenseExpiryMessage}
                  </StyledAlert>
                )}

                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  aria-label="Login form"
                  sx={{
                    mt: 1,
                    "& .MuiTextField-root, & .MuiSelect-root": {
                      mb: 3,
                    },
                  }}
                >
                  {/* Using Stack for input fields */}
                  <Stack>
                    <AnimatedInput>
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
                    </AnimatedInput>

                    <AnimatedInput>
                      <TextField
                        inputRef={usernameInputRef}
                        id="username"
                        label="Username"
                        value={formState.userName}
                        onChange={(e) => setFormState((prev) => ({ ...prev, userName: e.target.value }))}
                        size="small"
                        fullWidth
                        required
                        variant="outlined"
                        disabled={fieldLoading.username}
                        aria-label="Username input"
                        aria-required="true"
                        InputLabelProps={{
                          shrink: Boolean(formState.userName),
                        }}
                        InputProps={{
                          endAdornment: fieldLoading.username ? (
                            <InputAdornment position="end">
                              <CircularProgress size={20} />
                            </InputAdornment>
                          ) : null,
                        }}
                      />
                    </AnimatedInput>

                    <AnimatedInput>
                      <TextField
                        inputRef={passwordInputRef}
                        id="password"
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        value={formState.password}
                        onChange={(e) => setFormState((prev) => ({ ...prev, password: e.target.value }))}
                        size="small"
                        fullWidth
                        required
                        variant="outlined"
                        disabled={fieldLoading.password}
                        aria-label="Password input"
                        aria-required="true"
                        InputLabelProps={{
                          shrink: Boolean(formState.password),
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              {fieldLoading.password ? (
                                <CircularProgress size={20} />
                              ) : (
                                <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword((prev) => !prev)} edge="end" size="small">
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              )}
                            </InputAdornment>
                          ),
                        }}
                      />
                    </AnimatedInput>
                  </Stack>

                  <Box sx={{ textAlign: "right", mb: 2 }}>
                    <StyledRouterLink to="/ForgotPasswordPage">Forgot password?</StyledRouterLink>
                  </Box>

                  <StyledButton
                    ref={submitButtonRef}
                    type="submit"
                    fullWidth
                    disabled={formState.isLoggingIn || loginAttempts.isLocked}
                    endIcon={formState.isLoggingIn ? <CircularProgress size={20} color="inherit" /> : <KeyboardArrowRightIcon />}
                    aria-label="Sign in button"
                  >
                    {formState.isLoggingIn ? "Signing In..." : "Sign In"}
                  </StyledButton>

                  {formState.errorMessage && (
                    <Fade in={!!formState.errorMessage}>
                      <StyledAlert severity="error" role="alert" aria-live="polite" sx={{ mt: 3 }}>
                        {formState.errorMessage}
                      </StyledAlert>
                    </Fade>
                  )}
                </Box>
              </Box>
            </FormWrapper>
          </Grow>
        </Box>
      </Box>
    </StyledContainer>
  );
};

export default LoginPage;
