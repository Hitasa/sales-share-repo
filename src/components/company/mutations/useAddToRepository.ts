import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/services/types";

export const useAddToRepository = (company: Company, userId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!userId || !company) {
        throw new Error("Missing required information");
      }

      const { data: existingEntry } = await supabase
        .from("company_repositories")
        .select("id")
        .eq("company_id", company.id)
        .eq("user_id", userId)
        .maybeSingle();

      if (existingEntry) {
        throw new Error("Company is already in your repository");
      }

      const { data: existingCompany, error: checkError } = await supabase
        .from("companies")
        .select("id")
        .eq("id", company.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (!existingCompany) {
        const { error: insertError } = await supabase
          .from("companies")
          .insert([{
            id: company.id,
            name: company.name,
            industry: company.industry,
            sales_volume: company.salesVolume,
            growth: company.growth,
            website: company.website,
            phone_number: company.phoneNumber,
            email: company.email,
            created_by: userId
          }]);

        if (insertError) throw insertError;
      }

      const { error: repoError } = await supabase
        .from("company_repositories")
        .insert([{
          company_id: company.id,
          user_id: userId
        }]);

      if (repoError) throw repoError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userCompanyRepository"] });
      queryClient.invalidateQueries({ queryKey: ["userCompanyRepository", userId] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({
        title: "Success",
        description: `${company.name} added to your repository`,
      });
    },
    onError: (error) => {
      console.error("Error adding to repository:", error);
      toast({
        variant: error instanceof Error && error.message === "Company is already in your repository" 
          ? "default" 
          : "destructive",
        title: error instanceof Error && error.message === "Company is already in your repository" 
          ? "Information"
          : "Error",
        description: error instanceof Error ? error.message : "Failed to add company to repository",
      });
    },
  });
};