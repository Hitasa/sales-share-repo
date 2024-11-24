import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import AddCompanyForm from "@/components/AddCompanyForm";

// Mock data
const initialCompanies = [
  {
    id: 1,
    name: "Acme Corp",
    industry: "Technology",
    salesVolume: "$1.2M",
    growth: "+15%",
  },
  {
    id: 2,
    name: "Beta Industries",
    industry: "Manufacturing",
    salesVolume: "$850K",
    growth: "+8%",
  },
];

const Repositories = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [companies, setCompanies] = useState(initialCompanies);
  const { toast } = useToast();

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCompany = (newCompany: {
    name: string;
    industry: string;
    salesVolume: string;
    growth: string;
  }) => {
    const companyWithId = {
      ...newCompany,
      id: companies.length + 1,
    };
    setCompanies([...companies, companyWithId]);
    toast({
      title: "Company added",
      description: `${newCompany.name} has been added to the repository.`,
    });
  };

  return (
    <div className="container mx-auto py-20 px-4 animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Company Repositories</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
            </DialogHeader>
            <AddCompanyForm onSubmit={handleAddCompany} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search companies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Sales Volume</TableHead>
              <TableHead>Growth</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCompanies.map((company) => (
              <TableRow key={company.id}>
                <TableCell className="font-medium">{company.name}</TableCell>
                <TableCell>{company.industry}</TableCell>
                <TableCell>{company.salesVolume}</TableCell>
                <TableCell className="text-green-600">{company.growth}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Repositories;