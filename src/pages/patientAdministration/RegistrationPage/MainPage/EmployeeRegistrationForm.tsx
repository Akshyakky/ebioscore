import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Typography, Box, Paper, Grid } from "@mui/material";

// Import components
import FormSectionContainer from "./FormSection";
import PersonalInfoSection from "./PersonalInfoSection";
import AdditionalInfoSection from "./AdditionalInfoSection";
import { EmployeeFormData, employeeSchema } from "./type";
import EmploymentInfoSection from "./EmploymentInfoSection";
import PreferencesSection from "./PreferencesSection";

// Import types and schema

const EmployeeRegistrationForm: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
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
      console.log("Form submitted successfully:", data);

      // Here you would typically:
      // 1. Send data to your API
      // 2. Show success message
      // 3. Redirect or reset form

      alert("Employee registration successful!");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to register employee. Please try again.");
    }
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
        Employee Registration Form
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={3}>
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
          <Grid item xs={12} sx={{ mt: 3, textAlign: "center" }}>
            <Button type="submit" variant="contained" color="primary" size="large" disabled={isSubmitting} sx={{ minWidth: 200 }}>
              {isSubmitting ? "Submitting..." : "Register Employee"}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default EmployeeRegistrationForm;
