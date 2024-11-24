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
          created_at
        `)
        .in('team_id', teamIds);

      // Transform the data to match the Company type
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
        sharedWith: [], // This field isn't stored in the database
        reviews: [], // This field isn't stored in the database yet
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
      <CompanyList companies={teamCompanies} />
    </div>
  );
};

export default TeamRepositories;