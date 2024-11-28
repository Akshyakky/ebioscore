import React, { useState, useEffect, useCallback } from "react";
import { Paper, Typography, SelectChangeEvent, TextField } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLoading } from "../../../../context/LoadingContext";
import { showAlert } from "../../../../utils/Common/showAlert";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import { BChargeDetailsDto, ChargeDetailsDto } from "../../../../interfaces/Billing/BChargeDetails";
import useDropdownValues from "../../../../hooks/PatientAdminstration/useDropdownValues";
import { chargeDetailsService } from "../../../../services/BillingServices/chargeDetailsService";
import ChargeBasicDetails from "./Charges";
import ChargeConfigDetails from "./ChargesAlias";

import { useAppSelector } from "@/store/hooks";
interface ChargeDetailsProps {
  editData?: ChargeDetailsDto;
}
interface GridData {
  picName: string;
  [key: string]: any;
}
const ChargeDetails: React.FC<ChargeDetailsProps> = ({ editData }) => {
  const { compID, compCode, compName } = useAppSelector((state) => state.auth);
  const [selectedTab, setSelectedTab] = useState<"ServiceCharges" | "ServiceAlias">("ServiceCharges");
  const [gridData, setGridData] = useState<GridData[]>([]);

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
  const [, setLoading] = useState(false);
  const dropdownValues = useDropdownValues(["service", "speciality", "bedCategory", "pic"]);
  const [serviceGroups] = useState<any[]>([]);
  const [selectedFacultyIds, setSelectedFacultyIds] = useState<string[]>([]);
  const [selectedPicIds, setSelectedPicIds] = useState<string[]>([]);
  const [selectedWardCategoryIds, setSelectedWardCategoryIds] = useState<string[]>([]);
  const [aliasData, setAliasData] = useState<any[]>([]);

  const fetchChargeCodeSuggestions = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) return [];
    try {
      const response = await chargeDetailsService.getAll();
      return (
        response.data?.filter((item: any) => item.chargeCode.toLowerCase().includes(searchTerm.toLowerCase())).map((item: any) => `${item.chargeCode} - ${item.chargeDesc}`) || []
      );
    } catch (error) {
      return [];
    }
  }, []);

  const updateChargeCode = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      chargeInfo: {
        ...prev.chargeInfo,
        chargeCode: value,
      },
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      chargeInfo: {
        ...prev.chargeInfo,
        [name]: value,
      },
    }));
  };

  const handleGridDataChange = useCallback(
    (updatedData: GridData[]) => {
      setGridData(updatedData);
      const updatedChargeDetails = updatedData.flatMap((row) => {
        return Object.entries(row).reduce((acc: BChargeDetailsDto[], [key, value]) => {
          if (key === "picName") return acc;

          const [categoryLabel, valueType] = key.split("_");
          const picId = dropdownValues.pic?.find((p) => p.label === row.picName)?.value;
          const wardCategory = dropdownValues.bedCategory?.find((cat) => cat.label === categoryLabel);
          if (picId && wardCategory) {
            const existingDetailIndex = acc.findIndex((detail) => detail.pTypeID === Number(picId) && detail.wCatID === Number(wardCategory.value));
            if (existingDetailIndex === -1) {
              if (valueType === "drAmt") {
                acc.push({
                  ...defaultChargeDetails[0],
                  pTypeID: Number(picId),
                  wCatID: Number(wardCategory.value),
                  dcValue: Number(value),
                  hcValue: 0,
                });
              } else if (valueType === "hospAmt") {
                acc.push({
                  ...defaultChargeDetails[0],
                  pTypeID: Number(picId),
                  wCatID: Number(wardCategory.value),
                  dcValue: 0,
                  hcValue: Number(value),
                });
              }
            } else {
              if (valueType === "drAmt") {
                acc[existingDetailIndex].dcValue = Number(value);
              } else if (valueType === "hospAmt") {
                acc[existingDetailIndex].hcValue = Number(value);
              }
            }
          }
          return acc;
        }, []);
      });

      setFormData((prev) => ({
        ...prev,
        chargeDetails: updatedChargeDetails,
      }));
    },
    [dropdownValues.pic, dropdownValues.bedCategory]
  );

  const handleCodeSelect = async (selectedSuggestion: string) => {
    const selectedCode = selectedSuggestion.split(" - ")[0]; // Extract chargeCode
    handleInputChange({ target: { name: "chargeCode", value: selectedCode } } as React.ChangeEvent<HTMLInputElement>);
    try {
      const allChargesResponse = await chargeDetailsService.getAllChargeDetails();

      if (allChargesResponse?.success && allChargesResponse.data) {
        const allCharges = allChargesResponse.data as ChargeDetailsDto[];
        const matchingCharge = allCharges.find((charge: ChargeDetailsDto) => charge.chargeInfo?.chargeCode === selectedCode);

        if (matchingCharge?.chargeInfo?.chargeID) {
          const chargeID = matchingCharge.chargeInfo.chargeID;
          const chargeDetailsResponse = await chargeDetailsService.getAllByID(chargeID);

          if (chargeDetailsResponse?.success && chargeDetailsResponse.data) {
            const chargeDetails: ChargeDetailsDto = chargeDetailsResponse.data;

            const picName = dropdownValues.pic.find((pic) => Number(pic.value) === chargeDetails.chargeDetails?.[0]?.pTypeID)?.label || "";
            const wardCategoryName = dropdownValues.bedCategory.find((category) => Number(category.value) === chargeDetails.chargeDetails?.[0]?.wCatID)?.label || "";

            // Transform data for grid
            const groupedByPIC = chargeDetails.chargeDetails.reduce(
              (acc, detail) => {
                const picName = dropdownValues.pic?.find((p) => Number(p.value) === detail.pTypeID)?.label || "";
                if (!acc[picName]) {
                  acc[picName] = {};
                }
                const wardCategory = dropdownValues.bedCategory?.find((cat) => Number(cat.value) === detail.wCatID) || "";

                if (wardCategory) {
                  const categoryLabel = wardCategory.label;
                  const drAmt = detail.dcValue || 0;
                  const hospAmt = detail.hcValue || 0;
                  const totAmt = drAmt + hospAmt;

                  acc[picName][`${categoryLabel}_drAmt`] = drAmt.toFixed(2);
                  acc[picName][`${categoryLabel}_hospAmt`] = hospAmt.toFixed(2);
                  acc[picName][`${categoryLabel}_totAmt`] = totAmt.toFixed(2);
                }
                return acc;
              },
              {} as Record<string, any>
            );

            const transformedData = Object.entries(groupedByPIC).map(([picName, values]) => ({
              picName,
              ...values,
            }));

            // Set form data and update grid data
            setFormData((prev) => ({
              ...prev,
              chargeInfo: {
                ...chargeDetails.chargeInfo,
                picName,
                wardCategoryName,
              },
              chargeDetails: chargeDetails.chargeDetails.map((detail) => ({
                ...detail,
                picName,
                wardCategoryName,
              })),
            }));

            setSelectedPicIds([picName]);
            setSelectedWardCategoryIds([wardCategoryName]);

            // Use setGridData directly to update the grid in ChargeConfigDetails
            setGridData(transformedData);
          } else {
          }
        } else {
        }
      } else {
      }
    } catch (error) {}
  };

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
      const value = event.target.value as string[];
      const selectedNames = value
        .map((val) => dropdownValues.speciality.find((opt) => opt.value === val)?.label || "")
        .filter(Boolean)
        .join(", ");
      setSelectedFacultyIds(value);
      setFormData((prev) => ({
        ...prev,
        chargeFaculties: prev.chargeFaculties.map((faculty, index) => ({
          ...faculty,
          aSubID: value[index] ? parseInt(value[index]) : 0,
        })),
        chargeInfo: {
          ...prev.chargeInfo,
          facultyNames: selectedNames,
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
    setFormData((prev) => ({
      ...prev,
      chargeDetails: prev.chargeDetails.map((detail) => ({
        ...detail,
        wCatID: value.length > 0 ? parseInt(value[0]) : 0,
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
    setLoading(true);
    try {
      const result = await chargeDetailsService.saveChargeDetails(formData);
      if (result.success) {
        showAlert("Success", "Charge details saved successfully!", "success");
      } else {
        showAlert("Error", result.errorMessage || "An error occurred", "error");
      }
    } catch (error) {
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
        fetchChargeCodeSuggestions={fetchChargeCodeSuggestions}
        handleCodeSelect={handleCodeSelect}
        updateChargeCode={updateChargeCode}
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
        gridData={gridData}
        onGridDataChange={handleGridDataChange}
        editData={editData}
      />

      <FormSaveClearButton clearText="Clear" saveText="Save" onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
    </Paper>
  );
};

export default ChargeDetails;
