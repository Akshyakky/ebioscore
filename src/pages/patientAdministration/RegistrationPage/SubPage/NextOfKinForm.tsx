import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { Grid } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { useAppSelector } from "@/store/hooks";
import { PatNokDetailsDto } from "@/interfaces/PatientAdministration/PatNokDetailsDto";
import { usePatientAutocomplete } from "@/hooks/PatientAdminstration/usePatientAutocomplete";
import { useServerDate } from "@/hooks/Common/useServerDate";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import useFieldsList from "@/components/FieldsList/UseFieldsList";
import { useLoading } from "@/context/LoadingContext";
import { showAlert } from "@/utils/Common/showAlert";
import extractNumbers from "@/utils/PatientAdministration/extractNumbers";
import { PatientService } from "@/services/PatientAdministrationServices/RegistrationService/PatientService";
import FormField from "@/components/FormField/FormField";
import ModifiedFieldDialog from "@/components/ModifiedFieldDailog/ModifiedFieldDailog";
import CustomButton from "@/components/Button/CustomButton";
import GenericDialog from "@/components/GenericDialog/GenericDialog";

interface NextOfKinFormProps {
  show: boolean;
  handleClose: () => void;
  handleSave: (kinDetails: PatNokDetailsDto) => void;
  editData?: PatNokDetailsDto | null;
}

