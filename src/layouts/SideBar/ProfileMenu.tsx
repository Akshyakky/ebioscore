import React, { useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import CustomButton from "../../components/Button/CustomButton";
import { RootState } from "../../store/reducers";
import { useDispatch, useSelector } from "react-redux";
import AuthService from "../../services/AuthService/AuthService";
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/actionCreators";

const ProfileMenu = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const userInfo = useSelector((state: RootState) => state.userDetails);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    if (userInfo.token) {
      try {
        const response = await AuthService.logout(userInfo.token);
        console.log(response.Message);
        dispatch(logout());
        navigate("/login");
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
  };

  return (
    <div>
      <CustomButton
        icon={AccountCircleIcon}
        text={userInfo.userName ?? ""}
        onClick={handleClick}
        color="warning"
      />
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleClose}>
          <CustomButton
            icon={SettingsIcon}
            text="Settings"
            color="inherit"
            variant="text"
          />
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <CustomButton
            icon={LogoutIcon}
            text="Logout"
            color="inherit"
            variant="text"
          />
        </MenuItem>
      </Menu>
    </div>
  );
};

export default ProfileMenu;
