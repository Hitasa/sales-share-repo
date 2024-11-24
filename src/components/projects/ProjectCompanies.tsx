import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { CompanyList } from "@/components/company/CompanyList";
import { Company } from "@/services/types";
import { Trash2 } from "lucide-react";

interface ProjectCompaniesProps {
  companies?: Company[];
  availableCompanies?: Company[];
  isLoading: boolean;
  isAddCompanyDialogOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCompany: (company: Company) => void;
  onRemoveCompany: (companyId: string) => void;
}

export const ProjectCompanies = ({
  companies,
  availableCompanies,
  isLoading,
  isAddCompanyDialogOpen,
  onOpenChange,
  onAddCompany,
  onRemoveCompany,
}: ProjectCompaniesProps) => {
  const handleAddCompany = (company: Company) => {
    onAddCompany(company);
    onOpenChange(false); // Close the dialog after adding
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Project Companies</h2>
        <Dialog open={isAddCompanyDialogOpen} onOpenChange={onOpenChange}>
          <DialogTrigger asChild>
            <Button>Add Company</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add Company to Project</DialogTitle>
            </DialogHeader>
            {availableCompanies && (
              <CompanyList
                companies={availableCompanies}
                onCompanySelect={handleAddCompany}
              />
            )}
          </DialogContent>
        </Dialog>
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