const NextOfKinForm: React.FC<NextOfKinFormProps> = ({ show, handleClose, handleSave, editData }) => {
  const userInfo = useAppSelector((state) => state.auth);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [dialogCategory, setDialogCategory] = useState<string>("");
  const { fetchPatientSuggestions } = usePatientAutocomplete();
  const serverDate = useServerDate();
  const { setLoading } = useLoading();

  const dropdownValues = useDropdownValues(["title", "relation", "area", "city", "country", "nationality"]);
  const { fieldsList, defaultFields } = useFieldsList(["nationality", "relation", "area", "city", "country"]);

  const defaultValues: PatNokDetailsDto = useMemo(
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

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PatNokDetailsDto>({
    defaultValues,
  });

  const regType = watch("pNokRegStatusVal");

  useEffect(() => {
    if (editData) {
      reset({
        ...defaultValues,
        ...editData,
        pNokDob: editData.pNokDob || serverDate,
        pNokPChartCode: editData.pNokPChartCode || "",
      });
    } else {
      reset(defaultValues);
    }
  }, [editData, defaultValues, serverDate, reset]);

  const handlePatientSelect = async (selectedSuggestion: string) => {
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
          setValue("pNokTitleVal", patientDetails.patRegisters.pTitle || "");
          setValue("pNokDob", new Date(patientDetails.patRegisters.pDob || serverDate));
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
  };

  const onSubmit = async (data: PatNokDetailsDto) => {
    setLoading(true);
    try {
      if (!data.pNokFName.trim() || !data.pNokLName.trim() || !data.pAddPhone1.trim()) {
        showAlert("Warning", "Please fill in all required fields", "warning");
        return;
      }
      await handleSave(data);
      reset();
      handleClose();
    } catch (error) {
      showAlert("Error", "Failed to save Kin details. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseWithClear = useCallback(() => {
    reset();
    handleClose();
  }, [reset, handleClose]);

  const regOptions = useMemo(
    () => [
      { value: "Y", label: "Registered" },
      { value: "N", label: "Non Registered" },
    ],
    []
  );

  const handleAddField = (category: string) => {
    setDialogCategory(category);
    setIsFieldDialogOpen(true);
  };

  const handleFieldDialogClose = () => {
    setIsFieldDialogOpen(false);
  };

  const dialogContent = (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Controller
          name="pNokRegStatusVal"
          control={control}
          render={({ field }) => (
            <FormField
              type="radio"
              label="NOK Type"
              ControlID="RegOrNonReg"
              name={field.name}
              value={field.value}
              options={regOptions}
              onChange={(e) => {
                field.onChange(e);
                setValue("pNokRegStatus", e.target.value === "Y" ? "Registered" : "Non Registered");
              }}
              inline={true}
              gridProps={{ xs: 12, sm: 6, md: 4 }}
            />
          )}
        />

        {regType === "Y" && (
          <Controller
            name="pNokPChartCode"
            control={control}
            render={({ field }) => (
              <FormField
                type="autocomplete"
                label="UHID"
                ControlID="UHID"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                fetchSuggestions={fetchPatientSuggestions}
                onSelectSuggestion={handlePatientSelect}
                isMandatory
                placeholder="Search through UHID, Name, DOB, Phone No...."
                gridProps={{ xs: 12, sm: 6, md: 4 }}
              />
            )}
          />
        )}
        <Controller
          name="pNokTitleVal"
          control={control}
          rules={{ required: "Title is required" }}
          render={({ field }) => (
            <FormField
              type="select"
              label="Title"
              ControlID="Title"
              name={field.name}
              value={field.value}
              options={dropdownValues.title}
              onChange={(e) => {
                field.onChange(e);
                const selectedTitle = dropdownValues.title.find((t) => t.value === e.target.value);
                setValue("pNokTitle", selectedTitle?.label || "");
              }}
              isMandatory={true}
              errorMessage={errors.pNokTitleVal?.message}
              gridProps={{ xs: 12, sm: 6, md: 4 }}
            />
          )}
        />

        <Controller
          name="pNokFName"
          control={control}
          rules={{ required: "First Name is required" }}
          render={({ field }) => (
            <FormField
              type="text"
              label="First Name"
              ControlID="FirstName"
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              isMandatory={true}
              errorMessage={errors.pNokFName?.message}
              gridProps={{ xs: 12, sm: 6, md: 4 }}
            />
          )}
        />

        <Controller
          name="pNokLName"
          control={control}
          rules={{ required: "Last Name is required" }}
          render={({ field }) => (
            <FormField
              type="text"
              label="Last Name"
              ControlID="LastName"
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              isMandatory={true}
              errorMessage={errors.pNokLName?.message}
              gridProps={{ xs: 12, sm: 6, md: 4 }}
            />
          )}
        />

        <Controller
          name="pNokRelNameVal"
          control={control}
          rules={{ required: "Relationship is required" }}
          render={({ field }) => (
            <FormField
              type="select"
              label="Relationship"
              ControlID="Relationship"
              name={field.name}
              value={field.value || defaultFields.relation}
              options={fieldsList.relation}
              onChange={(e) => {
                field.onChange(e);
                const selectedRelation = fieldsList.relation.find((r) => r.value === e.target.value);
                setValue("pNokRelName", selectedRelation?.label || "");
              }}
              isMandatory={true}
              errorMessage={errors.pNokRelNameVal?.message}
              gridProps={{ xs: 12, sm: 6, md: 4 }}
              showAddButton={true}
              onAddClick={() => handleAddField("relation")}
            />
          )}
        />

        <Controller
          name="pNokDob"
          control={control}
          render={({ field }) => (
            <FormField type="datepicker" label="Birth Date" ControlID="BirthDate" {...field} onChange={(date) => field.onChange(date)} gridProps={{ xs: 12, sm: 6, md: 4 }} />
          )}
        />

        <Controller
          name="pAddPhone1"
          control={control}
          rules={{ required: "Mobile No is required" }}
          render={({ field }) => (
            <FormField
              type="text"
              label="Mobile No"
              ControlID="MobileNo"
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              maxLength={20}
              isMandatory={true}
              errorMessage={errors.pAddPhone1?.message}
              gridProps={{ xs: 12, sm: 6, md: 4 }}
            />
          )}
        />
        <Controller
          name="pNokStreet"
          control={control}
          render={({ field }) => <FormField type="text" label="Address" ControlID="Address" {...field} gridProps={{ xs: 12, sm: 6, md: 4 }} />}
        />
        <Controller
          name="pNokAreaVal"
          control={control}
          render={({ field }) => (
            <FormField
              type="select"
              label="Area"
              ControlID="Area"
              {...field}
              value={field.value || defaultFields.area}
              options={fieldsList.area}
              onChange={(e) => {
                field.onChange(e);
                const selectedArea = fieldsList.area.find((a) => a.value === e.target.value);
                setValue("pNokArea", selectedArea?.label || "");
              }}
              gridProps={{ xs: 12, sm: 6, md: 4 }}
              showAddButton={true}
              onAddClick={() => handleAddField("area")}
            />
          )}
        />
        <Controller
          name="pNokCityVal"
          control={control}
          render={({ field }) => (
            <FormField
              type="select"
              label="City"
              ControlID="City"
              {...field}
              value={field.value || defaultFields.city}
              options={fieldsList.city}
              onChange={(e) => {
                field.onChange(e);
                const selectedCity = fieldsList.city.find((c) => c.value === e.target.value);
                setValue("pNokCity", selectedCity?.label || "");
              }}
              gridProps={{ xs: 12, sm: 6, md: 4 }}
              showAddButton={true}
              onAddClick={() => handleAddField("city")}
            />
          )}
        />

        <Controller
          name="pNokActualCountryVal"
          control={control}
          render={({ field }) => (
            <FormField
              type="select"
              label="Country"
              ControlID="Country"
              {...field}
              options={dropdownValues.country}
              onChange={(e) => {
                field.onChange(e);
                const selectedCountry = dropdownValues.country.find((c) => c.value === e.target.value);
                setValue("pNokActualCountry", selectedCountry?.label || "");
              }}
              gridProps={{ xs: 12, sm: 6, md: 4 }}
              showAddButton={true}
              onAddClick={() => handleAddField("country")}
            />
          )}
        />

        <Controller
          name="pNokPostcode"
          control={control}
          render={({ field }) => <FormField type="text" label="Post Code" ControlID="PostCode" {...field} gridProps={{ xs: 12, sm: 6, md: 4 }} />}
        />

        <Controller
          name="pAddPhone3"
          control={control}
          render={({ field }) => <FormField type="text" label="Land Line No" ControlID="LandLineNo" {...field} gridProps={{ xs: 12, sm: 6, md: 4 }} />}
        />

        <Controller
          name="pNokCountryVal"
          control={control}
          render={({ field }) => (
            <FormField
              type="select"
              label="Nationality"
              ControlID="Nationality"
              {...field}
              value={field.value || defaultFields.nationality}
              options={fieldsList.nationality}
              onChange={(e) => {
                field.onChange(e);
                const selectedNationality = fieldsList.nationality.find((n) => n.value === e.target.value);
                setValue("pNokCountry", selectedNationality?.label || "");
              }}
              gridProps={{ xs: 12, sm: 6, md: 4 }}
              showAddButton={true}
              onAddClick={() => handleAddField("nationality")}
            />
          )}
        />
        <Controller
          name="pNokPssnID"
          control={control}
          render={({ field }) => <FormField type="text" label="Passport No" ControlID="PassportNo" {...field} gridProps={{ xs: 12, sm: 6, md: 4 }} />}
        />
        <Controller
          name="pAddPhone2"
          control={control}
          render={({ field }) => <FormField type="text" label="Work Phone No" ControlID="WorkPhoneNo" {...field} gridProps={{ xs: 12, sm: 6, md: 4 }} />}
        />

        <ModifiedFieldDialog open={isFieldDialogOpen} onClose={handleFieldDialogClose} selectedCategoryName={dialogCategory} isFieldCodeDisabled={true} />
      </Grid>
    </form>
  );

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

export default React.memo(NextOfKinForm);
