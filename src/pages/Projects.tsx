import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ProjectList } from "@/components/projects/ProjectList";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { ProjectCompanies } from "@/components/projects/ProjectCompanies";
import * as z from "zod";

// Move project schema to a separate types file if needed
const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  teamId: z.string().optional()
});

const Projects = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isAddCompanyDialogOpen, setIsAddCompanyDialogOpen] = useState(false);

  // Fetch both user's teams and team memberships
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

  // Updated query to fetch both owned and team projects with correct syntax
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!user?.id) return [];

      // First, get the team IDs for the user
      const { data: teamMembers } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", user.id);

      const teamIds = teamMembers?.map(tm => tm.team_id) || [];

      // Then fetch projects with the team IDs
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
    queryKey: ["project-companies", selectedProject],
    queryFn: async () => {
      if (!selectedProject) return [];
      
      const { data: projectCompanyIds } = await supabase
        .from("project_companies")
        .select("company_id")
        .eq("project_id", selectedProject);

      if (!projectCompanyIds || projectCompanyIds.length === 0) return [];

      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .in("id", projectCompanyIds.map(pc => pc.company_id));

      if (error) throw error;
      return data;
    },
    enabled: !!selectedProject,
  });

  const { data: availableCompanies } = useQuery({
    queryKey: ["available-companies", selectedProject],
    queryFn: async () => {
      if (!selectedProject) return [];

      const { data: projectCompanyIds } = await supabase
        .from("project_companies")
        .select("company_id")
        .eq("project_id", selectedProject);

      const excludedIds = projectCompanyIds?.map(pc => pc.company_id) || [];

      if (excludedIds.length === 0) {
        const { data, error } = await supabase
          .from("companies")
          .select("*");
        
        if (error) throw error;
        return data;
      }

      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .not("id", "in", `(${excludedIds.join(",")})`);

      if (error) throw error;
      return data;
    },
    enabled: !!selectedProject && isAddCompanyDialogOpen,
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
      setSelectedProject(null);
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    },
  });

  const addCompanyToProjectMutation = useMutation({
    mutationFn: async (companyId: string) => {
      if (!selectedProject) return;
      const { error } = await supabase
        .from("project_companies")
        .insert([{ project_id: selectedProject, company_id: companyId }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-companies"] });
      queryClient.invalidateQueries({ queryKey: ["available-companies"] });
      setIsAddCompanyDialogOpen(false);
      toast({
        title: "Success",
        description: "Company added to project successfully",
      });
    },
  });

  const removeCompanyFromProjectMutation = useMutation({
    mutationFn: async (companyId: string) => {
      if (!selectedProject) return;
      const { error } = await supabase
        .from("project_companies")
        .delete()
        .eq("project_id", selectedProject)
        .eq("company_id", companyId);
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

  if (isLoadingProjects) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <CreateProjectDialog 
          onSubmit={createProjectMutation.mutate}
          teams={teams}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <ProjectList
          projects={projects || []}
          selectedProject={selectedProject}
          onProjectSelect={setSelectedProject}
          onProjectDelete={deleteProjectMutation.mutate}
        />

        {selectedProject && (
          <div className="md:col-span-2">
            <ProjectCompanies
              companies={projectCompanies}
              availableCompanies={availableCompanies}
              isLoading={isLoadingCompanies}
              isAddCompanyDialogOpen={isAddCompanyDialogOpen}
              onOpenChange={setIsAddCompanyDialogOpen}
              onAddCompany={(company) => addCompanyToProjectMutation.mutate(company.id)}
              onRemoveCompany={removeCompanyFromProjectMutation.mutate}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;