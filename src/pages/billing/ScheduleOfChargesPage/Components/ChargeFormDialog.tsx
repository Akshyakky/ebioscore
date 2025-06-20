import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { BChargeFacultyDto, ChargeCodeGenerationDto, ChargeWithAllDetailsDto } from "@/interfaces/Billing/ChargeDto";
import { appSubModuleService } from "@/services/SecurityManagementServices/securityManagementServices";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clear as ClearIcon, Save as SaveIcon } from "@mui/icons-material";
import { Box, Divider, Grid, Paper, Typography } from "@mui/material";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useScheduleOfCharges } from "../hooks/useScheduleOfCharges";
import AssociatedFacultiesComponent from "./AssociatedFacultiesComponent";
import ChargeAliasesComponent from "./ChargeAliasesComponent";
import DoctorSharesComponent from "./DoctorSharesComponent";
import PriceDetailsComponent from "./PriceDetailsComponent";

const chargeSchema = z.object({
  chargeID: z.number().default(0),
  chargeCode: z.string().min(1, "Charge code is required"),
  chargeDesc: z.string().min(1, "Charge description is required"),
  chargesHDesc: z.string().optional().nullable(),
  chargeDescLang: z.string().optional().nullable(),
  cShortName: z.string().optional().nullable(),
  bChID: z.number().nullable().optional(),
  chargeType: z.string().min(1, "Charge type is required"),
  chargeTo: z.string().min(1, "Charge to is required"),
  chargeStatus: z.string().default("AC"),
  chargeBreakYN: z.enum(["Y", "N"]).default("N"),
  regServiceYN: z.enum(["Y", "N"]).optional().default("N"),
  regDefaultServiceYN: z.enum(["Y", "N"]).optional().default("N"),
  isBedServiceYN: z.enum(["Y", "N"]).optional().default("N"),
  doctorShareYN: z.enum(["Y", "N"]).default("N"),
  rActiveYN: z.enum(["Y", "N"]).default("Y"),
  cNhsCode: z.string().optional().nullable(),
  cNhsEnglishName: z.string().optional().nullable(),
  chargeCost: z.number().optional().nullable(),
  sGrpID: z.number().optional().nullable(),
  scheduleDate: z
    .union([z.date(), z.any()])
    .refine(
      (date) => {
        if (!date) return true;
        const dateObj = dayjs.isDayjs(date) ? date.toDate() : date;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dateObj >= today;
      },
      {
        message: "Schedule date cannot be in the past",
      }
    )
    .optional()
    .nullable(),
  selectedFaculties: z.array(z.number()).optional().default([]),
  ChargeDetails: z.array(z.any()).optional().default([]),
  DoctorShares: z.array(z.any()).optional().default([]),
  ChargeAliases: z.array(z.any()).optional().default([]),
  ChargeFaculties: z.array(z.any()).optional().default([]),
  ChargePacks: z.array(z.any()).optional().default([]),
});

type ChargeFormData = z.infer<typeof chargeSchema>;

interface PricingGridItem {
  id: string;
  picId: number;
  picName: string;
  selected: boolean;
  wardCategories: {
    [key: string]: {
      DcValue: number;
      hcValue: number;
      chValue: number;
    };
  };
}

interface ChargeFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (charge: ChargeWithAllDetailsDto) => Promise<void>;
  charge: ChargeWithAllDetailsDto | null;
}

