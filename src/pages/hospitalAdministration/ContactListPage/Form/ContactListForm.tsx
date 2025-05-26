import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Grid, Typography, Divider, Card, CardContent, Alert, SelectChangeEvent } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ContactListData, ContactMastData } from "@/interfaces/HospitalAdministration/ContactListData";
import SmartButton from "@/components/Button/SmartButton";
import { Save, Cancel, Refresh } from "@mui/icons-material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import CustomSwitch from "@/components/Checkbox/ColorSwitch";
import { useLoading } from "@/hooks/Common/useLoading";
import { showAlert } from "@/utils/Common/showAlert";
import { useServerDate } from "@/hooks/Common/useServerDate";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import useDropdownChange from "@/hooks/useDropdownChange";
import useFieldsList from "@/components/FieldsList/UseFieldsList";
import { ContactListService } from "@/services/HospitalAdministrationServices/ContactListService/ContactListService";
import ModifiedFieldDialog from "@/components/ModifiedFieldDailog/ModifiedFieldDailog";
import { AppModifyFieldDto } from "@/interfaces/HospitalAdministration/AppModifiedListDto";
import { useContactList } from "../hooks/useContactListForm";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";

interface ContactListFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: ContactMastData | null;
  viewOnly?: boolean;
}

type SwitchStates = {
  isEmployee: boolean;
  isReferral: boolean;
  isAppointment: boolean;
  isSuperSpeciality: boolean;
  isUserRequired: boolean;
  isAuthorisedUser: boolean;
  isContract: boolean;
};

const schema = z.object({
  conID: z.number(),
  conCode: z.string().min(1, "Contact code is required"),
  conTitle: z.string().min(1, "Title is required"),
  conFName: z.string().min(1, "First name is required"),
  conLName: z.string().min(1, "Last name is required"),
  conMName: z.string().optional(),
  conDob: z.date(),
  conGender: z.string().min(1, "Gender is required"),
  conSSNID: z.string().optional(),
  conBldGrp: z.string().optional(),
  conCat: z.string().min(1, "Category is required"),
  consValue: z.string().min(1, "Category value is required"),
  rActiveYN: z.string(),
  transferYN: z.string(),
  rNotes: z.string().optional(),
});

type ContactFormData = z.infer<typeof schema>;

