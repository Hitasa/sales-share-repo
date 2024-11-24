import { Button } from "@/components/ui/button";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TeamSectionProps {
  selectedTeam: Team | null;
}

export const TeamSection = ({ selectedTeam }: TeamSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
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

      // Invalidate teams query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      
      // Reset selected team
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

  const handleCreateTeam = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to create a team",
      });
      return;
    }

    if (!newTeamName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a team name",
      });
      return;
    }

    try {
      // First check if user is already a member of a team with this name
      const { data: existingTeam } = await supabase
        .from("teams")
        .select("id")
        .eq("name", newTeamName)
        .single();

      if (existingTeam) {
        const { data: existingMembership } = await supabase
          .from("team_members")
          .select("id")
          .eq("team_id", existingTeam.id)
          .eq("user_id", user.id)
          .single();

        if (existingMembership) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "You are already a member of a team with this name",
          });
          return;
        }
      }

      const { data: team, error: teamError } = await supabase
        .from("teams")
        .insert([{ name: newTeamName }])
        .select()
        .single();

      if (teamError) throw teamError;

      toast({
        title: "Success",
        description: "Team created successfully",
      });

      setIsCreatingTeam(false);
      setNewTeamName("");
    } catch (error: any) {
      console.error("Error creating team:", error);
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
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Your role: {userRole || "member"}
          </div>
          {isAdmin && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Team</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the
                    team and remove all team members.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteTeam}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

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