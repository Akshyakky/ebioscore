import React, { useMemo } from "react";
import { Breadcrumbs, Link as MuiLink, Typography, Box, useTheme, styled, alpha, Chip, Tooltip } from "@mui/material";
import { useLocation, Link as RouterLink } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import routeConfig from "@/routes/routeConfig";
import { LinkProps as RouterLinkProps } from "react-router-dom";
import { LinkProps as MuiLinkProps } from "@mui/material/Link";

// Create a mapping of paths to readable names
const pathMappings: Record<string, string> = {
  "": "Home",
  dashboard: "Dashboard",
  registrationpage: "Registration",
  revisitpage: "Revisit",
  routinereportspa: "Routine Reports",
  listofreportspage: "Report List",
  contactlistpage: "Contact List",
  userlistpage: "User List",
  profilelistpage: "Profile List",
  admissionpage: "Admission",
  ResourceListPage: "Resource List",
  ReasonListPage: "Reason List",
  BreakListPage: "Break List",
  Appointmentpage: "Appointments",
  PatientInvoiceCodePage: "Patient Invoice Code",
  DepartmentListPage: "Departments",
  ServiceGroupsListPage: "Service Groups",
  PaymentTypesPage: "Payment Types",
  AlertPage: "Alerts",
  WardCategoryPage: "Ward Categories",
  BedSetUpPage: "Bed Setup",
  DeptUnitListPage: "Department Units",
  InsuranceListPage: "Insurance",
  ProductListPage: "Products",
  ProductTaxListPage: "Product Tax",
  ProductOverviewPage: "Product Overview",
  ManageBedPage: "Manage Beds",
  DiagnosisListPage: "Diagnosis List",
  MedicationListPage: "Medications",
  MedicationFormPage: "Medication Forms",
  AppModifiedListPage: "Modified Applications",
  ChargeDetailsPage: "Charge Details",
  DischargePage: "Discharge",
  WardBedTransferPage: "Ward/Bed Transfer",
  MedicationFrequencyPage: "Medication Frequency",
  MedicationDosagePage: "Medication Dosage",
  ProcedureListPage: "Procedures",
  MedicationGenericPage: "Generic Medications",
  InvestigationListPage: "Investigations",
  ComponentEntryTypePage: "Component Entry Types",
  PurchaseOrderPage: "Purchase Orders",
};

// Breadcrumb category to determine color/icon
type BreadcrumbCategory = "admin" | "patient" | "clinical" | "billing" | "inventory" | "default";

// Category mapping for different route types
const categoryMapping: Record<string, BreadcrumbCategory> = {
  dashboard: "default",
  registration: "patient",
  revisit: "patient",
  admission: "patient",
  discharge: "patient",
  ward: "patient",
  manageBed: "patient",
  bedSetUp: "patient",
  department: "admin",
  profile: "admin",
  user: "admin",
  contact: "admin",
  insurance: "admin",
  diagnosis: "clinical",
  medication: "clinical",
  procedure: "clinical",
  investigation: "clinical",
  invoice: "billing",
  charge: "billing",
  payment: "billing",
  service: "billing",
  product: "inventory",
  purchase: "inventory",
};

const getCategoryForPath = (path: string): BreadcrumbCategory => {
  const pathLower = path.toLowerCase();

  // Find matching category
  for (const [key, category] of Object.entries(categoryMapping)) {
    if (pathLower.includes(key)) {
      return category;
    }
  }

  return "default";
};

// Create a custom Link component that integrates MUI Link with React Router
interface BreadcrumbLinkProps {
  to: string;
  children: React.ReactNode;
  underline?: MuiLinkProps["underline"];
}

// Custom link component that combines React Router and MUI Link
const RouterBreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(({ to, children, underline = "hover", ...props }, ref) => {
  return (
    <MuiLink
      component={RouterLink}
      to={to}
      ref={ref}
      underline={underline}
      sx={(theme) => ({
        display: "flex",
        alignItems: "center",
        textDecoration: "none",
        color: theme.palette.text.secondary,
        fontWeight: 500,
        fontSize: "0.875rem",
        "&:hover": {
          textDecoration: "underline",
          color: theme.palette.primary.main,
        },
      })}
      {...props}
    >
      {children}
    </MuiLink>
  );
});

