import { useState } from "react";
import api from "@/lib/api";
import { toast } from "@/store/toastStore";

export function useBilling() {
  const [isLoading, setIsLoading] = useState(false);

  const createCheckoutSession = async (priceId: string) => {
    setIsLoading(true);
    try {
      const response = await api.post("/billing/create-checkout", { priceId });
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      toast.error("Error", "Failed to start checkout process.");
    } finally {
      setIsLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    setIsLoading(true);
    try {
      const response = await api.post("/billing/portal");
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      toast.error("Error", "Failed to open billing settings.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCheckoutSession,
    openCustomerPortal,
    isLoading,
  };
}
