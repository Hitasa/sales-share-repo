import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Share2 } from "lucide-react";
import { TeamShareDialog } from "@/components/team/TeamShareDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Project {
  id: string;
  name: string;
}

interface ProjectListProps {
  projects: Project[];
  selectedProject: string | null;
  onProjectSelect: (projectId: string) => void;
  onProjectDelete: (projectId: string) => void;
}

export const ProjectList = ({ 
  projects, 
  selectedProject, 
  onProjectSelect, 
  onProjectDelete 
}: ProjectListProps) => {
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

  const handleTeamShare = async (projectId: string, teamId: string) => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({ team_id: teamId })
        .eq("id", projectId);

      if (error) throw error;
    } catch (error) {
      console.error("Error sharing project:", error);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Project List</h2>
      {projects?.map((project) => (
        <Card
          key={project.id}
          className={`p-4 cursor-pointer hover:bg-accent transition-colors ${
            selectedProject === project.id ? "bg-accent" : ""
          }`}
          onClick={() => onProjectSelect(project.id)}
        >
          <div className="flex justify-between items-center">
            <span>{project.name}</span>
            <div className="flex gap-2">
              {teams && teams.length > 0 && (
                <TeamShareDialog
                  teams={teams}
                  onTeamSelect={(teamId) => handleTeamShare(project.id, teamId)}
                />
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onProjectDelete(project.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};