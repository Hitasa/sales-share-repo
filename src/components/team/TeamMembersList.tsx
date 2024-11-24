import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TeamMember {
  id: string;
  user: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
  role: string;
}

interface TeamMembersListProps {
  teamId: string;
  isAdmin: boolean;
}

export const TeamMembersList = ({ teamId, isAdmin }: TeamMembersListProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { data: members = [], refetch } = useQuery({
    queryKey: ["team-members", teamId],
    queryFn: async () => {
      const { data: teamMembers, error } = await supabase
        .from("team_members")
        .select(`
          id,
          role,
          user:profiles (
            id,
            email,
            first_name,
            last_name
          )
        `)
        .eq("team_id", teamId);

      if (error) throw error;

      return (teamMembers || []).map((member: any) => ({
        id: member.id,
        role: member.role,
        user: member.user
      })) as TeamMember[];
    },
    enabled: !!teamId,
  });

  const handleRemoveMember = async (memberId: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team member removed successfully",
      });
      refetch();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove team member",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Team Members</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            {isAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {getInitials(member.user.first_name, member.user.last_name)}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>
                {member.user.first_name || member.user.last_name
                  ? `${member.user.first_name || ""} ${member.user.last_name || ""}`
                  : "N/A"}
              </TableCell>
              <TableCell>{member.user.email}</TableCell>
              <TableCell className="capitalize">{member.role}</TableCell>
              {isAdmin && (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};