import React, { useCallback, useEffect, useState } from "react";
import Close from "@mui/icons-material/Close";
import { BreakConSuspendData } from "@/interfaces/FrontOffice/BreakConSuspendData";
import { useLoading } from "@/hooks/Common/useLoading";
import { useServerDate } from "@/hooks/Common/useServerDate";
import { breakConSuspendService } from "@/services/FrontOfficeServices/FrontOfiiceApiServices";
import { useAlert } from "@/providers/AlertProvider";
import { Box, Grid } from "@mui/material";
import FloatingLabelTextBox from "@/components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import CustomButton from "@/components/Button/CustomButton";
import TextArea from "@/components/TextArea/TextArea";

const formatToDDMMYYYY = (date: Date) => {
  return date ? date.toLocaleDateString("en-GB").split("/").reverse().join("-") : "Invalid Date";
};

interface BreakSuspendDetailsProps {
  open: boolean;
  onClose: (isSaved: boolean, updatedData?: BreakConSuspendData) => void;
  breakData: BreakConSuspendData;
}

const BreakSuspendDetails: React.FC<BreakSuspendDetailsProps> = ({ open, onClose, breakData }) => {
  const { setLoading } = useLoading();
  const serverDate = useServerDate();
  const { showAlert } = useAlert();

  const [suspendData, setSuspendData] = useState<Partial<BreakConSuspendData>>({
    bCSStartDate: serverDate,
    bCSEndDate: serverDate,
    rNotes: "",
  });

  useEffect(() => {
    if (open && breakData) {
      setSuspendData((prevData) => ({
        ...prevData,
        bCSStartDate: serverDate,
        bCSEndDate: serverDate,
        rNotes: breakData.rNotes || "",
      }));
    }
  }, [open, breakData, serverDate]);

  const handleInputChange = (field: keyof BreakConSuspendData, value: any) => {
    setSuspendData((prevData) => ({ ...prevData, [field]: value }));
  };

  const handleSave = useCallback(async () => {
    if (!breakData) return;

    const updatedSuspendData: BreakConSuspendData = {
      ...breakData,
      ...suspendData,
      bCSStartDate: new Date(suspendData.bCSStartDate as Date),
      bCSEndDate: new Date(suspendData.bCSEndDate as Date),
      rActiveYN: "N",
    };

    setLoading(true);
    try {
      const result = await breakConSuspendService.save(updatedSuspendData);
      if (result.success) {
        showAlert("Success", "The break has been suspended", "success");
        onClose(true, updatedSuspendData);
      } else {
        console.error("Failed to save suspend data:", result.errorMessage);
        onClose(false);
      }
    } catch (error) {
      console.error("Error saving suspend data:", error);
      onClose(false);
    } finally {
      setLoading(false);
    }
  }, [breakData, suspendData, setLoading, onClose]);

  const renderDateField = (id: string, title: string, value: Date | string | undefined, onChange?: (value: Date) => void) => (
    <Grid size={{ xs: 12, md: 6 }}>
      <FloatingLabelTextBox
        ControlID={id}
        title={title}
        value={value ? (typeof value === "string" ? value : formatToDDMMYYYY(value)) : "Invalid Date"}
        onChange={
          onChange
            ? (e: React.ChangeEvent<HTMLInputElement>) => {
                const date = new Date(e.target.value);
                if (!isNaN(date.getTime())) {
                  onChange(date);
                }
              }
            : undefined
        }
        type={onChange ? "date" : undefined}
        readOnly={!onChange}
        size="small"
      />
    </Grid>
  );

  return (
    <GenericDialog
      open={open}
      onClose={() => onClose(false)}
      title="Suspend Break"
      maxWidth="sm"
      disableEscapeKeyDown={true}
      disableBackdropClick={true}
      dialogContentSx={{ maxHeight: "400px" }}
      fullWidth
      actions={
        <>
          <CustomButton variant="contained" text="Save" onClick={handleSave} size="small" color="secondary" />
          <CustomButton variant="outlined" text="Close" onClick={() => onClose(false)} icon={Close} size="small" color="secondary" />
        </>
      }
    >
      <Box>
        <Grid container spacing={2}>
          {renderDateField("BreakStartDate", "Break Start Date", breakData?.blStartDate)}
          {renderDateField("BreakEndDate", "Break End Date", breakData?.blEndDate)}
          {renderDateField("SuspendStartDate", "Suspend Start Date", suspendData.bCSStartDate, (date) => handleInputChange("bCSStartDate", date))}
          {renderDateField("SuspendEndDate", "Suspend End Date", suspendData.bCSEndDate, (date) => handleInputChange("bCSEndDate", date))}
          <Grid size={{ xs: 12 }}>
            <TextArea
              label="Notes"
              name="notes"
              value={suspendData.rNotes || ""}
              onChange={(e) => handleInputChange("rNotes", e.target.value)}
              rows={4}
              placeholder="Enter any notes here"
              maxLength={4000}
              isMandatory={false}
              error={false}
              helperText=""
            />
          </Grid>
        </Grid>
      </Box>
    </GenericDialog>
  );
};

export default React.memo(BreakSuspendDetails);
