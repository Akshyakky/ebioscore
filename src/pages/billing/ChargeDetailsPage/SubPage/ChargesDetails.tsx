import React, { useState, useEffect, useCallback } from "react";
import { Paper, Typography, Grid, SelectChangeEvent, Box, TextField, Switch, Button } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLoading } from "../../../../context/LoadingContext";
import { showAlert } from "../../../../utils/Common/showAlert";
import FormField from "../../../../components/FormField/FormField";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import { ChargeDetailsDto } from "../../../../interfaces/Billing/BChargeDetails";
import { store } from "../../../../store/store";
import useDropdownValues from "../../../../hooks/PatientAdminstration/useDropdownValues";
import { serviceGroupService } from "../../../../services/BillingServices/BillingGenericService";
import { chargeDetailsService } from "../../../../services/BillingServices/chargeDetailsService";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";

const ChargeDetails: React.FC<{ editData?: ChargeDetailsDto }> = ({ editData }) => {
  const { compID, compCode, compName } = store.getState().userDetails;
  const [selectedTab, setSelectedTab] = useState<"ServiceCharges" | "ServiceAlias">("ServiceCharges");
  const [formData, setFormData] = useState<ChargeDetailsDto>({
    chargeInfo: {
      rActiveYN: "Y",
      compID: compID ?? 0,
      compCode: compCode ?? "",
      compName: compName ?? "",
      transferYN: "Y",
      rNotes: "",
      chargeID: 0,
      chargeCode: "",
      chargeDesc: "",
      cShortName: "",
      chargeType: "",
      sGrpID: 0,
      chargeTo: "",
      chargeStatus: "",
      chargeBreakYN: "N",
      bChID: 0,
      regServiceYN: "N",
      doctorShareYN: "N",
      cNhsCode: "",
      cNhsEnglishName: "",
      chargeCost: "0",
    },
    chargeDetails: editData?.chargeDetails || [
      {
        rActiveYN: "Y",
        compID: compID ?? 0,
        compCode: compCode ?? "",
        compName: compName ?? "",
        transferYN: "Y",
        rNotes: "",
        chDetID: 0,
        chargeID: 0,
        pTypeID: 0,
        wCatID: 0,
        chValue: 0,
        chargeStatus: "A",
      },
    ],
    chargeAliases: editData?.chargeAliases || [
      {
        rActiveYN: "Y",
        compID: compID ?? 0,
        compCode: compCode ?? "",
        compName: compName ?? "",
        transferYN: "Y",
        rNotes: "",
        chaliasID: 0,
        chargeID: 0,
        pTypeID: 0,
        chargeDesc: "Tested",
        chargeDescLang: "",
      },
    ],
    faculties: editData?.faculties || [],
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const { setLoading } = useLoading();
  const dropdownValues = useDropdownValues(["service", "speciality", "bedCategory", "pic"]);
  const [serviceGroups, setServiceGroups] = useState<any[]>([]);
  const [selectedFacultyIds, setSelectedFacultyIds] = useState<string[]>([]);
  const [, setSelectedFacultyNames] = useState<string>("");

  const handleFacultyChange = useCallback(
    (event: SelectChangeEvent<unknown>) => {
      const value = event.target.value as string[];
      setSelectedFacultyIds(value);
      setFormData((prev) => ({
        ...prev,
        faculties: value.map((val) => ({
          bchfID: parseInt(val),
          chargeID: prev.chargeInfo.chargeID,
          aSubID: 0,
          compID: compID!,
          compCode: compCode!,
          compName: compName!,
          transferYN: "N",
          rActiveYN: "Y",
          rNotes: "",
        })),
      }));
      const selectedNames = value
        .map((val) => dropdownValues.speciality.find((opt) => opt.value === val)?.label || "")
        .filter(Boolean)
        .join(", ");
      setSelectedFacultyNames(selectedNames);
    },
    [compID, compCode, compName, dropdownValues.speciality]
  );

  useEffect(() => {
    const fetchServiceGroups = async () => {
      try {
        const response = await serviceGroupService.getAll();
        if (response.success && Array.isArray(response.data)) {
          setServiceGroups(
            response.data.map((group: any) => ({
              value: group.sGrpID.toString(),
              label: group.sGrpName,
            }))
          );
        }
      } catch (error) {}
    };
    fetchServiceGroups();

    if (editData) {
      setFormData(editData);
      setSelectedFacultyIds(editData.faculties.map((faculty) => faculty.bchfID.toString()));
      setSelectedFacultyNames(
        editData.faculties
          .map((faculty) => dropdownValues.speciality.find((opt) => opt.value === faculty.bchfID.toString())?.label)
          .filter(Boolean)
          .join(", ")
      );
    } else {
      handleClear();
    }
  }, [editData]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      chargeInfo: {
        ...prev.chargeInfo,
        [name]: value,
      },
    }));
  }, []);

  const handleSelectChange = useCallback((e: SelectChangeEvent) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      chargeInfo: {
        ...prev.chargeInfo,
        [name]: name === "sGrpID" ? parseInt(value) : String(value),
      },
      chargeDetails: prev.chargeDetails.map((detail) => {
        if (name === "pic") {
          return { ...detail, pTypeID: parseInt(value) };
        }
        if (name === "wardCategory") {
          return { ...detail, wCatID: parseInt(value) };
        }
        return detail;
      }),
    }));
  }, []);

  const handleSwitchChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      chargeInfo: {
        ...prev.chargeInfo,
        [field]: e.target.checked ? "Y" : "N",
      },
    }));
  };

  const handleSave = async () => {
    setIsSubmitted(true);
    setLoading(true);
    try {
      debugger;
      const chargeData: ChargeDetailsDto = {
        ...formData,
        chargeInfo: {
          ...formData.chargeInfo,
          compID: compID || formData.chargeInfo.compID,
          compCode: compCode || formData.chargeInfo.compCode,
          compName: compName || formData.chargeInfo.compName,
          chargeType: String(formData.chargeInfo.chargeType),
        },
        chargeDetails: formData.chargeDetails.map((detail) => ({
          ...detail,
          compID: formData.chargeInfo.compID,
          compCode: formData.chargeInfo.compCode,
          compName: formData.chargeInfo.compName,
          chargeStatus: "A",
        })),
        chargeAliases: formData.chargeAliases.map((alias) => ({
          ...alias,
          compID: formData.chargeInfo.compID,
          compCode: formData.chargeInfo.compCode,
          compName: formData.chargeInfo.compName,
          chargeDesc: "Tested",
          chargeDescLang: alias.chargeDescLang || "en",
          chargeID: alias.chargeID || formData.chargeInfo.chargeID,
        })),
        faculties: formData.faculties.map((facultyId) => ({
          bchfID: facultyId.bchfID,
          chargeID: formData.chargeInfo.chargeID,
          aSubID: 0,
          rActiveYN: "Y",
          rNotes: "",
          compID: formData.chargeInfo.compID,
          compCode: formData.chargeInfo.compCode,
          compName: formData.chargeInfo.compName,
          transferYN: "Y",
        })),
      };
      const result = await chargeDetailsService.saveChargeDetails(chargeData);

      if (result.success) {
        showAlert("Success", "Charge details saved successfully!", "success", {
          onConfirm: handleClear,
        });
      } else {
        showAlert("Error", result.errorMessage || "An unexpected error occurred", "error");
      }
    } catch (error) {
      showAlert("Error", "An unexpected error occurred while saving charge details", "error");
    } finally {
      setLoading(false);
    }
  };

  const aliasData =
    dropdownValues.pic?.map((item) => ({
      picName: item.label,
      aliasName: "",
    })) || [];

  const columns = [
    { key: "picName", header: "PIC Name", visible: true },
    {
      key: "aliasName",
      header: "Alias Name",
      visible: true,
      render: (item: any) => (
        <TextField
          variant="outlined"
          size="small"
          fullWidth
          placeholder="Enter Alias"
          value={item.aliasName}
          onChange={(e) => {
            item.aliasName = e.target.value;
          }}
        />
      ),
    },
  ];

  const handleClear = useCallback(() => {
    setFormData({
      chargeInfo: {
        rActiveYN: "Y",
        compID: compID || 0,
        compCode: compCode || "",
        compName: compName || "",
        transferYN: "Y",
        rNotes: "",
        chargeID: 0,
        chargeCode: "",
        chargeDesc: "",
        cShortName: "",
        chargeType: "",
        sGrpID: 0,
        chargeTo: "",
        chargeStatus: "",
        chargeBreakYN: "N",
        bChID: 0,
        regServiceYN: "N",
        doctorShareYN: "N",
        cNhsCode: "",
        cNhsEnglishName: "",
        chargeCost: "0",
      },
      chargeDetails: [
        {
          rActiveYN: "Y",
          compID: compID ?? 0,
          compCode: compCode ?? "",
          compName: compName ?? "",
          transferYN: "Y",
          rNotes: "",
          chDetID: 0,
          chargeID: 0,
          pTypeID: 0,
          wCatID: 0,
          chValue: 0,
          chargeStatus: "",
        },
      ],
      chargeAliases: [
        {
          rActiveYN: "Y",
          compID: compID ?? 0,
          compCode: compCode ?? "",
          compName: compName ?? "",
          transferYN: "Y",
          rNotes: "",
          chaliasID: 0,
          chargeID: 0,
          pTypeID: 0,
          chargeDesc: "",
          chargeDescLang: "",
        },
      ],
      faculties: editData?.faculties || [
        {
          bchfID: 0,
          chargeID: 0,
          aSubID: 0,
          rActiveYN: "Y",
          rNotes: "",
          compID: formData.chargeInfo.compID,
          compCode: formData.chargeInfo.compCode,
          compName: formData.chargeInfo.compName,
          transferYN: "Y",
        },
      ],
    });
    setIsSubmitted(false);
  }, [compID, compCode, compName]);

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Typography variant="h6">Charge Details</Typography>

      <Grid container spacing={2}>
        <FormField
          type="text"
          label="Code"
          value={formData.chargeInfo.chargeCode}
          onChange={handleInputChange}
          name="chargeCode"
          ControlID="chargeCode"
          placeholder="SOC Code"
          isMandatory
          isSubmitted={isSubmitted}
        />
        <FormField
          type="select"
          label="Service Type"
          value={formData.chargeInfo.chargeType}
          onChange={handleSelectChange}
          name="chargeType"
          ControlID="chargeType"
          options={dropdownValues.service || []}
          isMandatory
          isSubmitted={isSubmitted}
        />

        <FormField
          type="text"
          label="Name"
          value={formData.chargeInfo.chargeDesc}
          onChange={handleInputChange}
          name="chargeDesc"
          ControlID="chargeDesc"
          isMandatory
          isSubmitted={isSubmitted}
        />

        <FormField
          type="multiselect"
          label="Faculty"
          name="faculties"
          ControlID="faculties"
          value={selectedFacultyIds}
          options={dropdownValues.speciality || []}
          onChange={handleFacultyChange}
          isSubmitted={isSubmitted}
        />

        <FormField
          type="select"
          label="Service Group"
          value={formData.chargeInfo.sGrpID.toString()}
          onChange={handleSelectChange}
          name="sGrpID"
          ControlID="sGrpID"
          options={serviceGroups}
          isSubmitted={isSubmitted}
        />
        <FormField
          type="text"
          label="Short Name"
          value={formData.chargeInfo.cShortName}
          onChange={handleInputChange}
          name="cShortName"
          ControlID="cShortName"
          isSubmitted={isSubmitted}
        />
        <FormField
          type="number"
          label="Cost"
          value={formData.chargeInfo.chargeCost || ""}
          onChange={handleInputChange}
          name="chargeCost"
          ControlID="chargeCost"
          isSubmitted={isSubmitted}
        />
        <FormField
          type="text"
          label="Resource Code"
          value={formData.chargeInfo.cNhsCode || ""}
          onChange={handleInputChange}
          name="cNhsCode"
          ControlID="cNhsCode"
          isSubmitted={isSubmitted}
        />
        <FormField
          type="text"
          label="Resource Name"
          value={formData.chargeInfo.cNhsEnglishName || ""}
          onChange={handleInputChange}
          name="cNhsEnglishName"
          ControlID="cNhsEnglishName"
          isSubmitted={isSubmitted}
        />
      </Grid>
      <Grid container spacing={2}>
        <FormField
          type="switch"
          label="Is Package"
          value={formData.chargeInfo.regServiceYN || ""}
          checked={formData.chargeInfo.regServiceYN === "Y"}
          onChange={handleSwitchChange("regServiceYN")}
          name="regServiceYN"
          ControlID="regServiceYN"
        />
        <FormField
          type="switch"
          label="Apply Doctor % Share"
          value={formData.chargeInfo.doctorShareYN || ""}
          checked={formData.chargeInfo.doctorShareYN === "Y"}
          onChange={handleSwitchChange("doctorShareYN")}
          name="doctorShareYN"
          ControlID="doctorShareYN"
        />
      </Grid>

      <Grid container spacing={2}>
        <FormField
          type="select"
          label="PIC"
          value={formData.chargeDetails[0].pTypeID || 0}
          onChange={handleSelectChange}
          name="pic"
          ControlID="pic"
          options={dropdownValues.pic || []}
          isMandatory
          isSubmitted={isSubmitted}
        />
        <FormField
          type="select"
          label="Ward Category"
          value={formData.chargeDetails[0].wCatID || 0}
          onChange={handleSelectChange}
          name="wardCategory"
          ControlID="wardCategory"
          options={dropdownValues.bedCategory || []}
          isMandatory
          isSubmitted={isSubmitted}
        />
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Typography variant="body1">Percentage</Typography>
          </Grid>
          <Grid item>
            <Switch
              checked={formData.chargeInfo.percentage === "Y"}
              onChange={(e) =>
                handleSwitchChange("percentage")({
                  target: { checked: e.target.checked },
                } as React.ChangeEvent<HTMLInputElement>)
              }
              name="percentage"
              color="primary"
            />
          </Grid>
          <Grid item>
            <Typography variant="body1">Amount</Typography>
          </Grid>
          <Grid item>
            <TextField
              type="number"
              value={formData.chargeInfo.chValue || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  chargeInfo: {
                    ...prev.chargeInfo,
                    chValue: e.target.value,
                  },
                }))
              }
              placeholder="0"
              variant="outlined"
              size="small"
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
        </Grid>
      </Grid>

      <Grid container spacing={2} alignItems="center">
        <FormField
          type="radio"
          name="adjustmentType"
          label=""
          ControlID="adjustmentType"
          value={formData.chargeInfo.adjustmentType || "None"}
          options={[
            { label: "None", value: "None" },
            { label: "Increase", value: "Increase" },
            { label: "Decrease", value: "Decrease" },
          ]}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              chargeInfo: {
                ...prev.chargeInfo,
                adjustmentType: e.target.value,
              },
            }))
          }
          inline
        />

        <FormField
          label=""
          type="radio"
          value={formData.chargeInfo.amountType || "Both"}
          name="amountType"
          ControlID="amountType"
          options={[
            { label: "Both", value: "Both" },
            { label: "Dr Amt", value: "Dr Amt" },
            { label: "Hosp Amt", value: "Hosp Amt" },
          ]}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              chargeInfo: { ...prev.chargeInfo, amountType: e.target.value },
            }))
          }
          inline
        />
      </Grid>

      <Box display="flex" justifyContent="flex-start" mb={2}>
        <Button variant={selectedTab === "ServiceCharges" ? "contained" : "outlined"} color="primary" onClick={() => setSelectedTab("ServiceCharges")}>
          Service Charges
        </Button>
        <Button variant={selectedTab === "ServiceAlias" ? "contained" : "outlined"} color="primary" onClick={() => setSelectedTab("ServiceAlias")} sx={{ ml: 2 }}>
          Service Alias
        </Button>
      </Box>

      {selectedTab === "ServiceAlias" && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Service Alias
          </Typography>
          <CustomGrid columns={columns} data={aliasData} maxHeight="400px" pagination={false} selectable={false} />
        </Box>
      )}

      <FormSaveClearButton clearText="Clear" saveText="Save" onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
    </Paper>
  );
};

export default ChargeDetails;
