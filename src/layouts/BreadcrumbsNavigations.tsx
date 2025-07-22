// src/layouts/CompactLayout/CompactBreadcrumbs.tsx
import routeConfig from "@/routes/routeConfig";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Box, Breadcrumbs, Chip, Link as MuiLink, Tooltip } from "@mui/material";
import { LinkProps as MuiLinkProps } from "@mui/material/Link";
import React, { useMemo } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useDensity } from "./MainLayout/MainLayout";

interface BreadcrumbLinkProps {
  to: string;
  children: React.ReactNode;
  underline?: MuiLinkProps["underline"];
  isCompact?: boolean;
}

const RouterBreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(({ to, children, underline = "hover", isCompact = false, ...props }, ref) => {
  return (
    <MuiLink
      component={RouterLink}
      to={to}
      ref={ref}
      underline={underline}
      color="text.secondary"
      sx={{
        fontSize: isCompact ? "0.75rem" : "0.875rem",
        lineHeight: isCompact ? 1.2 : 1.4,
      }}
      {...props}
    >
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
  const { density, isCompactMode } = useDensity();

  const isCompact = isCompactMode || density === "compact";

  const breadcrumbs = useMemo(() => {
    const pathnames = location.pathname.split("/").filter(Boolean);

    const crumbs = pathnames.map((value, index) => {
      const url = `/${pathnames.slice(0, index + 1).join("/")}`;
      const routeEntry = routeConfig.find((route) => route.path === url || route.path === url.toLowerCase());

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

  if (breadcrumbs.length <= 1 && location.pathname === "/dashboard") {
    return null;
  }

  return (
    <Box mb={isCompact ? 0.5 : 1} aria-label="breadcrumb">
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize={isCompact ? "small" : "small"} />}
        aria-label="breadcrumb navigation"
        sx={{
          "& .MuiBreadcrumbs-separator": {
            fontSize: isCompact ? "0.75rem" : "0.875rem",
          },
        }}
      >
        {breadcrumbs.map((breadcrumb, index) => {
          if (breadcrumb.active) {
            return (
              <Chip
                key={index}
                label={breadcrumb.name}
                size={isCompact ? "small" : "small"}
                color="primary"
                variant="outlined"
                sx={{
                  fontSize: isCompact ? "0.7rem" : "0.75rem",
                  height: isCompact ? 20 : 24,
                  "& .MuiChip-label": {
                    px: isCompact ? 0.75 : 1,
                    fontSize: "inherit",
                  },
                }}
              />
            );
          }

          if (breadcrumb.path === "/dashboard") {
            return (
              <Tooltip key={index} title="Home">
                <RouterBreadcrumbLink to={breadcrumb.path} isCompact={isCompact}>
                  <Box display="flex" alignItems="center">
                    <HomeIcon fontSize={isCompact ? "small" : "small"} sx={{ mr: 0.5, fontSize: isCompact ? "1rem" : "1.25rem" }} />
                    {!isCompact && breadcrumb.name}
                  </Box>
                </RouterBreadcrumbLink>
              </Tooltip>
            );
          }

          return (
            <RouterBreadcrumbLink key={index} to={breadcrumb.path} isCompact={isCompact}>
              {breadcrumb.name}
            </RouterBreadcrumbLink>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default BreadcrumbsNavigation;
