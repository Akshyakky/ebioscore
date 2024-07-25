import React, { useState, useEffect } from "react";
import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  Typography,
  Button,
  TextField,
  Switch,
} from "@mui/material";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import {
  notifySuccess,
  notifyError,
} from "../../../../utils/Common/toastManager";
import TextArea from "../../../../components/TextArea/TextArea";
import { BreakListData } from "../../../../interfaces/frontOffice/BreakListData";
import { ResourceListData } from "../../../../interfaces/frontOffice/ResourceListData";
import { ResourceListService } from "../../../../services/frontOffice/ResourceListServices";
import { RootState } from "../../../../store/reducers";
import { useSelector } from "react-redux";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import CustomButton from "../../../../components/Button/CustomButton";
import { BreakListService } from "../../../../services/frontOffice/BreakListService";
import ChangeFormDialog from "./FormChange";
import { ContactMastService } from "../../../../services/CommonServices/ContactMastService";
import CloseIcon from "@mui/icons-material/Close";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import { PatientRegistrationDto } from "../../../../interfaces/PatientAdministration/PatientFormData";

interface BreakListDetailsProps {
  breakData: BreakListData | null;
  onSave: (data: BreakListData) => void;
  onClear: () => void;
  isEditMode: boolean;
  setFormData: React.Dispatch<React.SetStateAction<PatientRegistrationDto>>;
}

