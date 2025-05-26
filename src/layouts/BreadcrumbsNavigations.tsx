import React, { useMemo } from "react";
import { Breadcrumbs, Link as MuiLink, Typography, Box, Chip, Tooltip } from "@mui/material";
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
  return (
    <MuiLink component={RouterLink} to={to} ref={ref} underline={underline} color="text.secondary" {...props}>
      {children}
    </MuiLink>
  );
});

RouterBreadcrumbLink.displayName = "RouterBreadcrumbLink";

interface BreadcrumbsNavigationProps {
  showHome?: boolean;
}

const BreadcrumbsNavigation: React.FC<BreadcrumbsNavigationProps> = ({ showHome = true }) => {
  const location = useLocation();

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
    <Box mb={1} aria-label="breadcrumb">
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb navigation">
        {breadcrumbs.map((breadcrumb, index) => {
          // Final breadcrumb (current page)
          if (breadcrumb.active) {
            return <Chip key={index} label={breadcrumb.name} size="small" color="primary" variant="outlined" />;
          }

          // Home breadcrumb
          if (breadcrumb.path === "/dashboard") {
            return (
              <Tooltip key={index} title="Home">
                <RouterBreadcrumbLink to={breadcrumb.path}>
                  <Box display="flex" alignItems="center">
                    <HomeIcon fontSize="small" sx={{ mr: 0.5 }} />
                    {breadcrumb.name}
                  </Box>
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
