import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { CompanyList } from "@/components/company/CompanyList";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/services/types";

const TeamRepositories = () => {
  const { user } = useAuth();

  const { data: teamCompanies = [], isLoading } = useQuery({
    queryKey: ["teamCompanies", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // First get the teams the user is a member of
      const { data: teamMembers, error: teamError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id);

      if (teamError) throw teamError;
      if (!teamMembers?.length) return [];

      const teamIds = teamMembers.map(tm => tm.team_id);

      // Then get all companies shared with these teams
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select(`
          id,
          name,
          industry,
          sales_volume,
          growth,
          website,
          phone_number,
          email,
          review,
          notes,
          created_by,
          team_id,
          created_at,
          reviews,
          team_reviews
        `)
        .in('team_id', teamIds);

      if (companiesError) throw companiesError;

      return (companies || []).map(company => ({
        id: company.id,
        name: company.name,
        industry: company.industry || undefined,
        salesVolume: company.sales_volume || undefined,
        growth: company.growth || undefined,
        website: company.website || undefined,
        phoneNumber: company.phone_number || undefined,
        email: company.email || undefined,
        review: company.review || undefined,
        notes: company.notes || undefined,
        createdBy: company.created_by || "",
        team_id: company.team_id,
        sharedWith: [],
        reviews: company.reviews || [],
        team_reviews: company.team_reviews || [],
      })) as Company[];
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
      <CompanyList companies={teamCompanies} isTeamView={true} />
    </div>
  );
};

export default TeamRepositories;