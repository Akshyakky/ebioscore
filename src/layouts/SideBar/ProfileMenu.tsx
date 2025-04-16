import React, { useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { handleError } from "@/services/CommonServices/HandlerError";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/features/auth/selectors";
import AuthService from "@/services/AuthService/AuthService";
import { logout } from "@/store/features/auth/authSlice";
import { notifyError, notifySuccess } from "@/utils/Common/toastManager";
import CustomButton from "@/components/Button/CustomButton";

const ProfileMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    if (user.token) {
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
      } finally {
        handleClose();
      }
    }
  };

  return (
    <div>
      <CustomButton
        icon={AccountCircleIcon}
        text={user.userName || ""}
        onClick={handleClick}
        color="warning"
        aria-controls={Boolean(anchorEl) ? "profile-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={Boolean(anchorEl) ? "true" : undefined}
      />
      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
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
            minWidth: "200px",
          },
        }}
      >
        <MenuItem onClick={handleClose}>
          <CustomButton icon={SettingsIcon} text="Settings" color="inherit" variant="text" sx={{ justifyContent: "flex-start" }} />
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <CustomButton icon={LogoutIcon} text="Logout" color="inherit" variant="text" sx={{ justifyContent: "flex-start" }} />
        </MenuItem>
      </Menu>
    </div>
  );
};

export default ProfileMenu;
