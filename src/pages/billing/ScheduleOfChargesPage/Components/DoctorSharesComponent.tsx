import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Chip, IconButton, FormControl, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import { ExpandMore as ExpandMoreIcon, Delete as DeleteIcon } from "@mui/icons-material";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import { useFieldArray, Control, useWatch } from "react-hook-form";

interface DoctorShareOption {
  docShareID: number;
  chargeID: number;
  conID: string;
  doctorShare?: number | null;
  hospShare?: number | null;
  doctorName: string;
  index: number;
}

interface DoctorSharesComponentProps {
  control: Control<any>;
  expanded: boolean;
  onToggleExpand: () => void;
  attendingPhy: { value: string; label: string }[];
  doctorShareEnabled: boolean;
  onUpdateFunction?: (updateFn: () => void) => void;
}

const DoctorSharesComponent: React.FC<DoctorSharesComponentProps> = ({ control, expanded, onToggleExpand, attendingPhy, doctorShareEnabled, onUpdateFunction }) => {
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const doctorNamesRef = useRef<Map<string, string>>(new Map());
  const fieldRefsRef = useRef<Map<string, any>>(new Map());

  const { append, remove } = useFieldArray({
    control,
    name: "DoctorShares",
  });

  const doctorShares = useWatch({
    control,
    name: "DoctorShares",
  });

  const extractDoctorName = (label: string): string => {
    if (!label) return "Doctor NaN";
    const parts = label.split("|");
    return parts[0]?.trim() || "Doctor NaN";
  };

  useEffect(() => {
    attendingPhy.forEach((doctor) => {
      if (!doctorNamesRef.current.has(doctor.value)) {
        doctorNamesRef.current.set(doctor.value, extractDoctorName(doctor.label));
      }
    });
  }, [attendingPhy]);

  const getDoctorName = useCallback(
    (doctorId: string): string => {
      if (doctorNamesRef.current.has(doctorId)) {
        return doctorNamesRef.current.get(doctorId) || "Doctor undefined";
      }
      const doctor = attendingPhy.find((doc) => doc.value === doctorId);
      if (doctor) {
        const name = extractDoctorName(doctor.label);
        doctorNamesRef.current.set(doctorId, name);
        return name;
      }
      return "Doctor undefined";
    },
    [attendingPhy]
  );

  const gridData = useMemo(() => {
    if (!doctorShares) return [];

    return doctorShares.map((share: any, index: number) => {
      return {
        ...share,
        index,
        doctorName: getDoctorName(share.conID),
      };
    });
  }, [doctorShares, getDoctorName]);

  const updateFormFromGrid = useCallback(() => {}, []);

  useEffect(() => {
    if (onUpdateFunction) {
      onUpdateFunction(updateFormFromGrid);
    }
  }, [onUpdateFunction, updateFormFromGrid]);

  const isDoctorAdded = useCallback(
    (doctorId: string) => {
      return doctorShares?.some((share: any) => share.conID === doctorId);
    },
    [doctorShares]
  );

  const handleDoctorSelect = (event: SelectChangeEvent<string>) => {
    const doctorId = event.target.value;
    if (doctorId && !isDoctorAdded(doctorId)) {
      const doctor = attendingPhy.find((doc) => doc.value === doctorId);
      if (doctor) {
        doctorNamesRef.current.set(doctorId, extractDoctorName(doctor.label));
      }
      append({
        docShareID: 0,
        chargeID: 0,
        conID: doctorId,
        doctorShare: null,
        hospShare: null,
      });
      setSelectedDoctor("");
      if (!expanded) {
        onToggleExpand();
      }
    }
  };

  const handleRemoveDoctor = (index: number) => {
    remove(index);
  };

  const handleDoctorShareChange = (index: number, value: any) => {
    const numValue = Number(value) || 0;
    if (numValue >= 0 && numValue <= 100) {
      const hospitalShare = 100 - numValue;
      const hospFieldRef = fieldRefsRef.current.get(`hospShare_${index}`);
      if (hospFieldRef && hospFieldRef.onChange) {
        setTimeout(() => {
          hospFieldRef.onChange(hospitalShare);
        }, 0);
      }
    }
  };

  const handleHospitalShareChange = (index: number, value: any) => {
    const numValue = Number(value) || 0;
    if (numValue >= 0 && numValue <= 100) {
      const doctorShare = 100 - numValue;
      const doctorFieldRef = fieldRefsRef.current.get(`doctorShare_${index}`);
      if (doctorFieldRef && doctorFieldRef.onChange) {
        setTimeout(() => {
          doctorFieldRef.onChange(doctorShare);
        }, 0);
      }
    }
  };

  const calculateTotal = (doctorShare?: number, hospShare?: number | null): string => {
    const doctor = Number(doctorShare) || 0;
    const hospital = Number(hospShare) || 0;
    const total = doctor + hospital;
    return `${total}%`;
  };

  const columns: Column<DoctorShareOption>[] = [
    {
      key: "doctorName",
      header: "Doctor",
      visible: true,
      width: 180,
      render: (item) => <Typography variant="body2">{item.doctorName}</Typography>,
    },
    {
      key: "doctorShare",
      header: "Doctor Share (%)",
      visible: true,
      width: 180,
      render: (item) => (
        <EnhancedFormField
          name={`DoctorShares.${item.index}.doctorShare`}
          control={control}
          type="number"
          size="small"
          onChange={(value) => handleDoctorShareChange(item.index, value)}
          ref={(fieldProps: any) => {
            if (fieldProps && fieldProps.field) {
              fieldRefsRef.current.set(`doctorShare_${item.index}`, fieldProps.field);
            }
          }}
        />
      ),
    },
    {
      key: "hospShare",
      header: "Hospital Share (%)",
      visible: true,
      width: 180,
      render: (item) => (
        <EnhancedFormField
          name={`DoctorShares.${item.index}.hospShare`}
          control={control}
          type="number"
          size="small"
          onChange={(value) => handleHospitalShareChange(item.index, value)}
          ref={(fieldProps: any) => {
            if (fieldProps && fieldProps.field) {
              fieldRefsRef.current.set(`hospShare_${item.index}`, fieldProps.field);
            }
          }}
        />
      ),
    },
    {
      key: "total",
      header: "Total",
      visible: true,
      width: 120,
      render: (item) => {
        const total = calculateTotal(item.doctorShare, item.hospShare);

        return (
          <Typography variant="body2" fontWeight="bold" color={total === "100%" ? "success.main" : "error.main"}>
            {total}
          </Typography>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      width: 100,
      render: (item) => (
        <IconButton size="small" color="error" onClick={() => handleRemoveDoctor(item.index)}>
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  if (!doctorShareEnabled) {
    return null;
  }

  return (
    <Accordion expanded={expanded} onChange={onToggleExpand}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" gap={1} width="100%">
          <Typography variant="subtitle1" sx={{ textTransform: "uppercase", fontWeight: "bold" }}>
            Doctor Revenue Sharing
          </Typography>
          <Chip
            label={`${doctorShares?.length || 0} doctors`}
            size="small"
            sx={{
              bgcolor: "#e8f5e9",
              color: "#2e7d32",
              border: "1px solid #2e7d32",
              borderRadius: "16px",
            }}
          />
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
          <Typography sx={{ mr: 1 }}>+ Add Doctor</Typography>
          <FormControl fullWidth size="small">
            <Select
              displayEmpty
              value={selectedDoctor}
              onChange={handleDoctorSelect}
              renderValue={(selected) => {
                if (!selected) {
                  return <em>Select a doctor</em>;
                }
                const doctor = attendingPhy.find((doc) => doc.value === selected);
                return doctor?.label || selected;
              }}
              sx={{
                bgcolor: "#f5f5f5",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#e0e0e0",
                },
              }}
            >
              <MenuItem value="">
                <em>Select a doctor</em>
              </MenuItem>
              {attendingPhy.map((doctor) => (
                <MenuItem key={doctor.value} value={doctor.value} disabled={isDoctorAdded(doctor.value)}>
                  {doctor.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <CustomGrid
          columns={columns}
          data={gridData}
          maxHeight="300px"
          density="small"
          emptyStateMessage="No doctor shares configured. Select a doctor above to add revenue sharing."
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default DoctorSharesComponent;
