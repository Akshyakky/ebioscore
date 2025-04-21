import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Grid, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { useAppSelector } from "@/store/hooks";
import { AppModifyFieldDto } from "@/interfaces/HospitalAdministration/AppModifiedlistDto";
import { OPIPInsurancesDto } from "@/interfaces/PatientAdministration/InsuranceDetails";
import { useServerDate } from "@/hooks/Common/useServerDate";
import useDropdownValues, { DropdownType } from "@/hooks/PatientAdminstration/useDropdownValues";
import useDayjs from "@/hooks/Common/useDateTime";
import useDropdownChange from "@/hooks/useDropdownChange";
import FormField from "@/components/FormField/FormField";
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

const PatientInsuranceForm: React.FC<PatientInsuranceFormProps> = ({ show, handleClose, handleSave, editData }) => {
  const userInfo = useAppSelector((state) => state.auth);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const serverDate = useServerDate();
  const { formatDate, formatDateYMD } = useDayjs();
  const { refreshDropdownValues, ...dropdownValues } = useDropdownValues(["insurance", "relation", "coverFor"]);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [dialogCategory, setDialogCategory] = useState<string>("");
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
    [userInfo, formatDate]
  );

  const [insuranceForm, setInsuranceForm] = useState<OPIPInsurancesDto>(insuranceFormInitialState);
  const { handleDropdownChange } = useDropdownChange<OPIPInsurancesDto>(setInsuranceForm);

  const resetInsuranceFormData = useCallback(() => {
    setInsuranceForm(insuranceFormInitialState);
  }, [insuranceFormInitialState]);

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

  useEffect(() => {
    if (editData) {
      setInsuranceForm({
        ...editData,
        policyStartDt: editData.policyStartDt,
        policyEndDt: editData.policyEndDt,
      });
    }
  }, [editData]);

  const handleSubmit = useCallback(() => {
    setIsSubmitted(true);
    if (!insuranceForm.policyNumber?.trim()) {
      notifyWarning("Policy Number is required.");
      return;
    }
    if (insuranceForm.insurName.trim()) {
      handleSave(insuranceForm);
      resetInsuranceFormData();
      handleClose();
      setIsSubmitted(false);
    }
  }, [insuranceForm, handleSave, resetInsuranceFormData, handleClose]);
  const handleCloseWithClear = useCallback(() => {
    resetInsuranceFormData();
    handleClose();
    setIsSubmitted(false);
  }, [resetInsuranceFormData, handleClose]);

  const handleTextChange = useCallback(
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setInsuranceForm((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    },
    []
  );

  const handleDateChange = useCallback(
    (field: string) => (date: Date | null) => {
      setInsuranceForm((prev) => ({
        ...prev,
        [field]: date ? formatDateYMD(date) : "",
      }));
    },
    [formatDateYMD]
  );

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

  const dialogContent = (
    <Grid container spacing={2}>
      <FormField
        type="select"
        label="Insurance"
        name="insurID"
        ControlID="Insurance"
        value={insuranceForm.insurID === 0 ? "" : insuranceForm.insurID.toString()}
        options={dropdownValues.insurance}
        onChange={handleDropdownChange(["insurID"], ["insurName"], dropdownValues.insurance)}
        isMandatory={true}
        isSubmitted={isSubmitted}
        gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }}
      />
      <FormField
        type="text"
        label="Policy Holder"
        name="policyHolder"
        ControlID="PolicyHolder"
        value={insuranceForm.policyHolder}
        onChange={handleTextChange("policyHolder")}
        gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }}
      />
      <FormField
        type="text"
        label="Policy Number"
        name="policyNumber"
        ControlID="PolicyNumber"
        value={insuranceForm.policyNumber}
        onChange={handleTextChange("policyNumber")}
        isMandatory={true}
        isSubmitted={isSubmitted}
        gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }}
      />
      <FormField
        type="text"
        label="Group Number"
        name="groupNumber"
        ControlID="GroupNumber"
        value={insuranceForm.groupNumber}
        onChange={handleTextChange("groupNumber")}
        gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }}
      />
      <FormField
        type="datepicker"
        label="Policy Start Date"
        name="policyStartDt"
        ControlID="PolicyStartDate"
        value={insuranceForm.policyStartDt ? new Date(insuranceForm.policyStartDt) : null}
        onChange={handleDateChange("policyStartDt")}
        gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }}
      />
      <FormField
        type="datepicker"
        label="Policy End Date"
        name="policyEndDt"
        ControlID="PolicyEndDate"
        value={insuranceForm.policyEndDt ? new Date(insuranceForm.policyEndDt) : null}
        onChange={handleDateChange("policyEndDt")}
        gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }}
      />
      <FormField
        type="text"
        label="Guarantor"
        name="guarantor"
        ControlID="Guarantor"
        value={insuranceForm.guarantor}
        onChange={handleTextChange("guarantor")}
        gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }}
      />
      <FormField
        type="select"
        label="Relationship"
        name="relationVal"
        ControlID="Relationship"
        value={insuranceForm.relationVal || dropdownValues.relation}
        options={dropdownValues.relation}
        onChange={handleDropdownChange(["relationVal"], ["relation"], dropdownValues.relation)}
        gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }}
        showAddButton={true}
        onAddClick={() => handleAddField("RELATION")}
      />
      <FormField
        type="select"
        label="Covered For"
        name="coveredVal"
        ControlID="CoveredFor"
        value={String(insuranceForm.coveredVal)}
        options={dropdownValues.coverFor}
        onChange={handleDropdownChange(["coveredVal"], ["coveredFor"], dropdownValues.coverFor)}
        gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }}
      />
      <FormField
        type="text"
        label="Address 1"
        name="address1"
        ControlID="Address1"
        value={insuranceForm.address1}
        onChange={handleTextChange("address1")}
        gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }}
      />
      <FormField
        type="text"
        label="Address 2"
        name="address2"
        ControlID="Address2"
        value={insuranceForm.address2}
        onChange={handleTextChange("address2")}
        gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }}
      />
      <FormField
        type="text"
        label="Phone 1"
        name="phone1"
        ControlID="Phone1"
        value={insuranceForm.phone1}
        onChange={handleTextChange("phone1")}
        gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }}
      />
      <FormField
        type="text"
        label="Phone 2"
        name="phone2"
        ControlID="Phone2"
        value={insuranceForm.phone2}
        onChange={handleTextChange("phone2")}
        gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }}
      />
      <FormField
        type="text"
        label="Remarks"
        name="rNotes"
        ControlID="Remarks"
        value={insuranceForm.rNotes}
        onChange={handleTextChange("rNotes")}
        gridProps={{ md: 3, lg: 3, sm: 12, xs: 12, xl: 3 }}
      />

      <ModifiedFieldDialog
        open={isFieldDialogOpen}
        onClose={handleFieldDialogClose}
        selectedCategoryCode={dialogCategory}
        onFieldAddedOrUpdated={onFieldAddedOrUpdated}
        isFieldCodeDisabled={true}
      />
    </Grid>
  );

  const dialogActions = (
    <>
      <CustomButton text="Close" icon={CloseIcon} variant="contained" size="medium" color="secondary" onClick={handleCloseWithClear} />
      <CustomButton text="Save" icon={SaveIcon} variant="contained" size="medium" color="success" onClick={handleSubmit} />
    </>
  );

  return (
    <GenericDialog open={show} onClose={handleCloseWithClear} title="Patient Insurance" maxWidth="lg" fullWidth actions={dialogActions} dialogContentSx={{ p: 2 }}>
      {dialogContent}
    </GenericDialog>
  );
};

export default React.memo(PatientInsuranceForm);
