import SmartButton from "@/components/Button/SmartButton";
import CustomSwitch from "@/components/Checkbox/ColorSwitch";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import ModifiedFieldDialog from "@/components/ModifiedFieldDailog/ModifiedFieldDailog";
import { useLoading } from "@/hooks/Common/useLoading";
import { useServerDate } from "@/hooks/Common/useServerDate";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { ContactListData, ContactMastData } from "@/interfaces/HospitalAdministration/ContactListData";
import { useAlert } from "@/providers/AlertProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cancel, Save } from "@mui/icons-material";
import { Alert, Box, Card, CardContent, Divider, Grid, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useContactList } from "../hooks/useContactListForm";

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
  cAddPhone1: z.string().optional(),
  cAddCity: z.string().optional(),
  cAddState: z.string().optional(),
  cAddEmail: z.string().optional(),
  accCode: z.string().optional(),
  accPayCode: z.string().optional(),
  conEmpStatus: z.string().optional(),
  maritalStatus: z.string().optional(),
  deptID: z.number().optional(),
});

type ContactFormData = z.infer<typeof schema>;

const ContactListForm: React.FC<ContactListFormProps> = ({ open, onClose, initialData, viewOnly = false }) => {
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();
  const { getContactById, saveContact } = useContactList();
  const serverDate = useServerDate();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [selectedSpecialities, setSelectedSpecialities] = useState<string[]>([]);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [dialogCategory] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [contactDetails, setContactDetails] = useState<ContactListData | null>(null);
  const isAddMode = !initialData;

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

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    getValues,
    formState: { isDirty, isValid },
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
      cAddPhone1: "",
      cAddCity: "",
      cAddState: "",
      cAddEmail: "",
      accCode: "",
      accPayCode: "",
      conEmpStatus: "",
      maritalStatus: "",
      deptID: 0,
    },
  });

  const watchedCategory = watch("consValue");
  const watchedEmployeeSwitch = switchStates.isEmployee;

  useEffect(() => {
    const loadContactDetails = async () => {
      if (initialData && initialData.conID) {
        try {
          setLoading(true);
          const details = await getContactById(initialData.conID);
          if (details) {
            setContactDetails(details);
            const contactMast = details.contactMastDto;
            const contactAddress = details.contactAddressDto;
            reset({
              conID: contactMast.conID,
              conCode: contactMast.conCode || "",
              conTitle: contactMast.conTitle || "",
              conFName: contactMast.conFName || "",
              conLName: contactMast.conLName || "",
              conMName: contactMast.conMName || "",
              conDob: new Date(contactMast.conDob),
              conGender: contactMast.conGender || "",
              conSSNID: contactMast.conSSNID || "",
              conBldGrp: contactMast.conBldGrp || "",
              conCat: contactMast.conCat || "",
              consValue: contactMast.consValue || "",
              rActiveYN: contactMast.rActiveYN || "Y",
              transferYN: contactMast.transferYN || "N",
              rNotes: contactMast.rNotes || "",
              cAddPhone1: contactAddress?.cAddPhone1 || "",
              cAddCity: contactAddress?.cAddCity || "",
              cAddState: contactAddress?.cAddState || "",
              cAddEmail: contactAddress?.cAddEmail || "",
              accCode: contactMast.accCode || "",
              accPayCode: contactMast.accPayCode || "",
              conEmpStatus: contactMast.conEmpStatus || "",
              maritalStatus: contactMast.maritalStatus || "",
              deptID: contactMast.deptID || 0,
            });
            setSwitchStates({
              isEmployee: contactMast.isEmployeeYN === "Y",
              isReferral: contactMast.isRefferalYN === "Y",
              isAppointment: contactMast.isAppointmentYN === "Y",
              isSuperSpeciality: contactMast.isSuperSpecialtyYN === "Y",
              isUserRequired: contactMast.isUserRequiredYN === "Y",
              isAuthorisedUser: contactMast.isAuthorizedUserYN === "Y",
              isContract: contactMast.isContractYN === "Y",
            });
            if (details.contactDetailsDto && details.contactDetailsDto.length > 0) {
              const specialties = details.contactDetailsDto.map((detail) => detail.facName.toString());
              setSelectedSpecialities(specialties);
            }
          } else {
            populateFormWithInitialData();
          }
        } catch (error) {
          populateFormWithInitialData();
        } finally {
          setLoading(false);
        }
      }
    };

    const populateFormWithInitialData = () => {
      if (initialData) {
        reset({
          conID: initialData.conID || 0,
          conCode: initialData.conCode || "",
          conTitle: initialData.conTitle || "",
          conFName: initialData.conFName || "",
          conLName: initialData.conLName || "",
          conMName: initialData.conMName || "",
          conDob: initialData.conDob ? new Date(initialData.conDob) : serverDate,
          conGender: initialData.conGender || "",
          conSSNID: initialData.conSSNID || "",
          conBldGrp: initialData.conBldGrp || "",
          conCat: initialData.conCat || "",
          consValue: initialData.consValue || "",
          rActiveYN: initialData.rActiveYN || "Y",
          transferYN: initialData.transferYN || "N",
          rNotes: initialData.rNotes || "",
          cAddPhone1: "",
          cAddCity: "",
          cAddState: "",
          cAddEmail: "",
          accCode: initialData.accCode || "",
          accPayCode: initialData.accPayCode || "",
          conEmpStatus: initialData.conEmpStatus || "",
          maritalStatus: initialData.maritalStatus || "",
          deptID: initialData.deptID || 0,
        });
        setSwitchStates({
          isEmployee: initialData.isEmployeeYN === "Y",
          isReferral: initialData.isRefferalYN === "Y",
          isAppointment: initialData.isAppointmentYN === "Y",
          isSuperSpeciality: initialData.isSuperSpecialtyYN === "Y",
          isUserRequired: initialData.isUserRequiredYN === "Y",
          isAuthorisedUser: initialData.isAuthorizedUserYN === "Y",
          isContract: initialData.isContractYN === "Y",
        });
      }
    };

    if (!isAddMode && initialData && initialData.conID) {
      loadContactDetails();
    }
  }, [initialData?.conID, isAddMode, reset, serverDate]);

  const handleCategoryChange = useCallback(
    (value: any) => {
      let selectedCategory = value;
      if (value && typeof value === "object") {
        if (value.value !== undefined) {
          selectedCategory = value.value;
        } else if (value.target && value.target.value !== undefined) {
          selectedCategory = value.target.value;
        }
      }
      const selectedPhysician = selectedCategory === "PHY";
      setValue("consValue", selectedCategory, { shouldValidate: true, shouldDirty: true });
      setValue("conCat", selectedCategory, { shouldValidate: true, shouldDirty: true });

      if (selectedPhysician) {
        setValue("conTitle", "DR", { shouldValidate: true, shouldDirty: true });
      }
    },
    [setValue]
  );

  const handleSpecialityChange = useCallback((values: any) => {
    let specialities = [];
    if (Array.isArray(values)) {
      specialities = values;
    } else if (values && typeof values === "object" && values.target) {
      specialities = values.target.value || [];
    } else if (values) {
      specialities = [values];
    }
    setSelectedSpecialities(specialities);
  }, []);

  const handleSwitchChange = useCallback(
    (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setSwitchStates((prev) => ({ ...prev, [name]: event.target.checked }));
    },
    []
  );

  const onSubmit = useCallback(
    async (data: ContactFormData) => {
      if (viewOnly) return;
      setIsSubmitted(true);
      setFormError(null);
      try {
        debugger;
        setIsSaving(true);
        setLoading(true);
        if (data.consValue === "PHY") {
          if (!data.accCode) {
            throw new Error("Account code is required for physicians");
          }
          if (selectedSpecialities.length === 0) {
            throw new Error("At least one speciality is required for physicians");
          }
        }

        const existingAddressData =
          !isAddMode && contactDetails?.contactAddressDto
            ? contactDetails.contactAddressDto
            : {
                cAddID: 0,
                conID: data.conID,
                conCode: data.conCode,
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
              };

        const contactData: ContactListData = {
          contactMastDto: {
            conID: data.conID,
            conCode: data.conCode,
            conTitle: data.conTitle,
            conFName: data.conFName,
            conLName: data.conLName,
            conMName: data.conMName || "",
            conDob: data.conDob,
            conGender: data.conGender,
            conSSNID: data.conSSNID || "",
            conBldGrp: data.conBldGrp || "",
            conCat: data.conCat,
            consValue: data.consValue,
            conEmpYN: "N",
            rActiveYN: data.rActiveYN,
            rNotes: data.rNotes || "",
            conEmpStatus: data.conEmpStatus || "",
            allergicToAllergence: initialData?.allergicToAllergence || "",
            allergicToMedicine: initialData?.allergicToMedicine || "",
            aPHYRMID: initialData?.aPHYRMID || 0,
            aPhyRoomName: initialData?.aPhyRoomName || "",
            deptID: data.deptID || 0,
            deptName: initialData?.deptName || "",
            designation: initialData?.designation || "",
            emergenContactName: initialData?.emergenContactName || "",
            iPP: initialData?.iPP || 0,
            oPP: initialData?.oPP || 0,
            isAuthorizedUserYN: switchStates.isAuthorisedUser ? "Y" : "N",
            isContractYN: switchStates.isContract ? "Y" : "N",
            isSuperSpecialtyYN: switchStates.isSuperSpeciality ? "Y" : "N",
            isEmployeeYN: switchStates.isEmployee ? "Y" : "N",
            isRefferalYN: switchStates.isReferral ? "Y" : "N",
            isAppointmentYN: switchStates.isAppointment ? "Y" : "N",
            isUserRequiredYN: switchStates.isUserRequired ? "Y" : "N",
            maritalStatus: data.maritalStatus || "",
            tINNo: initialData?.tINNo || "",
            accCode: data.accCode || "",
            accPayCode: data.accPayCode || "",
            gESYCode: initialData?.gESYCode || "",
            digSignPath: initialData?.digSignPath || "",
            stampPath: initialData?.stampPath || "",
            payPolicy: initialData?.payPolicy || 0,
            transferYN: data.transferYN,
          },
          contactAddressDto: {
            ...existingAddressData,
            conID: data.conID,
            conCode: data.conCode,
            cAddCity: data.cAddCity || "",
            cAddEmail: data.cAddEmail || "",
            cAddPhone1: data.cAddPhone1 || "",
            cAddState: data.cAddState || "",
          },
          contactDetailsDto: selectedSpecialities.map((val) => {
            const existingDetail = contactDetails?.contactDetailsDto?.find((d) => d.facID.toString() === val);
            return {
              facID: parseInt(val),
              facName: dropdownValues.speciality?.find((opt) => opt.value === val)?.label || "",
              transferYN: "N",
              cdID: existingDetail?.cdID || 0,
              conID: data.conID,
              conType: existingDetail?.conType || "",
              rActiveYN: "Y",
              rNotes: "",
            };
          }),
        };

        const response = await saveContact(contactData);

        if (response.success) {
          showAlert("Success", isAddMode ? "Contact created successfully" : "Contact updated successfully", "success");
          onClose(true);
        } else {
          throw new Error(response.errorMessage || "Failed to save contact");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to save contact";
        setFormError(errorMessage);
        showAlert("Error", errorMessage, "error");
      } finally {
        setIsSaving(false);
        setLoading(false);
      }
    },
    [viewOnly, selectedSpecialities, switchStates, dropdownValues.speciality, saveContact, isAddMode, onClose, initialData, contactDetails]
  );

  const handleReset = useCallback(() => {
    if (isDirty) {
      setShowResetConfirmation(true);
    } else {
      performReset();
    }
  }, [isDirty]);

  const performReset = useCallback(() => {
    if (initialData) {
      if (contactDetails) {
        const contactMast = contactDetails.contactMastDto;
        setSwitchStates({
          isEmployee: contactMast.isEmployeeYN === "Y",
          isReferral: contactMast.isRefferalYN === "Y",
          isAppointment: contactMast.isAppointmentYN === "Y",
          isSuperSpeciality: contactMast.isSuperSpecialtyYN === "Y",
          isUserRequired: contactMast.isUserRequiredYN === "Y",
          isAuthorisedUser: contactMast.isAuthorizedUserYN === "Y",
          isContract: contactMast.isContractYN === "Y",
        });

        if (contactDetails.contactDetailsDto && contactDetails.contactDetailsDto.length > 0) {
          const specialties = contactDetails.contactDetailsDto.map((detail) => detail.facID.toString());
          setSelectedSpecialities(specialties);
        }
      }
    } else {
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
    setIsSubmitted(false);
  }, [initialData, reset, contactDetails]);

  const handleCancel = useCallback(() => {
    if (isDirty) {
      setShowCancelConfirmation(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  const dialogTitle = useMemo(() => {
    if (viewOnly) return "View Contact Details";
    if (isAddMode) return "Create New Contact";

    const formValues = getValues();
    return `Edit Contact - ${formValues.conFName} ${formValues.conLName}`;
  }, [viewOnly, isAddMode, getValues]);

  const dialogActions = useMemo(() => {
    if (viewOnly) {
      return <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />;
    }

    return (
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
  }, [viewOnly, onClose, handleCancel, isSaving, handleReset, isDirty, formError, handleSubmit, onSubmit, isAddMode, isValid]);

  const renderSwitches = useMemo(() => {
    const switches = [
      { label: "Employee", name: "isEmployee" },
      { label: "Referral", name: "isReferral" },
      ...(watchedCategory === "PHY"
        ? [
            { label: "Appointment", name: "isAppointment" },
            { label: "Super Speciality", name: "isSuperSpeciality" },
          ]
        : []),
      ...(watchedEmployeeSwitch
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
  }, [watchedCategory, watchedEmployeeSwitch, switchStates, handleSwitchChange, viewOnly]);

  return (
    <>
      <GenericDialog
        open={open}
        onClose={() => onClose()}
        title={dialogTitle}
        maxWidth="xxl"
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
                <FormField name="rActiveYN" control={control} type="switch" label="Active" disabled={viewOnly} size="small" />
              </Box>
            </Grid>

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
                        name="consValue"
                        control={control}
                        type="select"
                        label="Category"
                        options={dropdownValues.category || []}
                        onChange={handleCategoryChange}
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        required
                        isSubmitted={isSubmitted}
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField
                        name="conCode"
                        control={control}
                        type="text"
                        label="Code"
                        disabled={viewOnly || !isAddMode}
                        size="small"
                        fullWidth
                        required
                        isSubmitted={isSubmitted}
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField
                        name="deptID"
                        control={control}
                        type="select"
                        label="Department"
                        options={dropdownValues.department || []}
                        onChange={(value) => {
                          const deptValue = typeof value === "object" ? value.value : value;
                          setValue("deptID", Number(deptValue) || 0);
                        }}
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                      />
                    </Grid>

                    {watchedCategory === "PHY" && (
                      <Grid size={{ sm: 12, md: 3 }}>
                        <FormField
                          name="specialities"
                          control={control}
                          type="multiselect"
                          label="Speciality"
                          options={dropdownValues.speciality || []}
                          onChange={(values) => {
                            let specialities = Array.isArray(values) ? values : [values];
                            setSelectedSpecialities(specialities);
                            handleSpecialityChange(specialities);
                          }}
                          disabled={viewOnly}
                          size="small"
                          fullWidth
                          defaultValue={selectedSpecialities.map((id) => {
                            const option = dropdownValues.speciality?.find((opt) => opt.value === id);
                            return option ? option.value : id;
                          })}
                        />
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Personal Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField
                        name="conTitle"
                        control={control}
                        type="select"
                        label="Title"
                        options={dropdownValues.title || []}
                        disabled={viewOnly || watchedCategory === "PHY"}
                        size="small"
                        fullWidth
                        required
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField
                        name="conFName"
                        control={control}
                        type="text"
                        label="First Name"
                        onChange={(e) => {
                          let value = "";
                          if (typeof e === "string") {
                            value = e.toUpperCase();
                          } else if (e && e.target) {
                            value = e.target.value.toUpperCase();
                          }
                          setValue("conFName", value, { shouldValidate: true, shouldDirty: true });
                        }}
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        required
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField
                        name="conLName"
                        control={control}
                        type="text"
                        label="Last Name"
                        onChange={(e) => {
                          let value = "";
                          if (typeof e === "string") {
                            value = e.toUpperCase();
                          } else if (e && e.target) {
                            value = e.target.value.toUpperCase();
                          }
                          setValue("conLName", value, { shouldValidate: true, shouldDirty: true });
                        }}
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        required
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField
                        name="conGender"
                        control={control}
                        type="select"
                        label="Gender"
                        options={dropdownValues.gender || []}
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        required
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField name="conDob" control={control} type="datepicker" label="Birth Date" disabled={viewOnly} size="small" fullWidth required />
                    </Grid>

                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField
                        name="conBldGrp"
                        control={control}
                        type="select"
                        label="Blood Group"
                        options={dropdownValues.bloodGroup || []}
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField
                        name="maritalStatus"
                        control={control}
                        type="select"
                        label="Marital Status"
                        options={dropdownValues.maritalStatus || []}
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField name="conSSNID" control={control} type="text" label="ID/Passport No" disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField name="conMName" control={control} type="text" label="Middle Name" disabled={viewOnly} size="small" fullWidth />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Contact Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField name="cAddPhone1" control={control} type="text" label="Mobile No" disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField name="cAddCity" control={control} type="select" label="City" options={dropdownValues.city || []} disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField name="cAddState" control={control} type="select" label="State" options={dropdownValues.state || []} disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 3 }}>
                      <FormField name="cAddEmail" control={control} type="email" label="E-Mail ID" disabled={viewOnly} size="small" fullWidth />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Account Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField name="accCode" control={control} type="text" label="Account Code" disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField name="accPayCode" control={control} type="text" label="Account Pay Code" disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField
                        name="conEmpStatus"
                        control={control}
                        type="select"
                        label="Employee Status"
                        options={dropdownValues.employeeStatus || []}
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Contact Settings
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {renderSwitches}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Additional Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12 }}>
                      <FormField
                        name="rNotes"
                        control={control}
                        type="textarea"
                        label="Notes"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        rows={4}
                        placeholder="Enter any additional information about this contact"
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
