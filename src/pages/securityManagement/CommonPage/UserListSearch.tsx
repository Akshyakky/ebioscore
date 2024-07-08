import React, { useCallback, useContext, useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  Box,
} from "@mui/material";
import { UserListData } from "../../../interfaces/SecurityManagement/UserListData";
import { UserListSearchContext } from "../../../context/SecurityManagement/UserListSearchContext";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/reducers";
import { debounce } from "../../../utils/Common/debounceUtils";
import { notifyError, notifySuccess } from "../../../utils/Common/toastManager";
import CustomButton from "../../../components/Button/CustomButton";
import CustomSwitch from "../../../components/Checkbox/ColorSwitch";
import FloatingLabelTextBox from "../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import GlobalSpinner from "../../../components/GlobalSpinner/GlobalSpinner";
import CustomGrid from "../../../components/CustomGrid/CustomGrid";
import EditIcon from "@mui/icons-material/Edit";
import { UserListService } from "../../../services/SecurityManagementServices/UserListService";

interface UserListSearchResultProps {
  show: boolean;
  handleClose: () => void;
  onEditProfile: (profile: UserListData) => void;
}

const UserListSearch: React.FC<UserListSearchResultProps> = ({
  show,
  handleClose,
  onEditProfile,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { performSearch, searchResults, updateUserStatus } = useContext(
    UserListSearchContext
  );
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useSelector((state: RootState) => state.userDetails);

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      setIsLoading(true);
      performSearch(searchQuery).finally(() => {
        setIsLoading(false);
      });
    }, 300),
    [performSearch]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const handleEditAndClose = (profile: UserListData) => {
    onEditProfile(profile);
    handleClose();
  };

  const handleSwitchChange = async (
    profile: UserListData,
    checked: boolean
  ) => {
    try {
      console.log("Profile data:", profile);

      if (!profile.appID) {
        console.error("Profile appID is undefined or null.");
        return;
      }

      const updatedStatus = checked;
      const result = await UserListService.updateUserActiveStatus(
        token!,
        profile.appID,
        checked
      );

      if (result.success) {
        notifySuccess(
          `User status updated to ${
            updatedStatus === true ? "Active" : "Hidden"
          }`
        );
        updateUserStatus(profile.appID, checked);
      } else {
        notifyError(`Error updating user status: ${result.errorMessage}`);
      }
    } catch (error) {
      notifyError("Error updating user status");
      console.error("Error:", error);
    }
  };

  const dataWithIndex = searchResults.map((item, index) => ({
    ...item,
    serialNumber: index + 1,
  }));

  const columns = [
    {
      key: "UserEdit",
      header: "Edit",
      visible: true,
      render: (row: UserListData) => (
        <CustomButton
          text="Edit"
          onClick={() => handleEditAndClose(row)}
          icon={EditIcon}
        />
      ),
    },
    { key: "serialNumber", header: "Sl.No", visible: true },
    { key: "fullName", header: "User Name", visible: true },
    { key: "loginName", header: "Login Name", visible: true },
    { key: "rNotes", header: "Notes", visible: true },
    {
      key: "status",
      header: "Status",
      visible: true,
      render: (row: UserListData) => (
        <Typography variant="body2">
          {row.rActiveYN === "N" ? "Hidden" : "Active"}
        </Typography>
      ),
    },
    {
      key: "userStatus",
      header: "User Status",
      visible: true,
      render: (row: UserListData) => (
        <CustomSwitch
          size="medium"
          color="secondary"
          checked={row.rActiveYN === "Y"}
          onChange={(event) => handleSwitchChange(row, event.target.checked)}
        />
      ),
    },
    {
      key: "appID",
      header: "App ID",
      visible: false,
    },
  ];

  const handleDialogClose = () => {
    setSearchTerm("");
    handleClose();
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setSearchTerm("");
    }
  };

  return (
    <Dialog
      open={show}
      onClose={(event, reason) => {
        if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
          handleDialogClose();
        }
      }}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box>
          <Typography variant="h6" id="personal-details-header">
            USER SEARCH LIST
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent
        sx={{ minHeight: "600px", maxHeight: "600px", overflowY: "auto" }}
      >
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} lg={4}>
              <FloatingLabelTextBox
                ControlID="SearchTerm"
                title="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter user name or login name"
                size="small"
                autoComplete="off"
                onKeyPress={handleKeyPress}
              />
            </Grid>
          </Grid>
        </Box>
        {isLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="500px"
          >
            <GlobalSpinner />
          </Box>
        ) : (
          <CustomGrid
            columns={columns}
            data={dataWithIndex}
            minHeight="500px"
            maxHeight="500px"
          />
        )}
      </DialogContent>
      <DialogActions>
        <CustomButton
          variant="contained"
          text="Close"
          icon={CloseIcon}
          size="medium"
          onClick={handleDialogClose}
          color="secondary"
        />
      </DialogActions>
    </Dialog>
  );
};

export default UserListSearch;
