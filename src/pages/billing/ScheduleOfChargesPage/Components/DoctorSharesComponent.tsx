import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import { Delete as DeleteIcon, ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, FormControl, IconButton, MenuItem, Select, SelectChangeEvent, TextField, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Control, Controller, useFieldArray, useWatch } from "react-hook-form";

interface DoctorShareOption {
  docShareID: number;
  chargeID: number;
  conID: number;
  doctorShare?: number;
  hospShare?: number | null;
  doctorName: string;
  index: number;
  originalCompositeId: string;
}

interface DoctorSharesComponentProps {
  control: Control<any>;
  expanded: boolean;
  onToggleExpand: () => void;
  attendingPhy: { value: string; label: string }[];
  doctorShareEnabled: boolean;
  onUpdateFunction?: (updateFn: () => void) => void;
}

const DoctorSharesComponent: React.FC<DoctorSharesComponentProps> = ({ control, expanded, onToggleExpand, attendingPhy, doctorShareEnabled }) => {
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);
  const doctorNamesRef = useRef<Map<string, string>>(new Map());
  const fieldRefsRef = useRef<Map<string, any>>(new Map());

  const { append, remove } = useFieldArray({
    control,
    name: "DoctorShares",
  });

  const doctorShares = useWatch({
    control,
    name: "DoctorShares",
    defaultValue: [],
  });

  const extractDoctorName = (label: string): string => {
    if (!label) return "Doctor NaN";
    const parts = label.split("|");
    return parts[0]?.trim() || "Doctor NaN";
  };

  const parseCompositeId = (compositeId: string): { conID: number } => {
    const parts = compositeId.split("-");
    return {
      conID: parts.length > 0 ? Number(parts[0]) : Number(compositeId),
    };
  };

  useEffect(() => {
    attendingPhy.forEach((doctor) => {
      if (!doctorNamesRef.current.has(doctor.value)) {
        doctorNamesRef.current.set(doctor.value, extractDoctorName(doctor.label));
      }
    });
  }, [attendingPhy]);

  useEffect(() => {
    if (!isInitialized && doctorShares && doctorShares.length > 0) {
      doctorShares.forEach((share: any) => {
        if (!share.originalCompositeId) {
          const matchingDoctor = attendingPhy.find((doc) => {
            const parsed = parseCompositeId(doc.value);
            return parsed.conID === share.conID;
          });
          if (matchingDoctor) {
            share.originalCompositeId = matchingDoctor.value;
            doctorNamesRef.current.set(matchingDoctor.value, extractDoctorName(matchingDoctor.label));
          }
        }
      });
      setIsInitialized(true);
    }
  }, [doctorShares, attendingPhy, isInitialized]);

  const getDoctorName = useCallback(
    (conID: number, originalCompositeId?: string): string => {
      if (originalCompositeId && doctorNamesRef.current.has(originalCompositeId)) {
        return doctorNamesRef.current.get(originalCompositeId) || "Doctor undefined";
      }
      const doctor = attendingPhy.find((doc) => {
        const parsed = parseCompositeId(doc.value);
        return parsed.conID === conID;
      });
      if (doctor) {
        const name = extractDoctorName(doctor.label);
        doctorNamesRef.current.set(doctor.value, name);
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
        doctorName: getDoctorName(share.conID, share.originalCompositeId),
      };
    });
  }, [doctorShares, getDoctorName]);

  const isDoctorAdded = useCallback(
    (doctorCompositeId: string) => {
      const parsed = parseCompositeId(doctorCompositeId);
      return doctorShares?.some((share: any) => Number(share.conID) === parsed.conID);
    },
    [doctorShares]
  );

  const handleDoctorSelect = (event: SelectChangeEvent<string>) => {
    const doctorCompositeId = event.target.value;
    if (doctorCompositeId && !isDoctorAdded(doctorCompositeId)) {
      const doctor = attendingPhy.find((doc) => doc.value === doctorCompositeId);
      if (doctor) {
        const parsed = parseCompositeId(doctorCompositeId);
        doctorNamesRef.current.set(doctorCompositeId, extractDoctorName(doctor.label));
        const newShare = {
          docShareID: 0,
          chargeID: 0,
          conID: parsed.conID,
          doctorShare: 0,
          hospShare: 100,
          rActiveYN: "Y" as const,
          rTransferYN: "N" as const,
          rNotes: "",
          originalCompositeId: doctorCompositeId,
        };
        append(newShare);
        setSelectedDoctor("");

        if (!expanded) {
          onToggleExpand();
        }
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
        <Controller
          name={`DoctorShares.${item.index}.doctorShare`}
          control={control}
          render={({ field }) => {
            fieldRefsRef.current.set(`doctorShare_${item.index}`, field);

            return (
              <TextField
                {...field}
                type="number"
                size="small"
                fullWidth
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                value={field.value || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = Number(value);
                  field.onChange(numValue);
                  handleDoctorShareChange(item.index, value);
                }}
              />
            );
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
        <Controller
          name={`DoctorShares.${item.index}.hospShare`}
          control={control}
          render={({ field }) => {
            fieldRefsRef.current.set(`hospShare_${item.index}`, field);

            return (
              <TextField
                {...field}
                type="number"
                size="small"
                fullWidth
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                value={field.value || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = Number(value);
                  field.onChange(numValue);
                  handleHospitalShareChange(item.index, value);
                }}
              />
            );
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
          <Chip label={`${doctorShares?.length || 0} doctors`} size="small" />
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
