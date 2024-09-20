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
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
  },
}));

const StyledNavLink = styled(NavLink)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.text.primary,
  '&.active-submenu-item': {
    backgroundColor: theme.palette.action.selected,
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
          <Typography variant="h6" noWrap component="div">
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
        <Box sx={{ padding: 1 }}>
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            placeholder="Search"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            onChange={(e) => setFilterKeyword(e.target.value)}
            type="search"
          />
        </Box>
        <Divider />
        <List>
          {filteredModules.map((module) => (
            <React.Fragment key={`module-${module.auGrpID}`}>
              <ListItemButton
                onClick={() => toggleModule(module.auGrpID)}
                selected={activeModuleId === module.auGrpID}
              >
                <ListItemIcon>
                  <Icon icon={module.iCon} style={{ fontSize: "24px" }} />
                </ListItemIcon>
                <ListItemText primary={module.title} />
              </ListItemButton>
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
                      <ListItemButton sx={{ pl: 4 }}>
                        <ListItemIcon>
                          <Icon
                            icon={subModule.iCon}
                            style={{ fontSize: "20px" }}
                          />
                        </ListItemIcon>
                        <ListItemText primary={subModule.title} />
                      </ListItemButton>
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
