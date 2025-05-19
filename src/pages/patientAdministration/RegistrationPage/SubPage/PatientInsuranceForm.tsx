import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Grid } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { useAppSelector } from "@/store/hooks";
import { AppModifyFieldDto } from "@/interfaces/HospitalAdministration/AppModifiedListDto";
import { OPIPInsurancesDto } from "@/interfaces/PatientAdministration/InsuranceDetails";
import { useServerDate } from "@/hooks/Common/useServerDate";
import useDropdownValues, { DropdownType } from "@/hooks/PatientAdminstration/useDropdownValues";
import useDayjs from "@/hooks/Common/useDateTime";
import { useForm, FormProvider } from "react-hook-form";
import { useLoading } from "@/context/LoadingContext";
import CustomButton from "@/components/Button/CustomButton";
import { notifyWarning } from "@/utils/Common/toastManager";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import ModifiedFieldDialog from "@/components/ModifiedFieldDailog/ModifiedFieldDailog";

// Import Zod schema and form hook
import { useZodForm } from "@/hooks/Common/useZodForm";
import ZodFormField from "@/components/ZodFormField/ZodFormField";
import { insuranceSchema } from "../MainPage/PatientRegistrationScheme";

interface PatientInsuranceFormProps {
  show: boolean;
  handleClose: () => void;
  handleSave: (insuranceData: OPIPInsurancesDto) => void;
  editData?: OPIPInsurancesDto | null;
}

