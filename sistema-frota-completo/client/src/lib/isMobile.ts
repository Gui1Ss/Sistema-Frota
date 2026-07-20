import { useState, useEffect } from "react";

export const isMobile = () => {
  if (typeof window === "undefined") return false; // Evita erro durante a renderização no servidor (SSR)
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isDeviceMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      );
    setIsMobile(isDeviceMobile);
  }, []);

  return isMobile;
}
