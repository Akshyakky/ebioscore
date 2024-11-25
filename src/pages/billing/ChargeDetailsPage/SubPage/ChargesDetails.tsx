import React, { useState, useEffect, useCallback } from "react";
import { Paper, Typography, SelectChangeEvent, TextField } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLoading } from "../../../../context/LoadingContext";
import { showAlert } from "../../../../utils/Common/showAlert";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import { ChargeDetailsDto } from "../../../../interfaces/Billing/BChargeDetails";
import useDropdownValues from "../../../../hooks/PatientAdminstration/useDropdownValues";
import { chargeDetailsService } from "../../../../services/BillingServices/chargeDetailsService";
import ChargeBasicDetails from "./Charges";
import ChargeConfigDetails from "./ChargesAlias";
import { useAppSelector } from "@/store/hooks";

interface ChargeDetailsProps {
  editData?: ChargeDetailsDto;
}
const ChargeDetails: React.FC<ChargeDetailsProps> = ({ editData }) => {
  const { compID, compCode, compName } = useAppSelector((state) => state.auth);
  const [selectedTab, setSelectedTab] = useState<"ServiceCharges" | "ServiceAlias">("ServiceCharges");

  const defaultChargeDetails = [
    {
      rActiveYN: "Y",
      compID: compID || 0,
      compCode: compCode || "",
      compName: compName || "",
      transferYN: "Y",
      rNotes: "",
      chDetID: 0,
      chargeID: editData?.chargeInfo?.chargeID || 0,
      pTypeID: 0,
      wCatID: 0,
      dcValue: 0,
      hcValue: 0,
      chValue: 0,
      chargeStatus: "Hidden",
    },
  ];

  const defaultChargeAliases = [
    {
      rActiveYN: "Y",
      compID: compID || 0,
      compCode: compCode || "",
      compName: compName || "",
      transferYN: "Y",
      rNotes: "",
      chaliasID: 0,
      chargeID: editData?.chargeInfo?.chargeID || 0,
      pTypeID: 0,
      chargeDesc: "",
      chargeDescLang: "en",
      picName: "",
      wardCategoryName: "",
    },
  ];

  const defaultChargeFaculties = [
    {
      bchfID: 0,
      chargeID: editData?.chargeInfo?.chargeID || 0,
      aSubID: 0,
      rActiveYN: "Y",
      transferYN: "Y",
      rNotes: "",
      compID: compID || 0,
      compCode: compCode || "",
      compName: compName || "",
    },
  ];

  const [formData, setFormData] = useState<ChargeDetailsDto>(() => ({
    chargeInfo: {
      rActiveYN: editData?.chargeInfo?.rActiveYN || "Y",
      compID: editData?.chargeInfo?.compID || compID || 0,
      compCode: editData?.chargeInfo?.compCode || compCode || "",
      compName: editData?.chargeInfo?.compName || compName || "",
      transferYN: editData?.chargeInfo?.transferYN || "Y",
      rNotes: editData?.chargeInfo?.rNotes || "",
      chargeID: editData?.chargeInfo?.chargeID || 0,
      chargeCode: editData?.chargeInfo?.chargeCode || "",
      chargeDesc: editData?.chargeInfo?.chargeDesc || "",
      cShortName: editData?.chargeInfo?.cShortName || "",
      chargeType: editData?.chargeInfo?.chargeType || "",
      sGrpID: editData?.chargeInfo?.sGrpID || 0,
      chargeTo: editData?.chargeInfo?.chargeTo || "",
      chargeStatus: editData?.chargeInfo?.chargeStatus || "",
      chargeBreakYN: editData?.chargeInfo?.chargeBreakYN || "N",
      bChID: editData?.chargeInfo?.bChID || 0,
      regServiceYN: editData?.chargeInfo?.regServiceYN || "N",
      doctorShareYN: editData?.chargeInfo?.doctorShareYN || "N",
      cNhsCode: editData?.chargeInfo?.cNhsCode || "",
      cNhsEnglishName: editData?.chargeInfo?.cNhsEnglishName || "",
      chargeCost: editData?.chargeInfo?.chargeCost || "0",
      scheduleDate: editData?.chargeInfo?.scheduleDate || new Date(),
    },
    chargeDetails: editData?.chargeDetails || defaultChargeDetails,
    chargeAliases: editData?.chargeAliases || defaultChargeAliases,
    chargeFaculties: editData?.chargeFaculties || defaultChargeFaculties,
  }));

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
    if (editData && dropdownValues.pic && dropdownValues.bedCategory && dropdownValues.service && dropdownValues.speciality) {
      const picName = dropdownValues.pic.find((pic) => Number(pic.value) === editData.chargeDetails?.[0]?.pTypeID)?.label || "";
      const wardCategoryName = dropdownValues.bedCategory.find((category) => Number(category.value) === editData.chargeDetails?.[0]?.wCatID)?.label || "";
      const serviceGroupName = dropdownValues.service.find((service) => Number(service.value) === editData.chargeInfo.sGrpID)?.label || "";
      const facultyNames = dropdownValues.speciality.find((speciality) => Number(speciality.value) === editData.chargeFaculties?.[0]?.aSubID)?.label || "";
      setSelectedPicIds([picName]);
      setSelectedWardCategoryIds([wardCategoryName]);
      setSelectedFacultyIds([facultyNames]);

      setFormData((prev) => ({
        ...prev,
        chargeInfo: {
          ...editData.chargeInfo,
          picName,
          wardCategoryName,
          serviceGroupName,
          facultyNames,
        },
        chargeDetails: editData.chargeDetails.map((detail) => ({
          ...detail,
          picName,
          wardCategoryName,
        })),
      }));
    } else {
      handleClear();
    }
  }, [editData, dropdownValues]);

  const handleFacultyChange = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      const value = event.target.value as string[]; // Selected faculty IDs
      const selectedNames = value
        .map((val) => dropdownValues.speciality.find((opt) => opt.value === val)?.label || "")
        .filter(Boolean)
        .join(", ");

      setSelectedFacultyIds(value);

      setFormData((prev) => ({
        ...prev,
        chargeFaculties: prev.chargeFaculties.map((faculty, index) => ({
          ...faculty,
          aSubID: value[index] ? parseInt(value[index]) : 0, // Update faculty ID
        })),
        chargeInfo: {
          ...prev.chargeInfo,
          facultyNames: selectedNames, // Update faculty names
        },
      }));
    },
    [dropdownValues.speciality]
  );

  const handlePicChange = useCallback((event: SelectChangeEvent<unknown>) => {
    const value = event.target.value as string[];
    setSelectedPicIds(value);

    const pTypeID = value.length > 0 ? parseInt(value[0]) : 0;

    setFormData((prev) => ({
      ...prev,
      chargeDetails: prev.chargeDetails.map((detail) => ({
        ...detail,
        pTypeID,
        chargeStatus: "A",
      })),
    }));
  }, []);

  const handleWardCategoryChange = useCallback((event: SelectChangeEvent<unknown>) => {
    const value = event.target.value as string[];
    setSelectedWardCategoryIds(value);
    const wCatID = value.length > 0 ? parseInt(value[0]) : 0;
    setFormData((prev) => ({
      ...prev,
      chargeDetails: prev.chargeDetails.map((detail) => ({
        ...detail,
        wCatID,
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
    debugger;
    setLoading(true);
    try {
      // const updatedChargeDetails = formData.chargeDetails.map((detail) => ({
      //   ...detail,
      //   picName: dropdownValues.pic.find((pic) => Number(pic.value) === detail.pTypeID)?.label || "",
      //   wardCategoryName: dropdownValues.category.find((category) => Number(category.value) === detail.wCatID)?.label || "",
      // }));

      // const chargeData: ChargeDetailsDto = {
      //   ...formData,
      //   chargeDetails: updatedChargeDetails,
      // };

      const result = await chargeDetailsService.saveChargeDetails(formData);

      if (result.success) {
        showAlert("Success", "Charge details saved successfully!", "success");
      } else {
        showAlert("Error", result.errorMessage || "An error occurred", "error");
      }
    } catch (error) {
      console.error("Error saving charge details:", error);
      showAlert("Error", "An unexpected error occurred", "error");
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
      chargeFaculties: editData?.chargeFaculties || [
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
        handleDateChange={handleDateChange}
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
