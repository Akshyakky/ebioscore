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
import { BreakListData } from "../../../../interfaces/FrontOffice/BreakListData";
import { ResourceListData } from "../../../../interfaces/FrontOffice/ResourceListData";
import { ResourceListService } from "../../../../services/FrontOfficeServices/ResourceListServices/ResourceListServices";
import { RootState } from "../../../../store/reducers";
import { useSelector } from "react-redux";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import CustomButton from "../../../../components/Button/CustomButton";
import { BreakListService } from "../../../../services/FrontOfficeServices/BreakListServices/BreakListService";
import ChangeFormDialog from "./FormChange";
import { ContactMastService } from "../../../../services/CommonServices/ContactMastService";
import { CompanyService } from "../../../../services/CommonServices/CompanyService";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import { BreakConDetailData } from "../../../../interfaces/FrontOffice/BreakConDetailsData";
import { BreakListConDetailsService } from "../../../../services/FrontOfficeServices/BreakListServices/BreakListConDetailService";

interface BreakListDetailsProps {
  frequencyNumber: number;
  breakData: BreakListData | null;
  breakConDetails: BreakConDetailData[] | null;
  onSave: (savedBreak: BreakListData) => void;
  onClear: () => void;
  isEditMode: boolean;
  setFormData: () => void;
  formattedEndDate: Date;
}
interface Company {
  compIDCompCode: string;
  compName: string;
}


