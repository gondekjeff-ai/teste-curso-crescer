import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { api } from "@/lib/api";

/**
 * Resets scroll on route change AND records a page view on the backend
 * so admin analytics get populated.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
    // Fire-and-forget page view tracking
    api.post("/page-views", { page_path: pathname }).catch(() => {});
  }, [pathname]);

  return null;
};

export default ScrollToTop;