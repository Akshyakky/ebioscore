import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { DropdownOption } from "@/interfaces/Common/DropdownOption";
import { Card, CardContent, Divider, Grid, SelectChangeEvent, Typography } from "@mui/material";
import React from "react";
import { Control, FieldErrors } from "react-hook-form";

interface VisitDetailsFormProps {
  control: Control<any>;
  errors: FieldErrors;
  watchedVisitType: "H" | "P";
  dropdownValues: {
    pic?: DropdownOption[];
    department?: DropdownOption[];
  };
  DepartmentDropdownValues: DropdownOption[];
  availableAttendingPhysicians: DropdownOption[];
  primaryIntroducingSource: DropdownOption[];
  handleRadioButtonChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handlePhysicianChange: (event: any) => void;
  handleDropdownChange: (fieldName: string, value: string | number, options?: DropdownOption[], additionalFields?: Record<string, any>) => void;
  showCard?: boolean;
}

const VisitDetailsForm: React.FC<VisitDetailsFormProps> = ({
  control,
  errors,
  watchedVisitType,
  dropdownValues,
  DepartmentDropdownValues,
  availableAttendingPhysicians,
  primaryIntroducingSource,
  handleRadioButtonChange,
  handlePhysicianChange,
  handleDropdownChange,
  showCard = true,
}) => {
  const isHospitalVisit = watchedVisitType === "H";
  const isPhysicianVisit = watchedVisitType === "P";

  const formContent = (
    <>
      <Typography variant="h6" gutterBottom>
        Visit Details
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        <Grid size={{ sm: 12, md: 6 }}>
          <FormField
            name="pTypeID"
            control={control}
            label="Payment Source [PIC]"
            type="select"
            required
            size="small"
            fullWidth
            options={dropdownValues.pic || []}
            onChange={(event: SelectChangeEvent<string>) => {
              const selectedValue = Number(event.target.value);
              const selectedOption = dropdownValues.pic?.find((option) => Number(option.value) === selectedValue);

              handleDropdownChange("pTypeID", selectedValue, dropdownValues.pic, {
                pTypeName: selectedOption?.label || "",
                pTypeCode: selectedOption?.value?.toString() || "",
              });
            }}
          />
        </Grid>

        <Grid size={{ sm: 12, md: 6 }}>
          <FormField name="pVisitDate" control={control} label="Visit Date" type="datepicker" required size="small" fullWidth />
        </Grid>

        <Grid size={{ sm: 12 }}>
          <FormField
            name="pVisitType"
            control={control}
            label="Visit To"
            type="radio"
            required
            options={[
              { value: "H", label: "Hospital" },
              { value: "P", label: "Physician" },
            ]}
            onChange={handleRadioButtonChange}
          />
        </Grid>

        {isHospitalVisit && (
          <Grid size={{ sm: 12, md: 6 }}>
            <FormField
              name="deptID"
              control={control}
              label="Department"
              type="select"
              required
              size="small"
              fullWidth
              options={DepartmentDropdownValues}
              onChange={(event: SelectChangeEvent<string>) => {
                const selectedValue = Number(event.target.value);
                const selectedOption = DepartmentDropdownValues?.find((option) => Number(option.value) === selectedValue);

                handleDropdownChange("deptID", selectedValue, DepartmentDropdownValues, {
                  deptName: selectedOption?.label || "",
                });
              }}
            />
          </Grid>
        )}

        {isPhysicianVisit && (
          <Grid size={{ sm: 12, md: 6 }}>
            <FormField
              name="attendingPhysicianId"
              control={control}
              label="Attending Physician"
              type="select"
              required
              size="small"
              fullWidth
              options={availableAttendingPhysicians}
              onChange={handlePhysicianChange}
            />
          </Grid>
        )}

        <Grid size={{ sm: 12, md: 6 }}>
          <FormField
            name="primaryReferralSourceId"
            control={control}
            label="Primary Introducing Source"
            type="select"
            required
            size="small"
            fullWidth
            options={primaryIntroducingSource}
            onChange={(event: SelectChangeEvent<string>) => {
              const selectedValue = Number(event.target.value);
              const selectedOption = primaryIntroducingSource?.find((option) => Number(option.value) === selectedValue);

              handleDropdownChange("primaryReferralSourceId", selectedValue, primaryIntroducingSource, {
                primaryReferralSourceName: selectedOption?.label || "",
              });
            }}
          />
        </Grid>

        <Grid size={{ sm: 12 }}>
          <FormField name="rNotes" control={control} label="Notes" type="textarea" size="small" fullWidth rows={3} placeholder="Enter any additional notes about this visit" />
        </Grid>
      </Grid>
    </>
  );

  if (showCard) {
    return (
      <Card variant="outlined">
        <CardContent>{formContent}</CardContent>
      </Card>
    );
  }

  return formContent;
};

export default VisitDetailsForm;
