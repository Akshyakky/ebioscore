import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import moduleService from "../../services/CommonService/ModuleService";
import { ModuleDto, SubModuleDto } from "../../interfaces/Common/Modules";
import {
  Drawer,
  List,
  ListItem,
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
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Icon } from "@iconify/react";
import "./SideBar.css";
import { usePageTitle } from "../../hooks/usePageTitle";
import ProfileMenu from "./ProfileMenu";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";

interface SideBarProps {
  userID: number | null;
  token: string | null;
}
const drawerWidth = 340;
const SideBar: React.FC<SideBarProps> = ({ userID, token }) => {
  usePageTitle();
  const [modules, setModules] = useState<ModuleDto[]>([]);
  const [subModules, setSubModules] = useState<SubModuleDto[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [filterKeyword, setFilterKeyword] = useState<string>("");
  const { pageTitle } = usePageTitle();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubModuleClick = (path: any) => {
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
        const modulesData = await moduleService.getActiveModules(
          userID ?? 0,
          token
        );
        setModules(modulesData);
        const subModulesData = await moduleService.getActiveSubModules(
          userID ?? 0,
          token
        );
        setSubModules(subModulesData);
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
  const openDrawerStyle = {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.leavingScreen,
    }),
  };

  const closedDrawerStyle = {
    width: `100%`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  };
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          ...(open ? openDrawerStyle : closedDrawerStyle),
          zIndex: (theme) => theme.zIndex.drawer + 1,
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
            {open ? <CloseIcon /> : <MenuIcon />} {/* Here is the change */}
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {pageTitle}
          </Typography>
          <Box flexGrow={1} />
          <ProfileMenu />
        </Toolbar>
      </AppBar>
      <Drawer
        variant="persistent"
        anchor="left"
        open={open}
        onClose={handleDrawerClose}
        sx={{
          "& .MuiDrawer-paper": { boxSizing: "border-box" },
        }}
      >
        {/* <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: (theme) => theme.spacing(0, 1),
            // necessary for content to be below app bar
            ...theme.mixins.toolbar,
          }}
        >
          <Typography variant="h6" noWrap>
            eBios Core
          </Typography>
          <IconButton onClick={handleDrawerClose}>
            <CloseIcon />
          </IconButton>
        </Toolbar> 
        <Divider />*/}
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
          />
        </Box>
        <Divider />
        <div className="drawer-content">
          <List>
            {filteredModules.map((module) => (
              <React.Fragment key={"module-" + module.auGrpID}>
                <ListItem
                  button
                  onClick={() => toggleModule(module.auGrpID)}
                  className={
                    activeModuleId === module.auGrpID ? "active-menu-item" : ""
                  }
                >
                  <ListItemIcon className="list-item-icon">
                    <Icon icon={module.iCon} />
                  </ListItemIcon>
                  <ListItemText primary={module.title} />
                </ListItem>
                <Collapse
                  in={activeModuleId === module.auGrpID}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {getFilteredSubModules(module).map((subModule, index) => (
                      <NavLink
                        to={subModule.link}
                        key={`subModule-${subModule.auGrpID}-${index}`}
                        className={({ isActive }) =>
                          isActive
                            ? "active-submenu-item NavLink-submenu"
                            : "NavLink-submenu"
                        }
                        // onClick={handleDrawerClose}
                        onClick={(e) => {
                          e.preventDefault(); // Prevent default anchor behavior
                          handleSubModuleClick(subModule.link); // Navigate programmatically
                        }}
                      >
                        <ListItem button sx={{ pl: 2 }}>
                          <ListItemIcon className="list-item-icon">
                            <Icon icon={subModule.iCon} />
                          </ListItemIcon>
                          <ListItemText primary={subModule.title} />
                        </ListItem>
                      </NavLink>
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            ))}
          </List>
        </div>
      </Drawer>
    </Box>
  );
};

export default SideBar;
