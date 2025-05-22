import React, { useState, useEffect, useCallback, memo } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  TextField,
  Box,
  Divider,
  Collapse,
  AppBar,
  Toolbar,
  CssBaseline,
  InputAdornment,
  ListItemButton,
  styled,
  alpha,
  Tooltip,
  useMediaQuery,
  Badge,
  Fade,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import HomeIcon from "@mui/icons-material/Home";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { Icon } from "@iconify/react";
import { usePageTitle } from "../../hooks/usePageTitle";
import ProfileMenu from "./ProfileMenu";
import { notifyError } from "../../utils/Common/toastManager";
import { MaterialUISwitch } from "../../components/Switch/MaterialUISwitch";
import "./SideBar.css";
import moduleService, { ModuleDto, SubModuleDto } from "@/services/CommonServices/ModuleService";
import { useTheme as useCustomTheme } from "@/providers/ThemeProvider";

interface SideBarProps {
  userID: number | null;
  token: string | null;
}

// Responsive drawer width
const getDrawerWidth = (isSmallScreen: boolean) => (isSmallScreen ? 280 : 320);

interface StyledDrawerProps {
  isSmallScreen: boolean;
}

const StyledDrawer = styled(Drawer)<StyledDrawerProps>(({ theme, isSmallScreen }) => ({
  "& .MuiDrawer-paper": {
    width: getDrawerWidth(isSmallScreen),
    boxSizing: "border-box",
    backgroundColor: theme.palette.mode === "light" ? "#ffffff" : theme.palette.background.default,
    color: theme.palette.text.primary,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    borderRight: `1px solid ${theme.palette.divider}`,
    transition: theme.transitions.create(["width", "transform"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
}));

// Improved NavLink with animation and better active state
const StyledNavLink = styled(NavLink)(({ theme }) => ({
  textDecoration: "none",
  color: theme.palette.text.primary,
  display: "block",
  transition: "all 0.2s ease",
  "&.active-submenu-item": {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    "& .MuiListItemText-primary": {
      fontWeight: 600,
      color: theme.palette.primary.main,
    },
    "& .MuiListItemIcon-root svg": {
      color: theme.palette.primary.main,
    },
  },
}));

// Enhanced ListItemButton with better hover effects
const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: "8px",
  margin: "2px 4px",
  padding: "8px 16px",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.06),
    transform: "translateX(2px)",
  },
  "&.Mui-selected": {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.14),
    },
    "& .MuiListItemText-primary": {
      fontWeight: 600,
    },
    "& .MuiListItemIcon-root svg": {
      color: theme.palette.primary.main,
    },
  },
}));

// Specialized dashboard button with distinct styling
const DashboardListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: "8px",
  margin: "8px",
  marginBottom: "16px",
  padding: "12px 16px",
  backgroundColor: alpha(theme.palette.primary.main, 0.12),
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
  },
  "& .MuiListItemText-primary": {
    fontWeight: 600,
  },
  "& .MuiListItemIcon-root svg": {
    color: theme.palette.primary.main,
  },
}));

// Enhanced search box with animation
const SearchBox = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "20px",
    backgroundColor: theme.palette.mode === "light" ? alpha(theme.palette.common.black, 0.04) : alpha(theme.palette.common.white, 0.15),
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: theme.palette.mode === "light" ? alpha(theme.palette.common.black, 0.07) : alpha(theme.palette.common.white, 0.25),
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
    "&.Mui-focused": {
      backgroundColor: theme.palette.mode === "light" ? alpha(theme.palette.common.black, 0.07) : alpha(theme.palette.common.white, 0.25),
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
    },
  },
}));

// Memo-ized SubModule component for better performance
const SubModuleItem = memo(({ subModule, handleSubModuleClick, theme }: { subModule: SubModuleDto; handleSubModuleClick: (path: string) => void; theme: any }) => (
  <StyledNavLink
    to={subModule.link}
    className={({ isActive }) => (isActive ? "active-submenu-item" : "")}
    onClick={(e) => {
      e.preventDefault();
      handleSubModuleClick(subModule.link);
    }}
  >
    <StyledListItemButton sx={{ pl: 3 }}>
      <ListItemIcon>
        <Icon icon={subModule.iCon} style={{ fontSize: "20px", color: theme.palette.text.secondary }} />
      </ListItemIcon>
      <ListItemText primary={subModule.title} primaryTypographyProps={{ fontSize: "0.95rem" }} />
    </StyledListItemButton>
  </StyledNavLink>
));

