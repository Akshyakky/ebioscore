import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import FormField from "@/components/FormField/FormField";
import { useLoading } from "@/hooks/Common/useLoading";
import { useServerDate } from "@/hooks/Common/useServerDate";
import { BServiceGrpDto } from "@/interfaces/Billing/BServiceGrpDto";
import { serviceGroupService } from "@/services/BillingServices/BillingGenericService";
import { useAppSelector } from "@/store/hooks";
import { showAlert } from "@/utils/Common/showAlert";
import { Grid, Paper, Typography } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";

const ServiceGroupsListDetails: React.FC<{ editData?: BServiceGrpDto }> = ({ editData }) => {
  const user = useAppSelector((state) => state.auth);
  const [formState, setFormState] = useState({
    isSubmitted: false,
    sGrpCode: "",
    sGrpName: "",
    rNotes: "",
    rActiveYN: "Y",
    labServiceYN: "N",
    isTherapyYN: "N",
    prnSGrpOrder: 1,
    compID: user.compID || 0,
    compCode: user.compCode || "",
    compName: user.compName || "",
  });

  const { setLoading } = useLoading();
  const serverDate = useServerDate();
  const { userID, userName } = user;

  useEffect(() => {
    if (editData) {
      setFormState((prev) => ({
        ...prev,
        ...editData,
        isSubmitted: false,
      }));
    } else {
      handleClear();
    }
  }, [editData]);

  const CreateBServiceGrpDto = useCallback(
    (): BServiceGrpDto => ({
      sGrpID: editData ? editData.sGrpID : 0,
      sGrpCode: formState.sGrpCode,
      sGrpName: formState.sGrpName,
      modifyYN: "N",
      defaultYN: "N",
      rActiveYN: formState.rActiveYN,
      rCreatedID: userID || 0,
      rCreatedOn: serverDate || new Date(),
      rCreatedBy: userName || "",
      rModifiedID: userID || 0,
      rModifiedOn: serverDate || new Date(),
      rModifiedBy: userName || "",
      rNotes: formState.rNotes,
      prnSGrpOrder: 1,
      labServiceYN: formState.labServiceYN,
      isTherapyYN: formState.isTherapyYN,
      compID: user.compID || 0,
      compCode: user.compCode || "",
      compName: user.compName || "",
    }),
    [formState, editData, userID, userName, serverDate]
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSwitchChange = useCallback((name: string, checked: boolean) => {
    setFormState((prev) => ({ ...prev, [name]: checked ? "Y" : "N" }));
  }, []);

  const handleSave = async () => {
    setFormState((prev) => ({ ...prev, isSubmitted: true }));
    setLoading(true);

    try {
      const bPatTypeDto = CreateBServiceGrpDto();
      const result = await serviceGroupService.save(bPatTypeDto);
      if (result.success) {
        showAlert("Success", "Service Group Code saved successfully!", "success", {
          onConfirm: handleClear,
        });
      } else {
        showAlert("Error", result.errorMessage || "Failed to save Service Group Code.", "error");
      }
    } catch (error) {
      console.error("Error saving Service Group Code:", error);
      showAlert("Error", "An unexpected error occurred while saving.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = useCallback(() => {
    setFormState({
      isSubmitted: false,
      sGrpCode: "",
      sGrpName: "",
      rNotes: "",
      rActiveYN: "Y",
      labServiceYN: "N",
      isTherapyYN: "N",
      prnSGrpOrder: 1,
      compID: user.compID || 0,
      compCode: user.compCode || "",
      compName: user.compName || "",
    });
  }, []);

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Typography variant="h6" id="patient-invoice-code-header">
        Service Groups List
      </Typography>
      <Grid container spacing={2}>
        <FormField
          type="text"
          label="Service Group Code"
          value={formState.sGrpCode}
          onChange={handleInputChange}
          name="sGrpCode"
          ControlID="ServiceGroupCode"
          isMandatory
          isSubmitted={formState.isSubmitted}
        />
        <FormField
          type="text"
          label="Service Group Name"
          value={formState.sGrpName}
          onChange={handleInputChange}
          name="sGrpName"
          ControlID="ServiceGroupName"
          isMandatory
          isSubmitted={formState.isSubmitted}
        />
      </Grid>
      <Grid container spacing={2}>
        <FormField type="textarea" label="Remarks" value={formState.rNotes} onChange={handleInputChange} name="rNotes" ControlID="Remarks" maxLength={500} />
      </Grid>
      <Grid container spacing={2}>
        <FormField
          type="switch"
          label={formState.rActiveYN === "Y" ? "Active" : "Hidden"}
          checked={formState.rActiveYN === "Y"}
          value={formState.rActiveYN}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSwitchChange("rActiveYN", e.target.checked)}
          name="rActiveYN"
          ControlID="rActiveYN"
          aria-label="Active Status"
        />

        <FormField
          type="switch"
          label={formState.labServiceYN === "Y" ? "lab Service" : "Hidden"}
          checked={formState.labServiceYN === "Y"}
          value={formState.labServiceYN}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSwitchChange("labServiceYN", e.target.checked)}
          name="labServiceYN"
          ControlID="labServiceYN"
          aria-label="lab Service Status"
        />

        <FormField
          type="switch"
          label={formState.isTherapyYN === "Y" ? "Therapy" : "Hidden"}
          checked={formState.isTherapyYN === "Y"}
          value={formState.labServiceYN}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSwitchChange("isTherapyYN", e.target.checked)}
          name="isTherapyYN"
          ControlID="isTherapyYN"
          aria-label="Therapy Status"
        />
      </Grid>
      <FormSaveClearButton clearText="Clear" saveText="Save" onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
    </Paper>
  );
};

export default ServiceGroupsListDetails;
