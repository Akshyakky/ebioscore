import React, { useEffect, useState } from "react";
import { DeptUserListService } from "../../../../../services/BillingServices/DeptUserListService";
import { DeptUserDto } from "../../../../../interfaces/Billing/DeptUserDto";
import GenericDialog from "../../../../../components/GenericDialog/GenericDialog";
import CustomButton from "../../../../../components/Button/CustomButton";
import AddIcon from "@mui/icons-material/Add";
import DeptUsersList from "./DeptUsersList";
import DeptUsersListSearch from "./DeptUsersSearch";

interface DeptUsersListPageProps {
  deptId: number;
  deptName: string;
  openDialog: boolean;
  handleCloseDialog: () => void;
}

export const DeptUsersPage: React.FC<DeptUsersListPageProps> = ({
  deptId,
  deptName,
  openDialog,
  handleCloseDialog,
}) => {
  const [deptUsers, setDeptUsers] = useState<DeptUserDto[]>([]);

  //
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleAdvancedSearch = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };
  const handleSelect = (data: DeptUserDto) => {
    console.log(data);
  };
  //

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
        });
    }
  }, [deptId]);

  const handleSwitchChange = (
    userId: number,
    field: string,
    value: boolean
  ) => {
    setDeptUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.deptUserID === userId
          ? { ...user, [field]: value ? "Y" : "N" }
          : user
      )
    );
  };

  const handleDelete = (userId: number) => {
    setDeptUsers((prevUsers) =>
      prevUsers.filter((user) => user.deptUserID !== userId)
    );
  };

  return (
    <GenericDialog
      open={openDialog}
      onClose={handleCloseDialog}
      title={`Manage ${deptName} Department's User Access`}
      fullWidth
      maxWidth="lg"
    >
      <CustomButton
        size="medium"
        onClick={handleAdvancedSearch}
        icon={AddIcon}
        color="secondary"
        variant="contained"
        text="Add User"
      />
      <DeptUsersList
        deptUsers={deptUsers}
        handleSwitchChange={handleSwitchChange}
        handleDelete={handleDelete}
      />
      <DeptUsersListSearch
        open={isSearchOpen}
        onClose={handleCloseSearch}
        onSelect={handleSelect}
      />
    </GenericDialog>
  );
};
