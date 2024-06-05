import React, { useCallback, useContext, useEffect, useState } from "react";
import { ContactListSearchResult } from "../../../../interfaces/hospitalAdministration/ContactListData";
import CustomButton from "../../../../components/Button/CustomButton";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import { ContactListSearchContext } from "../../../../context/hospitalAdministration/ContactListSearchContext";
import { debounce } from "../../../../utils/Common/debounceUtils";
interface ContactListSearchResultProps {
  show: boolean;
  handleClose: () => void;
  onEditContactList: (conID: number) => void;
}
const ContactListSearch: React.FC<ContactListSearchResultProps> = ({
  show,
  handleClose,
  onEditContactList,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { performSearch, searchResults } = useContext(ContactListSearchContext);
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      performSearch(searchQuery);
    }, 500),
    []
  );
  useEffect(() => {
    if (searchTerm !== "") {
      debouncedSearch(searchTerm);
    }
  }, [searchTerm, debouncedSearch]);
  const handleEditAndClose = (conID: number) => {
    onEditContactList(conID);
    handleClose();
  };
  const columns = [
    {
      key: "ContactListEdit",
      header: "Edit",
      visible: true,
      render: (row: ContactListSearchResult) => (
        <CustomButton
          text="Edit"
          onClick={() => handleEditAndClose(row.conID)}
          icon={EditIcon}
        />
      ),
    },
    {
      key: "conName",
      header: "Name",
      visible: true,
    },
    {
      key: "deptName",
      header: "Department",
      visible: true,
    },
    {
      key: "conEmpYN",
      header: "Employee",
      visible: true,
    },
    {
      key: "rActive",
      header: "Record Status",
      visible: true,
    },
  ];
  return (
    <Dialog
      open={show}
      onClose={(event, reason) => {
        if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
          handleClose();
        }
      }}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6">Contact List Search</Typography>
      </DialogTitle>
      <DialogContent
        sx={{
          minHeight: "600px",
          maxHeight: "600px",
          overflowY: "auto",
        }}
      >
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} lg={4}>
              <FloatingLabelTextBox
                ControlID="SearchTerm"
                title="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter UHID, name, or mobile number"
                size="small"
                autoComplete="off"
              />
            </Grid>
          </Grid>
        </Box>
        <CustomGrid
          columns={columns}
          data={searchResults}
          minHeight="500px"
          maxHeight="500px"
        />
      </DialogContent>
      <DialogActions>
        <CustomButton
          variant="contained"
          text="Close"
          icon={CloseIcon}
          size="medium"
          onClick={handleClose}
          color="secondary"
        />
      </DialogActions>
    </Dialog>
  );
};

export default ContactListSearch;
