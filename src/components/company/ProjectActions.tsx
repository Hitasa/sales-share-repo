import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusSquare, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Company } from "@/services/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ProjectActionsProps {
  company: Company;
  projectId?: string;
}

export const ProjectActions = ({ company, projectId }: ProjectActionsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: projects } = useQuery({
    queryKey: ["user-projects", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get team IDs where the user is a member
      const { data: teamMembers } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", user.id);

      const teamIds = teamMembers?.map(tm => tm.team_id) || [];

      // Fetch both user-created projects and team projects
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .or(`created_by.eq.${user.id}${teamIds.length > 0 ? `,team_id.in.(${teamIds.join(',')})` : ''}`);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addToProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      if (!user?.id || !company.id) {
        throw new Error("Missing required information");
      }

      // First get team IDs where the user is a member
      const { data: teamMembers } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", user.id);

      const teamIds = teamMembers?.map(tm => tm.team_id) || [];

      // Then verify project ownership
      const { data: project } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .or(`created_by.eq.${user.id}${teamIds.length > 0 ? `,team_id.in.(${teamIds.join(',')})` : ''}`)
        .single();

      if (!project) {
        throw new Error("You don't have permission to add companies to this project");
      }

      // Now insert the project company with the verified project ID
      const { error } = await supabase
        .from("project_companies")
        .insert([{ 
          project_id: projectId, 
          company_id: company.id,
        }])
        .select()
        .single();
      
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
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add company to project",
      });
    },
  });

  const removeFromProjectMutation = useMutation({
    mutationFn: async () => {
      if (!projectId || !company.id) {
        throw new Error("Missing required information");
      }

      // First get team IDs where the user is a member
      const { data: teamMembers } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", user.id);

      const teamIds = teamMembers?.map(tm => tm.team_id) || [];

      // Then verify project ownership
      const { data: project } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .or(`created_by.eq.${user.id}${teamIds.length > 0 ? `,team_id.in.(${teamIds.join(',')})` : ''}`)
        .single();

      if (!project) {
        throw new Error("You don't have permission to remove companies from this project");
      }

      const { error } = await supabase
        .from("project_companies")
        .delete()
        .eq("project_id", projectId)
        .eq("company_id", company.id)
        .select()
        .single();
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-companies"] });
      toast({
        title: "Success",
        description: "Company removed from project successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove company from project",
      });
    },
  });

  if (projectId) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => removeFromProjectMutation.mutate()}
        disabled={removeFromProjectMutation.isPending}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        {removeFromProjectMutation.isPending ? "Removing..." : "Remove from Project"}
      </Button>
    );
  }

  return projects && projects.length > 0 ? (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusSquare className="h-4 w-4 mr-1" />
          Add to Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {projects.map((project) => (
            <Button
              key={project.id}
              variant="outline"
              className="w-full justify-start"
              onClick={() => addToProjectMutation.mutate(project.id)}
            >
              {project.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  ) : null;
};