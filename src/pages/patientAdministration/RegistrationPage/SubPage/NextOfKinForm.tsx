import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Grid } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
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
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import ModifiedFieldDialog from "@/components/ModifiedFieldDailog/ModifiedFieldDailog";
import CustomButton from "@/components/Button/CustomButton";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { notifyError, notifyWarning } from "@/utils/Common/toastManager";

interface NextOfKinFormProps {
  show: boolean;
  handleClose: () => void;
  handleSave: (kinDetails: PatNokDetailsDto) => void;
  editData?: PatNokDetailsDto | null;
}

const NextOfKinForm: React.FC<NextOfKinFormProps> = ({ show, handleClose, handleSave, editData }) => {
  const userInfo = useAppSelector((state) => state.auth);
  const { fetchPatientSuggestions } = usePatientAutocomplete();
  const serverDate = useServerDate();
  const { refreshDropdownValues, ...dropdownValues } = useDropdownValues(["title", "relation", "area", "city", "country", "nationality"]);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [dialogCategory, setDialogCategory] = useState<string>("");
  const { setLoading } = useLoading();

  // Initial form state
  const nokFormInitialState: PatNokDetailsDto = useMemo(
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
      rNotes: "",
      transferYN: "N",
    }),
    [userInfo, serverDate]
  );

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PatNokDetailsDto>({
    defaultValues: nokFormInitialState,
    mode: "onBlur",
  });

  // Watch registration status to conditionally render fields
  const pNokRegStatusVal = watch("pNokRegStatusVal");

  // Reset form on mount and when editData changes
  useEffect(() => {
    if (editData) {
      // Format dates properly
      const formattedData = {
        ...editData,
        pNokDob: editData.pNokDob ? new Date(editData.pNokDob) : serverDate,
        pNokPChartCode: editData.pNokPChartCode || "",
      };
      reset(formattedData);
    } else {
      reset(nokFormInitialState);
    }
  }, [editData, nokFormInitialState, reset, serverDate]);

  // Form validation
  const validateFormData = (data: PatNokDetailsDto): boolean => {
    if (!data.pNokTitleVal || !data.pNokFName.trim() || !data.pNokLName.trim() || !data.pNokRelNameVal || !data.pAddPhone1.trim()) {
      notifyWarning("Please fill all mandatory fields.");
      return false;
    }

    // If Registered is selected, enforce UHID selection
    if (data.pNokRegStatusVal === "Y") {
      if (!data.pNokPChartCode.trim() || !data.pNokPChartID || data.pNokPChartID <= 0) {
        notifyError("Please select registered data.");
        return false;
      }
    }

    return true;
  };

  // Form submission handler
  const onSubmit = useCallback(
    async (data: PatNokDetailsDto) => {
      if (!validateFormData(data)) {
        return;
      }

      setLoading(true);
      try {
        await handleSave(data);
        showAlert("Success", "The Kin Details Saved successfully", "success");
        reset(nokFormInitialState);
        handleClose();
      } catch (error) {
        showAlert("Error", "Failed to save Kin details. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    },
    [handleSave, handleClose, reset, nokFormInitialState, setLoading]
  );

  // Close and clear form
  const handleCloseWithClear = useCallback(() => {
    reset(nokFormInitialState);
    handleClose();
  }, [reset, nokFormInitialState, handleClose]);

  // Registration type options
  const regOptions = useMemo(
    () => [
      { value: "Y", label: "Registered" },
      { value: "N", label: "Non Registered" },
    ],
    []
  );

  // Patient selection handler
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
            setValue("pNokFName", patientDetails.patRegisters.pFName || "");
            setValue("pNokMName", patientDetails.patRegisters.pMName || "");
            setValue("pNokLName", patientDetails.patRegisters.pLName || "");
            setValue("pNokTitleVal", patientDetails.patRegisters.pTitleVal || "");
            setValue("pNokTitle", patientDetails.patRegisters.pTitle || "");
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
        console.error("Error fetching patient details:", error);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, serverDate, setValue]
  );

  // Field dialog handlers
  const [, setFormDataDialog] = useState<AppModifyFieldDto>({
    amlID: 0,
    amlName: "",
    amlCode: "",
    amlField: "",
    defaultYN: "N",
    modifyYN: "N",
    rNotes: "",
    rActiveYN: "Y",
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

  // Dialog content
  const dialogContent = (
    <Grid container spacing={2}>
      <FormField type="radio" name="pNokRegStatusVal" control={control} label="NOK Type" options={regOptions} required={true} fullWidth={true} size="small" />

      {pNokRegStatusVal === "Y" && (
        <FormField
          type="autocomplete"
          name="pNokPChartCode"
          control={control}
          label="UHID"
          required={true}
          fullWidth={true}
          size="small"
          placeholder="Search through UHID, Name, DOB, Phone No...."
          options={[]} // Will be populated dynamically
          onChange={(value) => {
            // Clear patient ID when searching
            setValue("pNokPChartID", 0);
          }}
          // Custom handlers for the autocomplete functionality
          InputProps={{
            onChange: async (e: React.ChangeEvent<HTMLInputElement>) => {
              const query = e.target.value;
              if (query.length > 2) {
                const suggestions = await fetchPatientSuggestions(query);
                // Update options here if needed
              }
            },
            onBlur: (e) => {
              // Handle blurring here
            },
          }}
          // Handler for selecting a patient from suggestions
          adornment={<CustomButton text="" icon={SearchIcon} onClick={() => {}} size="small" />}
        />
      )}

      <FormField
        type="select"
        name="pNokTitleVal"
        control={control}
        label="Title"
        required={true}
        fullWidth={true}
        size="small"
        options={dropdownValues.title || []}
        onChange={(value) => {
          const titleOption = dropdownValues.title?.find((t) => t.value === value);
          if (titleOption) {
            setValue("pNokTitle", titleOption.label || "");
          }
        }}
      />

      <FormField type="text" name="pNokFName" control={control} label="First Name" required={true} fullWidth={true} size="small" />

      <FormField type="text" name="pNokLName" control={control} label="Last Name" required={true} fullWidth={true} size="small" />

      <FormField
        type="select"
        name="pNokRelNameVal"
        control={control}
        label="Relationship"
        required={true}
        fullWidth={true}
        size="small"
        options={dropdownValues.relation || []}
        onChange={(value) => {
          const relationOption = dropdownValues.relation?.find((r) => r.value === value);
          if (relationOption) {
            setValue("pNokRelName", relationOption.label || "");
          }
        }}
        adornment={<CustomButton text="" icon={AddIcon} onClick={() => handleAddField("RELATION")} size="small" />}
      />

      <FormField type="datepicker" name="pNokDob" control={control} label="Birth Date" fullWidth={true} size="small" />

      <FormField type="text" name="pAddPhone1" control={control} label="Mobile No" required={true} fullWidth={true} size="small" />

      <FormField type="text" name="pNokStreet" control={control} label="Address" fullWidth={true} size="small" />

      <FormField
        type="select"
        name="pNokAreaVal"
        control={control}
        label="Area"
        fullWidth={true}
        size="small"
        options={dropdownValues.area || []}
        onChange={(value) => {
          const areaOption = dropdownValues.area?.find((a) => a.value === value);
          if (areaOption) {
            setValue("pNokArea", areaOption.label || "");
          }
        }}
        adornment={<CustomButton text="" icon={AddIcon} onClick={() => handleAddField("AREA")} size="small" />}
      />

      <FormField
        type="select"
        name="pNokCityVal"
        control={control}
        label="City"
        fullWidth={true}
        size="small"
        options={dropdownValues.city || []}
        onChange={(value) => {
          const cityOption = dropdownValues.city?.find((c) => c.value === value);
          if (cityOption) {
            setValue("pNokCity", cityOption.label || "");
          }
        }}
        adornment={<CustomButton text="" icon={AddIcon} onClick={() => handleAddField("CITY")} size="small" />}
      />

      <FormField
        type="select"
        name="pNokActualCountryVal"
        control={control}
        label="Country"
        fullWidth={true}
        size="small"
        options={dropdownValues.country || []}
        onChange={(value) => {
          const countryOption = dropdownValues.country?.find((c) => c.value === value);
          if (countryOption) {
            setValue("pNokActualCountry", countryOption.label || "");
          }
        }}
        adornment={<CustomButton text="" icon={AddIcon} onClick={() => handleAddField("COUNTRY")} size="small" />}
      />

      <FormField type="text" name="pNokPostcode" control={control} label="Post Code" fullWidth={true} size="small" />

      <FormField type="text" name="pAddPhone3" control={control} label="Land Line No" fullWidth={true} size="small" />

      <FormField
        type="select"
        name="pNokCountryVal"
        control={control}
        label="Nationality"
        fullWidth={true}
        size="small"
        options={dropdownValues.nationality || []}
        onChange={(value) => {
          const nationalityOption = dropdownValues.nationality?.find((n) => n.value === value);
          if (nationalityOption) {
            setValue("pNokCountry", nationalityOption.label || "");
          }
        }}
        adornment={<CustomButton text="" icon={AddIcon} onClick={() => handleAddField("NATIONALITY")} size="small" />}
      />

      <FormField type="text" name="pNokPssnID" control={control} label="Passport No" fullWidth={true} size="small" />

      <FormField type="text" name="pAddPhone2" control={control} label="Work Phone No" fullWidth={true} size="small" />
    </Grid>
  );

  // Dialog actions
  const dialogActions = (
    <>
      <CustomButton variant="contained" size="medium" onClick={handleCloseWithClear} text="Close" color="secondary" icon={CloseIcon} ariaLabel="Close" />
      <CustomButton icon={SaveIcon} variant="contained" size="medium" text="Save" color="success" onClick={handleSubmit(onSubmit)} ariaLabel="Save Nok" />
    </>
  );

  return (
    <>
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

      <ModifiedFieldDialog
        open={isFieldDialogOpen}
        onClose={handleFieldDialogClose}
        selectedCategoryCode={dialogCategory}
        onFieldAddedOrUpdated={onFieldAddedOrUpdated}
        isFieldCodeDisabled={true}
      />
    </>
  );
};

export default React.memo(NextOfKinForm);
