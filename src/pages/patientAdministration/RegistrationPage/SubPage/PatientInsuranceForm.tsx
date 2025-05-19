import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Grid } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import { useAppSelector } from "@/store/hooks";
import { AppModifyFieldDto } from "@/interfaces/HospitalAdministration/AppModifiedListDto";
import { OPIPInsurancesDto } from "@/interfaces/PatientAdministration/InsuranceDetails";
import { useServerDate } from "@/hooks/Common/useServerDate";
import useDropdownValues, { DropdownType } from "@/hooks/PatientAdminstration/useDropdownValues";
import useDayjs from "@/hooks/Common/useDateTime";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import ModifiedFieldDialog from "@/components/ModifiedFieldDailog/ModifiedFieldDailog";
import CustomButton from "@/components/Button/CustomButton";
import { notifyWarning } from "@/utils/Common/toastManager";
import GenericDialog from "@/components/GenericDialog/GenericDialog";

interface PatientInsuranceFormProps {
  show: boolean;
  handleClose: () => void;
  handleSave: (insuranceData: OPIPInsurancesDto) => void;
  editData?: OPIPInsurancesDto | null;
}

const EnhancedPatientInsuranceForm: React.FC<PatientInsuranceFormProps> = ({ show, handleClose, handleSave, editData }) => {
  const userInfo = useAppSelector((state) => state.auth);
  const serverDate = useServerDate();
  const { formatDateYMD } = useDayjs();
  const { refreshDropdownValues, ...dropdownValues } = useDropdownValues(["insurance", "relation", "coverFor"]);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [dialogCategory, setDialogCategory] = useState<string>("");

  // Initial form state
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

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<OPIPInsurancesDto>({
    defaultValues: insuranceFormInitialState,
    mode: "onBlur",
  });

  // Reset form when editData changes
  useEffect(() => {
    if (editData) {
      // Format dates properly
      reset({
        ...editData,
        policyStartDt: editData.policyStartDt ? new Date(editData.policyStartDt) : serverDate,
        policyEndDt: editData.policyEndDt ? new Date(editData.policyEndDt) : serverDate,
      });
    } else {
      reset(insuranceFormInitialState);
    }
  }, [editData, insuranceFormInitialState, reset, serverDate]);

  // Form validation
  const validateFormData = (data: OPIPInsurancesDto): boolean => {
    if (!data.policyNumber?.trim()) {
      notifyWarning("Policy Number is required.");
      return false;
    }

    if (!data.insurName?.trim()) {
      notifyWarning("Insurance is required.");
      return false;
    }

    return true;
  };

  // Form submission handler
  const onSubmit = useCallback(
    (data: OPIPInsurancesDto) => {
      if (!validateFormData(data)) {
        return;
      }

      // Format dates for API submission
      const formattedData = {
        ...data,
        policyStartDt: data.policyStartDt instanceof Date ? data.policyStartDt : new Date(data.policyStartDt),
        policyEndDt: data.policyEndDt instanceof Date ? data.policyEndDt : new Date(data.policyEndDt),
      };

      handleSave(formattedData);
      reset(insuranceFormInitialState);
      handleClose();
    },
    [handleSave, reset, insuranceFormInitialState, handleClose]
  );

  // Close and clear form
  const handleCloseWithClear = useCallback(() => {
    reset(insuranceFormInitialState);
    handleClose();
  }, [reset, insuranceFormInitialState, handleClose]);

  // Handle insurance dropdown change
  const handleInsuranceChange = useCallback(
    (value: any) => {
      const selectedOption = dropdownValues.insurance?.find((option) => option.value === value);
      if (selectedOption) {
        setValue("insurName", selectedOption.label);
      }
    },
    [dropdownValues.insurance, setValue]
  );

  // Handle relation dropdown change
  const handleRelationChange = useCallback(
    (value: any) => {
      const selectedOption = dropdownValues.relation?.find((option) => option.value === value);
      if (selectedOption) {
        setValue("relation", selectedOption.label);
      }
    },
    [dropdownValues.relation, setValue]
  );

  // Handle covered for dropdown change
  const handleCoveredForChange = useCallback(
    (value: any) => {
      const selectedOption = dropdownValues.coverFor?.find((option) => option.value === value);
      if (selectedOption) {
        setValue("coveredFor", selectedOption.label);
      }
    },
    [dropdownValues.coverFor, setValue]
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
      <FormField
        type="select"
        name="insurID"
        control={control}
        label="Insurance"
        options={dropdownValues.insurance || []}
        required={true}
        fullWidth={true}
        size="small"
        onChange={handleInsuranceChange}
      />

      <FormField type="text" name="policyHolder" control={control} label="Policy Holder" fullWidth={true} size="small" />

      <FormField type="text" name="policyNumber" control={control} label="Policy Number" required={true} fullWidth={true} size="small" />

      <FormField type="text" name="groupNumber" control={control} label="Group Number" fullWidth={true} size="small" />

      <FormField type="datepicker" name="policyStartDt" control={control} label="Policy Start Date" fullWidth={true} size="small" />

      <FormField type="datepicker" name="policyEndDt" control={control} label="Policy End Date" fullWidth={true} size="small" />

      <FormField type="text" name="guarantor" control={control} label="Guarantor" fullWidth={true} size="small" />

      <FormField
        type="select"
        name="relationVal"
        control={control}
        label="Relationship"
        options={dropdownValues.relation || []}
        fullWidth={true}
        size="small"
        onChange={handleRelationChange}
        adornment={<CustomButton text="" icon={AddIcon} onClick={() => handleAddField("RELATION")} size="small" />}
      />

      <FormField
        type="select"
        name="coveredVal"
        control={control}
        label="Covered For"
        options={dropdownValues.coverFor || []}
        fullWidth={true}
        size="small"
        onChange={handleCoveredForChange}
      />

      <FormField type="text" name="address1" control={control} label="Address 1" fullWidth={true} size="small" />

      <FormField type="text" name="address2" control={control} label="Address 2" fullWidth={true} size="small" />

      <FormField type="text" name="phone1" control={control} label="Phone 1" fullWidth={true} size="small" />

      <FormField type="text" name="phone2" control={control} label="Phone 2" fullWidth={true} size="small" />

      <FormField type="text" name="rNotes" control={control} label="Remarks" fullWidth={true} size="small" />
    </Grid>
  );

  // Dialog actions
  const dialogActions = (
    <>
      <CustomButton text="Close" icon={CloseIcon} variant="contained" size="medium" color="secondary" onClick={handleCloseWithClear} />
      <CustomButton text="Save" icon={SaveIcon} variant="contained" size="medium" color="success" onClick={handleSubmit(onSubmit)} />
    </>
  );

  return (
    <>
      <GenericDialog open={show} onClose={handleCloseWithClear} title="Patient Insurance" maxWidth="lg" fullWidth actions={dialogActions} dialogContentSx={{ p: 2 }}>
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

export default React.memo(EnhancedPatientInsuranceForm);
