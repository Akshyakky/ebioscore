import React, { useCallback, useEffect } from "react";
import { BChargeDetailsDto, BChargePackDto, BDoctorSharePerShare, ChargeDetailsDto } from "@/interfaces/Billing/BChargeDetails";
import { useState } from "react";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { chargeDetailsService } from "@/services/BillingServices/chargeDetailsService";
import { showAlert } from "@/utils/Common/showAlert";
import { Grid, Paper, SelectChangeEvent, TextField, Typography } from "@mui/material";
import ChargeBasicDetails from "./Charges";
import ChargeConfigDetails from "./ChargesAlias";
import ChargeDoctorSharePerShare from "./ChargeDoctorSharePerShare";
import FormField from "@/components/FormField/FormField";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import ChargePackageDetails from "./ChargePackDetails";
import { useLoading } from "@/hooks/Common/useLoading";

interface ChargeDetailsProps {
  editData?: ChargeDetailsDto;
}
interface GridData {
  picName: string;
  [key: string]: any;
}
const ChargeDetails: React.FC<ChargeDetailsProps> = ({ editData }) => {
  const [selectedTab, setSelectedTab] = useState<"ServiceCharges" | "ServiceAlias">("ServiceCharges");
  const [gridData, setGridData] = useState<GridData[]>([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  const defaultChargeDetails = [
    {
      isSubmitted: false,
      rActiveYN: "Y",
      transferYN: "N",
      rNotes: "",
      chDetID: 0,
      chargeID: editData?.chargeInfo?.chargeID || 0,
      pTypeID: 0,
      wCatID: 0,
      dcValue: 0,
      hcValue: 0,
      chValue: 0,
      chargeStatus: "N",
    },
  ];

  const defaultChargeAliases = [
    {
      isSubmitted: false,
      rActiveYN: "Y",
      transferYN: "N",
      rNotes: "",
      chaliasID: 0,
      chargeID: editData?.chargeInfo?.chargeID || 0,
      pTypeID: 0,
      chargeDesc: "",
      chargeDescLang: "",
      picName: "",
      wardCategoryName: "",
    },
  ];

  const defaultChargeFaculties = [
    {
      isSubmitted: false,
      bchfID: 0,
      chargeID: editData?.chargeInfo?.chargeID || 0,
      aSubID: 0,
      rActiveYN: "Y",
      transferYN: "N",
      rNotes: "",
    },
  ];

  const defaultChargePackages = [
    {
      isSubmitted: false,
      pkDetID: 0,
      chDetID: 0,
      chargeID: 0,
      chargeRevise: "",
      chargeStatus: "Y",
      DcValue: 0,
      hcValue: 0,
      chValue: 0,
    },
  ];

  const [formData, setFormData] = useState<ChargeDetailsDto>(() => ({
    chargeInfo: {
      isSubmitted: false,
      rActiveYN: editData?.chargeInfo?.rActiveYN || "Y",
      transferYN: editData?.chargeInfo?.transferYN || "Y",
      rNotes: editData?.chargeInfo?.rNotes || "",
      chargeID: editData?.chargeInfo?.chargeID || 0,
      chargeCode: editData?.chargeInfo?.chargeCode || "",
      chargeDesc: editData?.chargeInfo?.chargeDesc || "",
      chargeDescLang: editData?.chargeInfo?.chargeDesc || "",
      cShortName: editData?.chargeInfo?.cShortName || "",
      chargeType: editData?.chargeInfo?.chargeType || "",
      sGrpID: editData?.chargeInfo?.sGrpID || 0,
      chargeTo: "Both",
      chargeStatus: "ON",
      regDefaultServiceYN: "N",
      chargeBreakYN: editData?.chargeInfo?.chargeBreakYN || "N",
      bChID: editData?.chargeInfo?.bChID || 0,
      regServiceYN: editData?.chargeInfo?.regServiceYN || "N",
      doctorShareYN: editData?.chargeInfo?.doctorShareYN || "N",
      cNhsCode: editData?.chargeInfo?.cNhsCode || "",
      cNhsEnglishName: editData?.chargeInfo?.cNhsEnglishName || "",
      chargeCost: editData?.chargeInfo?.chargeCost || "0",
      scheduleDate: editData?.chargeInfo?.scheduleDate || new Date(),
      isBedServiceYN: editData?.chargeInfo?.isBedServiceYN || "N",
      DcValue: editData?.chargeInfo?.DcValue || 0,
      hcValue: editData?.chargeInfo?.hcValue || 0,
      chValue: editData?.chargeInfo?.chValue || 0,
    },
    chargeDetails: editData?.chargeDetails || defaultChargeDetails,
    chargeDoctorShares: editData?.doctorSharePerShare,
    chargeAliases: editData?.chargeAliases || defaultChargeAliases,
    chargeFaculties: editData?.chargeFaculties || defaultChargeFaculties,
    chargePackages:
      editData?.chargePackages ||
      defaultChargePackages.map((pkg) => ({
        ...pkg,
        rActiveYN: "Y",
        transferYN: "N",
        rNotes: "",
      })),
  }));

  const [isSubmitted, setIsSubmitted] = useState(false);
  const { setLoading } = useLoading();
  const dropdownValues = useDropdownValues(["service", "speciality", "bedCategory", "pic", "serviceType"]);
  const [serviceGroups] = useState<any[]>([]);
  const [selectedFacultyIds, setSelectedFacultyIds] = useState<string[]>([]);
  const [selectedPicIds, setSelectedPicIds] = useState<string[]>([]);
  const [selectedWardCategoryIds, setSelectedWardCategoryIds] = useState<string[]>([]);
  const [aliasData, setAliasData] = useState<any[]>([]);
  const [, setChargePackages] = useState<BChargePackDto[]>(editData?.chargePackages || []);
  const [doctorShareData, setDoctorShareData] = useState<BDoctorSharePerShare[]>([]);

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

  const handleChargePackagesChange = (packages: BChargePackDto[]) => {
    const updatedPackages = packages.map((pkg) => ({
      ...pkg,
      chargeID: pkg.chargeID || formData.chargeInfo.chargeID,
      chDetID: pkg.chDetID || 0,
      DcValue: pkg.DcValue || 0,
      hcValue: pkg.hcValue || 0,
      chValue: pkg.chValue || 0,
      chargeRevise: pkg.chargeRevise || "defaultRevise",
      chargeStatus: pkg.chargeStatus || "Y",
      rActiveYN: "Y",
      transferYN: "N",
      rNotes: pkg.rNotes || "",
    }));
    setChargePackages(updatedPackages);
    setFormData((prev) => ({
      ...prev,
      chargePackages: updatedPackages,
    }));
  };

  const handleRowUpdate = (updatedRow: any) => {
    const chargePackage: BChargePackDto = {
      pkDetID: 0,
      chDetID: 0,
      chargeID: parseInt(updatedRow.serviceCode, 10),
      chargeRevise: "",
      chargeStatus: "Y",
      DcValue: parseFloat(updatedRow[`${dropdownValues.bedCategory?.[0]?.label}_drAmt`] || "0"),
      hcValue: parseFloat(updatedRow[`${dropdownValues.bedCategory?.[0]?.label}_hospAmt`] || "0"),
      chValue: parseFloat(updatedRow[`${dropdownValues.bedCategory?.[0]?.label}_totAmt`] || "0"),
      rActiveYN: "Y",
      transferYN: "N",
      rNotes: "",
    };
    setChargePackages((prev) => {
      const existingIndex = prev.findIndex((pkg) => pkg.chargeID === chargePackage.chargeID);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = chargePackage;
        return updated;
      }
      return [...prev, chargePackage];
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      chargeInfo: {
        ...prev.chargeInfo,
        [name]: value,
        ...(name === "chargeDesc" && { chargeDescLang: value }),
      },
    }));
  };

  const handleGridDataChange = useCallback(
    (updatedRows: GridData[], updateSource: "ChargeConfigDetails" | "ChargePackageDetails") => {
      let updatedGridData;
      if (updateSource === "ChargePackageDetails") {
        updatedGridData = gridData.map((row, rowIndex) => {
          const matchingUpdatedRow = updatedRows.find(() => rowIndex === selectedRowIndex);
          if (matchingUpdatedRow) {
            const mergedRow = { ...row };
            dropdownValues.bedCategory?.forEach((category) => {
              const drAmtKey = `${category.label}_drAmt`;
              const hospAmtKey = `${category.label}_hospAmt`;
              const totAmtKey = `${category.label}_totAmt`;
              mergedRow[drAmtKey] = matchingUpdatedRow[drAmtKey] || row[drAmtKey];
              mergedRow[hospAmtKey] = matchingUpdatedRow[hospAmtKey] || row[hospAmtKey];
              mergedRow[totAmtKey] = matchingUpdatedRow[totAmtKey] || row[totAmtKey];
            });
            return mergedRow;
          }
          return row;
        });
      } else {
        updatedGridData = updatedRows.map((updatedRow) => ({
          ...gridData.find((row) => row.picName === updatedRow.picName),
          ...updatedRow,
        }));
      }
      setGridData(updatedGridData);
      const updatedChargeDetails: BChargeDetailsDto[] = updatedGridData.flatMap((row) => {
        return (
          dropdownValues.bedCategory?.map((category) => {
            const drAmtKey = `${category.label}_drAmt`;
            const hospAmtKey = `${category.label}_hospAmt`;
            const totAmtKey = `${category.label}_totAmt`;
            return {
              ...defaultChargeDetails[0],
              chargeID: formData.chargeInfo.chargeID || 0,
              pTypeID: parseInt(dropdownValues.pic?.find((pic) => pic.label === row.picName)?.value || "0", 10),
              wCatID: parseInt(category.value, 10),
              dcValue: parseFloat(row[drAmtKey] || "0"),
              hcValue: parseFloat(row[hospAmtKey] || "0"),
              chValue: parseFloat(row[totAmtKey] || "0"),
            };
          }) || []
        );
      });
      setFormData((prev) => ({
        ...prev,
        chargeDetails: updatedChargeDetails,
      }));
    },
    [gridData, selectedRowIndex, dropdownValues, formData]
  );

  const handleDoctorShareGridDataChange = useCallback((updatedRows: BDoctorSharePerShare[]) => {
    setFormData((prev) => ({
      ...prev,
      doctorSharePerShare: updatedRows.map((row) => ({
        ...row,
        chargeID: prev.chargeInfo.chargeID || 0,
      })),
    }));
  }, []);

  const validateFields = () => {
    const { chargeCode, chargeDesc, chargeType, cShortName, sGrpID, chargeCost } = formData.chargeInfo;
    return chargeCode && chargeDesc && chargeType && cShortName && sGrpID && chargeCost;
  };

  const handleCodeSelect = async (selectedSuggestion: string) => {
    const selectedCode = selectedSuggestion.split(" - ")[0];
    handleInputChange({ target: { name: "chargeCode", value: selectedCode } } as React.ChangeEvent<HTMLInputElement>);
    setAliasData((prevData) =>
      prevData.map((item) => ({
        ...item,
        aliasName: selectedCode || "",
      }))
    );
    try {
      setLoading(true);
      const allChargesResponse = await chargeDetailsService.getAllChargeDetails();
      if (allChargesResponse?.success && allChargesResponse.data) {
        const allCharges = allChargesResponse.data as ChargeDetailsDto[];
        const matchingCharge = allCharges.find((charge: ChargeDetailsDto) => charge.chargeInfo?.chargeCode === selectedCode);
        if (matchingCharge?.chargeInfo?.chargeID) {
          const chargeID = matchingCharge.chargeInfo.chargeID;
          const chargeDetailsResponse = await chargeDetailsService.getAllByID(chargeID);
          if (chargeDetailsResponse?.success && chargeDetailsResponse.data) {
            const chargeDetails: ChargeDetailsDto = chargeDetailsResponse.data;
            const picName = dropdownValues.pic?.find((pic) => Number(pic.value) === chargeDetails.chargeDetails?.[0]?.pTypeID)?.label || "";
            const wardCategoryName = dropdownValues.bedCategory?.find((category) => Number(category.value) === chargeDetails.chargeDetails?.[0]?.wCatID)?.label || "";
            const facultyNames = dropdownValues.speciality?.find((speciality) => Number(speciality.value) === chargeDetails.chargeFaculties?.[0]?.aSubID)?.label || "";
            const mergedGridData = dropdownValues.pic?.map((pic) => {
              const savedDetails = chargeDetails.chargeDetails.filter((detail) => detail.pTypeID === Number(pic.value));
              const rowData: GridData = { picName: pic.label };
              dropdownValues.bedCategory?.forEach((category) => {
                const matchingDetail = savedDetails.find((detail) => detail.wCatID === Number(category.value));
                rowData[`${category.label}_drAmt`] = matchingDetail?.dcValue?.toFixed(2) || "0.00";
                rowData[`${category.label}_hospAmt`] = matchingDetail?.hcValue?.toFixed(2) || "0.00";
                rowData[`${category.label}_totAmt`] = ((matchingDetail?.dcValue || 0) + (matchingDetail?.hcValue || 0)).toFixed(2);
              });
              return rowData;
            });

            setFormData((prev) => ({
              ...prev,
              chargeInfo: {
                ...chargeDetails.chargeInfo,
                picName,
                wardCategoryName,
                facultyNames,
                chargeCode: selectedCode,
              },
              chargeDetails: chargeDetails.chargeDetails.map((detail) => ({
                ...detail,
                picName,
                wardCategoryName,
              })),
              chargeDoctorSharePerShare: chargeDetails.doctorSharePerShare && Array.isArray(chargeDetails.doctorSharePerShare) ? chargeDetails.doctorSharePerShare : [], // Set to empty array if undefined or null
            }));
            if (chargeDetails.doctorSharePerShare && Array.isArray(chargeDetails.doctorSharePerShare)) {
              setDoctorShareData(chargeDetails.doctorSharePerShare);
            } else {
              setDoctorShareData([]);
            }
            setSelectedPicIds([picName]);
            setSelectedWardCategoryIds([wardCategoryName]);
            setSelectedFacultyIds([facultyNames]);
            setGridData(mergedGridData || []);
          }
        }
      }
    } catch (error) {
      showAlert("Error", "Error fetching charge details.", "error");
      console.error("Error fetching charge details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (editData && dropdownValues.pic && dropdownValues.bedCategory && dropdownValues.service && dropdownValues.speciality && Array.isArray(editData.chargeDetails)) {
      const picName = dropdownValues.pic.find((pic) => Number(pic.value) === editData.chargeDetails?.[0]?.pTypeID)?.label || "";
      const wardCategoryName = dropdownValues.bedCategory.find((category) => Number(category.value) === editData.chargeDetails?.[0]?.wCatID)?.label || "";
      const serviceGroupName = dropdownValues.service.find((service) => Number(service.value) === editData.chargeInfo?.sGrpID)?.label || "";
      const facultyNames = dropdownValues.speciality.find((speciality) => Number(speciality.value) === editData.chargeFaculties?.[0]?.aSubID)?.label || "";
      const mergedGridData = dropdownValues.pic.map((pic) => {
        const savedDetails = editData.chargeDetails?.filter((detail) => detail.pTypeID === Number(pic.value)) || [];
        const rowData: GridData = { picName: pic.label };
        dropdownValues.bedCategory?.forEach((category) => {
          const matchingDetail = savedDetails.find((detail) => detail.wCatID === Number(category.value));
          rowData[`${category.label}_drAmt`] = matchingDetail?.dcValue?.toFixed(2) || "0.00";
          rowData[`${category.label}_hospAmt`] = matchingDetail?.hcValue?.toFixed(2) || "0.00";
          rowData[`${category.label}_totAmt`] = ((matchingDetail?.dcValue || 0) + (matchingDetail?.hcValue || 0)).toFixed(2);
        });
        return rowData;
      });

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
        chargeDetails:
          editData.chargeDetails?.map((detail) => ({
            ...detail,
            picName,
            wardCategoryName,
          })) || [],
        doctorSharePerShare: editData.doctorSharePerShare || [],
      }));

      setGridData(mergedGridData);
      if (editData.doctorSharePerShare && editData.doctorSharePerShare.length > 0) {
        const updatedDoctorShareGridData = editData.doctorSharePerShare?.map((share, index) => ({
          serialNumber: index + 1,
          attendingPhysician: "",
          docShare: share.doctorShare,
          hospShare: share.hospShare,
          totalAmount: (share.doctorShare || 0) + (share.hospShare || 0),
          conID: share.conID,
          docShareID: share.docShareID,
          picName,
        }));

        setGridData((prevGridData) => [...prevGridData, ...updatedDoctorShareGridData]);
      }
    } else {
      handleClear();
    }
  }, [editData, dropdownValues]);

  const handleFacultyChange = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      const value = event.target.value as string[];
      const selectedNames = value
        .map((val) => dropdownValues.speciality?.find((opt) => opt.value === val)?.label || "")
        .filter(Boolean)
        .join(", ");
      setSelectedFacultyIds(value);
      setFormData((prev) => ({
        ...prev,
        chargeFaculties: prev.chargeFaculties?.map((faculty, index) => ({
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
        chargeStatus: "Y",
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
        ...(field === "chargeBreakYN" && { doctorShareYN: "N" }),
        ...(field === "doctorShareYN" && { chargeBreakYN: "N" }),
      },
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setIsSubmitted(true);
    if (!validateFields()) {
      showAlert("Error", "Please fill out all mandatory fields.", "error");
      setLoading(false);
      return;
    }
    try {
      const formattedChargeAliases = aliasData.map((alias) => ({
        chaliasID: alias.id || 0,
        chargeID: formData.chargeInfo.chargeID || 0,
        pTypeID: parseInt(dropdownValues.pic?.find((pic) => pic.label === alias.picName)?.value || "0", 10),
        chargeDesc: alias.aliasName || "",
        chargeDescLang: alias.aliasName || "",
        rActiveYN: "Y",
        transferYN: "N",
        rNotes: "",
      }));
      setFormData((prev) => ({
        ...prev,
        chargeAliases: formattedChargeAliases,
      }));
      const requestData: ChargeDetailsDto = {
        chargeInfo: {
          ...formData.chargeInfo,
          chargeTo: "Both",
          chargeStatus: "ON",
          regDefaultServiceYN: "N",
          chargeDescLang: formData.chargeInfo.chargeDesc || "",
        },
        chargeDetails: formData.chargeDetails,
        chargeAliases: formattedChargeAliases,
        chargeFaculties: formData.chargeFaculties || [],
        chargePackDetails: formData.chargePackages || [],
        doctorSharePerShare: (formData.doctorSharePerShare || []).map((share: any) => ({
          docShareID: share.docShareID,
          chargeID: formData.chargeInfo.chargeID || 0,
          conID: share.conID,
          doctorShare: share.doctorShare,
          hospShare: share.hospShare,
          rActiveYN: "Y",
          transferYN: "N",
          rNotes: "",
          isSubmitted: false,
        })),
      };

      const result = await chargeDetailsService.saveChargeDetails(requestData);
      if (result.success) {
        showAlert("Success", "Charge details saved successfully!", "success");
        handleClear();
      } else {
        showAlert("Error", result.errorMessage || "An error occurred", "error");
      }
    } catch (error: any) {
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

  useEffect(() => {
    if (formData.chargeInfo.chargeCode && aliasData.length > 0) {
      const updatedAliasData = aliasData.map((item) => ({
        ...item,
        aliasName: item.aliasName || `${formData.chargeInfo.chargeCode}_${item.picName}`,
      }));
      setAliasData(updatedAliasData);
    }
  }, [formData.chargeInfo.chargeCode]);

  const handleAliasNameChange = (id: number, newValue: string) => {
    setAliasData((prevData) => prevData.map((item) => (item.id === id ? { ...item, aliasName: newValue } : item)));
    setFormData((prev: any) => {
      const updatedAlias = aliasData.find((item) => item.id === id);
      if (!updatedAlias) return prev;
      const updatedChargeAliases = prev.chargeAliases.map((alias: any) => {
        if (alias.chaliasID === updatedAlias.id) {
          return { ...alias, chargeDesc: newValue, pTypeID: 1, chargeDescLang: alias.aliasName };
        }
        return alias;
      });
      return {
        ...prev,
        chargeAliases: updatedChargeAliases,
      };
    });
  };

  const columns = [
    {
      key: "picName",
      header: "PIC Name",
      visible: true,
    },
    {
      key: "aliasName",
      header: "Charge Alias",
      visible: true,
      render: (item: { id: number; aliasName: string }) => (
        <TextField
          variant="outlined"
          size="small"
          fullWidth
          placeholder="Charge Code"
          value={item.aliasName || formData.chargeInfo.chargeCode || ""}
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
        DcValue: 0,
        hcValue: 0,
        chValue: 0,
      },
      chargeDetails: [
        {
          rActiveYN: "Y",
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
          transferYN: "Y",
        },
      ],
      chargePackages: editData?.charge,
      chargeDoctorShares: [],
    });

    setSelectedPicIds([]);
    setSelectedWardCategoryIds([]);
    setSelectedFacultyIds([]);
    setAliasData([]);
    setGridData([]);

    setIsSubmitted(false);
    setSelectedTab("ServiceCharges");
  }, []);

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
        onGridDataChange={(updatedRows) => handleGridDataChange(updatedRows, "ChargeConfigDetails")}
        editData={editData}
        onRowSelect={(rowIndex) => setSelectedRowIndex(rowIndex)}
      />

      {formData.chargeInfo.chargeBreakYN === "Y" && formData.chargeInfo.doctorShareYN !== "Y" && (
        <ChargePackageDetails
          chargeDetails={formData.chargeDetails}
          chargeBreakYN={formData.chargeInfo.chargeBreakYN}
          onChargePackagesChange={handleChargePackagesChange}
          onGridDataChange={(updatedRows) => handleGridDataChange(updatedRows, "ChargePackageDetails")}
          selectedChargeCode={formData.chargeInfo.chargeCode}
          onRowUpdate={handleRowUpdate}
        />
      )}

      {formData.chargeInfo.doctorShareYN === "Y" && formData.chargeInfo.chargeBreakYN !== "Y" && (
        <ChargeDoctorSharePerShare onGridDataChange={handleDoctorShareGridDataChange} chargeId={formData.chargeInfo.chargeID} savedDoctorShares={doctorShareData} />
      )}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <FormField
          type="switch"
          label="Hide"
          value={formData.chargeInfo.rActiveYN || ""}
          checked={formData.chargeInfo.rActiveYN === "Y"}
          onChange={handleSwitchChange("rActiveYN")}
          name="rActiveYN"
          ControlID="rActiveYN"
        />
        <FormField
          type="switch"
          label="Is Bed Service"
          value={formData.chargeInfo.isBedServiceYN || ""}
          checked={formData.chargeInfo.isBedServiceYN === "Y"}
          onChange={handleSwitchChange("isBedServiceYN")}
          name="isBedServiceYN"
          ControlID="isBedServiceYN"
        />
      </Grid>

      <FormSaveClearButton clearText="Clear" saveText="Save" onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
    </Paper>
  );
};

export default ChargeDetails;
