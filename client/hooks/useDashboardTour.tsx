"use client";

import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import "../styles/driver-tour.css";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function useDashboardTour() {
  const pathname = usePathname();
  const storageKey = "linky_tour_shown_v1";

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      onDestroyed: () => {
        localStorage.setItem(storageKey, "true");
      },
      steps: [
        {
          element: "#total-links",
          popover: {
            title: "Total Links",
            description: "See how many URLs you have shortened.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#total-clicks",
          popover: {
            title: "Total Clicks",
            description: "Track the number of clicks across all your links.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#active-today",
          popover: {
            title: "Active Today",
            description: "See how many links were clicked today.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#engagement",
          popover: {
            title: "Engagement",
            description:
              "Check the average clicks per link to measure activity.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#shorten-url",
          popover: {
            title: "Shorten New URL",
            description: "Paste your long link here to create a short one.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#your-urls",
          popover: {
            title: "Your Shortened URLs",
            description: "Manage, edit, or delete your links here.",
            side: "top",
            align: "center",
          },
        },
      ],
    });

    // slight delay for smoothness (lets page paint)
    setTimeout(() => {
      driverObj.drive();
    }, 300);
  };

  useEffect(() => {
    const hasTurned = localStorage.getItem(storageKey);
    if (hasTurned === "true") return;

    // Only run on the main dashboard route (optional guard)
    if (!pathname?.includes("/dashboard")) return;

    const isMobile =
      typeof window !== "undefined" &&
      /Mobi|Android/i.test(navigator.userAgent);

    if (isMobile) return;

    setTimeout(() => {
      startTour();
    }, 1000);
  }, []);

  return { startTour };
}
