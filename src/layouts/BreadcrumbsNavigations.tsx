import React, { useMemo } from "react";
import { Breadcrumbs, Link as MuiLink, Typography, Box, useTheme, styled, alpha, Chip, Tooltip } from "@mui/material";
import { useLocation, Link as RouterLink } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import routeConfig from "@/routes/routeConfig";
import { LinkProps as MuiLinkProps } from "@mui/material/Link";

// Custom link component that combines React Router and MUI Link
interface BreadcrumbLinkProps {
  to: string;
  children: React.ReactNode;
  underline?: MuiLinkProps["underline"];
}

const RouterBreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(({ to, children, underline = "hover", ...props }, ref) => {
  const theme = useTheme();

  return (
    <MuiLink
      component={RouterLink}
      to={to}
      ref={ref}
      underline={underline}
      sx={{
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
      }}
      {...props}
    >
      {children}
    </MuiLink>
  );
});

RouterBreadcrumbLink.displayName = "RouterBreadcrumbLink";

const BreadcrumbChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== "category",
})<{ category: string }>(({ theme, category }) => {
  const categoryColors = {
    patient: theme.palette.primary.main,
    clinical: theme.palette.info.main,
    billing: theme.palette.success.main,
    inventory: theme.palette.warning.main,
    admin: theme.palette.secondary.main,
    default: theme.palette.grey[600],
  };

  const color = categoryColors[category as keyof typeof categoryColors] || categoryColors.default;

  return {
    height: 20,
    fontSize: "0.75rem",
    backgroundColor: alpha(color, 0.1),
    color: color,
    fontWeight: 500,
    border: `1px solid ${alpha(color, 0.3)}`,
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

      // Get display name and category from route metadata or use fallback
      const displayName =
        routeEntry?.metadata?.title ||
        value.charAt(0).toUpperCase() +
          value
            .slice(1)
            .replace(/([A-Z])/g, " $1")
            .trim();

      const category = routeEntry?.metadata?.category || "default";

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
      const homeRoute = routeConfig.find((route) => route.path === "/dashboard");
      crumbs.unshift({
        path: "/dashboard",
        name: "Home",
        active: false,
        category: homeRoute?.metadata?.category || "default",
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
        mb: 1,
        mt: 0,
        px: 0,
        py: 0,
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
