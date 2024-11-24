import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { CompanyList } from "@/components/company/CompanyList";
import { fetchUserCompanyRepository } from "@/services/api";
import { useState } from "react";
import { Company } from "@/services/types";
import { CompanyProfile } from "@/components/company/CompanyProfile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Team } from "@/types/team";
import { RepositoryHeader } from "@/components/repositories/RepositoryHeader";
import { TeamShareButton } from "@/components/repositories/TeamShareButton";

interface TeamResponse {
  team: Team;
}

const MyRepositories = () => {
  const { user } = useAuth();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["userCompanyRepository", user?.id],
    queryFn: () => fetchUserCompanyRepository(user?.id || ""),
    enabled: !!user,
  });

  const { data: userTeams = [] } = useQuery<Team[]>({
    queryKey: ["userTeams", user?.id],
    queryFn: async () => {
      const { data: teamMembers, error } = await supabase
        .from("team_members")
        .select("team:teams(id, name)")
        .eq("user_id", user?.id);

      if (error) throw error;
      
      return (teamMembers as unknown as TeamResponse[])
        .map(member => ({
          id: member.team.id,
          name: member.team.name
        }));
    },
    enabled: !!user,
  });

  const linkToTeamMutation = useMutation({
    mutationFn: async ({ companyId, teamId }: { companyId: string; teamId: string }) => {
      const { error } = await supabase
        .from("companies")
        .update({ team_id: teamId })
        .eq("id", companyId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userCompanyRepository"] });
      toast({
        title: "Success",
        description: "Company linked to team successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to link company to team",
      });
    },
  });

  if (isLoading) {
    return <div className="container mx-auto py-20 px-4">Loading...</div>;
  }

  if (selectedCompany) {
    return (
      <div className="container mx-auto py-20 px-4">
        <CompanyProfile 
          company={selectedCompany} 
          onBack={() => setSelectedCompany(null)} 
        />
      </div>
    );
  }

  const handleTeamSelect = (company: Company) => (teamId: string) => {
    linkToTeamMutation.mutate({
      companyId: company.id,
      teamId,
    });
  };

  const renderActions = (company: Company) => (
    <TeamShareButton
      teams={userTeams}
      onTeamSelect={handleTeamSelect(company)}
    />
  );

  return (
    <div className="container mx-auto py-20 px-4 animate-fadeIn">
      <RepositoryHeader />
      <CompanyList 
        companies={companies} 
        isPrivate={false} 
        onCompanySelect={setSelectedCompany}
        additionalActions={renderActions}
      />
    </div>
  );
};

export default MyRepositories;