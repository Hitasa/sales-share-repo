import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CompanyActions } from "./CompanyActions";
import { CompanyDetailsDialog } from "./CompanyDetailsDialog";
import { CompanyProfile } from "./CompanyProfile";
import { Company } from "@/services/types";
import { ExternalLink } from "lucide-react";

interface CompanyListProps {
  companies: Company[];
  isPrivate?: boolean;
  onCompanySelect?: (company: Company) => void;
}

export const CompanyList = ({ companies, isPrivate = false, onCompanySelect }: CompanyListProps) => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const handleCompanyClick = (company: Company, event: React.MouseEvent) => {
    // If the company has a website URL, open it in a new tab
    if (company.website) {
      window.open(company.website, '_blank');
      event.stopPropagation(); // Prevent dialog from opening
      return;
    }

    // Otherwise, handle the default click behavior
    if (isPrivate && onCompanySelect) {
      onCompanySelect(company);
    } else {
      setSelectedCompany(company);
    }
  };

  if (selectedCompany && isPrivate) {
    return (
      <CompanyProfile 
        company={selectedCompany} 
        onBack={() => setSelectedCompany(null)} 
      />
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell 
                  className={`font-medium cursor-pointer hover:text-blue-600 ${
                    company.website ? 'flex items-center gap-2' : ''
                  }`}
                  onClick={(e) => handleCompanyClick(company, e)}
                >
                  {company.name}
                  {company.website && (
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  )}
                </TableCell>
                <TableCell>
                  <CompanyActions company={company} isPrivate={isPrivate} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedCompany && !isPrivate && (
        <CompanyDetailsDialog
          company={selectedCompany}
          open={!!selectedCompany}
          onOpenChange={(open) => !open && setSelectedCompany(null)}
        />
      )}
    </>
  );
};
