// src/pages/billing/Billing/MainPage/components/grids/ServiceGrid.tsx
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { Box, TextField, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import React, { useCallback, useMemo } from "react";
import { Control, UseFormSetValue } from "react-hook-form";
import { z } from "zod";
import { BillingFormData, BillServiceRow, BillServicesDtoSchema, DropdownOption } from "../../types";

interface ServiceGridProps {
  services: any[];
  control: Control<BillingFormData>;
  updateService: (index: number, data: any) => void;
  removeService: (index: number) => void;
  calculateDiscountFromPercent: (amount: number, percentage: number) => number;
  showAlert: (title: string, message: string, type: "success" | "error" | "warning" | "info") => void;
  physicians: DropdownOption[];
  setValue: UseFormSetValue<BillingFormData>;
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({ services, control, updateService, removeService, calculateDiscountFromPercent, showAlert, physicians, setValue }) => {
  // Convert services to DataGrid rows
  const serviceRows: BillServiceRow[] = useMemo(() => {
    return services.map((service, index) => ({
      ...service,
      id: service.billDetID || `temp-service-${index}`,
    }));
  }, [services]);

  const handleServiceFieldChange = useCallback(
    (index: number, field: string, value: any) => {
      const currentService = services[index];
      const updatedService = { ...currentService };

      // Update the changed field
      updatedService[field] = value;

      // Recalculate based on what changed
      const quantity = updatedService.chUnits || 1;
      const drAmt = updatedService.dCValue || 0;
      const hospAmt = updatedService.hCValue || 0;
      const drDiscPerc = updatedService.drPercShare || 0;
      const hospDiscPerc = updatedService.hospPercShare || 0;

      // Calculate discount amounts based on percentages
      if (field === "drPercShare" || field === "dCValue" || field === "chUnits") {
        updatedService.dValDisc = calculateDiscountFromPercent(drAmt * quantity, drDiscPerc);
      }

      if (field === "hospPercShare" || field === "hCValue" || field === "chUnits") {
        updatedService.hValDisc = calculateDiscountFromPercent(hospAmt * quantity, hospDiscPerc);
      }

      // Calculate gross amount
      updatedService.cHValue = drAmt + hospAmt;

      updateService(index, updatedService);
    },
    [services, updateService, calculateDiscountFromPercent]
  );
  const handleServiceCellValueChange = useCallback(
    (id: string | number, field: keyof z.infer<typeof BillServicesDtoSchema>, value: any) => {
      const index = services.findIndex((service, idx) => (service.billDetID || `temp-service-${idx}`) === id);
      if (index !== -1) {
        handleServiceFieldChange(index, field, value);
      }
    },
    [services, handleServiceFieldChange]
  );
  const renderServiceNumberField = useCallback(
    (params: GridRenderCellParams, field: keyof z.infer<typeof BillServicesDtoSchema>) => (
      <TextField
        size="small"
        type="number"
        value={params.row[field] || ""}
        onChange={(e) => {
          const value = parseFloat(e.target.value) || 0;
          handleServiceCellValueChange(params.id, field, value);
        }}
        sx={{ width: "100%" }}
        inputProps={{ style: { textAlign: "right" } }}
        fullWidth
      />
    ),
    [handleServiceCellValueChange]
  );
  const renderServiceDateField = useCallback(
    (params: GridRenderCellParams) => {
      const index = serviceRows.findIndex((row) => row.id === params.id);
      return <FormField name={`billServices.${index}.chargeDt`} control={control} type="datepicker" size="small" fullWidth />;
    },
    [control, serviceRows]
  );

  const renderPhysicianField = useCallback(
    (params: GridRenderCellParams) => {
      const index = serviceRows.findIndex((row) => row.id === params.id);
      return params.row.physicianYN === "Y" ? (
        <FormField
          name={`billServices.${index}.physicianID`}
          control={control}
          type="select"
          size="small"
          fullWidth
          options={physicians || []}
          defaultText="Select"
          onChange={(data: any) => {
            if (data && typeof data === "object" && "value" in data) {
              setValue(`billServices.${index}.PhysicianName`, data.label || "", { shouldDirty: true });
            }
          }}
        />
      ) : (
        <Typography variant="body2" color="text.secondary">
          N/A
        </Typography>
      );
    },
    [control, physicians, setValue, serviceRows]
  );

  // Define simplified columns
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "chargeDesc",
        headerName: "Service Name",
        width: 200,
        sortable: false,
      },
      {
        field: "physicianID",
        headerName: "Physician",
        width: 150,
        sortable: false,
        renderCell: renderPhysicianField,
      },
      {
        field: "chargeDt",
        headerName: "Effective Date",
        width: 130,
        sortable: false,
        renderCell: renderServiceDateField,
      },
      {
        field: "chUnits",
        headerName: "Quantity",
        width: 80,
        sortable: false,
        type: "number",
        renderCell: (params) => renderServiceNumberField(params, "chUnits"),
      },
      {
        field: "dCValue",
        headerName: "Dr Amt (₹)",
        width: 90,
        sortable: false,
        type: "number",
        renderCell: (params) => renderServiceNumberField(params, "dCValue"),
      },
      {
        field: "drPercShare",
        headerName: "Dr Disc %",
        width: 90,
        sortable: false,
        type: "number",
        renderCell: (params) => renderServiceNumberField(params, "drPercShare"),
      },
      {
        field: "dValDisc",
        headerName: "Dr Disc ₹",
        width: 90,
        sortable: false,
        type: "number",
        align: "right",
        headerAlign: "right",
        renderCell: (params) => (
          <TextField value={params.row.dValDisc?.toFixed(2) || "0.00"} size="small" fullWidth disabled InputProps={{ readOnly: true, style: { textAlign: "right" } }} />
        ),
      },
      {
        field: "hCValue",
        headerName: "Hosp Amt (₹)",
        width: 100,
        sortable: false,
        type: "number",
        renderCell: (params) => renderServiceNumberField(params, "hCValue"),
      },
      {
        field: "hospPercShare",
        headerName: "Hosp Disc %",
        width: 100,
        sortable: false,
        type: "number",
        renderCell: (params) => renderServiceNumberField(params, "hospPercShare"),
      },
      {
        field: "hValDisc",
        headerName: "Hosp Disc ₹",
        width: 100,
        sortable: false,
        type: "number",
        align: "right",
        headerAlign: "right",
        renderCell: (params) => (
          <TextField value={params.row.hValDisc?.toFixed(2) || "0.00"} size="small" fullWidth disabled InputProps={{ readOnly: true, style: { textAlign: "right" } }} />
        ),
      },
      {
        field: "grossAmt",
        headerName: "Gross Amt",
        width: 100,
        sortable: false,
        type: "number",
        align: "right",
        headerAlign: "right",
        renderCell: (params) => {
          const quantity = params.row.chUnits || 1;
          const drAmt = params.row.dCValue || 0;
          const hospAmt = params.row.hCValue || 0;
          const grossAmt = quantity * (drAmt + hospAmt);
          return (
            <Typography variant="body2" fontWeight="medium">
              ₹{grossAmt.toFixed(2)}
            </Typography>
          );
        },
      },
      {
        field: "discAmt",
        headerName: "Disc Amt",
        width: 90,
        sortable: false,
        type: "number",
        align: "right",
        headerAlign: "right",
        renderCell: (params) => {
          const totalDiscAmt = (params.row.dValDisc || 0) + (params.row.hValDisc || 0);
          return (
            <Typography variant="body2" color="error">
              ₹{totalDiscAmt.toFixed(2)}
            </Typography>
          );
        },
      },
      {
        field: "netAmt",
        headerName: "Net Amt",
        width: 90,
        sortable: false,
        type: "number",
        align: "right",
        headerAlign: "right",
        renderCell: (params) => {
          const quantity = params.row.chUnits || 1;
          const drAmt = params.row.dCValue || 0;
          const hospAmt = params.row.hCValue || 0;
          const grossAmt = quantity * (drAmt + hospAmt);
          const totalDiscAmt = (params.row.dValDisc || 0) + (params.row.hValDisc || 0);
          const netAmt = grossAmt - totalDiscAmt;
          return (
            <Typography variant="body2" fontWeight="bold" color="primary">
              ₹{netAmt.toFixed(2)}
            </Typography>
          );
        },
      },
      {
        field: "sGRPName",
        headerName: "Service Group",
        width: 120,
        sortable: false,
        renderCell: (params) => (
          <Typography variant="body2" noWrap>
            {params.row.sGRPName || "-"}
          </Typography>
        ),
      },
      {
        field: "packName",
        headerName: "Pack Name",
        width: 120,
        sortable: false,
        renderCell: (params) => (
          <Typography variant="body2" noWrap>
            {params.row.packName || "-"}
          </Typography>
        ),
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Delete",
        width: 90,
        getActions: (params) => {
          const index = serviceRows.findIndex((row) => row.id === params.id);
          return [
            <GridActionsCellItem
              icon={
                <Tooltip title="Remove Service">
                  <DeleteIcon color="error" />
                </Tooltip>
              }
              label="Remove"
              onClick={() => removeService(index)}
              showInMenu={false}
            />,
          ];
        },
      },
    ],
    [renderServiceNumberField, renderServiceDateField, renderPhysicianField, removeService, serviceRows]
  );

  const handleProcessRowUpdate = (newRow: any) => {
    const index = serviceRows.findIndex((row) => row.id === newRow.id);
    if (index !== -1) {
      updateService(index, newRow);
    }
    return newRow;
  };

  if (serviceRows.length === 0) {
    return (
      <Box sx={{ p: 6, textAlign: "center" }}>
        <Typography color="text.secondary">No services added. Use the search box above to add services.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={serviceRows}
        columns={columns}
        density="compact"
        disableRowSelectionOnClick
        processRowUpdate={handleProcessRowUpdate}
        hideFooterSelectedRowCount
        pageSizeOptions={[5, 10, 25, 50]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10 },
          },
        }}
      />
    </Box>
  );
};
