import { Team } from "@/types/team";
import { Company } from "@/services/types";
import { TeamShareDialog } from "@/components/team/TeamShareDialog";

interface TeamShareButtonProps {
  teams: Team[];
  onTeamSelect: (teamId: string) => void;
}

export const TeamShareButton = ({ teams, onTeamSelect }: TeamShareButtonProps) => {
  return (
    <TeamShareDialog 
      teams={teams} 
      onTeamSelect={onTeamSelect}
    />
  );
};