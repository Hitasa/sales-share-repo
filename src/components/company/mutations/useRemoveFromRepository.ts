import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/services/types";

export const useRemoveFromRepository = (company: Company, userId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!userId || !company.id) {
        throw new Error("Missing required information");
      }
      const { error } = await supabase
        .from("company_repositories")
        .delete()
        .eq("company_id", company.id)
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userCompanyRepository"] });
      queryClient.invalidateQueries({ queryKey: ["userCompanyRepository", userId] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({
        title: "Success",
        description: `${company.name} removed from your repository`,
      });
    },
    onError: (error) => {
      console.error("Error removing from repository:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove company from repository",
      });
    },
  });
};