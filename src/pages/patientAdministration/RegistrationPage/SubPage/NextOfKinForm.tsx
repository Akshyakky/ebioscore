import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Grid } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { useForm, FormProvider } from "react-hook-form";
import { useAppSelector } from "@/store/hooks";
import { AppModifyFieldDto } from "@/interfaces/HospitalAdministration/AppModifiedListDto";
import { PatNokDetailsDto } from "@/interfaces/PatientAdministration/PatNokDetailsDto";
import { usePatientAutocomplete } from "@/hooks/PatientAdminstration/usePatientAutocomplete";
import { useServerDate } from "@/hooks/Common/useServerDate";
import useDropdownValues, { DropdownType } from "@/hooks/PatientAdminstration/useDropdownValues";
import { useLoading } from "@/context/LoadingContext";
import { showAlert } from "@/utils/Common/showAlert";
import extractNumbers from "@/utils/PatientAdministration/extractNumbers";
import { PatientService } from "@/services/PatientAdministrationServices/RegistrationService/PatientService";
import ModifiedFieldDialog from "@/components/ModifiedFieldDailog/ModifiedFieldDailog";
import CustomButton from "@/components/Button/CustomButton";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { notifyError, notifyWarning } from "@/utils/Common/toastManager";

// Import Zod schema and form hook
import { useZodForm } from "@/hooks/Common/useZodForm";
import ZodFormField from "@/components/ZodFormField/ZodFormField";
import { patNokDetailsSchema } from "../MainPage/PatientRegistrationScheme";

interface NextOfKinFormProps {
  show: boolean;
  handleClose: () => void;
  handleSave: (kinDetails: PatNokDetailsDto) => void;
  editData?: PatNokDetailsDto | null;
}

