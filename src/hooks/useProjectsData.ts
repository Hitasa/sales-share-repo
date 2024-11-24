import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { Company } from "@/services/types";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  teamId: z.string().optional()
});

export const useProjectsData = (projectId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: teams } = useQuery({
    queryKey: ["user-teams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: teamMembers } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", user.id);

      const teamIds = teamMembers?.map(tm => tm.team_id) || [];

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .or(`created_by.eq.${user.id}${teamIds.length > 0 ? `,team_id.in.(${teamIds.join(',')})` : ''}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: projectCompanies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ["project-companies", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from("project_companies")
        .select(`
          companies (
            id,
            name,
            industry,
            website,
            created_at,
            created_by,
            reviews,
            sales_volume,
            growth,
            phone_number,
            email,
            review,
            notes,
            team_id
          )
        `)
        .eq("project_id", projectId);

      if (error) throw error;

      return data?.map(item => ({
        id: item.companies.id,
        name: item.companies.name,
        industry: item.companies.industry || undefined,
        salesVolume: item.companies.sales_volume || undefined,
        growth: item.companies.growth || undefined,
        website: item.companies.website || undefined,
        phoneNumber: item.companies.phone_number || undefined,
        email: item.companies.email || undefined,
        review: item.companies.review || undefined,
        notes: item.companies.notes || undefined,
        createdBy: item.companies.created_by || "",
        team_id: item.companies.team_id,
        sharedWith: [],
        reviews: item.companies.reviews || [],
      })) as Company[] || [];
    },
    enabled: !!projectId,
  });

  const { data: availableCompanies } = useQuery({
    queryKey: ["available-companies", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data: existingCompanies } = await supabase
        .from("project_companies")
        .select("company_id")
        .eq("project_id", projectId);
      
      const existingIds = existingCompanies?.map(c => c.company_id) || [];
      
      const query = supabase
        .from("companies")
        .select("*");

      if (existingIds.length > 0) {
        query.not('id', 'in', `(${existingIds.join(',')})`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      return (data || []).map(company => ({
        id: company.id,
        name: company.name,
        industry: company.industry || undefined,
        salesVolume: company.sales_volume || undefined,
        growth: company.growth || undefined,
        website: company.website || undefined,
        phoneNumber: company.phone_number || undefined,
        email: company.email || undefined,
        review: company.review || undefined,
        notes: company.notes || undefined,
        createdBy: company.created_by || "",
        team_id: company.team_id,
        sharedWith: [],
        reviews: company.reviews || [],
      })) as Company[];
    },
    enabled: !!projectId,
  });

  const createProjectMutation = useMutation({
    mutationFn: async (values: z.infer<typeof projectSchema>) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("projects")
        .insert([{ 
          name: values.name, 
          created_by: user.id,
          team_id: values.teamId || null 
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    },
  });

  const addCompanyToProjectMutation = useMutation({
    mutationFn: async (company: any) => {
      const { error } = await supabase
        .from("project_companies")
        .insert([{ project_id: company.projectId, company_id: company.id }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-companies"] });
      queryClient.invalidateQueries({ queryKey: ["available-companies"] });
      toast({
        title: "Success",
        description: "Company added to project successfully",
      });
    },
  });

  const removeCompanyFromProjectMutation = useMutation({
    mutationFn: async (params: { projectId: string; companyId: string }) => {
      const { error } = await supabase
        .from("project_companies")
        .delete()
        .eq("project_id", params.projectId)
        .eq("company_id", params.companyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-companies"] });
      queryClient.invalidateQueries({ queryKey: ["available-companies"] });
      toast({
        title: "Success",
        description: "Company removed from project successfully",
      });
    },
  });

  return {
    teams,
    projects,
    isLoadingProjects,
    projectCompanies,
    availableCompanies,
    isLoadingCompanies,
    createProject: createProjectMutation.mutate,
    deleteProject: deleteProjectMutation.mutate,
    addCompanyToProject: addCompanyToProjectMutation.mutate,
    removeCompanyFromProject: removeCompanyFromProjectMutation.mutate,
  };
};
