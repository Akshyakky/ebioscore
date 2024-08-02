import React from "react";
import { Box } from "@mui/material";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";

interface ContactListActionsProps {
    handleSave: () => void;
    handleClear: () => void;
}

const ContactListActions: React.FC<ContactListActionsProps> = ({
    handleSave,
    handleClear,
}) => {
    return (
        <Box>
            <FormSaveClearButton
                clearText="Clear"
                saveText="Save"
                onClear={handleClear}
                onSave={handleSave}
                clearIcon={DeleteIcon}
                saveIcon={SaveIcon}
            />
        </Box>
    );
};

export default ContactListActions;
