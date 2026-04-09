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

// Mock usage data — replace with real GET /usage call in Day 18
const MOCK_USAGE: UsageStats = {
  questionsUsed: 9,
  questionsLimit: 20,
  docsUploaded: 3,
  docsLimit: 5,
  storageUsedMB: 8.4,
  storageLimitMB: 50,
  plan: "FREE",
  month: new Date().toISOString().slice(0, 7),
};

export function useUsage() {
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUsage = async () => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setUsage(MOCK_USAGE);
      } finally {
        setIsLoading(false);
      }
    };
    loadUsage();
  }, []);

  const questionPercentage = usage
    ? Math.round((usage.questionsUsed / usage.questionsLimit) * 100)
    : 0;

  const storagePercentage = usage
    ? Math.round((usage.storageUsedMB / usage.storageLimitMB) * 100)
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
  };
}
