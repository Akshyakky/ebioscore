import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Typography, Paper, Grid, TextField, InputAdornment, IconButton, Chip, Stack, Tooltip } from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import { ReasonListData } from "@/interfaces/FrontOffice/ReasonListData";
import ReasonListForm from "../Form/ReasonListForm";
import { showAlert } from "@/utils/Common/showAlert";
import { debounce } from "@/utils/Common/debounceUtils";
import { useReasonList } from "../hooks/useReasonList";
const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];
const ReasonListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedReason, setSelectedReason] = useState<ReasonListData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(false);

  const { reasonList, isLoading, error, fetchReasonList, deleteReason } = useReasonList();
  return <></>;
};

export default ReasonListPage;
