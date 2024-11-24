import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CompanyActions } from "./CompanyActions";
import { Company } from "@/services/types";

interface CompanyListProps {
  companies: Company[];
  isPrivate?: boolean;
}

export const CompanyList = ({ companies, isPrivate = false }: CompanyListProps) => {
  return (
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
              <TableCell className="font-medium">
                {company.link ? (
                  <a
                    href={company.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {company.name}
                  </a>
                ) : (
                  company.name
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
  );
};