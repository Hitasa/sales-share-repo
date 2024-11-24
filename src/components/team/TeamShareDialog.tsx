import { Team } from "@/types/team";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Share2 } from "lucide-react";
import { useState } from "react";

interface TeamShareDialogProps {
  teams: Team[];
  onTeamSelect: (teamId: string, teamName: string, onSuccess: () => void) => void;
}

export const TeamShareDialog = ({ teams, onTeamSelect }: TeamShareDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <Share2 className="h-4 w-4 mr-1" />
          Share with Team
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share with Team</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {teams.map((team) => (
            <Button
              key={team.id}
              variant="outline"
              className="w-full justify-start"
              onClick={() => onTeamSelect(team.id, team.name, () => setOpen(false))}
            >
              {team.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};