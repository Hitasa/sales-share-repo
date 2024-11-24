import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyInvite } from "@/components/CompanyInvite";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchTeamMembers } from "@/services/api";

export const TeamSection = () => {
  const { user } = useAuth();
  const [showInvite, setShowInvite] = useState(false);

  const { data: teamMembers = [], refetch } = useQuery({
    queryKey: ["teamMembers", user?.id],
    queryFn: () => fetchTeamMembers(user?.id || ""),
    enabled: !!user,
  });

  const handleInviteSuccess = () => {
    setShowInvite(false);
    refetch();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Team</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>{member.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <CompanyInvite
          companyId={0} // We're using 0 as a placeholder since we're inviting to team not company
          onInviteSuccess={handleInviteSuccess}
        />
      </CardContent>
    </Card>
  );
};