// src/layouts/CompactLayout/SideBar.tsx
import { useTheme as useCustomTheme } from "@/providers/ThemeProvider";
import moduleService, { ModuleDto, SubModuleDto } from "@/services/NotGenericPaternServices/ModuleService";
import { Icon } from "@iconify/react";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import {
  AppBar,
  Box,
  Collapse,
  CssBaseline,
  Divider,
  Drawer,
  Fade,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { memo, useCallback, useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { MaterialUISwitch } from "../../components/Switch/MaterialUISwitch";
import { usePageTitle } from "../../hooks/usePageTitle";
import ProfileMenu from "../SideBar/ProfileMenu";

interface SideBarProps {
  userID: number | null;
  token: string | null;
  isCompactMode: boolean;
  density: "comfortable" | "standard" | "compact";
}

// Responsive drawer width calculation
const getDrawerWidth = (isSmallScreen: boolean, isCompactMode: boolean, density: string) => {
  if (isCompactMode || density === "compact") {
    return isSmallScreen ? 240 : 280;
  }
  if (density === "comfortable") {
    return isSmallScreen ? 300 : 340;
  }
  return isSmallScreen ? 280 : 320;
};

const getMiniDrawerWidth = (density: string) => {
  return density === "compact" ? 48 : 56;
};

// Compact SubModule component
const SubModuleItem = memo(
  ({
    subModule,
    handleSubModuleClick,
    isCompactMode,
    density,
  }: {
    subModule: SubModuleDto;
    handleSubModuleClick: (path: string) => void;
    isCompactMode: boolean;
    density: string;
  }) => {
    const spacing = density === "compact" ? 0.25 : density === "comfortable" ? 0.75 : 0.5;
    const paddingLeft = isCompactMode ? 2 : 3;

    return (
      <NavLink
        to={subModule.link}
        style={{ textDecoration: "none", color: "inherit", display: "block" }}
        className={({ isActive }) => (isActive ? "active-submenu-item" : "")}
        onClick={(e) => {
          e.preventDefault();
          handleSubModuleClick(subModule.link);
        }}
      >
        <ListItemButton
          sx={{
            pl: paddingLeft,
            borderRadius: 1,
            m: spacing,
            minHeight: density === "compact" ? 36 : density === "comfortable" ? 44 : 36,
            py: density === "compact" ? 0.5 : 1,
          }}
        >
          <ListItemIcon sx={{ minWidth: density === "compact" ? 36 : 40 }}>
            <Icon icon={subModule.iCon} style={{ fontSize: density === "compact" ? "16px" : "20px" }} />
          </ListItemIcon>
          <ListItemText
            primary={subModule.title}
            primaryTypographyProps={{
              fontSize: density === "compact" ? "0.85rem" : "0.95rem",
              lineHeight: density === "compact" ? 1.2 : 1.4,
            }}
          />
        </ListItemButton>
      </NavLink>
    );
  }
);

const SideBar: React.FC<SideBarProps> = ({ userID, token, isCompactMode, density }) => {
  const { pageTitle } = usePageTitle();
  const [modules, setModules] = useState<ModuleDto[]>([]);
  const [subModules, setSubModules] = useState<SubModuleDto[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [filterKeyword, setFilterKeyword] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [miniMode, setMiniMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { mode, toggleTheme } = useCustomTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const isExtraSmall = useMediaQuery(theme.breakpoints.down("sm"));

  // Auto mini-mode for very small screens
  useEffect(() => {
    if (isExtraSmall && open) {
      setMiniMode(false); // Disable mini mode on extra small screens
    }
  }, [isExtraSmall, open]);

  const drawerWidth = getDrawerWidth(isSmallScreen, isCompactMode, density);
  const miniDrawerWidth = getMiniDrawerWidth(density);

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
    if (!open) setMiniMode(false);
  }, [open]);

  const handleDrawerClose = useCallback(() => {
    setOpen(false);
    setMiniMode(false);
  }, []);

  const toggleMiniMode = useCallback(() => {
    if (open && !isSmallScreen) {
      setMiniMode(!miniMode);
    }
  }, [open, miniMode, isSmallScreen]);

  // Auto-expand module if current route matches a submodule
  useEffect(() => {
    const currentPath = location.pathname;
    const matchingSubModule = subModules.find((sm) => sm.link === currentPath);
    if (matchingSubModule) {
      setActiveModuleId(matchingSubModule.auGrpID);
    }
  }, [location.pathname, subModules]);

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
        }
      }
    };

    fetchNavigationData();
  }, [userID, token]);

  const toggleModule = useCallback(
    (moduleId: number) => {
      if (!miniMode) {
        setActiveModuleId((prevId) => (prevId === moduleId ? null : moduleId));
      }
    },
    [miniMode]
  );

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

  const actualDrawerWidth = miniMode ? miniDrawerWidth : drawerWidth;
  const showLabels = !miniMode;
  const searchFieldSize = density === "compact" ? "small" : "small";
  const headerSpacing = density === "compact" ? 0.5 : 0.7;

  return (
    <Box display="flex">
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: open ? `calc(100% - ${actualDrawerWidth}px)` : "100%",
          ml: open ? `${actualDrawerWidth}px` : 0,
          transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.short,
          }),
        }}
      >
        <Toolbar
          variant={density === "compact" ? "dense" : "regular"}
          sx={{
            minHeight: density === "compact" ? 48 : 64,
            px: density === "compact" ? 1 : 2,
          }}
        >
          <IconButton
            color="inherit"
            aria-label={open ? "close drawer" : "open drawer"}
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: density === "compact" ? 1 : 2 }}
            size={density === "compact" ? "small" : "medium"}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </IconButton>

          {!miniMode && (
            <Tooltip title="Go to Dashboard">
              <IconButton
                color="inherit"
                aria-label="dashboard"
                onClick={handleDashboardClick}
                sx={{ mr: density === "compact" ? 1 : 2 }}
                size={density === "compact" ? "small" : "medium"}
              >
                <HomeIcon />
              </IconButton>
            </Tooltip>
          )}

          <Typography variant={density === "compact" ? "subtitle1" : "h6"} noWrap component="div" fontWeight="bold" sx={{ fontSize: density === "compact" ? "1rem" : "1.25rem" }}>
            {pageTitle}
          </Typography>

          <Box flexGrow={1} />

          {!isExtraSmall && <MaterialUISwitch checked={mode === "dark"} onChange={toggleTheme} size={density === "compact" ? "small" : "medium"} />}

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
            width: actualDrawerWidth,
            bgcolor: "background.paper",
            color: "text.primary",
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.short,
            }),
            overflowX: "hidden",
          },
        }}
      >
        {/* Header with search and mini toggle */}
        <Box borderBottom={1} borderColor="divider" display="flex" flexDirection="column" gap={headerSpacing}>
          {!miniMode && (
            <TextField
              variant="outlined"
              size={searchFieldSize}
              fullWidth
              placeholder="Search modules..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
              onChange={(e) => setFilterKeyword(e.target.value)}
              type="search"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  fontSize: density === "compact" ? "0.8rem" : "0.875rem",
                },
              }}
            />
          )}

          {/* {!isSmallScreen && (
            <Box display="flex" justifyContent="center">
              <IconButton
                onClick={toggleMiniMode}
                size="small"
                sx={{
                  bgcolor: "action.hover",
                  "&:hover": { bgcolor: "action.selected" },
                }}
              >
                <MenuIcon fontSize="small" />
              </IconButton>
            </Box>
          )} */}
        </Box>

        <Divider />

        <List
          className="sidebar-scroll"
          sx={{
            pt: density === "compact" ? 0.5 : 1,
            overflowY: "auto",
            height: `calc(100vh - ${density === "compact" ? 120 : 140}px)`,
            px: density === "compact" ? 0.5 : 1,
          }}
          component="nav"
          aria-label="main navigation"
        >
          {filteredModules.length === 0 && !miniMode && (
            <Box p={2} textAlign="center">
              <Typography color="text.secondary" variant="body2" fontSize={density === "compact" ? "0.75rem" : "0.875rem"}>
                No modules found
              </Typography>
            </Box>
          )}

          {filteredModules.map((module) => (
            <React.Fragment key={`module-${module.auGrpID}`}>
              <ListItemButton
                onClick={() => toggleModule(module.auGrpID)}
                selected={activeModuleId === module.auGrpID}
                sx={{
                  borderRadius: 1,
                  m: density === "compact" ? 0.25 : 0.5,
                  minHeight: density === "compact" ? 36 : density === "comfortable" ? 48 : 40,
                  px: miniMode ? 1 : 2,
                  justifyContent: miniMode ? "center" : "flex-start",
                }}
                title={miniMode ? module.title : undefined}
              >
                <ListItemIcon
                  sx={{
                    minWidth: miniMode ? "auto" : density === "compact" ? 36 : 40,
                    justifyContent: "center",
                  }}
                >
                  <Icon
                    icon={module.iCon}
                    style={{
                      fontSize: density === "compact" ? "20px" : "24px",
                      color: activeModuleId === module.auGrpID ? theme.palette.primary.main : theme.palette.text.secondary,
                    }}
                  />
                </ListItemIcon>

                {showLabels && (
                  <>
                    <ListItemText
                      primary={module.title}
                      primaryTypographyProps={{
                        fontWeight: activeModuleId === module.auGrpID ? 600 : 400,
                        fontSize: density === "compact" ? "0.85rem" : "0.95rem",
                        lineHeight: density === "compact" ? 1.2 : 1.4,
                      }}
                    />
                    {getFilteredSubModules(module).length > 0 && (
                      <Fade in={true}>
                        {activeModuleId === module.auGrpID ? <KeyboardArrowDownIcon fontSize="small" color="action" /> : <KeyboardArrowRightIcon fontSize="small" color="action" />}
                      </Fade>
                    )}
                  </>
                )}
              </ListItemButton>

              {showLabels && (
                <Collapse in={activeModuleId === module.auGrpID} timeout={200} unmountOnExit>
                  <List component="div" disablePadding>
                    {getFilteredSubModules(module).map((subModule, index) => (
                      <SubModuleItem
                        key={`submodule-${subModule.auGrpID}-${index}`}
                        subModule={subModule}
                        handleSubModuleClick={handleSubModuleClick}
                        isCompactMode={isCompactMode}
                        density={density}
                      />
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>

        {/* Footer area - hidden in mini mode */}
        {showLabels && (
          <Box mt="auto" p={density === "compact" ? 1 : 2} borderTop={1} borderColor="divider" textAlign="center">
            <Typography variant="caption" color="text.secondary" fontSize={density === "compact" ? "0.65rem" : "0.75rem"}>
              eBios Core v2.5.1
            </Typography>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default SideBar;
