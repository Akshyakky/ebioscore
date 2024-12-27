import React, { useState, useEffect, useCallback } from "react";
import { Grid, Typography, Box, SelectChangeEvent } from "@mui/material";
import FormField from "../../../../components/FormField/FormField";
import AdvancedGrid, { ColumnConfig } from "@/components/AdvancedGrid/AdvancedGrid";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { BDoctorSharePerShare, ChargeDetailsDto } from "../../../../interfaces/Billing/BChargeDetails";
import { useAppSelector } from "@/store/hooks";

interface ChargeDoctorSharePerShareProps {
  onGridDataChange: (data: BDoctorSharePerShare[]) => void;
  chargeId?: number;
  savedDoctorShares?: BDoctorSharePerShare[];
}

interface GridData {
  serialNumber: number;
  serviceName: string;
  attendingPhysician: string;
  docShare: number;
  hospShare: number;
  totalAmount: number;
  conID: number;
  docShareID: number;
}

const ChargeDoctorSharePerShare: React.FC<ChargeDoctorSharePerShareProps> = ({ onGridDataChange, chargeId, savedDoctorShares }) => {
  const [gridData, setGridData] = useState<GridData[]>([]);
  const [selectedPhysician, setSelectedPhysician] = useState<string>("");
  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  const dropdownValues = useDropdownValues(["attendingPhy"]);
  const { compID, compCode, compName } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const baseColumns: ColumnConfig[] = [
      { key: "serialNumber", label: "S.No", editable: false },
      { key: "attendingPhysician", label: "Attending Physician", editable: false },
      { key: "docShare", label: "Doctor Share (%)", editable: true, type: "number", input: true },
      { key: "hospShare", label: "Hospital Share (%)", editable: true, type: "number", input: true },
      { key: "totalAmount", label: "Total Amount (100%)", editable: false },
    ];
    setColumns(baseColumns);
  }, []);

  useEffect(() => {
    if (savedDoctorShares && savedDoctorShares.length > 0) {
      // Get the first saved physician's conID
      const firstPhysicianConId = savedDoctorShares[0].conID?.toString();
      if (firstPhysicianConId) {
        setSelectedPhysician(firstPhysicianConId);
      }
      const savedGridData = savedDoctorShares.map((share, index) => ({
        serialNumber: index + 1,
        attendingPhysician: dropdownValues.attendingPhy?.find((phy) => phy.value === share.conID?.toString())?.label || "",
        docShare: share.doctorShare,
        hospShare: share.hospShare,
        totalAmount: share.doctorShare + share.hospShare,
        conID: share.conID,
        docShareID: share.doctorShareID,
        serviceName: "Default Service",
      }));
      setGridData(savedGridData);
    }
  }, [savedDoctorShares, dropdownValues.attendingPhy]);

  const handlePhysicianChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setSelectedPhysician(value);
    const consultantId = parseInt(value, 10);
    const physicianName = dropdownValues.attendingPhy?.find((phy) => phy.value === value)?.label || "";
    if (gridData.length === 0) {
      const newGridData: GridData[] = [
        {
          serialNumber: 1,
          attendingPhysician: physicianName,
          docShare: 0,
          hospShare: 100,
          totalAmount: 100,
          conID: consultantId,
          docShareID: 0,
          serviceName: "",
        },
      ];
      setGridData(newGridData);
      const doctorShareData: BDoctorSharePerShare[] = [
        {
          docShareID: 0,
          chargeID: chargeId || 0,
          conID: consultantId,
          doctorShare: 0,
          hospShare: 100,
          compID: compID || 0,
          compCode: compCode || "",
          compName: compName || "",
          rActiveYN: "Y",
          transferYN: "N",
          rNotes: "",
          isSubmitted: false,
        },
      ];
      onGridDataChange(doctorShareData);
    }
  };

  const handleRowChange = useCallback(
    (updatedData: GridData[]) => {
      const processedData = updatedData.map((row) => {
        const docShare = Number(row.docShare) || 0;
        const hospShare = Number(row.hospShare) || 0;
        let updatedRow = { ...row };
        if (docShare !== row.docShare) {
          updatedRow = {
            ...row,
            docShare: Math.min(100, Math.max(0, docShare)),
            hospShare: Math.min(100, Math.max(0, 100 - docShare)),
          };
        } else if (hospShare !== row.hospShare) {
          updatedRow = {
            ...row,
            hospShare: Math.min(100, Math.max(0, hospShare)),
            docShare: Math.min(100, Math.max(0, 100 - hospShare)),
          };
        }
        return updatedRow;
      });
      setGridData(processedData);
      const doctorShareData: BDoctorSharePerShare[] = processedData.map((row) => ({
        docShareID: row.docShareID,
        chargeID: 0,
        conID: row.conID,
        doctorShare: row.docShare,
        hospShare: row.hospShare,
        compID: compID || 0,
        compCode: compCode || "",
        compName: compName || "",
        rActiveYN: "Y",
        transferYN: "N",
        rNotes: "",
        isSubmitted: false,
      }));

      onGridDataChange(doctorShareData);
    },
    [compID, compCode, compName, onGridDataChange]
  );

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Doctor Share Per Service
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormField
            type="select"
            label="Attending Physician"
            name="attendingPhysicianId"
            ControlID="AttendingPhysician"
            value={selectedPhysician}
            options={dropdownValues.attendingPhy}
            onChange={handlePhysicianChange}
            defaultText="Select an attending physician"
          />
        </Grid>

        {gridData.length > 0 && (
          <Grid item xs={12}>
            <AdvancedGrid data={gridData} columns={columns} onRowChange={handleRowChange} />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ChargeDoctorSharePerShare;
