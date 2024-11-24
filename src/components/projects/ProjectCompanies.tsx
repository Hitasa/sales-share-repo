import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CompanyList } from "@/components/company/CompanyList";
import { Company } from "@/services/types";
import { Trash2 } from "lucide-react";

interface ProjectCompaniesProps {
  companies?: Company[];
  isLoading: boolean;
  isAddCompanyDialogOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCompany: (company: Company) => void;
  onRemoveCompany: (companyId: string) => void;
}

export const ProjectCompanies = ({
  companies,
  isLoading,
  isAddCompanyDialogOpen,
  onOpenChange,
  onAddCompany,
  onRemoveCompany,
}: ProjectCompaniesProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Project Companies</h2>
        <Button onClick={() => onOpenChange(true)}>Add Company</Button>
      </div>
      
      {isLoading ? (
        <div>Loading companies...</div>
      ) : companies && companies.length > 0 ? (
        <CompanyList
          companies={companies}
          onCompanySelect={() => {}}
          additionalActions={(company) => (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemoveCompany(company.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        />
      ) : (
        <Card className="p-4">
          <p className="text-center text-muted-foreground">
            No companies added to this project yet.
          </p>
        </Card>
      )}
    </div>
  );
};