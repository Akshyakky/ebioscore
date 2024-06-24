import React from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, Checkbox, FormControlLabel } from "@mui/material";

interface Permission {
  permissionID: number;
  permissionName: string;
  allow: boolean;
}

interface ReportPermissionsTableProps {
  permissions: Permission[];
  onPermissionChange: (permissionID: number, allow: boolean) => void;
  onSelectAllChange: (allow: boolean) => void;
  selectAllChecked: boolean;
}

const ReportPermissionsTable: React.FC<ReportPermissionsTableProps> = ({
  permissions,
  onPermissionChange,
  onSelectAllChange,
  selectAllChecked,
}) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Operation</TableCell>
          <TableCell>
            <FormControlLabel
              control={<Checkbox checked={selectAllChecked} onChange={(e) => onSelectAllChange(e.target.checked)} />}
              label="Allow [Select All]"
            />
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {permissions.map((permission) => (
          <TableRow key={permission.permissionID}>
            <TableCell>{permission.permissionName}</TableCell>
            <TableCell>
              <Checkbox
                checked={permission.allow}
                onChange={(e) => onPermissionChange(permission.permissionID, e.target.checked)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ReportPermissionsTable;
