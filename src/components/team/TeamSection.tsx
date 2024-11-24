import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Team } from "@/services/types";
import { TeamMembersList } from "./TeamMembersList";
import { TeamInvite } from "./TeamInvite";
import { Card } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CreateTeamForm } from "./CreateTeamForm";
import { TeamHeader } from "./TeamHeader";

interface TeamSectionProps {
  selectedTeam: Team | null;
}

export const TeamSection = ({ selectedTeam }: TeamSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

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

  const handleDeleteTeam = async () => {
    if (!selectedTeam) return;

    try {
      const { error } = await supabase
        .from("teams")
        .delete()
        .eq("id", selectedTeam.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["teams"] });
      window.location.reload();
    } catch (error: any) {
      console.error("Error deleting team:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete team",
      });
    }
  };

  if (!selectedTeam) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Teams</h2>
        <p>Select a team or create a new one to get started.</p>
        {isCreatingTeam ? (
          <CreateTeamForm onCancel={() => setIsCreatingTeam(false)} />
        ) : (
          <Button onClick={() => setIsCreatingTeam(true)}>Create New Team</Button>
        )}
      </div>
    );
  }

  const isAdmin = userRole === "admin";

  return (
    <div className="space-y-6">
      <TeamHeader
        selectedTeam={selectedTeam}
        userRole={userRole}
        onDeleteTeam={handleDeleteTeam}
      />

      <Card className="p-6">
        <div className="space-y-6">
          {isAdmin && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-4">Team Management</h3>
                <TeamInvite
                  teamId={selectedTeam.id}
                  onInviteSuccess={() => {
                    toast({
                      title: "Success",
                      description: "Invitation sent successfully",
                    });
                  }}
                />
              </div>
              <Separator className="my-6" />
            </>
          )}

          <TeamMembersList teamId={selectedTeam.id} isAdmin={isAdmin} />
        </div>
      </Card>
    </div>
  );
};