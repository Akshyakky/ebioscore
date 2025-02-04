import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { Grid } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { useAppSelector } from "@/store/hooks";
import { OPIPInsurancesDto } from "@/interfaces/PatientAdministration/InsuranceDetails";
import { useServerDate } from "@/hooks/Common/useServerDate";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import useDayjs from "@/hooks/Common/useDateTime";
import useFieldsList from "@/components/FieldsList/UseFieldsList";
import FormField from "@/components/FormField/FormField";
import ModifiedFieldDialog from "@/components/ModifiedFieldDailog/ModifiedFieldDailog";
import CustomButton from "@/components/Button/CustomButton";
import GenericDialog from "@/components/GenericDialog/GenericDialog";

interface PatientInsuranceFormProps {
  show: boolean;
  handleClose: () => void;
  handleSave: (insuranceData: OPIPInsurancesDto) => void;
  editData?: OPIPInsurancesDto | null;
}

const PatientInsuranceForm: React.FC<PatientInsuranceFormProps> = ({ show, handleClose, handleSave, editData }) => {
  const userInfo = useAppSelector((state) => state.auth);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [dialogCategory, setDialogCategory] = useState<string>("");
  const serverDate = useServerDate();
  const { formatDateYMD } = useDayjs();
  const dropdownValues = useDropdownValues(["insurance", "relation", "coverFor"]);
  const { fieldsList, defaultFields } = useFieldsList(["relation"]);

  const defaultValues: OPIPInsurancesDto = useMemo(
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

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<OPIPInsurancesDto>({
    defaultValues,
  });

  useEffect(() => {
    if (editData) {
      reset({
        ...defaultValues,
        ...editData,
        policyStartDt: editData.policyStartDt || serverDate,
        policyEndDt: editData.policyEndDt || serverDate,
      });
    } else {
      reset(defaultValues);
    }
  }, [editData, defaultValues, serverDate, reset]);

  const onSubmit = async (data: OPIPInsurancesDto) => {
    if (!data.insurName.trim()) {
      return;
    }
    handleSave(data);
    reset();
    handleClose();
  };

  const handleCloseWithClear = useCallback(() => {
    reset();
    handleClose();
  }, [reset, handleClose]);

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
          name="insurID"
          control={control}
          rules={{ required: "Insurance is required" }}
          render={({ field }) => (
            <FormField
              type="select"
              label="Insurance"
              ControlID="Insurance"
              name={field.name}
              value={field.value === 0 ? "" : field.value.toString()}
              options={dropdownValues.insurance}
              onChange={(e) => {
                field.onChange(e);
                const selectedInsurance = dropdownValues.insurance.find((i) => i.value === e.target.value);
                setValue("insurName", selectedInsurance?.label || "");
              }}
              isMandatory={true}
              errorMessage={errors.insurID?.message}
              gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }}
            />
          )}
        />

        <Controller
          name="policyHolder"
          control={control}
          render={({ field }) => <FormField type="text" label="Policy Holder" ControlID="PolicyHolder" {...field} gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }} />}
        />

        <Controller
          name="policyNumber"
          control={control}
          rules={{ required: "Policy Number is required" }}
          render={({ field }) => (
            <FormField
              type="text"
              label="Policy Number"
              ControlID="PolicyNumber"
              {...field}
              isMandatory={true}
              errorMessage={errors.policyNumber?.message}
              gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }}
            />
          )}
        />

        <Controller
          name="groupNumber"
          control={control}
          render={({ field }) => <FormField type="text" label="Group Number" ControlID="GroupNumber" {...field} gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }} />}
        />

        <Controller
          name="policyStartDt"
          control={control}
          render={({ field }) => (
            <FormField
              type="datepicker"
              label="Policy Start Date"
              ControlID="PolicyStartDate"
              name="policyStartDt"
              value={field.value ? new Date(field.value) : null}
              onChange={(date) => field.onChange(date ? formatDateYMD(date) : null)}
              gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }}
            />
          )}
        />

        <Controller
          name="policyEndDt"
          control={control}
          render={({ field }) => (
            <FormField
              type="datepicker"
              label="Policy End Date"
              ControlID="PolicyEndDate"
              name="policyEndDt"
              value={field.value ? new Date(field.value) : null}
              onChange={(date) => field.onChange(date ? formatDateYMD(date) : null)}
              gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }}
            />
          )}
        />

        <Controller
          name="guarantor"
          control={control}
          render={({ field }) => <FormField type="text" label="Guarantor" ControlID="Guarantor" {...field} gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }} />}
        />

        <Controller
          name="relationVal"
          control={control}
          render={({ field }) => (
            <FormField
              type="select"
              label="Relationship"
              ControlID="Relationship"
              {...field}
              value={field.value || defaultFields.relation}
              options={fieldsList.relation}
              onChange={(e) => {
                field.onChange(e);
                const selectedRelation = fieldsList.relation.find((r) => r.value === e.target.value);
                setValue("relation", selectedRelation?.label || "");
              }}
              gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }}
              showAddButton={true}
              onAddClick={() => handleAddField("relation")}
            />
          )}
        />

        <Controller
          name="coveredVal"
          control={control}
          render={({ field }) => (
            <FormField
              type="select"
              label="Covered For"
              ControlID="CoveredFor"
              {...field}
              options={dropdownValues.coverFor}
              onChange={(e) => {
                field.onChange(e);
                const selectedCover = dropdownValues.coverFor.find((c) => c.value === e.target.value);
                setValue("coveredFor", selectedCover?.label || "");
              }}
              gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }}
            />
          )}
        />

        <Controller
          name="address1"
          control={control}
          render={({ field }) => <FormField type="text" label="Address 1" ControlID="Address1" {...field} gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }} />}
        />

        <Controller
          name="address2"
          control={control}
          render={({ field }) => <FormField type="text" label="Address 2" ControlID="Address2" {...field} gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }} />}
        />

        <Controller
          name="phone1"
          control={control}
          render={({ field }) => <FormField type="text" label="Phone 1" ControlID="Phone1" {...field} gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }} />}
        />

        <Controller
          name="phone2"
          control={control}
          render={({ field }) => <FormField type="text" label="Phone 2" ControlID="Phone2" {...field} gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }} />}
        />

        <Controller
          name="rNotes"
          control={control}
          render={({ field }) => <FormField type="text" label="Remarks" ControlID="Remarks" {...field} gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }} />}
        />

        <ModifiedFieldDialog open={isFieldDialogOpen} onClose={handleFieldDialogClose} selectedCategoryName={dialogCategory} isFieldCodeDisabled={true} />
      </Grid>
    </form>
  );

  const dialogActions = (
    <>
      <CustomButton variant="contained" size="medium" onClick={handleCloseWithClear} text="Close" color="secondary" icon={CloseIcon} />
      <CustomButton icon={SaveIcon} variant="contained" size="medium" text="Save" color="success" onClick={handleSubmit(onSubmit)} />
    </>
  );

  return (
    <GenericDialog
      open={show}
      onClose={handleCloseWithClear}
      title="Patient Insurance"
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

export default React.memo(PatientInsuranceForm);
