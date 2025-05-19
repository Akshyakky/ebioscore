import React, { useCallback } from "react";
import { Grid } from "@mui/material";
import { useFormContext } from "react-hook-form";
import { PatientRegistrationDto } from "@/interfaces/PatientAdministration/PatientFormData";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { useServerDate } from "@/hooks/Common/useServerDate";
import FormSectionWrapper from "@/components/FormField/FormSectionWrapper";
import ZodFormField from "@/components/ZodFormField/ZodFormField";

const MembershipScheme: React.FC = () => {
  // Access form context
  const { control, formState, setValue } = useFormContext<PatientRegistrationDto>();
  const { errors } = formState;

  // Load dropdown values and server date
  const { ...dropdownValues } = useDropdownValues(["membershipScheme"]);
  const serverDate = useServerDate();

  // Handle date change
  const handleDateChange = useCallback(
    (date: Date | null) => {
      setValue("patRegisters.patMemSchemeExpiryDate", date ? date : serverDate, { shouldValidate: true });
    },
    [setValue, serverDate]
  );

  return (
    <FormSectionWrapper title="Membership Scheme" spacing={1}>
      <Grid container spacing={2}>
        <ZodFormField
          name="patRegisters.patMemID"
          control={control}
          type="select"
          label="Membership Scheme"
          options={dropdownValues.membershipScheme || []}
          errors={errors}
          gridProps={{ xs: 12, sm: 6, md: 3 }}
          onChange={(val) => {
            const selectedOption = dropdownValues.membershipScheme?.find((opt) => opt.value === val);
            if (selectedOption) {
              setValue("patRegisters.patMemName", selectedOption.label, { shouldValidate: true });
            }
          }}
        />

        <ZodFormField
          name="patRegisters.patMemSchemeExpiryDate"
          control={control}
          type="datepicker"
          label="Membership Expiry Date"
          errors={errors}
          gridProps={{ xs: 12, sm: 6, md: 3 }}
          onChange={handleDateChange}
        />
      </Grid>
    </FormSectionWrapper>
  );
};

export default React.memo(MembershipScheme);
