import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  teamId: z.string().optional()
});

export const useProjectsData = () => {
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
        .select(`
          *,
          teams:team_id (
            name
          )
        `)
        .or(`created_by.eq.${user.id}${teamIds.length > 0 ? `,team_id.in.(${teamIds.join(',')})` : ''}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: projectCompanies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ["project-companies", /* projectId here */],
    queryFn: async () => {
      // Logic to fetch project companies
      // ...
    },
    enabled: !!/* projectId here */,
  });

  const { data: availableCompanies } = useQuery({
    queryKey: ["available-companies", /* projectId here */],
    queryFn: async () => {
      // Logic to fetch available companies
      // ...
    },
    enabled: !!/* projectId here */,
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