const SideBar: React.FC<SideBarProps> = ({ userID, token }) => {
  const { pageTitle } = usePageTitle();
  const [modules, setModules] = useState<ModuleDto[]>([]);
  const [subModules, setSubModules] = useState<SubModuleDto[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [filterKeyword, setFilterKeyword] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { mode, toggleTheme } = useCustomTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const handleSubModuleClick = useCallback(
    (path: string) => {
      handleDrawerClose();
      navigate(path);
    },
    [navigate]
  );

  const handleDashboardClick = useCallback(() => {
    navigate("/dashboard");
    handleDrawerClose();
  }, [navigate]);

  const handleDrawerToggle = useCallback(() => {
    setOpen(!open);
  }, [open]);

  const handleDrawerClose = useCallback(() => {
    setOpen(false);
  }, []);

  // Auto-expand module if current route matches a submodule
  useEffect(() => {
    const currentPath = location.pathname;
    const matchingSubModule = subModules.find((sm) => sm.link === currentPath);

    if (matchingSubModule) {
      setActiveModuleId(matchingSubModule.auGrpID);
    }
  }, [location.pathname, subModules]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const drawer = document.querySelector(".MuiDrawer-root");
      if (drawer && !drawer.contains(event.target as Node) && isSmallScreen) {
        handleDrawerClose();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open, handleDrawerClose, isSmallScreen]);

  useEffect(() => {
    const fetchNavigationData = async () => {
      if (token) {
        try {
          const modulesData = await moduleService.getActiveModules(userID ?? 0);
          setModules(modulesData);
          const subModulesData = await moduleService.getActiveSubModules(userID ?? 0);
          setSubModules(subModulesData);
        } catch (error) {
          console.error("Error fetching navigation data:", error);
          notifyError("Error fetching navigation data");
        }
      }
    };

    fetchNavigationData();
  }, [userID, token]);

  const toggleModule = useCallback((moduleId: number) => {
    setActiveModuleId((prevId) => (prevId === moduleId ? null : moduleId));
  }, []);

  const shouldDisplayModule = useCallback(
    (module: ModuleDto) => {
      if (!filterKeyword) return true;

      return (
        module.title.toLowerCase().includes(filterKeyword.toLowerCase()) ||
        subModules.some((subModule) => subModule.auGrpID === module.auGrpID && subModule.title.toLowerCase().includes(filterKeyword.toLowerCase()))
      );
    },
    [filterKeyword, subModules]
  );

  const filteredModules = modules.filter(shouldDisplayModule);

  const getFilteredSubModules = useCallback(
    (module: ModuleDto) => {
      if (!filterKeyword) return subModules.filter((sm) => sm.auGrpID === module.auGrpID);

      if (module.title.toLowerCase().includes(filterKeyword.toLowerCase())) {
        return subModules.filter((subModule) => subModule.auGrpID === module.auGrpID);
      } else {
        return subModules.filter((subModule) => subModule.auGrpID === module.auGrpID && subModule.title.toLowerCase().includes(filterKeyword.toLowerCase()));
      }
    },
    [filterKeyword, subModules]
  );

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDrawerClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDrawerClose]);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: open ? `calc(100% - ${getDrawerWidth(isSmallScreen)}px)` : "100%",
          ml: open ? `${getDrawerWidth(isSmallScreen)}px` : 0,
          transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label={open ? "close drawer" : "open drawer"}
            onClick={handleDrawerToggle}
            edge="start"
            sx={{
              mr: 2,
              transition: "transform 0.3s ease",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </IconButton>

          <Tooltip title="Go to Dashboard">
            <IconButton
              color="inherit"
              aria-label="dashboard"
              onClick={handleDashboardClick}
              sx={{
                mr: 2,
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                },
              }}
            >
              <HomeIcon />
            </IconButton>
          </Tooltip>

          <Typography variant="h6" noWrap component="div" fontWeight="bold">
            {pageTitle}
          </Typography>
          <Box flexGrow={1} />
          <MaterialUISwitch checked={mode === "dark"} onChange={toggleTheme} />
          <ProfileMenu />
        </Toolbar>
      </AppBar>
      <StyledDrawer variant={isSmallScreen ? "temporary" : "persistent"} anchor="left" open={open} onClose={handleDrawerClose} isSmallScreen={isSmallScreen}>
        <Box
          sx={{
            padding: 0.7,
            borderBottom: `1px solid ${theme.palette.divider}`,
            transition: "padding 0.2s ease",
            ...(isSearchFocused && {}),
          }}
        >
          <SearchBox
            variant="outlined"
            size="small"
            fullWidth
            placeholder="Search modules..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            onChange={(e) => setFilterKeyword(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            type="search"
          />
        </Box>
        <Divider />
        <List
          sx={{
            pt: 1,
            overflowY: "auto",
            height: "calc(100vh - 140px)",
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
              borderRadius: "6px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
            },
          }}
          component="nav"
          aria-label="main navigation"
        >
          {filteredModules.length === 0 && (
            <Box sx={{ p: 2, textAlign: "center" }}>
              <Typography color="textSecondary" variant="body2">
                No modules found
              </Typography>
            </Box>
          )}

          {filteredModules.map((module) => (
            <React.Fragment key={`module-${module.auGrpID}`}>
              <StyledListItemButton onClick={() => toggleModule(module.auGrpID)} selected={activeModuleId === module.auGrpID}>
                <ListItemIcon>
                  <Icon
                    icon={module.iCon}
                    style={{
                      fontSize: "24px",
                      color: activeModuleId === module.auGrpID ? theme.palette.primary.main : theme.palette.text.secondary,
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={module.title}
                  primaryTypographyProps={{
                    fontWeight: activeModuleId === module.auGrpID ? 600 : 400,
                  }}
                />
                {getFilteredSubModules(module).length > 0 && (
                  <Fade in={true}>
                    {activeModuleId === module.auGrpID ? (
                      <KeyboardArrowDownIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                    ) : (
                      <KeyboardArrowRightIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                    )}
                  </Fade>
                )}
              </StyledListItemButton>

              <Collapse
                in={activeModuleId === module.auGrpID}
                timeout={300}
                unmountOnExit
                sx={{
                  borderLeft: `1px dashed ${alpha(theme.palette.primary.main, 0.5)}`,
                  ml: 1,
                  mt: 0.5,
                  mb: 0.5,
                }}
              >
                <List component="div" disablePadding>
                  {getFilteredSubModules(module).map((subModule, index) => (
                    <SubModuleItem key={`submodule-${subModule.auGrpID}-${index}`} subModule={subModule} handleSubModuleClick={handleSubModuleClick} theme={theme} />
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ))}
        </List>

        {/* Footer area for version info */}
        <Box
          sx={{
            mt: "auto",
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            textAlign: "center",
          }}
        >
          <Typography variant="caption" color="textSecondary">
            eBios Core v2.5.1
          </Typography>
        </Box>
      </StyledDrawer>
    </Box>
  );
};

export default SideBar;
