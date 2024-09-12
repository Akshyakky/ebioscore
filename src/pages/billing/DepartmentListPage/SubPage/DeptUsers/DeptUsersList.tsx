import React from "react";
import { DeptUserDto } from "../../../../../interfaces/Billing/DeptUserDto";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import FormField from "../../../../../components/FormField/FormField";
interface DeptUsersListProps {
  deptUsers: DeptUserDto[];
  handleSwitchChange: (
    deptUserID: number,
    allowYN: string,
    value: boolean
  ) => void;
}

const DeptUsersList: React.FC<DeptUsersListProps> = ({
  deptUsers,
  handleSwitchChange,
}) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>User Name</TableCell>
          <TableCell>Pharmacy</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Action</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {deptUsers.map((user) => (
          <TableRow key={user.deptUserID}>
            <TableCell>{user.appUserName}</TableCell>
            <TableCell>
              <FormField
                type="switch"
                label=""
                value={user.allowPMYN === "Y"}
                checked={user.allowPMYN === "Y"}
                onChange={(e) =>
                  handleSwitchChange(
                    user.deptUserID,
                    "allowPMYN",
                    e.target.checked
                  )
                }
                name="allowPM"
                ControlID={`allowPM_${user.deptUserID}`}
              />
            </TableCell>
            <TableCell>
              {user.rActiveYN === "Y" ? "Active" : "Hidden"}
            </TableCell>
            <TableCell>
              <FormField
                type="switch"
                label=""
                value={user.rActiveYN === "Y"}
                checked={user.rActiveYN === "Y"}
                onChange={(e) =>
                  handleSwitchChange(
                    user.deptUserID,
                    "rActiveYN",
                    e.target.checked
                  )
                }
                name="rActive"
                ControlID={`rActive_${user.deptUserID}`}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DeptUsersList;
