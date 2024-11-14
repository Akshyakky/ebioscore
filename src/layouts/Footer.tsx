import React from "react";
import { Box, Container, Typography, Link, Divider, useTheme } from "@mui/material";

const Footer: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.mode === "dark" ? theme.palette.background.paper : theme.palette.grey[200],
        color: theme.palette.text.primary,
        mt: "auto",
        py: 1,
      }}
    >
      <Container maxWidth="lg">
        <Divider sx={{ mb: 1, borderColor: theme.palette.divider }} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            Copyright © {new Date().getFullYear()}{" "}
            <Link href="https://www.biosoftltd.com/" underline="hover" color="inherit" sx={{ fontWeight: "medium" }} target="_blank" rel="noopener noreferrer">
              Biosoft Health Tech Private Ltd.
            </Link>{" "}
            All Rights Reserved.
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Typography variant="body2" component={Link} href="/terms" color="text.secondary" underline="hover" target="_blank" rel="noopener noreferrer">
              Terms of Service
            </Typography>
            <Typography variant="body2" component={Link} href="/privacy" color="text.secondary" underline="hover" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
