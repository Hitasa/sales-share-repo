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

export const AddCompanyToProjectDialog = ({
  projectId,
  teamId,
  isOpen,
  onOpenChange,
  onAddCompany,
}: AddCompanyToProjectDialogProps) => {
  const { user } = useAuth();

  const { data: availableCompanies = [], isLoading } = useQuery({
    queryKey: ["available-companies", teamId, projectId, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get companies that are already in the project
      const { data: existingCompanies } = await supabase
        .from("project_companies")
        .select("company_id")
        .eq("project_id", projectId);

      const existingIds = existingCompanies?.map(c => c.company_id) || [];

      // Get user's companies and team companies
      const { data: userCompanies } = await supabase
        .from("companies")
        .select("*")
        .eq("created_by", user.id);

      // Get companies from user's repository
      const { data: repositoryCompanies } = await supabase
        .from("company_repositories")
        .select("companies (*)")
        .eq("user_id", user.id);

      // Get team companies if teamId is provided
      let teamCompanies: any[] = [];
      if (teamId) {
        const { data: teamData } = await supabase
          .from("companies")
          .select("*")
          .eq("team_id", teamId);
        teamCompanies = teamData || [];
      }

      // Combine all companies and remove duplicates
      const allCompanies = [
        ...(userCompanies || []),
        ...(repositoryCompanies?.map(rc => rc.companies) || []),
        ...teamCompanies
      ];

      // Filter out companies that are already in the project
      const uniqueCompanies = allCompanies
        .filter((company, index, self) => 
          index === self.findIndex(c => c.id === company.id) &&
          !existingIds.includes(company.id)
        )
        .map(company => ({
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

      return uniqueCompanies;
    },
    enabled: !!user?.id && !!projectId && isOpen,
  });

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
            onCompanySelect={onAddCompany}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};