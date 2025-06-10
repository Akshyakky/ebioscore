import React, { useState } from "react";
import { Menu, MenuItem, Divider, Box, Typography, Avatar, ListItemIcon, Tooltip, Button } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/features/auth/selectors";
import AuthService from "@/services/AuthService/AuthService";
import { logout } from "@/store/features/auth/authSlice";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import { useAlert } from "@/providers/AlertProvider";

const ProfileMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

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

  const handleLogoutClick = () => {
    handleClose();
    setLogoutDialogOpen(true);
  };

  const handleCancelLogout = () => {
    setLogoutDialogOpen(false);
  };

  const handleConfirmLogout = async () => {
    if (user?.token) {
      try {
        const result = await AuthService.logout(user.token);
        if (result.message) {
          dispatch(logout());
          navigate("/login");
        } else {
        }
      } catch (error) {}
    }
  };

  const handleDashboard = () => {
    navigate("/dashboard");
    handleClose();
  };

  const handleProfile = () => {
    handleClose();
  };

  const handleSettings = () => {
    handleClose();
  };

  return (
    <div>
      <Tooltip title="Account settings">
        <Button
          variant="text"
          color="warning"
          onClick={handleClick}
          sx={{
            borderRadius: 28,
            px: 2,
            py: 1,
            textTransform: "none",
          }}
          endIcon={
            <Avatar
              sx={{
                width: 34,
                height: 34,
                ml: 1,
                bgcolor: "warning.main",
                color: "warning.contrastText",
              }}
            >
              {getInitials(user?.userName || "")}
            </Avatar>
          }
          aria-controls={open ? "profile-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <Typography
            variant="body2"
            fontWeight="medium"
            sx={{
              maxWidth: 120,
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              display: { xs: "none", sm: "block" },
            }}
          >
            {user?.userName || "User"}
          </Typography>
        </Button>
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
          },
        }}
      >
        {/* Profile header */}
        <Box p={2} display="flex" flexDirection="column" alignItems="center" borderBottom={1} borderColor="divider" mb={1}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              mb: 1,
              bgcolor: "warning.main",
              color: "warning.contrastText",
            }}
          >
            {getInitials(user?.userName || "")}
          </Avatar>
          <Typography variant="subtitle1" fontWeight={600}>
            {user?.userName || "User"}
          </Typography>
        </Box>

        <MenuItem onClick={handleDashboard} sx={{ m: 0.5, borderRadius: 1 }}>
          <ListItemIcon>
            <HomeIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <Typography variant="body2">Dashboard</Typography>
        </MenuItem>

        <MenuItem onClick={handleProfile} sx={{ m: 0.5, borderRadius: 1 }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" color="info" />
          </ListItemIcon>
          <Typography variant="body2">My Profile</Typography>
        </MenuItem>

        <MenuItem onClick={handleClose} sx={{ m: 0.5, borderRadius: 1 }}>
          <ListItemIcon>
            <NotificationsIcon fontSize="small" color="warning" />
          </ListItemIcon>
          <Typography variant="body2">Notifications</Typography>
          <Box
            sx={{
              ml: 1,
              bgcolor: "error.main",
              color: "error.contrastText",
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
        </MenuItem>

        <MenuItem onClick={handleSettings} sx={{ m: 0.5, borderRadius: 1 }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" color="action" />
          </ListItemIcon>
          <Typography variant="body2">Settings</Typography>
        </MenuItem>

        <MenuItem onClick={handleClose} sx={{ m: 0.5, borderRadius: 1 }}>
          <ListItemIcon>
            <HelpOutlineIcon fontSize="small" color="disabled" />
          </ListItemIcon>
          <Typography variant="body2">Help & Support</Typography>
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <MenuItem
          onClick={handleLogoutClick}
          sx={{
            m: 0.5,
            borderRadius: 1,
            color: "error.main",
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <Typography variant="body2">Logout</Typography>
        </MenuItem>
      </Menu>

      {/* Logout Confirmation Dialog */}
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
