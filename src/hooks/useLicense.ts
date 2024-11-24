import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserLicense, FEATURE_NAMES } from "@/types/license";
import { useToast } from "@/hooks/use-toast";

export function useLicense() {
  const { toast } = useToast();

  const { data: license, isLoading } = useQuery({
    queryKey: ["user-license"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_licenses")
        .select("*");

      if (error) throw error;

      // If no license exists, return a default free license
      if (!data || data.length === 0) {
        return {
          licenseType: "free",
          features: ["view_companies", "create_company", "basic_analytics"],
          isActive: true,
          startsAt: new Date(),
        } as UserLicense;
      }

      const userLicense = data[0]; // Get the first license
      return {
        ...userLicense,
        features: userLicense.features as string[],
        startsAt: new Date(userLicense.starts_at),
        expiresAt: userLicense.expires_at ? new Date(userLicense.expires_at) : undefined,
      } as UserLicense;
    },
  });

  const checkFeatureAccess = (featureName: keyof typeof FEATURE_NAMES) => {
    if (!license) return false;
    
    const hasFeature = license.features.includes(FEATURE_NAMES[featureName]);
    const isActive = license.isActive;
    const notExpired = !license.expiresAt || license.expiresAt > new Date();
    
    const hasAccess = hasFeature && isActive && notExpired;
    
    if (!hasAccess) {
      toast({
        title: "Feature not available",
        description: "Please upgrade your license to access this feature.",
        variant: "destructive",
      });
    }
    
    return hasAccess;
  };

  return {
    license,
    isLoading,
    checkFeatureAccess,
  };
}