const BreakListDetails: React.FC<BreakListDetailsProps> = ({
  breakData,
  onClear,
}) => {
  const [isSubmitted] = useState(false);
  const { token } = useSelector((state: RootState) => state.userDetails);
  const [resourceList, setResourceList] = useState<ResourceListData[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [bLStartDate] = useState(() => {
    // Set default date to today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];
    return today;
  });

  const [breakListData, setBreakListData] = useState<BreakListData>({
    bLID: breakData?.bLID || 0,
    bLName: breakData?.bLName || "",
    bLStartTime: breakData?.bLStartTime || "",
    bLEndTime: breakData?.bLEndTime || "",
    bLStartDate:
      breakData?.bLStartDate || new Date().toISOString().split("T")[0],
    bLEndDate: breakData?.bLEndDate || "",
    bLFrqNo: breakData?.bLFrqNo || 0,
    bLFrqDesc: breakData?.bLFrqDesc || "",
    bLFrqWkDesc: breakData?.bLFrqWkDesc || "",
    bColor: breakData?.bColor || "",
    rCreatedID: breakData?.rCreatedID || 0,
    rCreatedBy: breakData?.rCreatedBy || "",
    rCreatedOn: breakData?.rCreatedOn || "",
    rModifiedID: breakData?.rModifiedID || 0,
    rModifiedBy: breakData?.rModifiedBy || "",
    rModifiedOn: breakData?.rModifiedOn || "",
    rNotes: breakData?.rNotes || "",
    isPhyResYN: breakData?.isPhyResYN || "N",
    compID: breakData?.compID || 0,
    compCode: breakData?.compCode || "",
    compName: breakData?.compName || "",
    transferYN: breakData?.transferYN || "N",
    resources: breakData?.resources || [],
  });
  const [openResourceDialog, setOpenResourceDialog] = useState(false);
  const [showChangeFormDialog, setShowChangeFormDialog] = useState(false);
  const [isOneDay, setIsOneDay] = useState(false);
  const [physicianList, setPhysicianList] = useState<any[]>([]);
  const [loadingPhysicians, setLoadingPhysicians] = useState(false);
  const [openPhysicianDialog, setOpenPhysicianDialog] = useState(false);
  const [selectedPhysicians, setSelectedPhysicians] = useState<number[]>([]); // Assuming physician IDs are numbers
  // Add loading state for physicians

  const handleSave = async () => {
    console.log("Data being sent to API:", breakListData);
    try {
      const result = await BreakListService.saveBreakList(
        token!,
        breakListData
      );
      if (result.success) {
        notifySuccess("Break list saved successfully");
      } else {
        notifyError(result.errorMessage || "Error saving break list");
      }
    } catch (error: any) {
      console.error(
        "Error saving break list:",
        error.response?.data || error.message
      );
      notifyError("Error saving break list");
    }
  };

  const handleChangeFormToggle = () => {
    setShowChangeFormDialog(!showChangeFormDialog);
  };

  const handleSaveChanges = () => {
    // Implement save functionality here
    handleChangeFormToggle();
  };

  const fetchResources = async () => {
    setLoadingResources(true);
    try {
      const result = await ResourceListService.getAllResourceLists(token!);
      if (result.success) {
        setResourceList(result.data ?? []);
      } else {
        notifyError(result.errorMessage || "Failed to fetch resource list.");
      }
    } catch (error) {
      notifyError("An error occurred while fetching the resource list.");
    } finally {
      setLoadingResources(false);
    }
  };

  useEffect(() => {
    if (breakListData.isPhyResYN === "Y") {
      fetchResources();
    }
  }, [breakListData.isPhyResYN]);

  useEffect(() => {
    const fetchPhysicians = async () => {
      setLoadingPhysicians(true);
      try {
        const response = await ContactMastService.fetchAttendingPhysician(
          token,
          "GetActiveConsultants",
          breakListData.compID
        );
        const physicianOptions = response.map((item: any) => ({
          value: item.value,
          label: item.label,
        }));
        setPhysicianList(physicianOptions);
      } catch (error) {
        console.error("Failed to fetch physicians:", error);
      } finally {
        setLoadingPhysicians(false);
      }
    };

    fetchPhysicians();
  }, [token, breakListData.compID]);

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setBreakListData({
      ...breakListData,
      isPhyResYN: value,
      resources: [],
    });
    if (value === "Y") {
      setOpenResourceDialog(true);
    } else if (value === "P") {
      setOpenPhysicianDialog(true);
    }
  };

  useEffect(() => {
    if (isOneDay) {
      setBreakListData((prev) => ({
        ...prev,
        bLStartTime: "00:00",
        bLEndTime: "23:59",
      }));
    } else {
      setBreakListData((prev) => ({
        ...prev,
        bLStartTime: "",
        bLEndTime: "",
      }));
    }
  }, [isOneDay]);

  const handleResourceCheckboxChange = (
    resourceID: number,
    checked: boolean
  ) => {
    setBreakListData((prev) => {
      const newResources = checked
        ? [...prev.resources, resourceID]
        : prev.resources.filter((id) => id !== resourceID);
      return { ...prev, resources: newResources };
    });
  };

  const handlePhysicianCheckboxChange = (
    physicianId: number,
    checked: boolean
  ) => {
    setSelectedPhysicians((prev) =>
      checked ? [...prev, physicianId] : prev.filter((id) => id !== physicianId)
    );
  };

  const handleDialogClose = () => {
    setOpenResourceDialog(false);
    setBreakListData({ ...breakListData, isPhyResYN: "N" });
  };

  const handleOneDayToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsOneDay(event.target.checked);
  };
  const handlePhysicianDialogClose = () => {
    setOpenPhysicianDialog(false);
  };

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Typography variant="h6" id="break-list-details-header">
        BREAK LIST DETAILS
      </Typography>

      <section>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FloatingLabelTextBox
              title="Name"
              placeholder="Enter name"
              value={breakListData.bLName}
              onChange={(e) =>
                setBreakListData({ ...breakListData, bLName: e.target.value })
              }
              isMandatory
              size="small"
              isSubmitted={isSubmitted}
              name="bLName"
              ControlID=""
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FloatingLabelTextBox
              title="Start Time "
              size="small"
              type="time"
              value={breakListData.bLStartTime}
              onChange={(e) =>
                setBreakListData({
                  ...breakListData,
                  bLStartTime: e.target.value,
                })
              }
              ControlID={""}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FloatingLabelTextBox
              title="End  Time "
              size="small"
              type="time"
              value={breakListData.bLEndTime}
              onChange={(e) =>
                setBreakListData({
                  ...breakListData,
                  bLEndTime: e.target.value,
                })
              }
              ControlID={""}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3} mt={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={isOneDay}
                  onChange={handleOneDayToggle}
                  color="primary"
                />
              }
              label="One Day"
            />
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3} ml={2}>
              <FloatingLabelTextBox
                title="Start Date "
                size="small"
                type="date"
                value={breakListData.bLStartDate}
                onChange={(e) =>
                  setBreakListData({
                    ...breakListData,
                    bLStartDate: e.target.value,
                  })
                }
                ControlID={""}
              />
            </Grid>

            {/* <Grid item xs={12} md={6}>
              <FloatingLabelTextBox
                title="Break End Date"
                type="date"
                value={breakListData.bLEndDate}
                onChange={(e) =>
                  setBreakListData({
                    ...breakListData,
                    bLEndDate: e.target.value,
                  })
                }
                ControlID={""}
              />
            </Grid> */}
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3} ml={2}>
              <TextArea
                label="Description"
                name="bLFrqWkDesc"
                value={breakListData.bLFrqWkDesc}
                onChange={(e) =>
                  setBreakListData({
                    ...breakListData,
                    bLFrqWkDesc: e.target.value,
                  })
                }
                placeholder="Enter description"
                rows={2}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextArea
                label="Repeat"
                name="bLFrqDesc"
                value={breakListData.bLFrqDesc}
                onChange={(e) =>
                  setBreakListData({
                    ...breakListData,
                    bLFrqDesc: e.target.value,
                  })
                }
                placeholder="Enter repeat instructions"
                rows={2}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3} mt={4}>
              <CustomButton
                variant="contained"
                text="Change"
                icon={ChangeCircleIcon}
                size="small"
                onClick={handleChangeFormToggle}
                color="secondary"
              />
            </Grid>
          </Grid>
        </Grid>
      </section>

      <section>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <RadioGroup
                row
                aria-label="resource-or-physician"
                name="resource-or-physician"
                value={breakListData.isPhyResYN}
                onChange={handleRadioChange}
              >
                <FormControlLabel
                  value="Y"
                  control={<Radio />}
                  label="Resource"
                />
                <FormControlLabel
                  value="P"
                  control={<Radio />}
                  label="Physician"
                />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
      </section>

      {/* </Grid> */}
      <Grid container spacing={2} justifyContent="flex-end">
        <Grid item>
          <FormSaveClearButton
            onSave={handleSave}
            onClear={onClear}
            clearText="Clear"
            saveText="Save"
          />
        </Grid>
      </Grid>

      <Dialog open={openResourceDialog} onClose={handleDialogClose}>
        <DialogTitle>Select Resources</DialogTitle>
        <DialogContent>
          {loadingResources ? (
            <Typography>Loading resources...</Typography>
          ) : (
            <Grid container spacing={2}>
              {resourceList.map((resource) => (
                <Grid item xs={12} key={resource.rLID}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={breakListData.resources.includes(
                          resource.rLID
                        )}
                        onChange={(e) =>
                          handleResourceCheckboxChange(
                            resource.rLID,
                            e.target.checked
                          )
                        }
                      />
                    }
                    label={resource.rLName}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <CustomButton
            variant="contained"
            text="Close"
            icon={CloseIcon}
            size="medium"
            onClick={handleDialogClose}
            color="error"
          />
          <CustomButton
            variant="contained"
            text="Save"
            icon={SaveIcon}
            size="medium"
            onClick={handleDialogClose}
            color="success"
          />
        </DialogActions>
      </Dialog>

      {/* Physician Dialog */}
      <Dialog
        open={openPhysicianDialog}
        onClose={handlePhysicianDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Physician List</DialogTitle>
        <DialogContent>
          {loadingPhysicians ? (
            <Typography>Loading physicians...</Typography>
          ) : (
            <Grid container spacing={2}>
              {physicianList.map((physician) => (
                <Grid item xs={12} key={physician.value}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedPhysicians.includes(physician.value)}
                        onChange={(e) =>
                          handlePhysicianCheckboxChange(
                            physician.value,
                            e.target.checked
                          )
                        }
                      />
                    }
                    label={physician.label}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <CustomButton
            variant="contained"
            text="Close"
            icon={CloseIcon}
            size="medium"
            onClick={handlePhysicianDialogClose}
            color="error"
          />
          <CustomButton
            variant="contained"
            text="Save"
            icon={SaveIcon}
            size="medium"
            onClick={handleDialogClose}
            color="success"
          />
        </DialogActions>
      </Dialog>

      {/* Physician Dialog */}

      <section>
        <FormSaveClearButton
          onSave={handleSave}
          onClear={onClear}
          clearText="Clear"
          saveText="Save"
          saveIcon={SaveIcon}
          clearIcon={DeleteIcon}
        />
      </section>

      {/* Change Form Dialog */}
      <ChangeFormDialog
        open={showChangeFormDialog}
        onClose={handleChangeFormToggle}
        onSave={handleSaveChanges}
        startDate={bLStartDate}
      />
    </Paper>
  );
};

export default BreakListDetails;
