import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Typography, Box, Paper, Grid, Stack } from "@mui/material";

// Import components
import FormSectionContainer from "./FormSection";
import PersonalInfoSection from "./PersonalInfoSection";
import AdditionalInfoSection from "./AdditionalInfoSection";
import { EmployeeFormData, employeeSchema } from "./type";
import EmploymentInfoSection from "./EmploymentInfoSection";
import PreferencesSection from "./PreferencesSection";

const EmployeeRegistrationForm: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      // Personal Information
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      age: null,
      gender: "",

      // Employment Information
      employeeId: "",
      department: "",
      position: "",
      roles: [],
      skills: [],
      bio: "",

      // Additional Information
      joinDate: null,
      contractEndDate: null,
      salary: null,
      profileImage: null,

      // Preferences & Agreements
      notificationPreferences: [],
      termsAgreed: true,
    },
  });

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      // Simulate API call with a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("Employee registration successful!");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to register employee. Please try again.");
    }
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Typography variant="h4" component="h1" align="center" sx={{ mb: 4 }}>
        Employee Registration Form
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={4}>
          {/* Personal Information Section */}
          <FormSectionContainer title="Personal Information">
            <PersonalInfoSection control={control} />
          </FormSectionContainer>

          {/* Employment Information Section */}
          <FormSectionContainer title="Employment Information">
            <EmploymentInfoSection control={control} />
          </FormSectionContainer>

          {/* Additional Information Section */}
          <FormSectionContainer title="Additional Information">
            <AdditionalInfoSection control={control} />
          </FormSectionContainer>

          {/* Preferences & Agreements Section */}
          <FormSectionContainer title="Preferences & Agreements">
            <PreferencesSection control={control} />
          </FormSectionContainer>

          {/* Submit Button */}
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Button type="submit" variant="contained" color="primary" size="large" disabled={isSubmitting} sx={{ minWidth: 200 }}>
              {isSubmitting ? "Submitting..." : "Register Employee"}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
};

export default EmployeeRegistrationForm;
