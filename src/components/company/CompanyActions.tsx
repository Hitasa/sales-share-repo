import { Button } from "@/components/ui/button";
import { PlusSquare, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Company } from "@/services/types";
import { ProjectActions } from "./ProjectActions";
import { ReviewActions } from "./ReviewActions";
import { TeamShareDialog } from "../team/TeamShareDialog";
import { supabase } from "@/integrations/supabase/client";
import { Team } from "@/types/team";
import { useAddToRepository } from "./mutations/useAddToRepository";
import { useRemoveFromRepository } from "./mutations/useRemoveFromRepository";
import { useLinkToTeam } from "./mutations/useLinkToTeam";

interface TeamResponse {
  team: Team;
}

interface CompanyActionsProps {
  company: Company;
  isPrivate?: boolean;
  isTeamView?: boolean;
  projectId?: string;
}

export const CompanyActions = ({ 
  company, 
  isPrivate = false, 
  isTeamView = false,
  projectId 
}: CompanyActionsProps) => {
  const { user } = useAuth();

  const { data: userTeams = [] } = useQuery({
    queryKey: ["userTeams", user?.id],
    queryFn: async () => {
      const { data: teamMembers, error } = await supabase
        .from("team_members")
        .select("team:teams(id, name)")
        .eq("user_id", user?.id);

      if (error) throw error;
      
      return (teamMembers as unknown as TeamResponse[])
        .map(member => ({
          id: member.team.id,
          name: member.team.name
        }));
    },
    enabled: !!user,
  });

  const addToRepositoryMutation = useAddToRepository(company, user?.id);
  const removeFromRepositoryMutation = useRemoveFromRepository(company, user?.id);
  const linkToTeamMutation = useLinkToTeam();

  const handleTeamSelect = (teamId: string) => {
    linkToTeamMutation.mutate({
      companyId: company.id,
      teamId,
    });
  };

  const isTeamRepository = company.team_id !== null && company.team_id !== undefined;

  return (
    <div className="flex space-x-2">
      {!isPrivate ? (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addToRepositoryMutation.mutate()}
            disabled={addToRepositoryMutation.isPending}
          >
            <PlusSquare className="h-4 w-4 mr-1" />
            {addToRepositoryMutation.isPending ? "Adding..." : "Add"}
          </Button>
          <ReviewActions company={company} isTeamView={isTeamView} />
        </>
      ) : (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => removeFromRepositoryMutation.mutate()}
            disabled={removeFromRepositoryMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {removeFromRepositoryMutation.isPending ? "Removing..." : "Remove"}
          </Button>
          <ProjectActions company={company} projectId={projectId} />
          {!isTeamRepository && <TeamShareDialog teams={userTeams} onTeamSelect={handleTeamSelect} />}
        </>
      )}
      {isTeamRepository && <ProjectActions company={company} projectId={projectId} />}
    </div>
  );
};