const PatientInsuranceFormWithZod: React.FC<PatientInsuranceFormProps> = ({ show, handleClose, handleSave, editData }) => {
  const userInfo = useAppSelector((state) => state.auth);
  const serverDate = useServerDate();
  const { formatDate, formatDateYMD } = useDayjs();
  const { refreshDropdownValues, ...dropdownValues } = useDropdownValues(["insurance", "relation", "coverFor"]);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [dialogCategory, setDialogCategory] = useState<string>("");
  const { setLoading } = useLoading();

  // Initialize the insurance form state with default values
  const insuranceFormInitialState: OPIPInsurancesDto = useMemo(
    () => ({
      ID: 0,
      oPIPInsID: 0,
      pChartID: 0,
      insurID: 0,
      insurCode: "",
      insurName: "",
      policyNumber: "",
      policyHolder: "",
      groupNumber: "",
      policyStartDt: serverDate,
      policyEndDt: serverDate,
      guarantor: "",
      relationVal: "",
      relation: "",
      address1: "",
      address2: "",
      phone1: "",
      phone2: "",
      rActiveYN: "Y",
      rNotes: "",
      compID: userInfo.compID ?? 0,
      compCode: userInfo.compCode ?? "",
      compName: userInfo.compName ?? "",
      insurStatusCode: "",
      insurStatusName: "",
      pChartCode: "",
      pChartCompID: 0,
      referenceNo: "",
      transferYN: "N",
      coveredVal: "",
      coveredFor: "",
    }),
    [userInfo, serverDate]
  );

  // Set up form with Zod validation
  const methods = useZodForm(insuranceSchema, {
    defaultValues: insuranceFormInitialState,
    mode: "onBlur",
  });

  const { handleSubmit, reset, setValue, formState } = methods;
  const { errors } = formState;

  // Reset form to initial state
  const resetInsuranceFormData = useCallback(() => {
    reset(insuranceFormInitialState);
  }, [reset, insuranceFormInitialState]);

  // Initialize form with edit data when provided
  useEffect(() => {
    if (editData) {
      reset({
        ...editData,
        policyStartDt: editData.policyStartDt,
        policyEndDt: editData.policyEndDt,
      });
    } else {
      resetInsuranceFormData();
    }
  }, [editData, resetInsuranceFormData, reset]);

  // Handle field dialog updates
  const onFieldAddedOrUpdated = () => {
    if (dialogCategory) {
      const dropdownMap: Record<string, DropdownType> = {
        RELATION: "relation",
      };
      const dropdownType = dropdownMap[dialogCategory];
      if (dropdownType) {
        refreshDropdownValues(dropdownType);
      }
    }
  };

  // Handle form submission
  const onSubmit = useCallback(
    (data: OPIPInsurancesDto) => {
      setLoading(true);
      try {
        if (!data.policyNumber?.trim()) {
          notifyWarning("Policy Number is required.");
          return;
        }

        handleSave(data);
        resetInsuranceFormData();
        handleClose();
      } finally {
        setLoading(false);
      }
    },
    [handleSave, resetInsuranceFormData, handleClose, setLoading]
  );

  // Close form without saving
  const handleCloseWithClear = useCallback(() => {
    resetInsuranceFormData();
    handleClose();
  }, [resetInsuranceFormData, handleClose]);

  // Handle date changes
  const handleDateChange = useCallback(
    (field: string) => (date: Date | null) => {
      setValue(field as any, date ? formatDateYMD(date) : "", { shouldValidate: true });
    },
    [setValue, formatDateYMD]
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

  // Form content
  const dialogContent = (
    <FormProvider {...methods}>
      <Grid container spacing={2}>
        <ZodFormField
          name="insurID"
          control={methods.control}
          type="select"
          label="Insurance"
          options={dropdownValues.insurance || []}
          isMandatory={true}
          errors={errors}
          gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }}
          onChange={(val) => {
            const selectedOption = dropdownValues.insurance?.find((opt) => opt.value === val);
            if (selectedOption) {
              setValue("insurName", selectedOption.label, { shouldValidate: true });
            }
          }}
        />

        <ZodFormField name="policyHolder" control={methods.control} type="text" label="Policy Holder" errors={errors} gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }} />

        <ZodFormField
          name="policyNumber"
          control={methods.control}
          type="text"
          label="Policy Number"
          isMandatory={true}
          errors={errors}
          gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }}
        />

        <ZodFormField name="groupNumber" control={methods.control} type="text" label="Group Number" errors={errors} gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }} />

        <ZodFormField
          name="policyStartDt"
          control={methods.control}
          type="datepicker"
          label="Policy Start Date"
          errors={errors}
          gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }}
          onChange={handleDateChange("policyStartDt")}
        />

        <ZodFormField
          name="policyEndDt"
          control={methods.control}
          type="datepicker"
          label="Policy End Date"
          errors={errors}
          gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }}
          onChange={handleDateChange("policyEndDt")}
        />

        <ZodFormField name="guarantor" control={methods.control} type="text" label="Guarantor" errors={errors} gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }} />

        <ZodFormField
          name="relationVal"
          control={methods.control}
          type="select"
          label="Relationship"
          options={dropdownValues.relation || []}
          errors={errors}
          gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }}
          showAddButton={true}
          onAddClick={() => handleAddField("RELATION")}
          onChange={(val) => {
            const selectedOption = dropdownValues.relation?.find((opt) => opt.value === val);
            if (selectedOption) {
              setValue("relation", selectedOption.label, { shouldValidate: true });
            }
          }}
        />

        <ZodFormField
          name="coveredVal"
          control={methods.control}
          type="select"
          label="Covered For"
          options={dropdownValues.coverFor || []}
          errors={errors}
          gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }}
          onChange={(val) => {
            const selectedOption = dropdownValues.coverFor?.find((opt) => opt.value === val);
            if (selectedOption) {
              setValue("coveredFor", selectedOption.label, { shouldValidate: true });
            }
          }}
        />

        <ZodFormField name="address1" control={methods.control} type="text" label="Address 1" errors={errors} gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }} />

        <ZodFormField name="address2" control={methods.control} type="text" label="Address 2" errors={errors} gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }} />

        <ZodFormField name="phone1" control={methods.control} type="text" label="Phone 1" errors={errors} gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }} />

        <ZodFormField name="phone2" control={methods.control} type="text" label="Phone 2" errors={errors} gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }} />

        <ZodFormField name="rNotes" control={methods.control} type="text" label="Remarks" errors={errors} gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }} />
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
      <CustomButton text="Close" icon={CloseIcon} variant="contained" size="medium" color="secondary" onClick={handleCloseWithClear} />
      <CustomButton text="Save" icon={SaveIcon} variant="contained" size="medium" color="success" onClick={handleSubmit(onSubmit)} />
    </>
  );

  return (
    <GenericDialog open={show} onClose={handleCloseWithClear} title="Patient Insurance" maxWidth="lg" fullWidth actions={dialogActions} dialogContentSx={{ p: 2 }}>
      {dialogContent}
    </GenericDialog>
  );
};

export default React.memo(PatientInsuranceFormWithZod);
