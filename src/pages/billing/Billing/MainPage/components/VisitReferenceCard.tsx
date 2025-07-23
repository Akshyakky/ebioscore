// src/pages/billing/Billing/MainPage/components/VisitReferenceCard.tsx
import { Edit as EditIcon, History as HistoryIcon } from "@mui/icons-material";
import { Box, Card, CardContent, Chip, Divider, IconButton, Tooltip, Typography } from "@mui/material";
import React from "react";

interface VisitReferenceCardProps {
  visitReference: string;
  onChangeVisit: () => void;
}

export const VisitReferenceCard: React.FC<VisitReferenceCardProps> = ({ visitReference, onChangeVisit }) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <HistoryIcon color="primary" />
            <Typography variant="h6">{visitReference ? "Selected Visit" : "Select Visit"}</Typography>
          </Box>
          <Tooltip title="Change Visit">
            <IconButton
              size="small"
              color="primary"
              onClick={onChangeVisit}
              sx={{
                bgcolor: "rgba(25, 118, 210, 0.08)",
                "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        {visitReference && (
          <>
            <Divider sx={{ my: 1 }} />
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body2" color="text.secondary">
                Reference Code:
              </Typography>
              <Chip label={visitReference} color={visitReference.includes("OP") ? "primary" : "error"} variant="outlined" size="medium" />
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};
