import React from "react";
import { Box, Tab, Tabs, Button, styled, useMediaQuery, useTheme, IconButton, Menu, MenuItem } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

interface NavBarButton {
  label: string;
  value?: string;
  onClick: () => void;
  icon?: React.ReactNode;
  color?: string;
  isDirectAction?: boolean;
}

interface NavBarProps {
  buttons: NavBarButton[];
  activeView?: string;
  sx?: object;
}

// Custom styled components for better visual appeal
const StyledTabs = styled(Tabs)(({ theme }) => ({
  minHeight: "48px",
  "& .MuiTabs-indicator": {
    backgroundColor: theme.palette.primary.main,
    height: 3,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  minWidth: 0,
  padding: "12px 16px",
  fontWeight: 500,
  color: theme.palette.text.secondary,
  "&.Mui-selected": {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
  "&:hover": {
    color: theme.palette.primary.main,
    opacity: 0.8,
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  borderRadius: "4px",
  padding: "6px 12px",
  fontWeight: 500,
  boxShadow: "none",
  "&:hover": {
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  },
}));

const NavBar: React.FC<NavBarProps> = ({ buttons, activeView, sx }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleChange = (_event: React.SyntheticEvent, _newValue: string) => {
    // Handled by onClick in the buttons array
  };

  const handleOpenMobileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleCloseMobileMenu = () => {
    setMobileMenuAnchorEl(null);
  };

  // Separate nav tabs from action buttons
  const navTabs = buttons.filter((btn) => !btn.isDirectAction);
  const actionButtons = buttons.filter((btn) => btn.isDirectAction);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        borderBottom: "1px solid",
        borderColor: "divider",
        mb: 2,
        ...sx,
      }}
    >
      {/* Desktop view */}
      {!isMobile ? (
        <>
          <StyledTabs value={activeView || false} onChange={handleChange} aria-label="navigation tabs" variant="scrollable" scrollButtons="auto">
            {navTabs.map((tab, index) => (
              <StyledTab
                key={index}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {tab.icon}
                    {tab.label}
                  </Box>
                }
                value={tab.value}
                onClick={tab.onClick}
                sx={{ minHeight: "48px" }}
              />
            ))}
          </StyledTabs>

          <Box sx={{ display: "flex", gap: 1, my: { xs: 1, sm: 0 } }}>
            {actionButtons.map((btn, index) => (
              <ActionButton key={index} variant="contained" color="primary" startIcon={btn.icon} onClick={btn.onClick} size="small">
                {btn.label}
              </ActionButton>
            ))}
          </Box>
        </>
      ) : (
        // Mobile view
        <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <StyledTabs value={activeView || false} onChange={handleChange} aria-label="navigation tabs" variant="scrollable" scrollButtons="auto" sx={{ flexGrow: 1 }}>
            {navTabs.slice(0, 2).map((tab, index) => (
              <StyledTab
                key={index}
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    {tab.icon}
                    <Box sx={{ display: { xs: "none", sm: "block" }, ml: 1 }}>{tab.label}</Box>
                  </Box>
                }
                value={tab.value}
                onClick={tab.onClick}
              />
            ))}
          </StyledTabs>

          {(navTabs.length > 2 || actionButtons.length > 0) && (
            <>
              <IconButton color="primary" aria-label="more menu" onClick={handleOpenMobileMenu} edge="end">
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={mobileMenuAnchorEl}
                open={Boolean(mobileMenuAnchorEl)}
                onClose={handleCloseMobileMenu}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                {navTabs.slice(2).map((tab, index) => (
                  <MenuItem
                    key={`nav-${index}`}
                    onClick={() => {
                      tab.onClick();
                      handleCloseMobileMenu();
                    }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      color: activeView === tab.value ? "primary.main" : "inherit",
                    }}
                  >
                    {tab.icon}
                    {tab.label}
                  </MenuItem>
                ))}
                {actionButtons.map((btn, index) => (
                  <MenuItem
                    key={`action-${index}`}
                    onClick={() => {
                      btn.onClick();
                      handleCloseMobileMenu();
                    }}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    {btn.icon}
                    {btn.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default NavBar;
