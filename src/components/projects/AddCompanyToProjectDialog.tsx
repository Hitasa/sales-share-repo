import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CompanyList } from "@/components/company/CompanyList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/services/types";

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
  const { data: availableCompanies = [], isLoading } = useQuery({
    queryKey: ["available-team-companies", teamId, projectId],
    queryFn: async () => {
      if (!teamId) return [];

      // Get companies that are shared with the team and not already in the project
      const { data: existingCompanies } = await supabase
        .from("project_companies")
        .select("company_id")
        .eq("project_id", projectId);

      const existingIds = existingCompanies?.map(c => c.company_id) || [];

      // Only add the not.in clause if there are existing companies
      const query = supabase
        .from("companies")
        .select("*")
        .eq("team_id", teamId);

      if (existingIds.length > 0) {
        query.not('id', 'in', `(${existingIds.join(',')})`);
      }

      const { data: companies, error } = await query;

      if (error) throw error;

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
      }));
    },
    enabled: !!teamId && !!projectId,
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
            No available companies in the team repository
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