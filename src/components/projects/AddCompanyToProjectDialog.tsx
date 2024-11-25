import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CompanyList } from "@/components/company/CompanyList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/services/types";
import { useAuth } from "@/contexts/AuthContext";

interface AddCompanyToProjectDialogProps {
  projectId: string;
  teamId?: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCompany: (company: Company) => void;
}

interface CompanyData {
  id: string;
  name: string;
  industry: string | null;
  sales_volume: string | null;
  growth: string | null;
  website: string | null;
  phone_number: string | null;
  email: string | null;
  review: string | null;
  notes: string | null;
  created_by: string | null;
  team_id: string | null;
  reviews: any[];
}

interface RepositoryCompany {
  companies: CompanyData;
}

export const AddCompanyToProjectDialog = ({
  projectId,
  teamId,
  isOpen,
  onOpenChange,
  onAddCompany,
}: AddCompanyToProjectDialogProps) => {
  const { user } = useAuth();

  const { data: availableCompanies = [], isLoading } = useQuery({
    queryKey: ["available-team-companies", teamId, projectId, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get companies that are already in the project
      const { data: existingCompanies } = await supabase
        .from("project_companies")
        .select("company_id")
        .eq("project_id", projectId);

      const existingIds = existingCompanies?.map(c => c.company_id) || [];

      let query = supabase
        .from("company_repositories")
        .select(`
          companies (*)
        `)
        .eq("user_id", user.id);

      // Only add the not-in filter if there are existing IDs
      if (existingIds.length > 0) {
        query = query.not('companies.id', 'in', `(${existingIds.join(',')})`);
      }

      const { data: repositoryCompanies } = await query;

      // Get companies shared with the team
      let teamQuery = supabase
        .from("companies")
        .select("*");
      
      if (teamId) {
        teamQuery = teamQuery.eq("team_id", teamId);
      } else {
        teamQuery = teamQuery.is("team_id", null);
      }

      // Only add the not-in filter if there are existing IDs
      if (existingIds.length > 0) {
        teamQuery = teamQuery.not('id', 'in', `(${existingIds.join(',')})`);
      }

      const { data: teamCompanies } = await teamQuery;

      // Transform repository companies
      const repoCompanies = ((repositoryCompanies || []) as unknown as RepositoryCompany[]).map(rc => ({
        id: rc.companies.id,
        name: rc.companies.name,
        industry: rc.companies.industry || undefined,
        salesVolume: rc.companies.sales_volume || undefined,
        growth: rc.companies.growth || undefined,
        website: rc.companies.website || undefined,
        phoneNumber: rc.companies.phone_number || undefined,
        email: rc.companies.email || undefined,
        review: rc.companies.review || undefined,
        notes: rc.companies.notes || undefined,
        createdBy: rc.companies.created_by || "",
        team_id: rc.companies.team_id,
        sharedWith: [],
        reviews: rc.companies.reviews || [],
      }));

      // Transform team companies
      const transformedTeamCompanies = (teamCompanies || []).map(company => ({
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
      }));

      // Remove duplicates by company ID
      const uniqueCompanies = [...repoCompanies, ...transformedTeamCompanies]
        .filter((company, index, self) => 
          index === self.findIndex(c => c.id === company.id)
        );

      return uniqueCompanies;
    },
    enabled: !!user?.id && !!projectId,
  });

  const handleAddCompany = (company: Company) => {
    onAddCompany(company);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Company to Project</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div>Loading companies...</div>
        ) : availableCompanies.length === 0 ? (
          <div className="text-center py-4">
            No available companies found
          </div>
        ) : (
          <CompanyList
            companies={availableCompanies}
            onCompanySelect={handleAddCompany}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};