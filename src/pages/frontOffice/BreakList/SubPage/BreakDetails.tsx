import React, { useCallback, useEffect, useMemo, useState } from "react";
import Save from "@mui/icons-material/Save";
import Delete from "@mui/icons-material/Delete";
import { useLoading } from "@/hooks/Common/useLoading";
import { useServerDate } from "@/hooks/Common/useServerDate";
import { BreakConDetailData, BreakListData } from "@/interfaces/FrontOffice/BreakListData";
import BreakFrequencyDetails, { FrequencyData } from "./BreakFrequencyDetails";
import { BreakListService } from "@/services/FrontOfficeServices/BreakListServices/BreakListService";
import { breakConDetailsService, resourceListService } from "@/services/FrontOfficeServices/FrontOfiiceApiServices";
import { AppointmentService } from "@/services/FrontOfficeServices/AppointmentServices/AppointmentService";
import { showAlert } from "@/utils/Common/showAlert";
import CustomCheckbox from "@/components/Checkbox/Checkbox";
import { Grid, Paper, Typography } from "@mui/material";
import FormField from "@/components/FormField/FormField";
import CustomButton from "@/components/Button/CustomButton";
import CustomGrid from "@/components/CustomGrid/CustomGrid";
import { formatDate } from "@/utils/Common/dateUtils";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";

const frequencyCodeMap = {
  none: "FO70",
  daily: "FO71",
  weekly: "FO72",
  monthly: "FO73",
  yearly: "FO74",
};
const weekDayCodeMap = {
  Sunday: "FO75",
  Monday: "FO76",
  Tuesday: "FO77",
  Wednesday: "FO78",
  Thursday: "FO79",
  Friday: "FO80",
  Saturday: "FO81",
};

