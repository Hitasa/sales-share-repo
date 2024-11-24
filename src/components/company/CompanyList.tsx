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

  const handleCompanyClick = (company: Company) => {
    if (isPrivate && onCompanySelect) {
      onCompanySelect(company);
    } else {
      setSelectedCompany(company);
    }
  };

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
                  className="font-medium cursor-pointer hover:text-blue-600"
                  onClick={() => handleCompanyClick(company)}
                >
                  {company.name}
                  {company.website && (
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center ml-2 text-gray-400 hover:text-gray-600"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
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