const NextOfKinFormWithZod: React.FC<NextOfKinFormProps> = ({ show, handleClose, handleSave, editData }) => {
  const userInfo = useAppSelector((state) => state.auth);
  const { fetchPatientSuggestions } = usePatientAutocomplete();
  const serverDate = useServerDate();
  const { refreshDropdownValues, ...dropdownValues } = useDropdownValues(["title", "relation", "area", "city", "country", "nationality"]);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [dialogCategory, setDialogCategory] = useState<string>("");
  const { setLoading } = useLoading();

  // Initialize form with Zod validation
  const nextOfKinInitialFormState: PatNokDetailsDto = useMemo(
    () => ({
      ID: 0,
      pNokID: 0,
      pChartID: 0,
      pNokPChartID: 0,
      pNokPChartCode: "",
      pNokRegStatusVal: "Y",
      pNokRegStatus: "Registered",
      pNokPssnID: "",
      pNokDob: serverDate,
      pNokRelNameVal: "",
      pNokRelName: "",
      pNokTitleVal: "",
      pNokTitle: "",
      pNokFName: "",
      pNokMName: "",
      pNokLName: "",
      pNokActualCountryVal: "",
      pNokActualCountry: "",
      pNokAreaVal: "",
      pNokArea: "",
      pNokCityVal: "",
      pNokCity: "",
      pNokCountryVal: "",
      pNokCountry: "",
      pNokDoorNo: "",
      pAddPhone1: "",
      pAddPhone2: "",
      pAddPhone3: "",
      pNokPostcode: "",
      pNokState: "",
      pNokStreet: "",
      rActiveYN: "Y",
      compID: userInfo.compID ?? 0,
      compCode: userInfo.compCode ?? "",
      compName: userInfo.compName ?? "",
      rNotes: "",
      transferYN: "N",
    }),
    [userInfo, serverDate]
  );

  // Set up form with Zod validation
  const methods = useZodForm(patNokDetailsSchema, {
    defaultValues: nextOfKinInitialFormState,
    mode: "onBlur",
  });

  const { handleSubmit, reset, setValue, watch, formState } = methods;
  const { errors } = formState;

  // Watch for reg status changes
  const regStatusVal = watch("pNokRegStatusVal");

  // Reset form to initial state
  const resetNextOfKinFormData = useCallback(() => {
    reset(nextOfKinInitialFormState);
  }, [reset, nextOfKinInitialFormState]);

  // Initialize form with edit data when provided
  useEffect(() => {
    if (editData) {
      reset({
        ...nextOfKinInitialFormState,
        ...editData,
        pNokDob: editData.pNokDob || serverDate,
        pNokPChartCode: editData.pNokPChartCode || "",
      });
    } else {
      resetNextOfKinFormData();
    }
  }, [editData, nextOfKinInitialFormState, serverDate, resetNextOfKinFormData, reset]);

  // Handle form submission
  const onSubmit = useCallback(
    async (data: PatNokDetailsDto) => {
      setLoading(true);
      try {
        await handleSave(data);
        showAlert("Success", "The Kin Details Saved successfully", "success");
        resetNextOfKinFormData();
        handleClose();
      } catch (error) {
        showAlert("Error", "Failed to save Kin details. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    },
    [handleSave, handleClose, resetNextOfKinFormData, setLoading]
  );

  // Clean up and close
  const handleCloseWithClear = useCallback(() => {
    resetNextOfKinFormData();
    handleClose();
  }, [resetNextOfKinFormData, handleClose]);

  // Radio options
  const regOptions = [
    { value: "Y", label: "Registered" },
    { value: "N", label: "Non Registered" },
  ];

  // Handle patient selection from autocomplete
  const handlePatientSelect = useCallback(
    async (selectedSuggestion: string) => {
      setLoading(true);
      try {
        const pChartID = extractNumbers(selectedSuggestion)[0] || null;
        if (pChartID) {
          setValue("pNokPChartCode", selectedSuggestion.split("|")[0].trim());
          setValue("pNokPChartID", pChartID);

          const response = await PatientService.getPatientDetails(pChartID);
          if (response.success && response.data) {
            const patientDetails = response.data;

            // Update form with patient details
            setValue("pNokFName", patientDetails.patRegisters.pFName || "");
            setValue("pNokMName", patientDetails.patRegisters.pMName || "");
            setValue("pNokLName", patientDetails.patRegisters.pLName || "");
            setValue("pNokTitleVal", patientDetails.patRegisters.pTitle || "");
            setValue("pNokDob", patientDetails.patRegisters.pDob ? new Date(patientDetails.patRegisters.pDob) : serverDate);
            setValue("pNokRelNameVal", patientDetails.patRegisters.pTypeName || "");
            setValue("pNokStreet", patientDetails.patAddress.pAddStreet || "");
            setValue("pNokAreaVal", patientDetails.patAddress.patAreaVal || "");
            setValue("pNokCityVal", patientDetails.patAddress.pAddCityVal || "");
            setValue("pNokActualCountryVal", patientDetails.patAddress.pAddActualCountryVal || "");
            setValue("pNokPostcode", patientDetails.patAddress.pAddPostcode || "");
            setValue("pAddPhone1", patientDetails.patAddress.pAddPhone1 || "");
            setValue("pNokCountryVal", patientDetails.patAddress.pAddActualCountryVal || "");
            setValue("pNokPssnID", patientDetails.patRegisters.intIdPsprt || "");
          }
        }
      } catch (error) {
        notifyError("Failed to load patient details");
      } finally {
        setLoading(false);
      }
    },
    [setLoading, serverDate, setValue]
  );

  // Handle modified field dialog
  const [, setFormDataDialog] = useState<AppModifyFieldDto>({
    amlID: 0,
    amlName: "",
    amlCode: "",
    amlField: "",
    defaultYN: "N",
    modifyYN: "N",
    rNotes: "",
    rActiveYN: "Y",
    compID: 0,
    compCode: "",
    compName: "",
    transferYN: "Y",
  });

  const handleAddField = (category: string) => {
    setDialogCategory(category);
    setFormDataDialog({
      amlID: 0,
      amlName: "",
      amlCode: "",
      amlField: category,
      defaultYN: "N",
      modifyYN: "N",
      rNotes: "",
      rActiveYN: "Y",
      compID: 0,
      compCode: "",
      compName: "",
      transferYN: "Y",
    });
    setIsFieldDialogOpen(true);
  };

  const handleFieldDialogClose = () => {
    setIsFieldDialogOpen(false);
  };

  const onFieldAddedOrUpdated = () => {
    if (dialogCategory) {
      const dropdownMap: Record<string, DropdownType> = {
        CITY: "city",
        AREA: "area",
        COUNTRY: "country",
        NATIONALITY: "nationality",
        RELATION: "relation",
      };
      const dropdownType = dropdownMap[dialogCategory];
      if (dropdownType) {
        refreshDropdownValues(dropdownType);
      }
    }
  };

  // Form content
  const dialogContent = (
    <FormProvider {...methods}>
      <Grid container spacing={2}>
        <ZodFormField
          name="pNokRegStatusVal"
          control={methods.control}
          type="radio"
          label="NOK Type"
          options={regOptions}
          inline={true}
          errors={errors}
          gridProps={{ xs: 12, sm: 6, md: 4 }}
          onChange={(val) => {
            const selectedOption = regOptions.find((opt) => opt.value === val);
            if (selectedOption) {
              setValue("pNokRegStatus", selectedOption.label);
            }
          }}
        />

        {regStatusVal === "Y" && (
          <ZodFormField
            name="pNokPChartCode"
            control={methods.control}
            type="autocomplete"
            label="UHID"
            placeholder="Search through UHID, Name, DOB, Phone No...."
            isMandatory
            errors={errors}
            gridProps={{ xs: 12, sm: 6, md: 4 }}
            fetchSuggestions={fetchPatientSuggestions}
            onSelectSuggestion={handlePatientSelect}
            onChange={(e) => {
              setValue("pNokPChartCode", e.target.value);
              setValue("pNokPChartID", 0); // Invalidate selection
            }}
          />
        )}

        <ZodFormField
          name="pNokTitleVal"
          control={methods.control}
          type="select"
          label="Title"
          options={dropdownValues.title || []}
          isMandatory
          errors={errors}
          gridProps={{ xs: 12, sm: 6, md: 4 }}
          onChange={(val) => {
            const selectedOption = dropdownValues.title?.find((opt) => opt.value === val);
            if (selectedOption) {
              setValue("pNokTitle", selectedOption.label);
            }
          }}
        />

        <ZodFormField name="pNokFName" control={methods.control} type="text" label="First Name" isMandatory errors={errors} gridProps={{ xs: 12, sm: 6, md: 4 }} />

        <ZodFormField name="pNokLName" control={methods.control} type="text" label="Last Name" isMandatory errors={errors} gridProps={{ xs: 12, sm: 6, md: 4 }} />

        <ZodFormField
          name="pNokRelNameVal"
          control={methods.control}
          type="select"
          label="Relationship"
          options={dropdownValues.relation || []}
          isMandatory
          errors={errors}
          gridProps={{ xs: 12, sm: 6, md: 4 }}
          showAddButton={true}
          onAddClick={() => handleAddField("RELATION")}
          onChange={(val) => {
            const selectedOption = dropdownValues.relation?.find((opt) => opt.value === val);
            if (selectedOption) {
              setValue("pNokRelName", selectedOption.label);
            }
          }}
        />

        <ZodFormField name="pNokDob" control={methods.control} type="datepicker" label="Birth Date" errors={errors} gridProps={{ xs: 12, sm: 6, md: 4 }} />

        <ZodFormField name="pAddPhone1" control={methods.control} type="text" label="Mobile No" maxLength={20} isMandatory errors={errors} gridProps={{ xs: 12, sm: 6, md: 4 }} />

        <ZodFormField name="pNokStreet" control={methods.control} type="text" label="Address" errors={errors} gridProps={{ xs: 12, sm: 6, md: 4 }} />

        <ZodFormField
          name="pNokAreaVal"
          control={methods.control}
          type="select"
          label="Area"
          options={dropdownValues.area || []}
          errors={errors}
          gridProps={{ xs: 12, sm: 6, md: 4 }}
          showAddButton={true}
          onAddClick={() => handleAddField("AREA")}
          onChange={(val) => {
            const selectedOption = dropdownValues.area?.find((opt) => opt.value === val);
            if (selectedOption) {
              setValue("pNokArea", selectedOption.label);
            }
          }}
        />

        <ZodFormField
          name="pNokCityVal"
          control={methods.control}
          type="select"
          label="City"
          options={dropdownValues.city || []}
          errors={errors}
          gridProps={{ xs: 12, sm: 6, md: 4 }}
          showAddButton={true}
          onAddClick={() => handleAddField("CITY")}
          onChange={(val) => {
            const selectedOption = dropdownValues.city?.find((opt) => opt.value === val);
            if (selectedOption) {
              setValue("pNokCity", selectedOption.label);
            }
          }}
        />

        <ZodFormField
          name="pNokActualCountryVal"
          control={methods.control}
          type="select"
          label="Country"
          options={dropdownValues.country || []}
          errors={errors}
          gridProps={{ xs: 12, sm: 6, md: 4 }}
          showAddButton={true}
          onAddClick={() => handleAddField("COUNTRY")}
          onChange={(val) => {
            const selectedOption = dropdownValues.country?.find((opt) => opt.value === val);
            if (selectedOption) {
              setValue("pNokActualCountry", selectedOption.label);
            }
          }}
        />

        <ZodFormField name="pNokPostcode" control={methods.control} type="text" label="Post Code" errors={errors} gridProps={{ xs: 12, sm: 6, md: 4 }} />

        <ZodFormField name="pAddPhone3" control={methods.control} type="text" label="Land Line No" errors={errors} gridProps={{ xs: 12, sm: 6, md: 4 }} />

        <ZodFormField
          name="pNokCountryVal"
          control={methods.control}
          type="select"
          label="Nationality"
          options={dropdownValues.nationality || []}
          errors={errors}
          gridProps={{ xs: 12, sm: 6, md: 4 }}
          showAddButton={true}
          onAddClick={() => handleAddField("NATIONALITY")}
          onChange={(val) => {
            const selectedOption = dropdownValues.nationality?.find((opt) => opt.value === val);
            if (selectedOption) {
              setValue("pNokCountry", selectedOption.label);
            }
          }}
        />

        <ZodFormField name="pNokPssnID" control={methods.control} type="text" label="Passport No" errors={errors} gridProps={{ xs: 12, sm: 6, md: 4 }} />

        <ZodFormField name="pAddPhone2" control={methods.control} type="text" label="Work Phone No" errors={errors} gridProps={{ xs: 12, sm: 6, md: 4 }} />
      </Grid>

      <ModifiedFieldDialog
        open={isFieldDialogOpen}
        onClose={handleFieldDialogClose}
        selectedCategoryCode={dialogCategory}
        onFieldAddedOrUpdated={onFieldAddedOrUpdated}
        isFieldCodeDisabled={true}
      />
    </FormProvider>
  );

  // Dialog action buttons
  const dialogActions = (
    <>
      <CustomButton variant="contained" size="medium" onClick={handleCloseWithClear} text="Close" color="secondary" icon={CloseIcon} ariaLabel="Close" />
      <CustomButton icon={SaveIcon} variant="contained" size="medium" text="Save" color="success" onClick={handleSubmit(onSubmit)} ariaLabel="Save Nok" />
    </>
  );

  return (
    <GenericDialog
      open={show}
      onClose={handleCloseWithClear}
      title="Add Next Of Kin"
      maxWidth="lg"
      fullWidth
      dialogContentSx={{ p: 2 }}
      actions={dialogActions}
      disableBackdropClick={true}
    >
      {dialogContent}
    </GenericDialog>
  );
};

export default React.memo(NextOfKinFormWithZod);
