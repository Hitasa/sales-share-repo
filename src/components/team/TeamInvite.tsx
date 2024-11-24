import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

interface TeamInviteProps {
  teamId: string;
  onInviteSuccess: () => void;
}

export const TeamInvite = ({ teamId, onInviteSuccess }: TeamInviteProps) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async () => {
    if (!email) return;

    try {
      setIsLoading(true);

      // First check if the user exists in profiles
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email);

      // Generate a unique token for the invitation
      const token = crypto.randomUUID();

      // Create the invitation
      const { error: inviteError } = await supabase
        .from("team_invitations")
        .insert([
          {
            team_id: teamId,
            email,
            role,
            token,
          },
        ]);

      if (inviteError) throw inviteError;

      toast({
        title: "Success",
        description: profiles && profiles.length > 0 
          ? `Invitation sent to existing user ${email}`
          : `Invitation sent to new user ${email}`,
      });
      
      setEmail("");
      onInviteSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to invite team member",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Invite Team Member</h3>
      <div className="flex gap-2">
        <Input
          placeholder="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Select value={role} onValueChange={(value: "admin" | "member") => setRole(value)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleInvite} disabled={isLoading}>
          <Mail className="h-4 w-4 mr-2" />
          Invite
        </Button>
      </div>
    </div>
  );
};