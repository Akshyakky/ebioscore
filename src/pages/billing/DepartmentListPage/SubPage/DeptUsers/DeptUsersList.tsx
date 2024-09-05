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
import CustomButton from "../../../../../components/Button/CustomButton";
import DeleteIcon from "@mui/icons-material/Delete";
interface DeptUsersListProps {
  deptUsers: DeptUserDto[];
  handleSwitchChange: (
    deptUserID: number,
    allowYN: string,
    value: boolean
  ) => void;
  handleDelete: (deptUserID: number) => void;
}

const DeptUsersList: React.FC<DeptUsersListProps> = ({
  deptUsers,
  handleSwitchChange,
  handleDelete,
}) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>User Name</TableCell>
          <TableCell>Inventory</TableCell>
          <TableCell>Pharmacy</TableCell>
          <TableCell>Delete</TableCell>
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
                value={user.allowIMYN === "Y"}
                checked={user.allowIMYN === "Y"}
                onChange={(e) =>
                  handleSwitchChange(
                    user.deptUserID,
                    "allowIMYN",
                    e.target.checked
                  )
                }
                name="allowIM"
                ControlID={`allowIM_${user.deptUserID}`}
              />
            </TableCell>
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
              <CustomButton
                size="medium"
                onClick={() => handleDelete(user.deptUserID)}
                icon={DeleteIcon}
                color="error"
                variant="text"
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DeptUsersList;
