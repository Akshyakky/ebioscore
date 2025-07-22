// src/layouts/CompactLayout/CompactFooter.tsx
import { BugReport, BusinessOutlined } from "@mui/icons-material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PrivacyTipOutlinedIcon from "@mui/icons-material/PrivacyTipOutlined";
import UpdateIcon from "@mui/icons-material/Update";
import { Box, Container, Divider, Grid, IconButton, Link, Stack, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import React from "react";
import { useDensity } from "./MainLayout/MainLayout";

interface FooterLinkProps {
  href: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  isCompact?: boolean;
}

const FooterLink: React.FC<FooterLinkProps> = ({ href, icon: Icon, children, isCompact = false }) => {
  return (
    <Link
      href={href}
      underline="hover"
      color="inherit"
      target="_blank"
      rel="noopener noreferrer"
      display="flex"
      alignItems="center"
      py={isCompact ? 0.25 : 0.5}
      sx={{
        fontSize: isCompact ? "0.75rem" : "0.875rem",
        lineHeight: isCompact ? 1.2 : 1.4,
      }}
    >
      {Icon && <Icon fontSize="small" sx={{ mr: isCompact ? 0.5 : 1 }} />}
      <Typography variant="body2" component="span" sx={{ fontSize: "inherit", lineHeight: "inherit" }}>
        {children}
      </Typography>
    </Link>
  );
};

const Footer: React.FC = () => {
  const theme = useTheme();
  const { density, isCompactMode } = useDensity();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const currentYear = new Date().getFullYear();
  const appVersion = "2.5.1";

  const isCompact = isCompactMode || density === "compact";
  const paddingY = isCompact ? (isMobile ? 1 : 1) : isMobile ? 2 : 1.5;
  const spacing = isCompact ? 1 : 2;

  return (
    <Box component="footer" bgcolor="background.paper" color="text.secondary" borderTop={1} borderColor="divider" mt="auto" py={paddingY}>
      <Container maxWidth="lg">
        {/* Main footer content */}
        <Grid container spacing={spacing} justifyContent="space-between" alignItems="flex-start">
          {/* Copyright and company info */}
          <Grid size={{ xs: 12, md: isCompact ? 6 : 4 }}>
            <Box mb={{ xs: spacing, md: 0 }}>
              <Box display="flex" alignItems="center" mb={isCompact ? 0.5 : 1}>
                <BusinessOutlined color="primary" fontSize={isCompact ? "small" : "small"} sx={{ mr: 0.5 }} />
                <Typography variant="body2" fontWeight="medium" sx={{ fontSize: isCompact ? "0.8rem" : "0.875rem" }}>
                  Biosoft Health Tech Private Ltd.
                </Typography>
              </Box>

              {!isCompact && (
                <Typography variant="caption" color="text.secondary" paragraph sx={{ fontSize: "0.75rem", mb: 1 }}>
                  Electronic Hospital Information System (eBois). Streamlining healthcare management and patient care.
                </Typography>
              )}

              <Box display="flex" alignItems="center" mt={isCompact ? 0.5 : 1}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: isCompact ? "0.65rem" : "0.75rem" }}>
                  Version {appVersion}
                </Typography>
                <Tooltip title="Latest updates">
                  <IconButton size="small" color="inherit" sx={{ ml: 0.5, p: isCompact ? 0.25 : 0.5 }}>
                    <UpdateIcon fontSize={isCompact ? "small" : "small"} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Grid>

          {/* Quick links - conditional rendering based on screen size and compact mode */}
          {!isMobile && (
            <Grid size={{ xs: 12, md: isCompact ? 6 : 4 }}>
              <Box mb={{ xs: spacing, md: 0 }}>
                <Typography variant="body2" color="text.secondary" fontWeight="medium" mb={isCompact ? 0.5 : 1} sx={{ fontSize: isCompact ? "0.8rem" : "0.875rem" }}>
                  Quick Links
                </Typography>
                <Stack direction={isTablet || isCompact ? "row" : "column"} spacing={isTablet || isCompact ? 1 : 0} flexWrap="wrap" gap={isCompact ? 0.5 : 1}>
                  <FooterLink href="/help" icon={HelpOutlineIcon} isCompact={isCompact}>
                    Help Center
                  </FooterLink>
                  <FooterLink href="/support" icon={BugReport} isCompact={isCompact}>
                    Report an Issue
                  </FooterLink>
                  {!isCompact && (
                    <>
                      <FooterLink href="/terms" icon={InfoOutlinedIcon} isCompact={isCompact}>
                        Terms of Service
                      </FooterLink>
                      <FooterLink href="/privacy" icon={PrivacyTipOutlinedIcon} isCompact={isCompact}>
                        Privacy Policy
                      </FooterLink>
                    </>
                  )}
                </Stack>
              </Box>
            </Grid>
          )}

          {/* Contact information - hidden in compact mode on smaller screens */}
          {!isTablet && !isCompact && (
            <Grid size={{ xs: 12, md: 4 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight="medium" mb={1}>
                  Contact
                </Typography>
                <Typography variant="caption" paragraph sx={{ fontSize: "0.75rem" }}>
                  For support, please contact your system administrator or IT department.
                </Typography>
                <Tooltip title="Visit Biosoft website">
                  <Link
                    href="https://www.biosoftltd.com/"
                    underline="hover"
                    color="primary"
                    fontWeight="medium"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ fontSize: "0.8rem" }}
                  >
                    www.biosoftltd.com
                  </Link>
                </Tooltip>
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Copyright bar */}
        <Divider sx={{ my: isCompact ? 1 : 1.5 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
          {/* Copyright notice */}
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: isCompact ? "0.65rem" : "0.75rem" }}>
            Copyright © {currentYear}{" "}
            <Link href="https://www.biosoftltd.com/" underline="hover" color="inherit" fontWeight="medium" target="_blank" rel="noopener noreferrer" sx={{ fontSize: "inherit" }}>
              Biosoft Health Tech Private Ltd.
            </Link>{" "}
            All Rights Reserved.
          </Typography>

          {/* Mobile view links (condensed) */}
          {isMobile ? (
            <Box display="flex" gap={isCompact ? 0.5 : 1} mt={{ xs: 1, sm: 0 }}>
              <Tooltip title="Terms of Service">
                <IconButton size="small" component={Link} href="/terms" color="inherit" sx={{ p: isCompact ? 0.25 : 0.5 }}>
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Privacy Policy">
                <IconButton size="small" component={Link} href="/privacy" color="inherit" sx={{ p: isCompact ? 0.25 : 0.5 }}>
                  <PrivacyTipOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Help">
                <IconButton size="small" component={Link} href="/help" color="inherit" sx={{ p: isCompact ? 0.25 : 0.5 }}>
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ) : !isCompact ? (
            // Desktop view links - only show in non-compact mode
            <Box display="flex" gap={2}>
              <Link href="/terms" variant="caption" color="text.secondary" underline="hover" target="_blank" rel="noopener noreferrer" sx={{ fontSize: "0.75rem" }}>
                Terms of Service
              </Link>
              <Link href="/privacy" variant="caption" color="text.secondary" underline="hover" target="_blank" rel="noopener noreferrer" sx={{ fontSize: "0.75rem" }}>
                Privacy Policy
              </Link>
            </Box>
          ) : null}
        </Box>
      </Container>
    </Box>
  );
};

export default React.memo(Footer);
