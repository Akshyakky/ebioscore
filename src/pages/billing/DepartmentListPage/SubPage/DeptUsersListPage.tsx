import React, { useEffect, useState } from "react";
import { DeptUserListService } from "../../../../services/BillingServices/DeptUserListService";
import {
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { DeptUserDto } from "../../../../interfaces/Billing/DeptUserDto";
import GenericDialog from "../../../../components/GenericDialog/GenericDialog";

interface DeptUsersListPageProps {
  deptId: number;
  openDialog: boolean;
  handleCloseDialog: () => void;
}

export const DeptUsersListPage: React.FC<DeptUsersListPageProps> = ({
  deptId,
  openDialog,
  handleCloseDialog,
}) => {
  const [deptUsers, setDeptUsers] = useState<DeptUserDto[]>([]);

  useEffect(() => {
    if (deptId > 0) {
      DeptUserListService.getDeptUsersByDeptId(deptId)
        .then((result) => {
          const data = result.data;

          if (Array.isArray(data)) {
            setDeptUsers(data);
          } else if (data) {
            setDeptUsers([data]);
          } else {
            setDeptUsers([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching department users:", error);
          setDeptUsers([]);
        })
        .finally(() => {});
    }
  }, [deptId]);

  return (
    <GenericDialog
      open={openDialog}
      onClose={handleCloseDialog}
      title="Department Users"
      fullWidth
      maxWidth="md"
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Login Name</TableCell>
            <TableCell>User Name</TableCell>
            <TableCell>Allow IM</TableCell>
            <TableCell>Allow PM</TableCell>
            <TableCell>Delete</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {deptUsers.map((user) => (
            <TableRow key={user.deptUserID}>
              <TableCell>{user.deptUserID}</TableCell>
              <TableCell>{user.appID}</TableCell>
              <TableCell>{user.rActiveYN}</TableCell>
              <TableCell>{user.allowIMYN}</TableCell>
              <TableCell>{user.allowPMYN}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </GenericDialog>
  );
};
