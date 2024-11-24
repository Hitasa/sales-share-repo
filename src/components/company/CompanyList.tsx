import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CompanyActions } from "./CompanyActions";
import { CompanyDetailsDialog } from "./CompanyDetailsDialog";
import { Company } from "@/services/types";

interface CompanyListProps {
  companies: Company[];
  isPrivate?: boolean;
}

export const CompanyList = ({ companies, isPrivate = false }: CompanyListProps) => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

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
                  onClick={() => setSelectedCompany(company)}
                >
                  {company.name}
                </TableCell>
                <TableCell>
                  <CompanyActions company={company} isPrivate={isPrivate} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedCompany && (
        <CompanyDetailsDialog
          company={selectedCompany}
          open={!!selectedCompany}
          onOpenChange={(open) => !open && setSelectedCompany(null)}
        />
      )}
    </>
  );
};