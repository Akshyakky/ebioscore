import { BugReport, BusinessOutlined } from "@mui/icons-material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PrivacyTipOutlinedIcon from "@mui/icons-material/PrivacyTipOutlined";
import UpdateIcon from "@mui/icons-material/Update";
import { Box, Container, Divider, Grid, IconButton, Link, Stack, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import React from "react";

interface FooterLinkProps {
  href: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}

const FooterLink: React.FC<FooterLinkProps> = ({ href, icon: Icon, children }) => {
  return (
    <Link href={href} underline="hover" color="inherit" target="_blank" rel="noopener noreferrer" display="flex" alignItems="center" py={0.5}>
      {Icon && <Icon fontSize="small" sx={{ mr: 1 }} />}
      <Typography variant="body2" component="span">
        {children}
      </Typography>
    </Link>
  );
};

const Footer: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const currentYear = new Date().getFullYear();
  const appVersion = "2.5.1";

  return (
    <Box component="footer" bgcolor="background.paper" color="text.secondary" borderTop={1} borderColor="divider" mt="auto" py={isMobile ? 2 : 1.5}>
      <Container maxWidth="lg">
        {/* Main footer content */}
        <Grid container spacing={2} justifyContent="space-between" alignItems="flex-start">
          {/* Copyright and company info */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box mb={{ xs: 2, md: 0 }}>
              <Box display="flex" alignItems="center" mb={1}>
                <BusinessOutlined color="primary" fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2" fontWeight="medium">
                  Biosoft Health Tech Private Ltd.
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" paragraph>
                Electronic Hospital Information System (eBois). Streamlining healthcare management and patient care.
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <Typography variant="caption" color="text.secondary">
                  Version {appVersion}
                </Typography>
                <Tooltip title="Latest updates">
                  <IconButton size="small" color="inherit">
                    <UpdateIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Grid>

          {/* Quick links */}
          {!isMobile && (
            <Grid size={{ xs: 12, md: 4 }}>
              <Box mb={{ xs: 2, md: 0 }}>
                <Typography variant="body2" color="text.secondary" fontWeight="medium" mb={1}>
                  Quick Links
                </Typography>
                <Stack direction={isTablet ? "row" : "column"} spacing={isTablet ? 2 : 0} flexWrap="wrap">
                  <FooterLink href="/help" icon={HelpOutlineIcon}>
                    Help Center
                  </FooterLink>
                  <FooterLink href="/support" icon={BugReport}>
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

          {/* Contact information */}
          {!isTablet && (
            <Grid size={{ xs: 12, md: 4 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight="medium" mb={1}>
                  Contact
                </Typography>
                <Typography variant="caption" paragraph>
                  For support, please contact your system administrator or IT department.
                </Typography>
                <Tooltip title="Visit Biosoft website">
                  <Link href="https://www.biosoftltd.com/" underline="hover" color="primary" fontWeight="medium" target="_blank" rel="noopener noreferrer">
                    www.biosoftltd.com
                  </Link>
                </Tooltip>
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Copyright bar */}
        <Divider sx={{ my: 1.5 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
          {/* Copyright notice */}
          <Typography variant="caption" color="text.secondary">
            Copyright © {currentYear}{" "}
            <Link href="https://www.biosoftltd.com/" underline="hover" color="inherit" fontWeight="medium" target="_blank" rel="noopener noreferrer">
              Biosoft Health Tech Private Ltd.
            </Link>{" "}
            All Rights Reserved.
          </Typography>

          {/* Mobile view links (condensed) */}
          {isMobile ? (
            <Box display="flex" gap={1.5} mt={{ xs: 1, sm: 0 }}>
              <Tooltip title="Terms of Service">
                <IconButton size="small" component={Link} href="/terms" color="inherit">
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Privacy Policy">
                <IconButton size="small" component={Link} href="/privacy" color="inherit">
                  <PrivacyTipOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Help">
                <IconButton size="small" component={Link} href="/help" color="inherit">
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ) : (
            // Desktop view links
            <Box display="flex" gap={2}>
              <Link href="/terms" variant="caption" color="text.secondary" underline="hover" target="_blank" rel="noopener noreferrer">
                Terms of Service
              </Link>
              <Link href="/privacy" variant="caption" color="text.secondary" underline="hover" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </Link>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default React.memo(Footer);
