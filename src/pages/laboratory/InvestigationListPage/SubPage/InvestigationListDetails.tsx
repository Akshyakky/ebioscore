import React, { useCallback, useEffect, useState } from "react";
import { Paper, Typography, Grid } from "@mui/material";
import { LInvMastDto } from "@/interfaces/Laboratory/LInvMastDto";
import FormField from "@/components/FormField/FormField";
import { useAppSelector } from "@/store/hooks";
import { useServerDate } from "@/hooks/Common/useServerDate";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { debounce } from "lodash";
import { SelectChangeEvent } from "@mui/material";

interface InvestigationListDetailsProps {
  onUpdate: (data: LInvMastDto) => void;
  investigationData?: LInvMastDto | null;
  shouldReset?: boolean;
}

const InvestigationListDetails: React.FC<InvestigationListDetailsProps> = ({ onUpdate, investigationData, shouldReset }) => {
  const dropdownValues = useDropdownValues(["investigationType", "sampleType"]);
  const { compID, compCode, compName, userID, userName } = useAppSelector((state) => state.auth);
  const serverDate = useServerDate();

  const [formState, setFormState] = useState<LInvMastDto>({
    invID: 0,
    invName: "",
    invTypeCode: "",
    invReportYN: "N",
    invSampleYN: "N",
    invTitle: "",
    invSTitle: "",
    invPrintOrder: 0,
    deptID: 0,
    deptName: "",
    bchID: 0,
    invCode: "",
    invType: "",
    invNHCode: "",
    invNHEnglishName: "",
    invNHGreekName: "",
    invSampleType: "",
    invShortName: "",
    methods: "",
    coopLabs: "",
    compID: compID || 0,
    compCode: compCode || "",
    compName: compName || "",
    rModifiedID: userID || 0,
    rModifiedBy: userName || "",
    rCreatedID: userID || 0,
    rCreatedBy: userName || "",
    rCreatedOn: serverDate || new Date(),
    rModifiedOn: serverDate || new Date(),
    transferYN: "Y",
    rActiveYN: "Y",
    lComponentsDto: [
      {
        mGrpID: 0,
      },
    ],
    investigationDto: {},
  });

  const debouncedUpdate = useCallback(
    debounce((newState: LInvMastDto) => {
      onUpdate(newState);
    }, 500),
    [onUpdate]
  );

  useEffect(() => {
    if (investigationData) {
      setFormState((prevState) => ({
        ...prevState,
        ...investigationData,
        compID: investigationData.compID || compID || 0,
        compCode: investigationData.compCode || compCode || "",
        compName: investigationData.compName || compName || "",
        rModifiedID: userID || 0,
        rModifiedBy: userName || "",
        rModifiedOn: serverDate || new Date(),
      }));
    }
  }, [investigationData, compID, compCode, compName, userID, userName, serverDate]);

  useEffect(() => {
    if (shouldReset) {
      const initialState = {
        invID: 0,
        invName: "",
        invTypeCode: "",
        invReportYN: "N",
        invSampleYN: "N",
        invTitle: "",
        invSTitle: "",
        invPrintOrder: 0,
        deptID: 0,
        deptName: "",
        rCreatedOn: serverDate || new Date(),
        rModifiedOn: serverDate || new Date(),
        rCreatedID: 0,
        rCreatedBy: "",
        rModifiedID: 0,
        rModifiedBy: "",
        bchID: 0,
        invCode: "",
        invType: "",
        invNHCode: "",
        invNHEnglishName: "",
        invNHGreekName: "",
        invSampleType: "",
        invShortName: "",
        methods: "",
        coopLabs: "",
        transferYN: "Y",
        rActiveYN: "Y",
        compID: compID || 0,
        compCode: compCode || "",
        compName: compName || "",
        lComponentsDto: [
          {
            mGrpID: 0,
          },
        ],
        investigationDto: {},
      };

      setFormState(initialState);
      onUpdate(initialState);
    }
  }, [shouldReset, compID, compCode, compName, serverDate, onUpdate]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormState((prev) => {
        const updatedState = { ...prev, [name]: value };
        debouncedUpdate(updatedState);
        return updatedState;
      });
    },
    [debouncedUpdate]
  );

  const handleSelectChange = useCallback(
    (e: SelectChangeEvent<string>) => {
      const { name, value } = e.target;
      setFormState((prev) => {
        const updatedState = { ...prev, [name]: value };
        debouncedUpdate(updatedState);
        return updatedState;
      });
    },
    [debouncedUpdate]
  );

  const handleSwitchChange = useCallback(
    (name: string) => (e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      setFormState((prev) => {
        const updatedState = { ...prev, [name]: checked ? "Y" : "N" };
        debouncedUpdate(updatedState);
        return updatedState;
      });
    },
    [debouncedUpdate]
  );

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Typography variant="h6">INVESTIGATION DETAILS</Typography>

      <Grid container spacing={2}>
        <FormField
          type="text"
          label="Investigation Code"
          value={formState.invCode}
          onChange={handleInputChange}
          name="invCode"
          ControlID="invCode"
          placeholder="Enter Code"
          isMandatory
        />
        <FormField type="text" label="Name" value={formState.invName} onChange={handleInputChange} name="invName" ControlID="invName" placeholder="Enter Name" isMandatory />
        <FormField
          type="text"
          label="Short Name"
          value={formState.invShortName}
          onChange={handleInputChange}
          name="invShortName"
          ControlID="invShortName"
          placeholder="Enter Short Name"
        />

        <FormField
          type="select"
          label="Sample Type"
          value={formState.invSampleType || ""}
          onChange={handleSelectChange}
          name="invSampleType"
          ControlID="invSampleType"
          options={dropdownValues.sampleType || [{ value: "", label: "Loading..." }]}
          isMandatory
        />

        <FormField
          type="select"
          label="Investigation Type"
          value={formState.invType || ""}
          onChange={handleSelectChange}
          name="invType"
          ControlID="invType"
          options={dropdownValues.investigationType || [{ value: "", label: "Loading..." }]}
          isMandatory
        />

        <FormField
          type="text"
          label="Resource Code"
          value={formState.invNHCode}
          onChange={handleInputChange}
          name="invNHCode"
          ControlID="invNHCode"
          placeholder="Enter Resource Code"
        />
        <FormField
          type="text"
          label="Resource Name"
          value={formState.invNHEnglishName}
          onChange={handleInputChange}
          name="invNHEnglishName"
          ControlID="invNHEnglishName"
          placeholder="Enter Resource Name"
        />
      </Grid>

      <Grid container spacing={2}>
        <FormField
          type="textarea"
          label="Comments"
          value={formState.invTitle}
          onChange={handleInputChange}
          name="invTitle"
          ControlID="invTitle"
          placeholder="Enter Comments"
          maxLength={1000}
        />
        <FormField
          type="switch"
          label="Report Entry Required"
          checked={formState.invReportYN === "Y"}
          onChange={handleSwitchChange("invReportYN")}
          name="invReportYN"
          ControlID="invReportYN"
          placeholder="Enter Resource Name"
          value={formState.invReportYN}
        />
        <FormField
          type="switch"
          label="Sample Required"
          checked={formState.invSampleYN === "Y"}
          onChange={handleSwitchChange("invSampleYN")}
          name="invSampleYN"
          ControlID="invSampleYN"
          placeholder="Enter Resource Name"
          value={formState.invSampleYN}
        />
      </Grid>
    </Paper>
  );
};

export default React.memo(InvestigationListDetails);
