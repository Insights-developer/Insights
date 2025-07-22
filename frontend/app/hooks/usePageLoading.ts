import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// For Next.js App Router, use router.isNavigating if available, else fallback to window events
export function usePageLoading() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If router.isNavigating is available (Next.js 13.4+), use it
    if (typeof router === 'object' && 'isNavigating' in router) {
      // @ts-ignore
      setLoading(!!router.isNavigating);
      // @ts-ignore
      const interval = setInterval(() => setLoading(!!router.isNavigating), 50);
      return () => clearInterval(interval);
    }
    // Fallback: listen to window events (for older Next.js or custom events)
    let timeout: NodeJS.Timeout;
    const handleStart = () => {
      timeout = setTimeout(() => setLoading(true), 100);
    };
    const handleStop = () => {
      clearTimeout(timeout);
      setLoading(false);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("next:route-change-start", handleStart);
      window.addEventListener("next:route-change-complete", handleStop);
      window.addEventListener("next:route-change-error", handleStop);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("next:route-change-start", handleStart);
        window.removeEventListener("next:route-change-complete", handleStop);
        window.removeEventListener("next:route-change-error", handleStop);
      }
    };
  }, [router]);

  return loading;
}
