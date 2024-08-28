import React from "react";
import { Box, Container, Typography, Link, Divider } from "@mui/material";

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: (theme) => theme.palette.grey[200],
      }}
    >
      <Container maxWidth="lg">
        <Divider sx={{ mb: 2 }} />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Copyright © {new Date().getFullYear()} <Link>Biosoft Health Tech Private Ltd.</Link> All Rights Reserved.
          </Typography>
          <Box>
            <Link href="/terms" color="inherit" sx={{ mr: 2 }}>
              Terms of Service
            </Link>
            <Link href="/privacy" color="inherit">
              Privacy Policy
            </Link>
          </Box>
        </Box>
      </Container >
    </Box >
  );
};

export default Footer;