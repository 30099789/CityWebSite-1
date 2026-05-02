// useSettings.js — Sprint 3 Week 10
// Loads app-wide settings from public/xml/settings.xml on mount
// Assessment requirement: App-wide settings stored in XML, read on page load

import { useEffect, useState } from "react";
import { getSettings } from "../services/xmlService";

const DEFAULT_SETTINGS = {
  site: {
    name:         "CityLink Initiatives",
    tagline:      "Smart Community Portal",
    description:  "Connecting our community with accessible digital services.",
    logo:         "CL",
    contactEmail: "info@citylink.gov",
    contactPhone: "(08) 9000 0000",
    address:      "123 Council Street, Perth WA 6000",
  },
  footer: {
    acknowledgement: "CityLink Initiatives acknowledges the Traditional Custodians of the land on which we operate and pays respect to Elders past and present.",
    copyright:       "CityLink Initiatives. All rights reserved. WCAG 2.1 AA Compliant.",
  },
  features: {
    bookingsEnabled:    true,
    feedbackEnabled:    true,
    chatbotEnabled:     false,
    maintenanceMode:    false,
    maintenanceMessage: "",
  },
  banner: {
    active:  false,
    message: "",
    type:    "info",
  },
};

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getSettings()
      .then((data) => {
        if (data) setSettings(data);
      })
      .finally(() => setLoading(false));
  }, []);

  return { settings, loading };
}