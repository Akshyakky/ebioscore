import React, { useState, useEffect } from "react";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  Typography,
  Switch,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
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
import { PatientRegistrationDto } from "../../../../interfaces/PatientAdministration/PatientFormData";

interface BreakListDetailsProps {
  breakData: BreakListData | null;
  onSave: (data: BreakListData) => void;
  onClear: () => void;
  isEditMode: boolean;
  setFormData: React.Dispatch<React.SetStateAction<PatientRegistrationDto>>;
  formattedEndDate: Date
}

const BreakListDetails: React.FC<BreakListDetailsProps> = ({
  breakData,
  onSave,
  onClear,
  formattedEndDate = new Date(), 

}) => {
  const [isSubmitted] = useState(false);
  const { token } = useSelector((state: RootState) => state.userDetails);
  const [resourceList, setResourceList] = useState<ResourceListData[]>([]);
  const [, setLoadingResources] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [selectAllPhysicians, setSelectAllPhysicians] = useState(false);
  const [showChangeFormDialog, setShowChangeFormDialog] = useState(false);
  const [isOneDay, setIsOneDay] = useState(false);
  const [physicianList, setPhysicianList] = useState<any[]>([]);
  const [, setLoadingPhysicians] = useState(false);
  const [selectedPhysicians, setSelectedPhysicians] = useState<number[]>([]);
  const [endDateState, setEndDateState] = useState<Date>(formattedEndDate);
  const [, setAnchorEl] = useState<null | HTMLElement>(null);
  const [, setAnchorElPhysician] = useState<null | HTMLElement>(null);
  const [, setSelectedResourceNames] = useState<string[]>([]);
const [, setSelectedPhysicianNames] = useState<string[]>([]);
const [, setSelectedResources] = useState<number[]>([]);





  const [breakListData, setBreakListData] = useState<BreakListData>({
    bLID: breakData?.bLID || 0,
    bLName: breakData?.bLName || "",
    bLStartTime: new Date(breakData?.bLStartTime || new Date()),
    bLEndTime: new Date(breakData?.bLEndTime || new Date()),
    bLStartDate: breakData?.bLStartDate ? new Date(breakData.bLStartDate) : new Date(),
    bLEndDate: breakData?.bLEndDate ? new Date(breakData.bLEndDate) : new Date(),
    bLFrqNo: breakData?.bLFrqNo || 0,
    bLFrqDesc: breakData?.bLFrqDesc || "",
    bLFrqWkDesc: breakData?.bLFrqWkDesc || "",
    bColor: breakData?.bColor || "",
    rActiveYN: breakData?.rActiveYN || "N",
    rCreatedID: breakData?.rCreatedID || 0,
    rCreatedBy: breakData?.rCreatedBy || "",
    rCreatedOn: new Date(breakData?.rCreatedOn || new Date()),
    rModifiedID: breakData?.rModifiedID || 0,
    rModifiedBy: breakData?.rModifiedBy || "",
    rModifiedOn: new Date(breakData?.rModifiedOn || new Date()),
    rNotes: breakData?.rNotes || "",
    isPhyResYN: breakData?.isPhyResYN ?? "N",
    compID: breakData?.compID || 0,
    compCode: breakData?.compCode || "",
    compName: breakData?.compName || "",
    transferYN: breakData?.transferYN || "N",
    resources: breakData?.resources || [],
    frequencyDetails: breakData?.frequencyDetails || "",
  });


  useEffect(() => {
    console.log("Received formattedEndDate:", formattedEndDate);
    if (formattedEndDate instanceof Date && !isNaN(formattedEndDate.getTime())) {
      setEndDateState(formattedEndDate);
    } else {
      console.error("Invalid formattedEndDate:", formattedEndDate);
    }
  }, [formattedEndDate]);
  



  useEffect(() => {
    if (breakListData.bLStartDate && endDateState <= breakListData.bLStartDate) {
 
    } else {
      setBreakListData(prev => ({
        ...prev,
        bLEndDate: endDateState,
      }));
    }
  }, [endDateState]);






  useEffect(() => {
    console.log("Updating breakListData with endDateState:", endDateState);
    setBreakListData(prev => ({
      ...prev,
      bLEndDate: endDateState,
    }));
  }, [endDateState]);

  


  const handleDateChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const parsedDate = parseDateStringToDate(event.target.value);
    if (parsedDate) {
      setEndDateState(parsedDate);
    } else {
      console.error("Invalid date format");
    }
  };




  const formatDateToTimeString = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };





  const parseTimeStringToDate = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };




  const formatDateToDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };



  
  const parseDateStringToDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };
  
  const handleSave = async () => {
    try {
      if (new Date(breakListData.bLEndDate) <= new Date(breakListData.bLStartDate)) {
        notifyError("End date must be greater than start date.");
        return;
      }

      const frequencyNumber = breakListData.bLFrqNo;
      if (frequencyNumber <= 0) {
        notifyError("Frequency number must be greater than 0.");
        return;
      }

      const details = breakListData.frequencyDetails;

      const result = await BreakListService.saveBreakList(token!, {
        ...breakListData,
        bLEndDate: breakListData.bLEndDate,
        bLFrqNo: frequencyNumber,
      });

      if (result.success) {
        if (result.data) {
          notifySuccess("Break list saved successfully");
          console.log("Saved details:", result.data);
          onSave(result.data);
        } else {
          notifyError("Failed to retrieve data after saving.");
          console.error("No data returned after save operation.");
        }
      } else {
        notifyError(result.errorMessage || "Failed to save break list");
        console.error("Error message:", result.errorMessage);
      }
    } catch (error) {
      notifyError("An unexpected error occurred");
      console.error("Unexpected error:", error);
    }
  };


  const handleClear = () => {
    onClear();
    setBreakListData({
      bLID: 0,
      bLName: "",
      bLStartTime: new Date(),
      bLEndTime: new Date(),
      bLStartDate: new Date(),
      bLEndDate: new Date(),
      bLFrqNo: 0,
      bLFrqDesc: "",
      bLFrqWkDesc: "",
      bColor: "",
      rActiveYN: "N",
      rCreatedID: 0,
      rCreatedBy: "",
      rCreatedOn: new Date(),
      rModifiedID: 0,
      rModifiedBy: "",
      rModifiedOn: new Date(),
      rNotes: "",
      isPhyResYN: "N",
      compID: 0,
      compCode: "",
      compName: "",
      transferYN: "N",
      resources: [],
      frequencyDetails: "",
    });
  };



  const handleChangeFormToggle = () => {
    setShowChangeFormDialog(!showChangeFormDialog);
  };



  const handleSaveChanges = (details: string) => {
    setBreakListData({
      ...breakListData,
      frequencyDetails: details,
    });
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
          breakListData.compID || 0
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




   useEffect(() => {
    fetchResources();
  }, [token]);




  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const newValue = value as "Y" | "N";
    console.log("Selected Radio Button Value:", newValue); 

    setBreakListData(prev => ({
      ...prev,
      isPhyResYN: newValue,
      resources: newValue === "N" ? [] : prev.resources, 
    }));

    if (newValue === "Y") {
      // Show resources selection
      setAnchorElPhysician(null);
      setAnchorEl(event.currentTarget);
      setSelectedPhysicianNames([]);
      setSelectedPhysicians([]);
    } else if (newValue === "N") {
      // Show physician selection
      setAnchorEl(event.currentTarget);
      setAnchorElPhysician(null);
      setSelectedResourceNames([]);
      setSelectedResources([]);
    }
  };

  
  




  useEffect(() => {
    setBreakListData((prev) => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999); 

      return {
        ...prev,
        bLStartTime: isOneDay ? startOfDay : prev.bLStartTime,
        bLEndTime: isOneDay ? endOfDay : prev.bLEndTime,
      };
    });
  }, [isOneDay]);





  const handleSelectAllChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = event.target.checked;
    setSelectAll(newValue);

    setBreakListData((prev) => {
      const updatedResources = newValue
        ? resourceList.map((resource) => ({
          id: resource.rLID,
          value: resource.rLID,
          name: resource.rLName,
        }))
        : [];

      return { ...prev, resources: updatedResources };
    });
  };




 const handleResourceCheckboxChange = (
    resourceID: number,
    checked: boolean
  ) => {
    setBreakListData(prev => {
      const updatedResources = checked
        ? [...prev.resources, { id: resourceID, value: resourceID, name: "" }]
        : prev.resources.filter(res => res.id !== resourceID);

      // Update the selected resource names
      const updatedResourceNames = resourceList
        .filter(resource => updatedResources.some(r => r.id === resource.rLID))
        .map(resource => resource.rLName);

      setSelectedResourceNames(updatedResourceNames);

      return { ...prev, resources: updatedResources };
    });
  };




  const handleSelectAllPhysiciansChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = event.target.checked;
    setSelectAllPhysicians(newValue);

    setSelectedPhysicians(
      newValue ? physicianList.map((physician) => physician.value) : []
    );
  };





  const handlePhysicianCheckboxChange = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedPhysicians((prev) => [...prev, id]);
    } else {
      setSelectedPhysicians((prev) =>
        prev.filter((physicianId) => physicianId !== id)
      );
    }
  
    // Update the selected physician names
    const updatedPhysicianNames = physicianList
      .filter((physician) => selectedPhysicians.includes(physician.value))
      .map((physician) => physician.label);
  
    setSelectedPhysicianNames(updatedPhysicianNames);
  };





  const handleOneDayToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsOneDay(event.target.checked);
  };







  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Typography variant="h6" id="break-list-details-header">
        BREAK LIST DETAILS
      </Typography>

   
      <section>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <RadioGroup
                row
                value={breakListData.isPhyResYN}
                onChange={handleRadioChange}
              >
                <FormControlLabel
                  value="Y"
                  control={<Radio />}
                  label="Resources"
                />
                <FormControlLabel
                  value="N"
                  control={<Radio />}
                  label="Physicians"
                />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          {breakListData.isPhyResYN === "Y" && (
            <Grid item xs={12}>
              <TableContainer
                component={Paper}
                sx={{
                  maxHeight: 250,
                  maxWidth: "30%",
                  overflow: "auto",
                  mb: 4,
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)", 
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#003366" }}>
                      <TableCell>
                        <Checkbox
                          checked={selectAll}
                          onChange={handleSelectAllChange}
                          sx={{ ml: -1 }}
                        />
                        Select All
                      </TableCell>
                      <TableCell>Resource Name</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {resourceList.map((resource) => (
                      <TableRow
                        key={resource.rLID}
                        sx={{
                          backgroundColor: "#ffffff", 
                          "&:hover": {
                            backgroundColor: "#003366", 
                            "& td": {
                              color: "#f0f0f0", 
                            },
                          },
                          "& td": {
                            color: "#000000", 
                            padding: "3px 6px",
                          },
                        }}
                      >
                        <TableCell>
                          <Checkbox
                            checked={breakListData.resources.some(
                              (res) => res.id === resource.rLID
                            )}
                            onChange={(e) =>
                              handleResourceCheckboxChange(
                                resource.rLID,
                                e.target.checked
                              )
                            }
                            sx={{
                              "&.Mui-checked": {
                                color: "#4CAF50", 
                                padding: "4px 8px",
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ "& th": { padding: "4px 8px" } }}>
                          {resource.rLName}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}

          {breakListData.isPhyResYN === "N" && (
            <Grid item xs={12}>
              <TableContainer
                component={Paper}
                sx={{
                  maxHeight: 200,
                  maxWidth: "30%",
                  overflow: "auto",
                  mb: 3,
                  boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.4)",
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Checkbox
                          checked={selectAllPhysicians}
                          onChange={handleSelectAllPhysiciansChange}
                          sx={{ ml: -1 }}
                        />
                        Select All
                      </TableCell>
                      <TableCell>Physician Name</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {physicianList.map((physician) => (
                      <TableRow
                        key={physician.value}
                        sx={{
                          backgroundColor: "#ffffff", 
                          "&:hover": {
                            backgroundColor: "#003366", 
                            "& td": {
                              color: "#f0f0f0", 
                            },
                          },
                          "& td": {
                            color: "#000000", 
                            padding: "3px 6px",
                          },
                        }}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedPhysicians.includes(
                              physician.value
                            )}
                            onChange={(e) =>
                              handlePhysicianCheckboxChange(
                                physician.value,
                                e.target.checked
                              )
                            }
                            sx={{
                              "&.Mui-checked": {
                                color: "#4CAF50", // Medium Green for checked state
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell>{physician.label}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}
        </Grid>
      </section>

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
              title="Start Time"
              size="small"
              type="time"
              value={formatDateToTimeString(breakListData.bLStartTime)}
              onChange={(e) =>
                setBreakListData({
                  ...breakListData,
                  bLStartTime: parseTimeStringToDate(e.target.value),
                })
              }
              ControlID={"start-time-control"}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FloatingLabelTextBox
              title="End Time"
              size="small"
              type="time"
              value={formatDateToTimeString(breakListData.bLEndTime)}
              onChange={(e) =>
                setBreakListData({
                  ...breakListData,
                  bLEndTime: parseTimeStringToDate(e.target.value),
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
                title="Start Date"
                size="small"
                type="date"
                value={formatDateToDateString(breakListData.bLStartDate)}
                onChange={(e) => {
                  const date = parseDateStringToDate(e.target.value);
                  setBreakListData({ ...breakListData, bLStartDate: date });
                }}
                ControlID={""}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3} ml={2}>
              <TextArea
                label="Description"
                name="bLFrqWkDesc"
                value={breakListData.bLFrqDesc || ""}
                onChange={(e) =>
                  setBreakListData({
                    ...breakListData,
                    bLFrqDesc: e.target.value,
                  })
                }
                placeholder="Enter description"
                rows={2}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextArea
                name="frequencyDetails"
                label="Repeat"
                value={breakListData.frequencyDetails}
                onChange={handleDateChange}
                placeholder="Repeat"
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

      {/* </Grid> */}
      <Grid container spacing={2} justifyContent="flex-end">
        <Grid item>
          <FormSaveClearButton
            onSave={handleSave}
            onClear={handleClear}
            clearText="Clear"
            saveText="Save"
          />
        </Grid>
      </Grid>

      
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
        startDate={formatDateToDateString(breakListData.bLStartDate)}
        bLFrqNo={breakListData.bLFrqNo}
      />
    </Paper>
  );
};

export default BreakListDetails;