RouterBreadcrumbLink.displayName = "RouterBreadcrumbLink";

const BreadcrumbChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== "category",
})<{ category: BreadcrumbCategory }>(({ theme, category }) => {
  // Different colors based on category
  const getColorForCategory = () => {
    switch (category) {
      case "patient":
        return theme.palette.primary.main;
      case "clinical":
        return theme.palette.info.main;
      case "billing":
        return theme.palette.success.main;
      case "inventory":
        return theme.palette.warning.main;
      case "admin":
        return theme.palette.secondary.main;
      default:
        return theme.palette.grey[600];
    }
  };

  return {
    height: 26,
    fontSize: "0.75rem",
    backgroundColor: alpha(getColorForCategory(), 0.1),
    color: getColorForCategory(),
    fontWeight: 600,
    border: `1px solid ${alpha(getColorForCategory(), 0.3)}`,
    "& .MuiChip-label": {
      padding: "0 8px",
    },
  };
});

interface BreadcrumbsNavigationProps {
  showHome?: boolean;
}

const BreadcrumbsNavigation: React.FC<BreadcrumbsNavigationProps> = ({ showHome = true }) => {
  const location = useLocation();
  const theme = useTheme();

  // Generate breadcrumbs from current path
  const breadcrumbs = useMemo(() => {
    const pathnames = location.pathname.split("/").filter(Boolean);

    // Create breadcrumbs array
    const crumbs = pathnames.map((value, index) => {
      // Build up path for this breadcrumb
      const url = `/${pathnames.slice(0, index + 1).join("/")}`;

      // Find route config entry for additional info
      const routeEntry = routeConfig.find((route) => route.path === url || route.path === url.toLowerCase());

      // Find display name from mapping or use capitalized path
      const displayName =
        pathMappings[value] ||
        value.charAt(0).toUpperCase() +
          value
            .slice(1)
            .replace(/([A-Z])/g, " $1")
            .trim();

      // Determine category for styling
      const category = getCategoryForPath(value);

      return {
        path: url,
        name: displayName,
        active: index === pathnames.length - 1,
        category,
        isProtected: routeEntry?.protected || false,
      };
    });

    // Add home as first breadcrumb if requested
    if (showHome && pathnames.length > 0) {
      crumbs.unshift({
        path: "/dashboard",
        name: "Home",
        active: false,
        category: "default" as BreadcrumbCategory,
        isProtected: true,
      });
    }

    return crumbs;
  }, [location.pathname, showHome]);

  // Don't show breadcrumbs for dashboard/home
  if (breadcrumbs.length <= 1 && location.pathname === "/dashboard") {
    return null;
  }

  return (
    <Box
      sx={{
        mb: 2,
        mt: 1,
        px: 1,
        py: 0.75,
        backgroundColor: theme.palette.background.default,
        borderRadius: 1,
        display: "flex",
        alignItems: "center",
      }}
      aria-label="breadcrumb"
    >
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb navigation">
        {breadcrumbs.map((breadcrumb, index) => {
          // Final breadcrumb (current page)
          if (breadcrumb.active) {
            return (
              <Box key={index} sx={{ display: "flex", alignItems: "center" }}>
                <BreadcrumbChip category={breadcrumb.category} label={breadcrumb.name} size="small" />
              </Box>
            );
          }

          // Home breadcrumb
          if (breadcrumb.path === "/dashboard") {
            return (
              <Tooltip key={index} title="Home">
                <RouterBreadcrumbLink to={breadcrumb.path}>
                  <HomeIcon fontSize="small" sx={{ mr: 0.5 }} />
                  {breadcrumb.name}
                </RouterBreadcrumbLink>
              </Tooltip>
            );
          }

          // Regular breadcrumb links
          return (
            <RouterBreadcrumbLink key={index} to={breadcrumb.path}>
              {breadcrumb.name}
            </RouterBreadcrumbLink>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default BreadcrumbsNavigation;
