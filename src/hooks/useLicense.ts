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
        .select("*")
        .single();

      if (error) throw error;

      return {
        ...data,
        features: data.features as string[],
        startsAt: new Date(data.starts_at),
        expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
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