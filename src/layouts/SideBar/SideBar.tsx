import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import moduleService from "../../services/CommonServices/ModuleService";
import { ModuleDto, SubModuleDto } from "../../interfaces/Common/Modules";
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
  useTheme,
  styled,
  alpha,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Icon } from "@iconify/react";
import { usePageTitle } from "../../hooks/usePageTitle";
import ProfileMenu from "./ProfileMenu";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { notifyError } from "../../utils/Common/toastManager";
import { MaterialUISwitch } from "../../components/Switch/MaterialUISwitch";
import { useTheme as useCustomTheme } from "../../context/Common/ThemeContext";
import "./SideBar.css";

interface SideBarProps {
  userID: number | null;
  token: string | null;
}

const drawerWidth = 340;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.mode === 'light' ? '#ffffff' : theme.palette.background.default,
    color: theme.palette.text.primary,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

const StyledNavLink = styled(NavLink)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.text.primary,
  '&.active-submenu-item': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    borderLeft: `4px solid ${theme.palette.primary.main}`,
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: '8px',
  margin: '2px 8px',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
  '&.Mui-selected': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.12),
    },
  },
}));

const SearchBox = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '20px',
    backgroundColor: theme.palette.mode === 'light' ? alpha(theme.palette.common.black, 0.04) : alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: theme.palette.mode === 'light' ? alpha(theme.palette.common.black, 0.07) : alpha(theme.palette.common.white, 0.25),
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.mode === 'light' ? alpha(theme.palette.common.black, 0.07) : alpha(theme.palette.common.white, 0.25),
    },
  },
}));

const SideBar: React.FC<SideBarProps> = ({ userID, token }) => {
  const { pageTitle } = usePageTitle();
  const [modules, setModules] = useState<ModuleDto[]>([]);
  const [subModules, setSubModules] = useState<SubModuleDto[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [filterKeyword, setFilterKeyword] = useState<string>("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useCustomTheme();

  const handleSubModuleClick = (path: string) => {
    handleDrawerClose();
    navigate(path);
  };

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const drawer = document.querySelector(".MuiDrawer-root");
      if (drawer && !drawer.contains(event.target as Node)) {
        handleDrawerClose();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);

  useEffect(() => {
    const fetchNavigationData = async () => {
      if (token) {
        try {
          const modulesData = await moduleService.getActiveModules(
            userID ?? 0,
          );
          setModules(modulesData);
          const subModulesData = await moduleService.getActiveSubModules(
            userID ?? 0,
          );
          setSubModules(subModulesData);
        } catch (error) {
          console.error("Error fetching navigation data:", error);
          notifyError("Error fetching navigation data");
        }
      }
    };

    fetchNavigationData();
  }, [userID, token]);

  const toggleModule = (moduleId: number) => {
    setActiveModuleId(activeModuleId === moduleId ? null : moduleId);
  };

  const shouldDisplayModule = (module: ModuleDto) => {
    return (
      module.title.toLowerCase().includes(filterKeyword.toLowerCase()) ||
      subModules.some(
        (subModule) =>
          subModule.auGrpID === module.auGrpID &&
          subModule.title.toLowerCase().includes(filterKeyword.toLowerCase())
      )
    );
  };

  const filteredModules = modules.filter(shouldDisplayModule);

  const getFilteredSubModules = (module: ModuleDto) => {
    if (module.title.toLowerCase().includes(filterKeyword.toLowerCase())) {
      return subModules.filter(
        (subModule) => subModule.auGrpID === module.auGrpID
      );
    } else {
      return subModules.filter(
        (subModule) =>
          subModule.auGrpID === module.auGrpID &&
          subModule.title.toLowerCase().includes(filterKeyword.toLowerCase())
      );
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: open ? `calc(100% - ${drawerWidth}px)` : '100%',
          ml: open ? `${drawerWidth}px` : 0,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" noWrap component="div" fontWeight="bold">
            {pageTitle}
          </Typography>
          <Box flexGrow={1} />
          <MaterialUISwitch checked={isDarkMode} onChange={toggleTheme} />
          <ProfileMenu />
        </Toolbar>
      </AppBar>
      <StyledDrawer
        variant="persistent"
        anchor="left"
        open={open}
        onClose={handleDrawerClose}
      >
        <Box sx={{ padding: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <SearchBox
            variant="outlined"
            size="small"
            fullWidth
            placeholder="Search"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            onChange={(e) => setFilterKeyword(e.target.value)}
            type="search"
          />
        </Box>
        <Divider />
        <List sx={{ pt: 1 }}>
          {filteredModules.map((module) => (
            <React.Fragment key={`module-${module.auGrpID}`}>
              <StyledListItemButton
                onClick={() => toggleModule(module.auGrpID)}
                selected={activeModuleId === module.auGrpID}
              >
                <ListItemIcon>
                  <Icon icon={module.iCon} style={{ fontSize: "24px", color: theme.palette.primary.main }} />
                </ListItemIcon>
                <ListItemText
                  primary={module.title}
                  primaryTypographyProps={{
                    fontWeight: activeModuleId === module.auGrpID ? 'bold' : 'normal',
                  }}
                />
              </StyledListItemButton>
              <Collapse
                in={activeModuleId === module.auGrpID}
                timeout="auto"
                unmountOnExit
              >
                <List component="div" disablePadding>
                  {getFilteredSubModules(module).map((subModule, index) => (
                    <StyledNavLink
                      to={subModule.link}
                      key={`subModule-${subModule.auGrpID}-${index}`}
                      className={({ isActive }) =>
                        isActive ? "active-submenu-item" : ""
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        handleSubModuleClick(subModule.link);
                      }}
                    >
                      <StyledListItemButton sx={{ pl: 4 }}>
                        <ListItemIcon>
                          <Icon
                            icon={subModule.iCon}
                            style={{ color: theme.palette.text.secondary }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={subModule.title}
                          primaryTypographyProps={{
                          }}
                        />
                      </StyledListItemButton>
                    </StyledNavLink>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </StyledDrawer>
    </Box>
  );
};

export default SideBar;