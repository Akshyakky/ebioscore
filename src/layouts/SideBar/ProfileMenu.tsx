import React, { useState } from "react";
import { Menu, MenuItem, Divider, Box, Typography, Avatar, ListItemIcon, Tooltip, alpha, useTheme, Button, styled } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

import { useNavigate } from "react-router-dom";
import { handleError } from "@/services/CommonServices/HandlerError";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/features/auth/selectors";
import AuthService from "@/services/AuthService/AuthService";
import { logout } from "@/store/features/auth/authSlice";
import { notifyError, notifySuccess } from "@/utils/Common/toastManager";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";

// Enhanced styled components for better visual
const ProfileButton = styled(Button)(({ theme }) => ({
  borderRadius: 28,
  padding: theme.spacing(1, 2),
  textTransform: "none",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: alpha(theme.palette.warning.light, 0.15),
  },
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 34,
  height: 34,
  backgroundColor: theme.palette.warning.main,
  fontSize: "1rem",
  fontWeight: 600,
  marginRight: theme.spacing(1),
  border: `2px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[1],
}));

const ProfileCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(1),
}));

const LargeAvatar = styled(Avatar)(({ theme }) => ({
  width: 64,
  height: 64,
  backgroundColor: theme.palette.warning.main,
  fontSize: "1.5rem",
  fontWeight: 600,
  marginBottom: theme.spacing(1),
  border: `3px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[2],
}));

const MenuItemWithIcon = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  borderRadius: 4,
  margin: theme.spacing(0.5, 1),
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
}));

const ProfileMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  const open = Boolean(anchorEl);

  // Get user's initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "U";
    const nameParts = name.split(" ");
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Modified to show confirmation dialog instead of direct logout
  const handleLogoutClick = () => {
    handleClose(); // Close the menu
    setLogoutDialogOpen(true); // Open the confirmation dialog
  };

  // Cancel logout
  const handleCancelLogout = () => {
    setLogoutDialogOpen(false);
  };

  // Confirmed logout
  const handleConfirmLogout = async () => {
    if (user?.token) {
      try {
        const result = await AuthService.logout(user.token);
        if (result.message) {
          dispatch(logout());
          notifySuccess("Logged out successfully");
          navigate("/login");
        } else {
          notifyError(result.errorMessage || "Logout failed");
        }
      } catch (error) {
        const errorResult = handleError(error);
        console.error("Logout failed:", errorResult.errorMessage);
        notifyError(errorResult.errorMessage || "");
      }
    }
  };

  const handleDashboard = () => {
    navigate("/dashboard");
    handleClose();
  };

  const handleProfile = () => {
    // Navigate to user profile page if available
    handleClose();
  };

  const handleSettings = () => {
    // Navigate to settings page
    handleClose();
  };

  return (
    <div>
      <Tooltip title="Account settings">
        <ProfileButton
          variant="text"
          color="warning"
          onClick={handleClick}
          endIcon={<UserAvatar>{getInitials(user?.userName || "")}</UserAvatar>}
          aria-controls={open ? "profile-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              maxWidth: 120,
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              display: { xs: "none", sm: "block" },
            }}
          >
            {user?.userName || "User"}
          </Typography>
        </ProfileButton>
      </Tooltip>

      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: "260px",
            mt: 1.5,
            borderRadius: 2,
            boxShadow: theme.shadows[3],
            "& .MuiList-root": {
              padding: theme.spacing(1, 0),
            },
          },
        }}
      >
        <ProfileCard>
          <LargeAvatar>{getInitials(user?.userName || "")}</LargeAvatar>
          <Typography variant="subtitle1" fontWeight={600}>
            {user?.userName || "User"}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              color: "primary.main",
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              padding: "2px 8px",
              borderRadius: 10,
              fontWeight: 500,
            }}
          >
            {/* {user?.userRole || "User"} */}
          </Typography>
        </ProfileCard>

        <MenuItemWithIcon onClick={handleDashboard}>
          <ListItemIcon>
            <HomeIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <Typography variant="body2">Dashboard</Typography>
        </MenuItemWithIcon>

        <MenuItemWithIcon onClick={handleProfile}>
          <ListItemIcon>
            <PersonIcon fontSize="small" color="info" />
          </ListItemIcon>
          <Typography variant="body2">My Profile</Typography>
        </MenuItemWithIcon>

        <MenuItemWithIcon onClick={handleClose}>
          <ListItemIcon>
            <NotificationsIcon fontSize="small" color="warning" />
          </ListItemIcon>
          <Typography variant="body2">Notifications</Typography>
          <Box
            sx={{
              ml: 1,
              backgroundColor: theme.palette.error.main,
              color: theme.palette.error.contrastText,
              borderRadius: "50%",
              width: 20,
              height: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: "bold",
            }}
          >
            3
          </Box>
        </MenuItemWithIcon>

        <MenuItemWithIcon onClick={handleSettings}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" color="action" />
          </ListItemIcon>
          <Typography variant="body2">Settings</Typography>
        </MenuItemWithIcon>

        <MenuItemWithIcon onClick={handleClose}>
          <ListItemIcon>
            <HelpOutlineIcon fontSize="small" color="disabled" />
          </ListItemIcon>
          <Typography variant="body2">Help & Support</Typography>
        </MenuItemWithIcon>

        <Divider sx={{ my: 1 }} />

        <MenuItemWithIcon
          onClick={handleLogoutClick}
          sx={{
            color: theme.palette.error.main,
            "&:hover": {
              backgroundColor: alpha(theme.palette.error.main, 0.04),
            },
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <Typography variant="body2">Logout</Typography>
        </MenuItemWithIcon>
      </Menu>

      {/* Logout Confirmation Dialog using ConfirmationDialog component */}
      <ConfirmationDialog
        open={logoutDialogOpen}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out? Any unsaved changes will be lost."
        confirmText="Logout"
        cancelText="Cancel"
        type="error"
        maxWidth="sm"
      />
    </div>
  );
};

export default ProfileMenu;
