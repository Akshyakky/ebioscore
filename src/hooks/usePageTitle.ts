import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import routeConfig from "@/routes/routeConfig";

export const usePageTitle = () => {
  const [pageTitle, setPageTitle] = useState("eBios - Healthcare Solution");
  const location = useLocation();

  useEffect(() => {
    const route = routeConfig.find((route) => route.path.toLowerCase() === location.pathname.toLowerCase());
    const titleSuffix = route?.metadata?.title || "eBios Healthcare Solution";
    const title = `eBios - ${titleSuffix}`;
    document.title = title;
    setPageTitle(titleSuffix);
  }, [location.pathname]);

  return { pageTitle };
};
