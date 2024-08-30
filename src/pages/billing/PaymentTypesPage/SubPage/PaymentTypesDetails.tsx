import { Paper, Typography, Grid, SelectChangeEvent } from "@mui/material";
import { useState, useCallback, useEffect, useMemo } from "react";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { PaymentTypesService } from "../../../../services/BillingServices/PaymentTypesService";
import { BPayTypeDto } from "../../../../interfaces/Billing/BPayTypeDto";
import { useLoading } from "../../../../context/LoadingContext";
import { store } from "../../../../store/store";
import { showAlert } from "../../../../utils/Common/showAlert";
import { useServerDate } from "../../../../hooks/Common/useServerDate";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import useDropdown from "../../../../hooks/useDropdown";
import { ConstantValues } from "../../../../services/CommonServices/ConstantValuesService";
import { RootState } from "../../../../store/reducers";
import { useSelector } from "react-redux";
import FormField from "../../../../components/FormField/FormField";

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
  const { token } = useSelector((state: RootState) => state.userDetails);
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
      handleClear();
    }
  }, [editData]);

  const transformPayTypeValues = (data: DropdownOption[]): DropdownOption[] =>
    data.map((item) => ({
      value: item.value.toString(),
      label: item.label,
    }));

  const memoizedParams = useMemo(
    () => [token, "GetConstantValues", "PAYT"],
    [token]
  );

  const payTypeResult = useDropdown(
    ConstantValues.fetchConstantValues,
    transformPayTypeValues,
    memoizedParams
  );

  const payTypeValues = payTypeResult.options as DropdownOption[];

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

  const handlePayModeChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      const { value } = event.target;
      setFormState((prev) => ({ ...prev, payMode: value }));
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
          <FormField
            type="text"
            label="Payment Type Code"
            value={formState.payCode}
            onChange={handleInputChange}
            isSubmitted={formState.isSubmitted}
            name="payCode"
            ControlID="payCode"
            placeholder="Payment Type Code"
          />
          <FormField
            type="text"
            label="Payment Type Name"
            value={formState.payName}
            onChange={handleInputChange}
            isSubmitted={formState.isSubmitted}
            name="payName"
            ControlID="PaymentTypeName"
            placeholder="Payment Type Name"
          />
        </Grid>
        <Grid container spacing={2}>
          <FormField
            type="select"
            label="Payment Type Mode"
            value={formState.payMode}
            onChange={handlePayModeChange}
            isSubmitted={formState.isSubmitted}
            options={payTypeValues}
            name="payMode"
            ControlID="payMode"
          />
          <FormField
            type="text"
            label="Bank Charges"
            value={formState.bankCharge.toString()}
            onChange={handleInputChange}
            isSubmitted={formState.isSubmitted}
            name="bankCharge"
            ControlID="BankCharges"
            placeholder="Bank Charges"
          />
        </Grid>
        <Grid container spacing={2}>
          <FormField
            type="textarea"
            label="Remarks"
            value={formState.rNotes}
            onChange={handleInputChange}
            name="rNotes"
            ControlID="rNotes"
            placeholder="Remarks"
          />
        </Grid>
        <Grid container spacing={2}>
          <FormField
            type="switch"
            label={formState.rActiveYN === "Y" ? "Active" : "Hidden"}
            value={formState.rActiveYN}
            checked={formState.rActiveYN === "Y"}
            onChange={handleActiveToggle}
            name="rActiveYN"
            ControlID="rActiveYN"
          />
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
