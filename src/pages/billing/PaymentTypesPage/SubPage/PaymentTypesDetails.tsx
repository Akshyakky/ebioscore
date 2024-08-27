import { Paper, Typography, Grid } from "@mui/material";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import { useState, useCallback, useEffect } from "react";
import TextArea from "../../../../components/TextArea/TextArea";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import CustomSwitch from "../../../../components/Checkbox/ColorSwitch";
import { PaymentTypesService } from "../../../../services/BillingServices/PaymentTypesService";
import { BPayTypeDto } from "../../../../interfaces/Billing/BPayTypeDto";
import { useLoading } from "../../../../context/LoadingContext";
import { store } from "../../../../store/store";
import { showAlert } from "../../../../utils/Common/showAlert";
import { useServerDate } from "../../../../hooks/Common/useServerDate";

const PaymentTypesDetails: React.FC<{ editData?: BPayTypeDto }> = ({
  editData,
}) => {
  const [formState, setFormState] = useState({
    isSubmitted: false,
    payCode: "",
    payName: "",
    payMode: "",
    bankCharge: 0,
    rNotes: "",
    rActiveYN: "Y",
  });

  const { setLoading } = useLoading();
  const serverDate = useServerDate();

  const { compID, compCode, compName, userID, userName } =
    store.getState().userDetails;

  useEffect(() => {
    if (editData) {
      setFormState({
        isSubmitted: false,
        payCode: editData.payCode || "",
        payName: editData.payName || "",
        payMode: editData.payMode || "",
        bankCharge: editData.bankCharge || 0,
        rNotes: editData.rNotes || "",
        rActiveYN: editData.rActiveYN || "Y",
      });
    } else {
      handleClear(); // Clear the form if editData is not present
    }
  }, [editData]);

  const createBPayTypeDto = useCallback(
    (): BPayTypeDto => ({
      payID: editData ? editData.payID : 0,
      payCode: formState.payCode,
      payName: formState.payName,
      payMode: formState.payMode,
      bankCharge: formState.bankCharge,
      rNotes: formState.rNotes,
      rActiveYN: formState.rActiveYN,
      compID: compID || 0,
      compCode: compCode || "",
      compName: compName || "",
      transferYN: "N",
      rCreatedID: userID || 0,
      rCreatedOn: serverDate || new Date(),
      rCreatedBy: userName || "",
      rModifiedID: userID || 0,
      rModifiedOn: serverDate || new Date(),
      rModifiedBy: userName || "",
    }),
    [
      formState,
      editData,
      compID,
      compCode,
      compName,
      userID,
      userName,
      serverDate,
    ]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormState((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSave = async () => {
    setFormState((prev) => ({ ...prev, isSubmitted: true }));
    setLoading(true);

    try {
      const BPayTypeDto = createBPayTypeDto();
      const result = await PaymentTypesService.saveBPayType(BPayTypeDto);
      if (result.success) {
        showAlert("Success", "Payment type saved successfully!", "success", {
          onConfirm: handleClear,
        });
      } else {
        showAlert(
          "Error",
          result.errorMessage || "Failed to save Payment type.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error saving Payment type:", error);
      showAlert("Error", "An unexpected error occurred while saving.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = useCallback(() => {
    setFormState({
      isSubmitted: false,
      payCode: "",
      payName: "",
      payMode: "",
      bankCharge: 0,
      rNotes: "",
      rActiveYN: "Y",
    });
  }, []);

  const handleActiveToggle = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({
        ...prev,
        rActiveYN: event.target.checked ? "Y" : "N",
      }));
    },
    []
  );

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Typography variant="h6" id="payment-type-header">
        Payment Type List
      </Typography>
      <section>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FloatingLabelTextBox
              title="Payment Type Code"
              placeholder="Payment Type Code"
              value={formState.payCode}
              onChange={handleInputChange}
              isMandatory
              size="small"
              isSubmitted={formState.isSubmitted}
              name="payCode"
              ControlID="payCode"
              aria-label="Payment Type Code"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FloatingLabelTextBox
              title="Payment Type Name"
              placeholder="Payment Type Name"
              value={formState.payName}
              onChange={handleInputChange}
              isMandatory
              size="small"
              isSubmitted={formState.isSubmitted}
              name="payName"
              ControlID="PaymentTypeName"
              aria-label="Payment Type Name"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FloatingLabelTextBox
              title="Payment Type Mode"
              placeholder="Payment Type Mode"
              value={formState.payMode}
              onChange={handleInputChange}
              isMandatory
              size="small"
              isSubmitted={formState.isSubmitted}
              name="payName"
              ControlID="PaymentTypeMode"
              aria-label="Payment Type Mode"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FloatingLabelTextBox
              title="Bank Charges"
              placeholder="Bank Charges"
              value={formState.bankCharge.toFixed(2)}
              onChange={handleInputChange}
              size="small"
              isSubmitted={formState.isSubmitted}
              name="bankCharge"
              ControlID="BankCharges"
              aria-label="Bank Charges"
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextArea
              label="Remarks"
              name="rNotes"
              value={formState.rNotes}
              placeholder="Remarks"
              onChange={handleInputChange}
              rows={2}
              aria-label="Remarks"
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <CustomSwitch
              label={formState.rActiveYN === "Y" ? "Active" : "Hidden"}
              checked={formState.rActiveYN === "Y"}
              onChange={handleActiveToggle}
              aria-label="Active Status"
            />
          </Grid>
        </Grid>
        <FormSaveClearButton
          clearText="Clear"
          saveText="Save"
          onClear={handleClear}
          onSave={handleSave}
          clearIcon={DeleteIcon}
          saveIcon={SaveIcon}
        />
      </section>
    </Paper>
  );
};

export default PaymentTypesDetails;
