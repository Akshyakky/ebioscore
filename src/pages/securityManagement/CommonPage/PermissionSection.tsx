import React from "react";
import { Grid, Typography, Checkbox, FormGroup, FormControlLabel } from "@mui/material";

interface Permission {
  operationID: number;
  operationName: string;
  allow: boolean;
}

interface PermissionSectionProps {
  title: string;
  permissions: Permission[];
  selectAllChecked: boolean;
  handleSelectAllChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handlePermissionChange: (operationID: number, isChecked: boolean) => void;
}

const PermissionSection: React.FC<PermissionSectionProps> = ({ title, permissions, selectAllChecked, handleSelectAllChange, handlePermissionChange }) => {
  return (
    <>
      {/* Header with Select All Checkbox */}
      <Grid container spacing={2} alignItems="center" sx={{ marginTop: 2 }}>
        <Grid item xs={6}>
          <Typography variant="subtitle1">
            <strong>{title}</strong>
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={<Checkbox checked={selectAllChecked} onChange={handleSelectAllChange} name={`selectAll_${title}`} color="primary" />}
            label="Allow [Select All]"
          />
        </Grid>
      </Grid>

      {/* Permissions List */}
      <FormGroup>
        {permissions.map((permission) => (
          <Grid container spacing={2} alignItems="center" key={permission.operationID} sx={{ marginTop: 1 }}>
            <Grid item xs={6}>
              <Typography variant="body1">{permission.operationName}</Typography>
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={permission.allow}
                    onChange={(event) => handlePermissionChange(permission.operationID, event.target.checked)}
                    name={`${title.toLowerCase()}permission_${permission.operationID}`}
                    color="primary"
                  />
                }
                label=""
              />
            </Grid>
          </Grid>
        ))}
      </FormGroup>
    </>
  );
};

export default PermissionSection;
