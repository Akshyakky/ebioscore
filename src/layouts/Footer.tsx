import React from "react";
import { Box, Container, Typography, Link, Divider, useTheme, Grid, Stack, IconButton, Tooltip, useMediaQuery, alpha } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import BugReportIcon from "@mui/icons-material/BugReport";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PrivacyTipOutlinedIcon from "@mui/icons-material/PrivacyTipOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import UpdateIcon from "@mui/icons-material/Update";

interface FooterLinkProps {
  href: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}

// Enhanced Footer Link component with icons
const FooterLink: React.FC<FooterLinkProps> = ({ href, icon: Icon, children }) => {
  const theme = useTheme();

  return (
    <Link
      href={href}
      underline="hover"
      color="inherit"
      sx={{
        display: "flex",
        alignItems: "center",
        fontSize: "0.875rem",
        py: 0.5,
        opacity: 0.85,
        transition: "all 0.2s ease",
        "&:hover": {
          opacity: 1,
          color: theme.palette.primary.main,
        },
      }}
      target="_blank"
      rel="noopener noreferrer"
    >
      {Icon && <Icon fontSize="small" sx={{ mr: 1, fontSize: "1rem" }} />}
      {children}
    </Link>
  );
};

const Footer: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const currentYear = new Date().getFullYear();
  const appVersion = "2.5.1"; // This would ideally come from your environment or config

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.mode === "dark" ? theme.palette.background.paper : theme.palette.grey[50],
        color: theme.palette.text.secondary,
        borderTop: `1px solid ${theme.palette.divider}`,
        mt: "auto",
        py: isMobile ? 2 : 1.5,
      }}
    >
      <Container maxWidth="lg">
        {/* Main footer content */}
        <Grid container spacing={2} justifyContent="space-between" alignItems="flex-start">
          {/* Copyright and company info */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ mb: { xs: 2, md: 0 } }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                <BusinessOutlinedIcon
                  sx={{
                    fontSize: "1rem",
                    mr: 0.5,
                    verticalAlign: "text-bottom",
                    color: theme.palette.primary.main,
                  }}
                />
                Biosoft Health Tech
              </Typography>
              <Typography variant="caption" color="text.secondary" paragraph>
                Electronic Hospital Information System (eHos). Streamlining healthcare management and patient care.
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Version {appVersion}
                </Typography>
                <Tooltip title="Latest updates">
                  <IconButton size="small" color="inherit" sx={{ ml: 1, p: 0.5 }}>
                    <UpdateIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Grid>

          {/* Quick links */}
          {!isMobile && (
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ mb: { xs: 2, md: 0 } }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                  Quick Links
                </Typography>
                <Stack direction={isTablet ? "row" : "column"} spacing={isTablet ? 2 : 0} flexWrap="wrap">
                  <FooterLink href="/help" icon={HelpOutlineIcon}>
                    Help Center
                  </FooterLink>
                  <FooterLink href="/support" icon={BugReportIcon}>
                    Report an Issue
                  </FooterLink>
                  <FooterLink href="/terms" icon={InfoOutlinedIcon}>
                    Terms of Service
                  </FooterLink>
                  <FooterLink href="/privacy" icon={PrivacyTipOutlinedIcon}>
                    Privacy Policy
                  </FooterLink>
                </Stack>
              </Box>
            </Grid>
          )}

          {/* Additional info/links for desktop view */}
          {!isTablet && (
            <Grid size={{ xs: 12, md: 4 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                  Contact
                </Typography>
                <Typography variant="caption" paragraph>
                  For support, please contact your system administrator or IT department.
                </Typography>
                <Tooltip title="Visit Biosoft website">
                  <Link
                    href="https://www.biosoftltd.com/"
                    underline="hover"
                    color="primary"
                    sx={{ fontWeight: "medium", fontSize: "0.875rem" }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    www.biosoftltd.com
                  </Link>
                </Tooltip>
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Copyright bar - always visible */}
        <Divider sx={{ my: 1.5, borderColor: alpha(theme.palette.divider, 0.5) }} />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Copyright notice */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontFamily: theme.typography.fontFamily,
            }}
          >
            Copyright © {currentYear}{" "}
            <Link href="https://www.biosoftltd.com/" underline="hover" color="inherit" sx={{ fontWeight: "medium" }} target="_blank" rel="noopener noreferrer">
              Biosoft Health Tech Private Ltd.
            </Link>{" "}
            All Rights Reserved.
          </Typography>

          {/* Mobile view links (condensed) */}
          {isMobile ? (
            <Box sx={{ display: "flex", gap: 1.5, mt: { xs: 1, sm: 0 } }}>
              <Tooltip title="Terms of Service">
                <IconButton size="small" component={Link} href="/terms" color="inherit" sx={{ p: 0.5 }}>
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Privacy Policy">
                <IconButton size="small" component={Link} href="/privacy" color="inherit" sx={{ p: 0.5 }}>
                  <PrivacyTipOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Help">
                <IconButton size="small" component={Link} href="/help" color="inherit" sx={{ p: 0.5 }}>
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ) : (
            // Tablet and Desktop view links
            <Box sx={{ display: "flex", gap: 2 }}>
              <Typography variant="caption" component={Link} href="/terms" color="text.secondary" underline="hover" target="_blank" rel="noopener noreferrer">
                Terms of Service
              </Typography>
              <Typography variant="caption" component={Link} href="/privacy" color="text.secondary" underline="hover" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </Typography>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default React.memo(Footer);
