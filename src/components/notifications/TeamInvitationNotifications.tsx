import { useState } from "react";
import { Bell, BellDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const TeamInvitationNotifications = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invitations = [] } = useQuery({
    queryKey: ["team-invitations", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];

      const { data, error } = await supabase
        .from("team_invitations")
        .select("*, teams(name)")
        .eq("email", user.email)
        .eq("status", "pending");

      if (error) throw error;
      return data;
    },
    enabled: !!user?.email,
  });

  const handleInvitationResponse = async (invitationId: string, accept: boolean) => {
    try {
      // First update the invitation status
      const { error: updateError } = await supabase
        .from("team_invitations")
        .update({ status: accept ? "accepted" : "declined" })
        .eq("id", invitationId);

      if (updateError) throw updateError;

      if (accept) {
        // Get the invitation details to create team member entry
        const { data: invitation } = await supabase
          .from("team_invitations")
          .select("team_id, role")
          .eq("id", invitationId)
          .single();

        if (invitation) {
          // Create team member entry
          const { error: memberError } = await supabase
            .from("team_members")
            .insert({
              team_id: invitation.team_id,
              user_id: user?.id,
              role: invitation.role,
            });

          if (memberError) throw memberError;
        }
      }

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["team-invitations"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });

      toast({
        title: "Success",
        description: accept
          ? "You have joined the team successfully"
          : "Invitation declined successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process invitation",
      });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {invitations.length > 0 ? (
            <BellDot className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <h4 className="font-medium leading-none">Team Invitations</h4>
          {invitations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending invitations</p>
          ) : (
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex flex-col gap-2 border-b pb-2 last:border-0"
                >
                  <p className="text-sm">
                    You have been invited to join{" "}
                    <span className="font-medium">
                      {(invitation.teams as any)?.name}
                    </span>{" "}
                    as a {invitation.role}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleInvitationResponse(invitation.id, true)}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleInvitationResponse(invitation.id, false)}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};