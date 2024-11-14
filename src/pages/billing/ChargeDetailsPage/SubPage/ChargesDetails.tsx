import React, { useState, useEffect, useCallback } from "react";
import { Paper, Typography, SelectChangeEvent, TextField } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLoading } from "../../../../context/LoadingContext";
import { showAlert } from "../../../../utils/Common/showAlert";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import { ChargeDetailsDto } from "../../../../interfaces/Billing/BChargeDetails";
import { store } from "../../../../store/store";
import useDropdownValues from "../../../../hooks/PatientAdminstration/useDropdownValues";
import { serviceGroupService } from "../../../../services/BillingServices/BillingGenericService";
import { chargeDetailsService } from "../../../../services/BillingServices/chargeDetailsService";
import ChargeBasicDetails from "./Charges";
import ChargeConfigDetails from "./ChargesAlias";
interface ChargeDetailsProps {
  editData?: ChargeDetailsDto;
}
const ChargeDetails: React.FC<ChargeDetailsProps> = ({ editData }) => {
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
      scheduleDate: new Date(),
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
  const [selectedPicIds, setSelectedPicIds] = useState<string[]>([]);
  const [selectedWardCategoryIds, setSelectedWardCategoryIds] = useState<string[]>([]);
  const [aliasData, setAliasData] = useState<any[]>([]);

  useEffect(() => {
    if (editData) {
      setFormData(editData);
      console.log("Edit data received in ChargeDetails:", editData);
    } else {
      handleClear();
    }
  }, [editData]);

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

  const handlePicChange = useCallback((event: SelectChangeEvent<unknown>) => {
    const value = event.target.value as string[];
    const pTypeID = value.length > 0 ? parseInt(value[0]) : 0;

    setSelectedPicIds(value);
    setFormData((prev) => ({
      ...prev,
      chargeDetails: prev.chargeDetails.map((detail) => ({
        ...detail,
        pTypeID,
        chargeStatus: "A",
      })),
    }));
  }, []);

  const handleDateChange = useCallback((date: Date | null, type: "scheduleDate" | "") => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        chargeInfo: { ...prev.chargeInfo, [type]: date },
      }));
    }
  }, []);

  const handleWardCategoryChange = useCallback((event: SelectChangeEvent<unknown>) => {
    const value = event.target.value as string[];
    setSelectedWardCategoryIds(value);
    setFormData((prev: any) => ({
      ...prev,
      chargeDetails: [
        {
          ...prev.chargeDetails[0],
          wCatID: parseInt(value[0]),
        },
      ],
    }));
  }, []);

  const validateFormData = (data: ChargeDetailsDto): boolean => {
    if (!data.chargeDetails?.[0]?.wCatID) {
      showAlert("Error", "Ward Category is required", "error");
      return false;
    }

    if (!data.chargeDetails?.[0]?.pTypeID) {
      showAlert("Error", "PIC is required", "error");
      return false;
    }

    return true;
  };

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
    const checked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      chargeInfo: {
        ...prev.chargeInfo,
        [field]: checked ? "Y" : "N",
      },
    }));
  };

  const handleSave = async () => {
    setIsSubmitted(true);

    if (!validateFormData(formData)) {
      return;
    }

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
          pTypeID: detail.pTypeID,
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

  useEffect(() => {
    if (dropdownValues.pic) {
      const initialData = dropdownValues.pic.map((item, index) => ({
        id: index,
        picName: item.label,
        aliasName: "",
      }));
      setAliasData(initialData);
    }
  }, [dropdownValues.pic]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      chargeInfo: {
        ...prev.chargeInfo,
        [name]: value,
      },
    }));

    if (name === "chargeDesc") {
      setAliasData((prevData) =>
        prevData.map((item) => ({
          ...item,
          aliasName: value,
        }))
      );
    }
  }, []);

  const handleAliasNameChange = (id: number, newValue: string) => {
    setAliasData((prevData) => prevData.map((item) => (item.id === id ? { ...item, aliasName: newValue } : item)));
    setFormData((prev) => ({
      ...prev,
      chargeInfo: {
        ...prev.chargeInfo,
        chargeDesc: newValue,
      },
    }));
  };

  const columns = [
    {
      key: "picName",
      header: "PIC Name",
      visible: true,
    },
    {
      key: "aliasName",
      header: "Alias Name",
      visible: true,
      render: (item: { id: number; aliasName: string }) => (
        <TextField
          variant="outlined"
          size="small"
          fullWidth
          placeholder="Enter Alias (max 10 chars)"
          value={item.aliasName}
          onChange={(e) => handleAliasNameChange(item.id, e.target.value)}
          inputProps={{
            maxLength: 10,
            style: { width: "100%" },
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
    <Paper variant="elevation" sx={{ padding: 2, mt: 2 }}>
      <Typography variant="h6">Charge Details</Typography>
      <ChargeBasicDetails
        formData={formData}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        handleSwitchChange={handleSwitchChange}
        selectedFacultyIds={selectedFacultyIds}
        handleFacultyChange={handleFacultyChange}
        dropdownValues={dropdownValues}
        serviceGroups={serviceGroups}
        isSubmitted={isSubmitted}
        handleDateChange={handleDateChange} // Make sure this line is included
      />

      <ChargeConfigDetails
        formData={formData}
        handleSwitchChange={handleSwitchChange}
        selectedPicIds={selectedPicIds}
        handlePicChange={handlePicChange}
        selectedWardCategoryIds={selectedWardCategoryIds}
        handleWardCategoryChange={handleWardCategoryChange}
        dropdownValues={dropdownValues}
        isSubmitted={isSubmitted}
        setFormData={setFormData}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        columns={columns}
        aliasData={aliasData}
      />

      <FormSaveClearButton clearText="Clear" saveText="Save" onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
    </Paper>
  );
};

export default ChargeDetails;
