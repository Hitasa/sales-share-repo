import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Team } from "@/services/types";
import { TeamMembersList } from "./TeamMembersList";
import { TeamInvite } from "./TeamInvite";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TeamSectionProps {
  selectedTeam: Team | null;
}

export const TeamSection = ({ selectedTeam }: TeamSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");

  const { data: userRole } = useQuery({
    queryKey: ["team-role", selectedTeam?.id, user?.id],
    queryFn: async () => {
      if (!selectedTeam || !user) return null;

      const { data, error } = await supabase
        .from("team_members")
        .select("role")
        .eq("team_id", selectedTeam.id)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data.role;
    },
    enabled: !!selectedTeam && !!user,
  });

  const isAdmin = userRole === "admin";

  const handleCreateTeam = async () => {
    if (!newTeamName.trim() || !user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a team name and ensure you're logged in",
      });
      return;
    }

    try {
      // First create the team
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .insert([{ name: newTeamName }])
        .select()
        .single();

      if (teamError) throw teamError;

      // The team member entry will be created automatically by the database trigger
      
      toast({
        title: "Success",
        description: "Team created successfully",
      });

      setIsCreatingTeam(false);
      setNewTeamName("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create team",
      });
    }
  };

  if (!selectedTeam) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Teams</h2>
        <p>Select a team or create a new one to get started.</p>
        {isCreatingTeam ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Team name"
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button onClick={handleCreateTeam}>Create Team</Button>
            <Button variant="ghost" onClick={() => setIsCreatingTeam(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button onClick={() => setIsCreatingTeam(true)}>Create New Team</Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{selectedTeam.name}</h2>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {isAdmin && (
            <TeamInvite
              teamId={selectedTeam.id}
              onInviteSuccess={() => {
                // Refetch team members
              }}
            />
          )}

          <TeamMembersList teamId={selectedTeam.id} isAdmin={isAdmin} />
        </div>
      </Card>
    </div>
  );
};