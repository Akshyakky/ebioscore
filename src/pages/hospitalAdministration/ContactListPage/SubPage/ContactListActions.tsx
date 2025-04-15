import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { Box } from "@mui/material";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";

interface ContactListActionsProps {
  handleSave: () => void;
  handleClear: () => void;
}

const ContactListActions: React.FC<ContactListActionsProps> = ({ handleSave, handleClear }) => {
  return (
    <Box>
      <FormSaveClearButton clearText="Clear" saveText="Save" onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
    </Box>
  );
};

export default ContactListActions;