const BreakListDetails: React.FC<BreakListDetailsProps> = ({
  breakData,
  breakConDetails,
  onSave,
  onClear,
  formattedEndDate,
  frequencyNumber,

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
  const [, setSelectedResourceNames] = useState<string[]>([]);
  const [, setSelectedPhysicianNames] = useState<string[]>([]);
  const [, setErrorMessage] = useState("");
  const [selectedResources, setSelectedResources] = useState<number[]>([]);
  const [, setSelectedCompany] = useState<Company | null>(null);
  const [, setDropdownValues] = useState({
    categoryOptions: [] as DropdownOption[],
    usersOptions: [] as DropdownOption[],
    companyOptions: [] as DropdownOption[],
    profileOptions: [] as DropdownOption[],
  });


  const [breakListData, setBreakListData] = useState<BreakListData>({
    bLID: breakData?.bLID || 0,
    bLName: breakData?.bLName || "",
    bLStartTime: new Date(breakData?.bLStartTime || new Date()),
    bLEndTime: new Date(breakData?.bLEndTime || new Date()),
    bLStartDate: breakData?.bLStartDate || new Date(),
    bLEndDate: breakData?.bLEndDate || new Date(),
    bLFrqNo: breakData?.bLFrqNo || 0,
    bLFrqDesc: breakData?.bLFrqDesc || "",
    bLFrqWkDesc: breakData?.bLFrqWkDesc || "",
    bColor: breakData?.bColor || "",
    rActiveYN: breakData?.rActiveYN || "Y",
    rCreatedID: breakData?.rCreatedID || 0,
    rCreatedBy: breakData?.rCreatedBy || "",
    rCreatedOn: new Date(breakData?.rCreatedOn || new Date()),
    rModifiedID: breakData?.rModifiedID || 0,
    rModifiedBy: breakData?.rModifiedBy || "",
    rModifiedOn: new Date(breakData?.rModifiedOn || new Date()),
    rNotes: breakData?.rNotes || "",
    isPhyResYN: breakData?.isPhyResYN || "Y",
    compID: breakData?.compID || 1,
    compCode: breakData?.compCode || "",
    compName: breakData?.compName || "",
    transferYN: breakData?.transferYN || "N",
    resources: breakData?.resources || "",
    frequencyDetails: breakData?.frequencyDetails || "",
    hPLID: breakData?.hPLID || 0
  });

  useEffect(() => {
    if (formattedEndDate) {
      setBreakListData(prev => ({
        ...prev,
        bLEndDate: formattedEndDate,
      }));
    }
  }, [formattedEndDate]);

  useEffect(() => {
    if (breakConDetails) {
      breakConDetails.forEach(detail => {
        if (detail.hPLID) {
          if (breakListData.isPhyResYN === "Y") {
            setSelectedPhysicians(prev => [...prev, detail.hPLID]);
          } else if (breakListData.isPhyResYN === "N") {
            setSelectedResources(prev => [...prev, detail.hPLID]);
          }
        }
      });
    }
  }, [breakConDetails, breakListData.isPhyResYN]);

  useEffect(() => {
    setEndDateState(formattedEndDate);
  }, [formattedEndDate]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (breakData) {
      setBreakListData(prev => ({
        ...prev,
        bLStartDate: new Date(breakData.bLStartDate || formattedEndDate),
        bLEndDate: new Date(breakData.bLEndDate || formattedEndDate),
      }));
    }
  }, [breakData, formattedEndDate]);

  useEffect(() => {
    if (endDateState && endDateState > breakListData.bLStartDate) {
      setBreakListData((prev) => ({
        ...prev,
        bLEndDate: endDateState,
      }));
    }
  }, [endDateState]);


  useEffect(() => {
    if (breakListData.bLStartDate && endDateState <= breakListData.bLStartDate) {
      setBreakListData(prev => ({
        ...prev,
        bLEndDate: new Date(breakListData.bLStartDate.getTime() + 24 * 60 * 60 * 1000),
      }));
    }
  }, [endDateState, breakListData.bLStartDate]);

  useEffect(() => {
    setBreakListData(prev => ({
      ...prev,
      bLFrqNo: frequencyNumber,
    }));
  }, [frequencyNumber]);


  useEffect(() => {
    console.log("Updating breakListData with endDateState:", endDateState);
    setBreakListData((prev) => ({
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

  const formatDateToTimeString = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };


  const parseTimeStringToDate = (timeString: string): Date => {
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

  const fetchCompanies = async () => {
    try {
      const companyData: Company[] = await CompanyService.getCompanies();
      if (companyData && companyData.length > 0) {
        const companyOptions = companyData.map((company) => ({
          label: company.compName,
          value: company.compIDCompCode,
        }));
        setDropdownValues((prevState) => ({ ...prevState, companyOptions }));
        // Optionally set the first company as default
        if (companyData.length > 0) {
          setSelectedCompany(companyData[0]);
          setBreakListData(prev => ({
            ...prev,
            compID: parseInt(companyData[0].compIDCompCode, 10), // Assuming compIDCompCode is a numeric string, parse it to a number
            compCode: companyData[0].compIDCompCode,
            compName: companyData[0].compName,
          }));
        }
      } else {
        console.error("Failed to fetch companies");
      }
    } catch (error) {
      console.error("Fetching companies failed:", error);
      setErrorMessage("Failed to load companies.");
    }
  };





  useEffect(() => {
    // Update state when breakData changes
    if (breakData) {
      setBreakListData(prev => ({
        ...prev,
        ...breakData,
        bLStartTime: new Date(breakData.bLStartTime || prev.bLStartTime),
        bLEndTime: new Date(breakData.bLEndTime || prev.bLEndTime),
        bLStartDate: new Date(breakData.bLStartDate || prev.bLStartDate),
        bLEndDate: new Date(breakData.bLEndDate || prev.bLEndDate),
        // Add any additional updates needed
      }));
    }
  }, [breakData]);

  useEffect(() => {
    // Update other states based on breakConDetails if needed
    // For example, update resource or physician lists based on breakConDetails
  }, [breakConDetails]);

  const handleSaveBreakConDetail = async (breakConDetailData: BreakConDetailData) => {
    debugger
    // Ensure that you are working with a single ID, not an array
    const hPLID = breakListData.isPhyResYN === "Y"
      ? selectedPhysicians[0]  // Ensure this is a single number
      : selectedResources[0];  // Ensure this is a single number

    // Prepare the payload with correct structure
    const payload: BreakConDetailData = {

      hPLID,  // Ensure this is a single number
      bCDID: breakConDetailData.bCDID,  // Ensure this is the ID of the record to update
      blID: breakConDetailData.blID,
      rActiveYN: breakConDetailData.rActiveYN || "N",
      rCreatedID: breakConDetailData.rCreatedID || 0,
      rCreatedBy: breakConDetailData.rCreatedBy || "",
      rCreatedOn: breakConDetailData.rCreatedOn || new Date().toISOString(),
      rModifiedID: breakConDetailData.rModifiedID || 0,
      rModifiedBy: breakConDetailData.rModifiedBy || "",
      rModifiedOn: breakConDetailData.rModifiedOn || new Date().toISOString(),
      rNotes: breakConDetailData.rNotes || "",
      transferYN: breakConDetailData.transferYN || "N",
      compID: breakConDetailData.compID || 1,
      compCode: breakConDetailData.compCode || "",
      compName: breakConDetailData.compName || "",
      recordStatus: breakConDetailData.recordStatus || "N"
    };

    try {
      // Ensure that the save service correctly updates the existing record
      const response = await BreakListConDetailsService.saveBreakConDetail(token!, payload);
      if (response.success) {
        notifySuccess('Break Condition Detail updated successfully');
      } else {
        throw new Error(response.errorMessage || 'Failed to update Break Condition Detail');
      }
    } catch (error) {
      console.error('Save failed:', error);
      notifyError('Failed to update Break Condition Detail');
    }
  };




  useEffect(() => {
    if (breakConDetails) {
      breakConDetails.forEach(detail => {
        const hPLID = detail.hPLID; // Access hPLID from each detail in the array
        if (hPLID && breakListData.isPhyResYN === "Y") {
          setSelectedPhysicians(prev => [...prev, hPLID]);
        } else if (hPLID && breakListData.isPhyResYN === "N") {
          setSelectedResources(prev => [...prev, hPLID]);
        }
      });
    }
  }, [breakConDetails, breakListData.isPhyResYN]);


  const handleSave = async () => {
    onSave(breakListData);

    try {
      const breakListResponse = await BreakListService.saveBreakList(token!, {
        ...breakListData,
      });

      if (breakListResponse.success) {
        notifySuccess('Break List saved successfully');

        const breakConDetailData: BreakConDetailData = {
          hPLID: 0, // This will be set within handleSaveBreakConDetail
          bCDID: 0,
          blID: breakListResponse.data?.bLID || 0,
          rCreatedID: breakListData?.rCreatedID || 0,
          rCreatedBy: breakListData?.rCreatedBy || "",
          rCreatedOn: new Date(breakListData?.rCreatedOn || new Date()),
          rModifiedID: breakListData?.rCreatedID || 0,
          rModifiedBy: breakListData?.rModifiedBy || "",
          rModifiedOn: new Date(breakListData?.rModifiedOn || new Date()),
          rNotes: breakListData?.rNotes || "",
          compID: breakListData?.compID || 1,
          compCode: breakListData?.compCode || "",
          compName: breakListData?.compName || "",
          transferYN: breakListData?.transferYN || "N",
          recordStatus: breakListData?.transferYN || "Y",
          rActiveYN: breakListData.rActiveYN || "N"
        };

        await handleSaveBreakConDetail(breakConDetailData);
      } else {
        throw new Error(breakListResponse.errorMessage || 'Failed to save Break List');
      }
    } catch (error) {
      console.error('Save failed:', error);
      notifyError('Failed to save Break List');
    }
  };

  const handleClear = () => {
    debugger
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
      rActiveYN: "Y",
      rCreatedID: 0,
      rCreatedBy: "",
      rCreatedOn: new Date(),
      rModifiedID: 0,
      rModifiedBy: "",
      rModifiedOn: new Date(),
      rNotes: "",
      isPhyResYN: "Y",
      compID: 1,
      compCode: "",
      compName: "",
      transferYN: "N",
      resources: "",
      frequencyDetails: "",
      hPLID: 0
    });
    setSelectedResources([]);
    setSelectedPhysicians([]);
    setEndDateState(formattedEndDate);
    setSelectedCompany(null);
    setDropdownValues({
      categoryOptions: [],
      usersOptions: [],
      companyOptions: [],
      profileOptions: [],
    });
    onClear(); // If you need to execute any additional clearing logic passed from parent
  };

  const handleChangeFormToggle = () => {
    setShowChangeFormDialog(!showChangeFormDialog);
  };

  const handleSaveChanges = (details: string, formattedEndDate: Date, frequencyCode: string, frequencyNumber: number, weekCodes?: string[]) => {
    try {
      // Log the formattedEndDate to see its current format
      console.log("Formatted End Date:", formattedEndDate);

      // Attempt to parse formattedEndDate
      const parsedEndDate = new Date(formattedEndDate);

      // Check if the parsed date is valid
      if (isNaN(parsedEndDate.getTime())) {
        throw new Error("Invalid end date format.");
      }

      // Ensure end date is greater than start date
      if (parsedEndDate <= breakListData.bLStartDate) {
        notifyError("End date must be greater than start date.");
        return;
      }

      // Update the state with new values
      setBreakListData(prev => ({
        ...prev,
        frequencyDetails: details,
        bLEndDate: parsedEndDate,
        bLFrqNo: frequencyNumber,
        bLFrqDesc: frequencyCode,
        bLFrqWkDesc: weekCodes?.join(",") || "",
      }));
    } catch (error) {
      console.error("Error in handleSaveChanges:", error);
      notifyError("Failed to save changes. Please check the date format.");
    }
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
    if (breakListData.isPhyResYN === "N") {
      fetchResources();
    }
  }, [breakListData.isPhyResYN]);


  const fetchPhysicians = async () => {
    setLoadingPhysicians(true);
    try {
      const response = await ContactMastService.fetchAttendingPhysician(
        token!,
        "GetActiveConsultants",
        breakListData.compID || 1
      );
      debugger
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



  useEffect(() => {
    fetchResources();
    fetchPhysicians();
  }, [token]);

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value as "Y" | "N";
    setBreakListData(prevState => ({
      ...prevState,
      isPhyResYN: value
    }));
  };

  useEffect(() => {
    if (breakListData.isPhyResYN === "N") {
      fetchResources();
    }
  }, [breakListData.isPhyResYN]);

  useEffect(() => {
    if (breakListData.isPhyResYN === "Y") {
      fetchPhysicians();
    }
  }, [token, breakListData.compID]);
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

  const handleResourceCheckboxChange = (resourceID: number, checked: boolean) => {
    debugger
    if (checked) {
      setSelectedResources((prev) => [...prev, resourceID]);
    } else {
      setSelectedResources((prev) =>
        prev.filter((resourceID) => resourceID !== resourceID)
      );
    }

    // Update the selected physician names
    const updatedResourceNames = resourceList
      .filter((resource) => selectedResources.includes(resource.rLID))
      .map((resource) => resource.rLName);

    setSelectedResourceNames(updatedResourceNames);
  };


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
          .map(resource => resource.id.toString()) // Convert each resource object to its ID as a string
          .join(',') // Concatenate IDs into a comma-separated string
        : prev.resources; // Fallback to previous resources if newValue is false

      return {
        ...prev,
        resources: updatedResources
      };
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
                  label="Physician"
                />
                <FormControlLabel
                  value="N"
                  control={<Radio />}
                  label="Resources"
                />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>






        <Grid container spacing={2}>
          {breakListData.isPhyResYN === "N" && (
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
                            checked={selectedResources.includes(
                              resource.rLID
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

          {breakListData.isPhyResYN === "Y" && (
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
              ControlID={"end-time-control"}
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
                name="rNotes"
                value={breakListData.rNotes || ""}
                onChange={(e) =>
                  setBreakListData({
                    ...breakListData,
                    rNotes: e.target.value,
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
          <Grid item xs={12} sm={6} md={3} >
            <FormControlLabel
              control={
                <Switch
                  checked={breakListData.rActiveYN === "Y"}
                  onChange={(e) =>
                    setBreakListData({
                      ...breakListData,
                      rActiveYN: e.target.checked ? "Y" : "N",
                    })
                  }
                />
              }
              label={breakListData.rActiveYN === "Y" ? "Active" : "Hidden"}
            />
          </Grid>
        </Grid>
      </section>

      {/* </Grid> */}


      <section>
        <FormSaveClearButton
          onSave={handleSave}
          onClear={handleClear}
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
        frequencyNumber={breakListData.bLFrqNo}
      />
    </Paper>
  );
};

export default BreakListDetails;
