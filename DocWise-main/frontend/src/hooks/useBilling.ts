import { useState } from "react";
import api from "@/lib/api";
import { toast } from "@/store/toastStore";

export function useBilling() {
  const [isLoading, setIsLoading] = useState(false);

  const createCheckoutSession = async (payload: {
    planId: "STARTER" | "PRO";
    paymentToken: string;
    firstName: string;
    lastName: string;
    email: string;
  }) => {
    setIsLoading(true);
    try {
      const response = await api.post("/billing/create-checkout", payload);
      if (!response.data?.success) {
        throw new Error(response.data?.error || "Unable to activate plan.");
      }
      toast.success("Plan updated", "Your subscription is now active.");
      if (typeof window !== "undefined") {
        window.location.href = "/dashboard?billing_success=true";
      }
    } catch (err) {
      toast.error("Error", "Failed to process payment. Please try again.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    setIsLoading(true);
    try {
      const response = await api.post("/billing/portal");
      if (!response.data?.success) {
        throw new Error(response.data?.error || "Unable to update subscription.");
      }
      toast.success("Subscription cancelled", "Your plan will not renew.");
      if (typeof window !== "undefined") {
        window.location.href = "/dashboard/billing";
      }
    } catch (err) {
      toast.error("Error", "Failed to update subscription.");
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
