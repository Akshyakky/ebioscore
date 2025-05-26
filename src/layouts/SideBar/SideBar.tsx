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
  Tooltip,
  useMediaQuery,
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
import moduleService, { ModuleDto, SubModuleDto } from "@/services/NotGenericPaternServices/ModuleService";
import { useTheme as useCustomTheme } from "@/providers/ThemeProvider";

interface SideBarProps {
  userID: number | null;
  token: string | null;
}

// Responsive drawer width
const getDrawerWidth = (isSmallScreen: boolean) => (isSmallScreen ? 280 : 320);

// Memo-ized SubModule component for better performance
const SubModuleItem = memo(({ subModule, handleSubModuleClick }: { subModule: SubModuleDto; handleSubModuleClick: (path: string) => void }) => (
  <NavLink
    to={subModule.link}
    style={{ textDecoration: "none", color: "inherit", display: "block" }}
    className={({ isActive }) => (isActive ? "active-submenu-item" : "")}
    onClick={(e) => {
      e.preventDefault();
      handleSubModuleClick(subModule.link);
    }}
  >
    <ListItemButton sx={{ pl: 3, borderRadius: 1, m: 0.5 }}>
      <ListItemIcon>
        <Icon icon={subModule.iCon} style={{ fontSize: "20px" }} />
      </ListItemIcon>
      <ListItemText primary={subModule.title} primaryTypographyProps={{ fontSize: "0.95rem" }} />
    </ListItemButton>
  </NavLink>
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
    <Box display="flex">
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
        }}
      >
        <Toolbar>
          <IconButton color="inherit" aria-label={open ? "close drawer" : "open drawer"} onClick={handleDrawerToggle} edge="start" sx={{ mr: 2 }}>
            {open ? <CloseIcon /> : <MenuIcon />}
          </IconButton>

          <Tooltip title="Go to Dashboard">
            <IconButton color="inherit" aria-label="dashboard" onClick={handleDashboardClick} sx={{ mr: 2 }}>
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

      <Drawer
        variant={isSmallScreen ? "temporary" : "persistent"}
        anchor="left"
        open={open}
        onClose={handleDrawerClose}
        PaperProps={{
          sx: {
            width: getDrawerWidth(isSmallScreen),
            bgcolor: "background.paper",
            color: "text.primary",
          },
        }}
      >
        <Box p={0.7} borderBottom={1} borderColor="divider">
          <TextField
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
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
              },
            }}
          />
        </Box>

        <Divider />

        <List
          className="sidebar-scroll"
          sx={{
            pt: 1,
            overflowY: "auto",
            height: "calc(100vh - 140px)",
          }}
          component="nav"
          aria-label="main navigation"
        >
          {filteredModules.length === 0 && (
            <Box p={2} textAlign="center">
              <Typography color="text.secondary" variant="body2">
                No modules found
              </Typography>
            </Box>
          )}

          {filteredModules.map((module) => (
            <React.Fragment key={`module-${module.auGrpID}`}>
              <ListItemButton onClick={() => toggleModule(module.auGrpID)} selected={activeModuleId === module.auGrpID} sx={{ borderRadius: 1, m: 0.5 }}>
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
                    {activeModuleId === module.auGrpID ? <KeyboardArrowDownIcon fontSize="small" color="action" /> : <KeyboardArrowRightIcon fontSize="small" color="action" />}
                  </Fade>
                )}
              </ListItemButton>

              <Collapse in={activeModuleId === module.auGrpID} timeout={300} unmountOnExit>
                <List component="div" disablePadding>
                  {getFilteredSubModules(module).map((subModule, index) => (
                    <SubModuleItem key={`submodule-${subModule.auGrpID}-${index}`} subModule={subModule} handleSubModuleClick={handleSubModuleClick} />
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ))}
        </List>

        {/* Footer area for version info */}
        <Box mt="auto" p={2} borderTop={1} borderColor="divider" textAlign="center">
          <Typography variant="caption" color="text.secondary">
            eBios Core v2.5.1
          </Typography>
        </Box>
      </Drawer>
    </Box>
  );
};

export default SideBar;