const ChargeFormDialog: React.FC<ChargeFormDialogProps> = ({ open, onClose, onSubmit, charge }) => {
  const [, setTabValue] = useState(0);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [doctorSharesExpanded, setDoctorSharesExpanded] = useState(false);
  const [aliasesExpanded, setAliasesExpanded] = useState(false);
  const [facultiesExpanded, setFacultiesExpanded] = useState(false);
  const [, setPacksExpanded] = useState(false);
  const [, setFormDebug] = useState({ isValid: false, isDirty: false });
  const [pricingGridData, setPricingGridData] = useState<PricingGridItem[]>([]);
  const [filteredFaculties, setFilteredFaculties] = useState<Array<{ value: string; label: string; aUGrpID: number }>>([]);
  const [facultiesLoading, setFacultiesLoading] = useState(true);

  const updateChargeDetailsFromGridRef = useRef<(() => void) | null>(null);
  const updateChargeAliasesFromGridRef = useRef<(() => void) | null>(null);
  const updateDoctorSharesFromGridRef = useRef<(() => void) | null>(null);
  const updateChargeFacultiesFromGridRef = useRef<(() => void) | null>(null);
  const updateChargePacksFromGridRef = useRef<(() => void) | null>(null);

  const isEditMode = !!charge && charge.chargeID > 0;
  const { generateChargeCode } = useScheduleOfCharges();

  const {
    serviceType = [],
    serviceGroup = [],
    pic = [],
    bedCategory = [],
    attendingPhy = [],
  } = useDropdownValues(["serviceType", "serviceGroup", "pic", "bedCategory", "attendingPhy"]);

  useEffect(() => {
    const fetchFilteredFaculties = async () => {
      try {
        setFacultiesLoading(true);
        const response = await appSubModuleService.getAll();
        const filtered = (response.data || [])
          .filter((item: any) => item.cMYN === "Y")
          .map((item: any) => ({
            value: item.aSubID || 0,
            label: item.aSubName || "",
            aUGrpID: item.aUGrpID || 0,
          }));
        setFilteredFaculties(filtered);
      } catch (error) {
        setFilteredFaculties([]);
      } finally {
        setFacultiesLoading(false);
      }
    };

    if (open) {
      fetchFilteredFaculties();
    }
  }, [open]);

  const wardCategories = useMemo(() => {
    return bedCategory.map((category) => ({
      id: Number(category.value),
      name: category.label,
    }));
  }, [bedCategory]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
    getValues,
    formState: { errors, isDirty, isValid, isSubmitting },
  } = useForm<ChargeFormData>({
    resolver: zodResolver(chargeSchema),
    mode: "onChange",
    defaultValues: {
      chargeID: 0,
      chargeCode: "",
      chargeDesc: "",
      chargesHDesc: "",
      chargeDescLang: "",
      cShortName: "",
      bChID: null,
      chargeType: "",
      chargeTo: "",
      chargeStatus: "AC",
      chargeBreakYN: "N",
      regServiceYN: "N",
      regDefaultServiceYN: "N",
      isBedServiceYN: "N",
      doctorShareYN: "N",
      rActiveYN: "Y",
      cNhsCode: "",
      cNhsEnglishName: "",
      chargeCost: 0,
      sGrpID: null,
      scheduleDate: null,
      selectedFaculties: [],
      ChargeDetails: [],
      DoctorShares: [],
      ChargeAliases: [],
      ChargeFaculties: [],
      ChargePacks: [],
    },
  });

  useEffect(() => {
    setFormDebug({ isValid, isDirty });
  }, [isValid, isDirty, errors]);

  const watchedBChID = watch("bChID");
  const watchedChargeTo = watch("chargeTo");
  const watchedSGrpID = watch("sGrpID");
  const watchedDoctorShareYN = watch("doctorShareYN");
  const watchedChargeAliases = watch("ChargeAliases") || [];
  const watchedChargeType = watch("chargeType");

  const extractSelectedFaculties = useCallback((chargeFaculties: BChargeFacultyDto[]): number[] => {
    if (!chargeFaculties || chargeFaculties.length === 0) return [];
    return chargeFaculties.map((faculty) => faculty.aSubID).filter((id) => id != null);
  }, []);

  const initializeGridData = useCallback(
    (chargeDetails: any[] = []) => {
      const patientGroups: Record<number, any[]> = {};
      chargeDetails.forEach((detail) => {
        if (detail && detail.pTypeID != null) {
          const pTypeID = Number(detail.pTypeID);
          if (!isNaN(pTypeID)) {
            if (!patientGroups[pTypeID]) {
              patientGroups[pTypeID] = [];
            }
            patientGroups[pTypeID].push(detail);
          }
        }
      });
      const gridData: PricingGridItem[] = [];
      const patientTypes = Object.keys(patientGroups).length > 0 ? Object.keys(patientGroups).map(Number) : pic.slice(0, 5).map((p) => Number(p.value));
      patientTypes.forEach((patientTypeId) => {
        const patientType = pic.find((p) => Number(p.value) === patientTypeId);
        const details = patientGroups[patientTypeId] || [];
        const wardCategoriesData: Record<string, any> = {};
        wardCategories.forEach((wc) => {
          wardCategoriesData[wc.name] = {
            DcValue: 0,
            hcValue: 0,
            chValue: 0,
          };
        });
        details.forEach((detail) => {
          const wardCategory = bedCategory.find((wc) => Number(wc.value) === detail.wCatID);
          const wcName = wardCategory?.label || getWardCategoryById(detail.wCatID);
          if (wcName && wardCategoriesData[wcName]) {
            wardCategoriesData[wcName] = {
              DcValue: detail.DcValue || 0,
              hcValue: detail.hcValue || 0,
              chValue: detail.chValue || 0,
            };
          }
        });
        gridData.push({
          id: `pic-${patientTypeId}`,
          picId: patientTypeId,
          picName: patientType?.label || `Patient Type ${patientTypeId}`,
          selected: false,
          wardCategories: wardCategoriesData,
        });
      });
      setPricingGridData(gridData);
    },
    [pic, bedCategory, wardCategories]
  );

  useEffect(() => {
    if (open) {
      if (charge) {
        const normalizedChargeAliases = [];
        const rawAliases = charge.chargeAliases || charge.ChargeAliases || [];
        if (Array.isArray(rawAliases) && rawAliases.length > 0) {
          for (const alias of rawAliases) {
            normalizedChargeAliases.push({
              chAliasID: alias.chAliasID || alias.chaliasID || 0,
              chargeID: alias.chargeID || 0,
              pTypeID: alias.pTypeID || 0,
              chargeDesc: alias.chargeDesc || "",
              chargeDescLang: alias.chargeDescLang || alias.chargeDesc || "",
              rActiveYN: "Y",
              rTransferYN: "N",
              rNotes: alias.rNotes || "",
            });
          }
        }

        const normalizedChargeDetails = [];
        const rawChargeDetails = charge.ChargeDetails || charge.chargeDetails || [];
        if (Array.isArray(rawChargeDetails) && rawChargeDetails.length > 0) {
          for (const detail of rawChargeDetails) {
            normalizedChargeDetails.push({
              chDetID: detail.chDetID || 0,
              chargeID: detail.chargeID || 0,
              pTypeID: detail.pTypeID || 0,
              wCatID: detail.wCatID || 0,
              DcValue: detail.DcValue || detail.dcValue || 0,
              hcValue: detail.hcValue || 0,
              chValue: detail.chValue || 0,
              chargeStatus: detail.chargeStatus || "AC",
              rActiveYN: "Y",
              rTransferYN: "N",
              rNotes: detail.rNotes || "",
              ChargePacks: detail.ChargePacks || detail.chargePacks || [],
            });
          }
        }

        const normalizedDoctorShares = [];
        const rawDoctorShares = charge.DoctorShares || charge.doctorShares || [];
        if (Array.isArray(rawDoctorShares) && rawDoctorShares.length > 0) {
          for (const share of rawDoctorShares) {
            normalizedDoctorShares.push({
              docShareID: share.docShareID || 0,
              chargeID: share.chargeID || 0,
              conID: share.conID || 0,
              doctorShare: share.doctorShare || 0,
              hospShare: share.hospShare || 0,
              rActiveYN: "Y",
              rTransferYN: "N",
              rNotes: share.rNotes || "",
            });
          }
        }

        const selectedFacultiesIds = extractSelectedFaculties(charge.ChargeFaculties || charge.chargeFaculties || []);

        let sGrpID = null;
        if (charge.sGrpID !== undefined && charge.sGrpID !== null) {
          sGrpID = charge.sGrpID;
        } else if (charge.serviceGroupID !== undefined && charge.serviceGroupID !== null) {
          sGrpID = charge.serviceGroupID;
        }

        let scheduleDate = null;
        if (charge.scheduleDate) {
          try {
            let parsedDate;
            if (typeof charge.scheduleDate === "string") {
              parsedDate = dayjs(charge.scheduleDate);
            } else if (charge.scheduleDate instanceof Date) {
              parsedDate = dayjs(charge.scheduleDate);
            } else {
              parsedDate = dayjs(charge.scheduleDate);
            }

            if (parsedDate.isValid()) {
              scheduleDate = parsedDate;
            } else {
              scheduleDate = null;
            }
          } catch (error) {
            scheduleDate = null;
          }
        }

        const formData = {
          chargeID: charge.chargeID || 0,
          chargeCode: charge.chargeCode || "",
          chargeDesc: charge.chargeDesc || "",
          chargesHDesc: charge.chargesHDesc || "",
          chargeDescLang: charge.chargeDescLang || "",
          cShortName: charge.cShortName || "",
          bChID: charge.bChID || null,
          chargeType: charge.chargeType || "",
          chargeTo: charge.chargeTo || "",
          chargeStatus: charge.chargeStatus || "AC",
          chargeBreakYN: charge.chargeBreakYN || "N",
          regServiceYN: charge.regServiceYN || "N",
          regDefaultServiceYN: charge.regDefaultServiceYN || "N",
          isBedServiceYN: charge.isBedServiceYN || "N",
          doctorShareYN: charge.doctorShareYN || "N",
          rActiveYN: charge.rActiveYN || "Y",
          cNhsCode: charge.cNhsCode || "",
          cNhsEnglishName: charge.cNhsEnglishName || "",
          chargeCost: charge.chargeCost || 0,
          sGrpID: sGrpID,
          scheduleDate: scheduleDate,
          selectedFaculties: selectedFacultiesIds,
          ChargeDetails: normalizedChargeDetails,
          DoctorShares: normalizedDoctorShares,
          ChargeAliases: normalizedChargeAliases,
          ChargeFaculties: charge.ChargeFaculties || charge.chargeFaculties || [],
          ChargePacks: charge.ChargePacks || charge.chargePacks || [],
        };

        reset(formData);
        initializeGridData(normalizedChargeDetails);
        setDetailsExpanded(normalizedChargeDetails.length > 0);
        setDoctorSharesExpanded(normalizedDoctorShares.length > 0);
        setAliasesExpanded(normalizedChargeAliases.length > 0);
        setFacultiesExpanded((charge.ChargeFaculties?.length || charge.chargeFaculties?.length || 0) > 0);
        setPacksExpanded((charge.ChargePacks?.length || charge.chargePacks?.length || 0) > 0);
      } else {
        const newChargeData = {
          chargeID: 0,
          chargeCode: "",
          chargeDesc: "",
          chargesHDesc: "",
          chargeDescLang: "",
          cShortName: "",
          bChID: null,
          chargeType: "",
          chargeTo: "",
          chargeStatus: "AC",
          chargeBreakYN: "N" as "Y" | "N",
          regServiceYN: "N" as "Y" | "N",
          regDefaultServiceYN: "N" as "Y" | "N",
          isBedServiceYN: "N" as "Y" | "N",
          doctorShareYN: "N" as "Y" | "N",
          rActiveYN: "Y" as "Y" | "N",
          cNhsCode: "",
          cNhsEnglishName: "",
          chargeCost: 0,
          sGrpID: null,
          scheduleDate: null,
          selectedFaculties: [],
          ChargeDetails: [],
          DoctorShares: [],
          ChargeAliases: [],
          ChargeFaculties: [],
          ChargePacks: [],
        };

        reset(newChargeData);
        setTabValue(0);
        setDetailsExpanded(false);
        setDoctorSharesExpanded(false);
        setAliasesExpanded(false);
        setFacultiesExpanded(false);
        setPacksExpanded(false);
        initializeGridData([]);
      }
    }
  }, [open, charge, extractSelectedFaculties, reset, initializeGridData]);

  const getWardCategoryById = (id: number): string => {
    const category = wardCategories.find((wc) => wc.id === id);
    if (category) return category.name;
    const bedCat = bedCategory.find((bc) => Number(bc.value) === id);
    return (bedCat?.label as string) || `Ward Category ${id}`;
  };

  const getWardCategoryIdByName = (name: string): number => {
    const category = wardCategories.find((wc) => wc.name === name);
    if (category) return category.id;
    const bedCat = bedCategory.find((bc) => bc.label === name);
    return bedCat ? Number(bedCat.value) : 0;
  };

  const updateChargeDetailsFromGrid = useCallback(() => {
    const chargeDetailsArray = [];
    for (const row of pricingGridData) {
      for (const [wcName, values] of Object.entries(row.wardCategories)) {
        if (values.DcValue === 0 && values.hcValue === 0 && values.chValue === 0) {
          continue;
        }
        const wcId = getWardCategoryIdByName(wcName);
        if (wcId) {
          chargeDetailsArray.push({
            chDetID: 0,
            chargeID: 0,
            pTypeID: row.picId,
            wCatID: wcId,
            DcValue: values.DcValue,
            hcValue: values.hcValue,
            chValue: values.chValue,
            chargeStatus: "AC",
            ChargePacks: [],
          });
        }
      }
    }
    setValue("ChargeDetails", chargeDetailsArray, { shouldValidate: true });
  }, [pricingGridData, setValue, getWardCategoryIdByName]);

  const handleRegisterUpdateFunction = useCallback((componentName: string, updateFn: () => void) => {
    switch (componentName) {
      case "priceDetails":
        updateChargeDetailsFromGridRef.current = updateFn;
        break;
      case "chargeAliases":
        updateChargeAliasesFromGridRef.current = updateFn;
        break;
      case "doctorShares":
        updateDoctorSharesFromGridRef.current = updateFn;
        break;
      case "chargeFaculties":
        updateChargeFacultiesFromGridRef.current = updateFn;
        break;
      case "chargePacks":
        updateChargePacksFromGridRef.current = updateFn;
        break;
    }
  }, []);

  const updateAllComponentsData = useCallback(() => {
    if (updateChargeDetailsFromGridRef.current) {
      updateChargeDetailsFromGridRef.current();
    } else {
      updateChargeDetailsFromGrid();
    }
    if (updateChargeAliasesFromGridRef.current) {
      updateChargeAliasesFromGridRef.current();
    }
    if (updateDoctorSharesFromGridRef.current) {
      updateDoctorSharesFromGridRef.current();
    }
    if (updateChargeFacultiesFromGridRef.current) {
      updateChargeFacultiesFromGridRef.current();
    }
    if (updateChargePacksFromGridRef.current) {
      updateChargePacksFromGridRef.current();
    }
  }, [updateChargeDetailsFromGrid]);

  const handleGenerateCode = useCallback(async () => {
    if (!watchedChargeType || !watchedChargeTo) {
      return;
    }
    try {
      setIsGeneratingCode(true);
      const codeData: ChargeCodeGenerationDto = {
        ChargeType: watchedChargeType,
        ChargeTo: watchedChargeTo,
      };
      const newCode = await generateChargeCode(codeData);
      setValue("chargeCode", newCode, { shouldValidate: true, shouldDirty: true });
      trigger();
    } catch (error) {
    } finally {
      setIsGeneratingCode(false);
    }
  }, [watchedChargeType, watchedChargeTo, generateChargeCode, setValue, trigger]);

  useEffect(() => {
    if (!isEditMode && watchedChargeType && watchedChargeTo) {
      handleGenerateCode();
    }
  }, [watchedChargeType, watchedChargeTo, isEditMode, handleGenerateCode]);

  const handleChargeTypeChange = useCallback(
    (value: any) => {
      const selectedOption = serviceType.find((option) => option.label === value);
      if (selectedOption) {
        setValue("chargeType", selectedOption.label, { shouldValidate: true, shouldDirty: true });
        setValue("bChID", Number(selectedOption.value), { shouldValidate: true, shouldDirty: true });
        trigger();

        if (!isEditMode && watchedChargeTo) {
          setTimeout(() => {
            handleGenerateCode();
          }, 100);
        }
      }
    },
    [serviceType, setValue, trigger, isEditMode, watchedChargeTo, handleGenerateCode]
  );

  const chargeTypeOptions = useMemo(() => {
    return serviceType.map((option) => ({
      value: option.label,
      label: option.label,
    }));
  }, [serviceType]);

  const onFormSubmit = async (data: ChargeFormData) => {
    try {
      updateAllComponentsData();
      await new Promise((resolve) => setTimeout(resolve, 100));
      const latestFormData = getValues();

      const chargeID = isEditMode && charge ? charge.chargeID : 0;

      let formattedScheduleDate: Date | null = null;
      if (latestFormData.scheduleDate) {
        try {
          if (dayjs.isDayjs(latestFormData.scheduleDate)) {
            formattedScheduleDate = latestFormData.scheduleDate.toDate();
          } else if (latestFormData.scheduleDate instanceof Date) {
            formattedScheduleDate = latestFormData.scheduleDate;
          } else if (typeof latestFormData.scheduleDate === "string") {
            const parsedDate = dayjs(latestFormData.scheduleDate);
            if (parsedDate.isValid()) {
              formattedScheduleDate = parsedDate.toDate();
            }
          }
        } catch (error) {
          formattedScheduleDate = null;
        }
      }

      const formattedData: ChargeWithAllDetailsDto = {
        chargeID: chargeID,
        chargeCode: latestFormData.chargeCode,
        chargeDesc: latestFormData.chargeDesc,
        chargesHDesc: latestFormData.chargesHDesc || "",
        chargeDescLang: latestFormData.chargeDescLang || "",
        cShortName: latestFormData.cShortName || "",
        chargeType: latestFormData.chargeType,
        chargeTo: latestFormData.chargeTo,
        bChID: latestFormData.bChID || 0,
        chargeStatus: latestFormData.chargeStatus || "AC",
        chargeBreakYN: latestFormData.chargeBreakYN || "N",
        regServiceYN: latestFormData.regServiceYN || "N",
        regDefaultServiceYN: latestFormData.regDefaultServiceYN || "N",
        isBedServiceYN: latestFormData.isBedServiceYN || "N",
        doctorShareYN: latestFormData.doctorShareYN || "N",
        rActiveYN: latestFormData.rActiveYN || "Y",
        rTransferYN: "N",
        cNhsCode: latestFormData.cNhsCode || "",
        cNhsEnglishName: latestFormData.cNhsEnglishName || "",
        chargeCost: latestFormData.chargeCost || 0,
        sGrpID: latestFormData.sGrpID || 0,
        scheduleDate: formattedScheduleDate,

        ChargeDetails:
          latestFormData.ChargeDetails?.map((detail) => ({
            chDetID: detail.chDetID || 0,
            chargeID: chargeID,
            pTypeID: detail.pTypeID,
            wCatID: detail.wCatID,
            DcValue: detail.DcValue || 0,
            hcValue: detail.hcValue || 0,
            chValue: detail.chValue,
            chargeStatus: detail.chargeStatus || "AC",
            rActiveYN: "Y",
            rTransferYN: "N",
            ChargePacks: (detail.ChargePacks || []).map((pack: any) => ({
              chPackID: pack.chPackID || 0,
              chargeID: pack.chargeID || chargeID,
              chDetID: pack.chDetID || detail.chDetID || 0,
              chargeRevise: pack.chargeRevise || "",
              chargeStatus: pack.chargeStatus || "AC",
              dcValue: pack.dcValue || 0,
              hcValue: pack.hcValue || 0,
              chValue: pack.chValue || 0,
              effectiveFromDate: pack.effectiveFromDate,
              effectiveToDate: pack.effectiveToDate,
              rActiveYN: "Y",
              rTransferYN: "N",
            })),
          })) || [],

        DoctorShares:
          latestFormData.DoctorShares?.map((share) => {
            return {
              docShareID: share.docShareID || 0,
              chargeID: chargeID,
              conID: share.conID,
              doctorShare: Number(share.doctorShare) || 0,
              hospShare: Number(share.hospShare) || 0,
              rActiveYN: share.rActiveYN || "Y",
              rTransferYN: share.rTransferYN || "N",
              rNotes: share.rNotes || "",
            };
          }) || [],

        ChargeAliases:
          latestFormData.ChargeAliases?.map((alias) => ({
            chAliasID: alias.chAliasID || 0,
            chargeID: chargeID,
            pTypeID: alias.pTypeID,
            chargeDesc: alias.chargeDesc,
            chargeDescLang: alias.chargeDescLang,
            rActiveYN: "Y",
            rTransferYN: "N",
            rNotes: alias.rNotes || "",
          })) || [],

        ChargeFaculties:
          latestFormData.ChargeFaculties?.map((faculty: BChargeFacultyDto) => ({
            chFacID: faculty.chFacID || 0,
            chargeID: chargeID,
            aSubID: faculty.aSubID,
            rActiveYN: "Y",
            rTransferYN: "N",
            rNotes: faculty.rNotes || "",
          })) || [],

        ChargePacks:
          latestFormData.ChargePacks?.map((pack) => ({
            chPackID: pack.chPackID || 0,
            chargeID: chargeID,
            chDetID: pack.chDetID,
            chargeRevise: pack.chargeRevise,
            chargeStatus: pack.chargeStatus || "AC",
            dcValue: pack.dcValue || 0,
            hcValue: pack.hcValue || 0,
            chValue: pack.chValue || 0,
            effectiveFromDate: pack.effectiveFromDate,
            effectiveToDate: pack.effectiveToDate,
            rActiveYN: "Y",
            rTransferYN: "N",
          })) || [],
      };

      await onSubmit(formattedData);
    } catch (error) {
      throw error;
    }
  };

  const handleClear = () => {
    if (isEditMode && charge) {
      const selectedFacultiesIds = extractSelectedFaculties(charge.ChargeFaculties || []);

      let sGrpID = null;
      if (charge.sGrpID !== undefined && charge.sGrpID !== null) {
        sGrpID = charge.sGrpID;
      } else if (charge.serviceGroupID !== undefined && charge.serviceGroupID !== null) {
        sGrpID = charge.serviceGroupID;
      }

      let scheduleDate = null;
      if (charge.scheduleDate) {
        try {
          let parsedDate;
          if (typeof charge.scheduleDate === "string") {
            parsedDate = dayjs(charge.scheduleDate);
          } else if (charge.scheduleDate instanceof Date) {
            parsedDate = dayjs(charge.scheduleDate);
          } else {
            parsedDate = dayjs(charge.scheduleDate);
          }

          if (parsedDate.isValid()) {
            scheduleDate = parsedDate;
          } else {
            scheduleDate = null;
          }
        } catch (error) {
          scheduleDate = null;
        }
      }

      reset({
        chargeID: charge.chargeID || 0,
        chargeCode: charge.chargeCode || "",
        chargeDesc: charge.chargeDesc || "",
        chargesHDesc: charge.chargesHDesc || "",
        chargeDescLang: charge.chargeDescLang || "",
        cShortName: charge.cShortName || "",
        bChID: charge.bChID || null,
        chargeType: charge.chargeType || "",
        chargeTo: charge.chargeTo || "",
        chargeStatus: charge.chargeStatus || "AC",
        chargeBreakYN: charge.chargeBreakYN || "N",
        regServiceYN: charge.regServiceYN || "N",
        regDefaultServiceYN: charge.regDefaultServiceYN || "N",
        isBedServiceYN: charge.isBedServiceYN || "N",
        doctorShareYN: charge.doctorShareYN || "N",
        rActiveYN: charge.rActiveYN || "Y",
        cNhsCode: charge.cNhsCode || "",
        cNhsEnglishName: charge.cNhsEnglishName || "",
        chargeCost: charge.chargeCost || 0,
        sGrpID: sGrpID,
        scheduleDate: scheduleDate,
        selectedFaculties: selectedFacultiesIds,
        ChargeDetails: charge.ChargeDetails || [],
        DoctorShares: charge.DoctorShares || [],
        ChargeAliases: charge.ChargeAliases || [],
        ChargeFaculties: charge.ChargeFaculties || [],
        ChargePacks: charge.ChargePacks || [],
      });
      initializeGridData(charge.ChargeDetails);
    } else {
      reset({
        chargeID: 0,
        chargeCode: "",
        chargeDesc: "",
        chargesHDesc: "",
        chargeDescLang: "",
        cShortName: "",
        bChID: null,
        chargeType: "",
        chargeTo: "",
        chargeStatus: "AC",
        chargeBreakYN: "N",
        regServiceYN: "N",
        regDefaultServiceYN: "N",
        isBedServiceYN: "N",
        doctorShareYN: "N",
        rActiveYN: "Y",
        cNhsCode: "",
        cNhsEnglishName: "",
        chargeCost: 0,
        sGrpID: null,
        scheduleDate: null,
        selectedFaculties: [],
        ChargeDetails: [],
        DoctorShares: [],
        ChargeAliases: [],
        ChargeFaculties: [],
        ChargePacks: [],
      });
      initializeGridData([]);
    }
  };

  const dialogActions = (
    <>
      <CustomButton variant="outlined" text={isEditMode ? "Reset" : "Clear"} icon={ClearIcon} onClick={handleClear} disabled={isSubmitting} color="inherit" />
      <CustomButton variant="outlined" text="Cancel" onClick={onClose} disabled={isSubmitting} />
      <SmartButton
        variant="contained"
        text={isEditMode ? "Update Charge" : "Create Charge"}
        icon={SaveIcon}
        onAsyncClick={handleSubmit(onFormSubmit)}
        asynchronous
        disabled={isSubmitting}
        color="primary"
        loadingText={isEditMode ? "Updating..." : "Creating..."}
        successText={isEditMode ? "Updated!" : "Created!"}
      />
    </>
  );

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title={isEditMode ? "Edit Charge" : "New Charge"}
      maxWidth="xl"
      fullWidth
      disableBackdropClick={isSubmitting}
      disableEscapeKeyDown={isSubmitting}
      actions={dialogActions}
    >
      <Box sx={{ width: "100%" }}>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Basic Charge Information
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField
                  name="chargeCode"
                  control={control}
                  type="text"
                  label="Charge Code"
                  required
                  disabled={isEditMode}
                  size="small"
                  helperText={isEditMode ? "Code cannot be changed" : isGeneratingCode ? "Generating..." : "Auto-generated based on type"}
                  adornment={
                    !isEditMode && (
                      <CustomButton
                        size="small"
                        variant="outlined"
                        text="Generate"
                        onClick={handleGenerateCode}
                        disabled={!watchedChargeType || !watchedChargeTo || isGeneratingCode}
                      />
                    )
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField
                  name="chargeType"
                  control={control}
                  type="select"
                  onChange={handleChargeTypeChange}
                  label="Charge Type"
                  required
                  size="small"
                  options={chargeTypeOptions}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField
                  name="chargeTo"
                  control={control}
                  type="select"
                  label="Charge To"
                  required
                  size="small"
                  onChange={(value) => {
                    if (!isEditMode && watchedChargeType && value) {
                      setTimeout(() => {
                        handleGenerateCode();
                      }, 100);
                    }
                  }}
                  options={[
                    { value: "PAT", label: "Patient" },
                    { value: "INS", label: "Insurance" },
                    { value: "GOVT", label: "Government" },
                    { value: "CORP", label: "Corporate" },
                  ]}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="chargeDesc" control={control} type="text" label="Charge Name" required size="small" />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="cShortName" control={control} type="text" label="Short Name" size="small" />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="sGrpID" control={control} type="select" label="Service Group" size="small" options={serviceGroup} />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="chargeCost" control={control} type="number" label="Charge Cost" size="small" />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="cNhsCode" control={control} type="text" label="Resource Code" size="small" />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="cNhsEnglishName" control={control} type="text" label="Resource Name" size="small" />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="scheduleDate" control={control} type="datepicker" label="Schedule Date" size="small" minDate={dayjs()} />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="chargesHDesc" control={control} type="textarea" label="Charge Description" size="small" />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Configuration Options
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <EnhancedFormField name="doctorShareYN" control={control} type="switch" label="Enable Doctor Share" size="small" />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <EnhancedFormField name="regServiceYN" control={control} type="switch" label="Registration Service" size="small" />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <EnhancedFormField name="isBedServiceYN" control={control} type="switch" label="Bed Service" size="small" />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <EnhancedFormField name="chargeBreakYN" control={control} type="switch" label="Charge Break" size="small" />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <EnhancedFormField name="chargeStatus" control={control} type="switch" label="Charge Status" size="small" />
                  </Grid>

                  <Grid size={{ xs: 12, md: 3 }}>
                    <EnhancedFormField name="rActiveYN" control={control} type="switch" label=" Status" size="small" />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>

          <AssociatedFacultiesComponent
            control={control}
            expanded={facultiesExpanded}
            onToggleExpand={() => setFacultiesExpanded(!facultiesExpanded)}
            subModules={filteredFaculties}
            disabled={facultiesLoading}
            showValidation={!facultiesLoading}
          />

          <PriceDetailsComponent
            control={control}
            expanded={detailsExpanded}
            onToggleExpand={() => setDetailsExpanded(!detailsExpanded)}
            pricingGridData={pricingGridData}
            setPricingGridData={setPricingGridData}
            updateChargeDetailsFromGrid={updateChargeDetailsFromGrid}
            wardCategories={wardCategories}
            pic={pic}
            bedCategory={bedCategory}
          />

          <ChargeAliasesComponent
            control={control}
            expanded={aliasesExpanded}
            onToggleExpand={() => setAliasesExpanded(!aliasesExpanded)}
            pic={pic}
            chargeAliases={watchedChargeAliases}
            onUpdateFunction={(updateFn) => handleRegisterUpdateFunction("chargeAliases", updateFn)}
          />

          <DoctorSharesComponent
            control={control}
            expanded={doctorSharesExpanded}
            onToggleExpand={() => setDoctorSharesExpanded(!doctorSharesExpanded)}
            attendingPhy={attendingPhy}
            doctorShareEnabled={watchedDoctorShareYN === "Y"}
          />
        </form>
      </Box>
    </GenericDialog>
  );
};

export default ChargeFormDialog;
