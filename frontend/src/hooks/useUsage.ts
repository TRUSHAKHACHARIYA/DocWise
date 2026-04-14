import { useState, useEffect } from "react";

interface UsageStats {
  questionsUsed: number;
  questionsLimit: number;
  docsUploaded: number;
  docsLimit: number;
  storageUsedMB: number;
  storageLimitMB: number;
  plan: "FREE" | "STARTER" | "PRO" | "ENTERPRISE";
  month: string;
}


import api from "@/lib/api";

export function useUsage() {
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadUsage = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/user/me");
      setUsage(response.data.usage);
    } catch (err) {
      console.error("Failed to load usage", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsage();
  }, []);

  const questionPercentage = usage && usage.questionsLimit > 0
    ? Math.min(100, Math.round((usage.questionsUsed / usage.questionsLimit) * 100))
    : 0;

  const storagePercentage = usage && usage.storageLimitMB > 0
    ? Math.min(100, Math.round((usage.storageUsedMB / usage.storageLimitMB) * 100))
    : 0;

  const isNearLimit = questionPercentage >= 80;
  const isAtLimit = questionPercentage >= 100;

  return {
    usage,
    isLoading,
    questionPercentage,
    storagePercentage,
    isNearLimit,
    isAtLimit,
    loadUsage
  };
}
