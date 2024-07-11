import React, { useCallback, useContext, useEffect, useState } from "react";
import CustomButton from "../../../../components/Button/CustomButton";
import CloseIcon from "@mui/icons-material/Close";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  Box,
  FormControlLabel,
} from "@mui/material";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import { debounce } from "../../../../utils/Common/debounceUtils";
import { ProfileListSearchContext } from "../../../../context/SecurityManagement/ProfileListSearchContext";
import { ProfileListSearchResult } from "../../../../interfaces/SecurityManagement/ProfileListData";
import EditIcon from "@mui/icons-material/Edit";
import CustomSwitch from "../../../../components/Checkbox/ColorSwitch";
import {
  notifySuccess,
  notifyError,
} from "../../../../utils/Common/toastManager";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import GlobalSpinner from "../../../../components/GlobalSpinner/GlobalSpinner";
import { ProfileService } from "../../../../services/SecurityManagementServices/ProfileListServices";

interface ProfileListSearchResultProps {
  show: boolean;
  handleClose: () => void;
  onEditProfile: (profile: ProfileListSearchResult) => void;
}

const ProfileListSearch: React.FC<ProfileListSearchResultProps> = ({
  show,
  handleClose,
  onEditProfile,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { performSearch, searchResults, updateProfileStatus } = useContext(
    ProfileListSearchContext
  );
  const [isLoading, setIsLoading] = useState(false);
  const { token, compID } = useSelector(
    (state: RootState) => state.userDetails
  );

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      setIsLoading(true);
      performSearch(searchQuery);
      setIsLoading(false);
    }, 300),
    [performSearch]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const handleEditAndClose = (profile: ProfileListSearchResult) => {
    onEditProfile(profile);
    handleClose();
  };

  const handleSwitchChange = async (
    profile: ProfileListSearchResult,
    checked: boolean
  ) => {
    const updatedStatus = checked ? "Active" : "Hidden";
    const profileMastDto = {
      ...profile,
      rActiveYN: checked ? "Y" : "N",
      compID: compID!,
    };

    try {
      const result = await ProfileService.saveOrUpdateProfile(
        token!,
        profileMastDto
      );
      if (result.success) {
        notifySuccess(`Profile status updated to ${updatedStatus}`);
        updateProfileStatus(profile.profileID, updatedStatus);
      } else {
        notifyError(`Error updating profile status: ${result.errorMessage}`);
      }
    } catch (error) {
      notifyError("Error updating profile status");
    }
  };

  // Create a new data array with an index starting at 1
  const dataWithIndex = searchResults.map((item, index) => ({
    ...item,
    serialNumber: index + 1,
  }));

  const columns = [
    {
      key: "PatientEdit",
      header: "Edit",
      visible: true,
      render: (row: ProfileListSearchResult) => (
        <CustomButton
          text="Edit"
          onClick={() => handleEditAndClose(row)}
          icon={EditIcon}
        />
      ),
    },
    { key: "serialNumber", header: "Sl.No", visible: true },
    { key: "profileCode", header: "Profile Code", visible: true },
    { key: "profileName", header: "Profile Name", visible: true },
    { key: "rNotes", header: "Notes", visible: true },
    {
      key: "status",
      header: "Status",
      visible: true,
      render: (row: ProfileListSearchResult) => (
        <Typography variant="body2">
          {row.status === "Hidden" ? "Hidden" : "Active"}
        </Typography>
      ),
    },
    {
      key: "profileStatus",
      header: "Profile Status",
      visible: true,
      render: (row: ProfileListSearchResult) => (
        <FormControlLabel
          control={
            <CustomSwitch
              size="medium"
              color="secondary"
              checked={row.status !== "Hidden"}
              onChange={(event) =>
                handleSwitchChange(row, event.target.checked)
              }
            />
          }
          label={row.status === "Hidden" ? "Hidden" : "Active"}
        />
      ),
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
            PROFILE SEARCH LIST
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent
        sx={{
          minHeight: "600px",
          maxHeight: "600px",
          overflowY: "auto",
        }}
      >
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} lg={4}>
              <FloatingLabelTextBox
                ControlID="SearchTerm"
                title="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter profile code or name"
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

export default ProfileListSearch;

// Create AnotherFielsds For AppId
// Write Service for gGetAllDetaila{Appid } in Service List
// then Add That to USerListAge