const BreakDetails: React.FC<{ editData?: any }> = ({ editData }) => {
  const { setLoading } = useLoading();
  const serverDate = useServerDate();

  // Destructure from useAppSelector for user details
  const [{ compID, compCode, compName, userID, userName }, setCompData] = useState({ compID: 1, compCode: "KVG", compName: "KVG Medical College", userID: 0, userName: "Akshay" });

  const [isSubmitted] = useState(false);
  const [isOneDay, setIsOneDay] = useState(false);
  const [openFrequencyDialog, setOpenFrequencyDialog] = useState(false);
  const [formState, setFormState] = useState<BreakListData>({
    bLID: 0,
    bLName: "",
    bLStartTime: serverDate || new Date(),
    bLEndTime: serverDate || new Date(),
    bLStartDate: serverDate || new Date(),
    bLEndDate: serverDate || new Date(),
    bLFrqNo: 0,
    bLFrqDesc: "",
    bLFrqWkDesc: "",
    bColor: "",
    rActiveYN: "Y",
    rNotes: "",
    isPhyResYN: "Y",
    compID: compID || 0,
    compCode: compCode || "",
    compName: compName || "",
    transferYN: "N",
  });

  const [, setBreakConDetails] = useState<BreakConDetailData[]>([]);
  const [selectedOption, setSelectedOption] = useState("physician");
  const [resourceData, setResourceData] = useState<any[]>([]);
  const [consultantData, setConsultantData] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [frequencyData, setFrequencyData] = useState<FrequencyData>({
    frequency: "none",
    endDate: formState.bLEndDate.toISOString().split("T")[0],
    interval: 1,
    weekDays: [],
  });

  useEffect(() => {
    if (editData) {
      loadEditData(editData);
    } else {
      handleClear();
    }
  }, [editData]);

  useEffect(() => {
    fetchData();
  }, [selectedOption]);

  const loadEditData = async (data: any) => {
    setLoading(true);
    try {
      let breakListData: BreakListData;
      if (typeof data === "number") {
        if (isNaN(data)) throw new Error("Invalid ID provided");
        const result = await BreakListService.getBreakListById(data);
        if (!result.success || !result.data) throw new Error(result.errorMessage || "Failed to fetch break list data by ID");
        breakListData = result.data;
      } else if (data && typeof data.bLID === "number") {
        if (isNaN(data.bLID)) throw new Error("Invalid bLID provided");
        breakListData = data;
      } else {
        throw new Error("Invalid Break List Data: Missing or incorrect bLID");
      }
      const frequencyKey = Object.keys(frequencyCodeMap).find((key) => frequencyCodeMap[key as keyof typeof frequencyCodeMap] === breakListData.bLFrqDesc);
      const frequencyData: FrequencyData = {
        frequency: frequencyKey || "none",
        endDate: new Date(breakListData.bLEndDate).toISOString().split("T")[0],
        interval: breakListData.bLFrqNo || 1,
        weekDays: breakListData.bLFrqWkDesc ? breakListData.bLFrqWkDesc.split(",") : [],
      };
      const frequencyDescription = generateFrequencyDescription(frequencyData);
      setFormState({
        ...breakListData,
        bLStartDate: new Date(breakListData.bLStartDate),
        bLEndDate: new Date(breakListData.bLEndDate),
        bLStartTime: new Date(breakListData.bLStartTime),
        bLEndTime: new Date(breakListData.bLEndTime),
        bLFrqDesc: frequencyDescription || "",
      });
      if (typeof breakListData.bLID === "number" && breakListData.bLID > 0) {
        const conDetailsResult = await breakConDetailsService.getAll();
        const filteredConDetails = (conDetailsResult.data ?? []).filter((bcd: any) => bcd.bLID === breakListData.bLID);

        if (filteredConDetails.length > 0) {
          setBreakConDetails(filteredConDetails);
          const selectedHPLIDs = filteredConDetails.map((detail: BreakConDetailData) => detail.hPLID);
          setSelectedItems(selectedHPLIDs.filter((id): id is number => id !== null));
          const isPhysician = breakListData.isPhyResYN === "Y";
          setSelectedOption(isPhysician ? "physician" : "resource");
          if (isPhysician) {
            const result = await AppointmentService.fetchAppointmentConsultants();
            if (result.success && result.data) {
              setConsultantData(result.data);
            }
          } else {
            const result = await resourceListService.getAll();
            if (result.success && result.data) {
              setResourceData(result.data);
            }
          }
        } else {
          setBreakConDetails([]);
          setSelectedItems([]);
        }
      } else {
        throw new Error("Invalid Break List ID");
      }
    } catch (error) {
      showAlert("Error", "Failed to load edit data", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (selectedOption === "resource") {
        const result = await resourceListService.getAll();
        if (result.success && result.data) setResourceData(result.data);
      } else {
        const result = await AppointmentService.fetchAppointmentConsultants();
        if (result.success && result.data) setConsultantData(result.data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [selectedOption]);

  const handleRadioChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    setSelectedOption(value);
    setFormState((prevState) => ({
      ...prevState,
      isPhyResYN: value === "physician" ? "Y" : "N",
    }));
    setSelectedItems([]);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      let updatedState = { ...formState };

      if (name === "bLStartTime" || name === "bLEndTime") {
        // Time picker handling is now managed by the onChange prop directly
        return;
      } else if (type === "date" && (name === "bLStartDate" || name === "bLEndDate")) {
        const newDate = new Date(value);
        if (name === "bLStartDate" && newDate > updatedState.bLEndDate) {
          updatedState.bLEndDate = newDate;
        } else if (name === "bLEndDate" && newDate < updatedState.bLStartDate) {
          updatedState.bLStartDate = newDate;
        }
        updatedState[name as keyof Pick<BreakListData, "bLStartDate" | "bLEndDate">] = newDate;
      } else {
        (updatedState as any)[name] = value;
      }

      setFormState(updatedState);
    },
    [formState]
  );

  const handleCheckboxChange = useCallback((id: number, isChecked: boolean) => {
    setSelectedItems((prevItems) => (isChecked ? [...prevItems, id] : prevItems.filter((item) => item !== id)));
  }, []);

  const renderCheckbox = useCallback(
    (item: any) => {
      const id = selectedOption === "resource" ? item.rLID : item.conID;
      return <CustomCheckbox label="" name={`select-${id}`} checked={selectedItems.includes(id)} onChange={(e: any) => handleCheckboxChange(id, e.target.checked)} size="small" />;
    },
    [selectedOption, selectedItems, handleCheckboxChange]
  );

  const renderConsultantName = useCallback((item: any) => {
    const { conTitle, conFName, conMName, conLName } = item;
    return `${conTitle || ""} ${conFName || ""} ${conMName || ""} ${conLName || ""}`.trim();
  }, []);

  const columns = useMemo(
    () => [
      { key: "checkbox", header: "Action", visible: true, render: renderCheckbox },
      selectedOption === "resource"
        ? { key: "rLName", header: "Resource Name", visible: true }
        : { key: "consultantName", header: "Consultant Name", visible: true, render: renderConsultantName },
    ],
    [selectedOption, renderCheckbox, renderConsultantName]
  );

  const handleSwitchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const isChecked = e.target.checked;
      setIsOneDay(isChecked);

      if (isChecked) {
        const startOfDay = new Date(formState.bLStartDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(formState.bLStartDate);
        endOfDay.setHours(23, 59, 0, 0);

        setFormState((prev) => ({
          ...prev,
          bLStartTime: startOfDay,
          bLEndTime: endOfDay,
        }));
      } else {
        const defaultStartTime = new Date(formState.bLStartDate);
        defaultStartTime.setHours(9, 0, 0, 0);

        const defaultEndTime = new Date(formState.bLStartDate);
        defaultEndTime.setHours(9, 45, 0, 0);

        setFormState((prev) => ({
          ...prev,
          bLStartTime: defaultStartTime,
          bLEndTime: defaultEndTime,
        }));
      }
    },
    [formState.bLStartDate]
  );

  const handleActiveToggle = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, rActiveYN: event.target.checked ? "Y" : "N" }));
  }, []);

  const handleSave = useCallback(async () => {
    setLoading(true);
    try {
      const frequencyKey = frequencyData.frequency as keyof typeof frequencyCodeMap;
      formState.bLFrqDesc = frequencyCodeMap[frequencyKey] || "FO70";
      formState.bLFrqNo = frequencyData.interval || 0;

      if (frequencyData.frequency === "weekly") {
        formState.bLFrqWkDesc = frequencyData.weekDays
          .map((day) => {
            const dayKey = day as keyof typeof weekDayCodeMap;
            return weekDayCodeMap[dayKey];
          })
          .join(",");
      } else {
        formState.bLFrqWkDesc = "";
      }

      const saveBreakListResult = await BreakListService.saveBreakList(formState);

      if (saveBreakListResult.success && saveBreakListResult.data) {
        const savedBreakListData = saveBreakListResult.data;
        const blID = savedBreakListData.bLID;

        const breakConDetailPromises = selectedItems.map((itemID) => {
          const breakConDetailData: BreakConDetailData = {
            bCDID: 0,
            blID,
            hPLID: itemID,
            rActiveYN: "Y",
            rNotes: "",
            compID: compID,
            compCode: compCode,
            compName: compName,
            transferYN: "N",
          };

          return breakConDetailsService.save(breakConDetailData);
        });

        const breakConDetailResults = await Promise.all(breakConDetailPromises);

        const allBreakConDetailsSaved = breakConDetailResults.every((result) => result.success);

        if (allBreakConDetailsSaved) {
          showAlert("Success", "Save Successful", "success");
          handleClear();
        } else {
          showAlert("Warning", "BreakList saved, but some BreakConDetails failed to save.", "warning");
        }
      } else {
        showAlert("Error", "Failed to save BreakList.", "error");
      }
    } catch (error) {
      showAlert("Error", "An error occurred while saving. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }, [formState, selectedItems, frequencyData, selectedOption]);

  const handleClear = useCallback(() => {
    setFormState({
      bLID: 0,
      bLName: "",
      bLStartTime: serverDate || new Date(),
      bLEndTime: serverDate || new Date(),
      bLStartDate: serverDate || new Date(),
      bLEndDate: serverDate || new Date(),
      bLFrqNo: 0,
      bLFrqDesc: "",
      bLFrqWkDesc: "",
      bColor: "",
      rActiveYN: "Y",
      rNotes: "",
      isPhyResYN: "Y",
      compID: compID || 0,
      compCode: compCode || "",
      compName: compName || "",
      transferYN: "N",
    });
    setBreakConDetails([]);
    setSelectedItems([]);
    setIsOneDay(false);
  }, []);

  const handleSaveFrequency = useCallback((data: FrequencyData) => {
    setFrequencyData(data);
    setFormState((prev) => ({
      ...prev,
      bLEndDate: new Date(data.endDate),
      bLFrqDesc: generateFrequencyDescription(data),
    }));
    setOpenFrequencyDialog(false);
  }, []);

  const generateFrequencyDescription = (data: FrequencyData): string => {
    const formattedEndDate = formatDate(data.endDate);
    switch (data.frequency) {
      case "daily":
        return `Every ${data.interval} Day${data.interval > 1 ? "s" : ""} Till ${formattedEndDate}`;
      case "weekly":
        const selectedDays = data.weekDays.map((day) => day.slice(0, 3)).join("-");
        return `Every ${data.interval} Week${data.interval > 1 ? "s" : ""} On ${selectedDays} Till ${formattedEndDate}`;
      case "monthly":
        return `Every ${data.interval} Month${data.interval > 1 ? "s" : ""} Till ${formattedEndDate}`;
      case "yearly":
        return `Every ${data.interval} Year${data.interval > 1 ? "s" : ""} Till ${formattedEndDate}`;
      default:
        return `No Repeat End Date: ${formattedEndDate}`;
    }
  };

  const handleDateChange = (fieldName: keyof BreakListData) => (newDate: Date | null) => {
    if (!newDate) return;
    setFormState((prevState) => {
      const updatedState = { ...prevState };

      if (fieldName === "bLStartDate") {
        updatedState.bLStartDate = newDate;
        if (newDate > updatedState.bLEndDate) {
          updatedState.bLEndDate = newDate;
        }
        if (isOneDay) {
          updatedState.bLStartTime = new Date(newDate.setHours(0, 0, 0, 0));
          updatedState.bLEndTime = new Date(newDate.setHours(23, 59, 0, 0));
        }
      } else if (fieldName === "bLEndDate") {
        updatedState.bLEndDate = newDate;

        if (newDate < updatedState.bLStartDate) {
          updatedState.bLStartDate = newDate;
        }
      }
      return updatedState;
    });
  };

  return (
    <>
      <Paper variant="elevation" sx={{ padding: 2 }}>
        <Typography variant="h6" id="Break-Details-header">
          Break Details
        </Typography>
        <Grid container spacing={2}>
          <FormField
            type="text"
            label="Break Name"
            name="bLName"
            value={formState.bLName}
            onChange={handleInputChange}
            ControlID="Breakname"
            isMandatory
            isSubmitted={isSubmitted}
            placeholder="Break name"
          />
          <FormField
            type="timepicker"
            label="Start Time"
            name="bLStartTime"
            value={formState.bLStartTime} // Pass the Date object directly
            onChange={(date) => {
              if (date) {
                const newDate = new Date(formState.bLStartDate); // Create a new date based on start date
                newDate.setHours(date.getHours());
                newDate.setMinutes(date.getMinutes());
                setFormState((prev) => ({
                  ...prev,
                  bLStartTime: newDate,
                }));
              }
            }}
            ControlID="StartTime"
            isMandatory
            isSubmitted={isSubmitted}
            disabled={isOneDay}
            format="HH:mm"
            // minTime={formState.bLStartDate}
            // maxTime={formState.bLStartDate.getTime() === formState.bLEndDate.getTime() ? formState.bLEndTime : undefined}
          />
          <FormField
            type="timepicker"
            label="End Time"
            name="bLEndTime"
            value={formState.bLEndTime} // Pass the Date object directly
            onChange={(date) => {
              if (date) {
                const newDate = new Date(formState.bLStartDate); // Create a new date based on start date
                newDate.setHours(date.getHours());
                newDate.setMinutes(date.getMinutes());
                setFormState((prev) => ({
                  ...prev,
                  bLEndTime: newDate,
                }));
              }
            }}
            ControlID="EndTime"
            isMandatory
            isSubmitted={isSubmitted}
            disabled={isOneDay}
            format="HH:mm"
            // minTime={formState.bLStartDate.getTime() === formState.bLEndDate.getTime() ? formState.bLStartTime : undefined}
            // maxTime={formState.bLEndDate}
          />
          <FormField type="switch" label="One Day" name="isOneDay" checked={isOneDay} value={isOneDay} onChange={handleSwitchChange} ControlID="OneDay" gridProps={{ mt: 2 }} />
        </Grid>
        <Grid container spacing={2}>
          <FormField
            type="datepicker"
            label="Start Date"
            name="bLStartDate"
            value={formState.bLStartDate ? formState.bLStartDate.toISOString().split("T")[0] : ""}
            onChange={handleDateChange("bLStartDate")}
            ControlID="StartDate"
            minDate={new Date(1900, 0, 1)}
          />
          <FormField
            type="datepicker"
            label="End Date"
            name="bLEndDate"
            value={formState.bLEndDate ? formState.bLEndDate.toISOString().split("T")[0] : ""}
            onChange={handleDateChange("bLEndDate")}
            ControlID="EndDate"
            minDate={formState.bLStartDate}
          />
          <FormField type="textarea" label="Repeat" name="bLFrqDesc" value={formState.bLFrqDesc} onChange={handleInputChange} ControlID="Repeat" readOnly={true} />
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ mt: 2 }}>
            <CustomButton variant="contained" text="Change" icon={ChangeCircleIcon} size="small" color="secondary" onClick={() => setOpenFrequencyDialog(true)} />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <FormField
            type="radio"
            label="Choose Option"
            name="resourceOrPhysician"
            value={selectedOption}
            onChange={(e) => handleRadioChange(e, e.target.value)}
            ControlID="ChooseOption"
            options={[
              { value: "physician", label: "Physician" },
              { value: "resource", label: "Resource" },
            ]}
            isMandatory={true}
            inline={true}
          />
        </Grid>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {(selectedOption === "resource" || selectedOption === "physician") && (
              <CustomGrid columns={columns} data={selectedOption === "resource" ? resourceData : consultantData} maxHeight="300px" minHeight="300px" searchTerm="" />
            )}
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <FormField
            type="textarea"
            label="Description"
            name="rNotes"
            value={formState.rNotes}
            onChange={handleInputChange}
            ControlID="Description"
            placeholder="Enter description"
            maxLength={4000}
          />
        </Grid>
        <Grid container spacing={2}>
          <FormField
            type="switch"
            label={formState.rActiveYN === "Y" ? "Active" : "Hidden"}
            name="rActiveYN"
            checked={formState.rActiveYN === "Y"}
            value={formState.rActiveYN}
            onChange={handleActiveToggle}
            ControlID="ActiveStatus"
          />
        </Grid>
        <FormSaveClearButton onSave={handleSave} onClear={handleClear} clearText="Clear" saveText="Save" saveIcon={Save} clearIcon={Delete} />
      </Paper>

      {openFrequencyDialog && (
        <BreakFrequencyDetails
          open={openFrequencyDialog}
          onClose={() => setOpenFrequencyDialog(false)}
          endDateFromBreakDetails={frequencyData.endDate}
          onSave={handleSaveFrequency}
          initialFrequencyData={frequencyData}
        />
      )}
    </>
  );
};

export default BreakDetails;