const ContactListForm: React.FC<ContactListFormProps> = ({ open, onClose, initialData, viewOnly = false }) => {
  const { setLoading } = useLoading();
  const { getContactById, saveContact, generateContactCode } = useContactList();
  const serverDate = useServerDate();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [selectedSpecialities, setSelectedSpecialities] = useState<string[]>([]);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [dialogCategory, setDialogCategory] = useState<string>("");
  const isAddMode = !initialData;

  const [contactList, setContactList] = useState<ContactListData>({
    contactMastDto: {
      conID: 0,
      conCode: "",
      conTitle: "",
      conFName: "",
      conLName: "",
      conMName: "",
      conDob: serverDate,
      conGender: "",
      conSSNID: "",
      conBldGrp: "",
      conCat: "",
      consValue: "",
      conEmpYN: "N",
      rActiveYN: "Y",
      rNotes: "",
      conEmpStatus: "",
      allergicToAllergence: "",
      allergicToMedicine: "",
      aPHYRMID: 0,
      aPhyRoomName: "",
      deptID: 0,
      deptName: "",
      designation: "",
      emergenContactName: "",
      iPP: 0,
      oPP: 0,
      isAuthorizedUserYN: "N",
      isContractYN: "N",
      isSuperSpecialtyYN: "N",
      isEmployeeYN: "N",
      isRefferalYN: "N",
      isAppointmentYN: "N",
      isUserRequiredYN: "N",
      maritalStatus: "",
      tINNo: "",
      accCode: "",
      accPayCode: "",
      gESYCode: "",
      digSignPath: "",
      stampPath: "",
      payPolicy: 0,
      transferYN: "N",
    },
    contactAddressDto: {
      cAddID: 0,
      conID: 0,
      conCode: "",
      cAddType: "",
      cAddMail: "N",
      cAddPostCode: "",
      cAddPSSID: "",
      cAddCity: "",
      cAddCountry: "",
      cAddEmail: "",
      cAddPhone1: "",
      cAddPhone2: "",
      cAddPhone3: "",
      cAddState: "",
      cAddStreet: "",
      cAddStreet1: "",
      transferYN: "N",
      rActiveYN: "Y",
      rNotes: "",
    },
    contactDetailsDto: [],
  });

  const [switchStates, setSwitchStates] = useState<SwitchStates>({
    isEmployee: false,
    isReferral: false,
    isAppointment: false,
    isSuperSpeciality: false,
    isUserRequired: false,
    isAuthorisedUser: false,
    isContract: false,
  });

  const { refreshDropdownValues, ...dropdownValues } = useDropdownValues([
    "title",
    "gender",
    "bloodGroup",
    "maritalStatus",
    "city",
    "state",
    "nationality",
    "category",
    "department",
    "employeeStatus",
    "speciality",
    "employeeRoom",
  ]);

  const { fieldsList, defaultFields } = useFieldsList(["city", "state", "nationality"]);
  const { handleDropdownChange } = useDropdownChange<ContactListData>(setContactList);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isDirty, isValid, errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      conID: 0,
      conCode: "",
      conTitle: "",
      conFName: "",
      conLName: "",
      conMName: "",
      conDob: serverDate,
      conGender: "",
      conSSNID: "",
      conBldGrp: "",
      conCat: "",
      consValue: "",
      rActiveYN: "Y",
      transferYN: "N",
      rNotes: "",
    },
  });

  const generateCode = async () => {
    if (!isAddMode || !contactList.contactMastDto.consValue) return;

    try {
      setIsGeneratingCode(true);
      const nextCode = await generateContactCode(contactList.contactMastDto.consValue, 5);
      if (nextCode) {
        setValue("conCode", nextCode, { shouldValidate: true, shouldDirty: true });
        setContactList((prev) => ({
          ...prev,
          contactMastDto: { ...prev.contactMastDto, conCode: nextCode },
          contactAddressDto: { ...prev.contactAddressDto, conCode: nextCode },
        }));
      } else {
        showAlert("Warning", "Failed to generate contact code", "warning");
      }
    } catch (error) {
      console.error("Error generating contact code:", error);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      if (initialData) {
        try {
          setLoading(true);
          const fullContactData = await getContactById(initialData.conID);
          if (fullContactData) {
            setContactList(fullContactData);

            // Set form values
            reset({
              conID: fullContactData.contactMastDto.conID,
              conCode: fullContactData.contactMastDto.conCode,
              conTitle: fullContactData.contactMastDto.conTitle,
              conFName: fullContactData.contactMastDto.conFName,
              conLName: fullContactData.contactMastDto.conLName || "",
              conMName: fullContactData.contactMastDto.conMName || "",
              conDob: fullContactData.contactMastDto.conDob,
              conGender: fullContactData.contactMastDto.conGender || "",
              conSSNID: fullContactData.contactMastDto.conSSNID || "",
              conBldGrp: fullContactData.contactMastDto.conBldGrp || "",
              conCat: fullContactData.contactMastDto.conCat,
              consValue: fullContactData.contactMastDto.consValue,
              rActiveYN: fullContactData.contactMastDto.rActiveYN,
              transferYN: fullContactData.contactMastDto.transferYN,
              rNotes: fullContactData.contactMastDto.rNotes || "",
            });

            // Set switch states
            setSwitchStates({
              isEmployee: fullContactData.contactMastDto.isEmployeeYN === "Y",
              isReferral: fullContactData.contactMastDto.isRefferalYN === "Y",
              isAppointment: fullContactData.contactMastDto.isAppointmentYN === "Y",
              isSuperSpeciality: fullContactData.contactMastDto.isSuperSpecialtyYN === "Y",
              isUserRequired: fullContactData.contactMastDto.isUserRequiredYN === "Y",
              isAuthorisedUser: fullContactData.contactMastDto.isAuthorizedUserYN === "Y",
              isContract: fullContactData.contactMastDto.isContractYN === "Y",
            });

            // Set specialities for physician
            if (fullContactData.contactDetailsDto.length > 0) {
              const specialties = fullContactData.contactDetailsDto.filter((detail) => detail.facName).map((detail) => detail.facID.toString());
              setSelectedSpecialities(specialties);
            }
          }
        } catch (error) {
          console.error("Error loading contact data:", error);
          showAlert("Error", "Failed to load contact data", "error");
        } finally {
          setLoading(false);
        }
      } else {
        // Reset for new contact
        reset({
          conID: 0,
          conCode: "",
          conTitle: "",
          conFName: "",
          conLName: "",
          conMName: "",
          conDob: serverDate,
          conGender: "",
          conSSNID: "",
          conBldGrp: "",
          conCat: "",
          consValue: "",
          rActiveYN: "Y",
          transferYN: "N",
          rNotes: "",
        });
        setSwitchStates({
          isEmployee: false,
          isReferral: false,
          isAppointment: false,
          isSuperSpeciality: false,
          isUserRequired: false,
          isAuthorisedUser: false,
          isContract: false,
        });
        setSelectedSpecialities([]);
      }
    };

    if (open) {
      loadInitialData();
    }
  }, [initialData, open, reset, getContactById, setLoading, serverDate]);

  const handleCategoryChange = useCallback(
    async (event: SelectChangeEvent<unknown>) => {
      const selectedCategory = event.target.value as string;
      const selectedPhysician = selectedCategory === "PHY";

      setValue("consValue", selectedCategory, { shouldValidate: true, shouldDirty: true });
      setValue("conCat", selectedCategory, { shouldValidate: true, shouldDirty: true });

      if (selectedPhysician) {
        setValue("conTitle", "DR", { shouldValidate: true, shouldDirty: true });
      }

      setContactList((prev) => ({
        ...prev,
        contactMastDto: {
          ...prev.contactMastDto,
          consValue: selectedCategory,
          conCat: selectedCategory,
          conTitle: selectedPhysician ? "DR" : prev.contactMastDto.conTitle,
        },
      }));

      if (selectedCategory && isAddMode) {
        generateCode();
      }
    },
    [setValue, isAddMode]
  );

  const handleSpecialityChange = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      const selectedValues = event.target.value as string[];
      setSelectedSpecialities(selectedValues);

      const selectedNames = selectedValues
        .map((val) => dropdownValues.speciality?.find((opt) => opt.value === val)?.label || "")
        .filter(Boolean)
        .join(", ");

      setContactList((prev) => ({
        ...prev,
        contactDetailsDto: selectedValues.map((val) => ({
          facID: parseInt(val),
          facName: dropdownValues.speciality?.find((opt) => opt.value === val)?.label || "",
          transferYN: "N",
          cdID: 0,
          conID: prev.contactMastDto.conID,
          conType: "",
          rActiveYN: "Y",
          rNotes: "",
        })),
        contactMastDto: {
          ...prev.contactMastDto,
          specialityNames: selectedNames,
        },
      }));
    },
    [dropdownValues.speciality]
  );

  const handleSwitchChange = useCallback(
    (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const checkedValue = event.target.checked ? "Y" : "N";
      setSwitchStates((prev) => ({ ...prev, [name]: event.target.checked }));

      setContactList((prev) => ({
        ...prev,
        contactMastDto: {
          ...prev.contactMastDto,
          [`${name}YN`]: checkedValue,
        },
      }));
    },
    []
  );

  const handleInputChange = useCallback(
    (field: string, value: any) => {
      if (field === "conCode") {
        setValue("conCode", value, { shouldValidate: true, shouldDirty: true });
        setContactList((prev) => ({
          ...prev,
          contactMastDto: { ...prev.contactMastDto, conCode: value },
          contactAddressDto: { ...prev.contactAddressDto, conCode: value },
        }));
      } else if (field.startsWith("cAdd")) {
        // Address fields
        setContactList((prev) => ({
          ...prev,
          contactAddressDto: { ...prev.contactAddressDto, [field]: value },
        }));
      } else {
        // Master data fields
        setContactList((prev) => ({
          ...prev,
          contactMastDto: { ...prev.contactMastDto, [field]: value },
        }));
      }
    },
    [setValue]
  );

  const onSubmit = async (data: ContactFormData) => {
    if (viewOnly) return;

    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      // Validate physician-specific requirements
      if (contactList.contactMastDto.consValue === "PHY") {
        if (!contactList.contactMastDto.accCode) {
          throw new Error("Account code is required for physicians");
        }
        if (selectedSpecialities.length === 0) {
          throw new Error("At least one speciality is required for physicians");
        }
      }

      const response = await saveContact(contactList);

      if (response.success) {
        showAlert("Success", isAddMode ? "Contact created successfully" : "Contact updated successfully", "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save contact");
      }
    } catch (error) {
      console.error("Error saving contact:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save contact";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (isDirty) {
      setShowResetConfirmation(true);
    } else {
      performReset();
    }
  };

  const performReset = () => {
    if (initialData) {
      // Reset to initial data logic here
    } else {
      // Reset to default state
      reset();
      setSelectedSpecialities([]);
      setSwitchStates({
        isEmployee: false,
        isReferral: false,
        isAppointment: false,
        isSuperSpeciality: false,
        isUserRequired: false,
        isAuthorisedUser: false,
        isContract: false,
      });
    }
    setFormError(null);
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowCancelConfirmation(true);
    } else {
      onClose();
    }
  };

  const handleAddField = (category: string) => {
    setDialogCategory(category);
    setIsFieldDialogOpen(true);
  };

  const dialogTitle = viewOnly
    ? "View Contact Details"
    : isAddMode
    ? "Create New Contact"
    : `Edit Contact - ${contactList.contactMastDto.conFName} ${contactList.contactMastDto.conLName}`;

  const dialogActions = viewOnly ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton text="Cancel" onClick={handleCancel} variant="outlined" color="inherit" disabled={isSaving} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={Cancel} disabled={isSaving || (!isDirty && !formError)} />
        <SmartButton
          text={isAddMode ? "Create Contact" : "Update Contact"}
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          color="primary"
          icon={Save}
          asynchronous={true}
          showLoadingIndicator={true}
          loadingText={isAddMode ? "Creating..." : "Updating..."}
          successText={isAddMode ? "Created!" : "Updated!"}
          disabled={isSaving || !isValid}
        />
      </Box>
    </Box>
  );

  const renderSwitches = () => {
    const switches = [
      { label: "Employee", name: "isEmployee" },
      { label: "Referral", name: "isReferral" },
      ...(contactList.contactMastDto.consValue === "PHY"
        ? [
            { label: "Appointment", name: "isAppointment" },
            { label: "Super Speciality", name: "isSuperSpeciality" },
          ]
        : []),
      ...(switchStates.isEmployee
        ? [
            { label: "User Required", name: "isUserRequired" },
            { label: "Authorised User", name: "isAuthorisedUser" },
          ]
        : []),
    ];

    return (
      <Grid container spacing={2}>
        {switches.map((switchItem) => (
          <Grid size={{ xs: 12, sm: 3, md: 2 }} key={switchItem.name}>
            <CustomSwitch
              label={switchItem.label}
              size="medium"
              color="secondary"
              checked={switchStates[switchItem.name as keyof SwitchStates]}
              onChange={handleSwitchChange(switchItem.name)}
              disabled={viewOnly}
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <>
      <GenericDialog
        open={open}
        onClose={() => onClose()}
        title={dialogTitle}
        maxWidth="lg"
        fullWidth
        showCloseButton
        disableBackdropClick={!viewOnly && (isDirty || isSaving)}
        disableEscapeKeyDown={!viewOnly && (isDirty || isSaving)}
        actions={dialogActions}
      >
        <Box component="form" noValidate sx={{ p: 1 }}>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>
              {formError}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid size={{ sm: 12 }}>
              <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
                <Typography variant="body2" color="text.secondary">
                  Status:
                </Typography>
                <Controller
                  name="rActiveYN"
                  control={control}
                  render={({ field }) => (
                    <CustomSwitch label="Active" checked={field.value === "Y"} onChange={(e) => field.onChange(e.target.checked ? "Y" : "N")} disabled={viewOnly} size="small" />
                  )}
                />
              </Box>
            </Grid>

            {/* Basic Information Card */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField
                        type="select"
                        label="Category"
                        name="conCat"
                        options={dropdownValues.category || []}
                        onChange={handleCategoryChange}
                        disabled={viewOnly}
                        size="small"
                        control={control}
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 3 }}>
                      <Controller
                        name="conCode"
                        control={control}
                        render={({ field, fieldState }) => (
                          <FormField
                            type="text"
                            label="Code"
                            {...field}
                            helperText={fieldState.error?.message}
                            disabled={viewOnly || !isAddMode}
                            size="small"
                            fullWidth
                            control={control}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField
                        type="select"
                        label="Department"
                        name="deptID"
                        options={dropdownValues.department || []}
                        onChange={handleDropdownChange(["contactMastDto", "deptID"], ["contactMastDto", "deptName"], dropdownValues.department || [])}
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        control={control}
                      />
                    </Grid>

                    {contactList.contactMastDto.consValue === "PHY" && (
                      <Grid size={{ sm: 12, md: 3 }}>
                        <FormField
                          type="multiselect"
                          label="Speciality"
                          name="specialities"
                          options={dropdownValues.speciality || []}
                          onChange={handleSpecialityChange}
                          disabled={viewOnly}
                          size="small"
                          fullWidth
                          control={control}
                        />
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Personal Details Card */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Personal Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 3 }}>
                      <Controller
                        name="conTitle"
                        control={control}
                        render={({ field, fieldState }) => (
                          <FormField
                            type="select"
                            label="Title"
                            {...field}
                            options={dropdownValues.title || []}
                            helperText={fieldState.error?.message}
                            disabled={viewOnly || contactList.contactMastDto.consValue === "PHY"}
                            size="small"
                            fullWidth
                            control={control}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 3 }}>
                      <Controller
                        name="conFName"
                        control={control}
                        render={({ field, fieldState }) => (
                          <FormField
                            type="text"
                            label="First Name"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e.target.value.toUpperCase());
                              handleInputChange("conFName", e.target.value.toUpperCase());
                            }}
                            helperText={fieldState.error?.message}
                            disabled={viewOnly}
                            size="small"
                            fullWidth
                            control={control}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 3 }}>
                      <Controller
                        name="conLName"
                        control={control}
                        render={({ field, fieldState }) => (
                          <FormField
                            type="text"
                            label="Last Name"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e.target.value.toUpperCase());
                              handleInputChange("conLName", e.target.value.toUpperCase());
                            }}
                            helperText={fieldState.error?.message}
                            disabled={viewOnly}
                            size="small"
                            fullWidth
                            control={control}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 3 }}>
                      <Controller
                        name="conGender"
                        control={control}
                        render={({ field, fieldState }) => (
                          <FormField
                            type="select"
                            label="Gender"
                            {...field}
                            options={dropdownValues.gender || []}
                            helperText={fieldState.error?.message}
                            disabled={viewOnly}
                            size="small"
                            control={control}
                            fullWidth
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 3 }}>
                      <Controller
                        name="conDob"
                        control={control}
                        render={({ field, fieldState }) => (
                          <FormField
                            type="datepicker"
                            label="Birth Date"
                            {...field}
                            helperText={fieldState.error?.message}
                            disabled={viewOnly}
                            control={control}
                            size="small"
                            fullWidth
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField
                        type="select"
                        label="Blood Group"
                        name="conBldGrp"
                        options={dropdownValues.bloodGroup || []}
                        onChange={(e) => handleInputChange("conBldGrp", e.target.value)}
                        disabled={viewOnly}
                        size="small"
                        control={control}
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField
                        type="select"
                        label="Marital Status"
                        name="maritalStatus"
                        options={dropdownValues.maritalStatus || []}
                        onChange={(e) => handleInputChange("maritalStatus", e.target.value)}
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        control={control}
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField
                        type="text"
                        label="ID/Passport No"
                        name="conSSNID"
                        onChange={(e) => handleInputChange("conSSNID", e.target.value)}
                        disabled={viewOnly}
                        size="small"
                        control={control}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Contact Details Card */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Contact Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField
                        type="text"
                        label="Mobile No"
                        name="cAddPhone1"
                        onChange={(e) => handleInputChange("cAddPhone1", e.target.value)}
                        disabled={viewOnly}
                        control={control}
                        size="small"
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField
                        type="select"
                        label="City"
                        name="cAddCity"
                        control={control}
                        options={dropdownValues.city || []}
                        onChange={(e) => handleInputChange("cAddCity", e.target.value)}
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField
                        type="select"
                        label="State"
                        control={control}
                        name="cAddState"
                        options={dropdownValues.state || []}
                        onChange={(e) => handleInputChange("cAddState", e.target.value)}
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField
                        type="email"
                        label="E-Mail ID"
                        control={control}
                        name="cAddEmail"
                        onChange={(e) => handleInputChange("cAddEmail", e.target.value)}
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Account Details Card */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Account Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField
                        type="text"
                        label="Account Code"
                        control={control}
                        name="accCode"
                        onChange={(e) => handleInputChange("accCode", e.target.value)}
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField
                        type="text"
                        label="Account Pay Code"
                        control={control}
                        name="accPayCode"
                        onChange={(e) => handleInputChange("accPayCode", e.target.value)}
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField
                        type="select"
                        label="Employee Status"
                        control={control}
                        name="conEmpStatus"
                        options={dropdownValues.employeeStatus || []}
                        onChange={(e) => handleInputChange("conEmpStatus", e.target.value)}
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Settings Card */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Contact Settings
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {renderSwitches()}
                </CardContent>
              </Card>
            </Grid>

            {/* Notes Card */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Additional Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12 }}>
                      <Controller
                        name="rNotes"
                        control={control}
                        render={({ field }) => (
                          <FormField
                            type="textarea"
                            control={control}
                            label="Notes"
                            {...field}
                            disabled={viewOnly}
                            size="small"
                            fullWidth
                            rows={4}
                            placeholder="Enter any additional information about this contact"
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </GenericDialog>

      <ConfirmationDialog
        open={showResetConfirmation}
        onClose={() => setShowResetConfirmation(false)}
        onConfirm={() => {
          performReset();
          setShowResetConfirmation(false);
        }}
        title="Reset Form"
        message="Are you sure you want to reset the form? All unsaved changes will be lost."
        confirmText="Reset"
        cancelText="Cancel"
        type="warning"
        maxWidth="sm"
      />

      <ConfirmationDialog
        open={showCancelConfirmation}
        onClose={() => setShowCancelConfirmation(false)}
        onConfirm={() => {
          setShowCancelConfirmation(false);
          onClose();
        }}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to cancel?"
        confirmText="Yes, Cancel"
        cancelText="Continue Editing"
        type="warning"
        maxWidth="sm"
      />

      <ModifiedFieldDialog
        open={isFieldDialogOpen}
        onClose={() => setIsFieldDialogOpen(false)}
        selectedCategoryCode={dialogCategory}
        isFieldCodeDisabled={true}
        onFieldAddedOrUpdated={() => {
          const dropdownMap: Record<string, any> = {
            EMPROOM: "employeeRoom",
            NATIONALITY: "nationality",
            CITY: "city",
            STATE: "state",
          };
          const dropdownType = dropdownMap[dialogCategory];
          if (dropdownType) {
            refreshDropdownValues(dropdownType);
          }
        }}
      />
    </>
  );
};

export default ContactListForm;
