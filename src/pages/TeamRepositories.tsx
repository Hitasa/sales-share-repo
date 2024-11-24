import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { CompanyList } from "@/components/company/CompanyList";
import { supabase } from "@/integrations/supabase/client";

const TeamRepositories = () => {
  const { user } = useAuth();

  const { data: teamCompanies = [], isLoading } = useQuery({
    queryKey: ["teamCompanies", user?.id],
    queryFn: async () => {
      // First get the teams the user is a member of
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user?.id);

      if (!teamMembers?.length) return [];

      const teamIds = teamMembers.map(tm => tm.team_id);

      // Then get the companies shared with these teams
      const { data: companies } = await supabase
        .from('companies')
        .select('*')
        .in('team_id', teamIds);

      return companies || [];
    },
    enabled: !!user,
  });

  if (isLoading) {
    return <div className="container mx-auto py-20 px-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-20 px-4 animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Team Repository</h1>
      </div>
      <CompanyList companies={teamCompanies} />
    </div>
  );
};

export default TeamRepositories;