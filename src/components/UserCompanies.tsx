import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUserCompanies } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { CompanyInvite } from "./CompanyInvite";
import { ScrollArea } from "./ui/scroll-area";

export const UserCompanies = () => {
  const { user } = useAuth();

  const { data: companies, isLoading } = useQuery({
    queryKey: ["userCompanies", user?.id],
    queryFn: () => fetchUserCompanies(user?.id || ""),
    enabled: !!user,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const company = companies?.[0];

  if (!company) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>No Company Found</CardTitle>
            <CardDescription>You haven't created or joined any company yet.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{company.name}</CardTitle>
          <CardDescription>{company.industry}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Sales Volume</p>
              <p className="text-2xl font-bold">{company.salesVolume}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Growth</p>
              <p className="text-2xl font-bold">{company.growth}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Team Members</h3>
            <ScrollArea className="h-[200px] rounded-md border p-4">
              {company.invitations?.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{invitation.email}</p>
                    <p className="text-sm text-muted-foreground">Role: {invitation.role}</p>
                  </div>
                  <span className="text-sm px-2 py-1 rounded-full bg-primary/10">
                    {invitation.status}
                  </span>
                </div>
              ))}
            </ScrollArea>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold mb-4">Invite New Member</h3>
            <CompanyInvite 
              companyId={company.id}
              onInviteSuccess={() => {}}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};